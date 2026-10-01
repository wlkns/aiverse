import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { RequestOptions } from '@/api/types'
import { isPersistenceEnabled, setPersistence } from '@/persistence'
import { DEFAULT_MODEL_TIER, type ModelTier } from '@/tools/presets'

export const useSettingsStore = defineStore(
  'settings',
  () => {
    const tier = ref<ModelTier>(DEFAULT_MODEL_TIER)
    /** Save tool inputs in this browser. */
    const remember = ref(isPersistenceEnabled())

    const requestOptions = computed<RequestOptions>(() => ({ tier: tier.value }))

    function setRemember(value: boolean) {
      remember.value = value
      setPersistence(value)
    }

    function reset() {
      tier.value = DEFAULT_MODEL_TIER
    }

    return { tier, remember, requestOptions, setRemember, reset }
  },
  // `remember` is stored separately (see persistence.ts) so it survives a wipe.
  { persist: { pick: ['tier'] } },
)
