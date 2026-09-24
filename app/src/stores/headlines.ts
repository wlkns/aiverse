import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useJsonRunner } from '@/composables/useJsonRunner'
import type { HeadlinesRequest, HeadlinesResult } from '@/api/types'
import { HEADLINE_KINDS, type HeadlineKind } from '@/tools/presets'

export const useHeadlinesStore = defineStore(
  'headlines',
  () => {
    const text = ref('')
    const kind = ref<HeadlineKind>('headline')
    const count = ref(5)
    /** null means "use the default limit for this kind". */
    const maxChars = ref<number | null>(null)
    const keywords = ref('')

    const defaultMaxChars = computed(
      () => HEADLINE_KINDS.find((option) => option.id === kind.value)?.maxChars ?? 80,
    )

    const runner = useJsonRunner<HeadlinesRequest, HeadlinesResult>('/headlines')
    const canRun = computed(() => text.value.trim().length > 0 && !runner.isRunning.value)

    function run() {
      if (!canRun.value) return
      return runner.run({
        text: text.value,
        kind: kind.value,
        count: count.value,
        max_chars: maxChars.value ?? undefined,
        keywords: keywords.value.trim() || undefined,
      })
    }

    function receive(input: string) {
      runner.reset()
      text.value = input
    }

    return {
      text,
      kind,
      count,
      maxChars,
      keywords,
      defaultMaxChars,
      ...runner,
      canRun,
      run,
      receive,
    }
  },
  { persist: { pick: ['text', 'kind', 'count', 'maxChars', 'keywords'] } },
)
