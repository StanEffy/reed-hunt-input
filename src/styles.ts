/**
 * Styles for the widget. Injected once into <head> on first mount (see `injectStyles`),
 * so installing the package is all it takes. Every colour is a --rh-* custom property:
 * override them on `.rh` (or any parent) to match your design.
 */
export const reedHuntCss = /* css */ `
.rh {
  --rh-ink: #16181d;
  --rh-ink-muted: #5d636e;
  --rh-surface: #ffffff;
  --rh-rule: #c9ccd2;
  --rh-accent: #f2b705;
  --rh-accent-soft: #fdf0c4;
  --rh-on-accent: #16181d;
  --rh-font: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  --rh-font-mono: ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  width: 100%;
  max-width: 576px;
  font-family: var(--rh-font);
  color: var(--rh-ink);
  box-sizing: border-box;
}
.rh *, .rh *::before, .rh *::after { box-sizing: inherit; }
.rh [hidden] { display: none !important; }
.rh--dark {
  --rh-ink: #eceef2;
  --rh-ink-muted: #9aa1ad;
  --rh-surface: #1b1e24;
  --rh-rule: #3a3f49;
  --rh-accent: #f2b705;
  --rh-accent-soft: #4a3c0e;
  --rh-on-accent: #16181d;
}
.rh--disabled { opacity: 0.55; }
.rh-label {
  font-size: 0.75rem; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;
  color: var(--rh-ink-muted); user-select: none;
}

.rh-stage {
  position: relative; container-type: inline-size; line-height: 0;
  border: 2px solid var(--rh-ink); box-shadow: 4px 4px 0 var(--rh-ink); background: #4f86d1;
}
.rh-stage[data-level='2'], .rh-stage[data-level='3'] { box-shadow: 4px 4px 0 #7a1410; }
.rh-canvas {
  display: block; width: 100%; aspect-ratio: 16 / 9; cursor: none;
  image-rendering: pixelated; image-rendering: crisp-edges;
  touch-action: manipulation; user-select: none; -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
}
.rh--disabled .rh-canvas { cursor: not-allowed; }

.rh-overlay {
  position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: clamp(0.2rem, 1.6cqw, 0.6rem); padding: 0 8%;
  line-height: 1.3; text-align: center; color: #f4eccb; background: rgba(10, 4, 4, 0.78);
  animation: rh-fade 0.4s steps(4, end);
}
.rh-overlay p { margin: 0; }
.rh-over-title {
  font-family: var(--rh-font-mono); font-size: clamp(1.2rem, 8cqw, 2.6rem); font-weight: 800;
  letter-spacing: 0.08em; text-transform: uppercase; color: #e0322b; text-shadow: 3px 3px 0 #3a0a08;
  animation: rh-shake 0.5s steps(5, end) 1;
}
.rh-over-text { font-size: clamp(0.72rem, 2.7cqw, 0.95rem); }
.rh-refill {
  margin-top: clamp(0.2rem, 1.5cqw, 0.6rem); padding: 0.45em 1.1em;
  font-family: var(--rh-font-mono); font-size: clamp(0.75rem, 2.8cqw, 1rem); font-weight: 700;
  color: #1a120c; background: #ffd56a; border: 2px solid #1a120c; box-shadow: 3px 3px 0 #1a120c;
  cursor: pointer;
}
.rh-refill:hover:not(:disabled) { background: #fff3a0; }
.rh-refill:active:not(:disabled) { transform: translate(2px, 2px); box-shadow: 1px 1px 0 #1a120c; }
.rh-refill:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
.rh-refill:disabled { cursor: progress; opacity: 0.75; }

.rh-field { position: relative; cursor: text; }
.rh-input {
  position: absolute; inset: 0; width: 100%; height: 100%; margin: 0; padding: 0; border: 0;
  opacity: 0; font-size: 16px; caret-color: transparent; cursor: text;
}
.rh-slots { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem 0.75rem; }
.rh-group { display: flex; align-items: center; gap: 0.25rem; }
.rh-literal {
  font-family: var(--rh-font-mono); font-size: 1.3rem; font-weight: 700;
  color: var(--rh-ink-muted); pointer-events: none;
}
.rh-slot {
  position: relative; width: 2.6rem; height: 3rem; display: flex; align-items: center;
  justify-content: center; font-family: var(--rh-font-mono); font-size: 1.6rem; font-weight: 700;
  color: var(--rh-ink); background: var(--rh-surface); border: 2px solid var(--rh-rule);
  pointer-events: none; transition: border-color 0.15s ease;
}
.rh-slot--compact { width: 1.85rem; height: 2.5rem; font-size: 1.2rem; }
.rh-slot--filled { border-color: var(--rh-ink); }
.rh-field:focus-within .rh-slot--next { border-color: var(--rh-accent); }
.rh-slot--next::after, .rh-caret {
  content: ''; background: var(--rh-accent); animation: rh-blink 1s steps(2, start) infinite;
}
.rh-slot--next::after { position: absolute; left: 25%; right: 25%; bottom: 5px; height: 3px; }
.rh-slot--landed { animation: rh-land 0.32s steps(4, end); }

.rh-display {
  display: flex; align-items: center; gap: 0.6rem; min-height: 3.2rem; padding: 0 0.9rem;
  font-family: var(--rh-font-mono); font-size: 1.6rem; font-weight: 700; color: var(--rh-ink);
  background: var(--rh-surface); border: 2px solid var(--rh-ink);
}
.rh-field:focus-within .rh-display { border-color: var(--rh-accent); }
.rh-display--bump { animation: rh-bump 0.25s steps(3, end); }
.rh-sign { color: var(--rh-ink-muted); pointer-events: none; }
.rh-digits { display: flex; align-items: center; min-width: 0; overflow: hidden; pointer-events: none; }
.rh-thousands + .rh-thousands { margin-left: 0.4em; }
.rh-placeholder { color: var(--rh-ink-muted); opacity: 0.5; }
.rh-caret {
  display: inline-block; width: 0.55em; height: 3px; margin: 0 0 0.3em 0.1em; align-self: flex-end;
}

.rh-currencies { display: flex; gap: 0.35rem; }
.rh-currency {
  min-width: 2.4rem; height: 2.2rem; font-family: var(--rh-font-mono); font-size: 1.05rem;
  font-weight: 700; color: var(--rh-ink); background: var(--rh-surface);
  border: 2px solid var(--rh-rule); cursor: pointer;
}
.rh-currency:hover:not(:disabled) { border-color: var(--rh-ink); }
.rh-currency:focus-visible { outline: 2px solid var(--rh-accent); outline-offset: 2px; }
.rh-currency[aria-checked='true'] {
  color: var(--rh-on-accent); background: var(--rh-accent); border-color: var(--rh-ink);
}

.rh-hint { margin: 0; font-size: 0.8rem; color: var(--rh-ink-muted); }
.rh-ammo { white-space: nowrap; }

@keyframes rh-blink { to { visibility: hidden; } }
@keyframes rh-land {
  0% { transform: translateY(-14px) scale(1.25); background: var(--rh-accent-soft); }
  60% { transform: translateY(2px) scale(0.95); }
  100% { transform: none; }
}
@keyframes rh-bump { 0% { transform: translateY(-4px); } 100% { transform: none; } }
@keyframes rh-fade { from { opacity: 0; } }
@keyframes rh-shake {
  0%, 100% { transform: none; } 25% { transform: translateX(-4px); }
  50% { transform: translateX(4px); } 75% { transform: translateX(-2px); }
}
@media (prefers-reduced-motion: reduce) {
  .rh-slot--landed, .rh-display--bump, .rh-over-title, .rh-slot--next::after, .rh-caret { animation: none; }
}
`;

const STYLE_ID = 'reed-hunt-input-styles';

/** Adds the stylesheet to the document once. Safe to call many times */
export function injectStyles(doc: Document = document) {
  if (doc.getElementById(STYLE_ID)) return;
  const style = doc.createElement('style');
  style.id = STYLE_ID;
  style.textContent = reedHuntCss;
  doc.head.appendChild(style);
}
