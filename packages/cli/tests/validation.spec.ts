import { mkdtemp, mkdir, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { validateRegistryFile, validateSkinDirectory } from '../src/index.ts'

function manifest() {
  const palette = {
    'color.background.base': '#F5F8F7',
    'color.background.surface': '#FFFFFF',
    'color.background.sidebar': '#E5F0ED',
    'color.text.primary': '#17201E',
    'color.text.secondary': '#596662',
    'color.border': '#C1CECA',
    'color.accent': '#008873',
    'color.accent.contrast': '#FFFFFF',
    'color.state.success': '#16834F',
    'color.state.warning': '#966B00',
    'color.state.error': '#C7372F',
    'radius.control': 9,
    'radius.panel': 16,
  }
  return {
    schemaVersion: 1,
    id: 'dsh.skins.fixture',
    name: 'Fixture',
    version: '0.1.0',
    summary: 'CLI fixture.',
    author: { id: 'tester', name: 'Tester' },
    license: { spdx: 'MIT', commercialUse: true },
    contentRating: 'general',
    compatibility: { requiredCapabilities: ['tokens.semantic.v1'], optionalCapabilities: [] },
    palettes: { light: palette, dark: palette },
    assets: {},
    provenance: { aiGenerated: false, rightsStatement: 'Original fixture owned by Tester.' },
  }
}

describe('filesystem validation', () => {
  it('accepts a token-only skin directory and matching registry row', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dsh-skins-cli-'))
    const skinDirectory = join(root, 'skins', 'fixture')
    const registryDirectory = join(root, 'registry')
    await mkdir(skinDirectory, { recursive: true })
    await mkdir(registryDirectory, { recursive: true })
    await writeFile(join(skinDirectory, 'skin.json'), JSON.stringify(manifest()))
    await writeFile(join(registryDirectory, 'registry.json'), JSON.stringify({
      schemaVersion: 1,
      skins: [{ id: 'dsh.skins.fixture', version: '0.1.0', manifest: '../skins/fixture/skin.json' }],
    }))

    await expect(validateSkinDirectory(skinDirectory)).resolves.toEqual({ ok: true, issues: [] })
    await expect(validateRegistryFile(join(registryDirectory, 'registry.json')))
      .resolves.toEqual({ ok: true, issues: [] })
  })

  it('reports a referenced asset that is missing', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dsh-skins-cli-'))
    const fixture = manifest()
    fixture.compatibility.optionalCapabilities = ['assets.identity.v1']
    Object.assign(fixture.assets, {
      'agent.avatar': { path: 'assets/avatar.png', mimeType: 'image/png', fit: 'contain' },
    })
    await writeFile(join(root, 'skin.json'), JSON.stringify(fixture))

    const report = await validateSkinDirectory(root)
    expect(report.ok).toBe(false)
    expect(report.issues).toContainEqual({
      path: '/assets/agent.avatar/path',
      message: 'file does not exist: assets/avatar.png',
    })
  })
})
