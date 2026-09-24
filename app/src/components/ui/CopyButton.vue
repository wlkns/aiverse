<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { Check, Copy } from '@lucide/vue'

const { label = 'Copy' } = defineProps<{ text: string; label?: string }>()

const { copy, copied, isSupported } = useClipboard({ legacy: true, copiedDuring: 1500 })
</script>

<template>
  <button
    v-if="isSupported"
    type="button"
    class="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium whitespace-nowrap text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
    :aria-label="label ? undefined : 'Copy'"
    @click="copy(text)"
  >
    <Check v-if="copied" class="size-3.5 text-emerald-600" aria-hidden="true" />
    <Copy v-else class="size-3.5" aria-hidden="true" />
    <span v-if="label || copied" aria-live="polite">{{ copied ? 'Copied' : label }}</span>
  </button>
</template>
