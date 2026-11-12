# Design: Release v1 Polish, Remote License Recognition, and GNU Compliance

## Overview

This change brings Display Profile Manager into full alignment with FSF/GNU distribution standards and GitHub automated repository categorization.

## Implementation Details

### 1. `LICENSE` Synchronization
Fetch and write the exact canonical text of the GNU General Public License v3 from the official repository template, ensuring all 674 lines (including the appendix) are present.

### 2. Source Headers
Insert the following standard header at the top of `src/extension.js`, `src/displayManager.js`, `src/storage.js`, `src/prefs.js`, and `bin/display-profiles`:

```javascript
/*
 * Display Profile Manager
 * Copyright (C) 2026 Arturo Herrera
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
```

### 3. CLI Version Handling
In `bin/display-profiles`:
```javascript
if (cmd === '--version' || cmd === '-v' || cmd === 'version') {
    print('display-profiles 1.0.0 (GNU GPL-3.0-or-later)');
    print('Copyright (C) 2026 Arturo Herrera');
    print('License GPLv3+: GNU GPL version 3 or later <https://gnu.org/licenses/gpl.html>.');
    print('This is free software: you are free to change and redistribute it.');
    print('There is NO WARRANTY, to the extent permitted by law.');
    system.exit(0);
}
```

### 4. README & Logging
- In `README.md`, update the GNOME Shell shield badge to `45%20--%2051`.
- In `src/extension.js`, replace `.catch(console.error)` with explicit tag logging.
