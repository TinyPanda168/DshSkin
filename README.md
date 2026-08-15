# SpecsRelay for DeepSeek

[English](#english) | [简体中文](#简体中文)

## English

SpecsRelay companion for the official DeepSeek Harness WebUI. Version 0.3 keeps the complete DeepSeek-first workflow inside DSH: load the official DeepSeek web app, capture the current conversation on demand, summarize it with the configured requirement organizer, review the structured result, and load it into the current DSH draft.

### Install from GitHub

From a DeepSeek Harness checkout:

```sh
pnpm dsh plugin --profile web add github:TinyPanda168/SpecsRelay-DSH
```

Restart the DSH WebUI after installation. Load the packaged `browser-bridge/` directory once as an unpacked Chromium extension so SpecsRelay-DSH can read the cross-origin DeepSeek frame. This private bridge has no general chatbot side panel and is separate from the Chrome Web Store product.

### Use

1. Select a DSH Workspace and create or open a session.
2. Select the **DeepSeek** tab above the conversation, or use the SpecsRelay icon in the sidebar footer to switch to it.
3. Sign in to the DeepSeek web app and use it inside the DSH tab.
4. Select **Get current conversation** to capture the visible DeepSeek conversation without sending it to an organizer.
5. Open **Summary settings** once and enter the DeepSeek API Key and model used only by SpecsRelay-DSH. Version 0.3 always calls the official DeepSeek API endpoint.
6. Select **Summarize requirement** to capture when needed, call that organizer, and open the structured summary beside DeepSeek.
7. Review the summary and select **Load into current DSH draft**. Nothing is submitted automatically.
8. Open **Handoff records** only for deliveries created by another SpecsRelay surface.

The **DeepSeek Relay** action beside the composer still loads the newest validated handoff without submitting it.

### Local development

The synchronized copy inside the SpecsRelay repository can be installed directly:

```sh
pnpm dsh plugin --profile web add /absolute/path/to/SpecsRelay/plugins/dsh-deepseek
```

### Version 0.3 boundaries

- The supported surface is the official DSH WebUI profile.
- DeepSeek controls whether its web app permits iframe embedding. A new-browser-tab action remains only as an explicit fallback when the DSH browser bridge is unavailable.
- The DSH plugin never receives DeepSeek cookies or account credentials. The browser extension bridge reads only the current DeepSeek frame after a user click.
- Conversation capture remains local. The captured transcript reaches the configured requirement organizer only after **Summarize requirement** is selected.
- DSH mode does not open or depend on the general SpecsRelay browser side panel. Its packaged private bridge owns only cross-origin capture and its DeepSeek-only organizer configuration.
- A handoff is loaded only when its project path matches the active DSH Workspace.
- Loading a handoff changes the DSH draft only. It never submits the draft or starts a model turn.

## 简体中文

这是面向 DeepSeek Harness 官方 WebUI 的 SpecsRelay 配套扩展。0.3 版本将 DeepSeek-first 工作流完整放进 DSH：在页签内使用 DeepSeek、按需获取当前对话、调用已配置的需求整理模型、在 DeepSeek 旁边检查结构化总结，并载入当前 DSH 草稿。

### 从 GitHub 安装

在 DeepSeek Harness 仓库目录中执行：

```sh
pnpm dsh plugin --profile web add github:TinyPanda168/SpecsRelay-DSH
```

安装后重启 DSH WebUI。还需要将包内的 `browser-bridge/` 目录作为未打包 Chromium 扩展安装一次，用于读取跨域的 DeepSeek iframe。该专用桥接没有通用 AI 侧栏，与 Chrome 商店版是分开的产品入口。

### 使用方式

1. 在 DSH 中选择 Workspace，并创建或打开一个会话。
2. 点击会话顶部的 **DeepSeek** 页签，或者点击左侧栏底部的 SpecsRelay 图标切换到该页签。
3. 在 DSH 页签内登录并使用 DeepSeek 网页端。
4. 点击 **获取当前对话**，只在本地抓取当前 DeepSeek 完整对话，不调用整理模型。
5. 首次打开 **总结设置**，填写 SpecsRelay-DSH 独立使用的 DeepSeek API Key 和模型；0.3 版本固定调用 DeepSeek 官方 API 地址。
6. 点击 **总结为需求**；如尚未抓取则自动抓取，然后调用该整理模型，并在 DeepSeek 右侧显示结构化总结。
7. 检查总结后点击 **载入当前 DSH 草稿**。插件不会自动发送。
8. **交接记录** 仅用于查看其他 SpecsRelay 入口发送来的交接内容。

输入框旁边的 **DeepSeek Relay** 操作仍可载入最新的已验证交接内容，但不会自动发送。

### 本地开发

可以直接安装 SpecsRelay 仓库中同步维护的版本：

```sh
pnpm dsh plugin --profile web add /absolute/path/to/SpecsRelay/plugins/dsh-deepseek
```

### 0.3 版本边界

- 当前支持范围是 DSH 官方 WebUI profile。
- DeepSeek 官方网页是否允许 iframe 嵌入由 DeepSeek 决定；浏览器新页入口仅在 DSH 浏览器桥接不可用时作为备用方案。
- DSH 插件不会接触 DeepSeek Cookie 或账号凭证。只有用户点击后，浏览器扩展桥接才读取当前 DeepSeek iframe。
- 获取对话只在本地完成；只有点击 **总结为需求** 后，对话文本才会发送给已配置的需求整理模型。
- DSH 模式不会打开或依赖通用 SpecsRelay 浏览器侧栏；包内的专用桥接只负责跨域抓取和 DSH 独立的 DeepSeek 整理配置。
- 只有交接内容的项目路径与当前 DSH Workspace 一致时，才能载入草稿。
- 载入操作只修改 DSH 草稿，不会自动发送，也不会启动模型会话。
