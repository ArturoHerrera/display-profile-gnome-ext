# Tasks

## 1. Visual Assets & Screenshot Directory

- [x] 1.1 Create the `assets/screenshots/` directory structure and verify directory presence
- [x] 1.2 Generate UI screenshot asset for the GNOME Shell top panel indicator dropdown menu (`assets/screenshots/menu-dropdown.png` or `.svg`) showcasing active profile and monitor metrics, and verify file rendering
- [x] 1.3 Generate UI screenshot asset for the "Save Current Configuration" modal dialog (`assets/screenshots/save-dialog.png` or `.svg`) and verify file rendering
- [x] 1.4 Generate UI screenshot asset for the native Libadwaita Preferences window (`assets/screenshots/preferences-window.png` or `.svg`) showing monitor profile cards and delete controls, and verify file rendering
- [x] 1.5 Generate terminal CLI visual capture (`assets/screenshots/cli-overview.png` or `.svg`) displaying `display-profiles status` and `display-profiles list` outputs, and verify asset existence

## 2. README Overhaul & Documentation

- [x] 2.1 Update README header, badges, and summary to accurately reflect GNOME Shell 45–51, Wayland native support, version 1.0.0, and GPL-3.0-or-later licensing
- [x] 2.2 Add a prominent visual preview showcase section embedding the new UI screenshots with responsive markdown formatting and alt-text
- [x] 2.3 Update feature highlights section to document asynchronous non-blocking D-Bus proxy initialization, zero memory leak teardown, and fractional scaling capabilities
- [x] 2.4 Verify and update installation procedures for EGO, release package zip, and local source installation
- [x] 2.5 Expand CLI usage documentation covering all available subcommands (`status`, `list`, `save`, `add`, `apply`, `delete`) and GNU flags (`--version`, `-v`, `--help`) with realistic console examples
- [x] 2.6 Detail the isolated nested Wayland sandbox test runner (`bin/test-sandbox` and `bin/test-sandbox --check`) and explain how to test safely without risking the host session
- [x] 2.7 Update repository tree diagram and license references in `README.md`

## 3. Review & Verification

- [x] 3.1 Verify all embedded image paths in `README.md` resolve to valid files and render cleanly in markdown viewers
- [x] 3.2 Run `./bin/pack-ego` to confirm that distribution packaging succeeds and excludes documentation assets from the final extension zip

