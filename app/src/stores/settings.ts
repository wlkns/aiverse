import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { ModelOptions } from '@/api/types'
import type { ReasoningEffort } from '@/tools/presets'

export const useSettingsStore = defineStore(
  'settings',
  () => {
    /** Empty means "use the server default". */
    const model = ref('')
    const reasoningEffort = ref<ReasoningEffort | ''>('')

    const modelOptions = computed<ModelOptions>(() => ({
      ...(model.value.trim() && { model: model.value.trim() }),
      ...(reasoningEffort.value && { reasoning_effort: reasoningEffort.value }),
    }))

    function reset() {
      model.value = ''
      reasoningEffort.value = ''
    }

    return { model, reasoningEffort, modelOptions, reset }
  },
  { persist: { pick: ['model', 'reasoningEffort'] } },
)
