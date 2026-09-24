<script setup lang="ts">
import { Lock } from '@lucide/vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
</script>

<template>
  <button
    type="button"
    class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
    @click="auth.lock()"
  >
    <Lock class="size-4 shrink-0" aria-hidden="true" />
    Lock
  </button>
</template>
