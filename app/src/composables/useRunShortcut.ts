import { onKeyStroke } from '@vueuse/core'

/** ⌘/Ctrl + Enter runs the current tool, even while typing in a textarea. */
export function useRunShortcut(run: () => unknown) {
  onKeyStroke('Enter', (event) => {
    if (!(event.metaKey || event.ctrlKey)) return
    event.preventDefault()
    run()
  })
}
