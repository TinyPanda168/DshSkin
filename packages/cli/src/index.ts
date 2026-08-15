import { lstat, readFile } from 'node:fs/promises'
import { dirname, isAbsolute, relative, resolve } from 'node:path'
import { imageSizeFromFile } from 'image-size/fromFile'
import {
  SKIN_SLOT_CATALOG,
  validateSkinManifest,
  validateSkinRegistry,
  type SkinAssetMimeType,
  type SkinAssetSlot,
  type SkinManifest,
  type SkinValidationIssue,
} from '@dsh-skins/spec'

const MAX_PREVIEW_BYTES = 8 * 1024 * 1024
const MAX_PACKAGE_RASTER_BYTES = 40 * 1024 * 1024
const ASPECT_RATIO_TOLERANCE = 0.06

/** Filesystem validation report for a skin directory or source registry. */
export interface SkinFilesystemReport {
  ok: boolean
  issues: SkinValidationIssue[]
}

async function readJson(path: string): Promise<unknown> {
  return JSON.parse(await readFile(path, 'utf8')) as unknown
}

function resolveInside(root: string, packagePath: string): string | undefined {
  const absolute = resolve(root, packagePath)
  const fromRoot = relative(root, absolute)
  if (fromRoot === '' || fromRoot === '..' || fromRoot.startsWith(`..${process.platform === 'win32' ? '\\' : '/'}`) || isAbsolute(fromRoot)) {
    return undefined
  }
  return absolute
}

async function inspectRaster(
  root: string,
  packagePath: string,
  mimeType: SkinAssetMimeType,
  maxBytes: number,
  issuePath: string,
  expected?: { width: number; height: number },
): Promise<{ issues: SkinValidationIssue[]; bytes: number }> {
  const absolute = resolveInside(root, packagePath)
  if (absolute === undefined) {
    return { issues: [{ path: issuePath, message: 'path escapes the skin directory' }], bytes: 0 }
  }
  let stat
  try {
    stat = await lstat(absolute)
  } catch {
    return { issues: [{ path: issuePath, message: `file does not exist: ${packagePath}` }], bytes: 0 }
  }
  if (stat.isSymbolicLink()) {
    return { issues: [{ path: issuePath, message: 'symbolic links are not allowed in skin packages' }], bytes: 0 }
  }
  if (!stat.isFile()) {
    return { issues: [{ path: issuePath, message: 'asset path must resolve to a regular file' }], bytes: 0 }
  }
  const issues: SkinValidationIssue[] = []
  if (stat.size > maxBytes) issues.push({ path: issuePath, message: `asset exceeds ${maxBytes} bytes` })
  try {
    const dimensions = await imageSizeFromFile(absolute)
    const expectedType = mimeType.slice('image/'.length)
    if (dimensions.type !== expectedType) {
      issues.push({ path: issuePath, message: `declared ${mimeType} but file is ${dimensions.type ?? 'unknown'}` })
    }
    if (expected !== undefined) {
      if (dimensions.width < expected.width || dimensions.height < expected.height) {
        issues.push({
          path: issuePath,
          message: `image is ${dimensions.width}x${dimensions.height}; minimum is ${expected.width}x${expected.height}`,
        })
      }
      const actualRatio = dimensions.width / dimensions.height
      const expectedRatio = expected.width / expected.height
      if (Math.abs(actualRatio - expectedRatio) / expectedRatio > ASPECT_RATIO_TOLERANCE) {
        issues.push({
          path: issuePath,
          message: `image aspect ratio ${actualRatio.toFixed(3)} differs from required ${expectedRatio.toFixed(3)}`,
        })
      }
    }
  } catch (error: unknown) {
    issues.push({ path: issuePath, message: `cannot read raster metadata: ${error instanceof Error ? error.message : String(error)}` })
  }
  return { issues, bytes: stat.size }
}

/** Validate skin.json plus every referenced local raster in one unpacked skin directory. */
export async function validateSkinDirectory(directory: string): Promise<SkinFilesystemReport> {
  const root = resolve(directory)
  const manifestPath = resolve(root, 'skin.json')
  let input: unknown
  try {
    input = await readJson(manifestPath)
  } catch (error: unknown) {
    return { ok: false, issues: [{ path: '/skin.json', message: error instanceof Error ? error.message : String(error) }] }
  }
  const parsed = validateSkinManifest(input)
  if (!parsed.ok) return { ok: false, issues: parsed.issues }

  const issues: SkinValidationIssue[] = []
  let rasterBytes = 0
  for (const [slot, asset] of Object.entries(parsed.value.assets) as [SkinAssetSlot, NonNullable<SkinManifest['assets'][SkinAssetSlot]>][]) {
    const specification = SKIN_SLOT_CATALOG[slot]
    const result = await inspectRaster(
      root,
      asset.path,
      asset.mimeType,
      specification.maxBytes,
      `/assets/${slot}/path`,
      specification.minimumSize,
    )
    issues.push(...result.issues)
    rasterBytes += result.bytes
  }
  for (const [index, preview] of (parsed.value.previews ?? []).entries()) {
    const result = await inspectRaster(
      root,
      preview.path,
      preview.mimeType,
      MAX_PREVIEW_BYTES,
      `/previews/${index}/path`,
    )
    issues.push(...result.issues)
    rasterBytes += result.bytes
  }
  if (rasterBytes > MAX_PACKAGE_RASTER_BYTES) {
    issues.push({ path: '/', message: `package raster total exceeds ${MAX_PACKAGE_RASTER_BYTES} bytes` })
  }
  return { ok: issues.length === 0, issues }
}

/** Validate a source registry, every referenced manifest, and row identity consistency. */
export async function validateRegistryFile(path: string): Promise<SkinFilesystemReport> {
  const registryPath = resolve(path)
  let input: unknown
  try {
    input = await readJson(registryPath)
  } catch (error: unknown) {
    return { ok: false, issues: [{ path: '/', message: error instanceof Error ? error.message : String(error) }] }
  }
  const parsed = validateSkinRegistry(input)
  if (!parsed.ok) return { ok: false, issues: parsed.issues }

  const issues: SkinValidationIssue[] = []
  for (const [index, entry] of parsed.value.skins.entries()) {
    const manifestPath = resolve(dirname(registryPath), entry.manifest)
    let manifestInput: unknown
    try {
      manifestInput = await readJson(manifestPath)
    } catch (error: unknown) {
      issues.push({ path: `/skins/${index}/manifest`, message: error instanceof Error ? error.message : String(error) })
      continue
    }
    const manifest = validateSkinManifest(manifestInput)
    if (!manifest.ok) {
      issues.push(...manifest.issues.map(issue => ({
        path: `/skins/${index}/manifest${issue.path}`,
        message: issue.message,
      })))
      continue
    }
    if (manifest.value.id !== entry.id) {
      issues.push({ path: `/skins/${index}/id`, message: `registry id does not match manifest id "${manifest.value.id}"` })
    }
    if (manifest.value.version !== entry.version) {
      issues.push({ path: `/skins/${index}/version`, message: `registry version does not match manifest version "${manifest.value.version}"` })
    }
    const directoryReport = await validateSkinDirectory(dirname(manifestPath))
    issues.push(...directoryReport.issues.map(issue => ({
      path: `/skins/${index}${issue.path}`,
      message: issue.message,
    })))
  }
  return { ok: issues.length === 0, issues }
}

/** Render a deterministic human-readable validation report. */
export function formatReport(label: string, report: SkinFilesystemReport): string {
  if (report.ok) return `OK ${label}`
  return [`INVALID ${label}`, ...report.issues.map(issue => `- ${issue.path}: ${issue.message}`)].join('\n')
}
