# Capability: Display Profiles (Delta)

## Requirements

### Requirement: Canonical GNU General Public License v3 declaration
The project SHALL include the complete, canonical GNU General Public License v3.0 text in `LICENSE` including the FSF application appendix, ensuring that GitHub and package managers detect the SPDX license identifier `GPL-3.0-or-later` accurately.

#### Scenario: Inspecting repository license metadata
- **WHEN** GitHub or automated scanners inspect `LICENSE`
- **THEN** the license is identified as `GPL-3.0` without falling back to `Other`

### Requirement: Standard GNU copyright and license source headers
All source files in `src/` and `bin/` SHALL include a standardized copyright notice and GNU GPLv3+ permission notice at the beginning of the file.

#### Scenario: Inspecting source file headers
- **WHEN** a reviewer or developer inspects `src/extension.js`, `src/displayManager.js`, `src/storage.js`, `src/prefs.js`, or `bin/display-profiles`
- **THEN** the file begins with a standard SPDX / GNU GPL-3.0-or-later license comment

### Requirement: Standard GNU CLI version flag
The companion command-line utility `bin/display-profiles` SHALL respond to `--version` and `-v` by printing the program name, version number, and license notice to standard output and exiting with code 0.

#### Scenario: Checking CLI utility version
- **WHEN** the user executes `display-profiles --version` or `display-profiles -v`
- **THEN** the utility outputs `display-profiles 1.0.0 (GNU GPL-3.0-or-later)` and exits cleanly with code 0
