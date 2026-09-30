import { createParser, type EventSourceMessage } from 'eventsource-parser'
import { ApiError, apiFetch, withRequestOptions } from './client'
import type { StreamEvent } from './types'

function toStreamEvent(message: EventSourceMessage): StreamEvent | null {
  let data: Record<string, unknown>
  try {
    data = JSON.parse(message.data)
  } catch {
    return null
  }

  switch (message.event) {
    case 'delta':
    case 'done':
    case 'error':
      return { type: message.event, ...data } as StreamEvent
    default:
      return null
  }
}

/** POST to a streaming tool and yield its events as they arrive. */
export async function* postStream(
  path: string,
  body: object,
  signal?: AbortSignal,
): AsyncGenerator<StreamEvent> {
  const response = await apiFetch(path, {
    method: 'POST',
    headers: { Accept: 'text/event-stream' },
    body: JSON.stringify(withRequestOptions(body)),
    signal,
  })

  if (!response.body) {
    throw new ApiError('The response could not be streamed.', 0)
  }

  const queue: StreamEvent[] = []
  const parser = createParser({
    onEvent(message) {
      const event = toStreamEvent(message)
      if (event) queue.push(event)
    },
  })

  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      parser.feed(decoder.decode(value, { stream: true }))
      while (queue.length) yield queue.shift()!
    }
  } finally {
    // Stops the download if the consumer bails out early.
    reader.cancel().catch(() => {})
  }
}
