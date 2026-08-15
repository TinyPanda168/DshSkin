import type { SkinAssetFit, SkinAssetSlot, SkinCapability } from './types.js'

/** Generator and validator requirements for one portable visual location. */
export interface SkinSlotSpecification {
  capability: SkinCapability
  aspectRatio: { width: number; height: number }
  minimumSize: { width: number; height: number }
  maxBytes: number
  defaultFit: SkinAssetFit
  fallback?: SkinAssetSlot
}

/** Canonical design locations used by creator tools and client adapters. */
export const SKIN_SLOT_CATALOG: Readonly<Record<SkinAssetSlot, SkinSlotSpecification>> = Object.freeze({
  'app.background': {
    capability: 'assets.surface.v1',
    aspectRatio: { width: 16, height: 10 },
    minimumSize: { width: 1920, height: 1200 },
    maxBytes: 8 * 1024 * 1024,
    defaultFit: 'cover',
  },
  'sidebar.background': {
    capability: 'assets.surface.v1',
    aspectRatio: { width: 9, height: 16 },
    minimumSize: { width: 720, height: 1280 },
    maxBytes: 5 * 1024 * 1024,
    defaultFit: 'cover',
  },
  'home.hero': {
    capability: 'assets.surface.v1',
    aspectRatio: { width: 16, height: 9 },
    minimumSize: { width: 1600, height: 900 },
    maxBytes: 6 * 1024 * 1024,
    defaultFit: 'contain',
  },
  'composer.decoration': {
    capability: 'assets.surface.v1',
    aspectRatio: { width: 5, height: 1 },
    minimumSize: { width: 1600, height: 320 },
    maxBytes: 4 * 1024 * 1024,
    defaultFit: 'contain',
  },
  'brand.logo': {
    capability: 'assets.identity.v1',
    aspectRatio: { width: 10, height: 3 },
    minimumSize: { width: 1000, height: 300 },
    maxBytes: 2 * 1024 * 1024,
    defaultFit: 'contain',
  },
  'agent.avatar': {
    capability: 'assets.identity.v1',
    aspectRatio: { width: 1, height: 1 },
    minimumSize: { width: 512, height: 512 },
    maxBytes: 2 * 1024 * 1024,
    defaultFit: 'contain',
  },
  'character.idle': {
    capability: 'assets.character.states.v1',
    aspectRatio: { width: 1, height: 1 },
    minimumSize: { width: 1024, height: 1024 },
    maxBytes: 5 * 1024 * 1024,
    defaultFit: 'contain',
  },
  'character.thinking': {
    capability: 'assets.character.states.v1',
    aspectRatio: { width: 1, height: 1 },
    minimumSize: { width: 1024, height: 1024 },
    maxBytes: 5 * 1024 * 1024,
    defaultFit: 'contain',
    fallback: 'character.idle',
  },
  'character.tool': {
    capability: 'assets.character.states.v1',
    aspectRatio: { width: 1, height: 1 },
    minimumSize: { width: 1024, height: 1024 },
    maxBytes: 5 * 1024 * 1024,
    defaultFit: 'contain',
    fallback: 'character.idle',
  },
  'character.success': {
    capability: 'assets.character.states.v1',
    aspectRatio: { width: 1, height: 1 },
    minimumSize: { width: 1024, height: 1024 },
    maxBytes: 5 * 1024 * 1024,
    defaultFit: 'contain',
    fallback: 'character.idle',
  },
  'character.error': {
    capability: 'assets.character.states.v1',
    aspectRatio: { width: 1, height: 1 },
    minimumSize: { width: 1024, height: 1024 },
    maxBytes: 5 * 1024 * 1024,
    defaultFit: 'contain',
    fallback: 'character.idle',
  },
})

/** Resolve the renderer capability responsible for one asset location. */
export function capabilityForSlot(slot: SkinAssetSlot): SkinCapability {
  return SKIN_SLOT_CATALOG[slot].capability
}
