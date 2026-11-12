# Design

## Context

The repository contains a production-grade GNOME Shell extension and companion GJS CLI utility (`bin/display-profiles`) supporting GNOME 45 through 51 on Wayland. While the technical implementation has matured (asynchronous D-Bus, native Libadwaita preferences, automated nested sandboxing, GPLv3 compliance), the documentation in `README.md` is purely text-based without any visual media or modern UI previews.

See `proposal.md` for background motivation.

## Goals / Non-Goals

**Goals:**
- Design an organized asset hierarchy (`assets/screenshots/`) for repository visuals that render reliably on GitHub and local markdown viewers.
- Provide high-fidelity, polished visual assets showcasing:
  1. The top panel indicator dropdown menu with connected monitor profiles.
  2. The "Save Current Configuration" modal dialog.
  3. The native Libadwaita Preferences window (`prefs.js`) showing saved monitor profiles and deletion controls.
  4. The companion CLI (`bin/display-profiles`) running terminal commands with styled console output.
- Reorganize and polish `README.md` with clear section hierarchy, visual previews, verified CLI commands, troubleshooting tips, and development workflow.

**Non-Goals:**
- Modifying extension runtime code (`src/*.js`), CLI script logic (`bin/display-profiles`), or schemas.
- Relying on external image hosting services (e.g., Imgur) that may rot or fail offline.
- Adding large, unoptimized image or video files that bloat repository clone size.

## Decisions

### Decision 1: Asset Directory Structure
- **Choice**: Store images under `assets/screenshots/` at the repository root.
- **Rationale**: Standard practice in GitHub repositories. Relative links `assets/screenshots/<filename>` work seamlessly in GitHub markdown, offline clones, and documentation viewers.
- **Alternatives Considered**:
  - `docs/img/`: Unnecessary depth since there is no multi-page docs site currently.
  - External URL hosting: Fragile, prone to broken links and privacy blockers.

### Decision 2: Asset Visuals & Formatting
- **Choice**: Produce clean, high-resolution visual previews (optimized PNGs or crisp SVGs) featuring GNOME Shell dark Adwaita styling, centered with markdown figures or inline images with descriptive alt-text.
- **Rationale**: GNOME Shell's top panel and menus default to dark styling; adhering to standard Adwaita Dark aesthetics provides an authentic look. Keeping file sizes under 200 KB ensures fast loading.
- **Alternatives Considered**:
  - Full desktop screenshots: Excessive blank space, large file sizes, and low legibility of UI details. Cropped/focused component captures offer vastly superior clarity.

### Decision 3: README Structure & Content Flow
- **Choice**: Adopt a standard user-centric layout:
  1. Header, badges, and one-paragraph elevator pitch.
  2. Visual Showcase (top panel menu & preferences window side-by-side or carousel).
  3. Key Features summary with emoji icons.
  4. Quick Installation (EGO, release package, manual from git).
  5. Graphical UI Walkthrough.
  6. Comprehensive CLI Reference (status, list, save, add, apply, delete, flags).
  7. Keyboard shortcut automation examples.
  8. Development, Testing (`bin/test-sandbox`), and Packaging (`bin/pack-ego`).
  9. Project structure tree and License.
- **Rationale**: Users see what the software looks like immediately, followed by quick setup and complete reference.

## Risks / Trade-offs

- **[Risk]** Repository size bloat from binary image files.
  - **Mitigation**: Optimize image assets (compress PNGs / use clean SVGs) to keep total media footprint under 500 KB.
- **[Risk]** Broken relative image paths when viewing packaged distributions.
  - **Mitigation**: Exclude `assets/` from the EGO zip packaging (`bin/pack-ego` already packages only `src/` files) so the zip remains minimal (<30 KB), while git and GitHub render the relative paths cleanly.

