import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useStreamRunner } from '@/composables/useStreamRunner'
import type { WriteRequest } from '@/api/types'
import type { StyleId, WriteContentType, WriteLength } from '@/tools/presets'

export const useWriteStore = defineStore(
  'write',
  () => {
    const prompt = ref('')
    const contentType = ref<WriteContentType>('general')
    const tone = ref<StyleId>('professional')
    const length = ref<WriteLength>('medium')

    const runner = useStreamRunner<WriteRequest>('/write')
    const canRun = computed(() => prompt.value.trim().length > 0 && !runner.isRunning.value)

    function run() {
      if (!canRun.value) return
      return runner.run({
        prompt: prompt.value,
        content_type: contentType.value,
        tone: tone.value,
        length: length.value,
      })
    }

    function receive(input: string) {
      runner.reset()
      prompt.value = input
    }

    return { prompt, contentType, tone, length, ...runner, canRun, run, receive }
  },
  { persist: { pick: ['prompt', 'contentType', 'tone', 'length'] } },
)
