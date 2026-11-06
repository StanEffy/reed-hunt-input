# reed-hunt-input

**The input field nobody asked for.** Digits fly up out of the reeds; you shoot them with a
double-barrelled shotgun and they land in the next slot. The red cross erases the last digit.
You get 20% more ammo than the field needs. Run out and it's game over, but for just €1 you can
top up (the marsh gets gloomier every time). On the last level ammo trickles back by itself, and
now and then something flies out of the far end of the lake, straight at you. Two hits stop it.
If it gets through, you start over from the very beginning.

Card numbers, phone numbers, PINs, one-time codes, money amounts with a currency sign, or any
digits. Plain JS, React and Vue. No dependencies, no image assets: everything is drawn on a
192×108 canvas.

**[Play with the demo →](https://staneffy.github.io/reed-hunt-input/)**

```bash
npm i reed-hunt-input
```

## React

```tsx
import { useState } from 'react';
import { ReedHuntInput, reedHuntFormats } from 'reed-hunt-input/react';

export function CardField() {
  const [card, setCard] = useState('');
  return (
    <ReedHuntInput
      label="Card number"
      format={reedHuntFormats.card}
      value={card}
      onValueChange={setCard}
      onComplete={(digits) => console.log('done', digits)}
    />
  );
}
```

## Vue 3

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { ReedHuntInput, reedHuntFormats } from 'reed-hunt-input/vue';

const amount = ref('');
const currency = ref('€');
</script>

<template>
  <ReedHuntInput v-model="amount" v-model:currency="currency" :format="reedHuntFormats.amount" />
</template>
```

## Plain JS (or any other framework)

```ts
import { createReedHunt, reedHuntFormats } from 'reed-hunt-input';

const hunt = createReedHunt(document.querySelector('#pin')!, {
  format: reedHuntFormats.pin,
  onChange: (digits) => console.log(digits),
});

hunt.update({ disabled: true });
hunt.destroy();
```

Styles are injected automatically on first mount. If your CSP forbids that, pass
`injectStyles: false` and put the exported `reedHuntCss` string into your own stylesheet.

## Formats

The value is always digits only (no spaces, no `+358`).

| Preset | Looks like |
| --- | --- |
| `reedHuntFormats.card` | `#### #### #### ####` |
| `reedHuntFormats.phoneFi` | `+358 ## ### ####` |
| `reedHuntFormats.code` | `######` |
| `reedHuntFormats.pin` | `####` |
| `reedHuntFormats.expiry` | `##/##` |
| `reedHuntFormats.amount` | `€ 1 500 000`, currency picker, up to 9 digits |
| `reedHuntFormats.free` | any digits, up to 12 |

Make your own: `{ kind: 'mask', mask: '+1 (###) ###-####' }` (`#` is a digit, a space starts a
new group, anything else is shown as is), `{ kind: 'amount', maxDigits: 6 }` or
`{ kind: 'free', maxDigits: 20 }`.

## Options

| Option (React prop / Vue prop) | Default | |
| --- | --- | --- |
| `value` / `v-model` | `''` | Digits |
| `format` | 6-digit code | See above |
| `currency`, `currencies` / `v-model:currency` | `'€'`, `['€','$','£','₽']` | Amount format only; `[]` hides the picker |
| `ammo` | | Rounds per game, overrides `ammoFactor` |
| `ammoFactor` | `1.2` | Rounds = digits × factor, rounded up (card: 20) |
| `onRefill` / `:refill` | says yes after 0.7 s | The "€1" button. Resolve `true` to start the next level. **No payment is made by the package** |
| `onComplete` / `@complete` | | Every slot of a mask is filled |
| `onGameOver` / `@game-over` | | Gets the reason: `'ammo'` (out of ammo, input not done) or `'eaten'` (final level) |
| `locale` | `'en'` | Built-in texts: `'en'`, `'fi'`, `'ru'`, `'uk'`, `'es'` (all in `reedHuntLocales`) |
| `texts` | | Overrides on top of the locale: `hint`, `gameOver`, `outOfAmmo`, `dontWorry`, `refill`, `refilling`, `eaten`, `retry`, `ammoLeft(n)`, `currency` |
| `theme` | `'auto'` | `'light'`, `'dark'` (the marsh turns to dusk) |
| `speed` | `1` | Flight speed multiplier |
| `allowTyping` | `true` | Click the field and type. Keep it on: it is what keyboard and screen reader users get |
| `label`, `name`, `id`, `disabled`, `autocomplete` | | The usual |

Colours are CSS custom properties on `.rh` (`--rh-ink`, `--rh-surface`, `--rh-accent`, …),
override them to match your design.

## How to play

- Move the mouse to aim, click to shoot. On a phone, tap.
- Two shells in the barrels; it reloads itself when both are spent. Right click reloads early.
- Hits count only on the digit plate itself. They wobble.
- Shells left in your pouch are shown as `x18` in the corner.
- Levels: the marsh, then rain, then a storm under a red moon, then fire. The fire is the last
  one: no more top-ups, one round comes back every 10 seconds, and something lives in the lake.

## Should I use this in production?

You should use it in a demo, a hackathon, an April 1st release or a checkout you secretly want
nobody to finish. It is accessible (the hidden field accepts typing and is read by screen
readers), pauses when off screen, and is SSR-safe (it only touches the DOM on mount).

MIT © StanEffy
