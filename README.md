# SpecsRelay for DeepSeek

[English](#english) | [简体中文](#简体中文)

## English

SpecsRelay companion for the official DeepSeek Harness WebUI. Version 0.7 keeps the official DeepSeek web app and a persistent SpecsRelay workbench in one DSH tab. Its only source is the currently selected DeepSeek web conversation. The packaged SpecsRelay browser extension reuses its existing DeepSeek capture engine inside that page and delivers the captured conversation through the local native bridge. The workbench then mirrors the Chrome edition's continuous three-step flow: build and strengthen the requirement, confirm the fixed current DSH target, then inspect and load the prompt. Loading creates a frozen execution snapshot that can be loaded again or used as the basis for a revised requirement. DSH supplies the model and native controls. Narrow tablet layouts switch between the DeepSeek and SpecsRelay panes without unmounting either pane.

### Install from GitHub

From a DeepSeek Harness checkout:

```sh
pnpm dsh plugin --profile web add github:TinyPanda168/SpecsRelay-DSH
```

Restart the DSH WebUI after installation. This is a normal DSH plugin install. Automatic page capture uses the packaged Chrome/Comet SpecsRelay extension and its local bridge; developer mode and unpacked-extension loading are not part of the user flow. DSH supplies the organizer model, so no separate organizer API Key is required.

### Use

1. Select a DSH Workspace and create or open a session.
2. Select the **DeepSeek** tab above the conversation, or select the SpecsRelay icon in the sidebar footer.
3. Sign in and use the official DeepSeek web app on the left.
4. Wait for **DeepSeek page capture connected**, then select **Add current conversation as source**. SpecsRelay captures the complete multi-turn conversation and saves it locally without calling a model. Capturing again replaces the previous conversation.
5. Select **Integrate and strengthen sources** when the source is ready. The plugin loads its registered requirement-analysis Skill and calls the official DeepSeek route already configured by DSH. It prefers the current session's DeepSeek model and otherwise uses `deepseek-v4-flash`.
6. If material product decisions remain, answer the questions in the workbench and resubmit. You may also continue discussing them in DeepSeek, capture the current conversation again, and run integration again.
7. Optionally run the three-role review. This explicit action makes two DSH-managed DeepSeek calls: evidence review and improved-handoff synthesis. The same Skill strengthens both calls.
8. The target step is fixed to the current DSH session and displays its Workspace. Inspect the full prompt, confirm the target and directory, then select **Load current version into DSH draft**. The draft is never submitted automatically.
9. Every successful load creates a frozen execution snapshot. It can be loaded again or used to create a revised requirement without mutating the loaded version. **New requirement** archives the current working draft locally; the three newest drafts can be restored. **Handoff records** remains a separate view for deliveries received from another SpecsRelay surface.

The **DeepSeek Relay** action beside the composer still loads the newest validated handoff without submitting it.

### Local development

The synchronized copy inside the SpecsRelay repository can be installed directly:

```sh
pnpm dsh plugin --profile web add /absolute/path/to/SpecsRelay/plugins/dsh-deepseek
```

### Version 0.7 boundaries

- The supported surface is the official DSH WebUI profile.
- DeepSeek controls whether its web app permits iframe embedding.
- Automatic capture reuses the browser extension's existing DeepSeek DOM driver. The DSH page never reads the cross-origin iframe directly.
- Captured conversation data travels from the DeepSeek frame through Chrome Native Messaging to the authenticated loopback DSH ingress. It is not returned to an arbitrary embedding page.
- Clipboard and manual paste are retained only under **Fallback: paste raw conversation**.
- Exactly one DeepSeek conversation is active. A new import replaces it; recovery snapshots are history, not additional analysis sources.
- The current conversation, handoff, clarification answers, newest three recovery drafts, and frozen execution snapshots are stored in the current browser, separated by DSH Workspace.
- Capture stores the source locally without calling a model. The DSH model receives it only after an explicit integrate, clarify, revise, or review action.
- The bundled Skill is registered through DSH's skill service and loaded explicitly for requirement analysis. It is not a user-invocable or model-invocable general-purpose Skill.
- SpecsRelay does not read DeepSeek cookies or account credentials and does not store a separate organizer API Key. The existing browser extension host permission runs the shared capture engine inside the DeepSeek page; model credentials stay under DSH's provider configuration.
- The DSH requirement workflow is independent from the Chrome side panel, but automatic page capture intentionally shares the packaged browser capture engine and native bridge.
- A received external handoff is loaded only when its project path matches the active DSH Workspace.
- Loading a handoff changes the DSH draft only. It never submits the draft or starts an agent turn.

## 简体中文

这是面向 DeepSeek Harness 官方 WebUI 的 SpecsRelay 配套插件。0.7 版本把 DeepSeek 官方网页和 SpecsRelay 常驻工作台放在同一个 DSH 页签中，唯一来源是当前打开的 DeepSeek 网页对话。已打包发布的 SpecsRelay 浏览器扩展会复用现有 DeepSeek 抓取引擎，并通过本地 Native Messaging 桥把对话交给 DSH。工作台按照 Chrome 版的连续三步流程呈现：建立并强化需求、确认固定的当前 DSH 目标、检查并载入提示词。载入后生成冻结执行快照，可以重新载入，也可以基于该版本继续修改。模型由 DSH 提供，控件遵循 DSH WebUI 原生交互；平板窄屏切换面板时不会卸载任一页面。

### 从 GitHub 安装

在 DeepSeek Harness 仓库目录中执行：

```sh
pnpm dsh plugin --profile web add github:TinyPanda168/SpecsRelay-DSH
```

安装后重启 DSH WebUI。这是普通的 DSH 插件安装方式。自动抓取使用已打包发布的 Chrome/Comet SpecsRelay 扩展及其本地桥，不要求开发者模式或“加载已解压的扩展程序”；整理模型由 DSH 提供，不需要额外填写 API Key。

### 使用方式

1. 在 DSH 中选择 Workspace，并创建或打开一个会话。
2. 点击会话顶部的 **DeepSeek** 页签，或者点击左侧栏底部的 SpecsRelay 图标。
3. 在左侧登录并使用 DeepSeek 官方网页。
4. 等待状态显示 **DeepSeek 网页捕获已连接**，点击 **添加当前对话为来源**。SpecsRelay 会抓取完整多轮对话并先保存到本地，不会在这一步调用模型；再次抓取会替换上一份对话。
5. 来源确认无误后点击 **整合并强化来源**。插件会加载已经注册到 DSH 的需求分析 Skill，并调用 DSH 已配置的 DeepSeek 官方模型；当前会话使用 DeepSeek 路由时优先沿用其模型，否则使用 `deepseek-v4-flash`。
6. 如果仍有必须由用户决定的问题，可以直接在工作台逐条回答后重新整理；也可以回到 DeepSeek 继续讨论，重新抓取当前对话后再次整合。
7. 可选执行三角色评审。这个明确操作会进行两次由 DSH 管理的 DeepSeek 模型调用：先做证据评审，再合成增强后的 handoff；两次都继续使用同一个 Skill。
8. 第二步固定显示当前 DSH 会话及其 Workspace。检查第三步中的完整提示词，确认目标和目录后，再点击 **载入当前版本到 DSH 草稿**。插件不会自动发送。
9. 每次成功载入都会生成冻结执行快照，可以重新载入，或基于该版本继续修改而不影响已经载入的版本。点击 **新需求** 会把当前工作草稿存入本地恢复记录，最多保留最近 3 份；**交接记录** 仍单独用于查看其他 SpecsRelay 入口发来的交接内容。

输入框旁边的 **DeepSeek Relay** 操作仍可载入最新的已验证交接内容，但不会自动发送。

### 本地开发

可以直接安装 SpecsRelay 仓库中同步维护的版本：

```sh
pnpm dsh plugin --profile web add /absolute/path/to/SpecsRelay/plugins/dsh-deepseek
```

### 0.7 版本边界

- 当前支持范围是 DSH 官方 WebUI profile。
- DeepSeek 官方网页是否允许 iframe 嵌入由 DeepSeek 决定。
- 自动抓取复用浏览器扩展现有的 DeepSeek DOM 驱动；DSH 页面本身不会越过跨域限制直接读取 iframe。
- 对话从 DeepSeek 页面经 Chrome Native Messaging 送入带鉴权的 DSH 本地入口，不会返回给任意嵌入网页。
- 剪贴板和手动粘贴只保留在 **备用：粘贴原始对话** 中。
- 当前始终只有一份 DeepSeek 对话。重新导入会替换它；本地恢复记录属于历史快照，不会同时参与需求分析。
- 当前对话、handoff、澄清答案、最近 3 份恢复草稿和冻结执行快照保存在当前浏览器中，并按 DSH Workspace 区分。
- 抓取只在本地保存来源，不调用模型；只有明确点击整合、澄清、修订或评审后，DSH 模型才会收到当前对话文本。
- 内置 Skill 通过 DSH 的 skill service 注册，并由 SpecsRelay 在分析需求时显式加载；它不会作为普通的用户可调用或模型可调用 Skill 暴露。
- SpecsRelay 不读取 DeepSeek Cookie 或账号凭证，也不保存独立的整理模型 API Key；现有浏览器扩展的 DeepSeek 页面权限仅用于运行共享抓取引擎，模型凭证继续由 DSH 原有 provider 配置管理。
- DSH 的需求工作流与 Chrome 商店侧栏相互独立，但自动网页抓取会有意共用已打包的捕获引擎和本地桥。
- 其他入口发来的交接内容只有在项目路径与当前 DSH Workspace 一致时才能载入草稿。
- 载入操作只修改 DSH 草稿，不会自动发送，也不会启动 Agent 回合。
