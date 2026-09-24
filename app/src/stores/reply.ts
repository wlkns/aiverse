import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useJsonRunner } from '@/composables/useJsonRunner'
import type { ReplyRequest, ReplyResult } from '@/api/types'
import type { ReplyChannel, ReplyIntent, StyleId } from '@/tools/presets'

export const useReplyStore = defineStore(
  'reply',
  () => {
    const message = ref('')
    const intent = ref<ReplyIntent>('follow-up')
    const customIntent = ref('')
    const points = ref('')
    const style = ref<StyleId>('professional')
    const channel = ref<ReplyChannel>('email')
    const variations = ref(2)

    const runner = useJsonRunner<ReplyRequest, ReplyResult>('/reply')
    const canRun = computed(
      () =>
        message.value.trim().length > 0 &&
        (intent.value !== 'custom' || customIntent.value.trim().length > 0) &&
        !runner.isRunning.value,
    )

    function run() {
      if (!canRun.value) return
      return runner.run({
        message: message.value,
        intent: intent.value,
        custom_intent: intent.value === 'custom' ? customIntent.value.trim() : undefined,
        points: points.value.trim() || undefined,
        style: style.value,
        channel: channel.value,
        variations: variations.value,
      })
    }

    function receive(input: string) {
      runner.reset()
      message.value = input
    }

    return {
      message,
      intent,
      customIntent,
      points,
      style,
      channel,
      variations,
      ...runner,
      canRun,
      run,
      receive,
    }
  },
  {
    persist: {
      pick: ['message', 'intent', 'customIntent', 'points', 'style', 'channel', 'variations'],
    },
  },
)
