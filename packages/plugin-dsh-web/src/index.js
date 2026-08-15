/** Host half of the installable DSH Web skin bundle. */

import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import z from '@deepseek-ai/schemastery'
import { settingsNamespace } from '@deepseek-ai/dsh-settings'
import {
  ASSET_ROUTE_PREFIX,
  BUILTIN_SKIN_ID,
  CHARACTER_STATE_OPTIONS,
  SETTINGS_ROUTE,
  SETTINGS_NAMESPACE,
  validateSettingsMutation,
} from './shared.js'

const SKIN_ASSET_DIRECTORY = join(
  dirname(fileURLToPath(import.meta.url)),
  'skins',
  'blue-whale-navigator',
  'assets',
)

const ASSET_FILES = new Set([
  'character-idle.png',
  'character-thinking.png',
  'character-tool.png',
  'character-success.png',
  'character-error.png',
])

const SkinSettingsSchema = z.object({
  activeSkinId: z.const(BUILTIN_SKIN_ID).default(BUILTIN_SKIN_ID),
  enabled: z.boolean().default(true),
  characterVisible: z.boolean().default(true),
  characterState: z.union([...CHARACTER_STATE_OPTIONS]).default('auto'),
})

const SETTINGS_KEY = settingsNamespace(SETTINGS_NAMESPACE)

function finish(res, status, headers = {}) {
  res.writeHead(status, headers)
  res.end()
}

function sendJson(res, status, value) {
  const data = Buffer.from(JSON.stringify(value))
  res.writeHead(status, {
    'cache-control': 'no-store',
    'content-length': String(data.byteLength),
    'content-type': 'application/json; charset=utf-8',
    'x-content-type-options': 'nosniff',
  })
  res.end(data)
}

function isTrustedLoopbackRequest(req) {
  const host = req.headers.host
  if (typeof host !== 'string') return false
  let hostUrl
  try {
    hostUrl = new URL(`http://${host}`)
  } catch {
    return false
  }
  if (!['127.0.0.1', 'localhost', '[::1]'].includes(hostUrl.hostname)) return false
  if (req.headers['sec-fetch-site'] === 'cross-site') return false
  const origin = req.headers.origin
  if (origin === undefined) return true
  try {
    return new URL(origin).host === hostUrl.host
  } catch {
    return false
  }
}

async function readJsonBody(req) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    size += buffer.byteLength
    if (size > 8192) throw new RangeError('settings request exceeds 8192 bytes')
    chunks.push(buffer)
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

/** Serve only the fixed built-in raster allowlist; no caller-controlled filesystem path is joined. */
async function serveAsset(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    finish(res, 405, { allow: 'GET, HEAD' })
    return
  }

  let pathname
  try {
    pathname = decodeURIComponent(new URL(req.url ?? '/', 'http://dsh.local').pathname)
  } catch {
    finish(res, 400)
    return
  }
  const prefix = `${ASSET_ROUTE_PREFIX}/blue-whale-navigator/`
  if (!pathname.startsWith(prefix)) {
    finish(res, 404)
    return
  }
  const filename = pathname.slice(prefix.length)
  if (!ASSET_FILES.has(filename)) {
    finish(res, 404)
    return
  }

  try {
    const data = await readFile(join(SKIN_ASSET_DIRECTORY, filename))
    const headers = {
      'cache-control': 'no-cache',
      'content-length': String(data.byteLength),
      'content-type': 'image/png',
      'x-content-type-options': 'nosniff',
    }
    res.writeHead(200, headers)
    res.end(req.method === 'HEAD' ? undefined : data)
  } catch (error) {
    console.error('[dsh-skins] failed to read bundled asset', error)
    finish(res, 500)
  }
}

function settingsHandler(scope) {
  return async (req, res) => {
    if (!isTrustedLoopbackRequest(req)) {
      finish(res, 403)
      return
    }
    if (req.method === 'GET') {
      sendJson(res, 200, scope.get())
      return
    }
    if (req.method !== 'POST') {
      finish(res, 405, { allow: 'GET, POST' })
      return
    }
    if (req.headers['content-type']?.split(';', 1)[0] !== 'application/json') {
      finish(res, 415)
      return
    }
    try {
      const mutation = validateSettingsMutation(await readJsonBody(req))
      await scope.update({ [mutation.field]: mutation.value })
      sendJson(res, 200, scope.get())
    } catch (error) {
      sendJson(res, error instanceof RangeError ? 413 : 400, {
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }
}

/** Host services required by this Web-only plugin. */
export const inject = ['settings', 'webServer']

/** Register the durable preference section and the fixed built-in asset route. */
export function apply(ctx) {
  const settings = ctx.settings.register(SETTINGS_KEY, SkinSettingsSchema)
  ctx.effect(
    () => ctx.webServer.register({
      kind: 'prefix',
      path: ASSET_ROUTE_PREFIX,
      handler: serveAsset,
    }),
    'dsh-skins: built-in skin assets',
  )
  ctx.effect(
    () => ctx.webServer.register({
      kind: 'exact',
      path: SETTINGS_ROUTE,
      handler: settingsHandler(settings),
    }),
    'dsh-skins: loopback settings route',
  )
}
