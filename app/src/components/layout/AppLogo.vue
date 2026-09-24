<script setup lang="ts">
import { Sparkles } from '@lucide/vue'
</script>

<template>
  <RouterLink to="/" class="flex items-center gap-2 rounded-lg font-semibold tracking-tight">
    <span class="grid size-8 place-items-center rounded-lg bg-indigo-600 text-white">
      <Sparkles class="size-4" aria-hidden="true" />
    </span>
    <span class="text-lg">AIverse</span>
  </RouterLink>
</template>
