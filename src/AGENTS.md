<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-14 -->

# src/

## Purpose
The `src/` directory contains all application source code, organized into four layers that enforce a strict dependency hierarchy: `shared` (types and i18n consumed everywhere), `core` (pure business logic with no Electron dependency), `main` (Electron main process), and `renderer` (React frontend). This layering ensures that core logic is fully unit-testable without an Electron environment.

## Key Files
| File | Description |
|------|-------------|
| *(no files at this level)* | All code lives in subdirectories |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `core/` | Pure business logic: mood computation, usage tracking, messages, quotes, badges |
| `main/` | Electron main process: window management, IPC, tray, auto-update, skin manager |
| `renderer/` | React frontend: components, hooks, pages, styles |
| `shared/` | Types and i18n shared between main and renderer |

## For AI Agents

### Working In This Directory
- **Dependency rules** (strictly enforced): `renderer` may import from `shared` and `core`. `main` may import from `shared` and `core`. `core` may only import from `shared`. `shared` has no internal imports.
- Never add Electron imports to `core/` or `shared/` — these layers are used in both the Node main process and the Vite renderer, and must not pull in Electron.
- The `core/` and `shared/` layers are compiled by both `tsconfig.main.json` and Vite, so they must be valid in both environments.

### Testing Requirements
- Only `core/` has automated tests (in `core/__tests__/`). Run with `npm test`.
- `renderer/` and `main/` have no automated tests; validate changes manually via `npm run dev`.

### Common Patterns
- All cross-process communication uses named IPC channels defined in `shared/types.ts`.
- Locale is always passed explicitly as a `Locale` parameter rather than read globally at call time.
- New features that span multiple layers should start with a type addition in `shared/types.ts`.

## Dependencies
### Internal
- `core/` ← `shared/`
- `main/` ← `core/`, `shared/`
- `renderer/` ← `core/` (message pools for debug), `shared/`

### External
- All external dependencies are declared at the repo root `package.json`.

<!-- MANUAL: -->
