# Tasks: Optimize Startup Latency and Non-Blocking Extension Initialization

## 1. Storage Non-blocking Optimization
- [x] 1.1 Remove synchronous `_ensureDir()` call from `Storage.constructor` in `src/storage.js`
- [x] 1.2 Implement `_ensureDirAsync()` using `make_directory_with_parents_async` and call it before writing in `saveAsync()`
- [x] 1.3 Ensure `loadAsync()` and `getProfilesAsync()` continue to work cleanly when directory or file does not exist

## 2. DisplayManager Asynchronous D-Bus Proxy
- [x] 2.1 Replace synchronous `_initProxy()` with an asynchronous `_ensureProxyAsync()` in `src/displayManager.js`
- [x] 2.2 Use `Gio.DBusProxy.new_for_bus(...)` with a `Gio.Cancellable` for background proxy initialization
- [x] 2.3 Connect `MonitorsChanged` g-signal safely once the proxy resolves
- [x] 2.4 Update `_callMethodAsync` to await `_ensureProxyAsync()`
- [x] 2.5 Ensure `destroy()` cancels any pending proxy creation and disconnects signal cleanly

## 3. Extension Enable Latency Verification
- [x] 3.1 Verify `extension.enable()` registers indicator on `Main.panel` with zero synchronous blocking calls
- [x] 3.2 Run sandbox E2E test suite (`test/test_sandbox_e2e.js`) to verify end-to-end functionality
- [x] 3.3 Package extension with `bin/pack-ego` and update local installed extension in `~/.local/share/gnome-shell/extensions/`

