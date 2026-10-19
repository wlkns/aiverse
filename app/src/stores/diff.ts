import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useStreamRunner } from '@/composables/useStreamRunner'
import { diffText, formatChanges, type DiffGranularity, type DiffOptions } from '@/lib/diff'
import type { DiffRequest } from '@/api/types'
import type { DiffView } from '@/tools/presets'

// Keeps the request well inside the API's limit on long, very different texts.
const MAX_CHANGES_LENGTH = 20_000

export const useDiffStore = defineStore(
  'diff',
  () => {
    const original = ref('')
    const changed = ref('')
    const granularity = ref<DiffGranularity>('words')
    const view = ref<DiffView>('inline')
    const ignoreCase = ref(false)
    const ignoreWhitespace = ref(false)
    const hideUnchanged = ref(true)

    const options = computed<DiffOptions>(() => ({
      granularity: granularity.value,
      ignoreCase: ignoreCase.value,
      ignoreWhitespace: ignoreWhitespace.value,
    }))

    // The diff itself runs in the browser; only the explanation uses the API.
    const runner = useStreamRunner<DiffRequest>('/diff')
    const explained = ref<{ original: string; changed: string } | null>(null)
    const isStale = computed(
      () =>
        !!explained.value &&
        (explained.value.original !== original.value || explained.value.changed !== changed.value),
    )

    const canRun = computed(
      () =>
        original.value.trim().length > 0 &&
        changed.value.trim().length > 0 &&
        original.value !== changed.value &&
        !runner.isRunning.value,
    )

    function run() {
      if (!canRun.value) return
      let changes = formatChanges(diffText(original.value, changed.value, options.value))
      if (changes.length > MAX_CHANGES_LENGTH) {
        changes = `${changes.slice(0, MAX_CHANGES_LENGTH)}\n…`
      }
      explained.value = { original: original.value, changed: changed.value }
      return runner.run({ original: original.value, changed: changed.value, changes })
    }

    function swap() {
      ;[original.value, changed.value] = [changed.value, original.value]
    }

    /** Received text fills "Original" if it's empty, otherwise "Changed". */
    function receive(input: string) {
      runner.reset()
      explained.value = null
      if (original.value.trim()) changed.value = input
      else original.value = input
    }

    return {
      original,
      changed,
      granularity,
      view,
      ignoreCase,
      ignoreWhitespace,
      hideUnchanged,
      options,
      ...runner,
      isStale,
      canRun,
      run,
      swap,
      receive,
    }
  },
  {
    persist: {
      pick: [
        'original',
        'changed',
        'granularity',
        'view',
        'ignoreCase',
        'ignoreWhitespace',
        'hideUnchanged',
      ],
    },
  },
)
