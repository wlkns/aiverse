<script setup lang="ts">
import AppLogo from './AppLogo.vue'
import LockButton from './LockButton.vue'
import NavList from './NavList.vue'
import SearchButton from './SearchButton.vue'
</script>

<template>
  <aside
    class="flex-col gap-6 overflow-y-auto border-r border-slate-200 bg-white px-4 py-6 dark:border-slate-800 dark:bg-slate-900"
  >
    <div class="px-2"><AppLogo /></div>
    <SearchButton />
    <NavList class="flex-1" />
    <LockButton />
  </aside>
</template>
