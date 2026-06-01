import { Result } from '../../shared/Result'

type PiiType = 'cpf' | 'email' | 'phone' | 'credit_card'

interface PiiMatch {
  type: PiiType
  value: string
  start: number
  end: number
}

interface TokenMap {
  token: string
  original: string
  type: PiiType
}

const CPF_REGEX = /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b|\b\d{11}\b/g
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g
const PHONE_REGEX = /\b(?:\+?55)?\s?\(?\d{2}\)?\s?\d{4,5}-?\d{4}\b/g
const CREDIT_CARD_REGEX = /\b(?:\d{4}[-\s]?){3}\d{4}\b/g

const PII_PATTERNS: { type: PiiType; regex: RegExp }[] = [
  { type: 'cpf', regex: CPF_REGEX },
  { type: 'email', regex: EMAIL_REGEX },
  { type: 'phone', regex: PHONE_REGEX },
  { type: 'credit_card', regex: CREDIT_CARD_REGEX },
]

const PII_TOKEN_REGEX = /\[(CPF|EMAIL|PHONE|CARD)_TOKEN_[A-Z0-9]+\]/g

function generateToken(type: PiiType, value: string): string {
  const prefix = type === 'credit_card' ? 'CARD' : type.toUpperCase()
  const hash = hashShort(value)
  return `[${prefix}_TOKEN_${hash}]`
}

function hashShort(input: string): string {
  let hash = 5381
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash + input.charCodeAt(i)) & 0xffffffff
  }
  return Math.abs(hash).toString(36).toUpperCase().slice(0, 6)
}

export class PIIScanner {
  static scan(input: string): PiiMatch[] {
    const matches: PiiMatch[] = []
    const seen = new Set<string>()

    for (const { type, regex } of PII_PATTERNS) {
      regex.lastIndex = 0
      let match: RegExpExecArray | null
      while ((match = regex.exec(input)) !== null) {
        const value = match[0]
        if (!seen.has(value)) {
          seen.add(value)
          matches.push({
            type,
            value,
            start: match.index,
            end: match.index + value.length,
          })
        }
      }
    }

    return matches.sort((a, b) => a.start - b.start)
  }

  static tokenize(input: string): { tokenized: string; map: TokenMap[] } {
    const matches = PIIScanner.scan(input)
    const map: TokenMap[] = []
    let result = input

    for (const match of matches) {
      const token = generateToken(match.type, match.value)
      result = result.replace(match.value, token)
      map.push({ token, original: match.value, type: match.type })
    }

    return { tokenized: result, map }
  }

  static detokenize(tokenized: string, map: TokenMap[]): string {
    let result = tokenized
    for (const entry of map) {
      result = result.replace(entry.token, entry.original)
    }
    return result
  }

  static isInTokenizedForm(input: string): boolean {
    PII_TOKEN_REGEX.lastIndex = 0
    return PII_TOKEN_REGEX.test(input)
  }

  static validateNoPiiLeak(input: string): Result<void> {
    const matches = PIIScanner.scan(input)
    if (matches.length > 0) {
      const types = Array.from(new Set(matches.map(m => m.type)))
      return Result.fail(new Error(`PII leak detected: ${types.join(', ')}`))
    }
    return Result.ok(undefined)
  }
}
