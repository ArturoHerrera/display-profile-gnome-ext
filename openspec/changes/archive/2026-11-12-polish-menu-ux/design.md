# Design: Polish Menu UX & Fix Modal Dialog Orientation

## Context

The top panel quick menu currently contains redundant profile deletion submenus that clutter the UI and introduce accidental deletion risks. Additionally, menu action strings end with dated trailing ellipses (`...`), and clicking "Guardar configuración actual" crashes in GNOME Shell 51 due to `St.BoxLayout` removing the `vertical: true` property in favor of `orientation: Clutter.Orientation.VERTICAL`.

## Goals / Non-Goals

**Goals:**
- Eliminate the crash on GNOME Shell 51 when clicking "Guardar configuración actual" by fixing `St.BoxLayout` orientation handling.
- Streamline the quick menu into an agile switcher: remove the inline delete submenu and consolidate deletion in Libadwaita Preferences (`prefs.js`).
- Remove trailing ellipses from action labels and clean profile item strings for a modern aesthetic.
- Update gettext templates (`po/display-profiles.pot`) and Spanish catalog (`po/es.po`).

**Non-Goals:**
- Modifying the underlying Mutter D-Bus or persistence engines.
- Changing the preferences window layout in `prefs.js`.

## Decisions

### 1. Robust `St.BoxLayout` Orientation Assignment
- **Decision:** Initialize `St.BoxLayout` without passing `vertical: true` in the constructor dictionary.
- **Implementation:**
  ```javascript
  const content = new St.BoxLayout({
      style: 'padding: 16px; min-width: 340px; spacing: 10px;'
  });
  if (Clutter.Orientation) {
      content.orientation = Clutter.Orientation.VERTICAL;
  }
  if ('vertical' in content) {
      content.vertical = true;
  }
  ```
- **Rationale:** Avoids GObject constructor throwing an unrecognized property error on GNOME 51 while maintaining full backwards compatibility with GNOME 45–47.

### 2. Consolidating Profile Deletion Exclusively in Preferences
- **Decision:** Remove `manageSubMenu` / `deleteSubMenu` from `_buildSingleMonitorMenu` and `_buildMultiMonitorMenu`.
- **Rationale:** Aligns with GNOME HIG: the panel menu is a fast selector, while configuration and item management live in the settings window.

### 3. Removal of Trailing Ellipses
- **Decision:** Strip `...` from all action labels.
- **Labels:**
  - `_('Save Current Configuration')` (was `_('Save current configuration...')`)
  - `_('Preferences')` (was `_('Preferences...')`)
  - `_('Loading profiles')` (was `_('Loading profiles...')`)

## Risks / Trade-offs

- **[Risk]** Users accustomed to deleting profiles from the top bar dropdown.
  → **Mitigation:** The "Preferencias" button remains at the bottom of the quick menu and immediately opens the Libadwaita window with dedicated trash buttons for every saved profile.

