import { Result } from '../../shared/Result'

export interface DogmaticRule {
  name: string
  description: string
  validate(prompt: string): boolean
}

export class DogmaticValidator {
  private readonly rules: DogmaticRule[] = [
    {
      name: 'pii_scanner_enabled',
      description: 'PII Scanner must never be disabled',
      validate: (p: string) => {
        const violations = [
          /desativar|desabilitar|ignorar|pular.*(pii|scanner|protecao|dados)/i,
          /disable|ignore|skip.*(pii|scanner|protection|data)/i,
          /nao.*(proteger|criptografar|ofuscar|escannear)/i,
          /dont.*(protect|encrypt|obfuscate|scan)/i,
        ]
        return !violations.some(v => v.test(p))
      },
    },
    {
      name: 'sanitization_enabled',
      description: 'Prompt sanitization must never be disabled',
      validate: (p: string) => {
        const violations = [
          /desativ[ea]r?|desabilit[ea]r?|ignorar.*(sanitizac|filtro|injecao)/i,
          /disable|ignore.*(sanitiz|filter|injection)/i,
        ]
        return !violations.some(v => v.test(p))
      },
    },
    {
      name: 'system_prompt_protected',
      description: 'System prompt must not be leaked or overridden',
      validate: (p: string) => {
        const violations = [
          /ignore.*(previous|acima|anterior|system|sistema)/i,
          /esque[cç]a.*(instru[cç][ão]|comando|regra)/i,
          /forget.*(instruction|rule|command)/i,
          /you are now|agora voce e|você é agora/i,
          /override.*(system|sistema|prompt)/i,
        ]
        return !violations.some(v => v.test(p))
      },
    },
    {
      name: 'output_validation_enabled',
      description: 'Output validation must never be disabled',
      validate: (p: string) => {
        const violations = [
          /desativar|desabilitar|ignorar.*(output|saida|validac)/i,
          /disable|ignore.*(output|validator|validation)/i,
        ]
        return !violations.some(v => v.test(p))
      },
    },
    {
      name: 'no_tenant_escalation',
      description: 'Must not request data from other tenants',
      validate: (p: string) => {
        const violations = [
          /dados?.*(outr[oa]|tenant|pousada|hote[l])/i,
          /data.*(other|tenant|hotel)/i,
          /acede?.*(admin|super|master|root)/i,
          /access.*(admin|super|master|root)/i,
        ]
        return !violations.some(v => v.test(p))
      },
    },
    {
      name: 'no_code_execution',
      description: 'Must not contain code execution commands',
      validate: (p: string) => {
        const violations = [
          /executa?r?|execute|eval|system\(|child_process/i,
          /require\(|import.*fs|import.*child/i,
        ]
        return !violations.some(v => v.test(p))
      },
    },
    {
      name: 'semantic_coherence',
      description: 'Prompt must have minimum semantic quality',
      validate: (p: string) => {
        if (p.length < 10) return false
        const words = p.trim().split(/\s+/).filter(w => w.length > 0)
        if (words.length < 3) return false
        return true
      },
    },
  ]

  validate(prompt: string): Result<{ valid: boolean; violations: string[] }> {
    const violations: string[] = []
    for (const rule of this.rules) {
      if (!rule.validate(prompt)) {
        violations.push(`${rule.name}: ${rule.description}`)
      }
    }
    return Result.ok({ valid: violations.length === 0, violations })
  }

  getRules(): DogmaticRule[] {
    return [...this.rules]
  }
}
