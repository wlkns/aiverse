<script setup lang="ts">
import type { Component } from 'vue'
import { LoaderCircle, Sparkles, Square } from '@lucide/vue'

const {
  label = 'Generate',
  stoppable = false,
  icon = Sparkles,
  secondary = false,
  shortcut = true,
} = defineProps<{
  running: boolean
  disabled: boolean
  label?: string
  /** Show a Stop button while running (streaming tools). */
  stoppable?: boolean
  icon?: Component
  /** Outlined, for a second action beside the main one. */
  secondary?: boolean
  /** Show the ⌘/Ctrl + Enter hint. */
  shortcut?: boolean
}>()

defineEmits<{ run: []; stop: [] }>()

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent)
</script>

<template>
  <div class="flex items-center gap-3">
    <button
      v-if="running && stoppable"
      type="button"
      class="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      @click="$emit('stop')"
    >
      <Square class="size-3.5 fill-current" aria-hidden="true" />
      Stop
    </button>
    <button
      v-else
      :type="secondary ? 'button' : 'submit'"
      class="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      :class="
        secondary
          ? 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:hover:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:disabled:hover:bg-slate-900'
          : 'bg-indigo-600 text-white hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400'
      "
      :disabled="disabled || running"
      @click="$emit('run')"
    >
      <LoaderCircle v-if="running" class="size-4 animate-spin" aria-hidden="true" />
      <component :is="icon" v-else class="size-4" aria-hidden="true" />
      {{ running ? 'Working…' : label }}
    </button>
    <span v-if="shortcut" class="hidden text-xs text-slate-400 sm:inline">
      <kbd class="font-sans">{{ isMac ? '⌘' : 'Ctrl' }}</kbd> + <kbd class="font-sans">Enter</kbd>
    </span>
  </div>
</template>
