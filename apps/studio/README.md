# DshSkin Studio

独立的浏览器端皮肤预览器和编辑器。Studio 在隔离 iframe 中创建一套 DSH 风格界面，并通过 `@dsh-skins/adapter-dsh-web` 应用皮肤，因此预览验证的是实际适配器行为，不是另一套临时渲染规则。

## 启动

```sh
pnpm studio
```

打开 `http://127.0.0.1:5173/`。

## 当前能力

- 亮色与暗色语义 token 实时编辑。
- `idle`、`thinking`、`tool`、`success`、`error` 五种角色状态切换。
- 11 个标准设计部位的本地栅格素材替换，替换时检查 MIME、尺寸、宽高比和单文件体积。
- 从浏览器目录选择器导入一个完整皮肤目录。
- 导出只含 `skin.json` 和被引用栅格文件的 `.dshskin` ZIP，不打包脚本、CSS 或未引用文件。

Studio 负责交互式协议校验。发布前仍需运行 `pnpm skin validate <skin-directory>`，由 CLI 检查真实文件头、符号链接、路径、总包体积和 Registry 一致性。
