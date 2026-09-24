import type { Component } from 'vue'
import {
  FileText,
  Gauge,
  Heading,
  Lightbulb,
  ListChecks,
  MessageSquareReply,
  PenLine,
  Repeat2,
} from '@lucide/vue'

export type ToolId =
  'write' | 'rewrite' | 'reply' | 'headlines' | 'summarise' | 'key-points' | 'explain' | 'tone'

export type ToolCategory = 'create' | 'understand'

export interface Tool {
  id: ToolId
  name: string
  /** App route — matches the API endpoint. */
  path: `/${string}`
  category: ToolCategory
  description: string
  icon: Component
  /** Extra search terms for the command palette. */
  keywords: string[]
  component: () => Promise<Component>
}

export const CATEGORIES: { id: ToolCategory; label: string }[] = [
  { id: 'create', label: 'Create' },
  { id: 'understand', label: 'Understand' },
]

/**
 * Every tool in the app. Navigation, the home grid, the command palette,
 * "Send to…" and routing are all driven from this list.
 */
export const TOOLS: Tool[] = [
  {
    id: 'write',
    name: 'Writer',
    path: '/write',
    category: 'create',
    description: 'Describe what you need and get a first draft.',
    icon: PenLine,
    keywords: ['draft', 'compose', 'generate', 'email', 'blog', 'post'],
    component: () => import('@/views/tools/WriteView.vue'),
  },
  {
    id: 'rewrite',
    name: 'Re-writer',
    path: '/rewrite',
    category: 'create',
    description: 'Rewrite text in a different style, with several variations.',
    icon: Repeat2,
    keywords: ['rephrase', 'paraphrase', 'style', 'tone', 'friendly', 'professional'],
    component: () => import('@/views/tools/RewriteView.vue'),
  },
  {
    id: 'reply',
    name: 'Reply drafter',
    path: '/reply',
    category: 'create',
    description: 'Paste a message, pick your intent, get ready-to-send replies.',
    icon: MessageSquareReply,
    keywords: ['respond', 'answer', 'email', 'message', 'decline', 'accept'],
    component: () => import('@/views/tools/ReplyView.vue'),
  },
  {
    id: 'headlines',
    name: 'Headlines',
    path: '/headlines',
    category: 'create',
    description: 'Headlines, page titles, meta descriptions and subject lines.',
    icon: Heading,
    keywords: ['title', 'seo', 'meta', 'description', 'subject', 'caption'],
    component: () => import('@/views/tools/HeadlinesView.vue'),
  },
  {
    id: 'summarise',
    name: 'Summariser',
    path: '/summarise',
    category: 'understand',
    description: 'Condense long text into a short summary or bullet points.',
    icon: FileText,
    keywords: ['summary', 'tldr', 'condense', 'shorten', 'digest'],
    component: () => import('@/views/tools/SummariseView.vue'),
  },
  {
    id: 'key-points',
    name: 'Key points',
    path: '/key-points',
    category: 'understand',
    description: 'Pull out key points, decisions and action items.',
    icon: ListChecks,
    keywords: ['actions', 'todo', 'tasks', 'meeting', 'notes', 'decisions', 'extract'],
    component: () => import('@/views/tools/KeyPointsView.vue'),
  },
  {
    id: 'explain',
    name: 'Explain simply',
    path: '/explain',
    category: 'understand',
    description: 'Make complicated text or topics easy to understand.',
    icon: Lightbulb,
    keywords: ['eli5', 'simplify', 'understand', 'teach', 'plain english'],
    component: () => import('@/views/tools/ExplainView.vue'),
  },
  {
    id: 'tone',
    name: 'Tone analyser',
    path: '/tone',
    category: 'understand',
    description: 'See how your writing comes across before you send it.',
    icon: Gauge,
    keywords: ['analyse', 'sentiment', 'formality', 'feedback', 'check'],
    component: () => import('@/views/tools/ToneView.vue'),
  },
]

export function getTool(id: ToolId): Tool {
  return TOOLS.find((tool) => tool.id === id)!
}

export function toolsIn(category: ToolCategory): Tool[] {
  return TOOLS.filter((tool) => tool.category === category)
}
