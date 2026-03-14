<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-14 -->

# scripts/

## Purpose
Build-time utility scripts that run outside the Electron app. `make-icon.js` generates all platform-specific icon and installer image assets from the source character artwork. `notarize.js` is an electron-builder afterSign hook that submits the packaged macOS `.app` to Apple's notarization service.

## Key Files
| File | Description |
|------|-------------|
| `make-icon.js` | Reads `docs/images/character.webp`, uses `sharp` to resize and composite, and writes: `build/icon.png` (512×512, macOS), `build/tray-icon.png` (32×32, runtime tray), `build/icon.ico` (256×256 via `png-to-ico`, Windows), `build/installerSidebar.bmp` (164×314, NSIS sidebar), `build/installerHeader.bmp` (150×57, NSIS header), `build/dmg-background.png` (540×380, macOS DMG). Run with `npm run make-icon`. |
| `notarize.js` | electron-builder `afterSign` hook. Calls `@electron/notarize` with `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, and `APPLE_TEAM_ID` environment variables. No-ops on non-macOS platforms. Invoked automatically by electron-builder during `npm run build:mac`. |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| *(none)* | — |

## For AI Agents

### Working In This Directory
- `make-icon.js` uses CommonJS `require()` — it is a plain Node script, not compiled TypeScript.
- The source artwork must be at `docs/images/character.webp`. If the character art changes, re-run `npm run make-icon` to regenerate all build assets.
- `notarize.js` requires three environment variables at build time: `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, `APPLE_TEAM_ID`. These are set as GitHub Actions secrets in `.github/workflows/build.yml`.
- Do not run `notarize.js` manually — it is invoked by electron-builder's `afterSign` hook configured in `electron-builder.yml`.
- The NSIS installer images (`.bmp`) must be exact pixel dimensions: sidebar 164×314, header 150×57. `sharp` enforces this via `removeAlpha()` + BMP output.
- The DMG background (540×380 PNG) must have a transparent-safe format — `sharp` outputs PNG here (not BMP).

### Testing Requirements
- Run `npm run make-icon` and verify all six output files appear in `build/` with correct dimensions using any image viewer.
- `notarize.js` is tested implicitly by the macOS CI job in `.github/workflows/build.yml`.

### Common Patterns
- Sharp pipeline pattern used throughout `make-icon.js`:
  ```js
  await sharp(src)
    .resize(W, H, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(outPath);
  ```
- Composite (SVG background + character image):
  ```js
  await sharp(Buffer.from(svgString))
    .composite([{ input: charBuf, left: x, top: y }])
    .removeAlpha()
    .toFile(outPath);
  ```

## Dependencies
### Internal
- Reads from `docs/images/character.webp`
- Writes to `build/`

### External
- `sharp` ^0.34 — image processing
- `png-to-ico` ^3 — PNG-to-ICO conversion
- `@electron/notarize` — Apple notarization (consumed by `notarize.js`)

<!-- MANUAL: -->
