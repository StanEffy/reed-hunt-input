import { defineComponent, h, onBeforeUnmount, onMounted, ref, watch, type PropType } from 'vue';
import { ReedHunt, type ReedHuntData, type ReedHuntTexts, type ReedHuntTheme } from './ReedHunt';
import type { ReedHuntFormat } from './formats';

export { reedHuntFormats } from './formats';
export type { ReedHuntFormat } from './formats';
export type { ReedHuntTexts, ReedHuntTheme } from './ReedHunt';

/**
 * Vue 3 wrapper around the ReedHunt widget.
 *
 *   <ReedHuntInput v-model="card" :format="reedHuntFormats.card" @complete="pay" />
 *   <ReedHuntInput v-model="sum" v-model:currency="sign" :format="reedHuntFormats.amount" />
 */
export const ReedHuntInput = defineComponent({
  name: 'ReedHuntInput',
  props: {
    modelValue: { type: String, default: undefined },
    format: { type: Object as PropType<ReedHuntFormat>, default: undefined },
    currency: { type: String, default: undefined },
    currencies: { type: Array as PropType<string[]>, default: undefined },
    ammo: { type: Number, default: undefined },
    ammoFactor: { type: Number, default: undefined },
    texts: { type: Object as PropType<Partial<ReedHuntTexts>>, default: undefined },
    label: { type: String, default: undefined },
    name: { type: String, default: undefined },
    id: { type: String, default: undefined },
    disabled: { type: Boolean, default: false },
    speed: { type: Number, default: undefined },
    allowTyping: { type: Boolean, default: true },
    theme: { type: String as PropType<ReedHuntTheme>, default: undefined },
    autocomplete: { type: String, default: undefined },
    /** Return (or resolve) true to start the next level after the game over screen */
    refill: { type: Function as PropType<() => boolean | Promise<boolean>>, default: undefined },
    injectStyles: { type: Boolean, default: true },
  },
  emits: {
    'update:modelValue': (_value: string) => true,
    'update:currency': (_currency: string) => true,
    complete: (_value: string) => true,
    gameOver: () => true,
  },
  setup(props, { emit, expose }) {
    const host = ref<HTMLDivElement>();
    let widget: ReedHunt | null = null;

    const data = (): ReedHuntData => ({
      value: props.modelValue,
      format: props.format,
      currency: props.currency,
      currencies: props.currencies,
      ammo: props.ammo,
      ammoFactor: props.ammoFactor,
      texts: props.texts,
      label: props.label,
      name: props.name,
      id: props.id,
      disabled: props.disabled,
      speed: props.speed,
      allowTyping: props.allowTyping,
      theme: props.theme,
      autocomplete: props.autocomplete,
    });

    onMounted(() => {
      widget = new ReedHunt(host.value!, {
        ...data(),
        injectStyles: props.injectStyles,
        onChange: (v) => emit('update:modelValue', v),
        onComplete: (v) => emit('complete', v),
        onCurrencyChange: (c) => emit('update:currency', c),
        onGameOver: () => emit('gameOver'),
        onRefill: () => (props.refill ? props.refill() : new Promise((r) => setTimeout(() => r(true), 700))),
      });
    });

    watch(data, (next) => widget?.update(next), { deep: true });

    onBeforeUnmount(() => {
      widget?.destroy();
      widget = null;
    });

    expose({
      focus: () => widget?.focus(),
      reset: () => widget?.reset(),
    });

    return () => h('div', { ref: host });
  },
});

export default ReedHuntInput;
