import { createElement, forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { ReedHunt, type ReedHuntData, type ReedHuntOptions } from './ReedHunt';

export { reedHuntFormats } from './formats';
export type { ReedHuntFormat } from './formats';
export type { ReedHuntTexts, ReedHuntTheme } from './ReedHunt';

export interface ReedHuntInputProps extends ReedHuntData {
  onValueChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  onCurrencyChange?: (currency: string) => void;
  onGameOver?: () => void;
  onRefill?: () => boolean | Promise<boolean>;
  injectStyles?: boolean;
  className?: string;
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
  texts: p.texts,
  label: p.label,
  name: p.name,
  id: p.id,
  disabled: p.disabled,
  speed: p.speed,
  allowTyping: p.allowTyping,
  theme: p.theme,
  autocomplete: p.autocomplete,
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
      onGameOver: () => latest.current.onGameOver?.(),
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

  return createElement('div', { ref: hostRef, className: props.className });
});

export default ReedHuntInput;
