/**
 * Find every number in a block of text and add them up. Understands thousands
 * separators, decimals, minus signs and currencies before or after the number
 * ("£1,200.50", "-$20", "15 EUR").
 */

/** Which character marks decimals: 1,234.56 ("point") or 1.234,56 ("comma"). */
export type DecimalSeparator = 'point' | 'comma'

export interface FoundNumber {
  /** As written, e.g. "-£1,200.50". */
  text: string
  value: number
  currency: string | null
  decimals: number
}

export interface CurrencyTotal {
  currency: string | null
  total: number
  count: number
}

export interface SumResult {
  numbers: FoundNumber[]
  total: number
  /** The most decimal places used by any number, for displaying totals. */
  decimals: number
  /** One entry per currency, in order of first appearance. */
  byCurrency: CurrencyTotal[]
}

const CURRENCY_CODES = [
  'USD',
  'EUR',
  'GBP',
  'JPY',
  'CNY',
  'INR',
  'CAD',
  'AUD',
  'NZD',
  'CHF',
  'SEK',
  'NOK',
  'DKK',
  'PLN',
  'ZAR',
  'HKD',
  'SGD',
  'BRL',
  'MXN',
]

const MINUS = '[-−]'
const CURRENCY = `\\p{Sc}|(?:${CURRENCY_CODES.join('|')})(?!\\p{L})`

function numberPattern(separator: DecimalSeparator): RegExp {
  const [group, decimal] = separator === 'point' ? [',', '\\.'] : ['\\.', ',']
  const number = [
    `\\d{1,3}(?:${group}\\d{3})+(?:${decimal}\\d+)?(?!\\d)`, // 1,234,567.89
    `\\d+(?:${decimal}\\d+)?`, // 1234.5
    `${decimal}\\d+`, // .5
  ].join('|')

  return new RegExp(
    // Not part of a word or code ("A4", "v2", "COVID-19"). After a number a
    // hyphen is a range ("10-20"), so the second number isn't negative.
    `(?<![\\p{L}\\p{N}_]|\\p{L}${MINUS})` +
      `(?<sign>${MINUS})?` +
      `(?:(?<before>${CURRENCY})\\s?)?` +
      `(?<sign2>${MINUS})?` +
      `(?<number>${number})` +
      `(?:\\s?(?<after>${CURRENCY}))?`,
    'gu',
  )
}

export function sumNumbers(text: string, separator: DecimalSeparator): SumResult {
  const numbers: FoundNumber[] = []
  const [group, decimal] = separator === 'point' ? [',', '.'] : ['.', ',']

  for (const match of text.matchAll(numberPattern(separator))) {
    const { sign, before, sign2, number, after } = match.groups!
    const [whole = '', fraction = ''] = number!.split(decimal)
    const magnitude = Number(`${whole.replaceAll(group, '') || '0'}.${fraction || '0'}`)
    numbers.push({
      text: match[0],
      value: sign || sign2 ? -magnitude : magnitude,
      currency: before ?? after ?? null,
      decimals: fraction.length,
    })
  }

  const decimals = Math.min(10, Math.max(0, ...numbers.map((n) => n.decimals)))
  const round = (value: number) => Math.round(value * 10 ** decimals) / 10 ** decimals

  const byCurrency = new Map<string | null, CurrencyTotal>()
  for (const n of numbers) {
    const entry = byCurrency.get(n.currency) ?? { currency: n.currency, total: 0, count: 0 }
    entry.total += n.value
    entry.count++
    byCurrency.set(n.currency, entry)
  }

  return {
    numbers,
    total: round(numbers.reduce((sum, n) => sum + n.value, 0)),
    decimals,
    byCurrency: [...byCurrency.values()].map((entry) => ({ ...entry, total: round(entry.total) })),
  }
}

/** Format a value in the chosen style, with a currency symbol or code if given. */
export function formatAmount(
  value: number,
  options: { separator: DecimalSeparator; decimals: number; currency?: string | null },
): string {
  const formatted = new Intl.NumberFormat(options.separator === 'point' ? 'en-GB' : 'de-DE', {
    minimumFractionDigits: options.decimals,
    maximumFractionDigits: options.decimals,
  }).format(Math.abs(value))
  const sign = value < 0 ? '-' : ''
  const { currency } = options
  if (!currency) return `${sign}${formatted}`
  return /^\p{Sc}$/u.test(currency)
    ? `${sign}${currency}${formatted}`
    : `${sign}${formatted} ${currency}`
}
