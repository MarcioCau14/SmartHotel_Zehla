import { Result } from '../../../shared/Result'
import { InteractionRecord } from '../models/InteractionRecord'
import { QualityProxy } from '../../decision/services/QualityProxy'
import { AuditTranscriptOutput } from '../cognitive/AuditTranscriptSignature'

export interface AuditReportItem {
  readonly interactionId: string
  readonly leadId: string
  readonly canal: string
  readonly finalScore: number
  readonly passedQuality: boolean
  readonly violations: AuditTranscriptOutput | null
}

export interface AuditReport {
  readonly totalInteractions: number
  readonly flaggedCount: number
  readonly items: ReadonlyArray<AuditReportItem>
}

export type TranscriptAnalyzer = (transcript: string, sentimentScore: number) => AuditTranscriptOutput

export class AuditorAgentService {
  private readonly qualityProxy: QualityProxy

  constructor(
    private readonly analyzeTranscript: TranscriptAnalyzer,
    threshold: number = 0.7,
  ) {
    this.qualityProxy = new QualityProxy()
    this.threshold = threshold
    Object.freeze(this)
  }

  private readonly threshold: number

  execute(interactions: ReadonlyArray<InteractionRecord>): Result<AuditReport, Error> {
    if (!interactions || interactions.length === 0) {
      return Result.fail(new Error('Nenhuma interação para auditar'))
    }

    const items: AuditReportItem[] = []

    for (const interaction of interactions) {
      const text = interaction.resumo ?? ''
      const bucketId = this._resolveBucket(interaction.canal)

      const assessment = this.qualityProxy.assess(bucketId, text, '')

      const passedQuality = assessment.finalScore >= this.threshold

      let violations: AuditTranscriptOutput | null = null
      if (!passedQuality) {
        violations = this.analyzeTranscript(text, interaction.sentimentScore)
      }

      items.push({
        interactionId: interaction.id,
        leadId: interaction.leadId,
        canal: interaction.canal,
        finalScore: assessment.finalScore,
        passedQuality,
        violations,
      })
    }

    const flaggedCount = items.filter(i => !i.passedQuality).length

    return Result.ok({
      totalInteractions: interactions.length,
      flaggedCount,
      items: Object.freeze(items),
    })
  }

  private _resolveBucket(canal: string): string {
    if (/whatsapp|whats|wa|sms/i.test(canal)) return '00'
    if (/email/i.test(canal)) return '01'
    if (/instagram|social|reply|comment/i.test(canal)) return '05'
    if (/chat|web|site|forms/i.test(canal)) return '09'
    return '04'
  }
}
