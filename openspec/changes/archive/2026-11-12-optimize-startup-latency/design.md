# Design: Optimize Startup Latency and Non-Blocking Extension Initialization

## Architecture Overview

GNOME Shell operates on a single-threaded Gjs/Mutter loop. Any blocking I/O or synchronous D-Bus IPC during session start stalls the compositor and noticeably delays panel rendering.

To eliminate this latency, we restructure `DisplayManager` and `Storage` to be completely non-blocking during instantiation.

```mermaid
sequenceDiagram
    autonumber
    actor Shell as GNOME Shell (Session Login)
    participant Ext as DisplayProfileExtension
    participant Ind as DisplayIndicator
    participant DM as DisplayManager
    participant Stor as Storage
    participant DBus as D-Bus / Mutter
    participant FS as Local Filesystem

    Shell->>Ext: enable()
    Ext->>Ind: new DisplayIndicator()
    Ind->>DM: new DisplayManager() (Non-blocking async proxy init)
    DM--)DBus: Gio.DBusProxy.new_for_bus(...) [background]
    Ind->>Stor: new Storage() (No I/O in constructor)
    Ext->>Shell: Main.panel.addToStatusArea(...)
    Note over Shell,Ext: enable() finishes in < 1ms; icon renders immediately!

    DBus-->>DM: Proxy Ready -> attach MonitorsChanged signal
    Note over Ind,FS: When user opens menu or saves profile, async queries execute seamlessly
```

## Detailed Technical Design

### 1. `DisplayManager` Asynchronous D-Bus Proxy

Currently:
```javascript
this._proxy = Gio.DBusProxy.new_for_bus_sync(Gio.BusType.SESSION, ...);
```
Changes:
- Add `_cancellable = new Gio.Cancellable()`.
- Add `_proxyPromise = null`.
- Implement `_ensureProxyAsync()`:
  - If `this._proxy` exists, return it immediately.
  - If `this._proxyPromise` is already in flight, await it.
  - Otherwise, construct the proxy asynchronously via `Gio.DBusProxy.new_for_bus(Gio.BusType.SESSION, Gio.DBusProxyFlags.NONE, null, 'org.gnome.Mutter.DisplayConfig', '/org/gnome/Mutter/DisplayConfig', 'org.gnome.Mutter.DisplayConfig', this._cancellable, (initable, res) => { ... })`.
  - Upon callback, retrieve the proxy via `Gio.DBusProxy.new_for_bus_finish(res)`, connect the `g-signal` for `MonitorsChanged`, and resolve the promise.
- Trigger `_ensureProxyAsync()` in constructor as a non-blocking background task.
- When `_callMethodAsync(method, params)` is invoked, await `_ensureProxyAsync()` before making the call.
- In `destroy()`:
  - Cancel `this._cancellable.cancel()`.
  - Disconnect the D-Bus signal if attached.
  - Null out references.

### 2. `Storage` Non-Blocking Directory Management

Currently:
```javascript
constructor(...) {
    ...
    this._ensureDir(); // synchronous mkdir
}
```
Changes:
- Remove `_ensureDir()` from `constructor()`.
- Implement `_ensureDirAsync()`:
  - Uses `this._dir.make_directory_with_parents_async(GLib.PRIORITY_DEFAULT, null, (dir, res) => { ... })`.
  - Catches `Gio.IOErrorEnum.EXISTS` silently.
- Call `_ensureDirAsync()` inside `saveAsync()` immediately before saving the profiles file.
- `loadAsync()` already handles `NOT_FOUND` gracefully and does not need the directory to pre-exist.

### 3. Verification & Metrics

- Profile the execution time of `enable()` via `console.time('DisplayProfiles enable')` / `console.timeEnd()`. Expected execution time is under 2ms (previously 50ms - 500ms+ depending on display hardware).
- Ensure all existing unit and sandbox E2E tests pass (`test/test_sandbox_e2e.js`).
- Verify extension disables cleanly without leaving unresolved async callbacks or leaked handlers.

