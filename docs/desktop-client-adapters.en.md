# SpecsRelay desktop client adapters

SpecsRelay ships one DSH plugin bundle. The installer identifies each desktop client and selects its DSH profile and data directory, while the desktop adapter owns the real DeepSeek page. Conversation capture, organization, clarification, and delivery remain in the same SpecsRelay bundle.

## Unified install entry

```sh
npx --yes github:TinyPanda168/SpecsRelay-DSH install
```

The installer scans supported applications and installs into every detected target. It distinguishes same-name applications by `CFBundleIdentifier` on macOS and unpacked application metadata on Windows. Portable or non-standard locations can add `--app <path>`; `--dry-run` only prints detection and installation plans.

## Client mapping

| Adapter | Application identity | Profile | Default DSH_HOME | Native page source |
| --- | --- | --- | --- | --- |
| `dsh-desktop` | `ai.deepseek.dsh.desktop` | `desktop` | `~/.dsh` | Existing client `desktopWebPanels` Host |
| `pilot-harness` | `com.codepilot.pilotharness` | `web` | Electron `userData/harness` | Pilot native Host |
| `dataelement-dsh-desktop` | `io.dsh.desktop` | `web` | Electron `userData/harness` | SpecsRelay child-process bridge |
| `myyang-dsh-desktop` | `com.deepseek.dsh.desktop` | `web` | `~/.dsh` | SpecsRelay child-process bridge, local backend only |

The DataElement and myYangyunfan adapters send a narrow page-lifecycle vocabulary over Node child-process IPC. Electron owns the sandboxed `WebContentsView`, persistent sign-in partition, allowed origins, bounds, and disposal. The DSH plugin receives neither Electron objects nor general main-process access.

The WSL-managed backend in the myYangyunfan client does not run as an Electron-owned local Node child and therefore cannot establish this local IPC channel. Its ordinary local backend remains supported.

## Distribution boundary

The unified installer does not modify desktop application executables. Pilot, DataElement, and myYangyunfan first require a SpecsRelay companion build containing the relevant native Host adapter; the installer then places the same plugin into the correct DSH profile. Until an upstream public package includes that Host, installing the plugin alone cannot add native-page support to it.
