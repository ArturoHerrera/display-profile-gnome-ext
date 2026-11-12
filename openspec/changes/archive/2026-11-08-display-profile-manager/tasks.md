# Tasks: Display Profile Manager GNOME Extension

## 1. Project Scaffolding & Metadata

- [x] 1.1 Create extension directory structure (`src/`, `metadata.json`) with UUID `display-profiles@local` and shell versions `["45", "46", "47", "48", "49", "50", "51"]`, and verify `metadata.json` is valid JSON.
- [x] 1.2 Create basic extension entrypoint `src/extension.js` extending `Extension` with `enable()` and `disable()` methods, and verify it imports cleanly using `gjs` or syntax validation.

## 2. D-Bus Mutter DisplayConfig Client

- [x] 2.1 Implement `src/displayManager.js` to communicate with `org.gnome.Mutter.DisplayConfig` over D-Bus (`GetCurrentState` and listening to `MonitorsChanged`), and verify monitor discovery returns the current `DP-3` monitor with its modes and scales.
- [x] 2.2 Implement `applyMonitorProfile(monitorSpec, profile)` in `src/displayManager.js` to modify the targeted monitor's entry in `logical_monitors` and invoke `ApplyMonitorsConfig(serial, 2, ...)`, and verify that calling it updates the screen mode cleanly without affecting other outputs.

## 3. Profile Storage Engine

- [x] 3.1 Implement `src/storage.js` to read and write profiles in `~/.config/display-profiles/profiles.json` using `GLib.file_get_contents` and `GLib.file_set_contents`, and verify profile save and load operations create the JSON file and persist entries correctly.
- [x] 3.2 Add helper methods to query active profiles, list profiles for a given monitor, and delete an existing profile, and verify unit tests or test scripts run successfully against temporary storage files.

## 4. Panel UI & Menu Integration

- [x] 4.1 Implement `DisplayProfileIndicator` extending `PanelMenu.Button` in `src/extension.js`, displaying a display icon in the GNOME Shell status area.
- [x] 4.2 Populate the indicator's `PopupMenu` dynamically with connected monitors, their current profile radio checkmarks, and a list of saved profiles for each monitor.
- [x] 4.3 Add a "Guardar configuración actual" menu item that prompts the user for a profile name (via a simple dialog or entry popup) and saves the current monitor settings.
- [x] 4.4 Add an "Administrar perfiles" submenu or modal enabling users to delete saved profiles.

## 5. Local Installation & Verification on Fedora 45

- [x] 5.1 Link or install the extension to `~/.local/share/gnome-shell/extensions/display-profiles@local/` and verify `gnome-extensions list` discovers the extension.
- [x] 5.2 Enable the extension using `gnome-extensions enable display-profiles@local` and verify the icon appears on the top bar.
- [x] 5.3 Test saving a profile for the `DP-3` monitor (e.g. 4K @ 200%), switching to an alternative resolution/scale (e.g. 1440p @ 100%), and switching back, verifying that the change is instant and VRR is preserved.

