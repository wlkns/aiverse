<script setup lang="ts">
import { Search } from '@lucide/vue'
import { useUiStore } from '@/stores/ui'

const ui = useUiStore()
const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent)
</script>

<template>
  <button
    type="button"
    class="flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:text-slate-300"
    @click="ui.paletteOpen = true"
  >
    <Search class="size-4" aria-hidden="true" />
    <span class="flex-1 text-left">Find a tool…</span>
    <kbd class="hidden font-sans text-xs text-slate-400 sm:inline"
      >{{ isMac ? '⌘' : 'Ctrl ' }}K</kbd
    >
  </button>
</template>
