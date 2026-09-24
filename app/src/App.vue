<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTitle } from '@vueuse/core'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import MobileNav from '@/components/layout/MobileNav.vue'
import CommandPalette from '@/components/layout/CommandPalette.vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

useTitle(computed(() => (route.meta.title ? `${route.meta.title} · AIverse` : 'AIverse')))

// If the token is rejected mid-session (or the user locks), send them to unlock
// and bring them back afterwards.
watch(
  () => auth.isUnlocked,
  (unlocked) => {
    if (!unlocked && !route.meta.public) {
      router.replace({ name: 'unlock', query: { redirect: route.fullPath } })
    }
  },
)
</script>

<template>
  <RouterView v-if="route.meta.public" />
  <div v-else class="min-h-dvh">
    <AppSidebar class="fixed inset-y-0 left-0 hidden w-64 lg:flex" />
    <MobileNav class="lg:hidden" />
    <main class="lg:pl-64">
      <div class="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        <RouterView />
      </div>
    </main>
    <CommandPalette />
  </div>
</template>
