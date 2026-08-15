# SpecsRelay for DeepSeek

[English](#english) | [简体中文](#简体中文)

## English

DeepSeek-first companion plugin for DeepSeek Harness. It receives validated SpecsRelay handoffs over a token-authenticated loopback bridge, shows them in an in-app inbox, and loads the selected prompt into the current DSH draft without submitting it.

### Install from GitHub

From a DeepSeek Harness checkout:

```sh
pnpm dsh plugin --profile web add github:TinyPanda168/SpecsRelay-DSH
```

Restart DeepSeek Harness after installation. The sidebar footer exposes **SpecsRelay**, and each active conversation includes a **DeepSeek Relay** shortcut near the send controls.

### Local development

The synchronized copy inside the SpecsRelay repository can be installed directly:

```sh
pnpm dsh plugin --profile web add /absolute/path/to/SpecsRelay/plugins/dsh-deepseek
```

### First-version boundaries

- The source product is SpecsRelay and the target is DeepSeek Harness.
- The DSH project path must match the project selected in SpecsRelay before a draft can be loaded.
- The plugin never submits the draft or starts a model turn.
- Raw browser conversations and provider API keys never enter DSH.
- If the plugin is unavailable, SpecsRelay keeps the existing clipboard handoff.

## 简体中文

这是面向 DeepSeek Harness 的 SpecsRelay 配套扩展。它通过带令牌认证的本机回环桥接接收经过验证的 SpecsRelay 交接内容，在 DSH 内显示收件箱，并将选中的提示词载入当前 DSH 草稿，但不会自动发送。

### 从 GitHub 安装

在 DeepSeek Harness 仓库目录中执行：

```sh
pnpm dsh plugin --profile web add github:TinyPanda168/SpecsRelay-DSH
```

安装后重启 DeepSeek Harness。左侧栏底部会显示 **SpecsRelay** 入口，每个活动会话的发送控件附近也会显示 **DeepSeek Relay** 快捷入口。

### 本地开发

可以直接安装 SpecsRelay 仓库中同步维护的版本：

```sh
pnpm dsh plugin --profile web add /absolute/path/to/SpecsRelay/plugins/dsh-deepseek
```

### 首个版本的范围

- 来源产品是 SpecsRelay，目标客户端是 DeepSeek Harness。
- 载入草稿前，DSH 的项目路径必须与 SpecsRelay 中选择的项目一致。
- 本扩展不会自动发送草稿，也不会启动模型会话。
- 浏览器原始对话和服务商 API 密钥不会进入 DSH。
- 如果 DSH 扩展不可用，SpecsRelay 会继续使用现有的剪贴板交接方式。
