import { cp, mkdir, rm } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const repositoryRoot = resolve(packageRoot, '../..')
const dist = resolve(packageRoot, 'dist')
const pluginId = '@dsh-skins/plugin-dsh-web'

await rm(dist, { force: true, recursive: true })
await mkdir(dist, { recursive: true })

await build({
  entryPoints: [resolve(packageRoot, 'src/index.js')],
  outfile: resolve(dist, 'index.js'),
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node22',
  sourcemap: true,
  legalComments: 'none',
  external: ['@deepseek-ai/*'],
})

await build({
  entryPoints: [resolve(packageRoot, 'src/client/index.jsx')],
  outfile: resolve(dist, 'client.js'),
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  target: 'es2022',
  jsx: 'automatic',
  sourcemap: true,
  legalComments: 'none',
  external: [
    'react',
    'react/jsx-runtime',
    '@deepseek-ai/dsh-client-runtime/client',
  ],
  banner: {
    js: `window.__ModuleLoader__.load({ id: ${JSON.stringify(pluginId)}, factory: (require) => { var module = { exports: {} }; var exports = module.exports;`,
  },
  footer: {
    js: 'return module.exports; } });',
  },
})

await cp(
  resolve(repositoryRoot, 'skins/blue-whale-navigator'),
  resolve(dist, 'skins/blue-whale-navigator'),
  { recursive: true },
)
