<script setup lang="ts">
import { computed } from 'vue'
import { Ban, CornerLeftUp } from '@lucide/vue'
import ToolPage from '@/components/ui/ToolPage.vue'
import TextField from '@/components/ui/TextField.vue'
import TextAreaField from '@/components/ui/TextAreaField.vue'
import ChipPicker from '@/components/ui/ChipPicker.vue'
import CountStepper from '@/components/ui/CountStepper.vue'
import ToggleSwitch from '@/components/ui/ToggleSwitch.vue'
import RunButton from '@/components/ui/RunButton.vue'
import CopyButton from '@/components/ui/CopyButton.vue'
import OutputPanel from '@/components/output/OutputPanel.vue'
import { useRunShortcut } from '@/composables/useRunShortcut'
import { useWordsStore } from '@/stores/words'
import { WORD_STYLES } from '@/tools/presets'
import { getTool } from '@/tools/registry'

const tool = getTool('words')
const store = useWordsStore()

function fitBadge(fit: number) {
  if (fit >= 80) {
    return {
      label: 'Great fit',
      class: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
    }
  }
  if (fit >= 55) {
    return {
      label: 'Good fit',
      class: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300',
    }
  }
  return {
    label: 'Loose fit',
    class: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  }
}

/** Split the in-context sentence around the suggestion so it can be highlighted. */
function highlight(sentence: string, word: string) {
  const index = sentence.toLowerCase().indexOf(word.toLowerCase())
  if (index === -1) return { before: sentence, match: '', after: '' }
  return {
    before: sentence.slice(0, index),
    match: sentence.slice(index, index + word.length),
    after: sentence.slice(index + word.length),
  }
}

// Words excluded since this result came back disappear straight away.
const cards = computed(
  () =>
    store.result?.suggestions
      .filter((suggestion) => !store.isExcluded(suggestion.word))
      .map((suggestion) => ({
        suggestion,
        badge: fitBadge(suggestion.fit),
        sentence: suggestion.in_context ? highlight(suggestion.in_context, suggestion.word) : null,
      })) ?? [],
)

const opposites = computed(
  () => store.result?.opposites.filter((opposite) => !store.isExcluded(opposite.word)) ?? [],
)

const allWords = computed(() => cards.value.map(({ suggestion }) => suggestion.word).join('\n'))

useRunShortcut(store.run)
</script>

<template>
  <ToolPage :tool="tool">
    <template #input>
      <TextAreaField
        v-model="store.context"
        label="Context (optional)"
        placeholder="The sentence or paragraph the word appears in, e.g. “Agents are used to fix problems.”"
        :max-length="5000"
        :rows="4"
      />
      <div class="flex flex-col gap-2">
        <TextField
          v-model="store.word"
          label="Word or phrase"
          placeholder="e.g. Agents"
          :max-length="100"
        />
        <p v-if="store.wordMissingFromContext" class="text-xs text-amber-700 dark:text-amber-400">
          “{{ store.word.trim() }}” isn't in the context, so suggestions may fit less well.
        </p>
      </div>
      <ChipPicker v-model="store.style" label="Style" :options="WORD_STYLES" />
      <CountStepper v-model="store.count" label="How many" :min="3" :max="12" />
      <div class="flex flex-col gap-4">
        <ToggleSwitch
          v-model="store.singleWords"
          label="Single words only"
          description="Otherwise short phrases are allowed too."
        />
        <ToggleSwitch
          v-model="store.includeOpposites"
          label="Include opposites"
          description="Also suggest a few antonyms."
        />
      </div>
      <TextField
        v-model="store.exclude"
        label="Exclude"
        hint="optional, comma-separated"
        placeholder="e.g. workers, staff"
        :max-length="2000"
      />
      <RunButton
        label="Find words"
        :running="store.isRunning"
        :disabled="!store.canRun"
        @run="store.run"
      />
    </template>

    <template #output>
      <OutputPanel
        title="Suggestions"
        :status="store.status"
        :has-content="!!store.result"
        :error="store.error"
        :usage="store.usage"
        empty-text="Alternatives for your word will appear here."
        :class="store.isRunning && store.result && 'opacity-60'"
      >
        <template #actions>
          <CopyButton :text="allWords" label="Copy all" />
        </template>

        <div v-if="store.result" class="flex flex-col gap-6">
          <p v-if="!cards.length" class="text-sm text-slate-500">
            No alternatives left. Try a different style, allow phrases, or exclude fewer words.
          </p>

          <ul class="flex flex-col gap-3">
            <li
              v-for="{ suggestion, badge, sentence } in cards"
              :key="suggestion.word"
              class="rounded-xl border border-slate-200 p-4 dark:border-slate-800"
            >
              <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span class="text-lg font-semibold break-words">{{ suggestion.word }}</span>
                <span
                  class="rounded-full px-2 py-0.5 text-xs font-medium"
                  :class="badge.class"
                  :title="`Fit ${suggestion.fit}/100`"
                >
                  {{ badge.label }}
                </span>
                <div class="ml-auto flex items-center">
                  <CopyButton :text="suggestion.word" />
                  <button
                    type="button"
                    class="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium whitespace-nowrap text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                    title="Put this word (and sentence) into the inputs to explore from it"
                    @click="store.use(suggestion)"
                  >
                    <CornerLeftUp class="size-3.5" aria-hidden="true" />
                    Use
                  </button>
                  <button
                    type="button"
                    class="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium whitespace-nowrap text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                    title="Hide this word and never suggest it again"
                    @click="store.excludeWord(suggestion.word)"
                  >
                    <Ban class="size-3.5" aria-hidden="true" />
                    Exclude
                  </button>
                </div>
              </div>
              <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">{{ suggestion.note }}</p>
              <p
                v-if="sentence"
                class="mt-3 border-l-2 border-slate-200 pl-3 text-sm leading-relaxed break-words dark:border-slate-700"
              >
                {{ sentence.before
                }}<mark
                  v-if="sentence.match"
                  class="rounded bg-amber-100 px-0.5 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200"
                  >{{ sentence.match }}</mark
                >{{ sentence.after }}
              </p>
            </li>
          </ul>

          <section v-if="opposites.length">
            <h3 class="mb-2 text-sm font-semibold">Opposites</h3>
            <ul class="flex flex-wrap gap-2">
              <li
                v-for="opposite in opposites"
                :key="opposite.word"
                class="rounded-full bg-slate-100 px-3 py-1 text-sm dark:bg-slate-800"
                :title="opposite.note"
              >
                {{ opposite.word }}
              </li>
            </ul>
          </section>
        </div>
      </OutputPanel>
    </template>
  </ToolPage>
</template>
