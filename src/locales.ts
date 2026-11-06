export interface ReedHuntTexts {
  hint: string;
  gameOver: string;
  outOfAmmo: string;
  dontWorry: string;
  refill: string;
  refilling: string;
  /** Final level: the thing from the lake got you */
  eaten: string;
  retry: string;
  ammoLeft: (rounds: number) => string;
  currency: string;
}

export type ReedHuntLocale = 'en' | 'ru' | 'uk' | 'es';

export const reedHuntLocales: Record<ReedHuntLocale, ReedHuntTexts> = {
  en: {
    hint: 'Shoot the digits. The red cross erases the last one. Right click reloads.',
    gameOver: 'Game over',
    outOfAmmo: 'Your free ammo has run out.',
    dontWorry: "But don't worry: top up your ammo for just €1.",
    refill: 'Top up for €1',
    refilling: 'Processing…',
    eaten: 'Something came out of the lake and got you.',
    retry: 'Try again',
    ammoLeft: (n) => `${n} rounds left`,
    currency: 'Currency',
  },
  ru: {
    hint: 'Стреляй по цифрам. Красный крестик стирает последнюю. Правый клик — перезарядка.',
    gameOver: 'Game over',
    outOfAmmo: 'Бесплатные патроны закончились.',
    dontWorry: 'Но не переживайте: всего за 1 € можно пополнить запас патронов.',
    refill: 'Пополнить за 1 €',
    refilling: 'Проводим платёж…',
    eaten: 'Из озера вылезла какая-то мерзость и добралась до тебя.',
    retry: 'Попробовать ещё раз',
    ammoLeft: (n) => `патронов: ${n}`,
    currency: 'Валюта',
  },
  uk: {
    hint: 'Стріляй по цифрах. Червоний хрестик стирає останню. Правий клік — перезарядка.',
    gameOver: 'Game over',
    outOfAmmo: 'Безкоштовні набої скінчилися.',
    dontWorry: 'Але не хвилюйтеся: лише за 1 € можна поповнити запас набоїв.',
    refill: 'Поповнити за 1 €',
    refilling: 'Проводимо платіж…',
    eaten: 'З озера вилізла якась мерзота й дісталася до тебе.',
    retry: 'Спробувати ще раз',
    ammoLeft: (n) => `набоїв: ${n}`,
    currency: 'Валюта',
  },
  es: {
    hint: 'Dispara a los dígitos. La cruz roja borra el último. Clic derecho para recargar.',
    gameOver: 'Game over',
    outOfAmmo: 'Se te acabó la munición gratis.',
    dontWorry: 'Pero no te preocupes: recarga tu munición por solo 1 €.',
    refill: 'Recargar por 1 €',
    refilling: 'Procesando…',
    eaten: 'Algo salió del lago y te atrapó.',
    retry: 'Intentar de nuevo',
    ammoLeft: (n) => `cartuchos: ${n}`,
    currency: 'Moneda',
  },
};
