# 鲸鱼娘皮肤兼容性验证

## 验证对象

- 兼容性参照：[`Small-tailqwq/dsh-deep-whale`](https://github.com/Small-tailqwq/dsh-deep-whale) 的 `maid-atelier`。
- 便携验证皮肤：[`skins/blue-whale-navigator`](../skins/blue-whale-navigator/skin.json)。
- 预览客户端：[`apps/studio`](../apps/studio/README.md) 内的 DSH Web 参考适配器。

`maid-atelier` 以 CC BY-NC-SA 4.0 发布，包含第三方角色形象的衍生创作署名链。DshSkin 仓库没有复制它的图片、CSS、TypeScript 或构图；“蓝鲸航员”从新的角色说明生成，来源记录见 [`PROVENANCE.md`](../skins/blue-whale-navigator/PROVENANCE.md)。

## 兼容性结论

| 能力 | `maid-atelier` 实现 | DshSkin v1 结果 |
|---|---|---|
| 明暗主题 | CSS 覆盖和 DOM 主题观察 | 两套完整语义 palette，可移植 |
| 角色装饰 | 两名固定角色和客户端选择器 | 一个标准角色层，所有支持该能力的客户端可映射 |
| Agent 状态 | 客户端脚本预留动画钩子 | 五个声明式角色状态已实图验证 |
| 界面装饰 | 多个自定义挂载节点和大量 CSS | v1 仅支持 11 个标准部位，复杂蕾丝和局部边框会降级 |
| 生命周期 | 插件负责 MutationObserver、节点和样式回收 | 适配器统一负责激活、切换和恢复 |
| 分发与商业使用 | CC BY-NC-SA 4.0，禁止商业使用 | 原创验证素材按 MIT 声明，可在登记权利后商业使用 |
| 客户端范围 | 当前 DSH Web DOM | 同一皮肤包可由 Web、Electron、原生或 TUI 适配器选择性消费 |

因此，现有 `maid-atelier` 不能不经转换直接作为可商业销售的通用皮肤；它适合验证高级 Web 插件能力。DshSkin 的“蓝鲸航员”验证了安全便携层：语义 token、头像和五个角色状态能够在不执行皮肤代码的前提下加载与切换。复杂客户端专属装饰应留在受信任插件层，不能放进通用皮肤包。

## 已执行验收

```sh
pnpm run build
pnpm run test
node packages/cli/dist/bin.js validate skins/blue-whale-navigator
node packages/cli/dist/bin.js registry registry/registry.json
pnpm studio
```

浏览器验收覆盖：默认皮肤加载、亮/暗 palette、五个角色状态逐一切换、语义强调色实时编辑，以及实际 DSH Web token 与标准 token 同步。文件级校验确认五张角色图均为 1254×1254 RGBA PNG，满足 `character.*` 的尺寸、宽高比和 5 MB 单文件限制。
