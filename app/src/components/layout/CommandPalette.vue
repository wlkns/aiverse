<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef, watch, type Component } from 'vue'
import { useRouter } from 'vue-router'
import { onKeyStroke, useScrollLock } from '@vueuse/core'
import { CornerDownLeft, House, Search, Settings } from '@lucide/vue'
import { useUiStore } from '@/stores/ui'
import { TOOLS } from '@/tools/registry'

interface Entry {
  id: string
  name: string
  description: string
  path: string
  icon: Component
  keywords: string[]
}

const ui = useUiStore()
const router = useRouter()
const query = ref('')
const activeIndex = ref(0)
const inputEl = useTemplateRef<HTMLInputElement>('input')
const scrollLock = useScrollLock(typeof document === 'undefined' ? null : document.body)

const entries: Entry[] = [
  ...TOOLS,
  {
    id: 'home',
    name: 'All tools',
    description: 'Browse every tool',
    path: '/',
    icon: House,
    keywords: ['home'],
  },
  {
    id: 'settings',
    name: 'Settings',
    description: 'Speed, quality and cost',
    path: '/settings',
    icon: Settings,
    keywords: ['speed', 'quality', 'cost', 'price', 'fast', 'lock', 'token'],
  },
]

const results = computed(() => {
  const terms = query.value.toLowerCase().split(/\s+/).filter(Boolean)
  if (!terms.length) return entries
  return entries.filter((entry) => {
    const haystack = [entry.name, entry.description, ...entry.keywords].join(' ').toLowerCase()
    return terms.every((term) => haystack.includes(term))
  })
})

watch(results, () => (activeIndex.value = 0))

watch(
  () => ui.paletteOpen,
  async (open) => {
    scrollLock.value = open
    if (open) {
      query.value = ''
      activeIndex.value = 0
      await nextTick()
      inputEl.value?.focus()
    }
  },
)

onKeyStroke('k', (event) => {
  if (!(event.metaKey || event.ctrlKey)) return
  event.preventDefault()
  ui.paletteOpen = !ui.paletteOpen
})

function close() {
  ui.paletteOpen = false
}

function select(entry: Entry | undefined) {
  if (!entry) return
  close()
  router.push(entry.path)
}

function onKeydown(event: KeyboardEvent) {
  const count = results.value.length
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    activeIndex.value = count ? (activeIndex.value + 1) % count : 0
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    activeIndex.value = count ? (activeIndex.value - 1 + count) % count : 0
  } else if (event.key === 'Enter') {
    event.preventDefault()
    select(results.value[activeIndex.value])
  } else if (event.key === 'Escape') {
    event.preventDefault()
    close()
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="ui.paletteOpen"
      class="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 px-4 pt-[12vh] backdrop-blur-sm"
      @click.self="close"
    >
      <div
        class="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        role="dialog"
        aria-modal="true"
        aria-label="Find a tool"
      >
        <div class="flex items-center gap-3 border-b border-slate-200 px-4 dark:border-slate-800">
          <Search class="size-4 shrink-0 text-slate-400" aria-hidden="true" />
          <input
            ref="input"
            v-model="query"
            type="text"
            class="w-full bg-transparent py-4 text-sm outline-none placeholder:text-slate-400"
            placeholder="Find a tool…"
            role="combobox"
            aria-controls="palette-results"
            :aria-activedescendant="
              results[activeIndex] ? `palette-${results[activeIndex].id}` : undefined
            "
            aria-expanded="true"
            @keydown="onKeydown"
          />
        </div>
        <ul id="palette-results" role="listbox" class="max-h-80 overflow-y-auto p-2">
          <li
            v-for="(entry, index) in results"
            :id="`palette-${entry.id}`"
            :key="entry.id"
            role="option"
            :aria-selected="index === activeIndex"
            class="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5"
            :class="index === activeIndex ? 'bg-indigo-50 dark:bg-indigo-500/10' : ''"
            @mousemove="activeIndex = index"
            @click="select(entry)"
          >
            <component
              :is="entry.icon"
              class="size-4 shrink-0"
              :class="
                index === activeIndex ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
              "
              aria-hidden="true"
            />
            <div class="min-w-0 flex-1">
              <div class="text-sm font-medium">{{ entry.name }}</div>
              <div class="truncate text-xs text-slate-500 dark:text-slate-400">
                {{ entry.description }}
              </div>
            </div>
            <CornerDownLeft
              v-if="index === activeIndex"
              class="size-3.5 text-slate-400"
              aria-hidden="true"
            />
          </li>
          <li v-if="!results.length" class="px-3 py-6 text-center text-sm text-slate-500">
            No tools match “{{ query }}”.
          </li>
        </ul>
      </div>
    </div>
  </Teleport>
</template>
