import { Result } from '../../shared/Result'
import { PIIScanner } from './PIIScanner'

interface ValidationResult {
  isSafe: boolean
  issues: string[]
}

const UNSAFE_PATTERNS: { regex: RegExp; label: string }[] = [
  { regex: /(?:I'm|I\s+am)\s+(?:sorry,\s+)?(?:but\s+)?I\s+(?:cannot|cannot|won't|will\s+not)\s+(?:comply|respond|answer|assist)/gi, label: 'llm_refusal_leak' },
  { regex: /(?:as\s+an?\s+)?(?:AI|language\s+model|assistant)/gi, label: 'ai_identity_leak' },
  { regex: /I\s+(?:don't|do\s+not)\s+(?:have\s+access|know\s+that)/gi, label: 'capability_leak' },
  { regex: /(?:due\s+to|because\s+of)\s+(?:my\s+)?(?:safety|ethical|policy|guidelines)/gi, label: 'policy_leak' },
]

export class OutputValidator {
  static validate(output: string): ValidationResult {
    const issues: string[] = []

    const piiCheck = PIIScanner.validateNoPiiLeak(output)
    if (piiCheck.isFail) {
      issues.push(piiCheck.error.message)
    }

    for (const { regex, label } of UNSAFE_PATTERNS) {
      if (regex.test(output)) {
        issues.push(`Unsafe pattern detected: ${label}`)
      }
    }

    if (output.length < 2) {
      issues.push('Output is too short')
    }

    return {
      isSafe: issues.length === 0,
      issues,
    }
  }

  static assertSafe(output: string): Result<string> {
    const validation = OutputValidator.validate(output)
    if (!validation.isSafe) {
      return Result.fail(new Error(`Output validation failed: ${validation.issues.join('; ')}`))
    }
    return Result.ok(output)
  }
}
