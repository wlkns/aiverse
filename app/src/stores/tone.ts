import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useJsonRunner } from '@/composables/useJsonRunner'
import type { ToneRequest, ToneResult } from '@/api/types'

export const useToneStore = defineStore(
  'tone',
  () => {
    const text = ref('')
    const audience = ref('')

    const runner = useJsonRunner<ToneRequest, ToneResult>('/tone')
    const canRun = computed(() => text.value.trim().length > 0 && !runner.isRunning.value)

    function run() {
      if (!canRun.value) return
      return runner.run({ text: text.value, audience: audience.value.trim() || undefined })
    }

    function receive(input: string) {
      runner.reset()
      text.value = input
    }

    return { text, audience, ...runner, canRun, run, receive }
  },
  { persist: { pick: ['text', 'audience'] } },
)
