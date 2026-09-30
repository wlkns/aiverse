<script setup lang="ts">
const { cost } = defineProps<{ cost: 1 | 2 | 3 }>()

const LABELS = { 1: 'Low cost', 2: 'Medium cost', 3: 'High cost' } as const
</script>

<template>
  <span class="font-semibold tracking-wider tabular-nums" :title="LABELS[cost]">
    <span class="sr-only">{{ LABELS[cost] }}</span>
    <span
      v-for="i in 3"
      :key="i"
      aria-hidden="true"
      :class="
        i <= cost ? 'text-slate-700 dark:text-slate-200' : 'text-slate-300 dark:text-slate-700'
      "
      >£</span
    >
  </span>
</template>
