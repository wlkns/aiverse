import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import MarkdownIt from 'markdown-it'

// html: false escapes any raw HTML in model output, and markdown-it's built-in
// validateLink rejects javascript:/vbscript:/data: URLs, so the result is safe
// to render with v-html.
const md = new MarkdownIt({ html: false, linkify: true, typographer: true })

const renderLinkOpen =
  md.renderer.rules.link_open ??
  ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options))

md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  tokens[idx]!.attrSet('target', '_blank')
  tokens[idx]!.attrSet('rel', 'noopener noreferrer')
  return renderLinkOpen(tokens, idx, options, env, self)
}

export function renderMarkdown(source: string): string {
  return md.render(source)
}

export function useMarkdown(source: MaybeRefOrGetter<string>) {
  return computed(() => renderMarkdown(toValue(source)))
}
