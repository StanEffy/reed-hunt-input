/**
 * Game engine for ReedHuntInput: a tiny pixel-art scene drawn on a 192×108 canvas.
 * Digits (and now and then a red cross) fly up out of the reeds; the hunter shoots them.
 * Ammo is limited; when it runs out the game is over until someone tops it up, and every
 * top-up moves the marsh to a gloomier level. Kept free of React.
 */

export const W = 192;
export const H = 108;

type Rgb = string;
type Weather = 'clear' | 'rain' | 'storm' | 'embers';

interface Palette {
  sky: Rgb[];
  sun: Rgb;
  sunRing: Rgb;
  hills: Rgb;
  trees: Rgb;
  treesDark: Rgb;
  water: Rgb;
  waterHi: Rgb;
  cloud: Rgb;
  cloudShade: Rgb;
  reedBack: Rgb;
  reedFront: Rgb;
  reedDark: Rgb;
  cattail: Rgb;
  stars: boolean;
  deadTrees: boolean;
  weather: Weather;
}

const DAY: Palette = {
  sky: ['#4f86d1', '#5f95da', '#73a6e2', '#8ab7ea', '#a5c9f0', '#c4dcf2', '#f2dcae'],
  sun: '#fff3c2',
  sunRing: '#ffd56a',
  hills: '#5d8a55',
  trees: '#2f5a38',
  treesDark: '#244a2d',
  water: '#3f7394',
  waterHi: '#78afcc',
  cloud: '#ffffff',
  cloudShade: '#d6e6f5',
  reedBack: '#6f8f3c',
  reedFront: '#86a443',
  reedDark: '#4d6a27',
  cattail: '#6b3f22',
  stars: false,
  deadTrees: false,
  weather: 'clear',
};

const DUSK: Palette = {
  ...DAY,
  sky: ['#141833', '#1d2246', '#2b2c58', '#463566', '#6d4170', '#a35768', '#e08a5e'],
  sun: '#f4eccb',
  sunRing: '#c9c19c',
  hills: '#2b3a3a',
  trees: '#162426',
  treesDark: '#0f1a1c',
  water: '#1f3346',
  waterHi: '#5a7d99',
  cloud: '#6b5a80',
  cloudShade: '#4a3f62',
  reedBack: '#3f5a2a',
  reedFront: '#556f30',
  reedDark: '#2c401b',
  cattail: '#3e2414',
  stars: true,
};

/** Each paid top-up moves one step down this list */
const GLOOM: Palette[] = [
  {
    // 1: overcast, drizzle
    sky: ['#3d4450', '#474e5a', '#525a66', '#5e6672', '#6a717c', '#767c85', '#8a8a86'],
    sun: '#b8b8ae',
    sunRing: '#9a9a92',
    hills: '#3e4a3c',
    trees: '#25302a',
    treesDark: '#1b241f',
    water: '#2f3d47',
    waterHi: '#5b6b75',
    cloud: '#5a606a',
    cloudShade: '#474c55',
    reedBack: '#4f5a34',
    reedFront: '#5f6a3c',
    reedDark: '#3a4226',
    cattail: '#4a2e1a',
    stars: false,
    deadTrees: false,
    weather: 'rain',
  },
  {
    // 2: night, red moon, dead forest, storm
    sky: ['#07070c', '#0b0b14', '#10101c', '#161524', '#1e1a2a', '#2a1d2a', '#3a1f26'],
    sun: '#c8433a',
    sunRing: '#7a1f1a',
    hills: '#141a18',
    trees: '#0b0f0e',
    treesDark: '#060908',
    water: '#0e161c',
    waterHi: '#3a2a30',
    cloud: '#1e1e2a',
    cloudShade: '#141420',
    reedBack: '#2a3020',
    reedFront: '#353a24',
    reedDark: '#1c2014',
    cattail: '#2a160c',
    stars: true,
    deadTrees: true,
    weather: 'storm',
  },
  {
    // 3+: the marsh is on fire
    sky: ['#120203', '#1e0405', '#2c0608', '#3e0a0a', '#561010', '#741812', '#a0261a'],
    sun: '#ff5a2a',
    sunRing: '#a01a0a',
    hills: '#1a0a08',
    trees: '#0e0504',
    treesDark: '#070202',
    water: '#2a0806',
    waterHi: '#7a1a10',
    cloud: '#3a0e0c',
    cloudShade: '#2a0808',
    reedBack: '#3a2a14',
    reedFront: '#4a3418',
    reedDark: '#24180a',
    cattail: '#1a0a04',
    stars: false,
    deadTrees: true,
    weather: 'embers',
  },
];

// 3×5 pixel font
const GLYPHS: Record<string, string[]> = {
  '0': ['111', '101', '101', '101', '111'],
  '1': ['010', '110', '010', '010', '111'],
  '2': ['111', '001', '111', '100', '111'],
  '3': ['111', '001', '111', '001', '111'],
  '4': ['101', '101', '111', '001', '001'],
  '5': ['111', '100', '111', '001', '111'],
  '6': ['111', '100', '111', '101', '111'],
  '7': ['111', '001', '010', '010', '010'],
  '8': ['111', '101', '111', '101', '111'],
  '9': ['111', '101', '111', '001', '111'],
  '+': ['000', '010', '111', '010', '000'],
  '-': ['000', '000', '111', '000', '000'],
  x: ['000', '101', '010', '101', '000'],
};

const CROSS = ['1100011', '1110111', '0111110', '0011100', '0111110', '1110111', '1100011'];

const HUNTER_X = 96;
const SHOULDER = { x: HUNTER_X + 3, y: 93 };
const GUN_LEN = 24;
/** Pellet spread: about the size of the digit plate, so you have to actually hit it */
const HIT_RADIUS = 5.5;
const WOBBLE = 3;
const RELOAD_EMPTY = 0.9;
const RELOAD_MANUAL = 0.55;
const GAME_OVER_DELAY = 0.9;

/** The last marsh: no more top-ups, ammo trickles back, and something lives in the lake */
export const FINAL_LEVEL = 3;
/** Seconds per round that comes back on the final level */
const REGEN_EVERY = 10;
const MONSTER_FIRST = 6;
const MONSTER_GAP_MIN = 16;
const MONSTER_GAP_MAX = 26;
/** Seconds from the far edge of the lake to the hunter's face */
const MONSTER_FLIGHT = 7;
const MONSTER_HP = 2;

// 11×6, two frames: w = wing, b = body, e = eye
const MONSTER_UP = ['w.........w', 'ww..b.b..ww', 'wwwbbbbbwww', '.wwbebebww.', '...bbbbb...', '....b.b....'];
const MONSTER_DOWN = ['....b.b....', '...bbbbb...', '.wwbebebww.', 'wwwbbbbbwww', 'ww..bbb..ww', 'w....b....w'];

export type GameOverReason = 'ammo' | 'eaten';

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Target {
  kind: 'digit' | 'cross';
  digit: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  phase: number;
  hit: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  color: Rgb;
  gravity: number;
}

interface Floater {
  text: string;
  x: number;
  y: number;
  life: number;
  color: Rgb;
}

interface Monster {
  side: -1 | 1;
  /** 0 at the horizon, 1 in the hunter's face */
  p: number;
  age: number;
  hp: number;
  flash: number;
}

interface Reed {
  x: number;
  h: number;
  phase: number;
  cattail: boolean;
  dark: boolean;
}

export interface GameCallbacks {
  /** Read on every spawn, hit and when ammo runs out */
  getFill: () => { filled: number; max: number; complete: boolean };
  onDigit: (digit: string) => void;
  onErase: () => void;
  /** 'ammo': gone before the input was complete; 'eaten': the final level's monster got through */
  onGameOver: (reason: GameOverReason) => void;
  /** Rounds left (in the gun plus spare) changed */
  onAmmo?: (left: number) => void;
}

export interface GameOptions {
  speed: number;
}

export class ReedHuntGame {
  private ctx: CanvasRenderingContext2D;
  private bg: HTMLCanvasElement;
  private palette: Palette = DAY;
  private dusk = false;
  private level = 0;
  private rand = mulberry32(Date.now() & 0xffff);
  private targets: Target[] = [];
  private particles: Particle[] = [];
  private floaters: Floater[] = [];
  private backReeds: Reed[] = [];
  private frontReeds: Reed[] = [];
  private clouds = [
    { x: 20, y: 14, w: 22 },
    { x: 90, y: 26, w: 16 },
    { x: 140, y: 10, w: 26 },
  ];
  private time = 0;
  private spawnIn = 0.6;
  /** Rounds in the barrels (max 2) and spare rounds in the pouch */
  private shells = 2;
  private reserve = 0;
  private reloadLeft = 0;
  private outFor = 0;
  private over = false;
  private recoil = 0;
  private flash = 0;
  private lightning = 0;
  private capacity = 0;
  private regenT = 0;
  private monster: Monster | null = null;
  private monsterIn = MONSTER_FIRST;
  private redFlash = 0;
  private aim = { x: W / 2, y: H / 3 };
  private pointerInside = false;
  private raf = 0;
  private last = 0;
  running = false;

  constructor(
    private canvas: HTMLCanvasElement,
    private cb: GameCallbacks,
    public options: GameOptions,
    ammo: number,
  ) {
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D is not available');
    this.ctx = ctx;
    ctx.imageSmoothingEnabled = false;
    this.bg = document.createElement('canvas');
    this.bg.width = W;
    this.bg.height = H;
    this.makeReeds();
    this.loadAmmo(ammo);
    this.applyPalette();
  }

  get ammoLeft() {
    return this.shells + this.reserve;
  }

  get isOver() {
    return this.over;
  }

  get isFinal() {
    return this.level >= FINAL_LEVEL;
  }

  setDusk(dusk: boolean) {
    if (dusk === this.dusk) return;
    this.dusk = dusk;
    this.applyPalette();
  }

  /** 0 is the normal marsh; each level after it is gloomier and a bit faster */
  setLevel(level: number) {
    this.level = Math.max(0, level);
    this.applyPalette();
  }

  /** Fresh ammo and an empty sky; used on start, after a top-up or when the format changes */
  refill(ammo: number) {
    this.loadAmmo(ammo);
    this.targets = [];
    this.particles = [];
    this.floaters = [];
    this.over = false;
    this.outFor = 0;
    this.reloadLeft = 0;
    this.spawnIn = 0.6;
    this.monster = null;
    this.monsterIn = MONSTER_FIRST;
    this.regenT = 0;
    this.redFlash = 0;
    if (!this.running) this.draw();
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    const tick = (now: number) => {
      if (!this.running) return;
      const dt = Math.min(0.05, (now - this.last) / 1000);
      this.last = now;
      this.update(dt);
      this.draw();
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  /** Converts a pointer position to scene pixels */
  toScene(clientX: number, clientY: number) {
    const r = this.canvas.getBoundingClientRect();
    return {
      x: ((clientX - r.left) / r.width) * W,
      y: ((clientY - r.top) / r.height) * H,
    };
  }

  setAim(x: number, y: number) {
    this.aim = { x, y };
    this.pointerInside = true;
  }

  leave() {
    this.pointerInside = false;
  }

  reload() {
    if (this.over || this.shells >= 2 || this.reserve <= 0 || this.reloadLeft > 0) return;
    this.reloadLeft = RELOAD_MANUAL;
  }

  shoot(x: number, y: number) {
    this.setAim(x, y);
    if (this.over || this.reloadLeft > 0 || this.shells <= 0) return;
    this.shells -= 1;
    this.cb.onAmmo?.(this.ammoLeft);
    this.recoil = 0.09;
    this.flash = 0.07;
    if (this.shells === 0 && this.reserve > 0) this.reloadLeft = RELOAD_EMPTY;

    // The shot takes the nearest live target inside the spread
    let best: Target | null = null;
    let bestD = HIT_RADIUS;
    for (const t of this.targets) {
      if (t.hit) continue;
      const d = Math.hypot(t.x - x, t.y + this.wobble(t) - y);
      if (d < bestD) {
        best = t;
        bestD = d;
      }
    }

    // ...unless the thing from the lake is closer to the crosshair
    if (this.monster) {
      const m = this.monsterPos(this.monster);
      const d = Math.hypot(m.x - x, m.y - y);
      if (d < m.radius && (!best || d < bestD)) {
        this.hitMonster(this.monster, m.x, m.y);
        return;
      }
    }

    if (!best) {
      this.burst(x, y, 4, ['#d9d2c0', '#a89f8a'], 18, 0);
      return;
    }

    best.hit = true;
    best.vx *= 0.2;
    best.vy = -12;
    if (best.kind === 'digit') {
      const { filled, max } = this.cb.getFill();
      if (filled < max) {
        this.cb.onDigit(best.digit);
        this.floaters.push({ text: `+${best.digit}`, x: best.x, y: best.y - 10, life: 0.9, color: '#fff3c2' });
      }
      this.burst(best.x, best.y, 10, ['#ffffff', '#e8e2d0', '#c9bfa6'], 30, 40);
    } else {
      if (this.cb.getFill().filled > 0) {
        this.cb.onErase();
        this.floaters.push({ text: '-', x: best.x, y: best.y - 10, life: 0.9, color: '#ff8a7a' });
      }
      this.burst(best.x, best.y, 14, ['#e0322b', '#ff6a55', '#7a1410'], 40, 30);
    }
  }

  // ---------- simulation ----------

  private hitMonster(m: Monster, x: number, y: number) {
    m.hp -= 1;
    m.flash = 0.12;
    m.p = Math.max(0, m.p - 0.08); // knocked back a little
    this.burst(x, y, 8, ['#3a1424', '#1a0a12', '#ff2a2a'], 30, 20);
    if (m.hp > 0) return;
    this.burst(x, y, 24, ['#3a1424', '#1a0a12', '#ff2a2a', '#7a1410'], 50, 30);
    this.monster = null;
    this.monsterIn = MONSTER_GAP_MIN + this.rand() * (MONSTER_GAP_MAX - MONSTER_GAP_MIN);
  }

  /** Where the monster is now, how big its pixels are and how easy it is to hit */
  private monsterPos(m: Monster) {
    const e = m.p * m.p; // slow out of the haze, then a rush
    const x0 = m.side < 0 ? 6 : W - 6;
    const y0 = 71;
    const x1 = HUNTER_X;
    const y1 = 88;
    const scale = 1 + Math.floor(e * 3.2);
    return {
      x: x0 + (x1 - x0) * e + Math.sin(m.age * 2.3) * 4 * (1 - e),
      y: y0 + (y1 - y0) * e - Math.sin(e * Math.PI) * 16 + Math.sin(m.age * 7) * 1.5,
      scale,
      e,
      radius: Math.max(HIT_RADIUS, 4.5 * scale),
    };
  }

  private loadAmmo(total: number) {
    const n = Math.max(0, Math.floor(total));
    this.capacity = n;
    this.shells = Math.min(2, n);
    this.reserve = n - this.shells;
    this.cb.onAmmo?.(this.ammoLeft);
  }

  private applyPalette() {
    this.palette = this.level === 0 ? (this.dusk ? DUSK : DAY) : GLOOM[Math.min(this.level, GLOOM.length) - 1];
    this.renderBackground();
    if (!this.running) this.draw();
  }

  private update(dt: number) {
    this.time += dt;
    const sp = this.options.speed * (1 + this.level * 0.12);

    if (this.reloadLeft > 0) {
      this.reloadLeft -= dt;
      if (this.reloadLeft <= 0) {
        const take = Math.min(2 - this.shells, this.reserve);
        this.shells += take;
        this.reserve -= take;
      }
    }
    this.recoil = Math.max(0, this.recoil - dt);
    this.flash = Math.max(0, this.flash - dt);

    // Out of ammo: give the last bird time to fall, then end the game unless the input is done.
    // Not on the final level: there ammo comes back on its own.
    if (!this.over && !this.isFinal && this.ammoLeft === 0) {
      this.outFor += dt;
      if (this.outFor >= GAME_OVER_DELAY && !this.cb.getFill().complete) {
        this.over = true;
        this.cb.onGameOver('ammo');
      }
    }

    if (this.isFinal && !this.over) this.updateFinal(dt);
    this.redFlash = Math.max(0, this.redFlash - dt);

    if (this.palette.weather === 'storm') {
      this.lightning = Math.max(0, this.lightning - dt);
      if (this.rand() < dt * 0.25) this.lightning = 0.12;
    }

    for (const c of this.clouds) {
      c.x += dt * (this.palette.weather === 'clear' ? 2.5 : 6);
      if (c.x > W + 4) c.x = -c.w - 4;
    }

    if (!this.over) {
      this.spawnIn -= dt * sp;
      if (this.spawnIn <= 0) {
        this.spawn();
        this.spawnIn = 0.9 + this.rand() * 0.8;
      }
    }

    for (const t of this.targets) {
      t.age += dt;
      if (t.hit) t.vy += 140 * dt;
      else t.vy -= 6 * dt * sp; // keeps climbing a little faster
      t.x += t.vx * dt * (t.hit ? 1 : sp);
      t.y += t.vy * dt * (t.hit ? 1 : sp);
    }
    this.targets = this.targets.filter(
      (t) => t.x > -14 && t.x < W + 14 && t.y > -14 && !(t.hit && t.y > H - 6),
    );

    for (const p of this.particles) {
      p.life -= dt;
      p.vy += p.gravity * dt;
      p.vx *= 1 - dt * 1.5;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
    this.particles = this.particles.filter((p) => p.life > 0);

    for (const f of this.floaters) {
      f.life -= dt;
      f.y -= dt * 10;
    }
    this.floaters = this.floaters.filter((f) => f.life > 0);
  }

  private updateFinal(dt: number) {
    // A round trickles back now and then
    this.regenT += dt;
    if (this.regenT >= REGEN_EVERY) {
      this.regenT = 0;
      if (this.ammoLeft < this.capacity) {
        if (this.shells < 2 && this.reloadLeft <= 0) this.shells += 1;
        else this.reserve += 1;
        this.cb.onAmmo?.(this.ammoLeft);
        this.floaters.push({ text: '+1', x: 24, y: H - 22, life: 1.2, color: '#9be26a' });
      }
    }

    // Something flies out of the far edge of the lake, straight at the hunter
    if (!this.monster) {
      this.monsterIn -= dt;
      if (this.monsterIn <= 0) {
        this.monster = { side: this.rand() < 0.5 ? -1 : 1, p: 0, age: 0, hp: MONSTER_HP, flash: 0 };
      }
      return;
    }
    const m = this.monster;
    m.age += dt;
    m.flash = Math.max(0, m.flash - dt);
    m.p += (dt / MONSTER_FLIGHT) * this.options.speed;
    if (m.p >= 1) {
      this.monster = null;
      this.over = true;
      this.redFlash = 0.6;
      this.burst(HUNTER_X, 86, 30, ['#ff2a2a', '#7a1410', '#1a0a12'], 60, 40);
      this.cb.onGameOver('eaten');
    }
  }

  private spawn() {
    const { filled, max } = this.cb.getFill();
    const live = this.targets.filter((t) => !t.hit);
    if (live.length >= 3) return;

    const hasCross = live.some((t) => t.kind === 'cross');
    const full = filled >= max;
    let kind: Target['kind'] | null;
    if (full) kind = !hasCross && filled > 0 ? 'cross' : null;
    else if (filled > 0 && !hasCross && this.rand() < 0.2) kind = 'cross';
    else kind = 'digit';
    if (!kind) return;

    // Start in the left or right half and mostly head outwards, so the screen stays readable
    const fromLeft = this.rand() < 0.5;
    const x = fromLeft ? 18 + this.rand() * 60 : W - 18 - this.rand() * 60;
    const dir = this.rand() < 0.75 ? (fromLeft ? -1 : 1) : fromLeft ? 1 : -1;
    this.targets.push({
      kind,
      digit: kind === 'digit' ? String(Math.floor(this.rand() * 10)) : '',
      x,
      y: 84,
      vx: dir * (16 + this.rand() * 26),
      vy: -(28 + this.rand() * 16),
      age: 0,
      phase: this.rand() * Math.PI * 2,
      hit: false,
    });
  }

  private burst(x: number, y: number, n: number, colors: Rgb[], speed: number, gravity: number) {
    for (let i = 0; i < n; i++) {
      const a = this.rand() * Math.PI * 2;
      const s = speed * (0.4 + this.rand() * 0.6);
      const life = 0.4 + this.rand() * 0.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s - 6,
        life,
        max: life,
        color: colors[i % colors.length],
        gravity,
      });
    }
  }

  private wobble(t: Target) {
    return t.hit ? 0 : Math.sin(t.age * 4.5 + t.phase) * WOBBLE;
  }

  // ---------- drawing ----------

  private px(x: number, y: number, w: number, h: number, c: Rgb, ctx = this.ctx) {
    ctx.fillStyle = c;
    ctx.fillRect(Math.round(x), Math.round(y), w, h);
  }

  private makeReeds() {
    const r = mulberry32(7);
    for (let x = 0; x < W; x += 2 + Math.floor(r() * 3)) {
      this.backReeds.push({ x, h: 6 + Math.floor(r() * 10), phase: r() * 6, cattail: r() < 0.18, dark: r() < 0.4 });
    }
    for (let x = -2; x < W + 2; x += 3 + Math.floor(r() * 4)) {
      // Lower around the hunter so he stays visible
      const nearHunter = Math.abs(x - HUNTER_X) < 12;
      const h = nearHunter ? 8 + Math.floor(r() * 8) : 14 + Math.floor(r() * 16);
      this.frontReeds.push({ x, h, phase: r() * 6, cattail: !nearHunter && r() < 0.25, dark: r() < 0.45 });
    }
  }

  private renderBackground() {
    const ctx = this.bg.getContext('2d')!;
    const p = this.palette;
    const r = mulberry32(42);
    const horizon = 66;
    const band = Math.ceil(horizon / p.sky.length);

    p.sky.forEach((c, i) => this.px(0, i * band, W, band, c, ctx));
    // Dither between bands
    for (let i = 1; i < p.sky.length; i++) {
      const y = i * band;
      for (let x = 0; x < W; x += 2) {
        this.px(x, y - 1, 1, 1, p.sky[i], ctx);
        this.px(x + 1, y, 1, 1, p.sky[i - 1], ctx);
      }
    }

    if (p.stars) {
      for (let i = 0; i < 40; i++) {
        this.px(Math.floor(r() * W), Math.floor(r() * 40), 1, 1, r() < 0.3 ? '#fff6d5' : '#b9b3d6', ctx);
      }
    }

    // Sun (or moon)
    const sx = 150;
    const sy = 22;
    for (let y = -8; y <= 8; y++) {
      for (let x = -8; x <= 8; x++) {
        const d = Math.hypot(x, y);
        if (d <= 6.5) this.px(sx + x, sy + y, 1, 1, p.sun, ctx);
        else if (d <= 8 && (x + y) % 2 === 0) this.px(sx + x, sy + y, 1, 1, p.sunRing, ctx);
      }
    }

    // Hills
    for (let x = 0; x < W; x++) {
      const top = 58 + Math.round(Math.sin(x * 0.045 + 1) * 3 + Math.sin(x * 0.11) * 1.5);
      this.px(x, top, 1, 72 - top, p.hills, ctx);
    }

    // Treeline: pines, or bare dead trunks on the gloomy levels
    for (let cx = -3; cx < W + 4; cx += 4 + Math.floor(r() * 4)) {
      const h = 7 + Math.floor(r() * 9);
      const top = 70 - h;
      const shade = r() < 0.5 ? p.trees : p.treesDark;
      if (p.deadTrees) {
        this.px(cx, top, 1, h, shade, ctx);
        for (let b = 2; b < h - 2; b += 3) {
          const side = (b + cx) % 2 === 0 ? 1 : -1;
          this.px(cx + side, top + b, 1, 1, shade, ctx);
          this.px(cx + side * 2, top + b - 1, 1, 1, shade, ctx);
        }
      } else {
        for (let row = 0; row < h; row++) {
          const hw = Math.floor(row / 2.4);
          this.px(cx - hw, top + row, hw * 2 + 1, 1, shade, ctx);
        }
      }
    }
    this.px(0, 69, W, 4, p.treesDark, ctx);

    // Water
    this.px(0, 72, W, H - 72, p.water, ctx);
    this.px(0, 72, W, 1, p.waterHi, ctx);
    for (let i = 0; i < 26; i++) {
      this.px(Math.floor(r() * W), 74 + Math.floor(r() * 30), 2 + Math.floor(r() * 5), 1, p.waterHi, ctx);
    }
  }

  private drawClouds() {
    const p = this.palette;
    for (const c of this.clouds) {
      this.px(c.x + 3, c.y, c.w - 8, 2, p.cloud);
      this.px(c.x, c.y + 2, c.w, 3, p.cloud);
      this.px(c.x + 6, c.y - 2, Math.floor(c.w / 3), 2, p.cloud);
      this.px(c.x + 1, c.y + 5, c.w - 2, 1, p.cloudShade);
    }
  }

  private drawWeather() {
    const w = this.palette.weather;
    if (w === 'rain' || w === 'storm') {
      const n = w === 'storm' ? 70 : 40;
      const color = w === 'storm' ? '#5a6478' : '#9aa6b4';
      for (let i = 0; i < n; i++) {
        const x = (i * 53 + Math.floor(this.time * 25)) % W;
        const y = (i * 29 + Math.floor(this.time * (w === 'storm' ? 160 : 110))) % (H + 6);
        this.px(x, y - 3, 1, 3, color);
      }
    } else if (w === 'embers') {
      for (let i = 0; i < 30; i++) {
        const x = (i * 41 + Math.sin(this.time * 2 + i) * 4 + W) % W;
        const y = H - ((i * 23 + this.time * 14) % H);
        this.px(x, y, 1, 1, i % 3 === 0 ? '#ffb347' : '#ff5a2a');
      }
    }
  }

  private drawReeds(reeds: Reed[], baseY: number, front: boolean) {
    const p = this.palette;
    const wind = this.palette.weather === 'clear' ? 1 : 1.8;
    for (const reed of reeds) {
      const color = reed.dark ? p.reedDark : front ? p.reedFront : p.reedBack;
      let tipX = reed.x;
      for (let i = 0; i < reed.h; i++) {
        const k = i / reed.h;
        const dx = Math.round(Math.sin(this.time * 1.4 * wind + reed.phase) * k * k * (front ? 2.2 : 1.2) * wind);
        tipX = reed.x + dx;
        this.px(tipX, baseY - i, 1, 1, color);
      }
      if (reed.cattail) {
        this.px(tipX, baseY - reed.h - 4, 2, 4, p.cattail);
        this.px(tipX, baseY - reed.h - 6, 1, 2, color);
      } else if (front) {
        this.px(tipX - 1, baseY - reed.h + 3, 1, 2, color);
      }
    }
  }

  /** `shadow` is a 1px drop shadow, which keeps the counters of 0/6/8/9 open */
  private drawGlyph(ch: string, x: number, y: number, scale: number, color: Rgb, shadow?: Rgb) {
    const g = GLYPHS[ch];
    if (!g) return;
    if (shadow) {
      g.forEach((row, ry) =>
        [...row].forEach((bit, rx) => {
          if (bit === '1') this.px(x + rx * scale + 1, y + ry * scale + 1, scale, scale, shadow);
        }),
      );
    }
    g.forEach((row, ry) =>
      [...row].forEach((bit, rx) => {
        if (bit === '1') this.px(x + rx * scale, y + ry * scale, scale, scale, color);
      }),
    );
  }

  private drawWings(cx: number, cy: number, halfW: number, flapUp: boolean, color: Rgb, tip: Rgb) {
    for (const side of [-1, 1]) {
      const bx = side < 0 ? cx - halfW - 1 : cx + halfW;
      const steps = flapUp ? [0, -1, -2, -3] : [0, 1, 2, 2];
      steps.forEach((dy, i) => {
        this.px(bx + side * i, cy + dy - 1, 1, 2, i === 3 ? tip : color);
      });
    }
  }

  private drawTarget(t: Target) {
    const y = t.y + this.wobble(t);
    const flapUp = t.hit ? false : Math.floor(t.age * 9 + t.phase) % 2 === 0;
    if (t.kind === 'digit') {
      const bx = Math.round(t.x) - 5;
      const by = Math.round(y) - 7;
      const face = t.hit ? '#c9bfa6' : '#fff6d5';
      this.drawWings(t.x, y - 1, 5, flapUp, '#efe9d8', '#9a8f78');
      // body: an outlined plate with notched corners, the digit printed on it
      this.px(bx + 1, by - 1, 8, 16, '#2a1a10');
      this.px(bx - 1, by + 1, 12, 12, '#2a1a10');
      this.px(bx, by, 10, 14, '#2a1a10');
      this.px(bx + 1, by, 8, 14, face);
      this.px(bx, by + 1, 10, 12, face);
      this.px(bx + 1, by + 12, 8, 1, '#e3d6b0');
      this.drawGlyph(t.digit, bx + 2, by + 2, 2, t.hit ? '#7a6a5a' : '#2a1a10');
    } else {
      this.drawWings(t.x, y, 4, flapUp, '#f2d0cc', '#9a5a52');
      const ox = Math.round(t.x - 3.5);
      const oy = Math.round(y - 3.5);
      CROSS.forEach((row, ry) =>
        [...row].forEach((bit, rx) => {
          if (bit === '1') this.px(ox + rx - 1, oy + ry - 1, 3, 3, '#3a0a08');
        }),
      );
      CROSS.forEach((row, ry) =>
        [...row].forEach((bit, rx) => {
          if (bit === '1') this.px(ox + rx, oy + ry, 1, 1, t.hit ? '#7a1410' : '#e0322b');
        }),
      );
    }
  }

  private drawMonster() {
    const m = this.monster;
    if (!m) return;
    const { x, y, scale } = this.monsterPos(m);
    const frame = Math.floor(m.age * 8) % 2 === 0 ? MONSTER_UP : MONSTER_DOWN;
    const ox = Math.round(x - (11 * scale) / 2);
    const oy = Math.round(y - (6 * scale) / 2);
    const colors: Record<string, Rgb> =
      m.flash > 0
        ? { w: '#ffffff', b: '#ffffff', e: '#ff2a2a' }
        : { w: '#3a1424', b: '#1a0a12', e: Math.floor(m.age * 4) % 2 ? '#ff2a2a' : '#ff6a55' };
    // An ember-coloured rim, so it stands out against the dark sky of the burning marsh
    const rim = m.flash > 0 ? '#ffffff' : '#c8502e';
    frame.forEach((row, ry) =>
      [...row].forEach((ch, rx) => {
        if (ch !== '.') this.px(ox + rx * scale - 1, oy + ry * scale - 1, scale + 2, scale + 2, rim);
      }),
    );
    frame.forEach((row, ry) =>
      [...row].forEach((ch, rx) => {
        if (ch !== '.') this.px(ox + rx * scale, oy + ry * scale, scale, scale, colors[ch]);
      }),
    );
  }

  private aimAngle() {
    let a = Math.atan2(this.aim.y - SHOULDER.y, this.aim.x - SHOULDER.x);
    // Only point upwards
    const min = -Math.PI + 0.25;
    const max = -0.25;
    if (a > max && a < Math.PI / 2) a = max;
    else if (a >= Math.PI / 2 || a < min) a = min;
    return a;
  }

  private drawHunter() {
    const bob = Math.round(Math.sin(this.time * 2) * 0.5);
    const x = HUNTER_X;
    const y = 84 + bob + (this.over ? 2 : 0); // slumps when it's over
    this.px(x - 7, y + 9, 15, H - y - 9, '#4f5a34');
    this.px(x - 7, y + 9, 15, 1, '#66744a');
    this.px(x - 1, y + 9, 3, H - y - 9, '#434d2b');
    this.px(x - 3, y + 4, 7, 5, '#3a2a1a');
    this.px(x - 4, y + 8, 9, 1, '#7a6a4a');
    this.px(x - 6, y + 3, 13, 1, '#5a3b1e');
    this.px(x - 4, y, 9, 3, '#6e4a26');
    this.px(x - 4, y + 2, 9, 1, '#3d2712');

    const a = this.over ? -Math.PI + 0.35 : this.aimAngle();
    const back = this.recoil > 0 ? 2 : 0;
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    const sx = SHOULDER.x - cos * back;
    const sy = SHOULDER.y + bob - sin * back + (this.over ? 2 : 0);
    const nx = -sin;
    const ny = cos;
    for (let i = 0; i <= GUN_LEN; i++) {
      const gx = sx + cos * i;
      const gy = sy + sin * i;
      if (i < 8) {
        this.px(gx, gy, 2, 2, '#7a4a24');
      } else {
        this.px(gx, gy, 1, 1, '#1d1d22');
        this.px(gx + nx, gy + ny, 1, 1, '#4a4a55');
      }
    }
    this.px(sx + cos * 12, sy + sin * 12 + 1, 2, 2, '#c99a6e');

    if (this.flash > 0) {
      const fx = sx + cos * (GUN_LEN + 2);
      const fy = sy + sin * (GUN_LEN + 2);
      this.px(fx - 2, fy - 2, 5, 5, '#ff9c2a');
      this.px(fx - 1, fy - 1, 3, 3, '#fff3a0');
      this.px(fx + cos * 4, fy + sin * 4, 2, 2, '#ffd56a');
    }
  }

  private drawHud() {
    // Barrels, bottom left
    for (let i = 0; i < 2; i++) {
      const loaded = i < this.shells;
      const blink = this.reloadLeft > 0 && Math.floor(this.time * 8) % 2 === 0;
      const x = 4 + i * 5;
      const y = H - 10;
      this.px(x - 1, y - 1, 5, 9, '#1a120c');
      if (loaded) {
        this.px(x, y, 3, 5, '#c8312a');
        this.px(x, y, 1, 5, '#e85a4a');
        this.px(x, y + 5, 3, 2, '#d9b23a');
      } else {
        this.px(x, y, 3, 7, blink ? '#5a4a3a' : '#2c2219');
      }
    }
    // Spare rounds: "x18"
    const text = `x${this.reserve}`;
    const low = this.reserve <= 3;
    const color = low && Math.floor(this.time * 3) % 2 === 0 ? '#ff6a55' : low ? '#e0322b' : '#fff3c2';
    this.px(14, H - 11, text.length * 4 + 2, 9, '#1a120c');
    [...text].forEach((ch, i) => this.drawGlyph(ch, 16 + i * 4, H - 9, 1, color));
  }

  private drawCrosshair() {
    if (!this.pointerInside || this.over) return;
    const x = Math.round(this.aim.x);
    const y = Math.round(this.aim.y);
    const light = this.reloadLeft > 0 || this.shells === 0 ? '#a0a0a0' : '#ffffff';
    const arms = [
      [-5, 0, 3, 1],
      [3, 0, 3, 1],
      [0, -5, 1, 3],
      [0, 3, 1, 3],
    ];
    for (const [dx, dy, w, h] of arms) this.px(x + dx - 1, y + dy - 1, w + 2, h + 2, '#111111');
    for (const [dx, dy, w, h] of arms) this.px(x + dx, y + dy, w, h, light);
    this.px(x, y, 1, 1, '#e0322b');
  }

  draw() {
    const ctx = this.ctx;
    ctx.drawImage(this.bg, 0, 0);
    this.drawClouds();

    const hi = this.palette.waterHi;
    for (let i = 0; i < 6; i++) {
      const x = (i * 37 + Math.floor(this.time * 6)) % W;
      this.px(x, 76 + ((i * 7) % 26), 3, 1, hi);
    }

    this.drawReeds(this.backReeds, 84, false);
    // Far away it is behind everything; once it is close it is in front of the reeds
    const monsterNear = !!this.monster && this.monster.p > 0.7;
    if (!monsterNear) this.drawMonster();
    for (const t of this.targets) this.drawTarget(t);
    this.drawHunter();
    this.drawReeds(this.frontReeds, H, true);
    if (monsterNear) this.drawMonster();
    this.drawWeather();

    for (const p of this.particles) {
      if (p.life / p.max > 0.15 || Math.floor(this.time * 20) % 2 === 0) this.px(p.x, p.y, 1, 1, p.color);
    }
    for (const f of this.floaters) {
      [...f.text].forEach((ch, i) => this.drawGlyph(ch, f.x - 7 + i * 7, f.y, 2, f.color, '#1a120c'));
    }

    if (this.lightning > 0) {
      ctx.globalAlpha = 0.35;
      this.px(0, 0, W, H, '#dfe6ff');
      ctx.globalAlpha = 1;
    }
    if (this.redFlash > 0) {
      ctx.globalAlpha = Math.min(0.6, this.redFlash);
      this.px(0, 0, W, H, '#c8102e');
      ctx.globalAlpha = 1;
    }

    this.drawHud();
    this.drawCrosshair();
  }
}
