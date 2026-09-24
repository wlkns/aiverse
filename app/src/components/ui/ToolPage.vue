<script setup lang="ts">
import type { Tool } from '@/tools/registry'

defineProps<{ tool: Tool }>()
</script>

<template>
  <div>
    <header class="mb-6 flex items-start gap-4 lg:mb-8">
      <span
        class="grid size-11 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
      >
        <component :is="tool.icon" class="size-5" aria-hidden="true" />
      </span>
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">{{ tool.name }}</h1>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ tool.description }}</p>
      </div>
    </header>

    <div class="grid items-start gap-6 xl:grid-cols-2 [&>*]:min-w-0">
      <form
        class="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        @submit.prevent
      >
        <slot name="input" />
      </form>
      <slot name="output" />
    </div>
  </div>
</template>
