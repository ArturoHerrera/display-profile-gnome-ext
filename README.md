# Display Profile Manager (GNOME Shell Extension & CLI)

[![GNOME Shell](https://img.shields.io/badge/GNOME%20Shell-45%20%7C%2046%20%7C%2047%20%7C%2048-blue.svg)](https://extensions.gnome.org/)
[![Version](https://img.shields.io/badge/Version-1.0.0-green.svg)](https://github.com/ArturoHerrera/display-profile-gnome-ext)
[![Platform](https://img.shields.io/badge/Platform-Fedora%20%7C%20Arch%20%7C%20Ubuntu%20%7C%20Debian-lightgrey.svg)](https://fedoraproject.org/)
[![Compositor](https://img.shields.io/badge/Display%20Server-Wayland%20Native-brightgreen.svg)](https://wayland.freedesktop.org/)
[![License](https://img.shields.io/badge/License-GPL--3.0-orange.svg)](LICENSE)

A lightweight, production-grade **GNOME Shell extension** and companion **CLI utility** to manage, save, and switch display profiles (resolution, fractional/integer UI scaling, refresh rate, VRR/Adaptive-Sync, and orientation) per individual monitor instantly.

Built strictly according to official **[extensions.gnome.org (EGO)](https://extensions.gnome.org)** guidelines: modern ESM architecture, asynchronous non-blocking I/O, Libadwaita preferences, full gettext internationalization (English & Spanish), and rigorous signal cleanup preventing memory leaks across Shell lifecycles.

---

## Highlights & Features

- **Per-Monitor Profiles:** Save independent configuration profiles for each physical or virtual display connected to your system.
- **Granular Display Parameters:**
  - Resolution (e.g., `3840×2160`, `2560×1440`, `1920×1080`).
  - UI Scaling (Integer and Fractional: `100%`, `125%`, `150%`, `175%`, `200%`, etc.).
  - Refresh Rate and Variable Refresh Rate (VRR / FreeSync / Adaptive-Sync).
  - Screen Orientation (Normal horizontal, 90°, 180°, 270°).
  - Primary display assignment.
- **Instant & Non-Blocking Switching:** Profile changes apply in milliseconds without confirmation dialogs and persist in `~/.config/monitors.xml`.
- **100% Asynchronous & Crash-Safe:** All Mutter D-Bus queries and disk persistence operations use Promise-based async APIs (`Gio.DBusProxy.call` and `Gio.File.replace_contents_bytes_async`), guaranteeing zero compositor stutters or deadlocks.
- **Native Libadwaita Preferences (`prefs.js`):** Inspect and delete monitor profiles cleanly via the GNOME Extensions app or `gnome-extensions prefs`.
- **Internationalization (i18n):** Full gettext localization with English base and complete Spanish translation (`po/es.po`).
- **Zero Memory Leaks:** Explicit disconnection of all D-Bus signals, Clutter/St actor callbacks, and modal dialogs during extension disable and teardown.
- **Dual Interfaces:**
  - **GNOME Shell Top Panel Indicator:** Dropdown menu with active profile indicators, quick profile switching, and profile creation modal.
  - **Standalone CLI:** Scriptable command-line tool for keybindings, terminal workflows, and automated scripts.
- **Isolated Testing Sandbox:** Built-in runner (`bin/test-sandbox`) to test extension changes in an isolated, nested Wayland session with Mutter Devkit without endangering the host desktop.

---

## Installation

### Option A: extensions.gnome.org (Recommended)

Install directly with one click from the GNOME Extensions website:
👉 **[Display Profile Manager on extensions.gnome.org](https://extensions.gnome.org/extension/display-profiles@arturoherrera/)** *(pending review)*

### Option B: Install from Release Package

Download or build `display-profiles@arturoherrera.shell-extension.zip` and run:

```bash
gnome-extensions install --force dist/display-profiles@arturoherrera.shell-extension.zip
gnome-extensions enable display-profiles@arturoherrera
```

### Option C: Manual Installation from Source

Clone this repository and copy the `src` contents into your user extensions directory:

```bash
mkdir -p ~/.local/share/gnome-shell/extensions/display-profiles@arturoherrera
cp -r src/* ~/.local/share/gnome-shell/extensions/display-profiles@arturoherrera/
gnome-extensions enable display-profiles@arturoherrera
```

*(Note: On Wayland sessions, you may need to log out and log back in for GNOME Shell to discover newly installed extensions).*

---

## Building & Packaging for EGO

To build the official distribution package ready for upload to extensions.gnome.org:

```bash
./bin/pack-ego
```

This compiles gettext catalogs (`po/` → `locale/`) and bundles all extension assets using `gnome-extensions pack` into:
`dist/display-profiles@arturoherrera.shell-extension.zip`

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

### Custom Shortcuts & Automation

You can easily bind custom keyboard shortcuts in GNOME (`Settings` → `Keyboard` → `View and Customize Shortcuts` → `Custom Shortcuts`):

- **Shortcut 1:** `Ctrl + Super + 1` → `/path/to/display-profile-gnome-ext/bin/display-profiles apply "Work 4K"`
- **Shortcut 2:** `Ctrl + Super + 2` → `/path/to/display-profile-gnome-ext/bin/display-profiles apply "Gaming 1440p"`

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
│   ├── pack-ego                # Official extensions.gnome.org packager
│   └── test-sandbox            # Isolated nested Wayland sandbox test runner
├── src/
│   ├── metadata.json           # Extension metadata & UUID (display-profiles@arturoherrera)
│   ├── extension.js            # Top panel menu indicator & modal dialogs
│   ├── prefs.js                # Native Libadwaita Preferences Window
│   ├── displayManager.js       # Asynchronous Mutter D-Bus client (Promise-based)
│   ├── storage.js              # Asynchronous JSON profile persistence manager
│   └── locale/                 # Compiled binary gettext catalogs (.mo)
├── po/
│   ├── display-profiles.pot    # Translation template
│   └── es.po                   # Spanish translation catalog
├── dist/
│   └── display-profiles@arturoherrera.shell-extension.zip # Distribution bundle
├── test/
│   └── test_sandbox_e2e.js     # End-to-end integration test suite
├── openspec/                   # Formal OpenSpec change specifications & archive
└── README.md
```

---

## License

This project is licensed under the terms of the GNU General Public License v3.0 (GPL-3.0). See [LICENSE](LICENSE) for details.
