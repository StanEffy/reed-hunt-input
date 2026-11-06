import { describe, expect, it } from 'vitest';
import { ammoFor, digitCapacity, groupThousands, normalizeDigits, reedHuntFormats, tokenizeMask } from '../src/formats';

describe('formats', () => {
  it('counts the digits a format holds', () => {
    expect(digitCapacity(reedHuntFormats.card)).toBe(16);
    expect(digitCapacity(reedHuntFormats.phoneFi)).toBe(9);
    expect(digitCapacity(reedHuntFormats.amount)).toBe(9);
  });

  it('gives 20% spare ammo, rounded up', () => {
    expect(ammoFor(reedHuntFormats.card, 1.2)).toBe(20);
    expect(ammoFor(reedHuntFormats.code, 1.2)).toBe(8);
    expect(ammoFor(reedHuntFormats.pin, 1.2)).toBe(5);
    expect(ammoFor({ kind: 'mask', mask: '#####' }, 1.2)).toBe(6);
  });

  it('keeps digits only and trims to capacity', () => {
    expect(normalizeDigits('12a3-4 5', reedHuntFormats.pin)).toBe('1234');
  });

  it('drops leading zeros in amounts only', () => {
    expect(normalizeDigits('001500', reedHuntFormats.amount)).toBe('1500');
    expect(normalizeDigits('0', reedHuntFormats.amount)).toBe('0');
    expect(normalizeDigits('0012', reedHuntFormats.code)).toBe('0012');
  });

  it('groups thousands from the right', () => {
    expect(groupThousands('1500000')).toEqual(['1', '500', '000']);
    expect(groupThousands('150')).toEqual(['150']);
    expect(groupThousands('')).toEqual([]);
  });

  it('splits masks into groups of slots and literals', () => {
    expect(tokenizeMask('+358 ## ###')).toEqual([
      [{ type: 'literal', text: '+358' }],
      [
        { type: 'slot', index: 0 },
        { type: 'slot', index: 1 },
      ],
      [
        { type: 'slot', index: 2 },
        { type: 'slot', index: 3 },
        { type: 'slot', index: 4 },
      ],
    ]);
  });
});
