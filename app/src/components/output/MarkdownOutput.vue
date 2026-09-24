<script setup lang="ts">
import { useMarkdown } from '@/composables/useMarkdown'

const { source, streaming = false } = defineProps<{ source: string; streaming?: boolean }>()

const html = useMarkdown(() => source)
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -- markdown-it runs with html: false, so output is escaped -->
  <div class="markdown" :class="streaming && 'streaming'" v-html="html" />
</template>

<style scoped>
.streaming :deep(> :last-child)::after {
  content: '';
  display: inline-block;
  width: 0.5em;
  height: 1em;
  margin-left: 2px;
  vertical-align: text-bottom;
  background: currentColor;
  opacity: 0.4;
  animation: blink 1s steps(2) infinite;
}

@keyframes blink {
  to {
    visibility: hidden;
  }
}
</style>
