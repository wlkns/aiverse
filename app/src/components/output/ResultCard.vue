<script setup lang="ts">
import CopyButton from '@/components/ui/CopyButton.vue'
import SendToMenu from '@/components/ui/SendToMenu.vue'
import type { ToolId } from '@/tools/registry'

const { heading = undefined, meta = undefined } = defineProps<{
  text: string
  from: ToolId
  heading?: string
  meta?: string
}>()
</script>

<template>
  <article class="rounded-xl border border-slate-200 dark:border-slate-800">
    <header
      class="flex items-center justify-between gap-2 border-b border-slate-100 py-1.5 pr-2 pl-4 dark:border-slate-800"
    >
      <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">
        {{ heading }}
        <span v-if="meta" class="font-normal text-slate-400"> · {{ meta }}</span>
      </span>
      <div class="flex items-center">
        <CopyButton :text="text" />
        <SendToMenu :text="text" :from="from" />
      </div>
    </header>
    <div class="px-4 py-3">
      <slot>
        <p class="text-sm leading-relaxed break-words whitespace-pre-wrap">{{ text }}</p>
      </slot>
    </div>
  </article>
</template>
