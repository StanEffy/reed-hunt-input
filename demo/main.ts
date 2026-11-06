import { createReedHunt, reedHuntFormats, type ReedHuntFormat, type ReedHuntTexts } from '../src';
import { mountReactDemo } from './react-demo';
import { mountVueDemo } from './vue-demo';

type Lang = 'en' | 'ru';

const RU: Partial<ReedHuntTexts> = {
  hint: 'Стреляй по цифрам. Красный крестик стирает последнюю. Правый клик — перезарядка.',
  outOfAmmo: 'Бесплатные патроны закончились.',
  dontWorry: 'Но не переживайте: всего за 1 € можно пополнить запас патронов.',
  refill: 'Пополнить за 1 €',
  refilling: 'Проводим платёж…',
  ammoLeft: (n) => `патронов: ${n}`,
  currency: 'Валюта',
};

const MODES: { key: string; en: string; ru: string; format: ReedHuntFormat; label: Record<Lang, string> }[] = [
  { key: 'card', en: 'Card', ru: 'Карта', format: reedHuntFormats.card, label: { en: 'Card number', ru: 'Номер карты' } },
  { key: 'phone', en: 'Phone', ru: 'Телефон', format: reedHuntFormats.phoneFi, label: { en: 'Phone number', ru: 'Номер телефона' } },
  { key: 'code', en: 'Code', ru: 'Код', format: reedHuntFormats.code, label: { en: 'Verification code', ru: 'Код подтверждения' } },
  { key: 'amount', en: 'Amount', ru: 'Сумма', format: reedHuntFormats.amount, label: { en: 'Amount', ru: 'Сумма' } },
  { key: 'free', en: 'Free', ru: 'Свободное', format: reedHuntFormats.free, label: { en: 'Any digits', ru: 'Любые цифры' } },
];

let lang: Lang = navigator.language.startsWith('ru') ? 'ru' : 'en';
let mode = MODES[0];

const readout = document.getElementById('readout')!;
const tabs = document.querySelector<HTMLDivElement>('.tabs')!;

const hunt = createReedHunt(document.getElementById('playground')!, {
  format: mode.format,
  label: mode.label[lang],
  texts: lang === 'ru' ? RU : {},
  onChange: (v) => (readout.textContent = JSON.stringify(v)),
  onComplete: (v) => (readout.textContent = `${JSON.stringify(v)} ✓ complete`),
});

function renderTabs() {
  tabs.innerHTML = MODES.map(
    (m) => `<button type="button" role="tab" data-mode="${m.key}" aria-selected="${m === mode}">${m[lang]}</button>`,
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

function setLang(next: Lang) {
  lang = next;
  document.documentElement.lang = lang;
  document.querySelectorAll<HTMLButtonElement>('[data-lang]').forEach((b) => {
    b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
  });
  hunt.update({ label: mode.label[lang], texts: lang === 'ru' ? RU : {} });
  renderTabs();
}

document.querySelectorAll<HTMLButtonElement>('[data-lang]').forEach((b) =>
  b.addEventListener('click', () => setLang(b.dataset.lang as Lang)),
);

setLang(lang);
if (import.meta.env.DEV) Object.assign(window, { hunt });
mountReactDemo(document.getElementById('react-demo')!);
mountVueDemo(document.getElementById('vue-demo')!);
