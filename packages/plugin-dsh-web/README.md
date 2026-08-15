# @dsh-skins/plugin-dsh-web

DSH Web 的可信皮肤宿主插件。它读取经过校验的声明式 DshSkin 数据，通过 DSH 原生 `theme.overrideTokens` 应用浅色/深色色板，通过 `shell.overlay` 渲染角色状态，并在设置的“通用”页面提供启用、角色显示和五状态验证入口。选择写入插件拥有的 Host 设置域；由于当前 DSH 通用设置 RPC 不自动暴露第三方命名空间，浏览器通过插件自带的同源、仅回环地址端点读写这一设置域。

皮肤包本身仍然不执行 JavaScript 或 CSS。此插件是唯一的可信代码层，卸载时由 Cordis 生命周期恢复主题层、设置订阅和 UI 注册。

## 本地构建与安装

从 DshSkin 仓库根目录运行：

```sh
pnpm --filter @dsh-skins/plugin-dsh-web build
dsh plugin --profile web add ./packages/plugin-dsh-web
dsh --profile web
```

当前包内置原创“蓝鲸航员”作为第一阶段兼容性验证皮肤。Small-tailqwq/dsh-deep-whale 不包含在包内，也不会被插件下载。

## 第一阶段状态映射

- 当前会话运行中：`thinking`
- 运行结束后 1.6 秒：`success`
- 其他时间：`idle`
- `tool` 与 `error`：可从设置行手动选择，用于验证五张原创状态图

后续版本会在 DSH 提供稳定的根级工具/错误状态投影后，把 `tool` 与 `error` 接入自动模式。
