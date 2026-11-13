# Design

## Context

The extension was previously updated to support GNOME Shell 51 (including `Clutter.Orientation.VERTICAL` adaptations), but commit `32e4c7e` trimmed `shell-version` down to `["45", "46", "47", "48"]` to pass an outdated rule in Shexli 0.2.1 (`major > 50`). This design specifies how to restore full GNOME 45-51 compatibility, configure a repeatable Shexli analysis harness, and integrate static verification into the release packaging flow.

## Goals / Non-Goals

**Goals:**
- Restore declared compatibility for GNOME 45 through 51 in `src/metadata.json`.
- Create a repeatable Shexli execution tool (`bin/lint-shexli`) using a dedicated Python virtualenv.
- Account for the hardcoded `major > 50` ceiling in Shexli 0.2.1 so that all substantive rules (lifecycle leaks, signal handling, async D-Bus, and imports) are thoroughly audited without false-positive rejection of GNOME 51.
- Validate that the nested test runner (`bin/test-sandbox --check`) verifies extension state as `ENABLED` (`state: 1.0`) on GNOME 51.1.
- Wire Shexli verification into `bin/pack-ego` so pre-distribution checks are automated.

**Non-Goals:**
- Refactoring D-Bus communication or storage layers (already tested and passing on GNOME 51).
- Modifying UI layouts or localization catalogs.

## Decisions

### 1. Declaring Shell Versions 45 through 51
- **Choice**: Set `shell-version` in `src/metadata.json` to `["45", "46", "47", "48", "49", "50", "51"]`.
- **Rationale**: GNOME 45 is the baseline for modern ESM extension architecture. All intermediate versions (46-50) and current GNOME 51 run this extension without structural breakage.
- **Alternative considered**: Declaring only `["51"]`. Rejected because it drops support for LTS distributions (e.g. Ubuntu 24.04 on GNOME 46, Fedora 40/41/42).

### 2. Shexli Environment Setup (`bin/lint-shexli`)
- **Choice**: Provide a script `bin/lint-shexli` that provisions/activates a local virtual environment (`.venv-shexli`), installs `shexli` from PyPI, and executes static analysis over `src/` or the packaged zip.
- **Handling Version Boundary**: Shexli 0.2.1 hardcodes `if major > 50: future.append(raw)` in `shexli/analyzer/rules/metadata.py`. `bin/lint-shexli` will adjust the check (or monkeypatch/substitute the threshold to allow 51) so that the entire suite of AST analysis and lifecycle checks runs to completion and exits 0.
- **Alternative considered**: Relying only on manual command-line inspection. Rejected because automated regression testing prevents accidental version stripping.

### 3. Verification in Packager (`bin/pack-ego`)
- **Choice**: Call `bin/lint-shexli` directly inside `bin/pack-ego` before declaring the `.zip` ready for upload.
- **Rationale**: Ensures any future code changes are vetted against EGO requirements prior to distribution.

## Risks / Trade-offs

- **[Risk] Shexli wheel dependencies on host**: Shexli requires `tree-sitter` and `tree-sitter-javascript`.
  - **Mitigation**: Standard pre-built wheels exist for `x86_64` Linux on PyPI; `pip install` in the virtualenv resolves them automatically without system-level build tools.
- **[Risk] Host GNOME Shell version incompatibility**:
  - **Mitigation**: Verified via `test/test_sandbox_e2e.js` and `bin/test-sandbox --check` directly against Mutter 51.1.

