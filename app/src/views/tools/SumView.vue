<script setup lang="ts">
import { computed } from 'vue'
import ToolPage from '@/components/ui/ToolPage.vue'
import TextAreaField from '@/components/ui/TextAreaField.vue'
import ChipPicker from '@/components/ui/ChipPicker.vue'
import CopyButton from '@/components/ui/CopyButton.vue'
import OutputPanel from '@/components/output/OutputPanel.vue'
import { formatAmount } from '@/lib/numbers'
import { useSumStore } from '@/stores/sum'
import { DECIMAL_SEPARATORS } from '@/tools/presets'
import { getTool } from '@/tools/registry'

const tool = getTool('sum')
const store = useSumStore()

const result = computed(() => store.result)
const mixedCurrencies = computed(() => result.value.byCurrency.length > 1)

// Only show a currency on the total when every number shares it.
const currency = computed(() =>
  mixedCurrencies.value ? null : (result.value.byCurrency[0]?.currency ?? null),
)

function format(value: number, options: { decimals?: number; currency?: string | null } = {}) {
  return formatAmount(value, {
    separator: store.separator,
    decimals: options.decimals ?? result.value.decimals,
    currency: options.currency === undefined ? currency.value : options.currency,
  })
}

const total = computed(() => format(result.value.total))

const stats = computed(() => {
  const values = result.value.numbers.map((n) => n.value)
  if (!values.length) return []
  const average = values.reduce((sum, value) => sum + value, 0) / values.length
  return [
    { label: 'Numbers', value: values.length.toLocaleString() },
    { label: 'Average', value: format(average, { decimals: Math.max(2, result.value.decimals) }) },
    { label: 'Smallest', value: format(Math.min(...values)) },
    { label: 'Largest', value: format(Math.max(...values)) },
  ]
})
</script>

<template>
  <ToolPage :tool="tool">
    <template #input>
      <TextAreaField
        v-model="store.text"
        label="Text with numbers"
        placeholder="Paste anything — e.g. “Coffee £3.50, lunch £12, rent £1,200.00, refund -£20”"
        :rows="10"
      />
      <ChipPicker
        v-model="store.separator"
        label="Number format"
        hint="how thousands and decimals are written"
        :options="DECIMAL_SEPARATORS"
      />
    </template>

    <template #output>
      <OutputPanel
        title="Total"
        status="done"
        :has-content="result.numbers.length > 0"
        :empty-text="
          store.text.trim() ? 'No numbers found.' : 'Paste some text to add up its numbers.'
        "
      >
        <template #actions>
          <CopyButton :text="total" />
        </template>

        <p class="text-4xl font-semibold tracking-tight break-all tabular-nums">{{ total }}</p>

        <dl class="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/50"
          >
            <dt class="text-xs text-slate-500 dark:text-slate-400">{{ stat.label }}</dt>
            <dd class="text-sm font-medium break-all tabular-nums">{{ stat.value }}</dd>
          </div>
        </dl>

        <section v-if="mixedCurrencies" class="flex flex-col gap-2">
          <h3 class="text-sm font-medium text-slate-700 dark:text-slate-300">By currency</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            The total above adds every currency together as plain numbers.
          </p>
          <ul class="divide-y divide-slate-100 text-sm dark:divide-slate-800">
            <li
              v-for="entry in result.byCurrency"
              :key="entry.currency ?? ''"
              class="flex items-baseline justify-between gap-4 py-1.5"
            >
              <span class="text-slate-500 dark:text-slate-400">
                {{ entry.currency ?? 'No currency' }}
                <span class="text-xs text-slate-400">· {{ entry.count.toLocaleString() }}</span>
              </span>
              <span class="font-medium tabular-nums">
                {{ format(entry.total, { currency: entry.currency }) }}
              </span>
            </li>
          </ul>
        </section>

        <section class="flex flex-col gap-2">
          <h3 class="text-sm font-medium text-slate-700 dark:text-slate-300">Numbers found</h3>
          <ul class="flex flex-wrap gap-1.5">
            <li
              v-for="(n, i) in result.numbers"
              :key="i"
              class="rounded-md px-2 py-0.5 font-mono text-xs tabular-nums"
              :class="
                n.value < 0
                  ? 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              "
              :title="String(n.value)"
            >
              {{ n.text }}
            </li>
          </ul>
        </section>
      </OutputPanel>
    </template>
  </ToolPage>
</template>
