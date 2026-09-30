<script setup lang="ts">
import { Lock, RotateCcw, Settings } from '@lucide/vue'
import CostIndicator from '@/components/ui/CostIndicator.vue'
import FormField from '@/components/ui/FormField.vue'
import { API_URL } from '@/api/client'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
import { MODEL_TIERS } from '@/tools/presets'

const auth = useAuthStore()
const settings = useSettingsStore()
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
      <FormField label="Speed and quality" as="fieldset">
        <div class="flex flex-col gap-2">
          <label
            v-for="tier in MODEL_TIERS"
            :key="tier.id"
            class="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3.5 transition-colors hover:border-slate-300 has-checked:border-indigo-500 has-checked:bg-indigo-50/60 has-focus-visible:ring-2 has-focus-visible:ring-indigo-500 dark:border-slate-700 dark:hover:border-slate-600 dark:has-checked:border-indigo-500 dark:has-checked:bg-indigo-500/10"
          >
            <input
              v-model="settings.tier"
              type="radio"
              name="tier"
              :value="tier.id"
              class="mt-0.5 size-4 accent-indigo-600"
            />
            <span class="min-w-0 flex-1">
              <span class="flex items-center justify-between gap-3">
                <span class="text-sm font-semibold">{{ tier.label }}</span>
                <CostIndicator :cost="tier.cost" class="text-sm" />
              </span>
              <span class="mt-0.5 block text-sm text-slate-500 dark:text-slate-400">
                {{ tier.description }}
              </span>
            </span>
          </label>
        </div>
      </FormField>
      <div class="flex flex-wrap gap-3">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          @click="settings.reset()"
        >
          <RotateCcw class="size-4" aria-hidden="true" />
          Reset to default
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
