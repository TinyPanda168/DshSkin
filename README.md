# SpecsRelay for DeepSeek

[English](#english) | [简体中文](#简体中文)

## English

SpecsRelay for DeepSeek is a companion plugin for the official DeepSeek Harness WebUI. It keeps a signed-in DeepSeek web session and the SpecsRelay requirement workbench in one DSH tab.

The workflow has one source and two visible steps:

1. Capture the current DeepSeek conversation, then organize, clarify, or review it with the DeepSeek model and requirement-analysis Skill already supplied by DSH.
2. Check the active project directory and generated prompt, then load it into the current DSH draft. Nothing is submitted automatically.

### Install

From a DeepSeek Harness checkout:

```sh
pnpm dsh plugin --profile web add github:TinyPanda168/SpecsRelay-DSH
```

Restart the DSH WebUI after installation. No browser extension, developer mode, external service, or separate model API Key is required. The plugin opens DeepSeek through DSH and keeps its signed-in session in a private local profile.

### Use

1. Open or create a DSH session with a Workspace.
2. Select the **DeepSeek** tab or the SpecsRelay icon at the bottom of the sidebar.
3. Sign in to DeepSeek in the left pane and open the conversation to relay.
4. Select **Add current conversation as source**.
5. Select **Integrate and strengthen sources**. Clarification and review remain available when needed.
6. Check the project directory and prompt, then select **Load current version into DSH draft**.

On a tablet, the DeepSeek and SpecsRelay panes become two tabs. Both use the DSH WebUI origin, so the tablet never needs direct access to a loopback port on the host Mac.

### Data and execution boundaries

- The DeepSeek page and its interaction stream stay on the existing DSH WebUI origin.
- A private local profile preserves the DeepSeek login. SpecsRelay does not read or store the account password.
- Capturing stores one current DeepSeek conversation locally and does not call a model.
- Integrate, clarify, revise, and review are the only actions that send captured text to the DSH-configured DeepSeek model.
- The registered `specsrelay-requirement-analysis` Skill is internal to this workflow and does not need separate installation or configuration.
- Loading changes only the DSH input draft. It never sends the prompt or starts an Agent turn.
- Manual paste remains only as an emergency fallback.

### Local development

```sh
pnpm dsh plugin --profile web add /absolute/path/to/SpecsRelay/plugins/dsh-deepseek
```

For local development, restart the DSH WebUI after adding the plugin.

## 简体中文

SpecsRelay for DeepSeek 是面向 DeepSeek Harness 官方 WebUI 的配套插件。它把已登录的 DeepSeek 网页和 SpecsRelay 需求工作台放在同一个 DSH 页签中。

界面只保留一个来源和两个步骤：

1. 抓取当前 DeepSeek 对话，再使用 DSH 已提供的 DeepSeek 模型和需求分析 Skill 进行整理、澄清或评审。
2. 核对当前项目目录和生成的提示词，然后载入当前 DSH 草稿。插件不会自动发送。

### 安装

在 DeepSeek Harness 仓库目录中执行：

```sh
pnpm dsh plugin --profile web add github:TinyPanda168/SpecsRelay-DSH
```

安装后重启 DSH WebUI。不需要浏览器扩展、开发者模式、外部服务，也不需要另外填写模型 API Key。插件会直接通过 DSH 打开 DeepSeek，并在本机私有资料中保留登录状态。

### 使用方式

1. 在 DSH 中打开或创建一个已经关联 Workspace 的会话。
2. 点击 **DeepSeek** 页签，或点击左侧栏底部的 SpecsRelay 图标。
3. 在左侧登录 DeepSeek，并打开需要交接的对话。
4. 点击 **添加当前对话为来源**。
5. 点击 **整合并强化来源**；需要时再进行需求澄清或评审。
6. 核对项目目录和提示词，然后点击 **载入当前版本到 DSH 草稿**。

在平板上，DeepSeek 和 SpecsRelay 会变为两个切换页签。两边都通过 DSH WebUI 的同一地址访问，平板不需要直接连接 Mac 的本机端口。

### 数据与执行范围

- DeepSeek 页面和交互画面都通过现有 DSH WebUI 地址访问。
- 本机私有资料会保留 DeepSeek 登录状态；SpecsRelay 不读取或保存账号密码。
- 抓取只在本地保存当前一份 DeepSeek 对话，不调用模型。
- 只有整合、澄清、修订和评审会把对话文本交给 DSH 已配置的 DeepSeek 模型。
- 内置 `specsrelay-requirement-analysis` Skill 只服务于这条工作流，不需要用户另外安装或配置。
- 载入只会修改 DSH 输入草稿，不会自动发送，也不会启动 Agent 回合。
- 手动粘贴只作为应急备用方式保留。

### 本地开发

```sh
pnpm dsh plugin --profile web add /absolute/path/to/SpecsRelay/plugins/dsh-deepseek
```

本地添加插件后，重启 DSH WebUI 即可测试。
