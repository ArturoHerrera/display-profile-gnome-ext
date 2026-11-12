# Capability: Display Profiles

## Purpose

Enables users to manage, save, and switch display profiles per connected monitor, controlling resolution, UI scale, refresh rate, VRR, and orientation instantly from the GNOME Shell top panel.

## Requirements

### Requirement: Discover and query connected monitors
The system SHALL query Mutter over D-Bus (`org.gnome.Mutter.DisplayConfig.GetCurrentState`) asynchronously without blocking the compositor event loop, discovering all connected display outputs, their current modes, and their supported modes and UI scales.

#### Scenario: Querying current display configuration
- **WHEN** the extension initializes, the user opens the quick menu, or Mutter emits the `MonitorsChanged` D-Bus signal
- **THEN** the system asynchronously retrieves the current serial, connected monitors, modes, refresh rates, active scales, and logical monitor mappings without blocking the GNOME Shell UI thread

### Requirement: Save monitor profiles individually
The system SHALL allow saving the current configuration of any specific connected monitor as a named profile stored in `~/.config/display-profiles/profiles.json` using asynchronous file I/O to avoid blocking the GNOME Shell compositor loop.

#### Scenario: Saving a new profile for a selected monitor
- **WHEN** the user selects "Save Current Configuration" for a specific monitor and enters a profile name
- **THEN** the system captures the monitor's connector, vendor, product, width, height, refresh rate, VRR mode, UI scale factor, and transform, and saves it asynchronously into the monitor's profile list in JSON

### Requirement: Instant profile application via Mutter D-Bus
The system SHALL apply selected profile settings to the targeted monitor asynchronously using `org.gnome.Mutter.DisplayConfig.ApplyMonitorsConfig` without displaying confirmation prompts and without blocking the compositor event loop, while keeping other connected monitors unchanged.

#### Scenario: Applying an existing profile to a monitor
- **WHEN** the user clicks on a saved profile in the top panel menu or runs the apply command
- **THEN** the system updates that monitor's mode, scale, and transform in the logical monitor layout and asynchronously calls `ApplyMonitorsConfig` with persistent mode (`method: 2`), immediately changing the resolution and scale and updating `~/.config/monitors.xml` without hanging the shell

### Requirement: Top panel indicator and quick menu
The system SHALL provide a streamlined indicator menu in the GNOME Shell top panel displaying connected monitors and their saved profiles for instant switching, providing a modal action to save the current configuration and a direct link to Preferences, without trailing ellipses on action labels and without destructive inline profile deletion submenus.

#### Scenario: Displaying profiles for a single connected monitor
- **WHEN** only one monitor is connected and the user clicks the top panel icon
- **THEN** the menu displays the monitor's name and mode metrics, the list of saved profiles with an ornament indicating the active profile, an action to save the current configuration ("Save Current Configuration"), and an action to open preferences ("Preferences"), all rendered with clean localized strings without trailing ellipses

#### Scenario: Displaying profiles for multiple connected monitors
- **WHEN** more than one monitor is connected and the user clicks the top panel icon
- **THEN** the menu groups profiles under separate sections or submenus for each connected monitor

#### Scenario: Opening save profile modal dialog
- **WHEN** the user selects "Save Current Configuration" from the quick menu on any supported GNOME Shell version (45 through 51+)
- **THEN** the system opens a modal dialog asking for the profile name without throwing toolkit layout orientation exceptions

### Requirement: Manage and delete existing profiles
The system SHALL provide profile deletion exclusively through the native Libadwaita preferences window to avoid clutter and accidental deletions in the top panel quick menu.

#### Scenario: Deleting a saved profile
- **WHEN** the user removes a profile through the extension preferences window
- **THEN** the profile is asynchronously removed from `~/.config/display-profiles/profiles.json` and immediately disappears from the preferences window and the top panel quick switcher

### Requirement: Isolated sandbox testing environment
The system SHALL provide an automated sandbox runner (`bin/test-sandbox`) to launch the extension in a separate nested GNOME Shell Wayland instance for safe validation.

#### Scenario: Running extension in nested sandbox
- **WHEN** developer or user executes `bin/test-sandbox`
- **THEN** the runner stages the extension into a dedicated sandbox environment, starts `gnome-shell --nested --wayland` in an independent window, and enables the extension safely without affecting the host desktop session

### Requirement: Official EGO metadata and UUID identification
The extension SHALL use the unique identifier `display-profiles@arturoherrera`, declare compatibility with GNOME Shell versions 45 through 51 in `metadata.json`, and define the `gettext-domain` matching the UUID.

#### Scenario: Inspecting extension metadata
- **WHEN** GNOME Shell or extensions.gnome.org validator loads `metadata.json`
- **THEN** the metadata specifies uuid `display-profiles@arturoherrera`, valid semantic versioning starting at 1, gettext domain `display-profiles@arturoherrera`, and supported shell-versions `["45", "46", "47", "48", "49", "50", "51"]`

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

### Requirement: Non-blocking asynchronous extension lifecycle initialization
The system SHALL complete `extension.enable()` and indicator instantiation synchronously in under 5 milliseconds with zero synchronous D-Bus calls and zero synchronous disk I/O, ensuring that GNOME Shell startup and login responsiveness are unaffected.

#### Scenario: Enabling the extension during session startup
- **WHEN** GNOME Shell enables the extension at session login or via `gnome-extensions enable`
- **THEN** the extension registers its panel indicator immediately without executing synchronous D-Bus proxy construction (`new_for_bus_sync`) or synchronous directory creation (`make_directory_with_parents(null)`), avoiding any stall in the compositor event loop

### Requirement: Asynchronous or lazy D-Bus proxy for Mutter DisplayConfig
The system SHALL initialize the `org.gnome.Mutter.DisplayConfig` D-Bus proxy asynchronously using `Gio.DBusProxy.new_for_bus` or defer connection until the first asynchronous query or signal listener registration, queuing or awaiting proxy availability transparently.

#### Scenario: Connecting to Mutter DisplayConfig asynchronously
- **WHEN** `DisplayManager` is instantiated
- **THEN** it initiates proxy creation asynchronously via `Gio.DBusProxy.new_for_bus`, cleanly connects `MonitorsChanged` upon resolution, and completes pending asynchronous calls once the proxy is ready without throwing unhandled exceptions

### Requirement: Lazy storage directory creation
The system SHALL defer checking and creating the profile storage directory (`~/.config/display-profiles`) until an asynchronous save operation is performed, performing no filesystem creation checks during constructor initialization or read operations.

#### Scenario: Initializing storage on startup
- **WHEN** `Storage` is instantiated or `loadAsync()` is called on an initial session start where the directory does not yet exist
- **THEN** the system does not create the directory synchronously and safely returns an empty profile collection (`{ monitors: {} }`) if the file is absent

