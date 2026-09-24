import { computed, ref, shallowRef } from 'vue'
import { ApiError, errorMessage } from '@/api/client'
import { postStream } from '@/api/stream'
import type { TokenUsage } from '@/api/types'

export type RunStatus = 'idle' | 'running' | 'done' | 'error'

/** Runs a streaming (SSE) tool, accumulating text as it arrives. */
export function useStreamRunner<Body extends object>(path: string) {
  const output = ref('')
  const status = ref<RunStatus>('idle')
  const error = ref<string | null>(null)
  const notice = ref<string | null>(null)
  const usage = shallowRef<TokenUsage | null>(null)
  const isRunning = computed(() => status.value === 'running')

  let controller: AbortController | null = null
  let runId = 0

  async function run(body: Body) {
    controller?.abort()
    const id = ++runId
    const current = new AbortController()
    controller = current

    output.value = ''
    error.value = null
    notice.value = null
    usage.value = null
    status.value = 'running'

    try {
      for await (const event of postStream(path, body, current.signal)) {
        if (id !== runId) return
        if (event.type === 'delta') {
          output.value += event.text
        } else if (event.type === 'done') {
          usage.value = event.usage
          if (event.incomplete_reason) {
            notice.value = 'The response was cut off before it finished.'
          }
        } else {
          throw new ApiError(event.error, event.status)
        }
      }
      if (id === runId) status.value = 'done'
    } catch (err) {
      if (id !== runId) return // superseded by a newer run
      if (current.signal.aborted) {
        status.value = output.value ? 'done' : 'idle'
        if (output.value) notice.value = 'Stopped.'
        return
      }
      error.value = errorMessage(err)
      status.value = 'error'
    } finally {
      if (controller === current) controller = null
    }
  }

  function stop() {
    controller?.abort()
  }

  function reset() {
    stop()
    runId++
    output.value = ''
    error.value = null
    notice.value = null
    usage.value = null
    status.value = 'idle'
  }

  return { output, status, error, notice, usage, isRunning, run, stop, reset }
}
