import { Ajv2020, type ErrorObject, type ValidateFunction } from 'ajv/dist/2020.js'
import skinSchema from '../schema/dsh-skin.schema.json' with { type: 'json' }
import registrySchema from '../schema/dsh-skin-registry.schema.json' with { type: 'json' }
import { capabilityForSlot, SKIN_SLOT_CATALOG } from './catalog.js'
import type {
  SkinAssetDescriptor,
  SkinAssetSlot,
  SkinCapability,
  SkinManifest,
  SkinNegotiation,
  SkinRegistry,
  SkinValidationIssue,
  SkinValidationResult,
} from './types.js'

const ajv = new Ajv2020({ allErrors: true, strict: true })
const validateManifestSchema: ValidateFunction = ajv.compile(skinSchema)
const validateRegistrySchema: ValidateFunction = ajv.compile(registrySchema)

function schemaIssues(errors: ErrorObject[] | null | undefined): SkinValidationIssue[] {
  return (errors ?? []).map(error => ({
    path: error.instancePath === '' ? '/' : error.instancePath,
    message: error.message ?? 'is invalid',
  }))
}

/** Return whether a package path is local, normalized, and traversal-free. */
export function isSafePackagePath(path: string, directory: 'assets' | 'previews'): boolean {
  if (!path.startsWith(`${directory}/`) || path.includes('\\') || path.includes(':')) return false
  const segments = path.split('/')
  return segments.every(segment => segment !== '' && segment !== '.' && segment !== '..')
}

function manifestIssues(manifest: SkinManifest): SkinValidationIssue[] {
  const issues: SkinValidationIssue[] = []
  const required = new Set<SkinCapability>(manifest.compatibility.requiredCapabilities)
  const optional = new Set<SkinCapability>(manifest.compatibility.optionalCapabilities)

  for (const capability of required) {
    if (optional.has(capability)) {
      issues.push({
        path: '/compatibility',
        message: `capability "${capability}" cannot be both required and optional`,
      })
    }
  }

  for (const [slot, asset] of Object.entries(manifest.assets) as [SkinAssetSlot, SkinAssetDescriptor][]) {
    const capability = capabilityForSlot(slot)
    if (!required.has(capability) && !optional.has(capability)) {
      issues.push({
        path: `/assets/${slot}`,
        message: `asset slot requires declared capability "${capability}"`,
      })
    }
    if (!isSafePackagePath(asset.path, 'assets')) {
      issues.push({ path: `/assets/${slot}/path`, message: 'must be a traversal-free path under assets/' })
    }
  }

  for (const [index, preview] of (manifest.previews ?? []).entries()) {
    if (!isSafePackagePath(preview.path, 'previews')) {
      issues.push({ path: `/previews/${index}/path`, message: 'must be a traversal-free path under previews/' })
    }
  }
  return issues
}

/** Validate unknown JSON as a complete protocol-version-1 skin manifest. */
export function validateSkinManifest(value: unknown): SkinValidationResult<SkinManifest> {
  if (!validateManifestSchema(value)) {
    return { ok: false, issues: schemaIssues(validateManifestSchema.errors) }
  }
  const manifest = value as SkinManifest
  const issues = manifestIssues(manifest)
  return issues.length === 0 ? { ok: true, value: manifest } : { ok: false, issues }
}

/** Validate a source registry and reject duplicate id/version rows. */
export function validateSkinRegistry(value: unknown): SkinValidationResult<SkinRegistry> {
  if (!validateRegistrySchema(value)) {
    return { ok: false, issues: schemaIssues(validateRegistrySchema.errors) }
  }
  const registry = value as SkinRegistry
  const seen = new Set<string>()
  const issues: SkinValidationIssue[] = []
  for (const [index, entry] of registry.skins.entries()) {
    const manifestSegments = entry.manifest.slice('../skins/'.length).split('/')
    if (!entry.manifest.startsWith('../skins/')
      || manifestSegments.some(segment => segment === '' || segment === '.' || segment === '..')) {
      issues.push({ path: `/skins/${index}/manifest`, message: 'must be a traversal-free path under ../skins/' })
    }
    const key = `${entry.id}@${entry.version}`
    if (seen.has(key)) {
      issues.push({ path: `/skins/${index}`, message: `duplicate registry entry "${key}"` })
    }
    seen.add(key)
  }
  return issues.length === 0 ? { ok: true, value: registry } : { ok: false, issues }
}

/** Compare a skin's requirements with capabilities advertised by a client adapter. */
export function negotiateSkin(
  manifest: SkinManifest,
  supportedCapabilities: Iterable<SkinCapability>,
): SkinNegotiation {
  const supported = new Set(supportedCapabilities)
  const unsupportedRequiredCapabilities = manifest.compatibility.requiredCapabilities
    .filter(capability => !supported.has(capability))
  const enabledCapabilities = [
    ...manifest.compatibility.requiredCapabilities,
    ...manifest.compatibility.optionalCapabilities.filter(capability => supported.has(capability)),
  ]
  const skippedOptionalCapabilities = manifest.compatibility.optionalCapabilities
    .filter(capability => !supported.has(capability))
  return {
    compatible: unsupportedRequiredCapabilities.length === 0,
    enabledCapabilities,
    unsupportedRequiredCapabilities,
    skippedOptionalCapabilities,
  }
}

/** Resolve a requested visual location through its protocol fallback chain. */
export function resolveSkinAsset(
  manifest: SkinManifest,
  slot: SkinAssetSlot,
): SkinAssetDescriptor | undefined {
  let current: SkinAssetSlot | undefined = slot
  const visited = new Set<SkinAssetSlot>()
  while (current !== undefined && !visited.has(current)) {
    visited.add(current)
    const asset = manifest.assets[current]
    if (asset !== undefined) return asset
    current = SKIN_SLOT_CATALOG[current].fallback
  }
  return undefined
}
