# Proposal: Display Profile Manager GNOME Extension

## Why

Changing display resolution, UI scaling, and refresh rates across different use cases (programming, gaming, media) on GNOME requires repeatedly navigating the settings app and manually tuning each option. On multi-monitor or high-DPI setups (such as 4K UHD monitors), users need a fast, 1-click way to switch between tailored display profiles for individual monitors without leaving their current workflow.

## What Changes

- Create a lightweight, native GNOME Shell extension (`display-profiles@local`) supporting modern GNOME Shell ESM architecture (GNOME 45, 50 [Fedora 44], 51 [Fedora 45] and future versions).
- Introduce per-monitor display profile management: resolution (width x height), UI scale (fractional or integer), refresh rate / VRR (Variable Refresh Rate), and orientation.
- Provide a top bar panel indicator (`PanelMenu.Button`) for quick profile switching and 1-click saving of the current active monitor settings.
- Implement instant display profile application via Mutter's official D-Bus interface (`org.gnome.Mutter.DisplayConfig`), updating both the compositor runtime and persistent monitor configuration without disruptive confirmation prompts.
- Persist user profiles in a human-readable JSON file (`~/.config/display-profiles/profiles.json`).

## Capabilities

### New Capabilities
- `display-profiles`: Covers monitor detection via Mutter D-Bus, creating and managing per-monitor profiles (resolution, scale, refresh rate, VRR, transform), persistence in JSON, and instant profile application via `org.gnome.Mutter.DisplayConfig`.

### Modified Capabilities
<!-- None, this is a new project -->

## Impact

- **Desktop Environment:** Integrates with GNOME Shell (45 through 51+) using modern ES Modules.
- **System APIs:** Communicates with `org.gnome.Mutter.DisplayConfig` on the D-Bus session bus.
- **Filesystem:** Reads and writes `~/.config/display-profiles/profiles.json` and updates Mutter's `~/.config/monitors.xml` via D-Bus.
- **Dependencies:** Uses standard GObject Introspection bindings (`Gio`, `GLib`, `St`, `Clutter`, `GObject`) already present in Fedora/GNOME Shell without external npm or binary dependencies.

