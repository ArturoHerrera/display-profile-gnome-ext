# Proposal: Fix Async Display Manager & Safe Nested Sandbox

## Why

When loaded inside GNOME Shell as an extension, synchronous D-Bus calls (`call_sync`) to `org.gnome.Mutter.DisplayConfig` cause an immediate self-deadlock because Mutter and GNOME Shell share the same single-threaded main event loop. This caused user sessions to freeze and fail to log in. Migrating to asynchronous non-blocking D-Bus calls (`call` / `call_finish` with Promises) and adding a safe nested sandbox testing utility (`bin/test-sandbox`) eliminates deadlocks and allows safe testing without risking the host desktop session.

## What Changes

- Refactor `src/displayManager.js` to use non-blocking asynchronous D-Bus proxy calls (`getMonitorsAsync()` and `applyMonitorProfileAsync()`) via Promises, while retaining backwards compatibility for CLI execution.
- Update `src/extension.js` to initialize asynchronously with lazy loading (fetching monitor state only when the menu is opened or when `MonitorsChanged` fires), eliminating blocking work from `enable()` and `_init()`.
- Add `bin/test-sandbox`, an automated utility that launches a nested GNOME Shell instance (`gnome-shell --nested --wayland`) inside a separate window on an isolated bus for safe, zero-risk testing.

## Capabilities

### Modified Capabilities
- `display-profiles`: Update monitor querying and profile application requirements to mandate non-blocking asynchronous D-Bus execution.

## Impact

- **Desktop Session:** Guarantees zero freezes or deadlocks when the extension is enabled or when monitors change.
- **Testing:** Introduces safe, isolated sandbox testing via nested Wayland sessions.
- **APIs:** Replaces `call_sync` with `call` / `call_finish` across all D-Bus interactions.

