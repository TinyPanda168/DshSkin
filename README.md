# SpecsRelay for DeepSeek

[English](#english) | [简体中文](#简体中文)

## English

SpecsRelay companion for the official DeepSeek Harness WebUI. Version 0.4 places the official DeepSeek web app and a persistent SpecsRelay sidebar in one DSH tab. Copy the conversation you want to relay, import it from the clipboard or paste it manually, summarize it through DSH's configured official DeepSeek model, review the structured requirement, and load it into the current DSH draft.

### Install from GitHub

From a DeepSeek Harness checkout:

```sh
pnpm dsh plugin --profile web add github:TinyPanda168/SpecsRelay-DSH
```

Restart the DSH WebUI after installation. This is a normal DSH plugin install; no unpacked Chromium extension, Chrome Web Store extension, or separate API Key is required.

### Use

1. Select a DSH Workspace and create or open a session.
2. Select the **DeepSeek** tab above the conversation, or select the SpecsRelay icon in the sidebar footer.
3. Sign in and use the official DeepSeek web app on the left.
4. Copy the conversation or shared text you want to relay.
5. In the persistent SpecsRelay sidebar, select **Import from clipboard**. Use **Paste manually** if clipboard access is unavailable.
6. Select **Summarize requirement**. SpecsRelay uses the official DeepSeek route already configured by DSH, preferring the current session's DeepSeek model and otherwise using `deepseek-v4-flash`.
7. Review the structured result and select **Load into current DSH draft**. The draft is never submitted automatically.
8. Use **Handoff records** to inspect deliveries received from another SpecsRelay surface.

The **DeepSeek Relay** action beside the composer still loads the newest validated handoff without submitting it.

### Local development

The synchronized copy inside the SpecsRelay repository can be installed directly:

```sh
pnpm dsh plugin --profile web add /absolute/path/to/SpecsRelay/plugins/dsh-deepseek
```

### Version 0.4 boundaries

- The supported surface is the official DSH WebUI profile.
- DeepSeek controls whether its web app permits iframe embedding.
- The plugin does not read the cross-origin DeepSeek page automatically. The user explicitly copies and imports text into the persistent sidebar.
- Imported text stays in the current browser memory until **Summarize requirement** is selected. The host receives it only for that DSH-managed DeepSeek model call.
- No DeepSeek cookie, account credential, browser-extension permission, or separate organizer API Key is requested by SpecsRelay.
- DSH mode is independent from the Chrome Web Store side panel under `extension/`.
- A received external handoff is loaded only when its project path matches the active DSH Workspace.
- Loading a handoff changes the DSH draft only. It never submits the draft or starts an agent turn.

## 简体中文

这是面向 DeepSeek Harness 官方 WebUI 的 SpecsRelay 配套插件。0.4 版本把 DeepSeek 官方网页和 SpecsRelay 常驻侧栏放在同一个 DSH 页签中：复制需要交接的对话，从剪贴板导入或手动粘贴，使用 DSH 已配置的 DeepSeek 官方模型整理需求，检查结构化结果，再载入当前 DSH 草稿。

### 从 GitHub 安装

在 DeepSeek Harness 仓库目录中执行：

```sh
pnpm dsh plugin --profile web add github:TinyPanda168/SpecsRelay-DSH
```

安装后重启 DSH WebUI。这是普通的 DSH 插件安装方式，不需要加载未打包 Chromium 扩展，不依赖 Chrome 商店版，也不需要额外填写 API Key。

### 使用方式

1. 在 DSH 中选择 Workspace，并创建或打开一个会话。
2. 点击会话顶部的 **DeepSeek** 页签，或者点击左侧栏底部的 SpecsRelay 图标。
3. 在左侧登录并使用 DeepSeek 官方网页。
4. 复制需要交接的对话或分享文本。
5. 在右侧常驻 SpecsRelay 侧栏中点击 **从剪贴板导入**；浏览器无法读取剪贴板时使用 **手动粘贴**。
6. 点击 **总结为需求**。SpecsRelay 直接复用 DSH 已配置的 DeepSeek 官方模型；当前会话使用 DeepSeek 路由时优先沿用其模型，否则使用 `deepseek-v4-flash`。
7. 检查结构化结果后点击 **载入当前 DSH 草稿**。插件不会自动发送。
8. **交接记录** 用于查看其他 SpecsRelay 入口发来的交接内容。

输入框旁边的 **DeepSeek Relay** 操作仍可载入最新的已验证交接内容，但不会自动发送。

### 本地开发

可以直接安装 SpecsRelay 仓库中同步维护的版本：

```sh
pnpm dsh plugin --profile web add /absolute/path/to/SpecsRelay/plugins/dsh-deepseek
```

### 0.4 版本边界

- 当前支持范围是 DSH 官方 WebUI profile。
- DeepSeek 官方网页是否允许 iframe 嵌入由 DeepSeek 决定。
- 插件不会自动读取跨域的 DeepSeek 网页；复制和导入均由用户主动触发。
- 导入内容先保存在当前浏览器内存中；只有点击 **总结为需求** 后，Host 才会将它用于这一次由 DSH 管理的 DeepSeek 模型调用。
- SpecsRelay 不读取 DeepSeek Cookie 或账号凭证，不申请浏览器扩展权限，也不保存独立的整理模型 API Key。
- DSH 版本与 `extension/` 下的 Chrome 商店侧栏相互独立。
- 其他入口发来的交接内容只有在项目路径与当前 DSH Workspace 一致时才能载入草稿。
- 载入操作只修改 DSH 草稿，不会自动发送，也不会启动 Agent 回合。
