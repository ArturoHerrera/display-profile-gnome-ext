# Proposal: v1.0.0 EGO Readiness & Code Quality Hardening

## Why

To publish the extension on extensions.gnome.org (EGO) and deliver a production-ready v1.0.0, the extension must comply with official GNOME review guidelines. This requires migrating from the temporary `@local` UUID to the official `display-profiles@arturoherrera` UUID, eliminating potential memory leaks across extension enable/disable cycles, implementing internationalization (gettext) with English base and Spanish translations, providing a native Libadwaita preferences window (`prefs.js`), and packaging with standard GNOME tooling (`gnome-extensions pack`).

## What Changes

- **UUID Migration**: Migrate extension UUID from `display-profiles@local` to `display-profiles@arturoherrera` across metadata, schemas, and packaging. (**BREAKING** for local installation paths).
- **Lifecycle & Memory Management**: Disconnect all D-Bus signals, window manager callbacks, and Clutter actor connections during `disable()` and `destroy()`, ensuring zero memory leakage across shell reloads.
- **Internationalization (i18n)**: Add GNOME `gettext` infrastructure with English as default language and complete Spanish localization (`po/es.po`).
- **Native Preferences UI (`prefs.js`)**: Add standard Libadwaita Preferences Window to view, edit, and delete saved profiles cleanly outside the top panel menu.
- **Async I/O Persistence**: Refactor `storage.js` to use asynchronous `Gio.File` reads and writes, avoiding main-thread micro-stutters during disk I/O.
- **EGO Official Packaging**: Add `gnome-extensions pack` workflow script (`bin/pack-ego`) generating compliant `.shell-extension.zip` distribution bundles.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `display-profiles`: Update requirements to reflect the official `display-profiles@arturoherrera` UUID, internationalization support, lifecycle cleanup, and preferences interface.

## Impact

- **Affected Files**: `src/metadata.json`, `src/extension.js`, `src/displayManager.js`, `src/storage.js`, `src/prefs.js` (new), `po/` (new translations), `bin/test-sandbox`, `bin/display-profiles`.
- **Packaging & Build**: Added `po/` directory and build script for compiling translation mo files.

