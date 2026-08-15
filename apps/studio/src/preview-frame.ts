import {
  DshWebSkinAdapter,
  type SkinCharacterState,
} from '@dsh-skins/adapter-dsh-web'
import type {
  SkinAssetDescriptor,
  SkinAssetSlot,
  SkinManifest,
  SkinPaletteMode,
} from '@dsh-skins/spec'

const PREVIEW_DOCUMENT = String.raw`<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; }
    html, body { width: 100%; height: 100%; margin: 0; overflow: hidden; }
    body {
      --dsw-alias-bg-base: #f5f7fa;
      --dsw-alias-bg-layer-1: #ffffff;
      --dsw-specific-sidebar-fill: #edf1f6;
      --dsw-alias-label-primary: #172033;
      --dsw-alias-label-secondary: #677085;
      --dsw-alias-border-l1: #d8deea;
      --dsw-alias-brand-primary: #1769e0;
      --dsw-alias-label-primary-inverted: #ffffff;
      --dsw-alias-state-success-primary: #198754;
      --dsw-alias-state-warn-primary: #a56a00;
      --dsw-alias-state-error-primary: #d14343;
      color: var(--dsw-alias-label-primary);
      background-color: var(--dsw-alias-bg-base);
      font: 14px/1.45 Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    button, input { font: inherit; }
    .app { display: grid; grid-template-columns: 224px 1fr; width: 100%; height: 100%; }
    .sidebar {
      position: relative;
      z-index: 3;
      padding: 18px 14px;
      color: var(--dsw-alias-label-primary);
      background: color-mix(in srgb, var(--dsw-specific-sidebar-fill) 92%, transparent);
      border-right: 1px solid var(--dsw-alias-border-l1);
      backdrop-filter: blur(16px);
    }
    .brand { display: flex; align-items: center; gap: 10px; padding: 0 8px 18px; font-weight: 720; }
    .brand-mark { display: grid; place-items: center; width: 30px; height: 30px; color: transparent; background-color: var(--dsw-alias-brand-primary); background-image: var(--dsh-skin-asset-agent-avatar); background-position: center 12%; background-size: 150%; border-radius: 10px; }
    .new-session { width: 100%; padding: 10px 12px; color: var(--dsw-alias-label-primary-inverted); background: var(--dsw-alias-brand-primary); border: 0; border-radius: var(--dsh-skin-radius-control, 10px); text-align: left; }
    .label { margin: 24px 8px 8px; color: var(--dsw-alias-label-secondary); font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
    .session { margin: 4px 0; padding: 9px 10px; border-radius: var(--dsh-skin-radius-control, 10px); color: var(--dsw-alias-label-secondary); }
    .session.active { color: var(--dsw-alias-label-primary); background: color-mix(in srgb, var(--dsw-alias-brand-primary) 13%, transparent); }
    .workspace { position: relative; z-index: 1; display: grid; grid-template-rows: 56px minmax(0, 1fr) auto; min-width: 0; background: color-mix(in srgb, var(--dsw-alias-bg-base) 86%, transparent); }
    header { display: flex; align-items: center; justify-content: space-between; padding: 0 22px; background: color-mix(in srgb, var(--dsw-alias-bg-layer-1) 86%, transparent); border-bottom: 1px solid var(--dsw-alias-border-l1); backdrop-filter: blur(18px); }
    header strong { font-size: 13px; }
    .state-pill { padding: 5px 9px; color: var(--dsw-alias-brand-primary); background: color-mix(in srgb, var(--dsw-alias-brand-primary) 12%, transparent); border: 1px solid color-mix(in srgb, var(--dsw-alias-brand-primary) 26%, transparent); border-radius: 999px; font-size: 11px; }
    main { overflow: auto; padding: 34px clamp(24px, 5vw, 72px) 120px; }
    .conversation { width: min(700px, 100%); margin: 0 auto; }
    .eyebrow { color: var(--dsw-alias-brand-primary); font-size: 12px; font-weight: 760; letter-spacing: .08em; text-transform: uppercase; }
    h1 { margin: 10px 0 26px; font-size: clamp(24px, 4vw, 42px); line-height: 1.12; letter-spacing: -.04em; }
    .message { margin: 14px 0; padding: 16px 18px; background: color-mix(in srgb, var(--dsw-alias-bg-layer-1) 91%, transparent); border: 1px solid var(--dsw-alias-border-l1); border-radius: var(--dsh-skin-radius-panel, 16px); box-shadow: 0 12px 36px color-mix(in srgb, var(--dsw-alias-label-primary) 8%, transparent); backdrop-filter: blur(18px); }
    .message.user { width: 74%; margin-left: auto; background: color-mix(in srgb, var(--dsw-alias-brand-primary) 10%, var(--dsw-alias-bg-layer-1)); }
    .speaker { margin-bottom: 7px; color: var(--dsw-alias-label-secondary); font-size: 11px; font-weight: 720; }
    .tool { display: grid; grid-template-columns: 7px 1fr auto; gap: 12px; align-items: center; margin-top: 14px; padding: 12px 14px; background: color-mix(in srgb, var(--dsw-alias-bg-layer-1) 76%, transparent); border: 1px solid var(--dsw-alias-border-l1); border-radius: var(--dsh-skin-radius-control, 10px); color: var(--dsw-alias-label-secondary); }
    .tool-dot { width: 7px; height: 28px; background: var(--dsw-alias-state-success-primary); border-radius: 999px; }
    .tool code { color: var(--dsw-alias-label-primary); font: 12px ui-monospace, SFMono-Regular, Menlo, monospace; }
    .composer-wrap { position: relative; z-index: 4; padding: 12px clamp(24px, 5vw, 72px) 18px; background: linear-gradient(transparent, var(--dsw-alias-bg-base) 28%); }
    .composer { display: flex; align-items: center; gap: 12px; width: min(700px, 100%); margin: auto; padding: 12px 13px 12px 18px; color: var(--dsw-alias-label-secondary); background: color-mix(in srgb, var(--dsw-alias-bg-layer-1) 94%, transparent); border: 1px solid var(--dsw-alias-border-l1); border-radius: var(--dsh-skin-radius-panel, 16px); box-shadow: 0 18px 46px color-mix(in srgb, var(--dsw-alias-label-primary) 12%, transparent); backdrop-filter: blur(20px); }
    .composer span { flex: 1; }
    .send { display: grid; place-items: center; width: 32px; height: 32px; color: var(--dsw-alias-label-primary-inverted); background: var(--dsw-alias-brand-primary); border-radius: var(--dsh-skin-radius-control, 10px); }
    [data-dsh-skin-character] { filter: drop-shadow(0 20px 28px rgba(0, 18, 52, .24)); }
    @media (max-width: 760px) {
      .app { grid-template-columns: 74px 1fr; }
      .brand strong, .new-session span, .label, .session { display: none; }
      .new-session { display: grid; place-items: center; height: 42px; text-align: center; }
      [data-dsh-skin-character] { opacity: .55; }
    }
  </style>
</head>
<body>
  <div class="app">
    <aside class="sidebar">
      <div class="brand"><span class="brand-mark">D</span><strong>DeepSeek Harness</strong></div>
      <button class="new-session">＋ <span>新建任务</span></button>
      <div class="label">最近任务</div>
      <div class="session active">验证鲸鱼娘皮肤</div>
      <div class="session">客户端能力协商</div>
      <div class="session">创作者交付检查</div>
    </aside>
    <section class="workspace">
      <header><strong>鲸鱼娘皮肤兼容性验证</strong><span class="state-pill" data-preview-state>idle</span></header>
      <main>
        <div class="conversation">
          <div class="eyebrow">Portable skin protocol · v1</div>
          <h1>一份皮肤，适配不同客户端。</h1>
          <div class="message user"><div class="speaker">你</div>检查这套鲸鱼娘皮肤能否安全切换。</div>
          <div class="message"><div class="speaker">DeepSeek Harness</div>清单、语义颜色和角色状态已经通过适配器加载。皮肤只改变视觉，不触达模型、工具或权限。</div>
          <div class="tool"><span class="tool-dot"></span><code>dsh-skin validate</code><span>通过</span></div>
        </div>
      </main>
      <div class="composer-wrap"><div class="composer"><span>给 DeepSeek Harness 发送消息…</span><span class="send">↑</span></div></div>
    </section>
  </div>
</body>
</html>`

/** Sandboxed DSH-like document driven by the production web adapter. */
export class PreviewFrame {
  private adapter: DshWebSkinAdapter | undefined

  constructor(private readonly frame: HTMLIFrameElement) {}

  /** Initialize the isolated preview document. */
  async mount(): Promise<void> {
    await new Promise<void>((resolve) => {
      this.frame.addEventListener('load', () => resolve(), { once: true })
      this.frame.srcdoc = PREVIEW_DOCUMENT
    })
  }

  /** Render one complete draft through the same adapter used by DSH Web wrappers. */
  render(
    manifest: SkinManifest,
    palette: SkinPaletteMode,
    characterState: SkinCharacterState,
    resolveAssetUrl: (asset: SkinAssetDescriptor, slot: SkinAssetSlot) => string,
  ): void {
    const document = this.frame.contentDocument
    if (document === null) throw new Error('预览文档尚未就绪')
    this.adapter?.dispose()
    this.adapter = new DshWebSkinAdapter({ document, root: document.body, resolveAssetUrl })
    this.adapter.activate(manifest, palette)
    this.adapter.setCharacterState(characterState)
    document.documentElement.style.colorScheme = palette
    document.body.toggleAttribute('data-ds-dark-theme', palette === 'dark')
    const state = document.querySelector<HTMLElement>('[data-preview-state]')
    if (state !== null) state.textContent = characterState
  }

  /** Restore the preview document to its unskinned state. */
  dispose(): void {
    this.adapter?.dispose()
    this.adapter = undefined
  }
}
