import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { verifyToken } from '@/api/client'

export const useAuthStore = defineStore(
  'auth',
  () => {
    const token = ref('')
    const isUnlocked = computed(() => token.value.length > 0)

    /** Checks the token against the API before storing it. */
    async function unlock(candidate: string) {
      const trimmed = candidate.trim()
      await verifyToken(trimmed)
      token.value = trimmed
    }

    function lock() {
      token.value = ''
    }

    return { token, isUnlocked, unlock, lock }
  },
  { persist: { pick: ['token'] } },
)
