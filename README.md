# SpecsRelay for DeepSeek

DeepSeek-first companion plugin for DeepSeek Harness. It receives validated SpecsRelay handoffs over a token-authenticated loopback bridge, shows them in an in-app inbox, and loads the selected prompt into the current DSH draft without submitting it.

## Install from GitHub

From a DeepSeek Harness checkout:

```sh
pnpm dsh plugin --profile web add github:TinyPanda168/SpecsRelay-DSH
```

Restart DeepSeek Harness after installation. The sidebar footer exposes **SpecsRelay**, and each active conversation includes a **DeepSeek Relay** shortcut near the send controls.

## Local development

The synchronized copy inside the SpecsRelay repository can be installed directly:

```sh
pnpm dsh plugin --profile web add /absolute/path/to/SpecsRelay/plugins/dsh-deepseek
```

## First-version boundaries

- The source product is SpecsRelay and the target is DeepSeek Harness.
- The DSH project path must match the project selected in SpecsRelay before a draft can be loaded.
- The plugin never submits the draft or starts a model turn.
- Raw browser conversations and provider API keys never enter DSH.
- If the plugin is unavailable, SpecsRelay keeps the existing clipboard handoff.
