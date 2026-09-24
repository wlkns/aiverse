import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useJsonRunner } from '@/composables/useJsonRunner'
import type { RewriteRequest, RewriteResult } from '@/api/types'
import type { StyleId } from '@/tools/presets'

export const useRewriteStore = defineStore(
  'rewrite',
  () => {
    const text = ref('')
    const style = ref<StyleId | 'custom'>('professional')
    const customStyle = ref('')
    const variations = ref(3)

    const runner = useJsonRunner<RewriteRequest, RewriteResult>('/rewrite')
    const canRun = computed(
      () =>
        text.value.trim().length > 0 &&
        (style.value !== 'custom' || customStyle.value.trim().length > 0) &&
        !runner.isRunning.value,
    )

    function run() {
      if (!canRun.value) return
      return runner.run({
        text: text.value,
        style: style.value,
        custom_style: style.value === 'custom' ? customStyle.value.trim() : undefined,
        variations: variations.value,
      })
    }

    function receive(input: string) {
      runner.reset()
      text.value = input
    }

    return { text, style, customStyle, variations, ...runner, canRun, run, receive }
  },
  { persist: { pick: ['text', 'style', 'customStyle', 'variations'] } },
)
