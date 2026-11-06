import { ReedHuntGame } from './game';
import {
  ammoFor,
  digitCapacity,
  groupThousands,
  normalizeDigits,
  reedHuntFormats,
  tokenizeMask,
  type MaskToken,
  type ReedHuntFormat,
} from './formats';
import { injectStyles } from './styles';

export interface ReedHuntTexts {
  hint: string;
  gameOver: string;
  outOfAmmo: string;
  dontWorry: string;
  refill: string;
  refilling: string;
  ammoLeft: (rounds: number) => string;
  currency: string;
}

export const defaultTexts: ReedHuntTexts = {
  hint: 'Shoot the digits. The red cross erases the last one. Right click reloads.',
  gameOver: 'Game over',
  outOfAmmo: 'Your free ammo has run out.',
  dontWorry: "But don't worry: top up your ammo for just €1.",
  refill: 'Top up for €1',
  refilling: 'Processing…',
  ammoLeft: (n) => `${n} rounds left`,
  currency: 'Currency',
};

export type ReedHuntTheme = 'auto' | 'light' | 'dark';

/** Everything that describes the widget; all optional */
export interface ReedHuntData {
  /** Digits only, without the mask's literals */
  value?: string;
  /** What to collect; see `reedHuntFormats`. Defaults to a 6-digit code */
  format?: ReedHuntFormat;
  /** Amount format: the sign before the number */
  currency?: string;
  /** Amount format: signs to pick from. Pass [] to hide the picker */
  currencies?: string[];
  /** Rounds per game. Defaults to `ammoFactor` × the digits needed, rounded up */
  ammo?: number;
  ammoFactor?: number;
  texts?: Partial<ReedHuntTexts>;
  label?: string;
  /** Name of the hidden form field that holds the digits */
  name?: string;
  id?: string;
  disabled?: boolean;
  /** Flight speed multiplier, 1 is normal */
  speed?: number;
  /** Lets people type instead of shoot (click the field). Keep it on for accessibility */
  allowTyping?: boolean;
  /** 'auto' follows prefers-color-scheme; the scene turns to dusk when dark */
  theme?: ReedHuntTheme;
  autocomplete?: string;
}

export interface ReedHuntCallbacks {
  onChange?: (value: string) => void;
  /** Every slot of a mask is filled */
  onComplete?: (value: string) => void;
  onCurrencyChange?: (currency: string) => void;
  /** Ammo ran out before the input was done */
  onGameOver?: () => void;
  /**
   * The "top up" button on the game over screen. Resolve true to start the next, gloomier
   * level with fresh ammo and an empty value. The default just says yes after a moment.
   */
  onRefill?: () => boolean | Promise<boolean>;
}

export interface ReedHuntOptions extends ReedHuntData, ReedHuntCallbacks {
  /** Set false if you load `reedHuntCss` yourself (e.g. strict CSP) */
  injectStyles?: boolean;
}

const demoRefill = () => new Promise<boolean>((resolve) => setTimeout(() => resolve(true), 700));

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const formatKeyOf = (f: ReedHuntFormat) => (f.kind === 'mask' ? `mask:${f.mask}` : `${f.kind}:${f.maxDigits}`);

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

let uid = 0;

/**
 * Framework-free widget: mounts into `host` and renders the marsh, the field and the
 * game over screen. Use the React or Vue wrapper, or drive it directly:
 *
 *   const hunt = new ReedHunt(document.querySelector('#card')!, {
 *     format: reedHuntFormats.card,
 *     onChange: (v) => console.log(v),
 *   });
 *   hunt.update({ disabled: true });
 *   hunt.destroy();
 */
export class ReedHunt {
  private opts: ReedHuntOptions;
  private root: HTMLDivElement;
  private label: HTMLLabelElement;
  private currencies: HTMLDivElement;
  private stage: HTMLDivElement;
  private canvas: HTMLCanvasElement;
  private overlay: HTMLDivElement;
  private overTitle: HTMLParagraphElement;
  private overText1: HTMLParagraphElement;
  private overText2: HTMLParagraphElement;
  private refillBtn: HTMLButtonElement;
  private field: HTMLDivElement;
  private input: HTMLInputElement;
  private view: HTMLDivElement;
  private hintText: HTMLSpanElement;
  private ammoText: HTMLSpanElement;

  private game: ReedHuntGame | null = null;
  private value = '';
  private landed = -1;
  private level = 0;
  private over = false;
  private refilling = false;
  private ammoLeft = 0;
  private onScreen = typeof IntersectionObserver === 'undefined';
  private formatKey: string;
  private groups: MaskToken[][] = [];
  private cleanups: (() => void)[] = [];
  private destroyed = false;
  private readonly inputId: string;

  constructor(host: HTMLElement, options: ReedHuntOptions = {}) {
    this.opts = { ...options };
    if (this.opts.injectStyles !== false) injectStyles(host.ownerDocument);
    this.inputId = options.id ?? `reed-hunt-${++uid}`;
    this.formatKey = formatKeyOf(this.format);
    this.groups = this.format.kind === 'mask' ? tokenizeMask(this.format.mask) : [];
    this.value = normalizeDigits(options.value ?? '', this.format);

    // ----- DOM -----
    this.root = el('div', 'rh');
    this.label = el('label', 'rh-label');
    this.label.htmlFor = this.inputId;

    this.currencies = el('div', 'rh-currencies');
    this.currencies.setAttribute('role', 'radiogroup');

    this.stage = el('div', 'rh-stage');
    this.canvas = el('canvas', 'rh-canvas');
    this.canvas.setAttribute('aria-hidden', 'true');
    this.overlay = el('div', 'rh-overlay');
    this.overlay.hidden = true;
    this.overlay.setAttribute('role', 'alertdialog');
    this.overlay.setAttribute('aria-labelledby', `${this.inputId}-over`);
    this.overTitle = el('p', 'rh-over-title');
    this.overTitle.id = `${this.inputId}-over`;
    this.overText1 = el('p', 'rh-over-text');
    this.overText2 = el('p', 'rh-over-text');
    this.refillBtn = el('button', 'rh-refill');
    this.refillBtn.type = 'button';
    this.overlay.append(this.overTitle, this.overText1, this.overText2, this.refillBtn);
    this.stage.append(this.canvas, this.overlay);

    this.field = el('div', 'rh-field');
    this.input = el('input', 'rh-input');
    this.input.id = this.inputId;
    this.input.type = 'text';
    this.input.inputMode = 'numeric';
    this.input.pattern = '[0-9]*';
    this.input.setAttribute('aria-describedby', `${this.inputId}-hint`);
    this.view = el('div');
    this.field.append(this.input, this.view);

    const hint = el('p', 'rh-hint');
    hint.id = `${this.inputId}-hint`;
    this.hintText = el('span');
    this.ammoText = el('span', 'rh-ammo');
    hint.append(this.hintText, ' ', this.ammoText);

    this.root.append(this.label, this.currencies, this.stage, this.field, hint);
    host.appendChild(this.root);

    // ----- game -----
    try {
      this.game = new ReedHuntGame(
        this.canvas,
        {
          getFill: () => {
            const max = digitCapacity(this.format);
            return { filled: this.value.length, max, complete: this.format.kind === 'mask' && this.value.length >= max };
          },
          onDigit: (d) => this.commit(this.value + d),
          onErase: () => this.commit(this.value.slice(0, -1)),
          onGameOver: () => {
            this.over = true;
            this.renderOverlay();
            this.syncInput();
            this.refillBtn.focus({ preventScroll: true });
            this.opts.onGameOver?.();
          },
          onAmmo: (n) => {
            this.ammoLeft = n;
            this.renderHint();
          },
        },
        { speed: this.opts.speed ?? 1 },
        this.totalAmmo,
      );
    } catch {
      // No canvas 2D (tests, very old browsers): the field still works by typing
      this.game = null;
    }

    this.bindEvents();
    this.applyTheme();
    this.render();
    this.game?.draw();
    this.syncRunning();
  }

  // ---------- public API ----------

  get currentValue() {
    return this.value;
  }

  /** Change any option; callbacks can be swapped too */
  update(next: Partial<ReedHuntOptions>) {
    if (this.destroyed) return;
    const prevAmmo = this.totalAmmo;
    for (const [k, v] of Object.entries(next)) {
      if (v !== undefined) (this.opts as Record<string, unknown>)[k] = v;
    }

    const key = formatKeyOf(this.format);
    const formatChanged = key !== this.formatKey;
    if (formatChanged) {
      this.formatKey = key;
      this.groups = this.format.kind === 'mask' ? tokenizeMask(this.format.mask) : [];
    }

    if (next.value !== undefined || formatChanged) {
      const v = normalizeDigits(next.value ?? this.value, this.format);
      if (v !== this.value) {
        this.value = v;
        this.landed = -1;
      }
    }

    if (formatChanged || this.totalAmmo !== prevAmmo) this.newGame(0);
    if (this.game && next.speed !== undefined) this.game.options.speed = next.speed;

    this.applyTheme();
    this.render();
    this.syncRunning();
  }

  /** Clears the value and starts again from the first level with full ammo */
  reset() {
    this.value = '';
    this.landed = -1;
    this.newGame(0);
    this.render();
  }

  focus() {
    this.input.focus();
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    this.game?.stop();
    this.cleanups.forEach((fn) => fn());
    this.root.remove();
  }

  // ---------- internals ----------

  private get format(): ReedHuntFormat {
    return this.opts.format ?? reedHuntFormats.code;
  }

  private get texts(): ReedHuntTexts {
    return { ...defaultTexts, ...this.opts.texts };
  }

  private get totalAmmo() {
    return this.opts.ammo ?? ammoFor(this.format, this.opts.ammoFactor ?? 1.2);
  }

  private get typingOff() {
    return !!this.opts.disabled || this.over || this.opts.allowTyping === false;
  }

  private newGame(level: number) {
    this.level = level;
    this.over = false;
    this.game?.setLevel(level);
    this.game?.refill(this.totalAmmo);
    if (!this.game) this.ammoLeft = this.totalAmmo;
  }

  private commit(next: string) {
    const prev = this.value;
    const clean = normalizeDigits(next, this.format);
    if (clean === prev) {
      if (this.input.value !== clean) this.input.value = clean;
      return;
    }
    this.value = clean;
    this.landed = clean.length > prev.length ? clean.length - 1 : -1;
    this.renderView();
    this.opts.onChange?.(clean);
    const max = digitCapacity(this.format);
    if (this.format.kind === 'mask' && clean.length === max && prev.length < max) this.opts.onComplete?.(clean);
  }

  private async refill() {
    if (this.refilling) return;
    this.refilling = true;
    this.renderOverlay();
    try {
      const ok = await (this.opts.onRefill ?? demoRefill)();
      if (!ok || this.destroyed) return;
      this.value = '';
      this.landed = -1;
      this.newGame(this.level + 1);
      this.render();
      this.opts.onChange?.('');
    } finally {
      this.refilling = false;
      if (!this.destroyed) this.renderOverlay();
    }
  }

  private listen<K extends keyof HTMLElementEventMap>(
    target: HTMLElement,
    type: K,
    fn: (e: HTMLElementEventMap[K]) => void,
  ) {
    target.addEventListener(type, fn as EventListener);
    this.cleanups.push(() => target.removeEventListener(type, fn as EventListener));
  }

  private bindEvents() {
    const scene = (e: PointerEvent) => this.game?.toScene(e.clientX, e.clientY);

    this.listen(this.canvas, 'pointermove', (e) => {
      const p = scene(e);
      if (p && !this.opts.disabled) this.game?.setAim(p.x, p.y);
    });
    this.listen(this.canvas, 'pointerdown', (e) => {
      const p = scene(e);
      if (!p || this.opts.disabled || !this.game) return;
      e.preventDefault();
      if (e.button === 2) this.game.reload();
      else if (e.button === 0) this.game.shoot(p.x, p.y);
    });
    this.listen(this.canvas, 'pointerleave', () => this.game?.leave());
    this.listen(this.canvas, 'contextmenu', (e) => e.preventDefault());

    this.listen(this.refillBtn, 'click', () => void this.refill());

    this.listen(this.field, 'click', () => {
      if (!this.typingOff) this.input.focus();
    });
    this.listen(this.input, 'input', () => this.commit(this.input.value));
    // Digits fill left to right, so keep the caret at the end
    this.listen(this.input, 'select', () => {
      const n = this.input.value.length;
      if (this.input.selectionStart !== n) this.input.setSelectionRange(n, n);
    });

    this.listen(this.currencies, 'click', (e) => {
      const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-currency]');
      if (!btn || this.opts.disabled) return;
      const c = btn.dataset.currency!;
      this.update({ currency: c });
      this.opts.onCurrencyChange?.(c);
    });

    // Run only while on screen and in a visible tab
    if (typeof IntersectionObserver !== 'undefined') {
      const io = new IntersectionObserver(([entry]) => {
        this.onScreen = entry.isIntersecting;
        this.syncRunning();
      });
      io.observe(this.root);
      this.cleanups.push(() => io.disconnect());
    }
    const onVisibility = () => this.syncRunning();
    document.addEventListener('visibilitychange', onVisibility);
    this.cleanups.push(() => document.removeEventListener('visibilitychange', onVisibility));

    const media = typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)') : null;
    if (media) {
      const onMedia = () => this.applyTheme();
      media.addEventListener('change', onMedia);
      this.cleanups.push(() => media.removeEventListener('change', onMedia));
    }
  }

  private syncRunning() {
    if (!this.game) return;
    if (this.onScreen && !this.opts.disabled && document.visibilityState === 'visible') this.game.start();
    else {
      this.game.stop();
      this.game.draw();
    }
  }

  private applyTheme() {
    const theme = this.opts.theme ?? 'auto';
    const dark =
      theme === 'dark' ||
      (theme === 'auto' && typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches);
    this.root.classList.toggle('rh--dark', dark);
    this.game?.setDusk(dark);
  }

  private render() {
    const o = this.opts;
    const t = this.texts;
    this.root.classList.toggle('rh--disabled', !!o.disabled);

    this.label.textContent = o.label ?? '';
    this.label.hidden = !o.label;

    const list = o.currencies ?? ['€', '$', '£', '₽'];
    const currency = o.currency ?? '€';
    this.currencies.hidden = this.format.kind !== 'amount' || list.length === 0;
    this.currencies.setAttribute('aria-label', t.currency);
    this.currencies.innerHTML = list
      .map(
        (c) =>
          `<button type="button" role="radio" class="rh-currency" data-currency="${escapeHtml(c)}" aria-checked="${
            c === currency
          }"${o.disabled ? ' disabled' : ''}>${escapeHtml(c)}</button>`,
      )
      .join('');

    this.input.name = o.name ?? '';
    this.input.setAttribute('autocomplete', o.autocomplete ?? 'off');
    this.input.disabled = !!o.disabled;
    this.input.tabIndex = o.allowTyping === false ? -1 : 0;

    this.stage.dataset.level = String(Math.min(this.level, 3));
    this.renderView();
    this.renderOverlay();
    this.renderHint();
    this.syncInput();
  }

  private syncInput() {
    if (this.input.value !== this.value) this.input.value = this.value;
    this.input.readOnly = this.typingOff;
  }

  private renderHint() {
    const t = this.texts;
    this.hintText.textContent = t.hint;
    this.ammoText.textContent = `· ${t.ammoLeft(this.game ? this.ammoLeft : this.totalAmmo)}`;
  }

  private renderOverlay() {
    const t = this.texts;
    this.overlay.hidden = !this.over;
    this.overTitle.textContent = t.gameOver;
    this.overText1.textContent = t.outOfAmmo;
    this.overText2.textContent = t.dontWorry;
    this.refillBtn.textContent = this.refilling ? t.refilling : t.refill;
    this.refillBtn.disabled = this.refilling;
  }

  private renderView() {
    const f = this.format;
    const v = this.value;
    const cap = digitCapacity(f);
    this.syncInput();

    if (f.kind === 'mask') {
      this.view.className = 'rh-slots';
      const slot = (i: number) => {
        const cls = ['rh-slot'];
        if (cap > 8) cls.push('rh-slot--compact');
        if (v[i] !== undefined) cls.push('rh-slot--filled');
        if (i === v.length) cls.push('rh-slot--next');
        if (i === this.landed) cls.push('rh-slot--landed');
        return `<span class="${cls.join(' ')}" aria-hidden="true">${v[i] ?? ''}</span>`;
      };
      this.view.innerHTML = this.groups
        .map(
          (g) =>
            `<span class="rh-group">${g
              .map((tok) =>
                tok.type === 'slot'
                  ? slot(tok.index)
                  : tok.type === 'literal'
                    ? `<span class="rh-literal" aria-hidden="true">${escapeHtml(tok.text)}</span>`
                    : '',
              )
              .join('')}</span>`,
        )
        .join('');
    } else {
      this.view.className = 'rh-display';
      const sign =
        f.kind === 'amount'
          ? `<span class="rh-sign" aria-hidden="true">${escapeHtml(this.opts.currency ?? '€')}</span>`
          : '';
      const parts = f.kind === 'amount' ? groupThousands(v) : [v];
      const digits = v
        ? parts.map((p) => `<span class="rh-thousands">${p}</span>`).join('')
        : `<span class="rh-placeholder">${f.kind === 'amount' ? '0' : ''}</span>`;
      const caret = v.length < cap ? '<span class="rh-caret"></span>' : '';
      this.view.innerHTML = `${sign}<span class="rh-digits" aria-hidden="true">${digits}${caret}</span>`;
      if (this.landed >= 0) {
        void this.view.offsetWidth; // restart the bump animation
        this.view.classList.add('rh-display--bump');
      }
    }
    this.landed = -1;
  }
}

export function createReedHunt(host: HTMLElement, options?: ReedHuntOptions) {
  return new ReedHunt(host, options);
}
