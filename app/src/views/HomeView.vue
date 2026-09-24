<script setup lang="ts">
import { ArrowRight } from '@lucide/vue'
import SearchButton from '@/components/layout/SearchButton.vue'
import { CATEGORIES, toolsIn } from '@/tools/registry'
</script>

<template>
  <div>
    <header class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight sm:text-3xl">
          What would you like to do?
        </h1>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Pick a tool. Each has its own page, so you can bookmark the ones you use most.
        </p>
      </div>
      <SearchButton class="sm:w-64" />
    </header>

    <section v-for="category in CATEGORIES" :key="category.id" class="mb-10">
      <h2
        class="mb-3 text-xs font-semibold tracking-wider text-slate-400 uppercase dark:text-slate-500"
      >
        {{ category.label }}
      </h2>
      <ul class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <li v-for="tool in toolsIn(category.id)" :key="tool.id">
          <RouterLink
            :to="tool.path"
            class="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500/50"
          >
            <span
              class="mb-4 grid size-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
            >
              <component :is="tool.icon" class="size-5" aria-hidden="true" />
            </span>
            <span class="flex items-center gap-1 font-semibold">
              {{ tool.name }}
              <ArrowRight
                class="size-4 -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100"
                aria-hidden="true"
              />
            </span>
            <span class="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {{ tool.description }}
            </span>
          </RouterLink>
        </li>
      </ul>
    </section>
  </div>
</template>
