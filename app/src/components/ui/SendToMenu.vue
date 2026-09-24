<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'
import { onClickOutside, onKeyStroke } from '@vueuse/core'
import { ChevronDown, Send } from '@lucide/vue'
import { useSendTo } from '@/composables/useSendTo'
import { TOOLS, type ToolId } from '@/tools/registry'

const { from, label = 'Send to' } = defineProps<{ text: string; from: ToolId; label?: string }>()

const open = ref(false)
const rootEl = useTemplateRef<HTMLElement>('root')
const sendTo = useSendTo()
const targets = computed(() => TOOLS.filter((tool) => tool.id !== from))

onClickOutside(rootEl, () => (open.value = false))
onKeyStroke('Escape', () => (open.value = false))
</script>

<template>
  <div ref="root" class="relative">
    <button
      type="button"
      class="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium whitespace-nowrap text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
      aria-haspopup="menu"
      :aria-expanded="open"
      @click="open = !open"
    >
      <Send class="size-3.5" aria-hidden="true" />
      {{ label }}
      <ChevronDown class="size-3" aria-hidden="true" />
    </button>
    <div
      v-if="open"
      role="menu"
      class="absolute right-0 z-20 mt-1 w-52 rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-800 dark:bg-slate-900"
    >
      <button
        v-for="tool in targets"
        :key="tool.id"
        type="button"
        role="menuitem"
        class="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        @click="sendTo(tool.id, text)"
      >
        <component :is="tool.icon" class="size-4 text-slate-400" aria-hidden="true" />
        {{ tool.name }}
      </button>
    </div>
  </div>
</template>
