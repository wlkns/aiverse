import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useStreamRunner } from '@/composables/useStreamRunner'
import type { ExplainRequest } from '@/api/types'
import type { ExplainLevel } from '@/tools/presets'

export const useExplainStore = defineStore(
  'explain',
  () => {
    const text = ref('')
    const level = ref<ExplainLevel>('plain-adult')
    const analogy = ref(true)
    const glossary = ref(false)

    const runner = useStreamRunner<ExplainRequest>('/explain')
    const canRun = computed(() => text.value.trim().length > 0 && !runner.isRunning.value)

    function run() {
      if (!canRun.value) return
      return runner.run({
        text: text.value,
        level: level.value,
        analogy: analogy.value,
        glossary: glossary.value,
      })
    }

    function receive(input: string) {
      runner.reset()
      text.value = input
    }

    return { text, level, analogy, glossary, ...runner, canRun, run, receive }
  },
  { persist: { pick: ['text', 'level', 'analogy', 'glossary'] } },
)
