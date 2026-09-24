<script setup lang="ts">
import { computed } from 'vue'
import { LoaderCircle } from '@lucide/vue'
import type { TokenUsage } from '@/api/types'
import type { RunStatus } from '@/composables/useStreamRunner'
import ErrorAlert from '@/components/ui/ErrorAlert.vue'

const {
  title = 'Result',
  usage = null,
  notice = null,
  error = null,
  emptyText = 'Your result will appear here.',
} = defineProps<{
  status: RunStatus
  hasContent: boolean
  title?: string
  usage?: TokenUsage | null
  notice?: string | null
  error?: string | null
  emptyText?: string
}>()

const tokens = computed(() => usage?.total_tokens.toLocaleString())
</script>

<template>
  <section
    class="flex min-h-64 flex-col rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
    :aria-busy="status === 'running'"
  >
    <header
      class="flex min-h-12 items-center justify-between gap-2 border-b border-slate-100 px-5 py-2 dark:border-slate-800"
    >
      <h2 class="flex shrink-0 items-center gap-2 text-sm font-semibold whitespace-nowrap">
        {{ title }}
        <LoaderCircle
          v-if="status === 'running'"
          class="size-3.5 animate-spin text-indigo-500"
          aria-label="Working"
        />
      </h2>
      <div v-if="hasContent" class="flex flex-wrap items-center justify-end gap-1">
        <slot name="actions" />
      </div>
    </header>

    <div class="flex flex-1 flex-col gap-4 p-5">
      <ErrorAlert v-if="error" :message="error" />

      <slot v-if="hasContent" />
      <div v-else-if="status === 'running'" class="flex flex-col gap-3" aria-hidden="true">
        <div class="h-3 w-11/12 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
        <div class="h-3 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
        <div class="h-3 w-4/5 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
        <div class="h-3 w-2/3 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
      </div>
      <p
        v-else-if="!error"
        class="m-auto max-w-xs py-8 text-center text-sm text-slate-400 dark:text-slate-500"
      >
        {{ emptyText }}
      </p>
    </div>

    <footer
      v-if="notice || tokens"
      class="flex items-center justify-between gap-2 border-t border-slate-100 px-5 py-2.5 text-xs text-slate-400 dark:border-slate-800"
    >
      <span>{{ notice }}</span>
      <span
        v-if="tokens"
        class="tabular-nums"
        :title="`${usage?.input_tokens} in · ${usage?.output_tokens} out`"
      >
        {{ tokens }} tokens
      </span>
    </footer>
  </section>
</template>
