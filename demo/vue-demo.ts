import { createApp, defineComponent, h, ref } from 'vue';
import { ReedHuntInput, reedHuntFormats } from '../src/vue';

const PinForm = defineComponent({
  setup() {
    const pin = ref('');
    const done = ref(false);
    return () =>
      h('div', [
        h(ReedHuntInput, {
          modelValue: pin.value,
          'onUpdate:modelValue': (v: string) => {
            pin.value = v;
            done.value = false;
          },
          onComplete: () => (done.value = true),
          format: reedHuntFormats.pin,
          label: 'PIN (Vue)',
        }),
        h('p', { class: 'readout' }, [
          'v-model: ',
          h('code', JSON.stringify(pin.value)),
          done.value ? ' ✓ unlocked' : '',
        ]),
      ]);
  },
});

export function mountVueDemo(el: HTMLElement) {
  createApp(PinForm).mount(el);
}
