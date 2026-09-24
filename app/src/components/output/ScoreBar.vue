<script setup lang="ts">
const { low = undefined, high = undefined } = defineProps<{
  label: string
  value: number
  low?: string
  high?: string
}>()
</script>

<template>
  <div>
    <div class="mb-1.5 flex items-baseline justify-between text-sm">
      <span class="font-medium">{{ label }}</span>
      <span class="text-slate-500 tabular-nums dark:text-slate-400">{{ value }}</span>
    </div>
    <div
      class="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
      role="meter"
      :aria-label="label"
      :aria-valuenow="value"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <div
        class="h-full rounded-full bg-indigo-500 transition-[width] duration-500"
        :style="{ width: `${value}%` }"
      />
    </div>
    <div
      v-if="low || high"
      class="mt-1 flex justify-between text-[11px] text-slate-400 dark:text-slate-500"
    >
      <span>{{ low }}</span>
      <span>{{ high }}</span>
    </div>
  </div>
</template>
