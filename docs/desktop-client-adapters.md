# SpecsRelay 桌面客户端适配器

SpecsRelay 只发行一份 DSH 插件。安装器负责识别桌面客户端、选择该客户端使用的 DSH profile 与数据目录；桌面客户端适配器负责承载真实 DeepSeek 网页。需求抓取、整理、澄清和发送逻辑始终由同一个 SpecsRelay bundle 提供。

## 统一安装入口

```sh
npx --yes github:TinyPanda168/SpecsRelay-DSH install
```

安装器会扫描已安装的受支持客户端并逐个安装。macOS 通过 `CFBundleIdentifier` 区分同名应用；Windows 读取解包后的应用元数据。便携版或非标准路径可以增加 `--app <path>`，`--dry-run` 只显示识别和安装计划。

## 客户端映射

| 适配器 | 应用标识 | profile | 默认 DSH_HOME | 原生网页来源 |
| --- | --- | --- | --- | --- |
| `dsh-desktop` | `ai.deepseek.dsh.desktop` | `desktop` | `~/.dsh` | 客户端现有 `desktopWebPanels` Host |
| `pilot-harness` | `com.codepilot.pilotharness` | `web` | Electron `userData/harness` | Pilot 原生 Host |
| `dataelement-dsh-desktop` | `io.dsh.desktop` | `web` | Electron `userData/harness` | SpecsRelay 子进程桥 |
| `myyang-dsh-desktop` | `com.deepseek.dsh.desktop` | `web` | `~/.dsh` | SpecsRelay 子进程桥，仅本机后端 |

DataElement 与 myYangyunfan 适配器通过 Node 子进程 IPC 发送一组受限的页面生命周期操作。Electron 主进程持有沙箱 `WebContentsView`、持久登录 partition、允许来源、显示范围和销毁过程；DSH 插件不会获得 Electron 对象或任意主进程权限。

myYangyunfan 客户端的 WSL 托管后端不在 Electron 的本机 Node 子进程中运行，当前不能建立这条本机 IPC，因此不会声明原生网页能力。普通本机后端保持支持。

## 发行边界

统一安装器不会修改桌面客户端可执行文件。Pilot、DataElement 和 myYangyunfan 需要先使用包含对应原生 Host 适配器的 SpecsRelay 配套构建；安装器随后只负责把同一份插件装入正确的 DSH profile。上游公开安装包在合入该 Host 之前不会因为单独安装插件而自动获得原生网页能力。
