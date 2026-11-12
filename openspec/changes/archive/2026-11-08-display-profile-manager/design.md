# Design: Display Profile Manager GNOME Extension

## Context

The target environment is modern Fedora Linux (Fedora 44, 45, and above) running GNOME Shell 50, 51+ on Wayland with Mutter. Starting in GNOME 45, GNOME Shell migrated to pure ECMAScript Modules (ESM). Extensions interact with Mutter either through internal C bindings (which change across GNOME major releases) or through D-Bus session interfaces. Mutter exposes `org.gnome.Mutter.DisplayConfig` on the session bus, providing a stable, version-agnostic API to inspect and reconfigure display outputs.

## Goals / Non-Goals

**Goals:**
- Provide a clean, robust GNOME Shell extension built on standard ESM (`Extension` class, `PanelMenu.Button`, `PopupMenu`).
- Communicate with Mutter strictly via `org.gnome.Mutter.DisplayConfig` over D-Bus to guarantee forward and backward compatibility across GNOME Shell 45 through 51+.
- Support per-monitor profile isolation: changing settings on one monitor leaves all other active monitors untouched.
- Store monitor profiles in a JSON file at `~/.config/display-profiles/profiles.json`.
- Apply profile changes instantly using Mutter persistent mode (`method: 2`).

**Non-Goals:**
- Replacing GNOME Settings' display panel (no low-level color calibration, HDR master grading, or ICC profile management).
- Supporting legacy GNOME versions prior to 45 (legacy CommonJS / `imports.gi`).
- X11 `xrandr` support (the extension targets Wayland compositing via Mutter).

## Decisions

### 1. D-Bus `org.gnome.Mutter.DisplayConfig` vs. Internal `Meta.MonitorManager`
- **Choice:** Communicate over D-Bus with `Gio.DBus.session` to `org.gnome.Mutter.DisplayConfig`.
- **Rationale:** Calling private `Meta` classes via GObject Introspection breaks across GNOME Shell versions because internal Mutter symbols change frequently. The D-Bus interface has remained stable and backward-compatible since GNOME 40.
- **Alternatives considered:** Direct `global.display` / `Meta.MonitorManager` in-process manipulation (rejected due to high breakage risk across GNOME 50, 51, 52).

### 2. Storage: Human-readable JSON vs. GSettings
- **Choice:** Save profiles in `~/.config/display-profiles/profiles.json` using `GLib.file_set_contents` and `GLib.file_get_contents`.
- **Rationale:** Monitor profiles have nested dynamic structures (monitors -> list of profiles -> properties). GSettings requires compiled schemas (`glib-compile-schemas`), making development, manual editing, and user backups cumbersome. A JSON file in `~/.config` provides transparency and zero schema compilation overhead.
- **Alternatives considered:** GSettings with serialized string or `a{sv}` (rejected due to rigid schema compilation requirements).

### 3. Per-Monitor Profile Isolation Algorithm
- **Choice:** When applying a profile for monitor $M$:
  1. Retrieve current layout via `GetCurrentState()`.
  2. Map all current logical monitors $(x, y, \text{scale}, \text{transform}, \text{primary}, [(\text{connector}, \text{modeId}, \dots)])$.
  3. Match monitor $M$ by connector name (`connector` from `monitorspec`) or vendor/product.
  4. Replace only monitor $M$'s mode, scale, and transform in the logical monitor list, while retaining its current position and all other monitors' configurations.
  5. Invoke `ApplyMonitorsConfig(serial, method: 2, new_logical_monitors, properties)`.
- **Rationale:** Ensures switching a monitor's resolution or scale does not disconnect or reposition other active displays.

### 4. Direct Persistent Application
- **Choice:** Call `ApplyMonitorsConfig` with `method: 2` (`MUTTER_DISPLAY_CONFIG_METHOD_PERSISTENT`).
- **Rationale:** Mutter validates mode compatibility before executing. Persistent mode writes the valid layout directly to `~/.config/monitors.xml` without requiring user confirmation countdowns.

## Risks / Trade-offs

- **[Risk] Unsupported mode selected:** If a profile specifies an invalid mode for the monitor.
  → **Mitigation:** Query `GetCurrentState` before applying to verify that the target resolution and refresh rate exist in the monitor's supported mode list. If not, log a warning and notify the user via a GNOME notification.
- **[Risk] Connector name changes:** Disconnecting and reconnecting monitors can occasionally alter the connector string (e.g., `DP-2` vs `DP-3`).
  → **Mitigation:** Store both the connector string and the hardware tuple `(vendor, product, serial)` to match the monitor even if the port changes.

## Migration Plan

1. Extension files placed in `~/.local/share/gnome-shell/extensions/display-profiles@local/`.
2. Enable with `gnome-extensions enable display-profiles@local`.
3. Changes take effect on next login or via extension reload.

