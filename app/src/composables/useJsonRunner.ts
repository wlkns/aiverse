import { computed, ref, shallowRef } from 'vue'
import { errorMessage, postJson } from '@/api/client'
import type { TokenUsage, WithUsage } from '@/api/types'
import type { RunStatus } from './useStreamRunner'

/** Runs a JSON tool that returns a structured result. */
export function useJsonRunner<Body extends object, Result extends object>(path: string) {
  const result = shallowRef<Result | null>(null)
  const status = ref<RunStatus>('idle')
  const error = ref<string | null>(null)
  const usage = shallowRef<TokenUsage | null>(null)
  const isRunning = computed(() => status.value === 'running')

  let controller: AbortController | null = null
  let runId = 0

  async function run(body: Body) {
    controller?.abort()
    const id = ++runId
    const current = new AbortController()
    controller = current

    error.value = null
    status.value = 'running'

    try {
      const { usage: tokens, ...data } = await postJson<WithUsage<Result>>(
        path,
        body,
        current.signal,
      )
      if (id !== runId) return
      result.value = data as unknown as Result
      usage.value = tokens
      status.value = 'done'
    } catch (err) {
      if (id !== runId) return
      if (current.signal.aborted) {
        status.value = result.value ? 'done' : 'idle'
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
    result.value = null
    error.value = null
    usage.value = null
    status.value = 'idle'
  }

  return { result, status, error, usage, isRunning, run, stop, reset }
}
