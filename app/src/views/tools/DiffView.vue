<script setup lang="ts">
import { computed } from 'vue'
import { ArrowLeftRight, Diff, Sparkles } from '@lucide/vue'
import ToolPage from '@/components/ui/ToolPage.vue'
import TextAreaField from '@/components/ui/TextAreaField.vue'
import ChipPicker from '@/components/ui/ChipPicker.vue'
import ToggleSwitch from '@/components/ui/ToggleSwitch.vue'
import RunButton from '@/components/ui/RunButton.vue'
import CopyButton from '@/components/ui/CopyButton.vue'
import SendToMenu from '@/components/ui/SendToMenu.vue'
import OutputPanel from '@/components/output/OutputPanel.vue'
import DiffOutput from '@/components/output/DiffOutput.vue'
import MarkdownOutput from '@/components/output/MarkdownOutput.vue'
import { useRunShortcut } from '@/composables/useRunShortcut'
import { formatDiff } from '@/lib/diff'
import { useDiffStore } from '@/stores/diff'
import { DIFF_GRANULARITIES, DIFF_VIEWS } from '@/tools/presets'
import { getTool } from '@/tools/registry'

const tool = getTool('diff')
const store = useDiffStore()

useRunShortcut(store.compare)

const emptyText = computed(() => {
  if (!store.canCompare) return 'Paste two versions of a text, then press Compare.'
  if (store.compared) return 'The text has been edited. Press Compare to see the differences.'
  return 'Press Compare to see what changed.'
})

const ignoring = computed(() =>
  [store.ignoreCase && 'case', store.ignoreWhitespace && 'whitespace']
    .filter(Boolean)
    .join(' and '),
)

const explanationNotice = computed(
  () =>
    store.notice ??
    (store.isStale && !store.isRunning ? 'The text has changed since this was written.' : null),
)
</script>

<template>
  <ToolPage :tool="tool" stacked>
    <template #input>
      <div class="grid gap-5 lg:grid-cols-2 [&>*]:min-w-0">
        <TextAreaField
          v-model="store.original"
          label="Original"
          placeholder="Paste the original text…"
          :rows="8"
        />
        <TextAreaField
          v-model="store.changed"
          label="Changed"
          placeholder="Paste the changed version…"
          :rows="8"
        />
      </div>

      <div class="flex flex-wrap items-start gap-x-10 gap-y-5">
        <ChipPicker v-model="store.granularity" label="Highlight" :options="DIFF_GRANULARITIES" />
        <ChipPicker v-model="store.view" label="View" :options="DIFF_VIEWS" />
        <div class="flex min-w-60 flex-1 flex-col gap-3 sm:max-w-sm">
          <ToggleSwitch v-model="store.ignoreCase" label="Ignore case" />
          <ToggleSwitch
            v-model="store.ignoreWhitespace"
            label="Ignore whitespace"
            description="Extra spaces and indentation don't count."
          />
          <ToggleSwitch v-model="store.hideUnchanged" label="Hide unchanged lines" />
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-3">
          <RunButton
            label="Compare"
            :icon="Diff"
            :running="false"
            :disabled="!store.canCompare"
            @run="store.compare"
          />
          <RunButton
            label="Explain the changes"
            :icon="Sparkles"
            secondary
            stoppable
            :shortcut="false"
            :running="store.isRunning"
            :disabled="!store.canRun"
            @run="store.run"
            @stop="store.stop"
          />
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          :disabled="!store.original && !store.changed"
          @click="store.swap"
        >
          <ArrowLeftRight class="size-3.5" aria-hidden="true" />
          Swap
        </button>
      </div>
    </template>

    <template #output>
      <div class="flex flex-col gap-6">
        <OutputPanel
          title="Differences"
          status="done"
          :has-content="!!store.result"
          :empty-text="emptyText"
        >
          <template #actions>
            <CopyButton
              v-if="store.result && !store.result.identical"
              :text="formatDiff(store.result)"
              label="Copy diff"
            />
          </template>

          <template v-if="store.result">
            <p
              v-if="store.result.identical"
              class="m-auto py-8 text-center text-sm text-slate-500 dark:text-slate-400"
            >
              No differences: the texts match<template v-if="ignoring">
                (ignoring {{ ignoring }})</template
              >.
            </p>
            <template v-else>
              <ul class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
                <li class="text-slate-400 dark:text-slate-500">Lines</li>
                <li class="flex items-center gap-1.5">
                  <span class="size-2.5 rounded-sm bg-emerald-500" aria-hidden="true" />
                  {{ store.result.stats.added.toLocaleString() }} added
                </li>
                <li class="flex items-center gap-1.5">
                  <span class="size-2.5 rounded-sm bg-red-500" aria-hidden="true" />
                  {{ store.result.stats.removed.toLocaleString() }} removed
                </li>
                <li class="flex items-center gap-1.5">
                  <span class="size-2.5 rounded-sm bg-violet-500" aria-hidden="true" />
                  {{ store.result.stats.changed.toLocaleString() }} changed
                </li>
              </ul>
              <DiffOutput
                :result="store.result"
                :view="store.view"
                :hide-unchanged="store.hideUnchanged"
              />
            </template>
          </template>
        </OutputPanel>

        <OutputPanel
          v-if="store.status !== 'idle'"
          title="What changed"
          :status="store.status"
          :has-content="!!store.output"
          :error="store.error"
          :usage="store.usage"
          :notice="explanationNotice"
        >
          <template #actions>
            <CopyButton :text="store.output" />
            <SendToMenu :text="store.output" from="diff" />
          </template>
          <MarkdownOutput :source="store.output" :streaming="store.isRunning" />
        </OutputPanel>
      </div>
    </template>
  </ToolPage>
</template>
