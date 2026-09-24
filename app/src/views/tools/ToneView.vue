<script setup lang="ts">
import ToolPage from '@/components/ui/ToolPage.vue'
import TextAreaField from '@/components/ui/TextAreaField.vue'
import TextField from '@/components/ui/TextField.vue'
import RunButton from '@/components/ui/RunButton.vue'
import SendToMenu from '@/components/ui/SendToMenu.vue'
import OutputPanel from '@/components/output/OutputPanel.vue'
import ScoreBar from '@/components/output/ScoreBar.vue'
import { useRunShortcut } from '@/composables/useRunShortcut'
import { useToneStore } from '@/stores/tone'
import { TONE_SCORE_KEYS, type ToneScoreKey } from '@/api/types'
import { getTool } from '@/tools/registry'

const tool = getTool('tone')
const store = useToneStore()

const SCORE_LABELS: Record<ToneScoreKey, { label: string; low: string; high: string }> = {
  formality: { label: 'Formality', low: 'Casual', high: 'Formal' },
  friendliness: { label: 'Friendliness', low: 'Cold', high: 'Warm' },
  confidence: { label: 'Confidence', low: 'Hesitant', high: 'Assertive' },
  clarity: { label: 'Clarity', low: 'Confusing', high: 'Clear' },
  positivity: { label: 'Positivity', low: 'Negative', high: 'Positive' },
}

useRunShortcut(store.run)
</script>

<template>
  <ToolPage :tool="tool">
    <template #input>
      <TextAreaField
        v-model="store.text"
        label="Text to analyse"
        placeholder="Paste an email, message or post before you send it…"
        :max-length="20000"
        :rows="10"
      />
      <TextField
        v-model="store.audience"
        label="Audience"
        hint="optional"
        placeholder="e.g. A client who is unhappy about a delay"
      />
      <RunButton
        label="Analyse tone"
        :running="store.isRunning"
        :disabled="!store.canRun"
        @run="store.run"
      />
    </template>

    <template #output>
      <OutputPanel
        title="Tone analysis"
        :status="store.status"
        :has-content="!!store.result"
        :error="store.error"
        :usage="store.usage"
        :class="store.isRunning && store.result && 'opacity-60'"
      >
        <template #actions>
          <SendToMenu :text="store.text" from="tone" label="Send text to" />
        </template>

        <div v-if="store.result" class="flex flex-col gap-6">
          <div>
            <p class="text-sm leading-relaxed">{{ store.result.summary }}</p>
            <div class="mt-3 flex flex-wrap items-center gap-2">
              <span
                v-for="tone in store.result.tones"
                :key="tone.label"
                class="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                :title="`Strength ${tone.strength}/100`"
              >
                {{ tone.label }}
              </span>
              <span class="text-xs text-slate-500 dark:text-slate-400">
                · {{ store.result.reading_level }}
              </span>
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <ScoreBar
              v-for="key in TONE_SCORE_KEYS"
              :key="key"
              :label="SCORE_LABELS[key].label"
              :low="SCORE_LABELS[key].low"
              :high="SCORE_LABELS[key].high"
              :value="store.result.scores[key]"
            />
          </div>

          <section v-if="store.result.issues.length">
            <h3 class="mb-3 text-sm font-semibold">Phrases to reconsider</h3>
            <ul class="flex flex-col gap-3">
              <li
                v-for="(issue, index) in store.result.issues"
                :key="index"
                class="rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-800"
              >
                <mark
                  class="rounded bg-amber-100 px-1 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200"
                >
                  “{{ issue.quote }}”
                </mark>
                <p class="mt-2 text-slate-600 dark:text-slate-400">{{ issue.issue }}</p>
                <p class="mt-1">
                  <span class="font-medium text-emerald-700 dark:text-emerald-400">Try:</span>
                  {{ issue.suggestion }}
                </p>
              </li>
            </ul>
          </section>

          <section v-if="store.result.suggestions.length">
            <h3 class="mb-2 text-sm font-semibold">Suggestions</h3>
            <ul class="list-disc space-y-1 pl-5 text-sm">
              <li v-for="(suggestion, index) in store.result.suggestions" :key="index">
                {{ suggestion }}
              </li>
            </ul>
          </section>
        </div>
      </OutputPanel>
    </template>
  </ToolPage>
</template>
