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
  <FormField :label="label" :hint="hint" as="fieldset">
    <div class="flex flex-wrap gap-2">
      <label
        v-for="option in options"
        :key="option.id"
        class="cursor-pointer rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300 has-checked:border-indigo-600 has-checked:bg-indigo-600 has-checked:text-white has-focus-visible:ring-2 has-focus-visible:ring-indigo-500 has-focus-visible:ring-offset-2 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600 dark:has-checked:border-indigo-500 dark:has-checked:bg-indigo-500"
      >
        <input v-model="model" type="radio" :value="option.id" class="sr-only" />
        {{ option.label }}
      </label>
    </div>
  </FormField>
</template>
