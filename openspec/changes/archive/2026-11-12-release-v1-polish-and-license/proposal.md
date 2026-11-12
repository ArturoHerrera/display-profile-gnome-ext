# Proposal: Release v1 Polish, Remote License Recognition, and GNU Compliance

## Why

As the final step before publishing Release v1.0.0 of Display Profile Manager, an audit against GNOME Extensions (EGO) review guidelines and GNU/Linux software standards revealed minor compliance and polish improvements:
1. **GitHub License Recognition**: The remote GitHub repository currently reports `licenseInfo: { key: "other", name: "Other" }` because the root `LICENSE` file omitted the canonical FSF appendix ("How to Apply These Terms to Your New Programs"). Restoring the official full text will allow GitHub to automatically recognize the license as `GPL-3.0` and display the badge on the repository home page.
2. **FSF/GNU Source Headers**: Source files in `src/` and `bin/` lack standard copyright and GPL-3.0-or-later notice headers.
3. **CLI GNU Standards**: `bin/display-profiles` supports `--help` but lacks `--version` / `-v`.
4. **Documentation Sync**: `README.md` shell version badges display 45-48 while `metadata.json` supports GNOME Shell 45 through 51.

## What Changes

1. Replace `LICENSE` with the complete canonical text from the FSF (via GitHub's official template), enabling automated repository license detection.
2. Add standard GNU GPLv3+ license headers to all core source files (`src/extension.js`, `src/displayManager.js`, `src/storage.js`, `src/prefs.js`, `bin/display-profiles`).
3. Add `--version` and `-v` flags to `bin/display-profiles`.
4. Update `README.md` version badge to reflect GNOME Shell versions 45 through 51.
5. Standardize error logging in `src/extension.js` line 311.
6. Re-run `bin/pack-ego`, verify E2E tests pass, commit and push to remote.

## Capabilities

### Modified Capabilities
- `display-profiles`: Specify requirements for official GNU license declaration, source headers, CLI `--version` support, and repository metadata accuracy.

## Non-Goals
- Changing functional display profile switching or saving logic.
- Adding new UI widgets or dialogs.
