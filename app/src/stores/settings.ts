import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { RequestOptions } from '@/api/types'
import { DEFAULT_MODEL_TIER, type ModelTier } from '@/tools/presets'

export const useSettingsStore = defineStore(
  'settings',
  () => {
    const tier = ref<ModelTier>(DEFAULT_MODEL_TIER)

    const requestOptions = computed<RequestOptions>(() => ({ tier: tier.value }))

    function reset() {
      tier.value = DEFAULT_MODEL_TIER
    }

    return { tier, requestOptions, reset }
  },
  { persist: { pick: ['tier'] } },
)
