import {
  negotiateSkin,
  resolveSkinAsset,
  validateSkinManifest,
  type SkinAssetDescriptor,
  type SkinAssetSlot,
  type SkinCapability,
  type SkinManifest,
  type SkinPaletteMode,
  type SkinPaletteTokens,
} from '@dsh-skins/spec'

/** Character states a client can project from agent activity. */
export type SkinCharacterState = 'idle' | 'thinking' | 'tool' | 'success' | 'error'

/** Capabilities implemented by the reference DSH browser adapter. */
export const DSH_WEB_CAPABILITIES: readonly SkinCapability[] = Object.freeze([
  'tokens.semantic.v1',
  'assets.surface.v1',
  'assets.identity.v1',
  'assets.character.states.v1',
])

/** Host-owned dependencies for resolving package assets into safe browser URLs. */
export interface DshWebAdapterOptions {
  document?: Document
  root?: HTMLElement
  resolveAssetUrl?: (asset: SkinAssetDescriptor, slot: SkinAssetSlot) => string
}

/** Observable adapter state useful to settings and preview UIs. */
export interface DshWebSkinSnapshot {
  skinId: string
  skinVersion: string
  palette: SkinPaletteMode
  characterState: SkinCharacterState
}

const TOKEN_TO_DSH_CSS: Readonly<Record<keyof SkinPaletteTokens, string>> = Object.freeze({
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

const CHARACTER_SLOT: Readonly<Record<SkinCharacterState, SkinAssetSlot>> = Object.freeze({
  idle: 'character.idle',
  thinking: 'character.thinking',
  tool: 'character.tool',
  success: 'character.success',
  error: 'character.error',
})

const ASSET_SLOTS: readonly SkinAssetSlot[] = Object.freeze([
  'app.background',
  'sidebar.background',
  'home.hero',
  'composer.decoration',
  'brand.logo',
  'agent.avatar',
  'character.idle',
  'character.thinking',
  'character.tool',
  'character.success',
  'character.error',
])

function canonicalTokenProperty(token: keyof SkinPaletteTokens): string {
  return `--dsh-skin-${token.replaceAll('.', '-')}`
}

function assetProperty(slot: SkinAssetSlot): string {
  return `--dsh-skin-asset-${slot.replaceAll('.', '-')}`
}

function cssUrl(url: string): string {
  return `url(${JSON.stringify(url)})`
}

interface ActiveSkin {
  manifest: SkinManifest
  palette: SkinPaletteMode
  characterState: SkinCharacterState
}

interface OriginalStyle {
  value: string
  priority: string
}

/**
 * Apply portable skins to the official DSH Web UI and wrappers that render it.
 * The adapter consumes data only: it never evaluates package code or injects CSS text.
 */
export class DshWebSkinAdapter {
  private readonly document: Document
  private readonly root: HTMLElement
  private readonly resolveAssetUrl: NonNullable<DshWebAdapterOptions['resolveAssetUrl']>
  private readonly originalStyles = new Map<string, OriginalStyle>()
  private readonly originalAttributes: { skinId: string | null; palette: string | null }
  private readonly listeners = new Set<() => void>()
  private active: ActiveSkin | undefined
  private characterElement: HTMLImageElement | undefined
  private revision = 0

  /** Construct an adapter for one document and presentation root. */
  constructor(options: DshWebAdapterOptions = {}) {
    const targetDocument = options.document ?? globalThis.document
    if (targetDocument === undefined) throw new Error('DshWebSkinAdapter requires a browser document')
    this.document = targetDocument
    this.root = options.root ?? targetDocument.body
    this.resolveAssetUrl = options.resolveAssetUrl ?? (asset => asset.path)
    this.originalAttributes = {
      skinId: this.root.getAttribute('data-dsh-skin-id'),
      palette: this.root.getAttribute('data-dsh-skin-palette'),
    }
  }

  /** Subscribe to activation, palette, character-state, and disposal changes. */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }

  /** Read the current immutable adapter state. */
  getSnapshot(): DshWebSkinSnapshot | undefined {
    if (this.active === undefined) return undefined
    return Object.freeze({
      skinId: this.active.manifest.id,
      skinVersion: this.active.manifest.version,
      palette: this.active.palette,
      characterState: this.active.characterState,
    })
  }

  /** Validate and activate one skin, replacing the previous active skin atomically. */
  activate(manifest: SkinManifest, palette: SkinPaletteMode = 'light'): void {
    const validation = validateSkinManifest(manifest)
    if (!validation.ok) {
      throw new TypeError(`invalid skin manifest: ${validation.issues.map(issue => `${issue.path} ${issue.message}`).join('; ')}`)
    }
    const negotiation = negotiateSkin(validation.value, DSH_WEB_CAPABILITIES)
    if (!negotiation.compatible) {
      throw new Error(`unsupported required skin capabilities: ${negotiation.unsupportedRequiredCapabilities.join(', ')}`)
    }
    this.active = { manifest: validation.value, palette, characterState: 'idle' }
    this.render()
  }

  /** Temporarily activate a skin and return a rollback that preserves any newer activation. */
  preview(manifest: SkinManifest, palette: SkinPaletteMode = 'light'): () => void {
    const previous = this.active
    this.activate(manifest, palette)
    const previewRevision = this.revision
    return () => {
      if (this.revision !== previewRevision) return
      if (previous === undefined) this.dispose()
      else {
        this.active = previous
        this.render()
      }
    }
  }

  /** Switch the active skin's complete light or dark palette. */
  setPalette(palette: SkinPaletteMode): void {
    if (this.active === undefined || this.active.palette === palette) return
    this.active = { ...this.active, palette }
    this.render()
  }

  /** Project an agent activity state, falling back to the skin's idle character asset. */
  setCharacterState(characterState: SkinCharacterState): void {
    if (this.active === undefined || this.active.characterState === characterState) return
    this.active = { ...this.active, characterState }
    this.renderCharacter()
    this.publish()
  }

  /** Remove the active skin and restore every inline value owned before activation. */
  dispose(): void {
    if (this.active === undefined && this.originalStyles.size === 0) return
    this.active = undefined
    this.characterElement?.remove()
    this.characterElement = undefined
    for (const [property, original] of this.originalStyles) {
      if (original.value === '') this.root.style.removeProperty(property)
      else this.root.style.setProperty(property, original.value, original.priority)
    }
    this.originalStyles.clear()
    this.restoreAttribute('data-dsh-skin-id', this.originalAttributes.skinId)
    this.restoreAttribute('data-dsh-skin-palette', this.originalAttributes.palette)
    this.publish()
  }

  private render(): void {
    const active = this.active
    if (active === undefined) return
    const tokens = active.manifest.palettes[active.palette]
    this.root.setAttribute('data-dsh-skin-id', active.manifest.id)
    this.root.setAttribute('data-dsh-skin-palette', active.palette)
    for (const [token, value] of Object.entries(tokens) as [keyof SkinPaletteTokens, string | number][]) {
      this.setStyle(canonicalTokenProperty(token), typeof value === 'number' ? `${value}px` : value)
      this.setStyle(TOKEN_TO_DSH_CSS[token], typeof value === 'number' ? `${value}px` : value)
    }
    for (const slot of ASSET_SLOTS) {
      const asset = resolveSkinAsset(active.manifest, slot)
      this.setStyle(assetProperty(slot), asset === undefined ? '' : cssUrl(this.resolveAssetUrl(asset, slot)))
    }
    this.renderBackground()
    this.renderCharacter()
    this.publish()
  }

  private renderBackground(): void {
    const active = this.active
    if (active === undefined) return
    const asset = resolveSkinAsset(active.manifest, 'app.background')
    if (asset === undefined) {
      this.setStyle('background-image', '')
      this.setStyle('background-position', '')
      this.setStyle('background-size', '')
      this.setStyle('background-repeat', '')
      return
    }
    const focalPoint = asset.focalPoint ?? { x: 0.5, y: 0.5 }
    this.setStyle('background-image', cssUrl(this.resolveAssetUrl(asset, 'app.background')))
    this.setStyle('background-position', `${focalPoint.x * 100}% ${focalPoint.y * 100}%`)
    this.setStyle('background-size', asset.fit)
    this.setStyle('background-repeat', 'no-repeat')
  }

  private renderCharacter(): void {
    const active = this.active
    if (active === undefined) return
    const slot = CHARACTER_SLOT[active.characterState]
    const asset = resolveSkinAsset(active.manifest, slot)
    if (asset === undefined) {
      this.characterElement?.remove()
      this.characterElement = undefined
      return
    }
    const image = this.characterElement ?? this.document.createElement('img')
    image.dataset.dshSkinCharacter = ''
    image.alt = ''
    image.setAttribute('aria-hidden', 'true')
    image.style.position = 'fixed'
    image.style.right = '20px'
    image.style.bottom = '20px'
    image.style.width = 'min(28vw, 360px)'
    image.style.height = 'auto'
    image.style.maxHeight = '60vh'
    image.style.objectFit = asset.fit
    image.style.pointerEvents = 'none'
    image.style.zIndex = '2147483000'
    image.src = this.resolveAssetUrl(asset, slot)
    image.dataset.dshSkinCharacterState = active.characterState
    if (this.characterElement === undefined) this.root.append(image)
    this.characterElement = image
  }

  private setStyle(property: string, value: string): void {
    if (!this.originalStyles.has(property)) {
      this.originalStyles.set(property, {
        value: this.root.style.getPropertyValue(property),
        priority: this.root.style.getPropertyPriority(property),
      })
    }
    if (value === '') this.root.style.removeProperty(property)
    else this.root.style.setProperty(property, value)
  }

  private restoreAttribute(name: string, value: string | null): void {
    if (value === null) this.root.removeAttribute(name)
    else this.root.setAttribute(name, value)
  }

  private publish(): void {
    this.revision += 1
    for (const listener of this.listeners) listener()
  }
}
