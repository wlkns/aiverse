import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useJsonRunner } from '@/composables/useJsonRunner'
import type { WordSuggestion, WordsRequest, WordsResult } from '@/api/types'
import type { WordStyle } from '@/tools/presets'

export const useWordsStore = defineStore(
  'words',
  () => {
    const word = ref('')
    const context = ref('')
    const style = ref<WordStyle>('best-fit')
    const count = ref(6)
    const singleWords = ref(false)
    const includeOpposites = ref(false)
    /** Comma- or newline-separated words that must never be suggested. */
    const exclude = ref('')

    const excludeList = computed(() => {
      const words = exclude.value
        .split(/[,\n]/)
        .map((word) => word.trim())
        .filter(Boolean)
      // Case-insensitive de-dupe, keeping the first spelling.
      return words.filter(
        (word, i) => words.findIndex((w) => w.toLowerCase() === word.toLowerCase()) === i,
      )
    })

    const isExcluded = (word: string) =>
      excludeList.value.some((w) => w.toLowerCase() === word.trim().toLowerCase())

    /** Context was given but doesn't contain the word (case-insensitive). */
    const wordMissingFromContext = computed(() => {
      const w = word.value.trim().toLowerCase()
      const c = context.value.trim().toLowerCase()
      return w.length > 0 && c.length > 0 && !c.includes(w)
    })

    const runner = useJsonRunner<WordsRequest, WordsResult>('/words')
    const canRun = computed(() => word.value.trim().length > 0 && !runner.isRunning.value)

    function run() {
      if (!canRun.value) return
      return runner.run({
        word: word.value.trim(),
        context: context.value.trim() || undefined,
        style: style.value,
        count: count.value,
        single_words: singleWords.value,
        include_opposites: includeOpposites.value,
        exclude: excludeList.value.length ? excludeList.value : undefined,
      })
    }

    function receive(input: string) {
      runner.reset()
      context.value = input
    }

    /** Add a word to the exclusion list (for "not this one" on a result). */
    function excludeWord(word: string) {
      if (isExcluded(word)) return
      const current = exclude.value.trim().replace(/,\s*$/, '')
      exclude.value = current ? `${current}, ${word}` : word
    }

    /** Swap a suggestion in, so you can keep exploring from it. */
    function use(suggestion: WordSuggestion) {
      if (suggestion.in_context) context.value = suggestion.in_context
      word.value = suggestion.word
    }

    return {
      word,
      context,
      style,
      count,
      singleWords,
      includeOpposites,
      exclude,
      excludeList,
      isExcluded,
      wordMissingFromContext,
      ...runner,
      canRun,
      run,
      receive,
      use,
      excludeWord,
    }
  },
  {
    persist: {
      pick: ['word', 'context', 'style', 'count', 'singleWords', 'includeOpposites', 'exclude'],
    },
  },
)
