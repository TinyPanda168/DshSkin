import {
  validateSkinManifest,
  type SkinAssetDescriptor,
  type SkinAssetSlot,
  type SkinManifest,
} from '@dsh-skins/spec'
import { strToU8, zipSync } from 'fflate'

/** Read-only package input used by preview, editing, and safe export. */
export interface SkinPackageSource {
  readonly label: string
  readonly manifest: SkinManifest
  resolveAssetUrl(asset: SkinAssetDescriptor, slot: SkinAssetSlot): string
  readFile(path: string): Promise<Uint8Array>
  dispose(): void
}

function parseManifest(input: unknown): SkinManifest {
  const result = validateSkinManifest(input)
  if (!result.ok) {
    throw new TypeError(result.issues.map(issue => `${issue.path} ${issue.message}`).join('\n'))
  }
  return result.value
}

/** Return every runtime raster referenced by a manifest exactly once. */
export function referencedPackagePaths(manifest: SkinManifest): string[] {
  return [...new Set([
    ...Object.values(manifest.assets).flatMap(asset => asset === undefined ? [] : [asset.path]),
    ...(manifest.previews ?? []).map(preview => preview.path),
  ])].sort()
}

/** Load a bundled skin copied into the Studio's static public directory. */
export async function loadBundledSkin(packageUrl: URL, label: string): Promise<SkinPackageSource> {
  const manifestUrl = new URL('skin.json', packageUrl)
  const response = await fetch(manifestUrl)
  if (!response.ok) throw new Error(`无法加载 ${manifestUrl.pathname}：HTTP ${response.status}`)
  const manifest = parseManifest(await response.json())
  return {
    label,
    manifest,
    resolveAssetUrl: asset => new URL(asset.path, packageUrl).href,
    async readFile(path) {
      const fileResponse = await fetch(new URL(path, packageUrl))
      if (!fileResponse.ok) throw new Error(`无法读取 ${path}：HTTP ${fileResponse.status}`)
      return new Uint8Array(await fileResponse.arrayBuffer())
    },
    dispose() {},
  }
}

function normalizedUploadPath(file: File): string {
  const path = file.webkitRelativePath || file.name
  if (path.includes('\\')) throw new Error(`文件路径不能包含反斜杠：${path}`)
  const segments = path.split('/')
  if (segments.some(segment => segment === '' || segment === '.' || segment === '..')) {
    throw new Error(`文件路径不安全：${path}`)
  }
  return path
}

/** Parse one browser directory selection as a self-contained skin package. */
export async function loadUploadedSkin(fileList: FileList | readonly File[]): Promise<SkinPackageSource> {
  const uploads = [...fileList].map(file => ({ file, path: normalizedUploadPath(file) }))
  const manifests = uploads.filter(upload => upload.path === 'skin.json' || upload.path.endsWith('/skin.json'))
  if (manifests.length !== 1) throw new Error(`目录必须恰好包含一个 skin.json，当前找到 ${manifests.length} 个`)
  const manifestUpload = manifests[0]
  if (manifestUpload === undefined) throw new Error('目录缺少 skin.json')
  const rootPrefix = manifestUpload.path.slice(0, -'skin.json'.length)
  const files = new Map<string, File>()
  for (const upload of uploads) {
    if (!upload.path.startsWith(rootPrefix)) continue
    const relativePath = upload.path.slice(rootPrefix.length)
    if (relativePath !== '') files.set(relativePath, upload.file)
  }

  let input: unknown
  try {
    input = JSON.parse(await manifestUpload.file.text()) as unknown
  } catch (error: unknown) {
    throw new Error(`skin.json 不是有效 JSON：${error instanceof Error ? error.message : String(error)}`)
  }
  const manifest = parseManifest(input)
  for (const path of referencedPackagePaths(manifest)) {
    if (!files.has(path)) throw new Error(`皮肤引用了未上传的文件：${path}`)
  }

  const objectUrls = new Map<string, string>()
  const assetUrl = (path: string): string => {
    const file = files.get(path)
    if (file === undefined) throw new Error(`皮肤包缺少文件：${path}`)
    const existing = objectUrls.get(path)
    if (existing !== undefined) return existing
    const created = URL.createObjectURL(file)
    objectUrls.set(path, created)
    return created
  }

  return {
    label: manifestUpload.file.webkitRelativePath.split('/').at(-2) ?? manifest.id,
    manifest,
    resolveAssetUrl: asset => assetUrl(asset.path),
    async readFile(path) {
      const file = files.get(path)
      if (file === undefined) throw new Error(`皮肤包缺少文件：${path}`)
      return new Uint8Array(await file.arrayBuffer())
    },
    dispose() {
      for (const url of objectUrls.values()) URL.revokeObjectURL(url)
      objectUrls.clear()
    },
  }
}

/** Build a deterministic executable-free .dshskin ZIP from the current draft. */
export async function exportSkinPackage(
  manifest: SkinManifest,
  readFile: (path: string) => Promise<Uint8Array>,
): Promise<Uint8Array> {
  const parsed = parseManifest(manifest)
  const files: Record<string, Uint8Array> = {
    'skin.json': strToU8(`${JSON.stringify(parsed, null, 2)}\n`),
  }
  for (const path of referencedPackagePaths(parsed)) files[path] = await readFile(path)
  return zipSync(files, { level: 6 })
}

/** Save bytes through a browser download without retaining an object URL. */
export function downloadSkinPackage(bytes: Uint8Array, filename: string): void {
  const copy = new Uint8Array(bytes.byteLength)
  copy.set(bytes)
  const url = URL.createObjectURL(new Blob([copy], { type: 'application/zip' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
