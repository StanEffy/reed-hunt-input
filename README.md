# reed-hunt-input

**The input field nobody asked for.** Digits fly up out of the reeds; you shoot them with a
double-barrelled shotgun and they land in the next slot. The red cross erases the last digit.
You get 20% more ammo than the field needs. Run out and it's game over, but for just €1 you can
top up (the marsh gets gloomier every time). On the last level ammo trickles back by itself, and
now and then something flies out of the far end of the lake, straight at you. Two hits stop it.
If it gets through, you start over from the very beginning.

Card numbers, phone numbers, PINs, one-time codes, money amounts with a currency sign, any
digits, or a CAPTCHA nobody will forget ([see below](#as-a-captcha)). Plain JS, React and Vue. No dependencies, no image assets: everything is drawn on a
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

Styles are injected automatically on first mount, see [Styling](#styling).

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
| `classNames`, `unstyled`, `style` | | See [Styling](#styling) |
| `label`, `name`, `id`, `disabled`, `autocomplete` | | The usual |

## Styling

The built-in styles live in the `reed-hunt` [cascade layer](https://developer.mozilla.org/docs/Web/CSS/@layer)
and are inserted at the very top of `<head>`. So **any CSS of yours wins**, whatever its
specificity, and no `!important` is needed. That includes Tailwind and other layered CSS.

### 1. CSS variables

The quickest way. Set them on `.rh`, on any parent, or through `style`:

```css
.checkout .rh {
  --rh-accent: #7c3aed;
  --rh-radius: 10px;
  --rh-stage-shadow: 0 10px 30px rgb(0 0 0 / 0.15);
  --rh-font-mono: 'JetBrains Mono', monospace;
}
```

```tsx
<ReedHuntInput style={{ '--rh-accent': '#7c3aed', '--rh-radius': '10px' }} />
```

| Variable | Default | |
| --- | --- | --- |
| `--rh-ink`, `--rh-ink-muted` | `#16181d`, `#5d636e` | Text, borders, muted text |
| `--rh-surface`, `--rh-rule` | `#fff`, `#c9ccd2` | Slot background, empty slot border |
| `--rh-accent`, `--rh-accent-soft`, `--rh-on-accent` | yellow | Caret, focus, picked currency, landing flash |
| `--rh-font`, `--rh-font-mono` | system | |
| `--rh-max-width`, `--rh-gap` | `576px`, `0.6rem` | |
| `--rh-radius`, `--rh-border-width` | `0px`, `2px` | Everything square and chunky by default |
| `--rh-stage-border`, `--rh-stage-radius`, `--rh-stage-shadow`, `--rh-stage-shadow-gloomy` | | The game window |
| `--rh-slot-width`, `--rh-slot-height`, `--rh-slot-font-size`, `--rh-slot-radius` | `2.6rem`, `3rem`, `1.6rem` | |
| `--rh-slot-compact-width`, `--rh-slot-compact-height`, `--rh-slot-compact-font-size` | | Masks with more than 8 digits (cards) |
| `--rh-slot-gap`, `--rh-group-gap` | `0.25rem`, `0.75rem` | Between slots, between groups |
| `--rh-display-height`, `--rh-display-font-size` | | Free and amount formats |
| `--rh-label-font-size`, `--rh-hint-font-size` | | |
| `--rh-overlay-bg`, `--rh-overlay-eaten-bg`, `--rh-overlay-ink`, `--rh-overlay-title`, `--rh-refill-bg`, `--rh-refill-ink` | | Game over screen |

Dark mode (`theme: 'dark'`, or `'auto'` with a dark system) adds `.rh--dark`; override the
colours there too: `.rh.rh--dark { --rh-surface: #000; }`.

### 2. Your own classes per part

`classNames` adds classes next to the built-in `rh-*` ones. Good for Tailwind and CSS modules:

```tsx
<ReedHuntInput
  format={reedHuntFormats.pin}
  classNames={{
    root: 'gap-3',
    stage: 'rounded-2xl shadow-xl border-0',
    slot: 'rounded-lg border-slate-300 data-[state=filled]:border-violet-600',
    hint: 'text-xs text-slate-500',
  }}
/>
```

Parts: `root`, `label`, `currencies`, `currency`, `stage`, `canvas`, `overlay`, `overlayTitle`,
`overlayText`, `refill`, `field`, `input`, `slots`, `group`, `slot`, `literal`, `display`,
`sign`, `digits`, `hint`, `ammo`.

In Vue, `class` and `style` on `<ReedHuntInput>` go to the wrapper element as usual, and the
`classNames` prop works the same way. In React, `className` and `style` go to the wrapper.

### 3. State you can style by

| Where | Attribute / class |
| --- | --- |
| root `.rh` | `data-format="mask \| free \| amount"`, `data-level="0…3"`, `data-over="false \| ammo \| eaten"`, `data-complete`, `data-theme`, `.rh--dark`, `.rh--disabled` |
| each slot `.rh-slot` | `data-state="empty \| next \| filled"`, `data-index`, `.rh-slot--landed` while it lands |
| game over `.rh-overlay` | `.rh-overlay--eaten` on the final level |

```css
.rh[data-complete='true'] .rh-slot { border-color: seagreen; }
.rh[data-level='3'] .rh-hint { color: crimson; }
```

### 4. Start from scratch

`unstyled` keeps only what makes it work (layout, the canvas, the hidden input, the overlay
position) and drops the look. Everything else is yours, through `classNames` or plain CSS on
the `rh-*` classes.

### 5. Strict CSP or your own bundling

Pass `injectStyles: false` and load the same CSS as a file:

```ts
import 'reed-hunt-input/style.css';
```

It's also exported as strings: `reedHuntCss`, `reedHuntBaseCss`, `reedHuntThemeCss`.

## How to play

- Move the mouse to aim, click to shoot. On a phone, tap.
- Two shells in the barrels; it reloads itself when both are spent. Right click reloads early.
- Hits count only on the digit plate itself. They wobble.
- Shells left in your pouch are shown as `x18` in the corner.
- Levels: the marsh, then rain, then a storm under a red moon, then fire. The fire is the last
  one: no more top-ups, one round comes back every 10 seconds, and something lives in the lake.

## As a CAPTCHA

"Shoot four digits to prove you're human" makes a memorable gate for low-stakes things: a
newsletter form, a comments box, a "yes, delete my account" confirmation, a hackathon demo.

```tsx
<ReedHuntInput
  label="Prove you're human"
  format={{ kind: 'mask', mask: '####' }}
  allowTyping={false}
  onComplete={() => setHuman(true)}
/>
```

Know what it is: a speed bump, not a lock. Everything happens in the browser, so a bot can
write into the hidden field or skip the widget altogether. For anything that matters, keep a real
check on the server (rate limits, a proper CAPTCHA) and use this on top of it. And
`allowTyping={false}` locks out people who use a keyboard or a screen reader, so offer them
another way through.

## Should I use this in production?

You should use it in a demo, a hackathon, an April 1st release or a checkout you secretly want
nobody to finish. It is accessible (the hidden field accepts typing and is read by screen
readers), pauses when off screen, and is SSR-safe (it only touches the DOM on mount).

MIT © StanEffy
