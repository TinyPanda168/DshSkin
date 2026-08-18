# SpecsRelay for DeepSeek

An open-source DeepSeek → DSH requirement handoff plugin for DSH Desktop.
Capture the complete conversation, organize the requirement, and hand it directly to the target project's Agent.
Discuss in DeepSeek, continue implementation in DSH.

_This is a community-maintained third-party open-source project. It is not an official DeepSeek product or a built-in DSH Desktop plugin._

[简体中文](README.md) | English

![SpecsRelay organizes a DeepSeek conversation and sends it to a DSH Agent](https://raw.githubusercontent.com/TinyPanda168/SpecsRelay-DSH/main/assets/specsrelay-dsh-hero.png)

SpecsRelay for DeepSeek is an open-source requirement handoff plugin built specifically for DSH Desktop. It connects DeepSeek web conversations to local DSH project development in one continuous workflow. The plugin embeds the real, sign-in-capable DeepSeek website inside DSH and keeps the SpecsRelay workbench beside it. From any DeepSeek conversation, users can capture the complete multi-turn context with one action, then reuse the DeepSeek model already configured in DSH and the bundled requirement-analysis Skill to turn the discussion into a structured, actionable requirement ready for delivery.

SpecsRelay asks for clarification only when an unresolved product decision would materially affect implementation; clear requirements proceed directly to delivery. After the target project is selected, the plugin sends the finalized requirement to that project's DSH session and starts the Agent. The complete path from discussing a solution in DeepSeek to implementing it in DSH requires no browser extension, manual copy and paste, Docker service, separate API Key, or third-party platform.

## Recommended host

Use this plugin with [DSH Desktop by anywhere-labs](https://github.com/anywhere-labs/deepseek-harness-desktop). It brings the local DeepSeek Harness Web UI, Host service, and plugin system into a native desktop application. Its native DeepSeek panel provides the complete signed-in website experience and direct conversation capture required by SpecsRelay. Install the desktop client by following the download and installation instructions in the DSH Desktop repository before adding this plugin. The ordinary browser-based DSH WebUI cannot provide this native panel.

## Use cases

- Turn a product or feature discussion in DeepSeek into an implementation-ready requirement for a DSH project.
- Preserve the complete multi-turn conversation without copying and pasting it or installing a browser extension.
- Reuse the DeepSeek model already configured in DSH; no separate model API Key, Docker service, or third-party account is required.
- Select the target project, review any material clarification questions, and start the DSH Agent from the same workflow.

The workflow has one source and three visible steps:

1. Capture the current DeepSeek conversation, then organize and internally review it with the DeepSeek model and requirement-analysis Skill already supplied by DSH.
2. Answer any material product questions that appear. This step stays hidden when the requirement is already clear.
3. Select or confirm the target project directory and generated prompt, then send it to that project's DSH session to start the Agent.

## Install

From the DSH Desktop terminal or a DeepSeek Harness checkout:

```sh
pnpm dsh plugin --profile desktop add github:TinyPanda168/SpecsRelay-DSH
```

Restart DSH Desktop after installation. No browser extension, developer mode, Docker, external service, or separate model API Key is required. DSH Desktop opens DeepSeek in a sandboxed native Web panel and keeps its signed-in session in an isolated persistent partition.

## Use

1. Open or create a DSH session with a Workspace.
2. Select the SpecsRelay icon at the bottom of the sidebar to open the handoff workspace.
3. Sign in to DeepSeek in the left pane and open the conversation to relay.
4. Select **Organize current conversation**. SpecsRelay captures the complete conversation and immediately organizes it with the DSH model and Skill.
5. Check the organized requirement and answer any clarification questions. The DSH load step remains unavailable until the requirement is complete.
6. Select or confirm the project directory, acknowledge that sending starts the Agent, then select **Send to DSH and start**.

## Data and execution boundaries

- The left pane is a real `WebContentsView`, not a screenshot or remote-control stream.
- The isolated native session preserves the DeepSeek login. SpecsRelay does not read or store the account password.
- Node integration and preload access remain disabled; main-frame navigation is limited to `https://chat.deepseek.com`.
- DOM capture runs only after **Organize current conversation** is selected. Loading, showing, and resizing the page do not capture it.
- The same action captures the current conversation locally and sends it to the DSH-configured DeepSeek model for requirement organization and internal review. Clarification and revision reuse the same model path; there is no separate review action.
- The registered `specsrelay-requirement-analysis` Skill is internal to this workflow and does not need separate installation or configuration.
- The main **Send to DSH and start** action writes the prompt through DSH's native input API and submits it through the same pipeline as the DSH send button.
- Once the requirement and project path are ready, SpecsRelay prepares the target DSH session in the background. The final click only performs the local draft write, submit, and navigation; development builds log click-to-submit timing for verification.
- Restoring an execution snapshot or loading an inbox item still changes only the DSH draft and never starts another Agent turn.

## Local development

```sh
pnpm dsh plugin --profile desktop add /absolute/path/to/SpecsRelay/plugins/dsh-deepseek
```

For local development, restart DSH Desktop after adding the plugin. Ordinary WebUI cannot provide the native DeepSeek panel and reports that DSH Desktop is required.

## Relationship to related projects

- [DeepSeek Harness](https://github.com/deepseek-ai/DeepSeek-Harness) provides the core Agent, model, session, Web UI, and plugin system. SpecsRelay installs through that plugin system without modifying upstream source.
- [DSH Desktop](https://github.com/anywhere-labs/deepseek-harness-desktop) is the recommended community desktop client and supplies the native window and DeepSeek Web panel. SpecsRelay is installed separately and is not bundled with it.
- This repository contains only the SpecsRelay DSH plugin distribution for the requirement handoff path from a DeepSeek Web conversation to a DSH project.

## Acknowledgements

Thanks to DeepSeek Harness, DSH Desktop, and their communities for the plugin foundation, desktop capabilities, and ongoing maintenance. Thanks also to [AI Chat Exporter](https://github.com/TheBluCoder/AI-chat-exporter) for its open-source conversation extraction implementation. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for third-party code and license details.

## License

This project is distributed under the [MIT License](LICENSE). DeepSeek is a trademark of DeepSeek AI. SpecsRelay-DSH is an independent community project and is neither affiliated with nor endorsed by DeepSeek.
