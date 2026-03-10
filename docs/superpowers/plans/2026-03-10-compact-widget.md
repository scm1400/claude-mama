# Compact Widget Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Claude Mama widget from a fixed 250x300 always-expanded window to a compact mini mode with hover/auto-expand and direct drag-to-move.

**Architecture:** The window stays at a fixed 200x250 transparent size. Mini/expanded states are pure CSS transitions — no window resizing. Hit-test based `setIgnoreMouseEvents` switching enables drag on the character area while keeping the rest click-through. Expansion direction is calculated from screen position.

**Tech Stack:** Electron 40, React 19, TypeScript, electron-store

**Spec:** `docs/superpowers/specs/2026-03-10-compact-widget-design.md`

---

## Chunk 1: IPC & Main Process Foundation

### Task 1: Add new IPC channels and update types

**Files:**
- Modify: `src/shared/types.ts` — add new IPC channel constants, make `position` optional in MamaSettings
- Modify: `src/main/preload.ts` — expose new channels
- Modify: `src/renderer/electron.d.ts` — add type declarations

- [ ] **Step 1: Add IPC channel constants and update MamaSettings**

In `src/shared/types.ts`, add to the `IPC_CHANNELS` const:

```typescript
SET_IGNORE_MOUSE: 'mama:set-ignore-mouse',
SAVE_POSITION: 'mama:save-position',
SHOW_CONTEXT_MENU: 'mama:show-context-menu',
```

In the `MamaSettings` interface, make `position` optional to allow gradual migration:

```typescript
position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
```

- [ ] **Step 2: Add preload bridge methods**

In `src/main/preload.ts`, add to the `CHANNELS` const:

```typescript
SET_IGNORE_MOUSE: 'mama:set-ignore-mouse',
SAVE_POSITION: 'mama:save-position',
SHOW_CONTEXT_MENU: 'mama:show-context-menu',
```

Add to the `contextBridge.exposeInMainWorld` object:

```typescript
setIgnoreMouse: (ignore: boolean): void => {
  ipcRenderer.send(CHANNELS.SET_IGNORE_MOUSE, ignore);
},

savePosition: (x: number, y: number): void => {
  ipcRenderer.send(CHANNELS.SAVE_POSITION, x, y);
},

showContextMenu: (): void => {
  ipcRenderer.send(CHANNELS.SHOW_CONTEXT_MENU);
},
```

- [ ] **Step 3: Add TypeScript declarations**

In `src/renderer/electron.d.ts`, add to the `ElectronAPI` interface:

```typescript
setIgnoreMouse(ignore: boolean): void;
savePosition(x: number, y: number): void;
showContextMenu(): void;
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc -p tsconfig.main.json --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/shared/types.ts src/main/preload.ts src/renderer/electron.d.ts
git commit -m "feat(ipc): add set-ignore-mouse and save-position channels"
```

### Task 2: Handle new IPC in main process

**Files:**
- Modify: `src/main/main.ts` — window size, position restore, IPC listeners
- Modify: `src/main/ipc-handlers.ts` — remove preset position logic, add new handlers

- [ ] **Step 1: Update window creation in main.ts**

In `createWindow()`, change window dimensions and position loading:

```typescript
const winWidth = 200;
const winHeight = 250;

// Restore saved position or default to bottom-right
const store = getStore();
const savedPos = (store as any).get('windowPosition', null) as { x: number; y: number } | null;

let x: number, y: number;
if (savedPos) {
  x = savedPos.x;
  y = savedPos.y;
} else {
  x = width - winWidth - 16;
  y = height - winHeight - 16;
}

const win = new BrowserWindow({
  width: winWidth,
  height: winHeight,
  x,
  y,
  // ... rest unchanged
});
```

- [ ] **Step 2: Add IPC listeners in main.ts with screen bounds clamping**

After `registerIpcHandlers(win, collectionManager);`, add:

```typescript
ipcMain.on(IPC_CHANNELS.SET_IGNORE_MOUSE, (_event, ignore: boolean) => {
  if (win && !win.isDestroyed()) {
    if (ignore) {
      win.setIgnoreMouseEvents(true, { forward: true });
    } else {
      win.setIgnoreMouseEvents(false);
    }
  }
});

ipcMain.on(IPC_CHANNELS.SAVE_POSITION, (_event, rawX: number, rawY: number) => {
  // Use nearest display for multi-monitor support
  const display = screen.getDisplayNearestPoint({ x: rawX, y: rawY });
  const { x: areaX, y: areaY, width: areaW, height: areaH } = display.workArea;
  const [winW, winH] = [200, 250];
  const x = Math.max(areaX, Math.min(rawX, areaX + areaW - winW));
  const y = Math.max(areaY, Math.min(rawY, areaY + areaH - winH));

  const store = getStore();
  (store as any).set('windowPosition', { x, y });

  // Snap window if it was dragged out of bounds
  if (win && !win.isDestroyed() && (x !== rawX || y !== rawY)) {
    win.setPosition(x, y);
  }
});

ipcMain.on(IPC_CHANNELS.SHOW_CONTEXT_MENU, () => {
  const locale = getStore().get('locale', 'ko') as Locale;
  const menu = Menu.buildFromTemplate([
    { label: 'Settings...', click: () => showSettingsWindow() },
    { type: 'separator' },
    { label: isVisible ? 'Hide Mama' : 'Show Mama', click: () => {
      if (win.isVisible()) win.hide(); else win.show();
    }},
    { label: 'Quit', click: () => app.quit() },
  ]);
  menu.popup({ window: win });
});
```

- [ ] **Step 3: Remove old applyPosition from ipc-handlers.ts**

In `src/main/ipc-handlers.ts`:
- Remove the `applyPosition()` function entirely
- Remove the `if (settings.position && mainWindow ...)` block from `SETTINGS_SET` handler
- Remove `position` from the store defaults (keep other defaults)

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc -p tsconfig.main.json --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/main/main.ts src/main/ipc-handlers.ts
git commit -m "feat(main): dynamic mouse events, position save/restore with bounds clamping"
```

## Chunk 2: Renderer Components

### Task 3: Create useWidgetMode hook

**Files:**
- Create: `src/renderer/hooks/useWidgetMode.ts`

This hook manages the mini/expanded state with hover and auto-expand logic.

- [ ] **Step 1: Create the hook**

```typescript
import { useState, useRef, useCallback, useEffect } from 'react';

export type WidgetMode = 'mini' | 'expanded';
export type ExpandDirection = 'up' | 'down';

interface UseWidgetModeReturn {
  mode: WidgetMode;
  direction: ExpandDirection;
  hasNewMessage: boolean;
  onCharacterEnter: () => void;
  onCharacterLeave: () => void;
  onCharacterClick: () => void;
  notifyNewMessage: () => void;
  clearNewMessage: () => void;
  scheduleCollapse: (delay: number) => void;
}

export function useWidgetMode(): UseWidgetModeReturn {
  const [mode, setMode] = useState<WidgetMode>('mini');
  const [direction, setDirection] = useState<ExpandDirection>('up');
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const collapseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHovering = useRef(false);

  const cancelCollapse = () => {
    if (collapseTimer.current) {
      clearTimeout(collapseTimer.current);
      collapseTimer.current = null;
    }
  };

  const scheduleCollapse = useCallback((delay: number) => {
    cancelCollapse();
    collapseTimer.current = setTimeout(() => {
      if (!isHovering.current) {
        setMode('mini');
      }
      collapseTimer.current = null;
    }, delay);
  }, []);

  const computeDirection = useCallback((): ExpandDirection => {
    const screenH = window.screen.availHeight;
    const winY = window.screenY;
    const winH = window.outerHeight;
    return (winY + winH / 2) > (screenH / 2) ? 'up' : 'down';
  }, []);

  const onCharacterEnter = useCallback(() => {
    isHovering.current = true;
    cancelCollapse();
    setDirection(computeDirection());
    setMode('expanded');
    setHasNewMessage(false);
  }, [computeDirection]);

  const onCharacterLeave = useCallback(() => {
    isHovering.current = false;
    scheduleCollapse(1000);
  }, [scheduleCollapse]);

  const onCharacterClick = useCallback(() => {
    setDirection(computeDirection());
    if (mode === 'mini') {
      setMode('expanded');
      setHasNewMessage(false);
    } else {
      setMode('mini');
    }
  }, [mode, computeDirection]);

  // Called on message rotation — shows pulsing dot instead of auto-expanding
  const notifyNewMessage = useCallback(() => {
    if (mode === 'mini') {
      setHasNewMessage(true);
    }
  }, [mode]);

  const clearNewMessage = useCallback(() => {
    setHasNewMessage(false);
  }, []);

  useEffect(() => {
    return () => { cancelCollapse(); };
  }, []);

  return { mode, direction, hasNewMessage, onCharacterEnter, onCharacterLeave, onCharacterClick, notifyNewMessage, clearNewMessage, scheduleCollapse };
}
```

Note: `scheduleCollapse` is exposed separately from `onCharacterLeave` so that auto-expand completion can request collapse without corrupting `isHovering` state.

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/renderer/hooks/useWidgetMode.ts
git commit -m "feat(hook): add useWidgetMode for mini/expand state management"
```

### Task 4: Update SpeechBubble with onComplete callback

**Files:**
- Modify: `src/renderer/components/SpeechBubble.tsx`

- [ ] **Step 1: Add onComplete prop**

Update the interface:

```typescript
interface SpeechBubbleProps {
  message: string;
  mood: string;
  onComplete?: () => void;
}
```

Update function signature:

```typescript
export function SpeechBubble({ message, mood, onComplete }: SpeechBubbleProps) {
```

In the auto-hide timeout (where it sets `setAnimState('out')`), call onComplete after fade-out:

```typescript
hideTimerRef.current = setTimeout(() => {
  setAnimState('out');
  setTimeout(() => {
    setVisible(false);
    onComplete?.();
  }, 400);
}, 4000);
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/renderer/components/SpeechBubble.tsx
git commit -m "feat(bubble): add onComplete callback for collapse trigger"
```

### Task 5: Add MiniBar component and update Character with forwardRef

**Files:**
- Modify: `src/renderer/components/UsageIndicator.tsx` — add MiniBar export
- Modify: `src/renderer/components/Character.tsx` — reduce to 60px, forwardRef, mouse event props

- [ ] **Step 1: Add MiniBar to UsageIndicator.tsx**

Add before the `styles` const:

```typescript
/** Compact single-line bar for mini mode */
export function MiniBar({ utilizationPercent, mood }: {
  utilizationPercent: number;
  mood: Expression;
}) {
  const clamped = clamp(utilizationPercent);
  const color = MOOD_COLORS[mood] ?? '#9ca3af';
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      background: 'rgba(0, 0, 0, 0.65)',
      borderRadius: 6,
      padding: '3px 6px',
      backdropFilter: 'blur(6px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    }}>
      <div style={{
        width: 36,
        height: 5,
        background: 'rgba(255, 255, 255, 0.25)',
        borderRadius: 3,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${clamped}%`,
          background: color,
          borderRadius: 3,
          transition: 'width 0.5s ease',
        }} />
      </div>
      <span style={{
        fontSize: 9,
        color: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontWeight: 700,
        textShadow: '0 1px 3px rgba(0,0,0,1)',
      }}>
        {clamped.toFixed(0)}%
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Update Character.tsx with forwardRef, reduced size, 80x80 hit area, and cursor**

```typescript
import React, { CSSProperties, forwardRef } from 'react';
import { MamaMood, MamaErrorExpression } from '../../shared/types';
import mamaPng from '../assets/claude-mama.png';

type Expression = MamaMood | MamaErrorExpression;

interface CharacterProps {
  expression: Expression;
  hasNewMessage?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const IMG_W = 60;
const IMG_H = 60;
const HIT_AREA = 80; // 10px invisible padding for Fitts's law
```

Change `MoodOverlay` pixel scale: `const px = 2.5;`

Convert export to forwardRef:

```typescript
export const Character = forwardRef<HTMLDivElement, CharacterProps>(
  function Character({ expression, hasNewMessage, onMouseEnter, onMouseLeave }, ref) {
    // Outer hit area (80x80, invisible padding)
    const hitAreaStyle: CSSProperties = {
      position: 'relative',
      width: HIT_AREA,
      height: HIT_AREA,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'grab',
    };

    const containerStyle: CSSProperties = {
      position: 'relative',
      width: IMG_W,
      height: IMG_H,
      animation: MOOD_ANIMATIONS[expression],
      WebkitAppRegion: 'drag' as any,
    };

    // ... imgStyle and auraStyle unchanged ...

    return (
      <div
        ref={ref}
        style={hitAreaStyle}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div style={containerStyle}>
          {auraStyle && <div style={auraStyle as CSSProperties} />}
          <img src={mamaPng} alt="Claude Mama" style={imgStyle} draggable={false} />
          <MoodOverlay expression={expression} />
        </div>
        {hasNewMessage && (
          <div style={{
            position: 'absolute',
            top: 4,
            right: 4,
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: '#ef4444',
            animation: 'pulse-dot 1.5s ease-in-out infinite',
            boxShadow: '0 0 6px rgba(239, 68, 68, 0.6)',
          }} />
        )}
      </div>
    );
  }
);
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/renderer/components/UsageIndicator.tsx src/renderer/components/Character.tsx
git commit -m "feat(ui): add MiniBar, reduce character to 60px with forwardRef"
```

### Task 6: Update App.tsx with mini/expand layout

**Files:**
- Modify: `src/renderer/App.tsx`

Dependencies: Tasks 3-5 must be complete (useWidgetMode, SpeechBubble onComplete, MiniBar, Character forwardRef).

- [ ] **Step 1: Integrate useWidgetMode and restructure MainView**

```typescript
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useMamaState } from './hooks/useMamaState';
import { useWidgetMode } from './hooks/useWidgetMode';
import { Character } from './components/Character';
import { SpeechBubble } from './components/SpeechBubble';
import { WeeklyBar, FiveHourBar, MiniBar, OfflineLabel } from './components/UsageIndicator';
import Settings from './pages/Settings';
import { Locale } from '../shared/types';
import { t } from '../shared/i18n';

function MainView() {
  const mamaState = useMamaState();
  const { mode, direction, hasNewMessage, onCharacterEnter, onCharacterLeave, onCharacterClick, notifyNewMessage, clearNewMessage, scheduleCollapse } = useWidgetMode();
  const [locale, setLocale] = useState<Locale>('ko');
  const [showDragHint, setShowDragHint] = useState(false);
  const prevMessageRef = useRef<string>('');
  const mouseDownPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    window.electronAPI.getSettings().then((s) => {
      if (s && (s as { locale?: Locale }).locale) {
        setLocale((s as { locale: Locale }).locale);
      }
    });
  }, []);

  // First-run drag hint
  useEffect(() => {
    const hintShown = localStorage.getItem('firstRunHintShown');
    if (!hintShown) {
      setShowDragHint(true);
      localStorage.setItem('firstRunHintShown', 'true');
      setTimeout(() => setShowDragHint(false), 3000);
    }
  }, []);

  const mood = mamaState?.mood ?? 'sleeping';
  const message = mamaState?.message ?? t(locale, 'loading_message');
  const utilizationPercent = mamaState?.utilizationPercent ?? 0;
  const fiveHourPercent = mamaState?.fiveHourPercent ?? null;
  const fiveHourResetsAt = mamaState?.fiveHourResetsAt ?? null;
  const dataSource = mamaState?.dataSource ?? 'none';

  // Notify new message (pulsing dot) instead of auto-expanding
  useEffect(() => {
    if (message !== prevMessageRef.current) {
      prevMessageRef.current = message;
      if (mamaState) {
        notifyNewMessage();
      }
    }
  }, [message, mamaState, notifyNewMessage]);

  const isExpanded = mode === 'expanded';

  // Click vs drag detection (5px threshold)
  const handleCharacterMouseDown = useCallback((e: React.MouseEvent) => {
    mouseDownPos.current = { x: e.screenX, y: e.screenY };
  }, []);

  const handleCharacterMouseUp = useCallback((e: React.MouseEvent) => {
    if (mouseDownPos.current) {
      const dx = Math.abs(e.screenX - mouseDownPos.current.x);
      const dy = Math.abs(e.screenY - mouseDownPos.current.y);
      if (dx < 5 && dy < 5) {
        onCharacterClick();
      }
      mouseDownPos.current = null;
    }
  }, [onCharacterClick]);

  // Right-click context menu
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    window.electronAPI.showContextMenu();
  }, []);

  const handleBubbleComplete = () => {
    scheduleCollapse(1000);
  };

  const bubble = isExpanded ? (
    <SpeechBubble message={message} mood={mood} onComplete={handleBubbleComplete} />
  ) : null;

  const character = (
    <div
      onMouseDown={handleCharacterMouseDown}
      onMouseUp={handleCharacterMouseUp}
      onContextMenu={handleContextMenu}
      style={{ position: 'relative' }}
    >
      <Character
        expression={mood}
        hasNewMessage={hasNewMessage}
        onMouseEnter={onCharacterEnter}
        onMouseLeave={onCharacterLeave}
      />
      {showDragHint && (
        <div style={{
          position: 'absolute',
          bottom: -20,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.8)',
          color: '#fff',
          fontSize: 10,
          padding: '2px 8px',
          borderRadius: 4,
          whiteSpace: 'nowrap',
          animation: 'fade-out 3s ease forwards',
        }}>
          Drag me to move!
        </div>
      )}
    </div>
  );

  const usageBars = dataSource === 'none' ? (
    <OfflineLabel locale={locale} />
  ) : isExpanded ? (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginTop: 6 }}>
      <WeeklyBar utilizationPercent={utilizationPercent} resetsAt={mamaState?.resetsAt ?? null} mood={mood} />
      {fiveHourPercent != null && (
        <FiveHourBar fiveHourPercent={fiveHourPercent} fiveHourResetsAt={fiveHourResetsAt} />
      )}
    </div>
  ) : (
    <MiniBar utilizationPercent={utilizationPercent} mood={mood} />
  );

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: direction === 'up' ? 'flex-end' : 'flex-start',
      background: 'transparent',
      padding: '8px 0',
      transition: 'all 300ms ease',
    }}>
      {direction === 'up' ? (
        <>
          {bubble}
          {bubble && <div style={{ height: 6 }} />}
          {character}
          <div style={{ marginTop: 4 }}>{usageBars}</div>
        </>
      ) : (
        <>
          {character}
          <div style={{ marginTop: 4 }}>{usageBars}</div>
          {bubble && <div style={{ height: 6 }} />}
          {bubble}
        </>
      )}
    </div>
  );
}

// ... App component unchanged
```

- [ ] **Step 2: Verify TypeScript compiles and build**

Run: `npx tsc --noEmit && npm run build`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/renderer/App.tsx
git commit -m "feat(ui): integrate mini/expand modes with direction-aware layout"
```

## Chunk 3: Hit-Test Mouse Events & Drag Position

### Task 7: Implement hit-test pointer event switching with IPC deduplication and CSS animations

**Files:**
- Modify: `src/renderer/App.tsx` — add mousemove listener for hit-test
- Modify: `src/renderer/components/Character.tsx` — already has forwardRef from Task 5
- Modify: `src/renderer/styles/styles.css` — add pulse-dot and fade-out animations

- [ ] **Step 1: Add hit-test logic to MainView**

Add a global mousemove handler with IPC deduplication to avoid flooding:

```typescript
// Inside MainView, add:
const characterRef = useRef<HTMLDivElement>(null);
const lastIgnoreRef = useRef(true);

useEffect(() => {
  const handleMouseMove = (e: MouseEvent) => {
    if (characterRef.current) {
      const rect = characterRef.current.getBoundingClientRect();
      const isOverCharacter =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      const shouldIgnore = !isOverCharacter;
      if (shouldIgnore !== lastIgnoreRef.current) {
        lastIgnoreRef.current = shouldIgnore;
        window.electronAPI.setIgnoreMouse(shouldIgnore);
      }
    }
  };

  document.addEventListener('mousemove', handleMouseMove);
  return () => document.removeEventListener('mousemove', handleMouseMove);
}, []);
```

Pass `characterRef` to the Character component:

```typescript
<Character
  ref={characterRef}
  expression={mood}
  hasNewMessage={hasNewMessage}
  onMouseEnter={onCharacterEnter}
  onMouseLeave={onCharacterLeave}
/>
```

- [ ] **Step 1.5: Add CSS animations for pulsing dot and drag hint**

In `src/renderer/styles/styles.css`, add:

```css
@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.3); }
}

@keyframes fade-out {
  0%, 70% { opacity: 1; }
  100% { opacity: 0; }
}
```

- [ ] **Step 2: Verify TypeScript compiles and build**

Run: `npx tsc --noEmit && npm run build`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/renderer/App.tsx
git commit -m "feat: hit-test based dynamic pointer event switching with IPC dedup"
```

### Task 8: Save position on drag end

**Files:**
- Modify: `src/renderer/App.tsx` — add drag-aware position save

- [ ] **Step 1: Detect drag end and save position**

Electron's `-webkit-app-region: drag` handles the actual dragging. Since JS drag events don't fire for `-webkit-app-region`, we detect position changes via mouseup on the character:

```typescript
// Inside MainView, add:
useEffect(() => {
  let dragCheckInterval: ReturnType<typeof setInterval> | null = null;
  let lastX = window.screenX;
  let lastY = window.screenY;

  const startTracking = () => {
    lastX = window.screenX;
    lastY = window.screenY;
    dragCheckInterval = setInterval(() => {
      if (window.screenX !== lastX || window.screenY !== lastY) {
        lastX = window.screenX;
        lastY = window.screenY;
      }
    }, 100);
  };

  const stopTracking = () => {
    if (dragCheckInterval) {
      clearInterval(dragCheckInterval);
      dragCheckInterval = null;
    }
    // Save final position if changed
    if (window.screenX !== lastX || window.screenY !== lastY) {
      window.electronAPI.savePosition(window.screenX, window.screenY);
    } else if (lastX !== 0 || lastY !== 0) {
      // Save position on any mouseup in case drag happened
      window.electronAPI.savePosition(window.screenX, window.screenY);
    }
  };

  document.addEventListener('mousedown', startTracking);
  document.addEventListener('mouseup', stopTracking);
  return () => {
    document.removeEventListener('mousedown', startTracking);
    document.removeEventListener('mouseup', stopTracking);
    if (dragCheckInterval) clearInterval(dragCheckInterval);
  };
}, []);
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/App.tsx
git commit -m "feat: save window position on drag end"
```

## Chunk 4: Settings Cleanup & Final Verification

### Task 9: Remove position dropdown from Settings and clean up types

**Files:**
- Modify: `src/renderer/pages/Settings.tsx` — remove position UI
- Modify: `src/shared/types.ts` — remove `position` field from MamaSettings entirely

- [ ] **Step 1: Remove position section from Settings.tsx**

Remove the `POSITIONS` const, `POS_KEYS` const, and the entire `{/* Position */}` JSX section. Remove `position` from the local state default object.

- [ ] **Step 2: Remove `position` from MamaSettings in types.ts**

Delete the `position` field entirely from the `MamaSettings` interface (was made optional in Task 1).

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/renderer/pages/Settings.tsx src/shared/types.ts
git commit -m "chore: remove position dropdown and type (replaced by drag)"
```

### Task 10: Final verification

- [ ] **Step 1: Run all tests**

Run: `npx vitest run`
Expected: All tests pass

- [ ] **Step 2: Full build**

Run: `npm run build`
Expected: Successful

- [ ] **Step 3: Manual test in dev mode**

Run: `npm run dev`

Verify:
1. Widget starts in mini mode (small character + single bar)
2. Hover over character → expands with full bars, cursor shows `grab`
3. Move mouse away → collapses after ~1 second
4. Message rotation → pulsing red dot appears on character (no auto-expand)
5. Hover/click after dot appears → expands, dot disappears, speech bubble shows
6. Click character (non-drag) → toggles expand/collapse
7. Right-click character → context menu with Settings, Hide, Quit
8. Drag character → window moves, cursor shows `grabbing`, position saved
9. Restart app → window appears at saved position
10. Widget at bottom of screen → bubble expands upward
11. Widget at top of screen → bubble expands downward
12. Drag to screen edge → position clamped to visible area (multi-monitor aware)
13. First launch → "Drag me to move!" hint fades after 3s
14. Hit area feels comfortable (80x80, larger than visible 60x60 character)

- [ ] **Step 4: Commit any fixes**
