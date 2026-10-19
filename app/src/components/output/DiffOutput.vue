<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ChevronsUpDown } from '@lucide/vue'
import type { DiffResult, DiffRow, RowType, Segment } from '@/lib/diff'
import type { DiffView } from '@/tools/presets'

const { result, view, hideUnchanged } = defineProps<{
  result: DiffResult
  view: DiffView
  hideUnchanged: boolean
}>()

// Unchanged lines kept either side of a change when hiding the rest.
const CONTEXT = 3

type Item =
  { kind: 'row'; row: DiffRow; index: number } | { kind: 'gap'; start: number; count: number }

// Gaps the user has opened, by the index of their first hidden row.
const expanded = ref(new Set<number>())
watch(
  () => result,
  () => (expanded.value = new Set()),
)

const items = computed<Item[]>(() => {
  const { rows } = result
  const out: Item[] = []
  let i = 0
  while (i < rows.length) {
    if (rows[i]!.type !== 'equal' || !hideUnchanged) {
      out.push({ kind: 'row', row: rows[i]!, index: i })
      i++
      continue
    }
    let end = i
    while (end < rows.length && rows[end]!.type === 'equal') end++

    const keepBefore = i === 0 ? 0 : CONTEXT
    const keepAfter = end === rows.length ? 0 : CONTEXT
    const start = i + keepBefore
    const count = end - i - keepBefore - keepAfter

    for (let j = i; j < end; j++) {
      if (count > 1 && j === start && !expanded.value.has(start)) {
        out.push({ kind: 'gap', start, count })
        j += count - 1
      } else {
        out.push({ kind: 'row', row: rows[j]!, index: j })
      }
    }
    i = end
  }
  return out
})

function expand(start: number) {
  expanded.value = new Set(expanded.value).add(start)
}

const rowClass: Record<RowType, string> = {
  equal: '',
  removed: 'bg-red-50 dark:bg-red-500/10',
  added: 'bg-emerald-50 dark:bg-emerald-500/10',
  changed: 'bg-violet-50 dark:bg-violet-500/10',
}

const marker: Record<RowType, string> = { equal: '', removed: '−', added: '+', changed: '~' }

const markerClass: Record<RowType, string> = {
  equal: 'border-transparent',
  removed: 'border-red-500 text-red-600 dark:text-red-400',
  added: 'border-emerald-500 text-emerald-600 dark:text-emerald-400',
  changed: 'border-violet-500 text-violet-600 dark:text-violet-400',
}

function segmentClass(segment: Segment, row: DiffRow): string {
  // Whole-line additions/removals are already coloured by the row.
  if (segment.type === 'equal' || row.type !== 'changed') return ''
  return segment.type === 'removed'
    ? 'rounded-sm bg-red-200/80 text-red-950 dark:bg-red-500/35 dark:text-red-50' +
        (view === 'inline' ? ' line-through decoration-red-600/50' : '')
    : 'rounded-sm bg-emerald-200/80 text-emerald-950 dark:bg-emerald-500/35 dark:text-emerald-50'
}

const sideClass = (type: RowType, side: 'a' | 'b') =>
  type === 'changed' || type === (side === 'a' ? 'removed' : 'added') ? rowClass[type] : ''

const gutter =
  'w-px px-2 py-0.5 text-right align-top whitespace-nowrap text-slate-400 tabular-nums select-none dark:text-slate-500'
const cell = 'px-2 py-0.5 align-top break-words whitespace-pre-wrap'
</script>

<template>
  <div class="overflow-x-auto rounded-xl ring-1 ring-slate-200 dark:ring-slate-800">
    <table class="w-full border-collapse font-mono text-xs leading-relaxed">
      <tbody>
        <template
          v-for="item in items"
          :key="item.kind === 'gap' ? `gap-${item.start}` : item.index"
        >
          <tr v-if="item.kind === 'gap'">
            <td colspan="4" class="p-0">
              <button
                type="button"
                class="flex w-full items-center justify-center gap-1.5 bg-slate-50 py-1 font-sans text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                @click="expand(item.start)"
              >
                <ChevronsUpDown class="size-3.5" aria-hidden="true" />
                Show {{ item.count.toLocaleString() }} unchanged lines
              </button>
            </td>
          </tr>

          <tr v-else-if="view === 'inline'" :class="rowClass[item.row.type]">
            <td :class="gutter">{{ item.row.aLine }}</td>
            <td :class="gutter">{{ item.row.bLine }}</td>
            <td
              class="w-px border-l-2 px-1.5 py-0.5 text-center align-top select-none"
              :class="markerClass[item.row.type]"
            >
              {{ marker[item.row.type] }}
            </td>
            <td :class="cell">
              <span
                v-for="(segment, s) in item.row.inline"
                :key="s"
                :class="segmentClass(segment, item.row)"
                >{{ segment.text }}</span
              >&#8203;
            </td>
          </tr>

          <tr v-else>
            <td :class="[gutter, sideClass(item.row.type, 'a')]">{{ item.row.aLine }}</td>
            <td
              class="w-1/2 border-r border-slate-200 dark:border-slate-800"
              :class="[cell, sideClass(item.row.type, 'a')]"
            >
              <span
                v-for="(segment, s) in item.row.a ?? []"
                :key="s"
                :class="segmentClass(segment, item.row)"
                >{{ segment.text }}</span
              >&#8203;
            </td>
            <td :class="[gutter, sideClass(item.row.type, 'b')]">{{ item.row.bLine }}</td>
            <td class="w-1/2" :class="[cell, sideClass(item.row.type, 'b')]">
              <span
                v-for="(segment, s) in item.row.b ?? []"
                :key="s"
                :class="segmentClass(segment, item.row)"
                >{{ segment.text }}</span
              >&#8203;
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>
