# Capability: Display Profiles (Delta)

## Requirements

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

