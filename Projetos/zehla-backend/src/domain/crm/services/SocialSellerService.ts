import { Result } from '../../../shared/Result'
import { SocialInteraction } from '../models/SocialInteraction'
import { LeadProfile } from '../models/LeadProfile'
import { CRMPipelineStage, ICPersona } from '../models/CRMPipelineStage'
import { AnalyzeSocialOutput } from '../cognitive/AnalyzeSocialIntentSignature'

export type SocialIntentAnalyzer = (content: string) => AnalyzeSocialOutput

export class SocialSellerService {
  constructor(private readonly analyzeIntent: SocialIntentAnalyzer) {
    Object.freeze(this)
  }

  execute(interaction: SocialInteraction): Result<LeadProfile, Error> {
    const analysis = this.analyzeIntent(interaction.data.content)

    if (!analysis.hasBuyingIntent) {
      return Result.fail(new Error('Sem intenção comercial detectada'))
    }

    const leadId = `social_${interaction.data.platform}_${interaction.data.username}_${interaction.data.timestamp}`

    const ltvScore = this._calculateInitialScore(analysis.urgencyLevel)
    const tags = Object.freeze([
      'social',
      `platform_${interaction.data.platform}`,
      `urgency_${analysis.urgencyLevel}`,
      ...(analysis.extractedPhone ? ['phone_extracted'] : []),
    ])

    return LeadProfile.create({
      id: leadId,
      nome: interaction.data.username,
      telefone: analysis.extractedPhone ?? `social_${interaction.data.platform}_${interaction.data.username}`,
      canalOrigem: interaction.data.platform,
      ltvScore,
      stage: CRMPipelineStage.ENTRADA,
      createdAt: new Date(interaction.data.timestamp),
      propriedadeId: 'default',
      persona: ICPersona.DESCONHECIDO,
      tags,
      updatedAt: new Date(interaction.data.timestamp),
    })
  }

  private _calculateInitialScore(urgency: 'LOW' | 'MEDIUM' | 'HIGH'): number {
    switch (urgency) {
      case 'HIGH': return 60
      case 'MEDIUM': return 35
      case 'LOW': return 15
    }
  }
}
