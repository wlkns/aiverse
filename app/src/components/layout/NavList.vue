<script setup lang="ts">
import { House } from '@lucide/vue'
import { CATEGORIES, toolsIn } from '@/tools/registry'

defineEmits<{ navigate: [] }>()

const linkClass =
  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
const activeClass = '!bg-indigo-50 !text-indigo-700 dark:!bg-indigo-500/10 dark:!text-indigo-300'
</script>

<template>
  <nav aria-label="Tools" class="flex flex-col gap-6">
    <RouterLink
      to="/"
      :class="linkClass"
      :exact-active-class="activeClass"
      @click="$emit('navigate')"
    >
      <House class="size-4 shrink-0" aria-hidden="true" />
      All tools
    </RouterLink>

    <div v-for="category in CATEGORIES" :key="category.id">
      <h2
        class="mb-2 px-3 text-xs font-semibold tracking-wider text-slate-400 uppercase dark:text-slate-500"
      >
        {{ category.label }}
      </h2>
      <ul class="flex flex-col gap-0.5">
        <li v-for="tool in toolsIn(category.id)" :key="tool.id">
          <RouterLink
            :to="tool.path"
            :class="linkClass"
            :active-class="activeClass"
            @click="$emit('navigate')"
          >
            <component :is="tool.icon" class="size-4 shrink-0" aria-hidden="true" />
            {{ tool.name }}
          </RouterLink>
        </li>
      </ul>
    </div>
  </nav>
</template>
