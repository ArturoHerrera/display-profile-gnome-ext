# Tasks: Release v1 Polish, Remote License Recognition, and GNU Compliance

## 1. License & Legal Compliance
- [x] 1.1 Replace `LICENSE` with the complete canonical GNU GPLv3 text including FSF appendix
- [x] 1.2 Add standard copyright and GPL-3.0-or-later headers to `src/extension.js`, `src/displayManager.js`, `src/storage.js`, `src/prefs.js`, and `bin/display-profiles`

## 2. CLI and Code Polish
- [x] 2.1 Add `--version` and `-v` handling to `bin/display-profiles`
- [x] 2.2 Refine error logging in `src/extension.js` line 311
- [x] 2.3 Update GNOME Shell version badge in `README.md` to reflect 45 through 51

## 3. Verification & Remote Sync
- [x] 3.1 Run `gjs -m test/test_sandbox_e2e.js` to ensure all tests pass
- [x] 3.2 Re-package with `bin/pack-ego` and update local installed extension
- [x] 3.3 Commit and push to GitHub, verifying GitHub API detects `licenseInfo.key === "gpl-3.0"`
