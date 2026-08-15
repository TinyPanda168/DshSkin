import { describe, expect, it } from 'vitest'
import {
  negotiateSkin,
  resolveSkinAsset,
  validateSkinManifest,
  validateSkinRegistry,
  type SkinManifest,
} from '../src/index.ts'

const palette = {
  'color.background.base': '#F4F8F7',
  'color.background.surface': '#FFFFFF',
  'color.background.sidebar': '#E4F1EE',
  'color.text.primary': '#14211F',
  'color.text.secondary': '#536763',
  'color.border': '#B7CBC6',
  'color.accent': '#087F6B',
  'color.accent.contrast': '#FFFFFF',
  'color.state.success': '#14804A',
  'color.state.warning': '#9A6700',
  'color.state.error': '#C9372C',
  'radius.control': 10,
  'radius.panel': 18,
} as const

function makeManifest(): SkinManifest {
  return {
    schemaVersion: 1,
    id: 'dsh.skins.test',
    name: 'Test Skin',
    version: '0.1.0',
    summary: 'A complete test fixture.',
    author: { id: 'tester', name: 'Tester' },
    license: { spdx: 'MIT', commercialUse: true },
    contentRating: 'general',
    compatibility: {
      requiredCapabilities: ['tokens.semantic.v1'],
      optionalCapabilities: ['assets.character.states.v1'],
    },
    palettes: { light: { ...palette }, dark: { ...palette } },
    assets: {
      'character.idle': {
        path: 'assets/character-idle.webp',
        mimeType: 'image/webp',
        fit: 'contain',
      },
    },
    provenance: {
      aiGenerated: false,
      rightsStatement: 'Original work owned by the fixture author.',
    },
  }
}

describe('validateSkinManifest', () => {
  it('accepts a complete portable manifest', () => {
    const manifest = makeManifest()
    expect(validateSkinManifest(manifest)).toEqual({ ok: true, value: manifest })
  })

  it('rejects traversal and remote asset paths', () => {
    const manifest = makeManifest()
    manifest.assets['character.idle']!.path = 'assets/../secret.png'
    const result = validateSkinManifest(manifest)
    expect(result.ok).toBe(false)
  })

  it('requires every used asset capability to be declared', () => {
    const manifest = makeManifest()
    manifest.compatibility.optionalCapabilities = []
    const result = validateSkinManifest(manifest)
    expect(result).toEqual({
      ok: false,
      issues: [{
        path: '/assets/character.idle',
        message: 'asset slot requires declared capability "assets.character.states.v1"',
      }],
    })
  })
})

describe('capability negotiation and fallback', () => {
  it('keeps optional presentation unsupported without rejecting core tokens', () => {
    const result = negotiateSkin(makeManifest(), ['tokens.semantic.v1'])
    expect(result).toEqual({
      compatible: true,
      enabledCapabilities: ['tokens.semantic.v1'],
      unsupportedRequiredCapabilities: [],
      skippedOptionalCapabilities: ['assets.character.states.v1'],
    })
  })

  it('falls character states back to idle', () => {
    expect(resolveSkinAsset(makeManifest(), 'character.thinking')?.path)
      .toBe('assets/character-idle.webp')
  })
})

describe('validateSkinRegistry', () => {
  it('rejects duplicate id and version pairs', () => {
    const entry = { id: 'dsh.skins.test', version: '0.1.0', manifest: '../skins/test/skin.json' }
    const result = validateSkinRegistry({ schemaVersion: 1, skins: [entry, entry] })
    expect(result).toEqual({
      ok: false,
      issues: [{ path: '/skins/1', message: 'duplicate registry entry "dsh.skins.test@0.1.0"' }],
    })
  })

  it('rejects traversal inside a registry manifest path', () => {
    const result = validateSkinRegistry({
      schemaVersion: 1,
      skins: [{
        id: 'dsh.skins.test',
        version: '0.1.0',
        manifest: '../skins/../../private/skin.json',
      }],
    })
    expect(result).toEqual({
      ok: false,
      issues: [{ path: '/skins/0/manifest', message: 'must be a traversal-free path under ../skins/' }],
    })
  })
})
