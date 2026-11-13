# Design: Release v1.0.2 Preferences About Section and Packaging

## Context

`src/prefs.js` currently defines a single `Adw.PreferencesPage` named "Profiles". In modern Libadwaita GNOME applications and extensions, adding a secondary "About" preferences page (`help-about-symbolic`) is standard for presenting version info, legal credits, and upstream links without cluttering operational configuration.

## Goals / Non-Goals

**Goals:**
- Provide a clean, native Libadwaita "About" page in `src/prefs.js` with extension version, credits to Arturo Herrera, GPL-3.0 license info, and an interactive GitHub link.
- Support internationalization for all new UI strings in `po/es.po`.
- Automate clean release bump to v1.0.2 (`version: 3` in `metadata.json`).
- Ensure full Shexli static analysis pass and deliver the installable `.shell-extension.zip` in `dist/`.
- Deploy the v1.0.2 extension into `~/.local/share/gnome-shell/extensions/display-profiles@arturoherrera`.

**Non-Goals:**
- Altering the core D-Bus DisplayConfig logic or storage format.
- Adding complex telemetry or online update checks (EGO handles update distribution).

## Decisions

### 1. Dedicated `Adw.PreferencesPage` vs. Inline Group
- **Decision**: Create a dedicated `Adw.PreferencesPage` titled `_('About')` with icon `help-about-symbolic`.
- **Rationale**: Keeps monitor profile management focused and clean on the primary tab, while adhering to GNOME HIG where "About" is a distinct page or dialog.
- **Alternatives considered**: Placing an About group at the bottom of the "Profiles" page. Rejected because multi-monitor setups make the page tall, burying the About info.

### 2. URL Launching Mechanism in GTK4 / Libadwaita
- **Decision**: Use `Gtk.show_uri(window, 'https://github.com/ArturoHerrera/display-profile-gnome-ext', Gdk.CURRENT_TIME)` with `Gdk` imported from `gi://Gdk`, or `Gio.AppInfo.launch_default_for_uri`.
- **Rationale**: `Gtk.show_uri` is standard across GTK4 and Libadwaita across GNOME 45-51, properly handling window modality and Wayland sandbox boundaries.

### 3. Version Numbering Scheme
- **Decision**: Set `"version": 3` in `src/metadata.json` (as EGO requires strictly monotonic integer versions) while tagging git and referencing `v1.0.2` in documentation and UI.

## Risks / Trade-offs

- **[Risk] Shexli static analysis warnings on URL launch**:
  - *Mitigation*: Ensure URI handling uses standard GObject introspection imports without deprecated shell APIs. Validate with `bin/lint-shexli`.
- **[Risk] Local extension cache during upgrade**:
  - *Mitigation*: Use `gnome-extensions install --force` to atomically overwrite the directory in `~/.local/share/gnome-shell/extensions/` and verify files.

