/** Stable package identity used by the DSH client module table and theme layer. */
export const PLUGIN_ID = '@dsh-skins/plugin-dsh-web'

/** Host settings namespace owned by the DSH skin plugin. */
export const SETTINGS_NAMESPACE = 'dsh-skins'

/** Original portable skin bundled for the first DSH integration validation. */
export const BUILTIN_SKIN_ID = 'dsh.skins.blue-whale-navigator'

/** Public same-origin route serving the built-in skin's immutable raster assets. */
export const ASSET_ROUTE_PREFIX = '/dsh-skins/assets'

/** Loopback-only plugin endpoint reading and writing the owned Host settings scope. */
export const SETTINGS_ROUTE = '/dsh-skins/settings'

/** Manual validation states plus automatic DSH session projection. */
export const CHARACTER_STATE_OPTIONS = Object.freeze([
  'auto', 'idle', 'thinking', 'tool', 'success', 'error',
])

/** Defaults shared by the Host schema and browser's pre-load rendering state. */
export const DEFAULT_SKIN_SETTINGS = Object.freeze({
  activeSkinId: BUILTIN_SKIN_ID,
  enabled: true,
  characterVisible: true,
  characterState: 'auto',
})

/** Portable semantic tokens mapped to the current official DSH Web aliases. */
export const TOKEN_TO_DSH_CSS = Object.freeze({
  'color.background.base': '--dsw-alias-bg-base',
  'color.background.surface': '--dsw-alias-bg-layer-1',
  'color.background.sidebar': '--dsw-specific-sidebar-fill',
  'color.text.primary': '--dsw-alias-label-primary',
  'color.text.secondary': '--dsw-alias-label-secondary',
  'color.border': '--dsw-alias-border-l1',
  'color.accent': '--dsw-alias-brand-primary',
  'color.accent.contrast': '--dsw-alias-label-primary-inverted',
  'color.state.success': '--dsw-alias-state-success-primary',
  'color.state.warning': '--dsw-alias-state-warn-primary',
  'color.state.error': '--dsw-alias-state-error-primary',
  'radius.control': '--dsh-skin-radius-control',
  'radius.panel': '--dsh-skin-radius-panel',
})

function cssValue(value) {
  return typeof value === 'number' ? `${value}px` : value
}

function portableTokenProperty(token) {
  return `--dsh-skin-${token.replaceAll('.', '-')}`
}

/**
 * Convert a complete portable light/dark palette into one DSH override layer.
 * DSH remains the authority for selecting light, dark, or system preference.
 */
export function toDshThemeOverrides(manifest) {
  const overrides = {}
  for (const [token, dshProperty] of Object.entries(TOKEN_TO_DSH_CSS)) {
    const modes = {
      light: cssValue(manifest.palettes.light[token]),
      dark: cssValue(manifest.palettes.dark[token]),
    }
    overrides[dshProperty] = modes
    overrides[portableTokenProperty(token)] = { ...modes }
  }
  return overrides
}

/** Resolve one character state with the protocol's idle fallback. */
export function resolveCharacterAssetPath(manifest, state) {
  return manifest.assets?.[`character.${state}`]?.path
    ?? manifest.assets?.['character.idle']?.path
}

/** Convert a bundled character asset path into the Host plugin's same-origin URL. */
export function resolveCharacterAssetUrl(manifest, state) {
  const path = resolveCharacterAssetPath(manifest, state)
  if (path === undefined) return undefined
  const filename = path.split('/').at(-1)
  if (filename === undefined || filename === '') return undefined
  return `${ASSET_ROUTE_PREFIX}/blue-whale-navigator/${encodeURIComponent(filename)}`
}

/** Validate the one-field mutation accepted by the plugin's settings endpoint. */
export function validateSettingsMutation(value) {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new TypeError('settings mutation must be an object')
  }
  const { field, value: next } = value
  if (field === 'enabled' || field === 'characterVisible') {
    if (typeof next !== 'boolean') throw new TypeError(`${field} must be boolean`)
    return { field, value: next }
  }
  if (field === 'characterState') {
    if (typeof next !== 'string' || !CHARACTER_STATE_OPTIONS.includes(next)) {
      throw new TypeError('characterState is unsupported')
    }
    return { field, value: next }
  }
  if (field === 'activeSkinId') {
    if (next !== BUILTIN_SKIN_ID) throw new TypeError('activeSkinId is unsupported')
    return { field, value: next }
  }
  throw new TypeError(`unsupported settings field ${String(field)}`)
}
