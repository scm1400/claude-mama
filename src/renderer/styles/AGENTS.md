<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-14 -->

# src/renderer/styles/

## Purpose
Global CSS for the renderer. Contains all CSS `@keyframes` animation definitions that are referenced by inline `animation` properties in React components. This is the only CSS file in the project — all other styling is done via inline `CSSProperties` objects.

## Key Files
| File | Description |
|------|-------------|
| `styles.css` | All `@keyframes` definitions for character animations (angryShake, worriedSway, happyBounce, proudJump, confusedWobble, sleepingTilt), aura effects (angryPulse, proudGlow, happyGlow), particle effects (steamPuff, sweatDrop, rainDrop, floatUp, sparkle, confetti, zzz, twinkle, floatQuestion), and speech bubble transitions (bubbleFadeIn, bubbleFadeOut, cheekPulse), plus the global `* { box-sizing: border-box }` reset |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| *(none)* | — |

## For AI Agents

### Working In This Directory
- Animation names in this file must exactly match the strings used in `MOOD_ANIMATIONS` and `MOOD_AURA` in `Character.tsx` and the `animation` properties in `SpeechBubble.tsx`.
- When adding a new mood or particle effect, add the `@keyframes` block here first, then reference it by name in the component's inline style.
- Do not add component-level styling here — keep layout, colors, and spacing inline in the TSX files.
- This file is imported in `main.tsx` as `import './styles/styles.css'` and processed by Vite.

### Testing Requirements
- Visual inspection only. Run `npm run dev` and verify that animations play correctly for each mood.
- Check both the character animations and the `MoodOverlay` particles for each expression.

### Common Patterns
- New animation pattern:
  ```css
  @keyframes myNewAnimation {
    0% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
    100% { transform: translateY(0); }
  }
  ```
  Then in the component: `animation: 'myNewAnimation 1s ease-in-out infinite'`.
- Use `animation-fill-mode: forwards` only for one-shot animations (e.g., `bubbleFadeIn`, `bubbleFadeOut`).

## Dependencies
### Internal
- Consumed by `../components/Character.tsx` (animation names), `../components/SpeechBubble.tsx` (bubble transitions)

### External
- Vite CSS processing (no PostCSS or preprocessors)

<!-- MANUAL: -->
