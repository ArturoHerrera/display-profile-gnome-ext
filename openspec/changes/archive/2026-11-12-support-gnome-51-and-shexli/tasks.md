# Tasks

## 1. Metadata and Extension Version Compatibility

- [x] 1.1 Update `src/metadata.json` to declare supported versions `"45"`, `"46"`, `"47"`, `"48"`, `"49"`, `"50"`, and `"51"` in `shell-version`, verifying JSON validity with `jq . src/metadata.json`.
- [x] 1.2 Run `bin/test-sandbox --check` and verify GNOME Shell 51 activates the extension in `state: 1.0` (`ENABLED`) without out-of-date status errors.

## 2. Shexli Tooling and Analysis Runner

- [x] 2.1 Create runner script `bin/lint-shexli` that provisions a dedicated Python virtualenv (`.venv-shexli`), installs `shexli`, and is executable with `chmod +x`.
- [x] 2.2 Configure `bin/lint-shexli` to handle the `major > 50` boundary in Shexli 0.2.1 so that GNOME 51 is recognized and all AST/lifecycle rules are enforced.
- [x] 2.3 Execute `bin/lint-shexli` against `src/` and verify that Shexli reports 0 errors and 0 critical warnings.

## 3. Packaging Pipeline Integration & Final Verification

- [x] 3.1 Update `bin/pack-ego` to execute `bin/lint-shexli` as part of the packaging pipeline before creating the final distribution archive.
- [x] 3.2 Run `bin/pack-ego` and verify the `.shell-extension.zip` in `dist/` is successfully created, contains the updated `metadata.json`, and passes Shexli validation.

