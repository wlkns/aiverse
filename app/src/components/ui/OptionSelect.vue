<script setup lang="ts" generic="T extends string">
import type { Option } from '@/tools/presets'
import FormField from './FormField.vue'

const model = defineModel<T>({ required: true })
const { hint = undefined } = defineProps<{
  label: string
  hint?: string
  options: readonly Option<T>[]
}>()
</script>

<template>
  <!-- Few options: segmented control. Many: native select. -->
  <FormField v-if="options.length <= 4" :label="label" :hint="hint" as="fieldset">
    <div
      class="grid gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800"
      :style="{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }"
    >
      <label
        v-for="option in options"
        :key="option.id"
        class="cursor-pointer rounded-lg px-2 py-1.5 text-center text-sm font-medium text-slate-600 transition-colors has-checked:bg-white has-checked:text-slate-900 has-checked:shadow-sm has-focus-visible:ring-2 has-focus-visible:ring-indigo-500 dark:text-slate-400 dark:has-checked:bg-slate-950 dark:has-checked:text-white"
      >
        <input v-model="model" type="radio" :value="option.id" class="sr-only" />
        {{ option.label }}
      </label>
    </div>
  </FormField>
  <FormField v-else :label="label" :hint="hint">
    <select
      v-model="model"
      class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950"
    >
      <option v-for="option in options" :key="option.id" :value="option.id">
        {{ option.label }}
      </option>
    </select>
  </FormField>
</template>
