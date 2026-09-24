<script setup lang="ts">
const { hint = undefined, as = 'label' } = defineProps<{
  label: string
  hint?: string
  /** Use "fieldset" for groups of buttons/radios. */
  as?: 'label' | 'fieldset'
}>()
</script>

<template>
  <label v-if="as === 'label'" class="flex flex-col gap-2">
    <span class="text-sm font-medium text-slate-700 dark:text-slate-300">
      {{ label }}
      <span v-if="hint" class="font-normal text-slate-400">· {{ hint }}</span>
    </span>
    <slot />
  </label>
  <fieldset v-else class="flex flex-col gap-2">
    <legend class="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
      {{ label }}
      <span v-if="hint" class="font-normal text-slate-400">· {{ hint }}</span>
    </legend>
    <slot />
  </fieldset>
</template>
