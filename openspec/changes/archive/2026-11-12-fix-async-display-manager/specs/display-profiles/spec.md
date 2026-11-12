# Spec Delta: Display Profiles

## MODIFIED Requirements

### Requirement: Discover and query connected monitors
The system SHALL query Mutter over D-Bus (`org.gnome.Mutter.DisplayConfig.GetCurrentState`) asynchronously without blocking the compositor event loop, discovering all connected display outputs, their current modes, and their supported modes and UI scales.

#### Scenario: Querying current display configuration
- **WHEN** the extension initializes, the user opens the quick menu, or Mutter emits the `MonitorsChanged` D-Bus signal
- **THEN** the system asynchronously retrieves the current serial, connected monitors, modes, refresh rates, active scales, and logical monitor mappings without blocking the GNOME Shell UI thread

### Requirement: Instant profile application via Mutter D-Bus
The system SHALL apply selected profile settings to the targeted monitor asynchronously using `org.gnome.Mutter.DisplayConfig.ApplyMonitorsConfig` without displaying confirmation prompts and without blocking the compositor event loop, while keeping other connected monitors unchanged.

#### Scenario: Applying an existing profile to a monitor
- **WHEN** the user clicks on a saved profile in the top panel menu or runs the apply command
- **THEN** the system updates that monitor's mode, scale, and transform in the logical monitor layout and asynchronously calls `ApplyMonitorsConfig` with persistent mode (`method: 2`), immediately changing the resolution and scale and updating `~/.config/monitors.xml` without hanging the shell

## ADDED Requirements

### Requirement: Isolated sandbox testing environment
The system SHALL provide an automated sandbox runner (`bin/test-sandbox`) to launch the extension in a separate nested GNOME Shell Wayland instance for safe validation.

#### Scenario: Running extension in nested sandbox
- **WHEN** developer or user executes `bin/test-sandbox`
- **THEN** the runner stages the extension into a dedicated sandbox environment, starts `gnome-shell --nested --wayland` in an independent window, and enables the extension safely without affecting the host desktop session
