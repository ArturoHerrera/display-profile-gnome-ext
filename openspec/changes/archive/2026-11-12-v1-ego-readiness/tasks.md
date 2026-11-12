# Tasks

## 1. UUID Migration & Metadata

- [x] 1.1 Update `src/metadata.json` with UUID `display-profiles@arturoherrera`, version 1, shell versions `["45", "46", "47", "48"]`, gettext-domain, and GitHub repository URL, verifying JSON validity
- [x] 1.2 Update `bin/test-sandbox` and `bin/display-profiles` to reference `display-profiles@arturoherrera` and verify sandbox staging resolves to the new UUID path

## 2. Lifecycle Cleanup & Signal Leak Prevention

- [x] 2.1 Update `src/displayManager.js` to store D-Bus subscription ID and implement `destroy()` method that cleanly unsubscribes `MonitorsChanged`, verifying signal teardown
- [x] 2.2 Update `src/extension.js` to track all widget and actor signal connections and disconnect every handler during `disable()` and `destroy()`, verifying zero lingering callbacks

## 3. Non-blocking Asynchronous Storage

- [x] 3.1 Refactor `src/storage.js` to use `Gio.File` async operations (`load_contents_async`, `replace_contents_bytes_async`) with JavaScript Promises and verify async profile read/write
- [x] 3.2 Update profile save and delete callers in `src/extension.js` to await async storage methods cleanly

## 4. Internationalization (gettext)

- [x] 4.1 Update user-facing UI strings in `src/extension.js` to use `this.gettext` (`_()`) with English as the canonical base language
- [x] 4.2 Generate `po/display-profiles.pot` gettext template and provide complete Spanish translation in `po/es.po`
- [x] 4.3 Create compilation script/logic to compile `.po` to `.mo` under `src/locale/es/LC_MESSAGES/display-profiles@arturoherrera.mo` and verify translation loading

## 5. Native Preferences Window (`prefs.js`)

- [x] 5.1 Implement `src/prefs.js` subclassing `ExtensionPreferences` with `Adw.PreferencesWindow` to inspect and delete saved profiles per monitor
- [x] 5.2 Connect "Manage profiles" action in `src/extension.js` to invoke extension preferences (`this.openPreferences()`) and verify preferences launch

## 6. Packaging, E2E Verification & Documentation

- [x] 6.1 Create `bin/pack-ego` script to compile gettext catalogs and package the extension with `gnome-extensions pack` into `dist/`, verifying bundle structure
- [x] 6.2 Execute `./bin/test-sandbox --check` and `test/test_sandbox_e2e.js` to verify full extension lifecycle, profile switching, and sandbox execution under the new UUID
- [x] 6.3 Update `README.md` with v1.0.0 details, the official UUID, and EGO installation instructions
