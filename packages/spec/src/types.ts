/** Version of the manifest and registry JSON schemas. */
export const SKIN_SCHEMA_VERSION = 1 as const

/** Renderer features a client can advertise independently of its UI toolkit. */
export const SKIN_CAPABILITIES = [
  'tokens.semantic.v1',
  'assets.surface.v1',
  'assets.identity.v1',
  'assets.character.states.v1',
] as const

/** One renderer feature understood by protocol version 1. */
export type SkinCapability = typeof SKIN_CAPABILITIES[number]

/** Light and dark palettes are both mandatory so switching never loses contrast. */
export type SkinPaletteMode = 'light' | 'dark'

/** Content ratings accepted by the open registry. */
export type SkinContentRating = 'general' | 'teen'

/** Semantic values that adapters translate into client-specific presentation tokens. */
export interface SkinPaletteTokens {
  'color.background.base': string
  'color.background.surface': string
  'color.background.sidebar': string
  'color.text.primary': string
  'color.text.secondary': string
  'color.border': string
  'color.accent': string
  'color.accent.contrast': string
  'color.state.success': string
  'color.state.warning': string
  'color.state.error': string
  'radius.control': number
  'radius.panel': number
}

/** Image placement modes shared by visual client adapters. */
export type SkinAssetFit = 'cover' | 'contain'

/** Raster formats accepted by protocol version 1. */
export type SkinAssetMimeType = 'image/png' | 'image/webp' | 'image/avif'

/** One self-contained raster asset inside a skin package. */
export interface SkinAssetDescriptor {
  path: string
  mimeType: SkinAssetMimeType
  fit: SkinAssetFit
  focalPoint?: {
    x: number
    y: number
  }
}

/** Stable visual locations that clients can implement selectively. */
export type SkinAssetSlot =
  | 'app.background'
  | 'sidebar.background'
  | 'home.hero'
  | 'composer.decoration'
  | 'brand.logo'
  | 'agent.avatar'
  | 'character.idle'
  | 'character.thinking'
  | 'character.tool'
  | 'character.success'
  | 'character.error'

/** Creator and publisher identity recorded in the portable package. */
export interface SkinAuthor {
  id: string
  name: string
  url?: string
}

/** Usage rights declared by the creator; marketplace pricing is intentionally separate. */
export interface SkinLicense {
  spdx: string
  commercialUse: boolean
  attribution?: string
}

/** Source declaration retained with generated and manually drawn assets. */
export interface SkinProvenance {
  aiGenerated: boolean
  generator?: string
  sourceUrl?: string
  rightsStatement: string
}

/** Optional gallery image kept separate from runtime asset slots. */
export interface SkinPreview {
  path: string
  mimeType: SkinAssetMimeType
  palette: SkinPaletteMode
}

/** Portable, non-executable skin package manifest. */
export interface SkinManifest {
  schemaVersion: typeof SKIN_SCHEMA_VERSION
  id: string
  name: string
  version: string
  summary: string
  homepage?: string
  author: SkinAuthor
  license: SkinLicense
  contentRating: SkinContentRating
  compatibility: {
    requiredCapabilities: SkinCapability[]
    optionalCapabilities: SkinCapability[]
  }
  palettes: Record<SkinPaletteMode, SkinPaletteTokens>
  assets: Partial<Record<SkinAssetSlot, SkinAssetDescriptor>>
  previews?: SkinPreview[]
  provenance: SkinProvenance
}

/** One source-controlled registry row. Distribution indexes add signed package URLs later. */
export interface SkinRegistryEntry {
  id: string
  version: string
  manifest: string
}

/** Source-controlled list of reviewed skin manifests. */
export interface SkinRegistry {
  schemaVersion: typeof SKIN_SCHEMA_VERSION
  skins: SkinRegistryEntry[]
}

/** Machine-readable parse or cross-field validation problem. */
export interface SkinValidationIssue {
  path: string
  message: string
}

/** Validation result that only exposes a typed value after every check passes. */
export type SkinValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; issues: SkinValidationIssue[] }

/** Compatibility result between one skin and one client adapter. */
export interface SkinNegotiation {
  compatible: boolean
  enabledCapabilities: SkinCapability[]
  unsupportedRequiredCapabilities: SkinCapability[]
  skippedOptionalCapabilities: SkinCapability[]
}
