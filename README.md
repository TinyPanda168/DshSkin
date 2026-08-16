# SpecsRelay for DeepSeek

[English](#english) | [简体中文](#简体中文)

## English

SpecsRelay companion for the official DeepSeek Harness WebUI. Version 0.5 keeps the official DeepSeek web app and a persistent SpecsRelay requirement workspace in one DSH tab. Its workflow now follows the Chrome extension where the DSH environment permits it: collect up to five sources, choose a primary source, integrate only on explicit request, answer clarifying questions, run an optional three-role review, preview the final prompt, and load it into the current DSH draft.

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
4. Copy a conversation or shared text and save it as a requirement source. Repeat for up to five sources and mark the most authoritative one as primary. Saving a source does not call a model.
5. Select **Integrate and strengthen sources**. SpecsRelay uses the official DeepSeek route already configured by DSH, preferring the current session's DeepSeek model and otherwise using `deepseek-v4-flash`.
6. If product decisions remain, answer them in the sidebar and resubmit, or copy the questions back to the DeepSeek page and add the clarified conversation as another source.
7. Optionally run the three-role review. This explicit action makes two model calls: evidence review and improved-handoff synthesis.
8. Inspect the full DSH prompt, confirm that loading changes only the draft, then select **Load into current DSH draft**. The draft is never submitted automatically.
9. **New requirement** archives the current workspace locally. The three newest snapshots can be restored. **Handoff records** remains a separate view for deliveries received from another SpecsRelay surface.

The **DeepSeek Relay** action beside the composer still loads the newest validated handoff without submitting it.

### Local development

The synchronized copy inside the SpecsRelay repository can be installed directly:

```sh
pnpm dsh plugin --profile web add /absolute/path/to/SpecsRelay/plugins/dsh-deepseek
```

### Version 0.5 boundaries

- The supported surface is the official DSH WebUI profile.
- DeepSeek controls whether its web app permits iframe embedding.
- The plugin does not read the cross-origin DeepSeek page automatically. The user explicitly copies and imports text into the persistent sidebar.
- Sources, the current handoff, clarification answers, and the newest three recovery snapshots are stored in the current browser's local storage, separated by DSH Workspace. The host receives source text only after an explicit integrate, clarify, revise, or review action.
- The optional three-role review uses two DSH-managed DeepSeek calls. Saving sources, changing the primary source, removing a source, starting a new requirement, and restoring history use no model calls.
- No DeepSeek cookie, account credential, browser-extension permission, or separate organizer API Key is requested by SpecsRelay.
- DSH mode is independent from the Chrome Web Store side panel under `extension/`.
- A received external handoff is loaded only when its project path matches the active DSH Workspace.
- Loading a handoff changes the DSH draft only. It never submits the draft or starts an agent turn.

## 简体中文

这是面向 DeepSeek Harness 官方 WebUI 的 SpecsRelay 配套插件。0.5 版本把 DeepSeek 官方网页和 SpecsRelay 常驻需求工作台放在同一个 DSH 页签中，并在 DSH 环境允许的范围内对齐 Chrome 版交互：最多收集 5 个来源、指定主要来源、明确点击后才整合、补充待确认问题、可选三角色评审、预览最终提示词，再载入当前 DSH 草稿。

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
4. 复制一段对话或分享文本并保存为需求来源；最多可保存 5 个来源，并把最权威的一个设为主要来源。保存来源不会调用模型。
5. 点击 **整合并增强来源**。SpecsRelay 直接复用 DSH 已配置的 DeepSeek 官方模型；当前会话使用 DeepSeek 路由时优先沿用其模型，否则使用 `deepseek-v4-flash`。
6. 如果仍有产品决定待确认，可以直接在侧栏逐条回答后重新整理；也可以把问题复制回左侧 DeepSeek 继续讨论，再把澄清后的对话补充为来源。
7. 可选执行三角色评审。这个明确操作会进行两次模型调用：先做证据评审，再合成增强后的 handoff。
8. 检查完整 DSH 提示词，确认只会改动草稿后，再点击 **载入当前 DSH 草稿**。插件不会自动发送。
9. 点击 **新需求** 会把当前工作区存入本地恢复记录，最多保留最近 3 份；**交接记录** 仍单独用于查看其他 SpecsRelay 入口发来的交接内容。

输入框旁边的 **DeepSeek Relay** 操作仍可载入最新的已验证交接内容，但不会自动发送。

### 本地开发

可以直接安装 SpecsRelay 仓库中同步维护的版本：

```sh
pnpm dsh plugin --profile web add /absolute/path/to/SpecsRelay/plugins/dsh-deepseek
```

### 0.5 版本边界

- 当前支持范围是 DSH 官方 WebUI profile。
- DeepSeek 官方网页是否允许 iframe 嵌入由 DeepSeek 决定。
- 插件不会自动读取跨域的 DeepSeek 网页；复制和导入均由用户主动触发。
- 来源、当前 handoff、澄清答案和最近 3 份恢复记录保存在当前浏览器的本地存储中，并按 DSH Workspace 区分。只有明确点击整合、澄清、修订或评审后，Host 才会收到来源文本。
- 可选三角色评审会进行两次由 DSH 管理的 DeepSeek 模型调用。保存来源、切换主要来源、移除来源、新建需求和恢复历史都不会调用模型。
- SpecsRelay 不读取 DeepSeek Cookie 或账号凭证，不申请浏览器扩展权限，也不保存独立的整理模型 API Key。
- DSH 版本与 `extension/` 下的 Chrome 商店侧栏相互独立。
- 其他入口发来的交接内容只有在项目路径与当前 DSH Workspace 一致时才能载入草稿。
- 载入操作只修改 DSH 草稿，不会自动发送，也不会启动 Agent 回合。
