// @vitest-environment jsdom

import { describe, expect, it } from 'vitest'
import type { SkinManifest } from '@dsh-skins/spec'
import { DshWebSkinAdapter } from '../src/index.ts'

function manifest(id: string, accent: string): SkinManifest {
  const palette = {
    'color.background.base': '#F5F8F7',
    'color.background.surface': '#FFFFFF',
    'color.background.sidebar': '#E5F0ED',
    'color.text.primary': '#17201E',
    'color.text.secondary': '#596662',
    'color.border': '#C1CECA',
    'color.accent': accent,
    'color.accent.contrast': '#FFFFFF',
    'color.state.success': '#16834F',
    'color.state.warning': '#966B00',
    'color.state.error': '#C7372F',
    'radius.control': 9,
    'radius.panel': 16,
  }
  return {
    schemaVersion: 1,
    id,
    name: id,
    version: '0.1.0',
    summary: 'Adapter fixture.',
    author: { id: 'tester', name: 'Tester' },
    license: { spdx: 'MIT', commercialUse: true },
    contentRating: 'general',
    compatibility: {
      requiredCapabilities: ['tokens.semantic.v1'],
      optionalCapabilities: ['assets.character.states.v1'],
    },
    palettes: { light: { ...palette }, dark: { ...palette, 'color.background.base': '#111816' } },
    assets: {
      'character.idle': { path: 'assets/idle.webp', mimeType: 'image/webp', fit: 'contain' },
    },
    provenance: { aiGenerated: false, rightsStatement: 'Original fixture artwork owned by Tester.' },
  }
}

describe('DshWebSkinAdapter', () => {
  it('maps semantic tokens and restores the previous client values', () => {
    document.body.style.setProperty('--dsw-alias-brand-primary', '#123456')
    const adapter = new DshWebSkinAdapter({ document, resolveAssetUrl: asset => `/skin/${asset.path}` })
    adapter.activate(manifest('dsh.skins.first', '#008873'))

    expect(document.body.dataset.dshSkinId).toBe('dsh.skins.first')
    expect(document.body.style.getPropertyValue('--dsw-alias-brand-primary')).toBe('#008873')
    expect(document.body.querySelector('[data-dsh-skin-character]')?.getAttribute('src'))
      .toBe('/skin/assets/idle.webp')

    adapter.dispose()
    expect(document.body.dataset.dshSkinId).toBeUndefined()
    expect(document.body.style.getPropertyValue('--dsw-alias-brand-primary')).toBe('#123456')
    expect(document.body.querySelector('[data-dsh-skin-character]')).toBeNull()
  })

  it('switches palettes and falls absent activity art back to idle', () => {
    const adapter = new DshWebSkinAdapter({ document })
    adapter.activate(manifest('dsh.skins.states', '#008873'), 'dark')
    adapter.setCharacterState('thinking')

    expect(adapter.getSnapshot()).toEqual({
      skinId: 'dsh.skins.states',
      skinVersion: '0.1.0',
      palette: 'dark',
      characterState: 'thinking',
    })
    expect(document.body.style.getPropertyValue('--dsw-alias-bg-base')).toBe('#111816')
    expect(document.body.querySelector<HTMLImageElement>('[data-dsh-skin-character]')?.src)
      .toContain('assets/idle.webp')
    adapter.dispose()
  })

  it('rolls a preview back unless a newer activation replaced it', () => {
    const adapter = new DshWebSkinAdapter({ document })
    adapter.activate(manifest('dsh.skins.base', '#007060'))
    const rollback = adapter.preview(manifest('dsh.skins.preview', '#8060D0'))
    rollback()
    expect(adapter.getSnapshot()?.skinId).toBe('dsh.skins.base')

    const staleRollback = adapter.preview(manifest('dsh.skins.old-preview', '#606060'))
    adapter.activate(manifest('dsh.skins.new', '#1060A0'))
    staleRollback()
    expect(adapter.getSnapshot()?.skinId).toBe('dsh.skins.new')
    adapter.dispose()
  })
})
