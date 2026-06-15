import { Result } from '@/shared/Result'

export class ConflictShieldService {
  // Lista padrão de segurança com termos vitais de conversão para pousadas e hotéis
  private static readonly CRITICAL_CONVERTING_TERMS = [
    'pousada',
    'hotel',
    'reserva',
    'diaria',
    'hospedagem',
    'praia do rosa',
    'imbituba',
    'chale',
    'suite',
    'tarifa',
    'promocao',
    'zehla',
    'smarthotel',
  ]

  constructor(private readonly adsClient?: any) {}

  /**
   * Valida se a palavra-chave negativa proposta colide com termos de alta conversão.
   */
  public async validateNegativeKeyword(campaignId: string, keyword: string): Promise<Result<void, Error>> {
    const normalizedKeyword = keyword.toLowerCase().trim()

    try {
      let convertingTerms: string[] = [...ConflictShieldService.CRITICAL_CONVERTING_TERMS]

      if (this.adsClient && typeof this.adsClient.getTopConvertingTerms === 'function') {
        const adsTermsResult = await this.adsClient.getTopConvertingTerms(campaignId, 90)
        if (adsTermsResult.isOk) {
          convertingTerms = Array.from(new Set([...convertingTerms, ...adsTermsResult.value]))
        }
      }

      const conflict = convertingTerms.some(term => {
        const normalizedTerm = term.toLowerCase().trim()
        return (
          normalizedKeyword === normalizedTerm ||
          normalizedTerm.includes(normalizedKeyword) ||
          normalizedKeyword.includes(normalizedTerm)
        )
      })

      if (conflict) {
        return Result.fail<void, Error>(
          new Error('NEGATIVE_KEYWORDS_CONFLICT: O termo proposto para exclusão colide com termos de alta conversão histórica.')
        )
      }

      return Result.ok<void, Error>(undefined)
    } catch (error: any) {
      return Result.fail<void, Error>(error)
    }
  }
}
