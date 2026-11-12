# Spec Delta

## MODIFIED Requirements

### Requirement: Save monitor profiles individually
The system SHALL allow saving the current configuration of any specific connected monitor as a named profile stored in `~/.config/display-profiles/profiles.json` using asynchronous file I/O to avoid blocking the GNOME Shell compositor loop.

#### Scenario: Saving a new profile for a selected monitor
- **WHEN** the user selects "Save current configuration" for a specific monitor and enters a profile name
- **THEN** the system captures the monitor's connector, vendor, product, width, height, refresh rate, VRR mode, UI scale factor, and transform, and saves it asynchronously into the monitor's profile list in JSON

### Requirement: Top panel indicator and quick menu
The system SHALL provide an indicator icon in the GNOME Shell top panel displaying a menu of connected monitors and their available profiles, with all UI labels internationalized via gettext domain `display-profiles@arturoherrera` and all widget signals cleanly tracked for disconnection.

#### Scenario: Displaying profiles for a single connected monitor
- **WHEN** only one monitor is connected and the user clicks the top panel icon
- **THEN** the menu displays the monitor's name, the list of saved profiles with a checkmark indicating the active profile, an action to save the current configuration, and an action to manage profiles, all rendered using localized strings

#### Scenario: Displaying profiles for multiple connected monitors
- **WHEN** more than one monitor is connected and the user clicks the top panel icon
- **THEN** the menu groups profiles under separate sections or submenus for each connected monitor

### Requirement: Manage and delete existing profiles
The system SHALL allow users to delete unwanted profiles either directly through the quick menu or via the native Libadwaita preferences window.

#### Scenario: Deleting a saved profile
- **WHEN** the user removes a profile through the extension quick menu or preferences window
- **THEN** the profile is asynchronously removed from `~/.config/display-profiles/profiles.json` and immediately disappears from the top panel menu and active state

## ADDED Requirements

### Requirement: Official EGO metadata and UUID identification
The extension SHALL use the unique identifier `display-profiles@arturoherrera`, declare compatibility with GNOME Shell versions 45, 46, 47, and 48 in `metadata.json`, and define the `gettext-domain` matching the UUID.

#### Scenario: Inspecting extension metadata
- **WHEN** GNOME Shell or extensions.gnome.org validator loads `metadata.json`
- **THEN** the metadata specifies uuid `display-profiles@arturoherrera`, valid semantic versioning starting at 1, gettext domain `display-profiles@arturoherrera`, and supported shell-versions `["45", "46", "47", "48"]`

### Requirement: Strict lifecycle cleanup and leak prevention
The extension SHALL disconnect every D-Bus signal subscription, window manager callback, Clutter actor signal, and destroy all UI widgets and modal dialogs during `disable()` and `destroy()`, leaving zero lingering callbacks or references in the GNOME Shell process.

#### Scenario: Disabling extension in active session
- **WHEN** the extension is disabled via `gnome-extensions disable display-profiles@arturoherrera` or during shell shutdown/restart
- **THEN** all D-Bus signal subscriptions on `org.gnome.Mutter.DisplayConfig` are disconnected, all actor connections are removed, the top panel indicator is destroyed, and no errors or warnings are logged in the system journal

### Requirement: Native Libadwaita preferences window
The extension SHALL provide a standard preferences module `prefs.js` using `Adw.PreferencesWindow` and `Adw.PreferencesPage` enabling users to view, manage, and delete saved display profiles.

#### Scenario: Opening extension preferences
- **WHEN** the user opens preferences via `gnome-extensions prefs display-profiles@arturoherrera` or the quick menu "Preferences" button
- **THEN** an Adwaita preferences window displays connected monitors and their saved profiles, allowing one-click profile deletion with instant disk synchronization

### Requirement: Compliant EGO distribution packaging
The project SHALL provide an automated packaging tool (`bin/pack-ego`) that compiles gettext translation files (`po/*.po`) into binary catalogs (`locale/*/LC_MESSAGES/*.mo`) and bundles the extension using `gnome-extensions pack` into a distributable archive ready for upload to extensions.gnome.org.

#### Scenario: Building distribution package
- **WHEN** the developer executes `bin/pack-ego`
- **THEN** gettext `.mo` files are compiled, schema assets and sources are packaged via `gnome-extensions pack`, and a valid `.shell-extension.zip` is created in `dist/` passing all EGO static validation checks

