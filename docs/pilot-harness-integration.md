# SpecsRelay × Pilot Harness 本地集成记录

## 目标

Pilot Harness 仅作为桌面客户端底座。SpecsRelay 配套版保留 Pilot Harness 原有名称、主题、工作区、Agent、模型、会话与更新行为，只增加 SpecsRelay 完整工作流所需的原生网页能力，并把现有 SpecsRelay DSH 插件安装到 Pilot 使用的 `web` profile。

本集成不会向 `op7418/pilot-harness` 提交功能分支，也不要求 SpecsRelay 制作 Pilot 专用 bundle。Pilot 上游仓库和公开安装包仍由原作者独立维护。

## 基线

- Pilot Harness 上游：`https://github.com/op7418/pilot-harness`
- 当前本地基线提交：`dbcf586d537d72a933614423e2735930d55d8271`
- 本地集成工作区：`/Users/tinypanda/Desktop/Gameprodecer/PilotHarness`
- SpecsRelay 插件源：`/Users/tinypanda/Desktop/Gameprodecer/SpecsRelay-DSH`

## 允许的差异

1. Pilot Electron 提供 `ctx.desktopWebPanels`，用沙箱化 `WebContentsView` 承载真实 DeepSeek 网页。
2. Harness 子进程与 Electron 主进程通过私有 IPC 处理注册、显示、隐藏、刷新、抓取和释放。
3. Pilot 使用的本地 `DSH_HOME` 安装并挂载现有 SpecsRelay 插件。
4. 增加与上述能力直接相关的测试、维护文档和许可证记录。

除此之外，不调整 Pilot 的界面布局、视觉品牌、Agent 行为、模型配置、会话结构或普通插件机制。

## 当前验证

- 同一份 SpecsRelay bundle 已在 Pilot `web` profile 中完成真实注册和就绪烟测。
- 原生网页服务 38 项测试通过，语句、分支、函数和行覆盖率均为 100%。
- Pilot Desktop 相关测试 16 项通过。
- 完整构建和 28 项文档门禁通过。

## 下一步

1. 在本地生成一份未发布的 Pilot Harness 应用构建。
2. 将 SpecsRelay 安装到该应用实际使用的 `DSH_HOME` 和 `web` profile。
3. 人工验证：登录 DeepSeek、打开对话、整理需求、选择项目、载入并发送到 DSH。
4. 体验确认后，再决定是否建立独立的 SpecsRelay Pilot 配套发行仓库；不向 Pilot 上游提交本集成。
