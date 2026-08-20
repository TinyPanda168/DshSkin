# SpecsRelay × Pilot Harness Local Integration Record

## Goal

Pilot Harness remains the desktop-client foundation. The SpecsRelay companion build preserves Pilot Harness branding, theme, workspaces, Agents, models, sessions, and update behavior. It adds only the native Web capability required by the complete SpecsRelay workflow and installs the existing SpecsRelay DSH plugin into Pilot's `web` profile.

This integration is not intended as a feature branch for `op7418/pilot-harness`, and SpecsRelay does not need a Pilot-specific bundle. The Pilot upstream repository and public installers remain independently maintained by their original author.

## Baseline

- Pilot Harness upstream: `https://github.com/op7418/pilot-harness`
- Current local baseline commit: `dbcf586d537d72a933614423e2735930d55d8271`
- Local integration workspace: `/Users/tinypanda/Desktop/Gameprodecer/PilotHarness`
- SpecsRelay plugin source: `/Users/tinypanda/Desktop/Gameprodecer/SpecsRelay-DSH`

## Allowed differences

1. Pilot Electron provides `ctx.desktopWebPanels` and hosts the real DeepSeek website in a sandboxed `WebContentsView`.
2. The Harness child and Electron main process use private IPC for registration, visibility, reload, capture, and disposal operations.
3. The existing SpecsRelay plugin is installed and mounted in the local `DSH_HOME` used by Pilot.
4. Tests, maintenance documentation, and license records directly required by this capability are included.

No other Pilot layout, branding, Agent behavior, model configuration, session structure, or ordinary plugin mechanism is changed.

## Current verification

- The unchanged SpecsRelay bundle completed a real registration and readiness smoke test in Pilot's `web` profile.
- The native Web service passes 38 tests with 100% statement, branch, function, and line coverage.
- The Pilot Desktop focused suite passes 16 tests.
- The full build and all 28 documentation gates pass.

## Next step

1. Produce an unpublished local Pilot Harness application build.
2. Install SpecsRelay into the exact `DSH_HOME` and `web` profile used by that application.
3. Manually verify signing in to DeepSeek, opening a conversation, organizing the requirement, selecting a project, and loading and sending it to DSH.
4. After experience approval, decide whether to create a separate SpecsRelay Pilot companion distribution repository. Do not submit this integration upstream to Pilot Harness.
