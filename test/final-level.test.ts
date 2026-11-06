import { beforeAll, describe, expect, it, vi } from 'vitest';
import { FINAL_LEVEL, ReedHuntGame, type GameCallbacks } from '../src/game';
import { ReedHunt, reedHuntFormats, reedHuntLocales } from '../src';

// A canvas context that draws nothing, so the engine can run in jsdom
beforeAll(() => {
  const ctx = new Proxy({} as Record<string, unknown>, {
    get: (target, key) => (key in target ? target[key as string] : () => undefined),
    set: (target, key, value) => ((target[key as string] = value), true),
  });
  HTMLCanvasElement.prototype.getContext = (() => ctx) as unknown as typeof HTMLCanvasElement.prototype.getContext;
});

/* eslint-disable @typescript-eslint/no-explicit-any */
const step = (game: ReedHuntGame, seconds: number, dt = 0.05) => {
  for (let t = 0; t < seconds; t += dt) (game as any).update(dt);
};

const makeGame = (ammo: number, complete = false) => {
  const cb: GameCallbacks = {
    getFill: () => ({ filled: 0, max: 4, complete }),
    onDigit: vi.fn(),
    onErase: vi.fn(),
    onGameOver: vi.fn(),
    onAmmo: vi.fn(),
  };
  const game = new ReedHuntGame(document.createElement('canvas'), cb, { speed: 1 }, ammo);
  return { game, cb };
};

describe('levels before the last', () => {
  it('ends the game when ammo runs out', () => {
    const { game, cb } = makeGame(2);
    game.shoot(5, 5);
    game.shoot(5, 5);
    step(game, 2);
    expect(cb.onGameOver).toHaveBeenCalledWith('ammo');
  });
});

describe('the final level', () => {
  it('never ends for lack of ammo, and ammo trickles back', () => {
    const { game, cb } = makeGame(2);
    game.setLevel(FINAL_LEVEL);
    (game as any).monsterIn = 1e9; // keep the monster away for this one
    game.shoot(5, 5);
    game.shoot(5, 5);
    step(game, 3);
    expect(cb.onGameOver).not.toHaveBeenCalled();
    expect(game.ammoLeft).toBe(0);
    step(game, 10);
    expect(game.ammoLeft).toBe(1);
  });

  it('sends something out of the lake that ends the game if it gets through', () => {
    const { game, cb } = makeGame(10);
    game.setLevel(FINAL_LEVEL);
    step(game, 6.2);
    expect((game as any).monster).not.toBeNull();
    step(game, 8);
    expect(cb.onGameOver).toHaveBeenCalledWith('eaten');
    expect(game.isOver).toBe(true);
  });

  it('takes two hits to bring it down', () => {
    const { game, cb } = makeGame(10);
    game.setLevel(FINAL_LEVEL);
    step(game, 9); // spawned and on its way
    const m = (game as any).monster;
    expect(m).not.toBeNull();
    const aim = () => (game as any).monsterPos(m);
    game.shoot(aim().x, aim().y);
    expect((game as any).monster).not.toBeNull();
    step(game, 1); // reload
    game.shoot(aim().x, aim().y);
    expect((game as any).monster).toBeNull();
    step(game, 10);
    expect(cb.onGameOver).not.toHaveBeenCalled();
  });
});

describe('widget on the final level', () => {
  it('offers "try again", which resets everything', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const onChange = vi.fn();
    const onGameOver = vi.fn();
    const widget = new ReedHunt(host, { format: reedHuntFormats.pin, value: '12', onChange, onGameOver, locale: 'uk' });
    (widget as any).newGame(FINAL_LEVEL);
    const game = (widget as any).game as ReedHuntGame;
    step(game, 16);

    expect(onGameOver).toHaveBeenCalledWith('eaten');
    const btn = host.querySelector<HTMLButtonElement>('.rh-refill')!;
    expect(host.querySelector<HTMLElement>('.rh-overlay')!.hidden).toBe(false);
    expect(btn.textContent).toBe(reedHuntLocales.uk.retry);
    expect(host.querySelector('.rh-overlay')!.textContent).toContain(reedHuntLocales.uk.eaten);

    btn.click();
    expect(host.querySelector<HTMLElement>('.rh-overlay')!.hidden).toBe(true);
    expect(onChange).toHaveBeenLastCalledWith('');
    expect((widget as any).level).toBe(0);
    expect(game.ammoLeft).toBe(5);
    widget.destroy();
    host.remove();
  });
});

describe('locales', () => {
  it('has every text in every language', () => {
    const keys = Object.keys(reedHuntLocales.en).sort();
    for (const texts of Object.values(reedHuntLocales)) expect(Object.keys(texts).sort()).toEqual(keys);
  });

  it('switches language, with overrides on top', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const widget = new ReedHunt(host, { locale: 'es' });
    expect(host.querySelector('.rh-hint')!.textContent).toContain('Dispara a los dígitos');
    widget.update({ locale: 'uk', texts: { hint: 'custom' } });
    expect(host.querySelector('.rh-hint')!.textContent).toContain('custom');
    expect(host.querySelector('.rh-ammo')!.textContent).toContain('набоїв');
    widget.destroy();
    host.remove();
  });
});
