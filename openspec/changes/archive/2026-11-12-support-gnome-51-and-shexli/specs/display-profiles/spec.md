# Spec Delta

## MODIFIED Requirements

### Requirement: Official EGO metadata and UUID identification
The extension SHALL use the unique identifier `display-profiles@arturoherrera`, declare compatibility with GNOME Shell versions 45 through 51 in `metadata.json`, and define the `gettext-domain` matching the UUID.

#### Scenario: Inspecting extension metadata
- **WHEN** GNOME Shell or extensions.gnome.org validator loads `metadata.json`
- **THEN** the metadata specifies uuid `display-profiles@arturoherrera`, valid semantic versioning starting at 1, gettext domain `display-profiles@arturoherrera`, and supported shell-versions `["45", "46", "47", "48", "49", "50", "51"]`

### Requirement: Compliant EGO distribution packaging
The project SHALL provide an automated packaging tool (`bin/pack-ego`) that compiles gettext translation files (`po/*.po`) into binary catalogs (`locale/*/LC_MESSAGES/*.mo`), bundles the extension using `gnome-extensions pack` into a distributable archive ready for upload to extensions.gnome.org, and verifies the bundle against Shexli static analysis.

#### Scenario: Building distribution package
- **WHEN** the developer executes `bin/pack-ego`
- **THEN** gettext `.mo` files are compiled, schema assets and sources are packaged via `gnome-extensions pack`, and a valid `.shell-extension.zip` is created in `dist/` passing EGO static validation checks

## ADDED Requirements

### Requirement: Shexli static analysis audit
The project SHALL provide an automated verification script or task that runs the Shexli static analyzer against the extension bundle to ensure zero lifecycle leaks, zero unsafe subprocess executions, and zero deprecated API usages.

#### Scenario: Running Shexli static audit
- **WHEN** the static analysis audit is executed against the extension sources
- **THEN** Shexli evaluates AST reachability, lifecycle hooks (`enable` and `disable`), GObject signal disconnections, and metadata compliance, producing a clean exit status without critical errors

