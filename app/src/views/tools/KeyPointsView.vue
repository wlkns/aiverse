<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import ToolPage from '@/components/ui/ToolPage.vue'
import TextAreaField from '@/components/ui/TextAreaField.vue'
import ChipPicker from '@/components/ui/ChipPicker.vue'
import RunButton from '@/components/ui/RunButton.vue'
import CopyButton from '@/components/ui/CopyButton.vue'
import SendToMenu from '@/components/ui/SendToMenu.vue'
import OutputPanel from '@/components/output/OutputPanel.vue'
import { useRunShortcut } from '@/composables/useRunShortcut'
import { useKeyPointsStore } from '@/stores/keyPoints'
import type { ActionItem, KeyPointsResult } from '@/api/types'
import { KEY_POINT_SOURCES } from '@/tools/presets'
import { getTool } from '@/tools/registry'

const tool = getTool('key-points')
const store = useKeyPointsStore()

// Ticks are a scratch checklist for this result only.
const done = ref(new Set<number>())
watch(
  () => store.result,
  () => (done.value = new Set()),
)

function toggle(index: number) {
  const next = new Set(done.value)
  if (next.has(index)) next.delete(index)
  else next.add(index)
  done.value = next
}

const PRIORITY_CLASSES: Record<ActionItem['priority'], string> = {
  high: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300',
  medium: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
}

function toMarkdown(result: KeyPointsResult): string {
  const list = (items: string[]) => items.map((item) => `- ${item}`).join('\n')
  const sections = [`## Summary\n\n${result.summary}`]
  if (result.key_points.length) sections.push(`## Key points\n\n${list(result.key_points)}`)
  if (result.action_items.length) {
    const actions = result.action_items.map((item) => {
      const meta = [item.owner, item.due && `due ${item.due}`, `${item.priority} priority`]
        .filter(Boolean)
        .join(', ')
      return `- [ ] ${item.task} (${meta})`
    })
    sections.push(`## Action items\n\n${actions.join('\n')}`)
  }
  if (result.decisions.length) sections.push(`## Decisions\n\n${list(result.decisions)}`)
  if (result.open_questions.length) {
    sections.push(`## Open questions\n\n${list(result.open_questions)}`)
  }
  return sections.join('\n\n')
}

const markdown = computed(() => (store.result ? toMarkdown(store.result) : ''))

const lists = computed(() =>
  store.result
    ? [
        { title: 'Key points', items: store.result.key_points },
        { title: 'Decisions', items: store.result.decisions },
        { title: 'Open questions', items: store.result.open_questions },
      ].filter((section) => section.items.length)
    : [],
)

useRunShortcut(store.run)
</script>

<template>
  <ToolPage :tool="tool">
    <template #input>
      <TextAreaField
        v-model="store.text"
        label="Notes, email or transcript"
        placeholder="Paste meeting notes, an email thread or a transcript…"
        :rows="12"
      />
      <ChipPicker v-model="store.sourceType" label="This is a…" :options="KEY_POINT_SOURCES" />
      <RunButton
        label="Extract"
        :running="store.isRunning"
        :disabled="!store.canRun"
        @run="store.run"
      />
    </template>

    <template #output>
      <OutputPanel
        title="Key points"
        :status="store.status"
        :has-content="!!store.result"
        :error="store.error"
        :usage="store.usage"
        :class="store.isRunning && store.result && 'opacity-60'"
      >
        <template #actions>
          <CopyButton :text="markdown" label="Copy as Markdown" />
          <SendToMenu :text="markdown" from="key-points" />
        </template>

        <div v-if="store.result" class="flex flex-col gap-6">
          <p class="text-sm leading-relaxed">{{ store.result.summary }}</p>

          <section v-if="store.result.action_items.length">
            <h3 class="mb-3 text-sm font-semibold">Action items</h3>
            <ul class="flex flex-col gap-2">
              <li
                v-for="(item, index) in store.result.action_items"
                :key="index"
                class="rounded-xl border border-slate-200 p-3 dark:border-slate-800"
              >
                <label class="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    class="mt-0.5 size-4 rounded accent-indigo-600"
                    :checked="done.has(index)"
                    @change="toggle(index)"
                  />
                  <span class="flex-1">
                    <span
                      class="block text-sm"
                      :class="done.has(index) && 'text-slate-400 line-through'"
                    >
                      {{ item.task }}
                    </span>
                    <span class="mt-1.5 flex flex-wrap gap-1.5 text-xs">
                      <span
                        class="rounded-full px-2 py-0.5 font-medium capitalize"
                        :class="PRIORITY_CLASSES[item.priority]"
                      >
                        {{ item.priority }}
                      </span>
                      <span
                        v-if="item.owner"
                        class="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                      >
                        {{ item.owner }}
                      </span>
                      <span
                        v-if="item.due"
                        class="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                      >
                        Due {{ item.due }}
                      </span>
                    </span>
                  </span>
                </label>
              </li>
            </ul>
          </section>

          <section v-for="section in lists" :key="section.title">
            <h3 class="mb-2 text-sm font-semibold">{{ section.title }}</h3>
            <ul class="list-disc space-y-1 pl-5 text-sm">
              <li v-for="(item, index) in section.items" :key="index">{{ item }}</li>
            </ul>
          </section>
        </div>
      </OutputPanel>
    </template>
  </ToolPage>
</template>
