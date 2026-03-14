<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-14 -->

# docs/

## Purpose
Design reference materials, planning documents, and visual assets for the Claude Mama project. This directory is not part of the build — nothing here is imported by the application at runtime (except `images/character.webp`, which is the source artwork consumed by `scripts/make-icon.js`).

## Key Files
| File | Description |
|------|-------------|
| *(no files at the root level)* | All content is in subdirectories |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `images/` | Reference and source images: `character.webp` (source artwork for icon generation), `claude-mama.png`, `happy.png`, `proud.png`, `angry.png`, `worried_1.png`, `worried_2.png`, `share-card-example.png` |
| `superpowers/` | Planning and specification documents: `plans/` (feature plans), `specs/` (technical specifications) |

## For AI Agents

### Working In This Directory
- `images/character.webp` is the canonical source image for all application icons and tray graphics. If it is updated, run `npm run make-icon` to regenerate `build/` assets.
- All other images in `images/` are reference screenshots or mood expression references — they are not imported by the build or application.
- Documents in `superpowers/plans/` and `superpowers/specs/` are design and planning artifacts. They describe intended behavior but may not perfectly reflect the current implementation. When there is a conflict, the source code is authoritative.
- Do not create new files in `docs/` as part of feature implementation — code goes in `src/`.

### Testing Requirements
- Not applicable. This directory contains no executable code.

### Common Patterns
- Planning documents use Markdown.
- Spec documents describe the data model, trigger logic, and UI behavior at a level above the implementation.

## Dependencies
### Internal
- `images/character.webp` → consumed by `scripts/make-icon.js`

### External
- None

<!-- MANUAL: -->
