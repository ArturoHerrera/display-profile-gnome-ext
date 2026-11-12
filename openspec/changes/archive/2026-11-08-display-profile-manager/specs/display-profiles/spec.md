# Spec Delta: Display Profiles

## Purpose

Enables users to manage, save, and switch display profiles per connected monitor, controlling resolution, UI scale, refresh rate, VRR, and orientation instantly from the GNOME Shell top panel.

## ADDED Requirements

### Requirement: Discover and query connected monitors
The system SHALL query Mutter over D-Bus (`org.gnome.Mutter.DisplayConfig.GetCurrentState`) to discover all connected display outputs, their current modes, and their supported modes and UI scales.

#### Scenario: Querying current display configuration
- **WHEN** the extension initializes or Mutter emits the `MonitorsChanged` D-Bus signal
- **THEN** the system retrieves the current serial, connected monitors, modes, refresh rates, active scales, and logical monitor mappings without errors

### Requirement: Save monitor profiles individually
The system SHALL allow saving the current configuration of any specific connected monitor as a named profile stored in `~/.config/display-profiles/profiles.json`.

#### Scenario: Saving a new profile for a selected monitor
- **WHEN** the user selects "Guardar configuración actual" for a specific monitor and enters a profile name
- **THEN** the system captures the monitor's connector, vendor, product, width, height, refresh rate, VRR mode, UI scale factor, and transform, and saves it into the monitor's profile list in JSON

### Requirement: Instant profile application via Mutter D-Bus
The system SHALL apply selected profile settings to the targeted monitor using `org.gnome.Mutter.DisplayConfig.ApplyMonitorsConfig` without displaying confirmation prompts, while keeping other connected monitors unchanged.

#### Scenario: Applying an existing profile to a monitor
- **WHEN** the user clicks on a saved profile in the top panel menu
- **THEN** the system updates that monitor's mode, scale, and transform in the logical monitor layout and calls `ApplyMonitorsConfig` with persistent mode (`method: 2`), immediately changing the resolution and scale and updating `~/.config/monitors.xml`

### Requirement: Top panel indicator and quick menu
The system SHALL provide an indicator icon in the GNOME Shell top panel displaying a menu of connected monitors and their available profiles.

#### Scenario: Displaying profiles for a single connected monitor
- **WHEN** only one monitor is connected and the user clicks the top panel icon
- **THEN** the menu displays the monitor's name, the list of saved profiles with a checkmark indicating the active profile, an action to save the current configuration, and an action to manage profiles

#### Scenario: Displaying profiles for multiple connected monitors
- **WHEN** more than one monitor is connected and the user clicks the top panel icon
- **THEN** the menu groups profiles under separate sections or submenus for each connected monitor

### Requirement: Manage and delete existing profiles
The system SHALL allow users to delete unwanted profiles from the configuration.

#### Scenario: Deleting a saved profile
- **WHEN** the user removes a profile through the extension management interface
- **THEN** the profile is removed from `~/.config/display-profiles/profiles.json` and disappears from the top panel menu

