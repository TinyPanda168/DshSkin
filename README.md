# SpecsRelay for DeepSeek

简体中文 | [English](README.en.md)

SpecsRelay for DeepSeek 是面向 DSH Desktop 的配套插件。它把真实、已登录的 DeepSeek 网页和 SpecsRelay 需求工作台放在同一个 DSH 页签中。

## 推荐运行环境

优先配合 [anywhere-labs 开源的 DSH Desktop](https://github.com/anywhere-labs/deepseek-harness-desktop) 使用。它提供 SpecsRelay 所需的原生 DeepSeek 网页面板，可保留完整登录体验并直接抓取当前对话。普通浏览器版 DSH WebUI 无法提供这块原生面板。

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
2. 点击 **DeepSeek** 页签，或点击左侧栏底部的 SpecsRelay 图标。
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
