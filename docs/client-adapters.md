# Client adapter guide

## Required flow

1. Parse untrusted `skin.json` with `validateSkinManifest`.
2. Advertise renderer features and call `negotiateSkin`.
3. Resolve asset paths inside the installed package; reject symlinks and traversal.
4. Translate semantic tokens into the client's own styles.
5. Render only supported asset locations and apply catalog fallbacks.
6. Switch atomically and retain the last known-good skin for rollback.
7. Keep skin selection separate from Agent sessions and model configuration.

## Web-based DSH clients

`@dsh-skins/adapter-dsh-web` maps portable tokens onto the current official `--dsw-*` token names, exposes standard asset URLs as `--dsh-skin-asset-*` variables, and renders character activity artwork. It applies data only and does not evaluate package code.

A desktop wrapper that displays the official loopback Web UI can load this adapter as a normal browser plugin. This covers wrappers such as `deepseek-harness-desktop` without forking their Electron lifecycle code. The wrapper remains responsible for installation, package storage, asset URL resolution, persistence, and its own settings UI.

## Other clients

A native or alternative Web client implements the same semantic token and asset-location mappings. It may advertise only `tokens.semantic.v1`; skins that mark richer artwork optional still work. Terminal clients can map colors and omit raster capabilities.

## Conformance

An adapter is conformant when it rejects unsupported required capabilities, applies both palettes, follows asset fallbacks, preserves accessibility and reduced-motion behavior, performs reversible switching, and never executes content from the skin package.
