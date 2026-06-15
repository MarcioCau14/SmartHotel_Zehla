import { Result } from '@/shared/Result'
import { prisma as globalPrisma } from '@/lib/prisma'
import { ConflictShieldService } from './ConflictShieldService'

export class GoogleAdsMcpClient {
  private readonly shadowMode: boolean
  private readonly prisma: any
  private readonly shieldService: ConflictShieldService

  constructor(options?: { shadowMode?: boolean; prismaInstance?: any }) {
    this.shadowMode = options?.shadowMode ?? (process.env.GOOGLE_ADS_SHADOW_MODE !== 'false')
    this.prisma = options?.prismaInstance ?? globalPrisma
    this.shieldService = new ConflictShieldService(this)
  }

  /**
   * Obtém os termos com maior conversão histórica nos últimos X dias.
   */
  public async getTopConvertingTerms(campaignId: string, days: number = 90): Promise<Result<string[], Error>> {
    try {
      // Termos representativos de conversão da pousada, simulando retorno do Google Ads
      const mockTerms = [
        'pousada na praia do rosa',
        'hotel em imbituba',
        'reserva pousada de charme',
        'diarias praia do rosa',
        'hospedagem pousada zehla',
      ]
      return Result.ok<string[], Error>(mockTerms)
    } catch (error: any) {
      return Result.fail<string[], Error>(error)
    }
  }

  /**
   * Propõe a adição de uma palavra-chave negativa.
   */
  public async addNegativeKeyword(
    campaignId: string,
    keyword: string,
    adGroupId?: string | null,
    reason?: string | null
  ): Promise<Result<{ proposalId?: string; appliedDirectly: boolean }, Error>> {
    try {
      // 1. Validar termos de conversão para evitar conflito
      const shieldResult = await this.shieldService.validateNegativeKeyword(campaignId, keyword)
      if (shieldResult.isFail) {
        return Result.fail<{ proposalId?: string; appliedDirectly: boolean }, Error>(shieldResult.error)
      }

      // 2. Se estiver em Shadow Mode, cria uma proposta no banco
      if (this.shadowMode) {
        const proposal = await this.prisma.adsChangeProposal.create({
          data: {
            actionType: 'ADD_NEGATIVE_KEYWORD',
            campaignId,
            adGroupId: adGroupId || null,
            keyword,
            reason: reason || 'Identificado automaticamente pelo Growth Engine',
            status: 'PENDING',
          },
        })

        return Result.ok<{ proposalId?: string; appliedDirectly: boolean }, Error>({
          proposalId: proposal.id,
          appliedDirectly: false,
        })
      }

      // 3. Caso contrário, simular aplicação direta (sucesso)
      console.log(`[GoogleAdsMcpClient] Aplicando palavra-chave negativa "${keyword}" diretamente no Google Ads`)
      return Result.ok<{ proposalId?: string; appliedDirectly: boolean }, Error>({
        appliedDirectly: true,
      })
    } catch (error: any) {
      return Result.fail<{ proposalId?: string; appliedDirectly: boolean }, Error>(error)
    }
  }
}
