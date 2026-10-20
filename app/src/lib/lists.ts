/**
 * Compare two lists of strings: what's only in the first, only in the second,
 * and in both. Items are trimmed, blanks dropped and duplicates counted once.
 */

export type ListSeparator = 'lines' | 'commas' | 'both'

export interface ListOptions {
  separator: ListSeparator
  ignoreCase: boolean
  /** Sort results A–Z; otherwise keep each list's order. */
  sort: boolean
}

export interface ListStats {
  /** Non-blank items, including repeats. */
  total: number
  /** Distinct items. */
  distinct: number
}

export interface ListComparison {
  onlyA: string[]
  onlyB: string[]
  /** Spelt as in list A when case is ignored. */
  both: string[]
  a: ListStats
  b: ListStats
}

const SEPARATORS: Record<ListSeparator, RegExp> = {
  lines: /\r\n|\r|\n/,
  commas: /,/,
  both: /\r\n|\r|\n|,/,
}

export function parseList(text: string, separator: ListSeparator): string[] {
  return text
    .split(SEPARATORS[separator])
    .map((item) => item.trim())
    .filter(Boolean)
}

/** Distinct items by key, keeping the first spelling and the list's order. */
function distinct(items: string[], key: (item: string) => string): Map<string, string> {
  const seen = new Map<string, string>()
  for (const item of items) {
    const k = key(item)
    if (!seen.has(k)) seen.set(k, item)
  }
  return seen
}

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })

export function compareLists(textA: string, textB: string, options: ListOptions): ListComparison {
  const key = options.ignoreCase ? (item: string) => item.toLowerCase() : (item: string) => item
  const itemsA = parseList(textA, options.separator)
  const itemsB = parseList(textB, options.separator)
  const a = distinct(itemsA, key)
  const b = distinct(itemsB, key)

  const onlyA: string[] = []
  const both: string[] = []
  for (const [k, item] of a) (b.has(k) ? both : onlyA).push(item)
  const onlyB = [...b].filter(([k]) => !a.has(k)).map(([, item]) => item)

  if (options.sort) [onlyA, onlyB, both].forEach((list) => list.sort(collator.compare))

  return {
    onlyA,
    onlyB,
    both,
    a: { total: itemsA.length, distinct: a.size },
    b: { total: itemsB.length, distinct: b.size },
  }
}
