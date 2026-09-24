<script setup lang="ts">
import FormField from './FormField.vue'

const model = defineModel<string>({ required: true })
const {
  hint = undefined,
  placeholder = '',
  maxLength = 500,
  type = 'text',
} = defineProps<{
  label: string
  hint?: string
  placeholder?: string
  maxLength?: number
  type?: 'text' | 'password'
}>()
</script>

<template>
  <FormField :label="label" :hint="hint">
    <input
      v-model="model"
      :type="type"
      :placeholder="placeholder"
      :maxlength="maxLength"
      class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:focus:bg-slate-950"
    />
  </FormField>
</template>
