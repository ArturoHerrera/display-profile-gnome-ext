# Design: v1.0.0 EGO Readiness & Code Quality Hardening

## Context

The extension currently provides asynchronous D-Bus communication with Mutter, live monitor discovery, quick profile switching, and nested sandbox testing. However, to pass review on extensions.gnome.org (EGO) and achieve production quality:
- The temporary UUID `display-profiles@local` must be replaced with the official UUID `display-profiles@arturoherrera`.
- All signal connections (D-Bus signal subscriptions, Clutter actor events) must be rigorously disconnected on `disable()` and `destroy()` to guarantee no memory leaks across Shell lifecycle events.
- Hardcoded Spanish strings must be extracted into gettext templates (`.pot`) with English as the canonical base language and Spanish (`es.po`) as a localized catalog.
- `storage.js` currently uses synchronous `GLib.file_get_contents` and `GLib.file_set_contents` on the compositor main thread, which can introduce micro-stutters during disk I/O.
- There is no `prefs.js` module implemented for native settings management.
- There is no automated build/packaging script to compile gettext catalogs and generate standard EGO zip archives.

## Goals / Non-Goals

**Goals:**
- Comply with all GNOME extensions.gnome.org (EGO) submission guidelines and review checklists.
- Establish clean lifecycle management: every signal ID tracked and unsubscribed/disconnected on `destroy()` / `disable()`.
- Implement non-blocking disk persistence using `Gio.File` async APIs.
- Provide a modern Libadwaita Preferences window (`Adw.PreferencesWindow`) in `prefs.js` for profile inspection and management.
- Implement full i18n support using standard gettext with English default and Spanish translation.
- Automate translation compilation and EGO packaging via `bin/pack-ego`.

**Non-Goals:**
- Changing the underlying Mutter D-Bus protocol or layout calculation logic.
- Rewriting the CLI tool into a compiled binary (retaining bash/gdbus companion).
- Introducing cloud sync or multi-machine syncing of display profiles.

## Decisions

### 1. Signal Tracking Pattern
- **Decision:** Introduce a centralized signal tracking pattern across `extension.js` and `displayManager.js`.
- **Implementation:**
  - In `DisplayProfilesIndicator`, maintain `this._signalIds = []` for all widget/menu item connections and disconnect them on `destroy()`.
  - In `DisplayManager`, store the D-Bus subscription ID returned by `Gio.DBusConnection.signal_subscribe` as `this._monitorsChangedId` and invoke `this._dbusConnection.signal_unsubscribe(this._monitorsChangedId)` in a new `destroy()` method.
- **Alternatives Considered:** Relying on actor destruction to clean up signals. *Rejected:* Certain D-Bus proxies and global object signals (like `global.display` or D-Bus bus connections) outlive actors and leak memory without explicit unsubscription.

### 2. Async Storage with Promises
- **Decision:** Refactor `storage.js` to wrap `Gio.File.load_contents_async` and `Gio.File.replace_contents_bytes_async` into standard JavaScript `Promise`s.
- **Implementation:**
  - `loadProfiles()` returns `Promise<Object>`.
  - `saveProfiles(data)` returns `Promise<void>`.
  - Creates parent directories asynchronously if missing (`make_directory_with_parents_async`).
- **Alternatives Considered:** Keeping synchronous `GLib.file_set_contents`. *Rejected:* EGO guidelines strictly prohibit synchronous disk I/O on the compositor main thread.

### 3. Native Libadwaita Preferences (`prefs.js`)
- **Decision:** Implement `prefs.js` subclassing `ExtensionPreferences` (GNOME 45+ ESM standard).
- **Implementation:**
  - `fillPreferencesWindow(window)` builds an `Adw.PreferencesPage` containing `Adw.PreferencesGroup` for each monitor found in `profiles.json`.
  - Profiles are listed in `Adw.ActionRow`s showing resolution, refresh rate, and scale, with a delete `Gtk.Button` (`user-trash-symbolic`).
  - Clicking delete asynchronously removes the profile from `storage.js` and removes the row with an animation.
- **Alternatives Considered:** Building a custom GTK dialog from the panel menu. *Rejected:* EGO requires standard `prefs.js` integrating with the GNOME Extensions app and `gnome-extensions prefs`.

### 4. Internationalization (gettext) Setup
- **Decision:** Configure gettext domain `display-profiles@arturoherrera`.
- **Implementation:**
  - In `metadata.json`, set `"gettext-domain": "display-profiles@arturoherrera"`.
  - In `extension.js`, use `this.gettext.bind(this)` as `_()` to localize strings.
  - Default code strings will be standard English (e.g., "Display Profiles", "Save Current Configuration", "Manage Profiles").
  - Provide `po/display-profiles.pot` and `po/es.po` for complete Spanish localization.

### 5. Automated Build & Packaging (`bin/pack-ego`)
- **Decision:** Create `bin/pack-ego` script utilizing `gettext` tools and `gnome-extensions pack`.
- **Implementation:**
  - Compiles `po/*.po` files into `locale/<lang>/LC_MESSAGES/display-profiles@arturoherrera.mo`.
  - Invokes `gnome-extensions pack --extra-source=displayManager.js --extra-source=storage.js --extra-source=locale --out-dir=dist --force src`.
  - Produces `dist/display-profiles@arturoherrera.shell-extension.zip`.

## Risks / Trade-offs

- **[Risk]** Breaking existing user installations using `display-profiles@local`.
  → **Mitigation:** Document the new UUID clearly in `README.md`. Profile JSON storage path remains at `~/.config/display-profiles/profiles.json`, preserving existing user profile configurations across the UUID migration.
- **[Risk]** Libadwaita availability in preferences vs shell runtime.
  → **Mitigation:** Preferences (`prefs.js`) run in a separate GTK4/Libadwaita process spawned by `gnome-extensions prefs`, whereas `extension.js` runs inside the Clutter/St compositor process. Keep imports strictly separated.

