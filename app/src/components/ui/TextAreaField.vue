<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'
import { useTextareaAutosize } from '@vueuse/core'

const model = defineModel<string>({ required: true })
const {
  placeholder = '',
  maxLength = 50_000,
  rows = 8,
} = defineProps<{
  label: string
  placeholder?: string
  maxLength?: number
  rows?: number
  autofocus?: boolean
}>()

const textareaEl = useTemplateRef<HTMLTextAreaElement>('textarea')
useTextareaAutosize({ element: textareaEl, input: model })

const words = computed(() => model.value.trim().split(/\s+/).filter(Boolean).length)
const overLimit = computed(() => model.value.length > maxLength)

// Autosize measures content, so keep the requested number of rows as a floor
// (text-sm × leading-relaxed ≈ 1.42rem per line, plus py-3). The border is an
// inset ring rather than a CSS border so autosize's scrollHeight fits exactly.
const minHeight = computed(() => `${rows * 1.42 + 1.5}rem`)
</script>

<template>
  <label class="flex flex-col gap-2">
    <span class="flex items-baseline justify-between gap-2">
      <span class="text-sm font-medium text-slate-700 dark:text-slate-300">{{ label }}</span>
      <span class="text-xs text-slate-400 tabular-nums" :class="overLimit && '!text-red-600'">
        {{ words.toLocaleString() }} words · {{ model.length.toLocaleString() }}
        <template v-if="overLimit"> / {{ maxLength.toLocaleString() }}</template>
        chars
      </span>
    </span>
    <textarea
      ref="textarea"
      v-model="model"
      :rows="rows"
      :placeholder="placeholder"
      :autofocus="autofocus"
      :style="{ minHeight }"
      class="max-h-[60vh] w-full resize-none rounded-xl bg-slate-50 px-3.5 py-3 text-sm leading-relaxed ring-1 ring-slate-200 ring-inset placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-slate-950 dark:ring-slate-700 dark:focus:bg-slate-950 dark:focus:ring-indigo-500"
      :class="overLimit && '!ring-red-500'"
    />
    <span v-if="overLimit" class="text-xs text-red-600">
      Too long — the limit is {{ maxLength.toLocaleString() }} characters.
    </span>
  </label>
</template>
