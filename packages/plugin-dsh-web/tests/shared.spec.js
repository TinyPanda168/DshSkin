import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'
import {
  resolveCharacterAssetPath,
  resolveCharacterAssetUrl,
  toDshThemeOverrides,
  validateSettingsMutation,
} from '../src/shared.js'

const manifestUrl = new URL('../../../skins/blue-whale-navigator/skin.json', import.meta.url)
const manifest = JSON.parse(await readFile(manifestUrl, 'utf8'))

describe('DSH Web plugin skin mapping', () => {
  it('keeps complete light and dark values in one DSH theme layer', () => {
    const overrides = toDshThemeOverrides(manifest)
    expect(overrides['--dsw-alias-bg-base']).toEqual({
      light: '#EAF4FC',
      dark: '#061423',
    })
    expect(overrides['--dsw-alias-brand-primary']).toEqual({
      light: '#047EAA',
      dark: '#55D7F5',
    })
    expect(overrides['--dsh-skin-radius-panel']).toEqual({
      light: '18px',
      dark: '18px',
    })
  })

  it('resolves every validation state to the same-origin Host asset route', () => {
    expect(resolveCharacterAssetUrl(manifest, 'tool'))
      .toBe('/dsh-skins/assets/blue-whale-navigator/character-tool.png')
    expect(resolveCharacterAssetUrl(manifest, 'error'))
      .toBe('/dsh-skins/assets/blue-whale-navigator/character-error.png')
  })

  it('falls back to idle when a character state is absent', () => {
    const minimal = {
      assets: {
        'character.idle': { path: 'assets/idle.png' },
      },
    }
    expect(resolveCharacterAssetPath(minimal, 'success')).toBe('assets/idle.png')
  })

  it('accepts only the owned scalar settings fields', () => {
    expect(validateSettingsMutation({ field: 'enabled', value: false }))
      .toEqual({ field: 'enabled', value: false })
    expect(validateSettingsMutation({ field: 'characterState', value: 'tool' }))
      .toEqual({ field: 'characterState', value: 'tool' })
    expect(() => validateSettingsMutation({ field: 'characterState', value: 'hacked' }))
      .toThrow('unsupported')
    expect(() => validateSettingsMutation({ field: 'arbitrary', value: true }))
      .toThrow('unsupported settings field')
  })
})
