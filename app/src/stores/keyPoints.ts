import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useJsonRunner } from '@/composables/useJsonRunner'
import type { KeyPointsRequest, KeyPointsResult } from '@/api/types'
import type { KeyPointSource } from '@/tools/presets'

export const useKeyPointsStore = defineStore(
  'key-points',
  () => {
    const text = ref('')
    const sourceType = ref<KeyPointSource>('meeting-notes')

    const runner = useJsonRunner<KeyPointsRequest, KeyPointsResult>('/key-points')
    const canRun = computed(() => text.value.trim().length > 0 && !runner.isRunning.value)

    function run() {
      if (!canRun.value) return
      return runner.run({ text: text.value, source_type: sourceType.value })
    }

    function receive(input: string) {
      runner.reset()
      text.value = input
    }

    return { text, sourceType, ...runner, canRun, run, receive }
  },
  { persist: { pick: ['text', 'sourceType'] } },
)
