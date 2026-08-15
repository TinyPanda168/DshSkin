# DshSkins

DshSkins 是面向 DeepSeek Harness 生态的客户端无关皮肤协议、适配器 SDK、创作者工具和开放皮肤索引。皮肤包只包含声明式 JSON 与本地栅格素材，不包含 JavaScript、CSS、模型提示词或工具权限。

## 兼容模型

```text
                         ┌─ 官方 DSH Web UI
skin.json + assets ─SDK─┼─ Electron/Web 封装客户端
                         ├─ 原生桌面客户端适配器
                         └─ 其他渲染器适配器
```

同一皮肤包可以被所有实现相应协议能力的客户端读取。复用官方 DSH Web UI 的客户端共用 `@dsh-skins/adapter-dsh-web`；其他客户端只需把语义 token 和标准素材部位映射到自己的界面。

## 仓库内容

- `packages/spec`：JSON Schema、TypeScript 类型、设计部位目录、安全校验、能力协商与素材回退。
- `packages/adapter-dsh-web`：官方 DSH Web UI 及其桌面封装的参考适配器。
- `packages/cli`：创作者和 registry 校验命令。
- `creator-kit`：供生图 Agent 使用的受限创作流程与交付清单。
- `skins`：可审核的皮肤源目录。
- `registry`：不包含价格和支付信息的开放源索引。

## 本地验证

```sh
pnpm install
pnpm run check
```

查看标准设计部位：

```sh
pnpm skin catalog --json
```

## 设计边界

- 皮肤只改变视觉，不改变 Agent 人格、系统提示词、模型、工具或权限。
- 协议不允许远程素材、任意 CSS、SVG 或可执行脚本。
- 商店价格、订单、分成和退款属于独立商业服务，不写入可移植皮肤包。
- AI 生成来源、版权声明、许可证和商业使用许可随皮肤清单一起分发。

协议与扩展方式见 [`docs/protocol.md`](docs/protocol.md) 和 [`docs/client-adapters.md`](docs/client-adapters.md)。

## License

工具与协议代码采用 MIT License。每款皮肤在自己的目录中单独声明素材许可证。
