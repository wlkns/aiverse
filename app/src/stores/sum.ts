import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { sumNumbers, type DecimalSeparator } from '@/lib/numbers'

export const useSumStore = defineStore(
  'sum',
  () => {
    const text = ref('')
    const separator = ref<DecimalSeparator>('point')

    // Cheap enough to keep up to date as you type.
    const result = computed(() => sumNumbers(text.value, separator.value))

    function receive(input: string) {
      text.value = input
    }

    return { text, separator, result, receive }
  },
  { persist: { pick: ['text', 'separator'] } },
)
