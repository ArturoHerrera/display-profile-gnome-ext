# Proposal

## Why

In commit `32e4c7e`, GNOME Shell version 51 (along with 49 and 50) was removed from `src/metadata.json` to bypass an automated linter finding (`EGO-M-004`) triggered by an outdated Shexli analyzer rule that flagged versions greater than 50 as implausible future releases. However, the host environment runs GNOME Shell 51.1 natively, causing GNOME Shell to classify the extension as `OUT_OF_DATE` (state 4.0) and refuse to load it. Restoring GNOME 51 support and setting up an updated Shexli analysis workflow resolves this regression, aligns `metadata.json` with existing project specifications, and guarantees clean packaging for extensions.gnome.org (EGO).

## What Changes

- Restore declared support for GNOME Shell versions 45 through 51 in `src/metadata.json`.
- Configure a local Python virtual environment to run an updated/patched Shexli static analysis pipeline.
- Audit the extension against all Shexli rules (lifecycle cleanup, GObject signal disconnections, non-blocking D-Bus proxy initialization, and metadata validity).
- Verify runtime extension activation in GNOME Shell 51 using the nested sandbox runner (`bin/test-sandbox`).
- Validate the EGO packaging workflow in `bin/pack-ego` to ensure distributable zip bundles comply with both GNOME 51 and EGO standards.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `display-profiles`: Restores and enforces declared compatibility for GNOME Shell 45 through 51 in `metadata.json`, and adds automated Shexli linter verification as part of packaging.

## Impact

- `src/metadata.json`: Re-adds `"49"`, `"50"`, and `"51"` to `shell-version`.
- `bin/pack-ego`: Integrates or references Shexli verification to prevent regressions before publishing.
- Extension runtime: GNOME Shell 51 loads and enables the extension (`state: 1.0` / ENABLED) without version mismatch warnings.

