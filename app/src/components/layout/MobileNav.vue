<script setup lang="ts">
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { onKeyStroke, useScrollLock } from '@vueuse/core'
import { Menu, X } from '@lucide/vue'
import { useUiStore } from '@/stores/ui'
import AppLogo from './AppLogo.vue'
import LockButton from './LockButton.vue'
import NavList from './NavList.vue'
import SearchButton from './SearchButton.vue'

const ui = useUiStore()
const route = useRoute()
const scrollLock = useScrollLock(typeof document === 'undefined' ? null : document.body)

watch(
  () => ui.drawerOpen,
  (open) => (scrollLock.value = open),
)
watch(
  () => route.fullPath,
  () => (ui.drawerOpen = false),
)
onKeyStroke('Escape', () => (ui.drawerOpen = false))
</script>

<template>
  <div>
    <header
      class="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90"
    >
      <AppLogo />
      <button
        type="button"
        class="-mr-2 rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        aria-label="Open menu"
        :aria-expanded="ui.drawerOpen"
        @click="ui.drawerOpen = true"
      >
        <Menu class="size-5" aria-hidden="true" />
      </button>
    </header>

    <Teleport to="body">
      <Transition
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
        enter-active-class="transition-opacity duration-200"
        leave-active-class="transition-opacity duration-200"
      >
        <div
          v-if="ui.drawerOpen"
          class="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          aria-hidden="true"
          @click="ui.drawerOpen = false"
        />
      </Transition>
      <Transition
        enter-from-class="-translate-x-full"
        leave-to-class="-translate-x-full"
        enter-active-class="transition-transform duration-200"
        leave-active-class="transition-transform duration-200"
      >
        <aside
          v-if="ui.drawerOpen"
          class="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col gap-6 overflow-y-auto bg-white px-4 py-5 shadow-xl lg:hidden dark:bg-slate-900"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <div class="flex items-center justify-between px-2">
            <AppLogo />
            <button
              type="button"
              class="-mr-2 rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Close menu"
              @click="ui.drawerOpen = false"
            >
              <X class="size-5" aria-hidden="true" />
            </button>
          </div>
          <SearchButton />
          <NavList class="flex-1" @navigate="ui.drawerOpen = false" />
          <LockButton />
        </aside>
      </Transition>
    </Teleport>
  </div>
</template>
