# Tasks

## 1. Modal Dialog Orientation Bugfix

- [x] 1.1 Update `ProfileSaveDialog` in `src/extension.js` to use `Clutter.Orientation.VERTICAL` and remove obsolete `vertical: true` constructor property, verifying syntax and dialog instantiation

## 2. Menu Simplification & Typography Polish

- [x] 2.1 Remove the inline profile deletion submenus from `_buildSingleMonitorMenu` and `_buildMultiMonitorMenu` in `src/extension.js`, consolidating deletion in preferences
- [x] 2.2 Strip trailing ellipses from all action labels (`"Save Current Configuration"`, `"Preferences"`, `"Loading profiles"`) and refine profile row text formatting in `src/extension.js`

## 3. Localization, Packaging & Host Verification

- [x] 3.1 Update `po/display-profiles.pot` and Spanish translations in `po/es.po`, compiling updated `.mo` catalog
- [x] 3.2 Run `./bin/pack-ego` to generate updated distribution package and install onto host user extension directory, verifying live menu behavior
