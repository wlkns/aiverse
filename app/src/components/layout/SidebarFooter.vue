<script setup lang="ts">
import { LogOut, Settings } from '@lucide/vue'
import { useAuthStore } from '@/stores/auth'

defineEmits<{ navigate: [] }>()

const auth = useAuthStore()

const itemClass =
  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
</script>

<template>
  <div class="flex items-center gap-1 border-t border-slate-200 pt-4 dark:border-slate-800">
    <RouterLink
      to="/settings"
      :class="[itemClass, 'flex-1']"
      active-class="!bg-indigo-50 !text-indigo-700 dark:!bg-indigo-500/10 dark:!text-indigo-300"
      @click="$emit('navigate')"
    >
      <Settings class="size-4 shrink-0" aria-hidden="true" />
      Settings
    </RouterLink>
    <span class="h-5 w-px bg-slate-200 dark:bg-slate-800" aria-hidden="true" />
    <button
      type="button"
      :class="itemClass"
      aria-label="Log out"
      title="Log out"
      @click="auth.lock()"
    >
      <LogOut class="size-4 shrink-0" aria-hidden="true" />
    </button>
  </div>
</template>
