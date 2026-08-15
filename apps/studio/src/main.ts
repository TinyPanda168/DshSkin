import type { SkinCharacterState } from '@dsh-skins/adapter-dsh-web'
import {
  SKIN_SLOT_CATALOG,
  capabilityForSlot,
  validateSkinManifest,
  type SkinAssetDescriptor,
  type SkinAssetMimeType,
  type SkinAssetSlot,
  type SkinManifest,
  type SkinPaletteMode,
  type SkinPaletteTokens,
} from '@dsh-skins/spec'
import {
  downloadSkinPackage,
  exportSkinPackage,
  loadBundledSkin,
  loadUploadedSkin,
  type SkinPackageSource,
} from './package-source.js'
import { PreviewFrame } from './preview-frame.js'
import './styles.css'

const CHARACTER_STATES: readonly SkinCharacterState[] = ['idle', 'thinking', 'tool', 'success', 'error']
const COLOR_TOKENS = [
  'color.background.base',
  'color.background.surface',
  'color.background.sidebar',
  'color.text.primary',
  'color.text.secondary',
  'color.border',
  'color.accent',
  'color.accent.contrast',
  'color.state.success',
  'color.state.warning',
  'color.state.error',
] as const satisfies readonly (keyof SkinPaletteTokens)[]
const RADIUS_TOKENS = ['radius.control', 'radius.panel'] as const satisfies readonly (keyof SkinPaletteTokens)[]
const MIME_EXTENSION: Readonly<Record<SkinAssetMimeType, string>> = {
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
}

const app = document.querySelector<HTMLElement>('#app')
if (app === null) throw new Error('缺少 #app 容器')
const appRoot: HTMLElement = app
appRoot.innerHTML = `
  <div class="studio-shell">
    <header class="studio-header">
      <div class="studio-brand">
        <span class="studio-mark" aria-hidden="true">DS</span>
        <span><strong>DshSkin Studio</strong><small>安全的跨客户端皮肤预览器</small></span>
      </div>
      <div class="header-actions">
        <button type="button" class="secondary" data-action="reload-demo">重载鲸鱼娘</button>
        <button type="button" class="secondary" data-action="import">导入皮肤目录</button>
        <button type="button" class="primary" data-action="export">导出 .dshskin</button>
        <input class="visually-hidden" type="file" data-upload multiple webkitdirectory>
      </div>
    </header>
    <div class="studio-body">
      <aside class="editor-panel">
        <div class="source-line"><span data-source>正在加载…</span><span class="status-dot" data-status-dot></span></div>
        <div data-editor></div>
      </aside>
      <main class="preview-panel">
        <div class="preview-toolbar">
          <div class="segmented" data-palette></div>
          <div class="segmented state-switcher" data-states></div>
          <span class="validation-status" data-validation>正在校验</span>
        </div>
        <div class="device-frame"><iframe title="DSH Web 皮肤实时预览" data-preview></iframe></div>
      </main>
    </div>
    <div class="toast" role="status" aria-live="polite" data-toast></div>
  </div>`

const editor = requiredElement<HTMLElement>('[data-editor]')
const sourceLabel = requiredElement<HTMLElement>('[data-source]')
const validationLabel = requiredElement<HTMLElement>('[data-validation]')
const statusDot = requiredElement<HTMLElement>('[data-status-dot]')
const toast = requiredElement<HTMLElement>('[data-toast]')
const upload = requiredElement<HTMLInputElement>('[data-upload]')
const previewFrame = new PreviewFrame(requiredElement<HTMLIFrameElement>('[data-preview]'))

let source: SkinPackageSource | undefined
let manifest: SkinManifest | undefined
let palette: SkinPaletteMode = 'light'
let characterState: SkinCharacterState = 'idle'
let toastTimer: number | undefined
const overrides = new Map<string, { file: File; url: string }>()

function requiredElement<T extends Element>(selector: string): T {
  const element = appRoot.querySelector<T>(selector)
  if (element === null) throw new Error(`缺少界面元素 ${selector}`)
  return element
}

function element<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string): HTMLElementTagNameMap[K] {
  const created = document.createElement(tag)
  if (className !== undefined) created.className = className
  return created
}

function showToast(message: string, tone: 'ok' | 'error' = 'ok'): void {
  toast.textContent = message
  toast.dataset.tone = tone
  toast.dataset.visible = ''
  if (toastTimer !== undefined) window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => delete toast.dataset.visible, 3200)
}

function clearOverrides(): void {
  for (const override of overrides.values()) URL.revokeObjectURL(override.url)
  overrides.clear()
}

function cloneManifest(value: SkinManifest): SkinManifest {
  return structuredClone(value)
}

function resolveDraftAsset(asset: SkinAssetDescriptor, slot: SkinAssetSlot): string {
  const override = overrides.get(asset.path)
  if (override !== undefined) return override.url
  if (source === undefined) throw new Error('皮肤来源尚未加载')
  return source.resolveAssetUrl(asset, slot)
}

async function readDraftFile(path: string): Promise<Uint8Array> {
  const override = overrides.get(path)
  if (override !== undefined) return new Uint8Array(await override.file.arrayBuffer())
  if (source === undefined) throw new Error('皮肤来源尚未加载')
  return source.readFile(path)
}

function refreshPreview(): void {
  if (manifest === undefined) return
  const validation = validateSkinManifest(manifest)
  if (!validation.ok) {
    statusDot.dataset.state = 'error'
    validationLabel.dataset.state = 'error'
    validationLabel.textContent = `${validation.issues.length} 个清单问题`
    validationLabel.title = validation.issues.map(issue => `${issue.path}: ${issue.message}`).join('\n')
    return
  }
  statusDot.dataset.state = 'ok'
  validationLabel.dataset.state = 'ok'
  validationLabel.textContent = '协议校验通过'
  validationLabel.title = '当前 skin.json 通过协议级校验；导出后仍应运行 CLI 文件校验。'
  previewFrame.render(validation.value, palette, characterState, resolveDraftAsset)
}

function renderSwitchers(): void {
  const paletteGroup = requiredElement<HTMLElement>('[data-palette]')
  paletteGroup.replaceChildren(...(['light', 'dark'] as const).map((mode) => {
    const button = element('button')
    button.type = 'button'
    button.textContent = mode === 'light' ? '亮色' : '暗色'
    button.toggleAttribute('data-active', palette === mode)
    button.addEventListener('click', () => {
      palette = mode
      renderSwitchers()
      refreshPreview()
    })
    return button
  }))

  const stateGroup = requiredElement<HTMLElement>('[data-states]')
  stateGroup.replaceChildren(...CHARACTER_STATES.map((state) => {
    const button = element('button')
    button.type = 'button'
    button.textContent = state
    button.toggleAttribute('data-active', characterState === state)
    button.addEventListener('click', () => {
      characterState = state
      renderSwitchers()
      refreshPreview()
    })
    return button
  }))
}

function field(labelText: string, value: string, update: (value: string) => void, options: { multiline?: boolean; readonly?: boolean } = {}): HTMLElement {
  const label = element('label', 'field')
  const title = element('span')
  title.textContent = labelText
  const input = options.multiline ? element('textarea') : element('input')
  input.value = value
  input.readOnly = options.readonly ?? false
  input.addEventListener('input', () => {
    update(input.value)
    refreshPreview()
  })
  label.append(title, input)
  return label
}

function section(titleText: string, description: string): { root: HTMLElement; content: HTMLElement } {
  const root = element('section', 'editor-section')
  const heading = element('div', 'section-heading')
  const title = element('h2')
  title.textContent = titleText
  const copy = element('p')
  copy.textContent = description
  heading.append(title, copy)
  const content = element('div', 'section-content')
  root.append(heading, content)
  return { root, content }
}

function colorControl(token: typeof COLOR_TOKENS[number]): HTMLElement {
  if (manifest === undefined) throw new Error('皮肤尚未加载')
  const row = element('label', 'color-field')
  const swatch = element('input')
  swatch.type = 'color'
  swatch.value = manifest.palettes[palette][token]
  const text = element('input')
  text.value = manifest.palettes[palette][token]
  const name = element('span')
  name.textContent = token.replace('color.', '')
  const update = (value: string): void => {
    if (manifest === undefined) return
    manifest.palettes[palette][token] = value
    swatch.value = value
    text.value = value
    refreshPreview()
  }
  swatch.addEventListener('input', () => update(swatch.value.toUpperCase()))
  text.addEventListener('input', () => update(text.value))
  row.append(swatch, name, text)
  return row
}

async function inspectAsset(file: File, slot: SkinAssetSlot): Promise<void> {
  if (!(file.type in MIME_EXTENSION)) throw new Error('只接受 PNG、WebP 或 AVIF 栅格图片')
  const spec = SKIN_SLOT_CATALOG[slot]
  if (file.size > spec.maxBytes) throw new Error(`${slot} 超过 ${(spec.maxBytes / 1024 / 1024).toFixed(0)} MB`)
  const bitmap = await createImageBitmap(file)
  try {
    if (bitmap.width < spec.minimumSize.width || bitmap.height < spec.minimumSize.height) {
      throw new Error(`${slot} 至少需要 ${spec.minimumSize.width}×${spec.minimumSize.height}，当前为 ${bitmap.width}×${bitmap.height}`)
    }
    const actual = bitmap.width / bitmap.height
    const expected = spec.aspectRatio.width / spec.aspectRatio.height
    if (Math.abs(actual - expected) / expected > 0.06) {
      throw new Error(`${slot} 需要约 ${spec.aspectRatio.width}:${spec.aspectRatio.height} 的宽高比`)
    }
  } finally {
    bitmap.close()
  }
}

function assetControl(slot: SkinAssetSlot): HTMLElement {
  if (manifest === undefined) throw new Error('皮肤尚未加载')
  const row = element('div', 'asset-row')
  const details = element('div')
  const title = element('strong')
  title.textContent = slot
  const path = element('small')
  path.textContent = manifest.assets[slot]?.path ?? '未配置（客户端将忽略）'
  details.append(title, path)
  const input = element('input')
  input.type = 'file'
  input.accept = 'image/png,image/webp,image/avif'
  input.setAttribute('aria-label', `替换 ${slot}`)
  input.addEventListener('change', async () => {
    const file = input.files?.[0]
    if (file === undefined || manifest === undefined) return
    try {
      await inspectAsset(file, slot)
      const mimeType = file.type as SkinAssetMimeType
      const packagePath = `assets/${slot.replace('.', '-')}.${MIME_EXTENSION[mimeType]}`
      const previous = overrides.get(packagePath)
      if (previous !== undefined) URL.revokeObjectURL(previous.url)
      overrides.set(packagePath, { file, url: URL.createObjectURL(file) })
      manifest.assets[slot] = {
        path: packagePath,
        mimeType,
        fit: SKIN_SLOT_CATALOG[slot].defaultFit,
      }
      const capability = capabilityForSlot(slot)
      const declared = [
        ...manifest.compatibility.requiredCapabilities,
        ...manifest.compatibility.optionalCapabilities,
      ].includes(capability)
      if (!declared) manifest.compatibility.optionalCapabilities.push(capability)
      renderEditor()
      refreshPreview()
      showToast(`${slot} 已替换，导出时会写入皮肤包`)
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : String(error), 'error')
    } finally {
      input.value = ''
    }
  })
  row.append(details, input)
  return row
}

function renderEditor(): void {
  if (manifest === undefined) return
  const metadata = section('清单', '修改内容会实时通过协议校验。')
  metadata.content.append(
    field('皮肤 ID', manifest.id, () => {}, { readonly: true }),
    field('名称', manifest.name, value => { if (manifest !== undefined) manifest.name = value }),
    field('版本', manifest.version, value => { if (manifest !== undefined) manifest.version = value }),
    field('简介', manifest.summary, value => { if (manifest !== undefined) manifest.summary = value }, { multiline: true }),
  )

  const colors = section(`${palette === 'light' ? '亮色' : '暗色'}语义颜色`, '客户端负责把语义 token 映射到自己的控件。')
  colors.content.classList.add('color-grid')
  colors.content.append(...COLOR_TOKENS.map(colorControl))
  for (const token of RADIUS_TOKENS) {
    const row = element('label', 'range-field')
    const label = element('span')
    const value = element('output')
    const input = element('input')
    input.type = 'range'
    input.min = '0'
    input.max = '32'
    input.value = String(manifest.palettes[palette][token])
    label.textContent = token.replace('radius.', '')
    value.textContent = `${input.value}px`
    input.addEventListener('input', () => {
      if (manifest === undefined) return
      manifest.palettes[palette][token] = Number(input.value)
      value.textContent = `${input.value}px`
      refreshPreview()
    })
    row.append(label, input, value)
    colors.content.append(row)
  }

  const assets = section('标准设计部位', '上传只接受符合目录尺寸与体积限制的本地栅格素材。')
  assets.content.classList.add('asset-list')
  assets.content.append(...(Object.keys(SKIN_SLOT_CATALOG) as SkinAssetSlot[]).map(assetControl))
  editor.replaceChildren(metadata.root, colors.root, assets.root)
}

async function useSource(next: SkinPackageSource): Promise<void> {
  clearOverrides()
  source?.dispose()
  source = next
  manifest = cloneManifest(next.manifest)
  palette = 'light'
  characterState = 'idle'
  sourceLabel.textContent = `${next.label} · ${manifest.version}`
  renderSwitchers()
  renderEditor()
  refreshPreview()
}

async function loadDemo(): Promise<void> {
  const packageUrl = new URL(`${import.meta.env.BASE_URL}blue-whale-navigator/`, window.location.href)
  await useSource(await loadBundledSkin(packageUrl, '原创鲸鱼娘验证皮肤'))
}

requiredElement<HTMLButtonElement>('[data-action="reload-demo"]').addEventListener('click', () => {
  void loadDemo().then(() => showToast('已恢复鲸鱼娘验证皮肤')).catch(error => showToast(String(error), 'error'))
})
requiredElement<HTMLButtonElement>('[data-action="import"]').addEventListener('click', () => upload.click())
upload.addEventListener('change', () => {
  if (upload.files === null || upload.files.length === 0) return
  void loadUploadedSkin(upload.files)
    .then(useSource)
    .then(() => showToast('皮肤目录已安全加载'))
    .catch((error: unknown) => showToast(error instanceof Error ? error.message : String(error), 'error'))
    .finally(() => { upload.value = '' })
})
requiredElement<HTMLButtonElement>('[data-action="export"]').addEventListener('click', () => {
  if (manifest === undefined) return
  const validation = validateSkinManifest(manifest)
  if (!validation.ok) {
    showToast('请先修复 skin.json 校验问题', 'error')
    return
  }
  void exportSkinPackage(validation.value, readDraftFile)
    .then((bytes) => {
      downloadSkinPackage(bytes, `${validation.value.id}-${validation.value.version}.dshskin`)
      showToast('已导出不含脚本的 .dshskin 包')
    })
    .catch((error: unknown) => showToast(error instanceof Error ? error.message : String(error), 'error'))
})

window.addEventListener('beforeunload', () => {
  clearOverrides()
  source?.dispose()
  previewFrame.dispose()
})

await previewFrame.mount()
await loadDemo()
