<script setup lang="ts">
import { CircleAlert } from '@lucide/vue'

defineProps<{ message: string }>()
</script>

<template>
  <div
    role="alert"
    class="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
  >
    <CircleAlert class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
    <p>{{ message }}</p>
  </div>
</template>
