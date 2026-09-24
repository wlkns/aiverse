// Option ids must match the presets in worker/index.ts — the API validates them.

export interface Option<T extends string = string> {
  id: T
  label: string
}

type Ids<T extends readonly Option[]> = T[number]['id']

export const STYLES = [
  { id: 'friendly', label: 'Friendly' },
  { id: 'professional', label: 'Professional' },
  { id: 'direct', label: 'Direct' },
  { id: 'concise', label: 'Concise' },
  { id: 'formal', label: 'Formal' },
  { id: 'casual', label: 'Casual' },
  { id: 'persuasive', label: 'Persuasive' },
  { id: 'empathetic', label: 'Empathetic' },
  { id: 'plain-english', label: 'Plain English' },
  { id: 'confident', label: 'Confident' },
] as const satisfies Option[]
export type StyleId = Ids<typeof STYLES>

export const SUMMARY_LENGTHS = [
  { id: 'short', label: 'Short' },
  { id: 'medium', label: 'Medium' },
  { id: 'long', label: 'Long' },
] as const satisfies Option[]
export type SummaryLength = Ids<typeof SUMMARY_LENGTHS>

export const SUMMARY_FORMATS = [
  { id: 'paragraph', label: 'Paragraph' },
  { id: 'bullets', label: 'Bullets' },
  { id: 'tldr', label: 'TL;DR' },
] as const satisfies Option[]
export type SummaryFormat = Ids<typeof SUMMARY_FORMATS>

export const WRITE_CONTENT_TYPES = [
  { id: 'general', label: 'General' },
  { id: 'email', label: 'Email' },
  { id: 'blog-post', label: 'Blog post' },
  { id: 'social-post', label: 'Social post' },
  { id: 'product-description', label: 'Product description' },
  { id: 'letter', label: 'Letter' },
] as const satisfies Option[]
export type WriteContentType = Ids<typeof WRITE_CONTENT_TYPES>

export const WRITE_LENGTHS = [
  { id: 'short', label: 'Short' },
  { id: 'medium', label: 'Medium' },
  { id: 'long', label: 'Long' },
] as const satisfies Option[]
export type WriteLength = Ids<typeof WRITE_LENGTHS>

export const EXPLAIN_LEVELS = [
  { id: 'eli5', label: "Like I'm 5" },
  { id: 'age-12', label: 'Age 12' },
  { id: 'plain-adult', label: 'Plain English' },
  { id: 'newcomer', label: 'Newcomer to the field' },
] as const satisfies Option[]
export type ExplainLevel = Ids<typeof EXPLAIN_LEVELS>

export const KEY_POINT_SOURCES = [
  { id: 'meeting-notes', label: 'Meeting notes' },
  { id: 'email', label: 'Email / thread' },
  { id: 'document', label: 'Document' },
  { id: 'transcript', label: 'Transcript' },
] as const satisfies Option[]
export type KeyPointSource = Ids<typeof KEY_POINT_SOURCES>

export const REPLY_INTENTS = [
  { id: 'accept', label: 'Accept' },
  { id: 'decline', label: 'Decline' },
  { id: 'follow-up', label: 'Follow up' },
  { id: 'request-info', label: 'Ask for info' },
  { id: 'thank', label: 'Say thanks' },
  { id: 'apologise', label: 'Apologise' },
  { id: 'custom', label: 'Custom' },
] as const satisfies Option[]
export type ReplyIntent = Ids<typeof REPLY_INTENTS>

export const REPLY_CHANNELS = [
  { id: 'email', label: 'Email' },
  { id: 'chat', label: 'Chat' },
  { id: 'linkedin', label: 'LinkedIn' },
] as const satisfies Option[]
export type ReplyChannel = Ids<typeof REPLY_CHANNELS>

export const HEADLINE_KINDS = [
  { id: 'headline', label: 'Article headline', maxChars: 80 },
  { id: 'title', label: 'SEO page title', maxChars: 60 },
  { id: 'meta', label: 'Meta description', maxChars: 155 },
  { id: 'email-subject', label: 'Email subject', maxChars: 50 },
  { id: 'social', label: 'Social caption', maxChars: 120 },
] as const satisfies (Option & { maxChars: number })[]
export type HeadlineKind = Ids<typeof HEADLINE_KINDS>

export const REASONING_EFFORTS = [
  { id: 'none', label: 'None' },
  { id: 'low', label: 'Low' },
  { id: 'medium', label: 'Medium' },
  { id: 'high', label: 'High' },
  { id: 'xhigh', label: 'Extra high' },
  { id: 'max', label: 'Max' },
] as const satisfies Option[]
export type ReasoningEffort = Ids<typeof REASONING_EFFORTS>
