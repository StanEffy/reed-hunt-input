import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { ReedHunt, reedHuntFormats } from '../src';

// jsdom has no canvas: the widget must still work as a plain typed input
beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = (() => null) as typeof HTMLCanvasElement.prototype.getContext;
});

const type = (input: HTMLInputElement, text: string) => {
  input.value = text;
  input.dispatchEvent(new Event('input', { bubbles: true }));
};

let host: HTMLDivElement;
afterEach(() => host?.remove());

const mount = (opts: ConstructorParameters<typeof ReedHunt>[1]) => {
  host = document.createElement('div');
  document.body.appendChild(host);
  const widget = new ReedHunt(host, opts);
  const input = host.querySelector<HTMLInputElement>('.rh-input')!;
  return { widget, input };
};

describe('ReedHunt widget', () => {
  it('renders a slot per mask digit and keeps literals out of the value', () => {
    const onChange = vi.fn();
    const { input } = mount({ format: reedHuntFormats.phoneFi, onChange });
    expect(host.querySelectorAll('.rh-slot')).toHaveLength(9);
    expect(host.querySelector('.rh-literal')?.textContent).toBe('+358');

    type(input, '40 123x');
    expect(onChange).toHaveBeenLastCalledWith('40123');
    expect(input.value).toBe('40123');
  });

  it('fires onComplete once when the mask is full', () => {
    const onComplete = vi.fn();
    const { input } = mount({ format: reedHuntFormats.pin, onComplete });
    type(input, '1234');
    type(input, '12345');
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith('1234');
  });

  it('shows amounts grouped by thousands with the picked currency', () => {
    const onCurrencyChange = vi.fn();
    const { input } = mount({ format: reedHuntFormats.amount, onCurrencyChange });
    type(input, '1500000');
    const groups = [...host.querySelectorAll('.rh-thousands')].map((n) => n.textContent);
    expect(groups).toEqual(['1', '500', '000']);

    host.querySelector<HTMLButtonElement>('[data-currency="$"]')!.click();
    expect(onCurrencyChange).toHaveBeenCalledWith('$');
    expect(host.querySelector('.rh-sign')?.textContent).toBe('$');
  });

  it('reports 20% spare ammo and accepts updates', () => {
    const { widget } = mount({ format: reedHuntFormats.card, texts: { ammoLeft: (n) => `ammo ${n}` } });
    expect(host.querySelector('.rh-ammo')?.textContent).toContain('ammo 20');
    widget.update({ format: reedHuntFormats.pin, value: '98' });
    expect(host.querySelectorAll('.rh-slot')).toHaveLength(4);
    expect(widget.currentValue).toBe('98');
    expect(host.querySelector('.rh-ammo')?.textContent).toContain('ammo 5');
  });

  it('cleans up on destroy', () => {
    const { widget } = mount({});
    widget.destroy();
    expect(host.querySelector('.rh')).toBeNull();
  });
});

describe('hidden parts', () => {
  it('hides the currency picker outside the amount format', () => {
    const h = document.createElement('div');
    document.body.appendChild(h);
    new ReedHunt(h, { format: reedHuntFormats.card });
    expect(h.querySelector<HTMLElement>('.rh-currencies')!.hidden).toBe(true);
    expect(document.getElementById('reed-hunt-input-styles')!.textContent).toContain('.rh [hidden]');
    h.remove();
  });
});
