<script setup lang="ts">
import ToolPage from '@/components/ui/ToolPage.vue'
import TextAreaField from '@/components/ui/TextAreaField.vue'
import ChipPicker from '@/components/ui/ChipPicker.vue'
import ToggleSwitch from '@/components/ui/ToggleSwitch.vue'
import RunButton from '@/components/ui/RunButton.vue'
import CopyButton from '@/components/ui/CopyButton.vue'
import SendToMenu from '@/components/ui/SendToMenu.vue'
import OutputPanel from '@/components/output/OutputPanel.vue'
import MarkdownOutput from '@/components/output/MarkdownOutput.vue'
import { useRunShortcut } from '@/composables/useRunShortcut'
import { useExplainStore } from '@/stores/explain'
import { EXPLAIN_LEVELS } from '@/tools/presets'
import { getTool } from '@/tools/registry'

const tool = getTool('explain')
const store = useExplainStore()

useRunShortcut(store.run)
</script>

<template>
  <ToolPage :tool="tool">
    <template #input>
      <TextAreaField
        v-model="store.text"
        label="What needs explaining?"
        placeholder="Paste a passage, or ask about a topic — e.g. “How do interest rates affect mortgages?”"
        :rows="8"
      />
      <ChipPicker v-model="store.level" label="Explain it for" :options="EXPLAIN_LEVELS" />
      <div class="flex flex-col gap-4">
        <ToggleSwitch
          v-model="store.analogy"
          label="Use an analogy"
          description="Relate it to something familiar."
        />
        <ToggleSwitch
          v-model="store.glossary"
          label="Add a glossary"
          description="Define the key terms at the end."
        />
      </div>
      <RunButton
        label="Explain"
        stoppable
        :running="store.isRunning"
        :disabled="!store.canRun"
        @run="store.run"
        @stop="store.stop"
      />
    </template>

    <template #output>
      <OutputPanel
        title="Explanation"
        :status="store.status"
        :has-content="!!store.output"
        :error="store.error"
        :usage="store.usage"
        :notice="store.notice"
      >
        <template #actions>
          <CopyButton :text="store.output" />
          <SendToMenu :text="store.output" from="explain" />
        </template>
        <MarkdownOutput :source="store.output" :streaming="store.isRunning" />
      </OutputPanel>
    </template>
  </ToolPage>
</template>
