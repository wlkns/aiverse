import { useRouter } from 'vue-router'
import { useExplainStore } from '@/stores/explain'
import { useHeadlinesStore } from '@/stores/headlines'
import { useKeyPointsStore } from '@/stores/keyPoints'
import { useReplyStore } from '@/stores/reply'
import { useRewriteStore } from '@/stores/rewrite'
import { useSummariseStore } from '@/stores/summarise'
import { useToneStore } from '@/stores/tone'
import { useWordsStore } from '@/stores/words'
import { useWriteStore } from '@/stores/write'
import { getTool, type ToolId } from '@/tools/registry'

const receivers: Record<ToolId, () => { receive: (text: string) => void }> = {
  write: useWriteStore,
  rewrite: useRewriteStore,
  words: useWordsStore,
  reply: useReplyStore,
  headlines: useHeadlinesStore,
  summarise: useSummariseStore,
  'key-points': useKeyPointsStore,
  explain: useExplainStore,
  tone: useToneStore,
}

/** Hand text from one tool's output to another tool's input and open it. */
export function useSendTo() {
  const router = useRouter()

  return function sendTo(id: ToolId, text: string) {
    receivers[id]().receive(text)
    return router.push(getTool(id).path)
  }
}
