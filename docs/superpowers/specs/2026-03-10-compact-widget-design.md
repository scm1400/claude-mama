# Compact Widget with Drag & Mini/Expand Modes

## Summary

Redesign the Claude Mama widget from a fixed 250x300 always-expanded window to a compact mini mode (~120x100) that expands on hover or message rotation. Add direct drag-to-move via hit-test based pointer event switching.

## Current State

- Window: 250x300, frameless, transparent, always-on-top, bottom-right
- `setIgnoreMouseEvents(true, { forward: true })` — fully click-through
- Position changeable only via Settings dropdown (topLeft/topRight/bottomLeft/bottomRight)
- Character: 100x100, speech bubble up to 200px wide, two usage bars below

## Design

### Mini Mode (Default)

Dimensions: ~120x100 content area within a fixed-size transparent window.

```
┌───────────┐
│  🧑 (60px) │
│  [██░] 55% │
└───────────┘
```

- Character scaled to 60x60 (pixelated rendering preserved)
- Hit area: 80x80 (10px invisible padding around 60px character for Fitts's law)
- Single 7-day usage mini bar with percent text, one line
- Mood animations continue at reduced scale
- No speech bubble, no 5-hour bar, no countdown
- Click-through except on character hit area
- New message indicator: when message rotates, show a pulsing dot on character instead of auto-expanding
- Cursor: `grab` when hovering character, `grabbing` while dragging

### Expanded Mode

Dimensions: ~200x250 content area, triggers:

1. **Mouse hover on character area**: expand immediately, collapse 1s after mouse leaves
2. **Click on character** (non-drag): toggle expand/collapse
3. **Right-click on character**: show context menu (Settings, Hide Mama, Quit)

Note: Message rotation does NOT auto-expand. Instead, a pulsing dot indicator appears on the character in mini mode. The user must hover or click to see the new message.

```
┌─────────────────┐
│    Speech Bubble │
│                 │
│   🧑 (60px)     │
│                 │
│  [7d ████] 55%  │  with countdown
│  [5h ██░░] 38%  │  with countdown
└─────────────────┘
```

### Expansion Direction

Determined by window position on screen:
- `windowCenterY > screenHeight / 2` → expand upward (bubble above character)
- Otherwise → expand downward (bubble below character)
- Recalculated after each drag-move

### Mouse Interaction & Drag

**Dynamic pointer event switching (hit-test pattern):**

The renderer tracks `mousemove` and determines if the cursor is over the character area:
- Over character: IPC to main → `setIgnoreMouseEvents(false)` — clickable/draggable
- Outside character: IPC to main → `setIgnoreMouseEvents(true, { forward: true })` — click-through

**Cursor affordance:**
- Hover over character: `cursor: grab`
- During drag: `cursor: grabbing`
- First launch only: show a brief tooltip hint ("Drag me to move!") that fades after 3s, stored in electron-store `firstRunHintShown`

**Drag implementation:**
- Apply `-webkit-app-region: drag` to character element when hover is active
- On drag end, read `window.screenX / window.screenY`, send via IPC to main
- Main process saves position to electron-store
- Next launch restores saved position

**Click (non-drag) behavior:**
- Short click (no drag movement) on character → toggle expand/collapse
- Detected by comparing mousedown/mouseup positions (threshold: 5px)

**Right-click context menu:**
- Right-click on character → show Electron context menu with: Settings, Hide Mama, Quit
- Implemented via IPC: renderer sends `mama:show-context-menu`, main builds and shows Menu

### Window Strategy

**Fixed-size transparent window** (no dynamic resizing):
- Window always created at expanded size (200x250)
- Mini/expanded is pure CSS transition (300ms ease) within the transparent window
- Invisible areas remain click-through due to transparency + `setIgnoreMouseEvents` forwarding
- Eliminates flickering from repeated `win.setBounds()` calls

### Position Management

**Initial position:**
- First launch: bottom-right corner with 16px margin
- Subsequent: restored from electron-store `{ x, y }`

**Screen bounds enforcement:**
- After drag end, use `screen.getDisplayNearestPoint({ x, y })` to find the correct display
- Clamp position within that display's `workArea`
- Supports multi-monitor setups

**Settings change:**
- Remove the existing position dropdown from Settings (replaced by drag)
- Store format changes from preset string to `{ x: number, y: number }`

### Timing Details

| Event | Action | Duration |
|-------|--------|----------|
| Hover enter character | Expand immediately | 300ms transition |
| Hover leave | Start collapse timer | 1000ms delay, then 300ms transition |
| Hover re-enter during delay | Cancel collapse | — |
| Click (non-drag) | Toggle expand/collapse | 300ms transition |
| Right-click | Show context menu | Immediate |
| Message rotation tick | Show pulsing dot on character | Dot pulses until hover/click |
| Speech bubble typing | Show during expand | ~50ms/char |
| Speech bubble visible | Hold expanded | ~4 seconds |
| Speech bubble fade-out | Start collapse timer | 400ms fade, then 1000ms delay |
| Drag start | Lock expanded | — |
| Drag end | Save position, keep expanded | Collapse on hover leave |
| First launch | Show drag hint tooltip | 3s, then fade out |

### Files to Modify

- `src/main/main.ts` — window size (200x250), remove fixed position presets, load saved position, context menu IPC
- `src/main/ipc-handlers.ts` — add IPC for `set-ignore-mouse-events`, `save-position`, `show-context-menu`
- `src/main/preload.ts` — expose new IPC channels
- `src/renderer/App.tsx` — mini/expand state management, expansion direction logic, click toggle, right-click, first-run hint
- `src/renderer/components/Character.tsx` — reduce to 60x60 (80x80 hit area), add drag region, hit-test mousemove, cursor affordance
- `src/renderer/components/SpeechBubble.tsx` — only render when expanded
- `src/renderer/components/UsageIndicator.tsx` — mini bar variant (7d only, compact) vs expanded (both bars + countdown)
- `src/renderer/components/NewMessageDot.tsx` — pulsing dot indicator for new messages in mini mode
- `src/renderer/styles/styles.css` — mini/expand transitions, new compact layout, pulsing dot animation
- `src/renderer/hooks/useMamaState.ts` — no changes needed
- `src/renderer/hooks/useWidgetMode.ts` — add `hasNewMessage` state, click toggle
- `src/renderer/pages/Settings.tsx` — remove position dropdown

### Out of Scope

- Resize handle or user-configurable widget size
- Snap-to-edge magnetism during drag
- Keyboard shortcuts / accessibility (future iteration)
