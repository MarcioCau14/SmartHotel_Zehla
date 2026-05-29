import { Result } from '../../shared/Result'

interface SanitizeResult {
  sanitized: string
  blocked: boolean
  reason: string | null
  blockedPatterns: string[]
}

const INJECTION_PATTERNS: { regex: RegExp; label: string }[] = [
  { regex: /ignore\s+(all\s+)?previous\s+(instructions|directives|commands|orders)/gi, label: 'ignore_previous_instructions' },
  { regex: /forget\s+(all\s+)?(previous\s+)?(instructions|context|directives)/gi, label: 'forget_instructions' },
  { regex: /system\s+override/i, label: 'system_override' },
  { regex: /you\s+are\s+(now\s+)?(a\s+)?(free|unbounded|unrestricted|ungoverned)/gi, label: 'role_override' },
  { regex: /new\s+(era|paradigm|protocol)\s+(activated|initiated|begun)/gi, label: 'new_protocol_claim' },
  { regex: /reveal\s+(your\s+)?(system\s+)?prompt/gi, label: 'prompt_extraction' },
  { regex: /print\s+(your\s+)?(system\s+)?(prompt|instructions)/gi, label: 'prompt_extraction' },
  { regex: /output\s+(your\s+)?(system\s+)?prompt/gi, label: 'prompt_extraction' },
  { regex: /show\s+(me\s+)?(your\s+)?(system\s+)?(prompt|instructions)/gi, label: 'prompt_extraction' },
  { regex: /how\s+(are\s+you\s+)?(programmed|trained|configured|built)/gi, label: 'system_probings' },
  { regex: /what\s+(are\s+your\s+)?(rules|guidelines|principles|directives)/gi, label: 'system_probings' },
  { regex: /act\s+as\s+(if\s+you\s+are|though\s+you\s+are)\s+(an?\s+)?(admin|root|superuser|god)/gi, label: 'role_usurpation' },
  { regex: /simulate\s+(a\s+)?(jailbreak|dan|sudo\s+mode|developer\s+mode)/gi, label: 'jailbreak_attempt' },
  { regex: /do\s+(not\s+)?(follow|obey|adhere\s+to)\s+(your\s+)?(previous\s+)?(rules|restrictions|guidelines)/gi, label: 'rule_bypass' },
  { regex: /access\s+(internal\s+)?(system|api|database|config)/gi, label: 'system_access_attempt' },
  { regex: /read\s+(internal\s+)?(files|environment|config|variables)/gi, label: 'system_access_attempt' },
  { regex: /execute\s+(shell|command|system|code|script)/gi, label: 'code_execution_attempt' },
  { regex: /run\s+(a\s+)?(shell|command|script|python|bash)/gi, label: 'code_execution_attempt' },
]

const BLOCKLIST_WORDS = [
  'jailbreak',
  'dan_mode',
  'sudo_mode',
  'developer_mode',
  'prompt_injection',
  'ignore_all_rules',
]

export class PromptSanitizer {
  static sanitize(input: string, strict: boolean = false): SanitizeResult {
    const blockedPatterns: string[] = []

    for (const { regex, label } of INJECTION_PATTERNS) {
      if (regex.test(input)) {
        blockedPatterns.push(label)
      }
    }

    for (const word of BLOCKLIST_WORDS) {
      const wordRegex = new RegExp(`\\b${word}\\b`, 'gi')
      if (wordRegex.test(input)) {
        blockedPatterns.push(`blocklist_word:${word}`)
      }
    }

    const uniquePatterns = Array.from(new Set(blockedPatterns))

    if (strict && uniquePatterns.length > 0) {
      return {
        sanitized: input,
        blocked: true,
        reason: `Prompt blocked: detected ${uniquePatterns.length} injection pattern(s)`,
        blockedPatterns: uniquePatterns,
      }
    }

    let sanitized = input

    for (const { regex } of INJECTION_PATTERNS) {
      sanitized = sanitized.replace(regex, '[REDACTED_INJECTION_ATTEMPT]')
    }

    for (const word of BLOCKLIST_WORDS) {
      const wordRegex = new RegExp(`\\b${word}\\b`, 'gi')
      sanitized = sanitized.replace(wordRegex, '[REDACTED]')
    }

    return {
      sanitized,
      blocked: false,
      reason: uniquePatterns.length > 0
        ? `Sanitized ${uniquePatterns.length} injection pattern(s)`
        : null,
      blockedPatterns: uniquePatterns,
    }
  }

  static isMalicious(input: string): boolean {
    for (const { regex } of INJECTION_PATTERNS) {
      if (regex.test(input)) return true
    }
    for (const word of BLOCKLIST_WORDS) {
      const wordRegex = new RegExp(`\\b${word}\\b`, 'gi')
      if (wordRegex.test(input)) return true
    }
    return false
  }

  static validate(input: string): Result<string> {
    const check = PromptSanitizer.sanitize(input, true)
    if (check.blocked) {
      return Result.fail(new Error(check.reason!))
    }
    return Result.ok(check.sanitized)
  }
}
