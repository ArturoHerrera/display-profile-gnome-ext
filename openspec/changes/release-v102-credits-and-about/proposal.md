# Proposal: Release v1.0.2 with Preferences About/Credits and GitHub Link

## Why

Users and contributors currently have no in-extension mechanism to view extension metadata, release version, licensing information, author credits, or visit the upstream project repository. Adding a dedicated "About" / "Créditos" section in the native Libadwaita preferences window improves transparency and accessibility, while preparing the package for v1.0.2 release and distribution on extensions.gnome.org (EGO).

## What Changes

- Add a dedicated "About" / "Acerca de" section in `src/prefs.js` using Libadwaita preferences widgets displaying extension name, version (v1.0.2 / EGO v3), author credits (Arturo Herrera), GPL-3.0 license, and an interactive GitHub link button/row pointing to `https://github.com/ArturoHerrera/display-profile-gnome-ext`.
- Update gettext translation catalogs in `po/es.po` with translations for the new About section strings.
- Update `README.md` to document the new preferences About/Credits capabilities and reference release v1.0.2.
- Bump extension version in `src/metadata.json` to version 3 (EGO release v1.0.2) and update `bin/pack-ego` banner metadata.
- Package and validate the release archive (`dist/display-profiles@arturoherrera.shell-extension.zip`) using `bin/pack-ego` and Shexli static analysis.
- Install the updated extension version 1.0.2 into the local system environment (`~/.local/share/gnome-shell/extensions/display-profiles@arturoherrera`).

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `display-profiles`: Update the "Native Libadwaita preferences window" requirement to include dedicated About, version, credits, and upstream GitHub repository link navigation.

## Impact

- `src/prefs.js`: Libadwaita preferences UI layout expanded with an About preferences page or group.
- `po/es.po`: New gettext localized strings for About section.
- `src/metadata.json`: Integer version incremented to 3.
- `README.md`: Updated documentation and release notes.
- `bin/pack-ego`: Distribution package generation and local installation update.

