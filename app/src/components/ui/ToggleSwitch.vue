<script setup lang="ts">
const model = defineModel<boolean>({ required: true })
const { description = undefined } = defineProps<{ label: string; description?: string }>()
</script>

<template>
  <label class="flex cursor-pointer items-start justify-between gap-4">
    <span>
      <span class="block text-sm font-medium text-slate-700 dark:text-slate-300">{{ label }}</span>
      <span v-if="description" class="block text-xs text-slate-500 dark:text-slate-400">
        {{ description }}
      </span>
    </span>
    <span class="relative mt-0.5 inline-flex shrink-0">
      <input v-model="model" type="checkbox" role="switch" class="peer sr-only" />
      <span
        class="h-6 w-11 rounded-full bg-slate-200 transition-colors peer-checked:bg-indigo-600 peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500 peer-focus-visible:ring-offset-2 dark:bg-slate-700 dark:peer-checked:bg-indigo-500"
      />
      <span
        class="absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5"
      />
    </span>
  </label>
</template>
