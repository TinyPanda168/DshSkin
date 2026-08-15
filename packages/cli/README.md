# @dsh-skins/cli

Creator and registry validation for unpacked protocol-version-1 skin directories.

```sh
dsh-skin validate skins/my-skin
dsh-skin registry registry/registry.json
dsh-skin catalog --json
```

Validation rejects invalid manifests, path traversal, symlinks, missing files, MIME mismatches, undersized or incorrectly proportioned artwork, per-slot size violations, and oversized packages.
