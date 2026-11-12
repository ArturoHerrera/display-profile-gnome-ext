# Spec Delta

## MODIFIED Requirements

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

