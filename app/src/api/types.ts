import type {
  ExplainLevel,
  HeadlineKind,
  KeyPointSource,
  ReasoningEffort,
  ReplyChannel,
  ReplyIntent,
  StyleId,
  SummaryFormat,
  SummaryLength,
  WriteContentType,
  WriteLength,
} from '@/tools/presets'

export interface TokenUsage {
  input_tokens: number
  output_tokens: number
  total_tokens: number
}

export interface ModelOptions {
  model?: string
  reasoning_effort?: ReasoningEffort
}

// ---------- Stream tools ----------

export interface SummariseRequest {
  text: string
  length: SummaryLength
  format: SummaryFormat
  focus?: string
}

export interface WriteRequest {
  prompt: string
  content_type: WriteContentType
  tone: StyleId
  length: WriteLength
}

export interface ExplainRequest {
  text: string
  level: ExplainLevel
  analogy: boolean
  glossary: boolean
}

export type StreamEvent =
  | { type: 'delta'; text: string }
  | { type: 'done'; usage: TokenUsage; incomplete_reason?: string }
  | { type: 'error'; error: string; status: number }

// ---------- JSON tools ----------

export interface RewriteRequest {
  text: string
  style: StyleId | 'custom'
  custom_style?: string
  variations: number
}

export interface RewriteResult {
  variations: { text: string }[]
}

export const TONE_SCORE_KEYS = [
  'formality',
  'friendliness',
  'confidence',
  'clarity',
  'positivity',
] as const
export type ToneScoreKey = (typeof TONE_SCORE_KEYS)[number]

export interface ToneRequest {
  text: string
  audience?: string
}

export interface ToneResult {
  summary: string
  scores: Record<ToneScoreKey, number>
  reading_level: string
  tones: { label: string; strength: number }[]
  issues: { quote: string; issue: string; suggestion: string }[]
  suggestions: string[]
}

export interface KeyPointsRequest {
  text: string
  source_type: KeyPointSource
}

export interface ActionItem {
  task: string
  owner: string | null
  due: string | null
  priority: 'low' | 'medium' | 'high'
}

export interface KeyPointsResult {
  summary: string
  key_points: string[]
  action_items: ActionItem[]
  decisions: string[]
  open_questions: string[]
}

export interface ReplyRequest {
  message: string
  intent: ReplyIntent
  custom_intent?: string
  points?: string
  style: StyleId
  channel: ReplyChannel
  variations: number
}

export interface ReplyResult {
  replies: { subject: string | null; body: string }[]
}

export interface HeadlinesRequest {
  text: string
  kind: HeadlineKind
  count: number
  max_chars?: number
  keywords?: string
}

export interface HeadlinesResult {
  max_chars: number
  items: { text: string; chars: number; over_limit: boolean }[]
}

/** Every JSON tool response carries token usage alongside its result. */
export type WithUsage<T> = T & { usage: TokenUsage }
