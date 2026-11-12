# Design: Fix Async Display Manager & Safe Nested Sandbox

## Context

GNOME Shell executes all UI, window management, and extension logic on a single main event loop thread. The compositor (Mutter) provides the D-Bus interface `org.gnome.Mutter.DisplayConfig`. When code inside GNOME Shell executes synchronous D-Bus calls (`call_sync`), the thread halts waiting for a response that only GNOME Shell's own event loop can produce, creating a self-deadlock.

## Goals / Non-Goals

**Goals:**
- Eliminate all synchronous D-Bus calls (`call_sync`) from code executed inside GNOME Shell.
- Implement Promise-based asynchronous wrappers (`callMethodAsync`) using `Gio.DBusProxy.prototype.call` and `call_finish`.
- Ensure `extension.enable()` and `_init()` execute instantaneously with zero blocking operations, deferring monitor queries to menu interaction or `MonitorsChanged` events.
- Provide `bin/test-sandbox` to run a nested GNOME Shell instance (`gnome-shell --nested --wayland`) on an isolated session bus, guaranteeing safe testing without endangering the host user session.

**Non-Goals:**
- Modifying Mutter internals or systemd services.
- Removing CLI functionality (the CLI script can still perform synchronous or asynchronous calls).

## Decisions

### 1. Promise-Based Asynchronous D-Bus Calls
- **Choice:** Wrap `proxy.call(...)` with ES6 Promises using `proxy.call_finish(...)`.
- **Rationale:** Native Promises allow clean `async/await` syntax in modern ESM extensions while allowing the GLib main loop to process events concurrently.
- **Alternatives considered:** Raw callbacks (rejected due to callback nesting complexity).

### 2. Dual API Support in `DisplayManager`
- **Choice:** Provide `getMonitorsAsync()` and `applyMonitorProfileAsync()` as the primary methods, with synchronous fallbacks for CLI scripts.
- **Rationale:** Guarantees that the GNOME Shell extension never invokes blocking sync calls while allowing standalone scripts to run synchronously if needed.

### 3. Nested Shell Sandbox Runner (`bin/test-sandbox`)
- **Choice:** Launch `dbus-run-session gnome-shell --nested --wayland` in a dedicated process with a staged temporary extensions directory.
- **Rationale:** Running in a nested window creates an isolated Wayland compositor and isolated D-Bus bus. If an error occurs, only the nested window is affected; the developer's desktop session remains completely stable.

## Risks / Trade-offs

- **[Risk] Slow D-Bus response when opening menu:** If Mutter takes milliseconds to query monitors on click.
  → **Mitigation:** Show a lightweight loading indicator item if the query takes longer than 50ms, updating seamlessly upon Promise resolution.

## Migration Plan

1. Update `src/displayManager.js` with asynchronous methods.
2. Update `src/extension.js` to use `async/await` and lazy menu loading.
3. Test using `bin/test-sandbox` in a nested window.
4. Verify all actions (opening menu, saving profile, applying profile) inside the sandbox.

