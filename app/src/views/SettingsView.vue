<script setup lang="ts">
import { Lock, RotateCcw, Settings } from '@lucide/vue'
import OptionSelect from '@/components/ui/OptionSelect.vue'
import TextField from '@/components/ui/TextField.vue'
import { API_URL } from '@/api/client'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
import { REASONING_EFFORTS, type Option, type ReasoningEffort } from '@/tools/presets'

const auth = useAuthStore()
const settings = useSettingsStore()

const effortOptions: Option<ReasoningEffort | ''>[] = [
  { id: '', label: 'Server default' },
  ...REASONING_EFFORTS,
]
</script>

<template>
  <div class="max-w-xl">
    <header class="mb-8 flex items-start gap-4">
      <span
        class="grid size-11 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
      >
        <Settings class="size-5" aria-hidden="true" />
      </span>
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">Settings</h1>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Applies to every tool, and is saved in this browser.
        </p>
      </div>
    </header>

    <form
      class="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      @submit.prevent
    >
      <TextField
        v-model="settings.model"
        label="Model"
        hint="leave blank for the server default"
        placeholder="e.g. gpt-5.6-terra"
        :max-length="100"
      />
      <OptionSelect
        v-model="settings.reasoningEffort"
        label="Reasoning effort"
        hint="higher is slower but more careful"
        :options="effortOptions"
      />
      <div class="flex flex-wrap gap-3">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          @click="settings.reset()"
        >
          <RotateCcw class="size-4" aria-hidden="true" />
          Reset to defaults
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          @click="auth.lock()"
        >
          <Lock class="size-4" aria-hidden="true" />
          Lock and forget token
        </button>
      </div>
    </form>

    <p class="mt-4 text-xs text-slate-400">
      API: <code class="break-all">{{ API_URL }}</code>
    </p>
  </div>
</template>
