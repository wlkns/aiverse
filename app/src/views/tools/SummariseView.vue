<script setup lang="ts">
import ToolPage from '@/components/ui/ToolPage.vue'
import TextAreaField from '@/components/ui/TextAreaField.vue'
import TextField from '@/components/ui/TextField.vue'
import OptionSelect from '@/components/ui/OptionSelect.vue'
import RunButton from '@/components/ui/RunButton.vue'
import CopyButton from '@/components/ui/CopyButton.vue'
import SendToMenu from '@/components/ui/SendToMenu.vue'
import OutputPanel from '@/components/output/OutputPanel.vue'
import MarkdownOutput from '@/components/output/MarkdownOutput.vue'
import { useRunShortcut } from '@/composables/useRunShortcut'
import { useSummariseStore } from '@/stores/summarise'
import { SUMMARY_FORMATS, SUMMARY_LENGTHS } from '@/tools/presets'
import { getTool } from '@/tools/registry'

const tool = getTool('summarise')
const store = useSummariseStore()

useRunShortcut(store.run)
</script>

<template>
  <ToolPage :tool="tool">
    <template #input>
      <TextAreaField
        v-model="store.text"
        label="Text to summarise"
        placeholder="Paste an article, report, email thread…"
        :rows="10"
      />
      <OptionSelect v-model="store.length" label="Length" :options="SUMMARY_LENGTHS" />
      <OptionSelect v-model="store.format" label="Format" :options="SUMMARY_FORMATS" />
      <TextField
        v-model="store.focus"
        label="Focus on"
        hint="optional"
        placeholder="e.g. costs and risks"
      />
      <RunButton
        label="Summarise"
        stoppable
        :running="store.isRunning"
        :disabled="!store.canRun"
        @run="store.run"
        @stop="store.stop"
      />
    </template>

    <template #output>
      <OutputPanel
        title="Summary"
        :status="store.status"
        :has-content="!!store.output"
        :error="store.error"
        :usage="store.usage"
        :notice="store.notice"
      >
        <template #actions>
          <CopyButton :text="store.output" />
          <SendToMenu :text="store.output" from="summarise" />
        </template>
        <MarkdownOutput :source="store.output" :streaming="store.isRunning" />
      </OutputPanel>
    </template>
  </ToolPage>
</template>
