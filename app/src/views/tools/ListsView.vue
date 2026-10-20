<script setup lang="ts">
import { computed } from 'vue'
import { ArrowLeftRight, Blend } from '@lucide/vue'
import ToolPage from '@/components/ui/ToolPage.vue'
import TextAreaField from '@/components/ui/TextAreaField.vue'
import ChipPicker from '@/components/ui/ChipPicker.vue'
import ToggleSwitch from '@/components/ui/ToggleSwitch.vue'
import RunButton from '@/components/ui/RunButton.vue'
import CopyButton from '@/components/ui/CopyButton.vue'
import OutputPanel from '@/components/output/OutputPanel.vue'
import { useRunShortcut } from '@/composables/useRunShortcut'
import { useListsStore } from '@/stores/lists'
import type { ListStats } from '@/lib/lists'
import { LIST_SEPARATORS } from '@/tools/presets'
import { getTool } from '@/tools/registry'

const tool = getTool('lists')
const store = useListsStore()

useRunShortcut(store.compare)

const groups = computed(() => {
  const result = store.result
  if (!result) return []
  return [
    { id: 'a', title: 'Only in List A', items: result.onlyA, accent: 'border-red-500' },
    { id: 'both', title: 'In both lists', items: result.both, accent: 'border-violet-500' },
    { id: 'b', title: 'Only in List B', items: result.onlyB, accent: 'border-emerald-500' },
  ]
})

const emptyText = computed(() => {
  if (!store.canCompare) return 'Paste two lists, then press Compare.'
  if (store.compared) return 'A list has been edited. Press Compare to see the results.'
  return 'Press Compare to see what the lists share.'
})

function describe(stats: ListStats) {
  const items = `${stats.total.toLocaleString()} ${stats.total === 1 ? 'item' : 'items'}`
  const repeats = stats.total - stats.distinct
  return repeats ? `${items} (${repeats.toLocaleString()} repeated)` : items
}
</script>

<template>
  <ToolPage :tool="tool" stacked>
    <template #input>
      <div class="grid gap-5 lg:grid-cols-2 [&>*]:min-w-0">
        <TextAreaField
          v-model="store.listA"
          label="List A"
          placeholder="One item per line…"
          :rows="8"
        />
        <TextAreaField
          v-model="store.listB"
          label="List B"
          placeholder="One item per line…"
          :rows="8"
        />
      </div>

      <div class="flex flex-wrap items-start gap-x-10 gap-y-5">
        <ChipPicker
          v-model="store.separator"
          label="Items are separated by"
          :options="LIST_SEPARATORS"
        />
        <div class="flex min-w-60 flex-1 flex-col gap-3 sm:max-w-sm">
          <ToggleSwitch
            v-model="store.ignoreCase"
            label="Ignore case"
            description="“Apple” and “apple” count as the same item."
          />
          <ToggleSwitch v-model="store.sort" label="Sort A–Z" />
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-3">
        <RunButton
          label="Compare"
          :icon="Blend"
          :running="false"
          :disabled="!store.canCompare"
          @run="store.compare"
        />
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          :disabled="!store.listA && !store.listB"
          @click="store.swap"
        >
          <ArrowLeftRight class="size-3.5" aria-hidden="true" />
          Swap
        </button>
      </div>
    </template>

    <template #output>
      <OutputPanel
        v-if="!store.result"
        title="Results"
        status="idle"
        :has-content="false"
        :empty-text="emptyText"
      />
      <div v-else class="flex flex-col gap-4">
        <p class="text-sm text-slate-500 dark:text-slate-400">
          List A has {{ describe(store.result.a) }}; List B has {{ describe(store.result.b) }}.
        </p>
        <div class="grid items-start gap-6 lg:grid-cols-3 [&>*]:min-w-0">
          <OutputPanel
            v-for="group in groups"
            :key="group.id"
            :title="`${group.title} · ${group.items.length.toLocaleString()}`"
            status="done"
            :has-content="group.items.length > 0"
            empty-text="None."
          >
            <template #actions>
              <CopyButton :text="group.items.join('\n')" />
            </template>
            <ul class="flex flex-col gap-1">
              <li
                v-for="(item, i) in group.items"
                :key="i"
                class="border-l-2 bg-slate-50 px-3 py-1.5 text-sm break-words dark:bg-slate-800/50"
                :class="group.accent"
              >
                {{ item }}
              </li>
            </ul>
          </OutputPanel>
        </div>
      </div>
    </template>
  </ToolPage>
</template>
