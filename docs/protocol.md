# DshSkins protocol version 1

## Purpose

The protocol separates portable skin data from client rendering. A client advertises renderer capabilities, validates a manifest, rejects a skin whose required capabilities are unsupported, and may ignore unsupported optional capabilities while retaining semantic color and geometry tokens.

## Package contents

An unpacked source skin contains `skin.json`, optional `assets/` and `previews/` directories, and a skin-specific license file. The archive and signature transport is deliberately not fixed in version 1 source format; clients and registries must not infer trust from a filename extension.

The manifest schema is [`packages/spec/schema/dsh-skin.schema.json`](../packages/spec/schema/dsh-skin.schema.json). Runtime validation adds cross-field rules: capabilities used by asset slots must be declared, capability lists cannot overlap, and package paths cannot escape their owning directory.

## Semantic tokens

Every skin supplies complete light and dark palettes. Colors use `#RRGGBB` or `#RRGGBBAA`; geometry values are bounded pixel values. Client adapters translate the portable names into toolkit-specific styles. A skin cannot inject raw CSS values such as `url()`, functions, selectors, or declarations.

## Asset locations

`SKIN_SLOT_CATALOG` is the machine-readable authority for aspect ratio, minimum dimensions, byte limits, default fit, renderer capability, and fallback. Version 1 accepts PNG, WebP, and AVIF only. SVG is excluded because active content, external references, fonts, and renderer differences make it unsuitable for an untrusted public registry.

Character activity locations resolve to `character.idle` when a requested state is absent. Other locations remain optional and render nothing when absent.

## Capability negotiation

`tokens.semantic.v1` is required by every skin. Surface, identity, and character artwork can be required or optional. Requiring a capability makes the skin unavailable on a client that lacks it; declaring it optional allows a graceful token-only or partial rendering.

Client names and versions do not appear in manifests. Compatibility depends on protocol features, so a new client can support the existing ecosystem without being added to every skin.

## Rights and commerce

Every manifest records an SPDX expression, whether the creator permits commercial use, content rating, AI-generation status, generator identity when applicable, and a rights statement. These declarations support review but do not prove ownership. A marketplace performs identity, moderation, takedown, pricing, payment, refund, and revenue-share operations outside the portable manifest.
