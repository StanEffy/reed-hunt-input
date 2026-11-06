/**
 * Styles for the widget, in two parts:
 *
 * - base: what makes it work (layout, the canvas, the hidden input, the overlay position).
 *   Always on.
 * - theme: how it looks (colours, borders, sizes, animations). Scoped to `.rh--themed`,
 *   which `unstyled: true` leaves off.
 *
 * Both sit in the `reed-hunt` cascade layer and are inserted at the top of <head>, so any
 * of your own CSS that is not in a layer wins over them, whatever its specificity, and
 * layered CSS (Tailwind v4 and friends) wins too because this layer is declared first.
 *
 * Almost every value of the theme is a --rh-* custom property; set them on `.rh`, on a
 * parent, or through the `style` prop.
 */

export const reedHuntBaseCss = /* css */ `
@layer reed-hunt {
.rh { display: flex; flex-direction: column; width: 100%; box-sizing: border-box; }
.rh *, .rh *::before, .rh *::after { box-sizing: inherit; }
.rh [hidden] { display: none !important; }
.rh-stage { position: relative; container-type: inline-size; line-height: 0; overflow: hidden; }
.rh-canvas {
  display: block; width: 100%; aspect-ratio: 16 / 9;
  image-rendering: pixelated; image-rendering: crisp-edges;
  touch-action: manipulation; user-select: none; -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
}
.rh-overlay {
  position: absolute; inset: 0; display: flex; flex-direction: column;
  align-items: center; justify-content: center; text-align: center; line-height: 1.3;
}
.rh-overlay p { margin: 0; }
.rh-field { position: relative; }
.rh-input {
  position: absolute; inset: 0; width: 100%; height: 100%; margin: 0; padding: 0; border: 0;
  opacity: 0; font-size: 16px; caret-color: transparent;
}
.rh-slots { display: flex; flex-wrap: wrap; align-items: center; }
.rh-group { display: flex; align-items: center; }
.rh-slot { position: relative; display: flex; align-items: center; justify-content: center; pointer-events: none; }
.rh-literal, .rh-sign, .rh-digits { pointer-events: none; }
.rh-display { display: flex; align-items: center; }
.rh-digits { display: flex; align-items: center; min-width: 0; overflow: hidden; }
.rh-caret { display: inline-block; }
.rh-currencies { display: flex; }
}
`;

export const reedHuntThemeCss = /* css */ `
@layer reed-hunt {
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

  --rh-max-width: 576px;
  --rh-gap: 0.6rem;
  --rh-radius: 0px;
  --rh-border-width: 2px;

  --rh-stage-border: var(--rh-border-width) solid var(--rh-ink);
  --rh-stage-radius: var(--rh-radius);
  --rh-stage-shadow: 4px 4px 0 var(--rh-ink);
  --rh-stage-shadow-gloomy: 4px 4px 0 #7a1410;

  --rh-slot-width: 2.6rem;
  --rh-slot-height: 3rem;
  --rh-slot-font-size: 1.6rem;
  --rh-slot-compact-width: 1.85rem;
  --rh-slot-compact-height: 2.5rem;
  --rh-slot-compact-font-size: 1.2rem;
  --rh-slot-radius: var(--rh-radius);
  --rh-slot-gap: 0.25rem;
  --rh-group-gap: 0.75rem;

  --rh-display-height: 3.2rem;
  --rh-display-font-size: 1.6rem;

  --rh-label-font-size: 0.75rem;
  --rh-hint-font-size: 0.8rem;

  --rh-overlay-bg: rgba(10, 4, 4, 0.78);
  --rh-overlay-eaten-bg: rgba(60, 0, 8, 0.82);
  --rh-overlay-ink: #f4eccb;
  --rh-overlay-title: #e0322b;
  --rh-refill-bg: #ffd56a;
  --rh-refill-ink: #1a120c;
}
.rh.rh--dark {
  --rh-ink: #eceef2;
  --rh-ink-muted: #9aa1ad;
  --rh-surface: #1b1e24;
  --rh-rule: #3a3f49;
  --rh-accent-soft: #4a3c0e;
}

.rh--themed {
  gap: var(--rh-gap); max-width: var(--rh-max-width);
  font-family: var(--rh-font); color: var(--rh-ink);
}
.rh--themed.rh--disabled { opacity: 0.55; }
.rh--themed .rh-label {
  font-size: var(--rh-label-font-size); font-weight: 600; letter-spacing: 0.05em;
  text-transform: uppercase; color: var(--rh-ink-muted); user-select: none;
}

.rh--themed .rh-stage {
  border: var(--rh-stage-border); border-radius: var(--rh-stage-radius);
  box-shadow: var(--rh-stage-shadow); background: #4f86d1;
}
.rh--themed[data-level='2'] .rh-stage, .rh--themed[data-level='3'] .rh-stage { box-shadow: var(--rh-stage-shadow-gloomy); }
.rh--themed .rh-canvas { cursor: none; }
.rh--themed.rh--disabled .rh-canvas { cursor: not-allowed; }

.rh--themed .rh-overlay {
  gap: clamp(0.2rem, 1.6cqw, 0.6rem); padding: 0 8%;
  color: var(--rh-overlay-ink); background: var(--rh-overlay-bg);
  animation: rh-fade 0.4s steps(4, end);
}
.rh--themed .rh-overlay--eaten { background: var(--rh-overlay-eaten-bg); }
.rh--themed .rh-over-title {
  font-family: var(--rh-font-mono); font-size: clamp(1.2rem, 8cqw, 2.6rem); font-weight: 800;
  letter-spacing: 0.08em; text-transform: uppercase; color: var(--rh-overlay-title);
  text-shadow: 3px 3px 0 #3a0a08; animation: rh-shake 0.5s steps(5, end) 1;
}
.rh--themed .rh-over-text { font-size: clamp(0.72rem, 2.7cqw, 0.95rem); }
.rh--themed .rh-refill {
  margin-top: clamp(0.2rem, 1.5cqw, 0.6rem); padding: 0.45em 1.1em;
  font-family: var(--rh-font-mono); font-size: clamp(0.75rem, 2.8cqw, 1rem); font-weight: 700;
  color: var(--rh-refill-ink); background: var(--rh-refill-bg); border: 2px solid var(--rh-refill-ink);
  border-radius: var(--rh-radius); box-shadow: 3px 3px 0 var(--rh-refill-ink); cursor: pointer;
}
.rh--themed .rh-refill:hover:not(:disabled) { filter: brightness(1.08); }
.rh--themed .rh-refill:active:not(:disabled) { transform: translate(2px, 2px); box-shadow: 1px 1px 0 var(--rh-refill-ink); }
.rh--themed .rh-refill:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
.rh--themed .rh-refill:disabled { cursor: progress; opacity: 0.75; }

.rh--themed .rh-field, .rh--themed .rh-input { cursor: text; }
.rh--themed .rh-slots { gap: 0.5rem var(--rh-group-gap); }
.rh--themed .rh-group { gap: var(--rh-slot-gap); }
.rh--themed .rh-literal {
  font-family: var(--rh-font-mono); font-size: calc(var(--rh-slot-font-size) * 0.8); font-weight: 700;
  color: var(--rh-ink-muted);
}
.rh--themed .rh-slot {
  width: var(--rh-slot-width); height: var(--rh-slot-height);
  font-family: var(--rh-font-mono); font-size: var(--rh-slot-font-size); font-weight: 700;
  color: var(--rh-ink); background: var(--rh-surface);
  border: var(--rh-border-width) solid var(--rh-rule); border-radius: var(--rh-slot-radius);
  transition: border-color 0.15s ease;
}
.rh--themed .rh-slot--compact {
  width: var(--rh-slot-compact-width); height: var(--rh-slot-compact-height);
  font-size: var(--rh-slot-compact-font-size);
}
.rh--themed .rh-slot--filled { border-color: var(--rh-ink); }
.rh--themed .rh-field:focus-within .rh-slot--next { border-color: var(--rh-accent); }
.rh--themed .rh-slot--next::after, .rh--themed .rh-caret {
  content: ''; background: var(--rh-accent); animation: rh-blink 1s steps(2, start) infinite;
}
.rh--themed .rh-slot--next::after { position: absolute; left: 25%; right: 25%; bottom: 5px; height: 3px; }
.rh--themed .rh-slot--landed { animation: rh-land 0.32s steps(4, end); }

.rh--themed .rh-display {
  gap: 0.6rem; min-height: var(--rh-display-height); padding: 0 0.9rem;
  font-family: var(--rh-font-mono); font-size: var(--rh-display-font-size); font-weight: 700;
  color: var(--rh-ink); background: var(--rh-surface);
  border: var(--rh-border-width) solid var(--rh-ink); border-radius: var(--rh-radius);
}
.rh--themed .rh-field:focus-within .rh-display { border-color: var(--rh-accent); }
.rh--themed .rh-display--bump { animation: rh-bump 0.25s steps(3, end); }
.rh--themed .rh-sign { color: var(--rh-ink-muted); }
.rh--themed .rh-thousands + .rh-thousands { margin-left: 0.4em; }
.rh--themed .rh-placeholder { color: var(--rh-ink-muted); opacity: 0.5; }
.rh--themed .rh-caret { width: 0.55em; height: 3px; margin: 0 0 0.3em 0.1em; align-self: flex-end; }

.rh--themed .rh-currencies { gap: 0.35rem; }
.rh--themed .rh-currency {
  min-width: 2.4rem; height: 2.2rem; font-family: var(--rh-font-mono); font-size: 1.05rem;
  font-weight: 700; color: var(--rh-ink); background: var(--rh-surface);
  border: var(--rh-border-width) solid var(--rh-rule); border-radius: var(--rh-radius); cursor: pointer;
}
.rh--themed .rh-currency:hover:not(:disabled) { border-color: var(--rh-ink); }
.rh--themed .rh-currency:focus-visible { outline: 2px solid var(--rh-accent); outline-offset: 2px; }
.rh--themed .rh-currency[aria-checked='true'] {
  color: var(--rh-on-accent); background: var(--rh-accent); border-color: var(--rh-ink);
}

.rh--themed .rh-hint { margin: 0; font-size: var(--rh-hint-font-size); color: var(--rh-ink-muted); }
.rh--themed .rh-ammo { white-space: nowrap; }

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
  .rh--themed .rh-slot--landed, .rh--themed .rh-display--bump, .rh--themed .rh-over-title,
  .rh--themed .rh-slot--next::after, .rh--themed .rh-caret { animation: none; }
}
}
`;

/** Base and theme together: what `reed-hunt-input/style.css` contains */
export const reedHuntCss = reedHuntBaseCss + reedHuntThemeCss;

const BASE_ID = 'reed-hunt-input-base';
const THEME_ID = 'reed-hunt-input-theme';

function insertFirst(doc: Document, id: string, css: string, after?: Element | null) {
  const existing = doc.getElementById(id);
  if (existing) return existing;
  const style = doc.createElement('style');
  style.id = id;
  style.textContent = css;
  // At the top of <head>, so the layer is declared before anyone else's
  doc.head.insertBefore(style, after ? after.nextSibling : doc.head.firstChild);
  return style;
}

/**
 * Adds the stylesheet to the document once. Safe to call many times.
 * `theme: false` adds only the base (for `unstyled` widgets).
 */
export function injectStyles(doc: Document = document, { theme = true }: { theme?: boolean } = {}) {
  const base = insertFirst(doc, BASE_ID, reedHuntBaseCss);
  if (theme) insertFirst(doc, THEME_ID, reedHuntThemeCss, base);
}
