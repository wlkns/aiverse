import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useStreamRunner } from '@/composables/useStreamRunner'
import type { SummariseRequest } from '@/api/types'
import type { SummaryFormat, SummaryLength } from '@/tools/presets'

export const useSummariseStore = defineStore(
  'summarise',
  () => {
    const text = ref('')
    const length = ref<SummaryLength>('medium')
    const format = ref<SummaryFormat>('paragraph')
    const focus = ref('')

    const runner = useStreamRunner<SummariseRequest>('/summarise')
    const canRun = computed(() => text.value.trim().length > 0 && !runner.isRunning.value)

    function run() {
      if (!canRun.value) return
      return runner.run({
        text: text.value,
        length: length.value,
        format: format.value,
        focus: focus.value.trim() || undefined,
      })
    }

    function receive(input: string) {
      runner.reset()
      text.value = input
    }

    return { text, length, format, focus, ...runner, canRun, run, receive }
  },
  { persist: { pick: ['text', 'length', 'format', 'focus'] } },
)
