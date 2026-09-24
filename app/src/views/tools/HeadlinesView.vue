<script setup lang="ts">
import { computed } from 'vue'
import ToolPage from '@/components/ui/ToolPage.vue'
import TextAreaField from '@/components/ui/TextAreaField.vue'
import TextField from '@/components/ui/TextField.vue'
import FormField from '@/components/ui/FormField.vue'
import OptionSelect from '@/components/ui/OptionSelect.vue'
import CountStepper from '@/components/ui/CountStepper.vue'
import RunButton from '@/components/ui/RunButton.vue'
import CopyButton from '@/components/ui/CopyButton.vue'
import OutputPanel from '@/components/output/OutputPanel.vue'
import { useRunShortcut } from '@/composables/useRunShortcut'
import { useHeadlinesStore } from '@/stores/headlines'
import { HEADLINE_KINDS } from '@/tools/presets'
import { getTool } from '@/tools/registry'

const tool = getTool('headlines')
const store = useHeadlinesStore()

// Empty input means "use the default limit for this kind".
const maxCharsInput = computed({
  get: () => store.maxChars ?? '',
  set: (value: string | number) => {
    const parsed = Number(value)
    store.maxChars = value === '' || !Number.isFinite(parsed) ? null : Math.round(parsed)
  },
})

const allText = computed(() => store.result?.items.map((item) => item.text).join('\n') ?? '')

useRunShortcut(store.run)
</script>

<template>
  <ToolPage :tool="tool">
    <template #input>
      <TextAreaField
        v-model="store.text"
        label="Content"
        placeholder="Paste your article or page copy, or describe the topic…"
        :max-length="20000"
        :rows="8"
      />
      <OptionSelect v-model="store.kind" label="Generate" :options="HEADLINE_KINDS" />
      <div class="grid gap-5 sm:grid-cols-2">
        <CountStepper v-model="store.count" label="How many" :min="1" :max="10" />
        <FormField label="Character limit" :hint="`default ${store.defaultMaxChars}`">
          <input
            v-model="maxCharsInput"
            type="number"
            min="10"
            max="500"
            inputmode="numeric"
            :placeholder="String(store.defaultMaxChars)"
            class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950"
          />
        </FormField>
      </div>
      <TextField
        v-model="store.keywords"
        label="Keywords"
        hint="optional"
        placeholder="e.g. remote working, productivity"
        :max-length="300"
      />
      <RunButton
        label="Generate"
        :running="store.isRunning"
        :disabled="!store.canRun"
        @run="store.run"
      />
    </template>

    <template #output>
      <OutputPanel
        title="Options"
        :status="store.status"
        :has-content="!!store.result"
        :error="store.error"
        :usage="store.usage"
        :class="store.isRunning && store.result && 'opacity-60'"
      >
        <template #actions>
          <CopyButton :text="allText" label="Copy all" />
        </template>

        <ol
          v-if="store.result"
          class="flex flex-col divide-y divide-slate-100 dark:divide-slate-800"
        >
          <li
            v-for="(item, index) in store.result.items"
            :key="index"
            class="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
          >
            <span class="mt-0.5 w-5 shrink-0 text-xs text-slate-400 tabular-nums">
              {{ index + 1 }}.
            </span>
            <p class="min-w-0 flex-1 text-sm leading-relaxed break-words">{{ item.text }}</p>
            <span
              class="mt-0.5 shrink-0 text-xs tabular-nums"
              :class="item.over_limit ? 'font-semibold text-red-600' : 'text-slate-400'"
              :title="item.over_limit ? 'Over the character limit' : undefined"
            >
              {{ item.chars }}/{{ store.result.max_chars }}
            </span>
            <CopyButton :text="item.text" label="" class="-my-1" />
          </li>
        </ol>
      </OutputPanel>
    </template>
  </ToolPage>
</template>
