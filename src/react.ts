import { createElement, forwardRef, useEffect, useImperativeHandle, useRef, type CSSProperties } from 'react';
import { ReedHunt, type GameOverReason, type ReedHuntData, type ReedHuntOptions } from './ReedHunt';

export { reedHuntFormats } from './formats';
export type { ReedHuntFormat } from './formats';
export type {
  ReedHuntTexts,
  ReedHuntTheme,
  ReedHuntLocale,
  GameOverReason,
  ReedHuntClassNames,
  ReedHuntPart,
} from './ReedHunt';
export { reedHuntLocales } from './locales';

export interface ReedHuntInputProps extends ReedHuntData {
  onValueChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  onCurrencyChange?: (currency: string) => void;
  onGameOver?: (reason: GameOverReason) => void;
  onRefill?: () => boolean | Promise<boolean>;
  injectStyles?: boolean;
  /** Goes on the wrapper element; use `classNames.root` for the widget itself */
  className?: string;
  /** On the wrapper; handy for --rh-* variables: style={{ '--rh-accent': 'hotpink' }} */
  style?: CSSProperties & Record<`--${string}`, string | number>;
}

export interface ReedHuntInputHandle {
  focus: () => void;
  reset: () => void;
  readonly value: string;
}

const dataOf = (p: ReedHuntInputProps): ReedHuntData => ({
  value: p.value,
  format: p.format,
  currency: p.currency,
  currencies: p.currencies,
  ammo: p.ammo,
  ammoFactor: p.ammoFactor,
  locale: p.locale,
  texts: p.texts,
  label: p.label,
  name: p.name,
  id: p.id,
  disabled: p.disabled,
  speed: p.speed,
  allowTyping: p.allowTyping,
  theme: p.theme,
  autocomplete: p.autocomplete,
  classNames: p.classNames,
  unstyled: p.unstyled,
});

/**
 * React wrapper around the ReedHunt widget.
 *
 *   const [card, setCard] = useState('');
 *   <ReedHuntInput format={reedHuntFormats.card} value={card} onValueChange={setCard} />
 */
export const ReedHuntInput = forwardRef<ReedHuntInputHandle, ReedHuntInputProps>(function ReedHuntInput(props, ref) {
  const hostRef = useRef<HTMLDivElement>(null);
  const widget = useRef<ReedHunt | null>(null);
  // Callbacks are read through a ref so a new arrow function each render costs nothing
  const latest = useRef(props);
  latest.current = props;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const options: ReedHuntOptions = {
      ...dataOf(latest.current),
      injectStyles: latest.current.injectStyles,
      onChange: (v) => latest.current.onValueChange?.(v),
      onComplete: (v) => latest.current.onComplete?.(v),
      onCurrencyChange: latest.current.onCurrencyChange
        ? (c) => latest.current.onCurrencyChange?.(c)
        : undefined,
      onGameOver: (reason) => latest.current.onGameOver?.(reason),
      onRefill: latest.current.onRefill ? () => latest.current.onRefill!() : undefined,
    };
    widget.current = new ReedHunt(host, options);
    return () => {
      widget.current?.destroy();
      widget.current = null;
    };
  }, []);

  useEffect(() => {
    widget.current?.update(dataOf(props));
  });

  useImperativeHandle(
    ref,
    () => ({
      focus: () => widget.current?.focus(),
      reset: () => widget.current?.reset(),
      get value() {
        return widget.current?.currentValue ?? '';
      },
    }),
    [],
  );

  return createElement('div', { ref: hostRef, className: props.className, style: props.style });
});

export default ReedHuntInput;
