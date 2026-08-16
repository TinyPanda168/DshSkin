# SpecsRelay for DeepSeek

[English](#english) | [简体中文](#简体中文)

## English

SpecsRelay companion for the official DeepSeek Harness WebUI. Version 0.6 keeps the official DeepSeek web app and a persistent SpecsRelay sidebar in one DSH tab. Unlike the Chrome extension, this DSH edition has exactly one input: the currently selected DeepSeek web conversation. It uses DSH's configured official DeepSeek model together with the bundled `specsrelay-requirement-analysis` Skill, then follows the familiar clarification, optional review, preview, confirmation, and DSH draft-loading flow.

### Install from GitHub

From a DeepSeek Harness checkout:

```sh
pnpm dsh plugin --profile web add github:TinyPanda168/SpecsRelay-DSH
```

Restart the DSH WebUI after installation. This is a normal DSH plugin install. It requires neither an unpacked Chromium extension nor a separate organizer API Key.

### Use

1. Select a DSH Workspace and create or open a session.
2. Select the **DeepSeek** tab above the conversation, or select the SpecsRelay icon in the sidebar footer.
3. Sign in and use the official DeepSeek web app on the left.
4. Copy the current conversation and select **Import current conversation from clipboard**. Importing again replaces the previous conversation. Importing does not call a model.
5. Select **Analyze and organize with Skill**. The plugin loads its registered requirement-analysis Skill and calls the official DeepSeek route already configured by DSH. It prefers the current session's DeepSeek model and otherwise uses `deepseek-v4-flash`.
6. If material product decisions remain, answer the questions in the sidebar and resubmit. You may also continue discussing them in DeepSeek, then copy and replace the current conversation.
7. Optionally run the three-role review. This explicit action makes two DSH-managed DeepSeek calls: evidence review and improved-handoff synthesis. The same Skill strengthens both calls.
8. Inspect the full DSH prompt, confirm that loading changes only the draft, then select **Load into current DSH draft**. The draft is never submitted automatically.
9. **New requirement** archives the current workspace locally. The three newest snapshots can be restored. **Handoff records** remains a separate view for deliveries received from another SpecsRelay surface.

The **DeepSeek Relay** action beside the composer still loads the newest validated handoff without submitting it.

### Local development

The synchronized copy inside the SpecsRelay repository can be installed directly:

```sh
pnpm dsh plugin --profile web add /absolute/path/to/SpecsRelay/plugins/dsh-deepseek
```

### Version 0.6 boundaries

- The supported surface is the official DSH WebUI profile.
- DeepSeek controls whether its web app permits iframe embedding.
- The plugin cannot read the cross-origin DeepSeek page automatically. The user explicitly copies and imports the current conversation into the persistent sidebar.
- Exactly one DeepSeek conversation is active. A new import replaces it; recovery snapshots are history, not additional analysis sources.
- The current conversation, handoff, clarification answers, and newest three recovery snapshots are stored in the current browser's local storage, separated by DSH Workspace.
- The host receives the conversation only after an explicit analyze, clarify, revise, or review action.
- The bundled Skill is registered through DSH's skill service and loaded explicitly for requirement analysis. It is not a user-invocable or model-invocable general-purpose Skill.
- SpecsRelay does not read DeepSeek cookies or account credentials, request browser-extension permissions, or store a separate organizer API Key. Model credentials stay under DSH's existing provider configuration.
- DSH mode is independent from the Chrome Web Store side panel under `extension/`.
- A received external handoff is loaded only when its project path matches the active DSH Workspace.
- Loading a handoff changes the DSH draft only. It never submits the draft or starts an agent turn.

## 简体中文

这是面向 DeepSeek Harness 官方 WebUI 的 SpecsRelay 配套插件。0.6 版本把 DeepSeek 官方网页和 SpecsRelay 常驻侧栏放在同一个 DSH 页签中。与 Chrome 扩展版不同，DSH 版只有一个输入来源：当前打开的 DeepSeek 网页对话。插件会复用 DSH 已配置的 DeepSeek 官方模型，并加载内置的 `specsrelay-requirement-analysis` Skill 强化需求，之后继续沿用澄清、可选评审、预览、确认和载入 DSH 草稿的流程。

### 从 GitHub 安装

在 DeepSeek Harness 仓库目录中执行：

```sh
pnpm dsh plugin --profile web add github:TinyPanda168/SpecsRelay-DSH
```

安装后重启 DSH WebUI。这是普通的 DSH 插件安装方式，不需要加载未打包的 Chromium 扩展，也不需要额外填写整理模型 API Key。

### 使用方式

1. 在 DSH 中选择 Workspace，并创建或打开一个会话。
2. 点击会话顶部的 **DeepSeek** 页签，或者点击左侧栏底部的 SpecsRelay 图标。
3. 在左侧登录并使用 DeepSeek 官方网页。
4. 复制当前对话，点击 **从剪贴板导入当前对话**。再次导入会替换上一份对话；导入本身不会调用模型。
5. 点击 **使用 Skill 分析并整理需求**。插件会加载已经注册到 DSH 的需求分析 Skill，并调用 DSH 已配置的 DeepSeek 官方模型；当前会话使用 DeepSeek 路由时优先沿用其模型，否则使用 `deepseek-v4-flash`。
6. 如果仍有必须由用户决定的问题，可以直接在侧栏逐条回答后重新整理；也可以回到 DeepSeek 继续讨论，再复制完整对话替换当前来源。
7. 可选执行三角色评审。这个明确操作会进行两次由 DSH 管理的 DeepSeek 模型调用：先做证据评审，再合成增强后的 handoff；两次都继续使用同一个 Skill。
8. 检查完整 DSH 提示词，确认只会改动草稿后，再点击 **载入当前 DSH 草稿**。插件不会自动发送。
9. 点击 **新需求** 会把当前工作区存入本地恢复记录，最多保留最近 3 份；**交接记录** 仍单独用于查看其他 SpecsRelay 入口发来的交接内容。

输入框旁边的 **DeepSeek Relay** 操作仍可载入最新的已验证交接内容，但不会自动发送。

### 本地开发

可以直接安装 SpecsRelay 仓库中同步维护的版本：

```sh
pnpm dsh plugin --profile web add /absolute/path/to/SpecsRelay/plugins/dsh-deepseek
```

### 0.6 版本边界

- 当前支持范围是 DSH 官方 WebUI profile。
- DeepSeek 官方网页是否允许 iframe 嵌入由 DeepSeek 决定。
- 插件受浏览器跨域限制，不能自动读取 DeepSeek 网页；用户需要主动复制并导入当前对话。
- 当前始终只有一份 DeepSeek 对话。重新导入会替换它；本地恢复记录属于历史快照，不会同时参与需求分析。
- 当前对话、handoff、澄清答案和最近 3 份恢复记录保存在当前浏览器的本地存储中，并按 DSH Workspace 区分。
- 只有明确点击 Skill 分析、澄清、修订或评审后，Host 才会收到当前对话文本。
- 内置 Skill 通过 DSH 的 skill service 注册，并由 SpecsRelay 在分析需求时显式加载；它不会作为普通的用户可调用或模型可调用 Skill 暴露。
- SpecsRelay 不读取 DeepSeek Cookie 或账号凭证，不申请浏览器扩展权限，也不保存独立的整理模型 API Key；模型凭证继续由 DSH 原有 provider 配置管理。
- DSH 版本与 `extension/` 下的 Chrome 商店侧栏相互独立。
- 其他入口发来的交接内容只有在项目路径与当前 DSH Workspace 一致时才能载入草稿。
- 载入操作只修改 DSH 草稿，不会自动发送，也不会启动 Agent 回合。
