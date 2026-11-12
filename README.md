# Display Profile Manager (GNOME Shell Extension & CLI)

[![GNOME Shell](https://img.shields.io/badge/GNOME%20Shell-45%20%7C%2046%20%7C%2047%20%7C%2048%20%7C%2049%20%7C%2050%20%7C%2051%2B-blue.svg)](https://extensions.gnome.org/)
[![Platform](https://img.shields.io/badge/Platform-Fedora%20%7C%20Arch%20%7C%20Ubuntu%20%7C%20Debian-lightgrey.svg)](https://fedoraproject.org/)
[![Compositor](https://img.shields.io/badge/Display%20Server-Wayland%20Native-brightgreen.svg)](https://wayland.freedesktop.org/)
[![License](https://img.shields.io/badge/License-GPL--3.0-orange.svg)](LICENSE)

A lightweight, native **GNOME Shell extension** and companion **CLI utility** to manage, save, and switch display profiles (resolution, fractional/integer UI scaling, refresh rate, VRR/Adaptive-Sync, and orientation) per individual monitor instantly.

Designed and thoroughly validated on modern **Fedora Linux (GNOME Shell 50, 51+) on Wayland**, utilizing modern ESM architecture and pure asynchronous IPC via Mutter's D-Bus interface (`org.gnome.Mutter.DisplayConfig`).

---

## Highlights & Features

- **Per-Monitor Profiles:** Save independent configuration profiles for each physical or virtual display connected to your system.
- **Granular Display Parameters:**
  - Resolution (e.g., `3840×2160`, `2560×1440`, `1920×1080`).
  - UI Scaling (Integer and Fractional: `100%`, `125%`, `150%`, `175%`, `200%`, etc.).
  - Refresh Rate and Variable Refresh Rate (VRR / FreeSync / Adaptive-Sync).
  - Screen Orientation (Normal horizontal, 90°, 180°, 270°).
  - Primary display assignment.
- **Instant & Non-Blocking Switching:** Profile changes apply in milliseconds without annoying countdown confirmation dialogs and persist in `~/.config/monitors.xml`.
- **100% Asynchronous & Crash-Safe:** All D-Bus calls inside GNOME Shell use Promise-wrapped asynchronous proxies (`Gio.DBusProxy.prototype.call`), preventing compositor event-loop deadlocks and session freezes.
- **Transparent Storage:** Profiles are saved in human-readable JSON at `~/.config/display-profiles/profiles.json`.
- **Dual Interfaces:**
  - **GNOME Shell Top Panel Indicator:** Intuitive dropdown menu with quick profile switching, current mode badges, and a profile creation modal.
  - **Standalone CLI:** Fast, scriptable command-line tool for keybindings, terminal workflows, and automated scripts.
- **Isolated Testing Sandbox:** Built-in runner (`bin/test-sandbox`) to test extension changes in an isolated, nested Wayland session with Mutter Devkit without endangering the host desktop.

---

## Installation

### Prerequisites

- GNOME Shell 45, 46, 47, 48, 49, 50, 51 or newer.
- GJS (GNOME JavaScript runtime, installed by default on GNOME systems).
- Wayland session (also compatible with X11).

### Installing the GNOME Shell Extension

#### Option A: Install from pre-built ZIP (Fastest)

```bash
gnome-extensions install --force display-profiles@local.shell-extension.zip
gnome-extensions enable display-profiles@local
```

#### Option B: Manual Installation from Source

Clone this repository and copy the `src` contents into your user extensions directory:

```bash
mkdir -p ~/.local/share/gnome-shell/extensions/display-profiles@local
cp -r src/* ~/.local/share/gnome-shell/extensions/display-profiles@local/
gnome-extensions enable display-profiles@local
```

*(Note: On Wayland sessions, you may need to log out and log back in for GNOME Shell to discover newly installed extensions).*

---

## CLI Usage (`bin/display-profiles`)

The included command-line tool allows inspecting monitors, saving new profiles, and switching display modes without opening any graphical menus:

```bash
# View current status of all connected monitors
./bin/display-profiles status

# List all saved profiles per monitor (shows which profile is actively applied)
./bin/display-profiles list

# Save current monitor settings as a new profile
./bin/display-profiles save "Work 4K"
./bin/display-profiles save "Gaming 1440p" DP-3

# Create a profile manually specifying resolution and UI scale factor
./bin/display-profiles add "Reading 150%" 3840x2160 150%
./bin/display-profiles add "Competitive Gaming" 2560x1440 100%

# Apply a saved profile instantly
./bin/display-profiles apply "Reading 150%"
./bin/display-profiles apply "Work 4K"

# Delete an existing profile
./bin/display-profiles delete "Reading 150%"
```

### Automation & Keybindings

You can easily bind custom keyboard shortcuts in GNOME (`Settings` → `Keyboard` → `View and Customize Shortcuts` → `Custom Shortcuts`):

- **Shortcut 1:** `Ctrl + Super + 1` → `/path/to/display-profile-gnome-ext/bin/display-profiles apply "Work 4K"`
- **Shortcut 2:** `Ctrl + Super + 2` → `/path/to/display-profile-gnome-ext/bin/display-profiles apply "Gaming 1440p"`

---

## GNOME Shell Quick Menu

Once enabled, a display icon appears in the GNOME Shell top panel status area:

1. **Click the icon** to view detected monitors and active display parameters.
2. **Select any profile** from the list to apply it immediately. A `●` checkmark identifies the active profile.
3. **Save Current Configuration:** Click `➕ Guardar configuración actual...` to open a modal dialog and name your current display mode as a new profile.
4. **Delete Profiles:** Access `🗑️ Eliminar un perfil...` to remove obsolete profiles.

---

## Isolated Sandbox Testing (`bin/test-sandbox`)

When developing GNOME Shell extensions, running untested code directly inside your main session can freeze your desktop if bugs occur. This project includes an isolated sandbox runner:

```bash
# Launch an isolated nested GNOME Shell Wayland instance in a window
./bin/test-sandbox

# Run an automated headless sanity check of extension loading and D-Bus IPC
./bin/test-sandbox --check
```

The sandbox creates isolated temporary directories for `XDG_RUNTIME_DIR`, `XDG_CONFIG_HOME`, and `XDG_DATA_HOME`, loading the extension inside an isolated session bus via `dbus-run-session` and Mutter Devkit. The host session remains completely untouched.

---

## Project Structure

```
.
├── bin/
│   ├── display-profiles        # Standalone GJS CLI utility
│   └── test-sandbox            # Isolated nested Wayland sandbox test runner
├── src/
│   ├── metadata.json           # GNOME Shell extension metadata
│   ├── extension.js            # Top panel menu indicator & modal dialogs
│   ├── displayManager.js       # Asynchronous Mutter D-Bus client (Promise-based)
│   └── storage.js              # JSON profile persistence manager (~/.config)
├── test/
│   └── test_sandbox_e2e.js     # End-to-end integration test suite
├── openspec/                   # Formal OpenSpec change specifications & archive
├── display-profiles@local.shell-extension.zip # Packaged extension bundle
├── .devkit/                    # Preload wrapper & local devkit fallback for GNOME 51
└── README.md
```

---

## Architecture & Technical Details

- **IPC Engine:** Uses `org.gnome.Mutter.DisplayConfig` over the D-Bus session bus.
  - Queries: `GetCurrentState` asynchronously retrieves serial numbers, modes, and logical layout matrices.
  - Changes: `ApplyMonitorsConfig` applies new layouts persistently (`method: 2`).
- **Non-blocking Event Loop:** `Gio.DBusProxy.prototype.call` with `call_finish` wrapped in native Promises ensures zero latency or lockups during compositor rendering.
- **Single-Thread Safety:** Lazy loading on `open-state-changed` avoids executing heavy queries during GNOME Shell startup.

---

## License

GPL-3.0 License. Contributions, bug reports, and pull requests are welcome!
