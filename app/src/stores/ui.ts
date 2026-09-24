import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', () => {
  const paletteOpen = ref(false)
  const drawerOpen = ref(false)

  return { paletteOpen, drawerOpen }
})
