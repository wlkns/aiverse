/**
 * A small text diff engine: Myers' O(ND) shortest edit script, run over lines
 * and then over the words (or characters) of each changed line.
 *
 * Lines only in the original are "removed", lines only in the changed text are
 * "added", and a removed line directly replaced by an added one is "changed",
 * with the parts that differ inside it marked as removed/added segments.
 */

export type DiffGranularity = 'words' | 'characters'

export interface DiffOptions {
  /** How finely to highlight differences inside a changed line. */
  granularity: DiffGranularity
  ignoreCase: boolean
  /** Treat runs of whitespace as equal, and ignore it at the ends of lines. */
  ignoreWhitespace: boolean
}

export type SegmentType = 'equal' | 'removed' | 'added'

export interface Segment {
  type: SegmentType
  text: string
}

export type RowType = 'equal' | 'removed' | 'added' | 'changed'

export interface DiffRow {
  type: RowType
  /** 1-based line numbers; null on the side the line doesn't exist. */
  aLine: number | null
  bLine: number | null
  /** The original line (equal and removed segments); null for added rows. */
  a: Segment[] | null
  /** The changed line (equal and added segments); null for removed rows. */
  b: Segment[] | null
  /** Both sides interleaved, for an inline view. */
  inline: Segment[]
}

export interface DiffStats {
  added: number
  removed: number
  changed: number
}

export interface DiffResult {
  rows: DiffRow[]
  stats: DiffStats
  identical: boolean
}

// Beyond this edit distance the remaining middle is treated as replaced
// wholesale, which keeps time and memory bounded for very different inputs.
const MAX_EDIT_DISTANCE = 2000

const Edit = {
  Equal: 0,
  Delete: 1,
  Insert: 2,
} as const
type Edit = (typeof Edit)[keyof typeof Edit]

interface Chunk {
  type: Edit
  aStart: number
  aEnd: number
  bStart: number
  bEnd: number
}

/** Myers' shortest edit script between two sequences of interned tokens. */
function myers(a: Int32Array, b: Int32Array): Edit[] | null {
  const n = a.length
  const m = b.length
  const max = Math.min(n + m, MAX_EDIT_DISTANCE)
  const offset = max + 1
  const v = new Int32Array(2 * max + 3)
  // trace[d] holds v[k] for k in [-d, d] after step d.
  const trace: Int32Array[] = []

  for (let d = 0; d <= max; d++) {
    for (let k = -d; k <= d; k += 2) {
      let x =
        k === -d || (k !== d && v[offset + k - 1]! < v[offset + k + 1]!)
          ? v[offset + k + 1]!
          : v[offset + k - 1]! + 1
      let y = x - k
      while (x < n && y < m && a[x] === b[y]) {
        x++
        y++
      }
      v[offset + k] = x

      if (x >= n && y >= m) {
        trace.push(v.slice(offset - d, offset + d + 1))
        return backtrack(trace, n, m)
      }
    }
    trace.push(v.slice(offset - d, offset + d + 1))
  }
  return null
}

function backtrack(trace: Int32Array[], n: number, m: number): Edit[] {
  const edits: Edit[] = []
  let x = n
  let y = m

  for (let d = trace.length - 1; d > 0; d--) {
    const prev = trace[d - 1]!
    const at = (k: number) => prev[k + d - 1]!
    const k = x - y
    const down = k === -d || (k !== d && at(k - 1) < at(k + 1))
    const prevK = down ? k + 1 : k - 1
    const prevX = at(prevK)
    const prevY = prevX - prevK

    while (x > prevX && y > prevY) {
      edits.push(Edit.Equal)
      x--
      y--
    }
    if (down) {
      edits.push(Edit.Insert)
      y--
    } else {
      edits.push(Edit.Delete)
      x--
    }
  }
  while (x > 0 && y > 0) {
    edits.push(Edit.Equal)
    x--
    y--
  }
  return edits.reverse()
}

/** Diff two key sequences into runs of equal, deleted and inserted items. */
function diffKeys(aKeys: readonly string[], bKeys: readonly string[]): Chunk[] {
  const ids = new Map<string, number>()
  const intern = (keys: readonly string[]) =>
    Int32Array.from(keys, (key) => {
      let id = ids.get(key)
      if (id === undefined) ids.set(key, (id = ids.size))
      return id
    })
  const a = intern(aKeys)
  const b = intern(bKeys)

  // Matching ends are common and cheap to skip.
  let start = 0
  while (start < a.length && start < b.length && a[start] === b[start]) start++
  let endA = a.length
  let endB = b.length
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) {
    endA--
    endB--
  }

  const middleA = a.subarray(start, endA)
  const middleB = b.subarray(start, endB)
  const middle = myers(middleA, middleB) ?? [
    ...Array<Edit>(middleA.length).fill(Edit.Delete),
    ...Array<Edit>(middleB.length).fill(Edit.Insert),
  ]
  const edits = [
    ...Array<Edit>(start).fill(Edit.Equal),
    ...middle,
    ...Array<Edit>(a.length - endA).fill(Edit.Equal),
  ]

  const chunks: Chunk[] = []
  let ai = 0
  let bi = 0
  for (const edit of edits) {
    let last = chunks.at(-1)
    if (!last || last.type !== edit) {
      last = { type: edit, aStart: ai, aEnd: ai, bStart: bi, bEnd: bi }
      chunks.push(last)
    }
    if (edit !== Edit.Insert) last.aEnd = ++ai
    if (edit !== Edit.Delete) last.bEnd = ++bi
  }
  return chunks
}

// ---------- Tokenising ----------

const splitLines = (text: string) => (text === '' ? [] : text.split(/\r\n|\r|\n/))

// Words (with inner apostrophes), whitespace runs, or single other characters.
const WORD_PATTERN = /[\p{L}\p{N}_]+(?:['’][\p{L}\p{N}_]+)*|\s+|[^\s\p{L}\p{N}_]/gu

function tokenise(line: string, granularity: DiffGranularity): string[] {
  return granularity === 'words' ? (line.match(WORD_PATTERN) ?? []) : Array.from(line)
}

function lineKey(line: string, options: DiffOptions): string {
  let key = options.ignoreWhitespace ? line.replace(/\s+/g, ' ').trim() : line
  if (options.ignoreCase) key = key.toLowerCase()
  return key
}

function tokenKey(token: string, options: DiffOptions): string {
  if (options.ignoreWhitespace && /^\s+$/.test(token)) return ' '
  return options.ignoreCase ? token.toLowerCase() : token
}

// ---------- Rows ----------

function pushSegment(segments: Segment[], type: SegmentType, text: string) {
  if (!text) return
  const last = segments.at(-1)
  if (last?.type === type) last.text += text
  else segments.push({ type, text })
}

/** Word/character diff of one line replaced by another. */
function diffLine(
  aText: string,
  bText: string,
  options: DiffOptions,
): Pick<DiffRow, 'a' | 'b' | 'inline'> {
  const aTokens = tokenise(aText, options.granularity)
  const bTokens = tokenise(bText, options.granularity)
  const chunks = diffKeys(
    aTokens.map((token) => tokenKey(token, options)),
    bTokens.map((token) => tokenKey(token, options)),
  )

  const a: Segment[] = []
  const b: Segment[] = []
  const inline: Segment[] = []
  let pendingRemoved = ''
  let pendingAdded = ''
  const flush = () => {
    pushSegment(inline, 'removed', pendingRemoved)
    pushSegment(inline, 'added', pendingAdded)
    pendingRemoved = pendingAdded = ''
  }

  chunks.forEach((chunk, i) => {
    const removed = aTokens.slice(chunk.aStart, chunk.aEnd).join('')
    const added = bTokens.slice(chunk.bStart, chunk.bEnd).join('')

    // A lone space between two changes reads better as part of the change:
    // "~~the cat~~ a dog" rather than "~~the~~ a ~~cat~~ dog".
    const isGap =
      chunk.type === Edit.Equal &&
      i > 0 &&
      i < chunks.length - 1 &&
      /^\s+$/.test(removed) &&
      /^\s+$/.test(added)

    if (chunk.type === Edit.Equal && !isGap) {
      flush()
      pushSegment(a, 'equal', removed)
      pushSegment(b, 'equal', added)
      pushSegment(inline, 'equal', added)
      return
    }
    pushSegment(a, 'removed', removed)
    pushSegment(b, 'added', added)
    pendingRemoved += removed
    pendingAdded += added
  })
  flush()

  return { a, b, inline }
}

/** Compare two texts line by line, then within each changed line. */
export function diffText(original: string, changed: string, options: DiffOptions): DiffResult {
  const aLines = splitLines(original)
  const bLines = splitLines(changed)
  const chunks = diffKeys(
    aLines.map((line) => lineKey(line, options)),
    bLines.map((line) => lineKey(line, options)),
  )

  const rows: DiffRow[] = []
  const stats: DiffStats = { added: 0, removed: 0, changed: 0 }

  const removedRow = (i: number): DiffRow => {
    const segments = [{ type: 'removed' as const, text: aLines[i]! }]
    return { type: 'removed', aLine: i + 1, bLine: null, a: segments, b: null, inline: segments }
  }
  const addedRow = (j: number): DiffRow => {
    const segments = [{ type: 'added' as const, text: bLines[j]! }]
    return { type: 'added', aLine: null, bLine: j + 1, a: null, b: segments, inline: segments }
  }

  for (let c = 0; c < chunks.length; c++) {
    const chunk = chunks[c]!

    if (chunk.type === Edit.Equal) {
      for (let i = chunk.aStart, j = chunk.bStart; i < chunk.aEnd; i++, j++) {
        const segments = [{ type: 'equal' as const, text: bLines[j]! }]
        rows.push({
          type: 'equal',
          aLine: i + 1,
          bLine: j + 1,
          a: [{ type: 'equal', text: aLines[i]! }],
          b: segments,
          inline: segments,
        })
      }
      continue
    }

    // A deletion followed by an insertion is a replacement: pair the lines up
    // in order as "changed", and any left over are plain removals/additions.
    const deleted = chunk.type === Edit.Delete ? chunk : null
    const next = chunks[c + 1]
    const inserted =
      chunk.type === Edit.Insert ? chunk : next?.type === Edit.Insert ? (c++, next) : null

    const removedCount = deleted ? deleted.aEnd - deleted.aStart : 0
    const addedCount = inserted ? inserted.bEnd - inserted.bStart : 0
    const pairs = Math.min(removedCount, addedCount)

    for (let p = 0; p < pairs; p++) {
      const i = deleted!.aStart + p
      const j = inserted!.bStart + p
      rows.push({
        type: 'changed',
        aLine: i + 1,
        bLine: j + 1,
        ...diffLine(aLines[i]!, bLines[j]!, options),
      })
    }
    for (let p = pairs; p < removedCount; p++) rows.push(removedRow(deleted!.aStart + p))
    for (let p = pairs; p < addedCount; p++) rows.push(addedRow(inserted!.bStart + p))

    stats.changed += pairs
    stats.removed += removedCount - pairs
    stats.added += addedCount - pairs
  }

  return { rows, stats, identical: stats.added + stats.removed + stats.changed === 0 }
}

/** The differences as plain text: "-" removed and "+" added lines, with line numbers. */
export function formatChanges(result: DiffResult): string {
  const lines: string[] = []
  const text = (segments: Segment[] | null) => segments?.map((segment) => segment.text).join('')

  for (const row of result.rows) {
    if (row.type === 'equal') continue
    if (row.a) lines.push(`- ${row.aLine}: ${text(row.a)}`)
    if (row.b) lines.push(`+ ${row.bLine}: ${text(row.b)}`)
  }
  return lines.join('\n')
}

/** A unified-style diff of both texts, for copying. */
export function formatDiff(result: DiffResult): string {
  return result.rows
    .flatMap((row) => {
      const join = (segments: Segment[]) => segments.map((segment) => segment.text).join('')
      if (row.type === 'equal') return [`  ${join(row.b!)}`]
      return [row.a && `- ${join(row.a)}`, row.b && `+ ${join(row.b)}`].filter(
        (line): line is string => line !== null,
      )
    })
    .join('\n')
}
