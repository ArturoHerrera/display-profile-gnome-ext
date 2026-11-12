# Tasks: Fix Async Display Manager & Safe Nested Sandbox

## 1. Asynchronous D-Bus Refactoring

- [x] 1.1 Implement Promise-based `callMethodAsync`, `getMonitorsAsync()`, and `applyMonitorProfileAsync()` in `src/displayManager.js`, and verify with an async GJS test script that `GetCurrentState` resolves without blocking.
- [x] 1.2 Refactor `src/extension.js` to use asynchronous methods with lazy loading on `open-state-changed`, ensuring `enable()` and `_init()` contain zero synchronous blocking D-Bus calls.

## 2. Nested Shell Sandbox Tooling

- [x] 2.1 Create `bin/test-sandbox` to stage the extension into an isolated temporary test folder and execute `dbus-run-session gnome-shell --nested --wayland`, making it executable.
- [x] 2.2 Test `bin/test-sandbox` and verify that a nested GNOME Shell window opens safely with its own isolated bus and loads the extension.

## 3. End-to-End Verification & CLI Compatibility

- [x] 3.1 Verify profile saving, listing, and switching inside the nested sandbox window, ensuring the top bar icon opens smoothly without lag or deadlocks.
- [x] 3.2 Verify that `bin/display-profiles` CLI continues working seamlessly with the updated `DisplayManager`.

