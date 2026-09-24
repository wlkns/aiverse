<script setup lang="ts">
import { Minus, Plus } from '@lucide/vue'
import FormField from './FormField.vue'

const model = defineModel<number>({ required: true })
const {
  hint = undefined,
  min,
  max,
} = defineProps<{
  label: string
  hint?: string
  min: number
  max: number
}>()

function step(by: number) {
  model.value = Math.min(max, Math.max(min, model.value + by))
}
</script>

<template>
  <FormField :label="label" :hint="hint" as="fieldset">
    <div
      class="inline-flex w-fit items-center rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950"
    >
      <button
        type="button"
        class="rounded-l-xl p-2.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 dark:hover:bg-slate-800 dark:hover:text-white"
        :disabled="model <= min"
        :aria-label="`Decrease ${label.toLowerCase()}`"
        @click="step(-1)"
      >
        <Minus class="size-4" aria-hidden="true" />
      </button>
      <output class="w-10 text-center text-sm font-semibold tabular-nums" aria-live="polite">
        {{ model }}
      </output>
      <button
        type="button"
        class="rounded-r-xl p-2.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 dark:hover:bg-slate-800 dark:hover:text-white"
        :disabled="model >= max"
        :aria-label="`Increase ${label.toLowerCase()}`"
        @click="step(1)"
      >
        <Plus class="size-4" aria-hidden="true" />
      </button>
    </div>
  </FormField>
</template>
