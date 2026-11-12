# Proposal: Polish Menu UX & Fix Modal Dialog Orientation

## Why

In daily use, the top panel quick menu exhibits UX redundancy and visual noise: profile deletion is duplicated in both the panel dropdown and the native Preferences window, action labels use dated trailing ellipses (`...`), and clicking "Guardar configuración actual" silently crashes on modern GNOME Shell 51 due to `St.BoxLayout` removing the `vertical: true` property in favor of `orientation: Clutter.Orientation.VERTICAL`. This change streamlines the menu into a clean, modern quick switcher and fixes dialog instantiation.

## What Changes

- **Fix Dialog Orientation (GNOME 51 Bugfix)**: Update `ProfileSaveDialog` in `src/extension.js` to use `orientation: Clutter.Orientation.VERTICAL` with backward-compatible fallbacks, allowing the save modal to open reliably on GNOME 45 through 51+.
- **Remove Redundant Deletion from Menu**: Remove the `Eliminar un perfil...` submenu from the panel dropdown. Deletion and profile management are consolidated exclusively in the native Libadwaita Preferences window (`prefs.js`).
- **Clean Action Labels (Remove `...`)**: Strip trailing ellipses from all action items and placeholders (e.g., "Guardar configuración actual", "Preferencias", "Cargando perfiles") for a direct, modern aesthetic.
- **Streamline Profile Labels**: Format profile items with clean, readable spacing rather than heavy bracketed notation.
- **Update Translations**: Refresh gettext template (`po/display-profiles.pot`) and Spanish catalog (`po/es.po`) with the polished string definitions.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `display-profiles`: Update requirement `Top panel indicator and quick menu` to specify streamlined quick switching without inline profile deletion and clean modern labels.

## Impact

- **Affected Files**: `src/extension.js`, `po/display-profiles.pot`, `po/es.po`, `src/locale/es/LC_MESSAGES/display-profiles@arturoherrera.mo`.
- **User Experience**: The save profile modal opens properly upon clicking; the top bar menu is significantly cleaner, faster, and free of accidental deletion risks.

