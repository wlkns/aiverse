import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { compareLists, type ListOptions, type ListSeparator } from '@/lib/lists'

export const useListsStore = defineStore(
  'lists',
  () => {
    const listA = ref('')
    const listB = ref('')
    const separator = ref<ListSeparator>('lines')
    const ignoreCase = ref(true)
    const sort = ref(false)

    const options = computed<ListOptions>(() => ({
      separator: separator.value,
      ignoreCase: ignoreCase.value,
      sort: sort.value,
    }))

    // The lists as they were when Compare was pressed. Editing either one hides
    // the results until Compare is pressed again; the options still apply.
    const compared = ref<{ listA: string; listB: string } | null>(null)
    const result = computed(() =>
      compared.value && compared.value.listA === listA.value && compared.value.listB === listB.value
        ? compareLists(compared.value.listA, compared.value.listB, options.value)
        : null,
    )

    const canCompare = computed(() => !!(listA.value.trim() || listB.value.trim()))

    function compare() {
      if (!canCompare.value) return
      compared.value = { listA: listA.value, listB: listB.value }
    }

    function swap() {
      ;[listA.value, listB.value] = [listB.value, listA.value]
    }

    /** Received text fills "List A" if it's empty, otherwise "List B". */
    function receive(input: string) {
      if (listA.value.trim()) listB.value = input
      else listA.value = input
    }

    return {
      listA,
      listB,
      separator,
      ignoreCase,
      sort,
      compared,
      result,
      canCompare,
      compare,
      swap,
      receive,
    }
  },
  { persist: { pick: ['listA', 'listB', 'separator', 'ignoreCase', 'sort', 'compared'] } },
)
