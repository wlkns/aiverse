<script setup lang="ts">
import ToolPage from '@/components/ui/ToolPage.vue'
import TextAreaField from '@/components/ui/TextAreaField.vue'
import TextField from '@/components/ui/TextField.vue'
import ChipPicker from '@/components/ui/ChipPicker.vue'
import CountStepper from '@/components/ui/CountStepper.vue'
import RunButton from '@/components/ui/RunButton.vue'
import OutputPanel from '@/components/output/OutputPanel.vue'
import ResultCard from '@/components/output/ResultCard.vue'
import { useRunShortcut } from '@/composables/useRunShortcut'
import { useRewriteStore } from '@/stores/rewrite'
import { STYLES } from '@/tools/presets'
import { getTool } from '@/tools/registry'

const tool = getTool('rewrite')
const store = useRewriteStore()
const styleOptions = [...STYLES, { id: 'custom', label: 'Custom…' } as const]

useRunShortcut(store.run)
</script>

<template>
  <ToolPage :tool="tool">
    <template #input>
      <TextAreaField
        v-model="store.text"
        label="Text to rewrite"
        placeholder="Paste the text you'd like to rewrite…"
        :max-length="20000"
        :rows="8"
      />
      <ChipPicker v-model="store.style" label="Style" :options="styleOptions" />
      <TextField
        v-if="store.style === 'custom'"
        v-model="store.customStyle"
        label="Describe the style"
        placeholder="e.g. Upbeat startup founder, short punchy sentences"
      />
      <CountStepper v-model="store.variations" label="Variations" :min="1" :max="5" />
      <RunButton
        label="Rewrite"
        :running="store.isRunning"
        :disabled="!store.canRun"
        @run="store.run"
      />
    </template>

    <template #output>
      <OutputPanel
        title="Variations"
        :status="store.status"
        :has-content="!!store.result"
        :error="store.error"
        :usage="store.usage"
        :class="store.isRunning && store.result && 'opacity-60'"
      >
        <div class="flex flex-col gap-4">
          <ResultCard
            v-for="(variation, index) in store.result?.variations"
            :key="index"
            :heading="`Variation ${index + 1}`"
            :text="variation.text"
            from="rewrite"
          />
        </div>
      </OutputPanel>
    </template>
  </ToolPage>
</template>
