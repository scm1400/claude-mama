# Claude Mama

## Purpose
Claude Mama is an Electron desktop mascot widget that monitors Claude Code API usage. It reads the user's OAuth credentials from `~/.claude/.credentials.json` (or platform keychains), polls the Anthropic usage API every 5 minutes, and displays a pixel-art character whose mood (angry / worried / happy / proud) reflects weekly token utilization. The app ships as a frameless, always-on-top, transparent window with no taskbar entry. It supports a quote collection system, badge achievements, share-card generation, custom character skins, and i18n across Korean, English, Japanese, and Chinese.

## Key Files
| File | Description |
|------|-------------|
| `package.json` | npm scripts, dependencies (Electron 40, React 19, electron-store, electron-updater) |
| `tsconfig.json` | Base TypeScript config shared by renderer |
| `tsconfig.main.json` | TypeScript config for the main process (CommonJS output to `dist/main/`) |
| `tsconfig.renderer.json` | TypeScript config for the renderer |
| `vite.config.ts` | Vite bundler config for the renderer |
| `vitest.config.ts` | Vitest unit test config |
| `electron-builder.yml` | electron-builder packaging config for Windows/macOS |
| `README.md` | User-facing documentation |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `src/` | All application source code |
| `scripts/` | Build-time utilities (icon generation, notarization) |
| `build/` | Static assets consumed by electron-builder (icons, installer images) |
| `docs/` | Design specs, planning documents, reference images |
| `.github/workflows/` | CI/CD pipeline for cross-platform builds and releases |
| `dist/` | Build output (gitignored) |
| `release/` | Packaged installers output (gitignored) |
| `node_modules/` | Dependencies (gitignored) |

## For AI Agents

### Working In This Directory
- The project uses **two separate TypeScript compilation targets**: `tsconfig.main.json` compiles the Electron main process to `dist/main/` as CommonJS; Vite compiles the renderer to `dist/renderer/`.
- Run `npm run dev` to start in development mode (Vite dev server + Electron). Run `npm run build` for a full production build before packaging.
- `package.json` `"type": "commonjs"` means all `.js` files are CommonJS by default; the renderer uses ESM via Vite.
- Never import Electron APIs from `src/core/` or `src/shared/` — these layers must stay pure Node/browser-compatible.
- The entry point for the packaged app is `dist/main/main/main.js`.

### Testing Requirements
- Run `npm test` (vitest) to execute all unit tests in `src/core/__tests__/`.
- Tests cover: mood engine, quote triggers, badge triggers, quote collection, contextual messages.
- There are no integration or E2E tests; test only via `vitest run`.
- When adding new core logic, add a corresponding test in `src/core/__tests__/`.

### Common Patterns
- Mood thresholds: `<15%` = angry, `15–50%` = worried, `50–85%` = happy, `≥85%` = proud.
- Error states use `MamaErrorExpression`: `'confused'` (API error) or `'sleeping'` (no credentials).
- IPC channel names are defined as constants in `src/shared/types.ts` (`IPC_CHANNELS`).
- Locale detection happens at module load time via `detectLocale()` in `src/shared/i18n.ts`.
- All user preferences are persisted through `electron-store` (accessed via `getStore()` in `src/main/ipc-handlers.ts`).

## Dependencies
### Internal
- `src/` → `build/` (icons referenced in `electron-builder.yml`)
- `scripts/make-icon.js` reads from `docs/images/character.webp` and writes to `build/`

### External
- `electron` ^40 — desktop shell
- `react` / `react-dom` ^19 — renderer UI
- `electron-store` 8.2.0 — persistent settings
- `electron-updater` ^6 — auto-update via GitHub Releases
- `auto-launch` ^5 — system startup registration
- `vite` ^7, `vitest` ^4, `typescript` ^5.9 — build and test toolchain
- `sharp`, `png-to-ico` — icon generation (dev only)

<!-- MANUAL: -->
