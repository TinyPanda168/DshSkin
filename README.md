# SpecsRelay for DeepSeek

面向 DSH Desktop 的开源 DeepSeek → DSH 需求交接插件。
一键抓取完整对话，自动整理需求，直接交给目标项目的 Agent。
在 DeepSeek 中讨论，在 DSH 中继续实现。

_社区维护的第三方开源项目，并非 DeepSeek 官方产品，也不是 DSH Desktop 的内置插件。_

简体中文 | [English](README.en.md)

![SpecsRelay 将 DeepSeek 对话整理为需求并发送到 DSH Agent](https://raw.githubusercontent.com/TinyPanda168/SpecsRelay-DSH/main/assets/specsrelay-dsh-hero.png)

SpecsRelay for DeepSeek 是一款专为 DSH Desktop 设计的开源需求交接插件，用于打通 DeepSeek 网页对话到本地 DSH 项目开发的完整链路。插件会在 DSH 内嵌入真实、可登录的 DeepSeek 网页，并在旁侧提供常驻的 SpecsRelay 工作台。用户可以从任意 DeepSeek 对话出发，一键抓取完整多轮上下文，再复用 DSH 已配置的 DeepSeek 模型和内置需求分析 Skill，将讨论自动整理为结构化、可执行、可交接的开发需求。

如果整理结果仍存在会影响产品实现的边界问题，SpecsRelay 才会要求用户补充确认；需求已经清晰时则直接进入交接。选择目标项目后，插件会把最终需求发送到对应的 DSH 会话并启动 Agent。整个过程不需要浏览器扩展、手动复制粘贴、Docker、额外 API Key 或第三方服务，让“在 DeepSeek 中讨论方案”自然衔接到“在 DSH 中继续实现”。

## 推荐运行环境

优先配合 [anywhere-labs 开源的 DSH Desktop](https://github.com/anywhere-labs/deepseek-harness-desktop) 使用。它把 DeepSeek Harness 的本地 Web UI、Host 服务和插件系统带进原生桌面应用，并提供 SpecsRelay 所需的原生 DeepSeek 网页面板，可保留完整登录体验并直接抓取当前对话。请先按照 DSH Desktop 仓库中的下载与安装说明完成桌面端安装，再添加本插件。普通浏览器版 DSH WebUI 无法提供这块原生面板。

## 适用场景

- 把 DeepSeek 中已经聊清楚的产品或功能方案，整理成可直接交给 DSH 项目执行的需求。
- 自动保留完整多轮对话，不需要复制粘贴，也不需要安装浏览器扩展。
- 直接复用 DSH 已配置的 DeepSeek 模型，不需要另填模型 API Key、安装 Docker 或注册第三方平台。
- 在同一条流程中选择目标项目、补充真正影响结果的边界问题，并启动 DSH Agent。

界面只保留一个来源和三个步骤：

1. 抓取当前 DeepSeek 对话，再使用 DSH 已提供的 DeepSeek 模型和需求分析 Skill 完成整理与内部检查。
2. 仅在存在会影响产品结果的待确认项时回答补充问题；需求清晰时不展示这一环节。
3. 选择或核对目标项目目录和生成的提示词，然后发送到该项目的 DSH 会话并启动 Agent。

## 安装

在 DSH Desktop 终端或 DeepSeek Harness 仓库目录中执行：

```sh
pnpm dsh plugin --profile desktop add github:TinyPanda168/SpecsRelay-DSH
```

安装后重启 DSH Desktop。不需要浏览器扩展、开发者模式、Docker、外部服务，也不需要另外填写模型 API Key。DSH Desktop 会在沙箱原生网页面板中打开 DeepSeek，并用隔离的持久 partition 保留登录状态。

## 使用方式

1. 在 DSH 中打开或创建一个已经关联 Workspace 的会话。
2. 点击左侧栏底部的 SpecsRelay 图标，打开需求交接工作区。
3. 在左侧登录 DeepSeek，并打开需要交接的对话。
4. 点击 **整理当前对话**；SpecsRelay 会抓取完整对话，并立即使用 DSH 模型和 Skill 自动整理。
5. 检查整理后的需求，并回答待确认问题；需求未补充完整时不能进入载入步骤。
6. 选择或核对项目目录，确认发送后会启动 Agent，然后点击 **发送到 DSH 并开始处理**。

## 数据与执行范围

- 左侧是真实 `WebContentsView`，不是截图或远程控制画面流。
- 隔离的原生 session 会保留 DeepSeek 登录状态；SpecsRelay 不读取或保存账号密码。
- Node integration 与 preload 访问保持关闭；主 frame 导航仅允许 `https://chat.deepseek.com`。
- 只有点击 **整理当前对话** 后才会执行 DOM 抓取；加载、显示和调整网页尺寸都不会抓取。
- 同一次操作会先在本地保存当前对话，再把它交给 DSH 已配置的 DeepSeek 模型完成整理与内部检查；澄清和修订沿用同一模型链路，不再提供单独的评审操作。
- 内置 `specsrelay-requirement-analysis` Skill 只服务于这条工作流，不需要用户另外安装或配置。
- 主流程的 **发送到 DSH 并开始处理** 会通过 DSH 原生输入接口写入需求，再走与 DSH 发送按钮相同的提交链路。
- 需求和项目目录就绪后，SpecsRelay 会在后台提前准备目标 DSH 会话。最终点击只执行本地写入、提交和切换；开发版本会记录点击到提交的耗时，便于验证是否达到一帧内完成。
- 恢复执行快照或载入收件箱内容仍然只恢复 DSH 草稿，不会再次启动 Agent。

## 本地开发

```sh
pnpm dsh plugin --profile desktop add /absolute/path/to/SpecsRelay/plugins/dsh-deepseek
```

本地添加插件后，重启 DSH Desktop 即可测试。普通 WebUI 无法提供原生 DeepSeek 面板，会明确提示需要 DSH Desktop。

## 与相关项目的关系

- [DeepSeek Harness](https://github.com/deepseek-ai/DeepSeek-Harness) 提供核心 Agent、模型、会话、Web UI 和插件系统。SpecsRelay 通过其插件机制安装，不修改上游源码。
- [DSH Desktop](https://github.com/anywhere-labs/deepseek-harness-desktop) 是推荐使用的社区桌面客户端，负责提供原生窗口和 DeepSeek 网页面板。SpecsRelay 需要单独安装，并非其内置功能。
- 本仓库只包含 SpecsRelay 的 DSH 插件发行文件，用于 DeepSeek 网页对话到 DSH 项目的需求交接链路。

## 特别感谢

感谢 DeepSeek Harness、DSH Desktop 及其社区提供的插件基础、桌面能力和持续维护，也感谢 [AI Chat Exporter](https://github.com/TheBluCoder/AI-chat-exporter) 提供可参考的开源对话提取实现。第三方代码与许可证说明见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。

## License

本项目遵循 [MIT License](LICENSE)。DeepSeek 是 DeepSeek AI 的商标；SpecsRelay-DSH 是独立的社区项目，与 DeepSeek 官方没有隶属关系，也未获得其背书。
