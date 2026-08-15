# SpecsRelay for DeepSeek

[English](#english) | [简体中文](#简体中文)

## English

SpecsRelay companion for the official DeepSeek Harness WebUI. Version 0.2 adds a **DeepSeek** conversation tab that loads the official DeepSeek web app inside the DSH session. Validated SpecsRelay handoffs remain available as a secondary record panel and can be loaded into the current DSH draft only after a user click.

### Install from GitHub

From a DeepSeek Harness checkout:

```sh
pnpm dsh plugin --profile web add github:TinyPanda168/SpecsRelay-DSH
```

Restart the DSH WebUI after installation.

### Use

1. Select a DSH Workspace and create or open a session.
2. Select the **DeepSeek** tab above the conversation, or use the SpecsRelay icon in the sidebar footer to switch to it.
3. Sign in to the DeepSeek web app and use it inside the DSH tab.
4. Open **Handoff records** only when you need to inspect a validated SpecsRelay handoff or load it into the current DSH draft.

The **DeepSeek Relay** action beside the composer still loads the newest validated handoff without submitting it.

### Local development

The synchronized copy inside the SpecsRelay repository can be installed directly:

```sh
pnpm dsh plugin --profile web add /absolute/path/to/SpecsRelay/plugins/dsh-deepseek
```

### Version 0.2 boundaries

- The supported surface is the official DSH WebUI profile.
- DeepSeek controls whether its web app permits iframe embedding. The tab provides an explicit new-browser-tab fallback when embedding is refused.
- The DSH plugin cannot read the cross-origin DeepSeek page, cookies, account credentials, or raw conversations.
- A handoff is loaded only when its project path matches the active DSH Workspace.
- Loading a handoff changes the DSH draft only. It never submits the draft or starts a model turn.

## 简体中文

这是面向 DeepSeek Harness 官方 WebUI 的 SpecsRelay 配套扩展。0.2 版本会在 DSH 会话中增加真正的 **DeepSeek** 页签，并在页签内加载 DeepSeek 官方网页。经过验证的 SpecsRelay 交接内容会保留为次要的交接记录面板，只有用户点击后才会载入当前 DSH 草稿。

### 从 GitHub 安装

在 DeepSeek Harness 仓库目录中执行：

```sh
pnpm dsh plugin --profile web add github:TinyPanda168/SpecsRelay-DSH
```

安装后重启 DSH WebUI。

### 使用方式

1. 在 DSH 中选择 Workspace，并创建或打开一个会话。
2. 点击会话顶部的 **DeepSeek** 页签，或者点击左侧栏底部的 SpecsRelay 图标切换到该页签。
3. 在 DSH 页签内登录并使用 DeepSeek 网页端。
4. 只有需要查看已经整理的 SpecsRelay 交接内容或载入 DSH 草稿时，才打开 **交接记录**。

输入框旁边的 **DeepSeek Relay** 操作仍可载入最新的已验证交接内容，但不会自动发送。

### 本地开发

可以直接安装 SpecsRelay 仓库中同步维护的版本：

```sh
pnpm dsh plugin --profile web add /absolute/path/to/SpecsRelay/plugins/dsh-deepseek
```

### 0.2 版本边界

- 当前支持范围是 DSH 官方 WebUI profile。
- DeepSeek 官方网页是否允许 iframe 嵌入由 DeepSeek 决定；若拒绝嵌入，页签提供明确的浏览器新页回退入口。
- DSH 扩展无法读取跨域的 DeepSeek 页面、Cookie、账号凭证或原始对话。
- 只有交接内容的项目路径与当前 DSH Workspace 一致时，才能载入草稿。
- 载入操作只修改 DSH 草稿，不会自动发送，也不会启动模型会话。
