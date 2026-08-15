# Contributing skins

## Submit a skin

1. Copy an existing directory under `skins/` and replace its manifest, license, palettes, and optional artwork.
2. Use a globally distinct lowercase manifest id and keep all referenced files inside that skin directory.
3. Declare the actual asset license, commercial-use permission, AI-generation provenance, content rating, and ownership statement.
4. Run `pnpm run build`, then `pnpm skin validate skins/<directory>`.
5. Add one matching row to `registry/registry.json` and run `pnpm skin registry registry/registry.json`.
6. Submit the skin, its registry row, and no unrelated client or protocol changes in the same pull request.

The registry does not accept executable code, remote assets, SVG, undisclosed copyrighted characters, impersonation, or a license that conflicts with the submitted files. Automated validation checks structure and raster constraints; maintainers still review visual content and rights declarations.

## Change the protocol or an adapter

Protocol changes require a versioning decision, schema tests, compatibility tests, and updated adapter guidance. Client-specific behavior belongs in an adapter package, not in a portable skin manifest.

Marketplace pricing, payment, settlement, and refund changes belong in a separate service and must not alter the portable skin format.
