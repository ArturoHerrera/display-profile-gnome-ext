# Proposal: Optimize Startup Latency and Non-Blocking Extension Initialization

## Why

During GNOME session login (GDM handover to `gnome-shell`), users observe a noticeable delay in desktop readiness and a delayed appearance of the Display Profiles top-panel indicator compared to other extensions.

Profiling and architectural analysis revealed two blocking operations executed synchronously on GNOME Shell's single JavaScript thread (Gjs) during `extension.enable()` / `DisplayIndicator._init()`:
1. **Synchronous D-Bus Proxy Creation (`Gio.DBusProxy.new_for_bus_sync`)**: `DisplayManager._initProxy()` performs a synchronous roundtrip over the session bus to inspect and bind `org.gnome.Mutter.DisplayConfig`. At session startup, Mutter is actively configuring DRM/KMS hardware, probing EDIDs, and setting CRTCs. Calling a synchronous D-Bus method halts the entire compositor loop, freezing UI layout and delaying all subsequent extension loading.
2. **Synchronous Disk I/O during Initialization (`Storage._ensureDir`)**: `Storage` immediately runs `this._dir.make_directory_with_parents(null)` synchronously in its constructor when instantiated by `DisplayIndicator._init()`. Disk operations on login suffer high contention from concurrent user services starting up.

## What Changes

1. **Non-blocking Asynchronous D-Bus Proxy (`DisplayManager`)**:
   - Replace `Gio.DBusProxy.new_for_bus_sync(...)` with asynchronous `Gio.DBusProxy.new_for_bus(...)` or lazy initialization so `enable()` completes in `< 1ms`.
   - Ensure D-Bus signal subscription (`MonitorsChanged`) is attached safely once the proxy resolves asynchronously, or handle early method calls gracefully via promises without blocking the main loop.
2. **Deferred / Lazy Storage Directory Creation (`Storage`)**:
   - Remove synchronous `_ensureDir()` from the `Storage` constructor.
   - Defer directory verification until an actual write occurs (e.g. `saveAsync()`), ensuring zero disk I/O occurs when the extension is merely being enabled or when reading configurations.
3. **Instant Panel Actor Placement**:
   - Allow `Main.panel.addToStatusArea` to register the indicator immediately with zero blocking dependencies, ensuring the icon is visible on the top bar concurrently with the fastest system extensions.

## Capabilities

### Modified Capabilities
- `display-profiles`: Specify requirements for non-blocking asynchronous extension lifecycle initialization, lazy proxy resolution, and zero-sync I/O during startup.

## Non-Goals
- Changing the visual appearance or layout of the panel icon or popup menu.
- Modifying the underlying Mutter D-Bus API schema (`ApplyMonitorsConfig` / `GetCurrentState`).
- Changing the preferences window implementation (`prefs.js`).

