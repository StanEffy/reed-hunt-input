/**
 * What ReedHuntInput collects. The value is always digits only; the format decides
 * how many there can be and how they are shown.
 */
export type ReedHuntFormat =
  /** Fixed slots: `#` is a digit, anything else is shown as is (space = a gap between groups) */
  | { kind: 'mask'; mask: string }
  /** Any digits, up to maxDigits */
  | { kind: 'free'; maxDigits: number }
  /** Money: digits grouped by thousands, with a currency sign the user picks */
  | { kind: 'amount'; maxDigits: number };

export const reedHuntFormats = {
  code: { kind: 'mask', mask: '######' },
  pin: { kind: 'mask', mask: '####' },
  phoneFi: { kind: 'mask', mask: '+358 ## ### ####' },
  card: { kind: 'mask', mask: '#### #### #### ####' },
  expiry: { kind: 'mask', mask: '##/##' },
  free: { kind: 'free', maxDigits: 12 },
  amount: { kind: 'amount', maxDigits: 9 },
} satisfies Record<string, ReedHuntFormat>;

export type MaskToken = { type: 'slot'; index: number } | { type: 'gap' } | { type: 'literal'; text: string };

/** Splits a mask into groups (separated by spaces) of slots and literal text */
export function tokenizeMask(mask: string): MaskToken[][] {
  const groups: MaskToken[][] = [[]];
  let index = 0;
  for (const ch of mask) {
    const group = groups[groups.length - 1];
    if (ch === ' ') {
      if (group.length) groups.push([]);
    } else if (ch === '#') {
      group.push({ type: 'slot', index: index++ });
    } else {
      const prev = group[group.length - 1];
      if (prev?.type === 'literal') prev.text += ch;
      else group.push({ type: 'literal', text: ch });
    }
  }
  return groups.filter((g) => g.length);
}

/** How many digits the format holds */
export function digitCapacity(format: ReedHuntFormat): number {
  return format.kind === 'mask' ? [...format.mask].filter((c) => c === '#').length : format.maxDigits;
}

/** Keeps digits only, trims to the capacity; amounts lose leading zeros */
export function normalizeDigits(raw: string, format: ReedHuntFormat): string {
  let digits = raw.replace(/\D/g, '').slice(0, digitCapacity(format));
  if (format.kind === 'amount') digits = digits.replace(/^0+(?=\d)/, '');
  return digits;
}

/** "1500000" -> ["1", "500", "000"] */
export function groupThousands(digits: string): string[] {
  const groups: string[] = [];
  for (let end = digits.length; end > 0; end -= 3) groups.unshift(digits.slice(Math.max(0, end - 3), end));
  return groups;
}

/** Rounds of ammo for a format: `factor` more than the digits needed, rounded up */
export function ammoFor(format: ReedHuntFormat, factor: number): number {
  return Math.ceil(digitCapacity(format) * factor - 1e-9);
}
