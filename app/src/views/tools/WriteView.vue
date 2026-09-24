<script setup lang="ts">
import ToolPage from '@/components/ui/ToolPage.vue'
import TextAreaField from '@/components/ui/TextAreaField.vue'
import OptionSelect from '@/components/ui/OptionSelect.vue'
import ChipPicker from '@/components/ui/ChipPicker.vue'
import RunButton from '@/components/ui/RunButton.vue'
import CopyButton from '@/components/ui/CopyButton.vue'
import SendToMenu from '@/components/ui/SendToMenu.vue'
import OutputPanel from '@/components/output/OutputPanel.vue'
import MarkdownOutput from '@/components/output/MarkdownOutput.vue'
import { useRunShortcut } from '@/composables/useRunShortcut'
import { useWriteStore } from '@/stores/write'
import { STYLES, WRITE_CONTENT_TYPES, WRITE_LENGTHS } from '@/tools/presets'
import { getTool } from '@/tools/registry'

const tool = getTool('write')
const store = useWriteStore()

useRunShortcut(store.run)
</script>

<template>
  <ToolPage :tool="tool">
    <template #input>
      <TextAreaField
        v-model="store.prompt"
        label="What should I write?"
        placeholder="e.g. An email to the team announcing our new flexible working policy, starting next month…"
        :max-length="10000"
        :rows="6"
      />
      <OptionSelect v-model="store.contentType" label="Type" :options="WRITE_CONTENT_TYPES" />
      <OptionSelect v-model="store.length" label="Length" :options="WRITE_LENGTHS" />
      <ChipPicker v-model="store.tone" label="Tone" :options="STYLES" />
      <RunButton
        label="Write"
        stoppable
        :running="store.isRunning"
        :disabled="!store.canRun"
        @run="store.run"
        @stop="store.stop"
      />
    </template>

    <template #output>
      <OutputPanel
        title="Draft"
        :status="store.status"
        :has-content="!!store.output"
        :error="store.error"
        :usage="store.usage"
        :notice="store.notice"
      >
        <template #actions>
          <CopyButton :text="store.output" />
          <SendToMenu :text="store.output" from="write" />
        </template>
        <MarkdownOutput :source="store.output" :streaming="store.isRunning" />
      </OutputPanel>
    </template>
  </ToolPage>
</template>
