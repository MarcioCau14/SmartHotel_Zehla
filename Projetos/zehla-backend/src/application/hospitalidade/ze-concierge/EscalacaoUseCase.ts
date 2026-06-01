import { Result } from '../../../domain/shared/Result'
import { PIIScanner } from '../../../domain/security/services/PIIScanner'
import { PromptSanitizer } from '../../../domain/security/services/PromptSanitizer'
import { ThreatHunter } from '../../../domain/security/services/ThreatHunter'
import { DogmaticValidator } from '../../../domain/evolution/services/DogmaticValidator'
import type { IHmacVerifierPort } from '../../hardening/ports/IHmacVerifierPort'
import type { EscalacaoInput, EscalacaoPackage } from './ZeConciergeTypes'

function generateId(): string {
  return `zcp-esc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export class EscalacaoUseCase {
  constructor(
    private readonly zcpSigner: IHmacVerifierPort,
    private readonly zcpSecret: string,
    private readonly dogmaticValidator: DogmaticValidator = new DogmaticValidator(),
  ) {}

  execute(input: EscalacaoInput): Result<EscalacaoPackage, Error> {
    if (!input.comentario) {
      return Result.fail(new Error('Comentário vazio não pode ser escalado.'))
    }

    const rawFeedback = input.comentario

    try {
      const threatReport = ThreatHunter.scan(rawFeedback)

      const { tokenized: textoSemPII, map: tokenMap } = PIIScanner.tokenize(rawFeedback)

      const sanitizeResult = PromptSanitizer.sanitize(textoSemPII, true)

      const dogmaticResult = this.dogmaticValidator.validate(sanitizeResult.sanitized)

      const pkg: Omit<EscalacaoPackage, 'zcpSignature' | 'zcpSignedAt'> = {
        packageId: generateId(),
        timestamp: new Date().toISOString(),
        origem: 'ze-concierge',
        destino: 'ze-host',
        bookingId: input.bookingId,
        guestId: input.guestId,
        notaGeral: input.notaGeral,
        comentarioSanitizado: sanitizeResult.sanitized,
        piiTokenizado: tokenMap.length > 0,
        padroesBloqueados: sanitizeResult.blockedPatterns,
        violacoesDogmaticas: dogmaticResult.value.violations,
        piiEncontrado: tokenMap.length,
        threatDetected: threatReport.threatDetected,
        canaryTriggersFound: threatReport.triggersFound,
      }

      const payloadStr = JSON.stringify(pkg)
      const signature = this.zcpSigner.sign(payloadStr, this.zcpSecret)

      return Result.ok({
        ...pkg,
        zcpSignature: signature,
        zcpSignedAt: new Date().toISOString(),
      })
    } finally {
      (input as any).comentario = undefined
    }
  }
}
