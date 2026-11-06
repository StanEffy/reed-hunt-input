import { createReedHunt, reedHuntFormats, type ReedHuntFormat, type ReedHuntLocale } from '../src';
import { mountReactDemo } from './react-demo';
import { mountVueDemo } from './vue-demo';

type Words = Record<ReedHuntLocale, string>;

const MODES: { key: string; tab: Words; label: Words; format: ReedHuntFormat }[] = [
  {
    key: 'card',
    format: reedHuntFormats.card,
    tab: { en: 'Card', fi: 'Kortti', ru: 'Карта', uk: 'Картка', es: 'Tarjeta' },
    label: { en: 'Card number', fi: 'Kortin numero', ru: 'Номер карты', uk: 'Номер картки', es: 'Número de tarjeta' },
  },
  {
    key: 'phone',
    format: reedHuntFormats.phoneFi,
    tab: { en: 'Phone', fi: 'Puhelin', ru: 'Телефон', uk: 'Телефон', es: 'Teléfono' },
    label: { en: 'Phone number', fi: 'Puhelinnumero', ru: 'Номер телефона', uk: 'Номер телефону', es: 'Número de teléfono' },
  },
  {
    key: 'code',
    format: reedHuntFormats.code,
    tab: { en: 'Code', fi: 'Koodi', ru: 'Код', uk: 'Код', es: 'Código' },
    label: { en: 'Verification code', fi: 'Vahvistuskoodi', ru: 'Код подтверждения', uk: 'Код підтвердження', es: 'Código de verificación' },
  },
  {
    key: 'amount',
    format: reedHuntFormats.amount,
    tab: { en: 'Amount', fi: 'Summa', ru: 'Сумма', uk: 'Сума', es: 'Importe' },
    label: { en: 'Amount', fi: 'Summa', ru: 'Сумма', uk: 'Сума', es: 'Importe' },
  },
  {
    key: 'free',
    format: reedHuntFormats.free,
    tab: { en: 'Free', fi: 'Vapaa', ru: 'Свободное', uk: 'Довільне', es: 'Libre' },
    label: { en: 'Any digits', fi: 'Mitkä tahansa numerot', ru: 'Любые цифры', uk: 'Будь-які цифри', es: 'Cualquier dígito' },
  },
];

const LANGS: ReedHuntLocale[] = ['en', 'fi', 'ru', 'uk', 'es'];
const browserLang = navigator.language.slice(0, 2) as ReedHuntLocale;
let lang: ReedHuntLocale = LANGS.includes(browserLang) ? browserLang : 'en';
let mode = MODES[0];

const readout = document.getElementById('readout')!;
const tabs = document.querySelector<HTMLDivElement>('.tabs')!;

const hunt = createReedHunt(document.getElementById('playground')!, {
  format: mode.format,
  label: mode.label[lang],
  locale: lang,
  onChange: (v) => (readout.textContent = JSON.stringify(v)),
  onComplete: (v) => (readout.textContent = `${JSON.stringify(v)} ✓`),
});

function renderTabs() {
  tabs.innerHTML = MODES.map(
    (m) => `<button type="button" role="tab" data-mode="${m.key}" aria-selected="${m === mode}">${m.tab[lang]}</button>`,
  ).join('');
}

tabs.addEventListener('click', (e) => {
  const key = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-mode]')?.dataset.mode;
  const next = MODES.find((m) => m.key === key);
  if (!next || next === mode) return;
  mode = next;
  hunt.update({ format: mode.format, label: mode.label[lang], value: '' });
  readout.textContent = '""';
  renderTabs();
});

function setLang(next: ReedHuntLocale) {
  lang = next;
  document.documentElement.lang = lang;
  document.querySelectorAll<HTMLButtonElement>('[data-lang]').forEach((b) => {
    b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
  });
  hunt.update({ label: mode.label[lang], locale: lang });
  renderTabs();
}

document.querySelectorAll<HTMLButtonElement>('[data-lang]').forEach((b) =>
  b.addEventListener('click', () => setLang(b.dataset.lang as ReedHuntLocale)),
);

setLang(lang);
createReedHunt(document.getElementById('styled-demo')!, {
  format: reedHuntFormats.pin,
  label: 'PIN, restyled',
  classNames: { root: 'soft' },
});
mountReactDemo(document.getElementById('react-demo')!);
mountVueDemo(document.getElementById('vue-demo')!);
if (import.meta.env.DEV) Object.assign(window, { hunt });
