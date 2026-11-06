import { beforeAll, describe, expect, it } from 'vitest';
import { ReedHunt, reedHuntFormats } from '../src';

beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = (() => null) as typeof HTMLCanvasElement.prototype.getContext;
});

// One document for the whole file: order matters, unstyled first
const mount = (opts: ConstructorParameters<typeof ReedHunt>[1]) => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  return { host, widget: new ReedHunt(host, opts) };
};

describe('styling', () => {
  it('unstyled keeps only the base CSS, ahead of the page styles', () => {
    const own = document.createElement('style');
    own.textContent = '.mine {}';
    document.head.appendChild(own);

    const { host } = mount({ unstyled: true });
    expect(host.querySelector('.rh')!.classList.contains('rh--themed')).toBe(false);
    expect(document.getElementById('reed-hunt-input-base')).not.toBeNull();
    expect(document.getElementById('reed-hunt-input-theme')).toBeNull();
    expect(document.head.firstElementChild!.id).toBe('reed-hunt-input-base');
  });

  it('the theme goes right after the base, inside a cascade layer', () => {
    const { host } = mount({});
    const base = document.getElementById('reed-hunt-input-base')!;
    const theme = document.getElementById('reed-hunt-input-theme')!;
    expect(base.nextElementSibling).toBe(theme);
    expect(theme.textContent).toMatch(/^\s*@layer reed-hunt \{/);
    expect(host.querySelector('.rh')!.classList.contains('rh--themed')).toBe(true);
  });

  it('adds classNames next to the built-in classes', () => {
    const { host, widget } = mount({
      format: reedHuntFormats.pin,
      classNames: { root: 'my-root', slot: 'my-slot', stage: 'rounded-xl', hint: 'text-sm' },
    });
    expect(host.querySelector('.rh.my-root')).not.toBeNull();
    expect(host.querySelectorAll('.rh-slot.my-slot')).toHaveLength(4);
    expect(host.querySelector('.rh-stage.rounded-xl')).not.toBeNull();
    expect(host.querySelector('.rh-hint.text-sm')).not.toBeNull();

    widget.update({ classNames: { slot: 'other' } });
    expect(host.querySelectorAll('.rh-slot.other')).toHaveLength(4);
    expect(host.querySelector('.my-root')).toBeNull();
  });

  it('exposes state as data attributes', () => {
    const { host, widget } = mount({ format: reedHuntFormats.pin, value: '12' });
    const root = host.querySelector<HTMLElement>('.rh')!;
    expect(root.dataset.format).toBe('mask');
    expect(root.dataset.level).toBe('0');
    expect(root.dataset.over).toBe('false');
    expect(root.dataset.complete).toBe('false');
    const states = [...host.querySelectorAll<HTMLElement>('.rh-slot')].map((s) => s.dataset.state);
    expect(states).toEqual(['filled', 'filled', 'next', 'empty']);

    widget.update({ value: '1234' });
    expect(root.dataset.complete).toBe('true');
  });

  it('escapes class names', () => {
    const { host } = mount({ format: reedHuntFormats.pin, classNames: { slot: '"><img src=x>' } });
    expect(host.querySelector('img')).toBeNull();
  });
});
