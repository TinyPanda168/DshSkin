// @vitest-environment jsdom

import { strFromU8, unzipSync } from 'fflate'
import { describe, expect, it } from 'vitest'
import type { SkinManifest } from '@dsh-skins/spec'
import {
  exportSkinPackage,
  loadUploadedSkin,
  referencedPackagePaths,
} from '../src/package-source.js'

const palette = {
  'color.background.base': '#F3F8F7',
  'color.background.surface': '#FFFFFF',
  'color.background.sidebar': '#E1F0ED',
  'color.text.primary': '#14231F',
  'color.text.secondary': '#536964',
  'color.border': '#B9CDC8',
  'color.accent': '#087F6B',
  'color.accent.contrast': '#FFFFFF',
  'color.state.success': '#14804A',
  'color.state.warning': '#956B00',
  'color.state.error': '#C9372C',
  'radius.control': 10,
  'radius.panel': 18,
} as const

function manifest(): SkinManifest {
  return {
    schemaVersion: 1,
    id: 'dsh.skins.studio-fixture',
    name: 'Studio Fixture',
    version: '0.1.0',
    summary: 'Studio import and export fixture.',
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
        path: 'assets/character.png',
        mimeType: 'image/png',
        fit: 'contain',
      },
      'character.thinking': {
        path: 'assets/character.png',
        mimeType: 'image/png',
        fit: 'contain',
      },
    },
    provenance: {
      aiGenerated: false,
      rightsStatement: 'Original test fixture.',
    },
  }
}

function upload(path: string, content: BlobPart, type = 'application/octet-stream'): File {
  const file = new File([content], path.split('/').at(-1) ?? path, { type })
  Object.defineProperty(file, 'webkitRelativePath', { value: path })
  return file
}

describe('Studio package sources', () => {
  it('deduplicates referenced runtime paths', () => {
    expect(referencedPackagePaths(manifest())).toEqual(['assets/character.png'])
  })

  it('loads exactly one selected skin directory', async () => {
    const skin = manifest()
    const source = await loadUploadedSkin([
      upload('fixture/skin.json', JSON.stringify(skin), 'application/json'),
      upload('fixture/assets/character.png', new Uint8Array([1, 2, 3]), 'image/png'),
    ])

    expect(source.label).toBe('fixture')
    expect(source.manifest.id).toBe(skin.id)
    await expect(source.readFile('assets/character.png')).resolves.toEqual(new Uint8Array([1, 2, 3]))
    source.dispose()
  })

  it('rejects ambiguous directory selections', async () => {
    const skin = JSON.stringify(manifest())
    await expect(loadUploadedSkin([
      upload('one/skin.json', skin, 'application/json'),
      upload('two/skin.json', skin, 'application/json'),
    ])).rejects.toThrow('恰好包含一个 skin.json')
  })

  it('exports only the manifest and referenced raster files', async () => {
    const skin = manifest()
    const archive = await exportSkinPackage(skin, async path => {
      expect(path).toBe('assets/character.png')
      return new Uint8Array([4, 5, 6])
    })
    const files = unzipSync(archive)

    expect(Object.keys(files).sort()).toEqual(['assets/character.png', 'skin.json'])
    expect(JSON.parse(strFromU8(files['skin.json']!))).toMatchObject({ id: skin.id })
    expect(files['assets/character.png']).toEqual(new Uint8Array([4, 5, 6]))
  })
})
