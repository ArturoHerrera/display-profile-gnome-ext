# Spec Delta: Display Profiles

## MODIFIED Requirements

### Requirement: Native Libadwaita preferences window
The extension SHALL provide a standard preferences module `prefs.js` using `Adw.PreferencesWindow` and `Adw.PreferencesPage` enabling users to view, manage, and delete saved display profiles, as well as view extension version, author credits, licensing, and access the upstream GitHub repository.

#### Scenario: Opening extension preferences
- **WHEN** the user opens preferences via `gnome-extensions prefs display-profiles@arturoherrera` or the quick menu "Preferences" button
- **THEN** an Adwaita preferences window displays a "Profiles" page for managing saved monitor configurations and an "About" page containing extension name, version number, author credits, license information, and an interactive link to the upstream GitHub repository

#### Scenario: Navigating to project repository from preferences
- **WHEN** the user clicks the GitHub repository action row in the About page of extension preferences
- **THEN** the system launches the default system browser opening `https://github.com/ArturoHerrera/display-profile-gnome-ext` without blocking or crashing the preferences window

