# Proposal

## Why

The project has evolved with comprehensive support for GNOME Shell 45 through 51, modern ESM architecture, asynchronous D-Bus communication, native Libadwaita preferences, automated nested sandboxing, and standard GNU GPLv3 licensing. However, the documentation in `README.md` lacks visual walkthroughs, screenshots of the user interface (indicator dropdown, save dialog, preferences window, CLI terminal output), and needs to be fully refreshed to provide clear, attractive, and accurate onboarding for users and contributors.

## What Changes

- **Visual Showcase & Screenshots**: Add high-quality screenshots and visual assets displaying the GNOME Shell top panel indicator menu, the profile switcher, the "Save Current Configuration" modal dialog, the Libadwaita Preferences window (`prefs.js`), and the interactive CLI tool in action.
- **Documentation Asset Directory**: Establish an `assets/screenshots/` (or `docs/assets/`) structure to cleanly organize media files referenced by `README.md`.
- **Refreshed Documentation Sections**:
  - Update and verify all installation instructions (EGO, release ZIP, source installation).
  - Polish feature highlights: async non-blocking Mutter D-Bus, zero leaks, fractional scaling, multi-monitor support, Wayland compatibility.
  - Document all CLI utility commands (`status`, `list`, `save`, `add`, `apply`, `delete`, `--version`, `--help`) with realistic terminal examples.
  - Detail development, nested sandbox testing (`bin/test-sandbox`, `bin/test-sandbox --check`), and packaging (`bin/pack-ego`).
  - Align project directory tree and badges with the current repository layout.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
None (`skip_specs: true` declared for documentation and visual assets update).

## Impact

- **Affected Files**: `README.md`, newly added screenshot/media files in `assets/screenshots/`.
- **APIs & Dependencies**: No runtime code, schemas, or D-Bus interfaces affected.
- **Backward Compatibility**: Fully backward-compatible; no code changes.

