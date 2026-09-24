<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { KeyRound, LoaderCircle } from '@lucide/vue'
import AppLogo from '@/components/layout/AppLogo.vue'
import ErrorAlert from '@/components/ui/ErrorAlert.vue'
import TextField from '@/components/ui/TextField.vue'
import { errorMessage } from '@/api/client'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const token = ref('')
const error = ref<string | null>(null)
const checking = ref(false)

// Only follow same-app paths, never "//evil.com" or absolute URLs.
function redirectTarget(): string {
  const redirect = route.query.redirect
  return typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')
    ? redirect
    : '/'
}

async function submit() {
  if (!token.value.trim() || checking.value) return
  checking.value = true
  error.value = null
  try {
    await auth.unlock(token.value)
    await router.replace(redirectTarget())
  } catch (err) {
    error.value = errorMessage(err)
  } finally {
    checking.value = false
  }
}
</script>

<template>
  <main class="grid min-h-dvh place-items-center px-4 py-10">
    <div class="w-full max-w-sm">
      <div class="mb-8 flex justify-center"><AppLogo /></div>
      <form
        class="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        @submit.prevent="submit"
      >
        <div>
          <h1 class="text-lg font-semibold">Unlock AIverse</h1>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Enter your access token. It's stored in this browser only.
          </p>
        </div>
        <TextField
          v-model="token"
          label="Access token"
          type="password"
          placeholder="••••••••••••"
          :max-length="1000"
        />
        <ErrorAlert v-if="error" :message="error" />
        <button
          type="submit"
          class="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          :disabled="!token.trim() || checking"
        >
          <LoaderCircle v-if="checking" class="size-4 animate-spin" aria-hidden="true" />
          <KeyRound v-else class="size-4" aria-hidden="true" />
          {{ checking ? 'Checking…' : 'Unlock' }}
        </button>
      </form>
    </div>
  </main>
</template>
