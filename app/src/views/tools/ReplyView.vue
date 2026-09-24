<script setup lang="ts">
import ToolPage from '@/components/ui/ToolPage.vue'
import TextAreaField from '@/components/ui/TextAreaField.vue'
import TextField from '@/components/ui/TextField.vue'
import OptionSelect from '@/components/ui/OptionSelect.vue'
import ChipPicker from '@/components/ui/ChipPicker.vue'
import CountStepper from '@/components/ui/CountStepper.vue'
import RunButton from '@/components/ui/RunButton.vue'
import OutputPanel from '@/components/output/OutputPanel.vue'
import ResultCard from '@/components/output/ResultCard.vue'
import { useRunShortcut } from '@/composables/useRunShortcut'
import { useReplyStore } from '@/stores/reply'
import { REPLY_CHANNELS, REPLY_INTENTS, STYLES } from '@/tools/presets'
import { getTool } from '@/tools/registry'

const tool = getTool('reply')
const store = useReplyStore()

function fullText(reply: { subject: string | null; body: string }) {
  return reply.subject ? `Subject: ${reply.subject}\n\n${reply.body}` : reply.body
}

useRunShortcut(store.run)
</script>

<template>
  <ToolPage :tool="tool">
    <template #input>
      <TextAreaField
        v-model="store.message"
        label="Message you're replying to"
        placeholder="Paste the email or message…"
        :max-length="20000"
        :rows="7"
      />
      <ChipPicker v-model="store.intent" label="I want to…" :options="REPLY_INTENTS" />
      <TextField
        v-if="store.intent === 'custom'"
        v-model="store.customIntent"
        label="Describe what you want to say"
        placeholder="e.g. Push the meeting to next week and suggest two times"
      />
      <TextAreaField
        v-model="store.points"
        label="Points to include (optional)"
        placeholder="e.g. I'm free Tuesday or Thursday afternoon"
        :max-length="2000"
        :rows="2"
      />
      <OptionSelect v-model="store.channel" label="Channel" :options="REPLY_CHANNELS" />
      <ChipPicker v-model="store.style" label="Tone" :options="STYLES" />
      <CountStepper v-model="store.variations" label="Options" :min="1" :max="3" />
      <RunButton
        label="Draft replies"
        :running="store.isRunning"
        :disabled="!store.canRun"
        @run="store.run"
      />
    </template>

    <template #output>
      <OutputPanel
        title="Replies"
        :status="store.status"
        :has-content="!!store.result"
        :error="store.error"
        :usage="store.usage"
        :class="store.isRunning && store.result && 'opacity-60'"
      >
        <div class="flex flex-col gap-4">
          <ResultCard
            v-for="(reply, index) in store.result?.replies"
            :key="index"
            :heading="`Option ${index + 1}`"
            :text="fullText(reply)"
            from="reply"
          >
            <p v-if="reply.subject" class="mb-2 text-sm font-semibold">{{ reply.subject }}</p>
            <p class="text-sm leading-relaxed break-words whitespace-pre-wrap">{{ reply.body }}</p>
          </ResultCard>
        </div>
      </OutputPanel>
    </template>
  </ToolPage>
</template>
