import { Worker, Job } from 'bullmq'
import { redisWorker } from '../../lib/redis'
import { IMessagingGateway } from '../../application/marketing/ports/IMessagingGateway'
import { sendWhatsAppAlert } from '../../lib/notifications'

interface BatchRecipient {
  id: string
  name: string
  phone: string
  language: string
}

interface BatchJobData {
  campaignId: string
  propertyId: string
  templateId: string
  templateVariables: Record<string, string>
  batchIndex: number
  totalBatches: number
  recipients: BatchRecipient[]
  sendWindowStart: string
  sendWindowEnd: string
  timezone: string
  baseDelayMs: number
}

export class CampaignOutboundWorker {
  private worker: Worker

  constructor(private messagingGateway: IMessagingGateway) {
    this.worker = new Worker<BatchJobData>(
      'campaign-outbound',
      async (job: Job<BatchJobData>) => {
        const { campaignId, batchIndex, totalBatches, recipients, templateId, templateVariables } = job.data

        console.log(`[CampaignWorker] Campaign ${campaignId} | Batch ${batchIndex + 1}/${totalBatches} | ${recipients.length} recipients`)

        const results: Array<{ recipientId: string; status: string; messageId?: string; error?: string }> = []

        for (const recipient of recipients) {
          try {
            const personalizedVars: Record<string, string> = {}
            for (const [key, value] of Object.entries(templateVariables)) {
              personalizedVars[key] = value
                .replace('{{nome}}', recipient.name)
                .replace('{{id}}', recipient.id)
            }

            const result = await this.messagingGateway.sendTemplate(
              recipient.phone,
              templateId,
              personalizedVars,
            )

            if (result.isOk) {
              results.push({ recipientId: recipient.id, status: 'sent', messageId: result.value.messageId })
            } else {
              results.push({ recipientId: recipient.id, status: 'failed', error: result.error.message })
            }
          } catch (error) {
            const msg = error instanceof Error ? error.message : 'Unknown error'
            results.push({ recipientId: recipient.id, status: 'failed', error: msg })
          }
        }

        const failed = results.filter(r => r.status === 'failed')
        if (failed.length > 0) {
          console.error(`[CampaignWorker] Batch ${batchIndex + 1}: ${failed.length}/${recipients.length} failed`)
          if (failed.length === recipients.length) {
            throw new Error(`Batch ${batchIndex + 1} completo falhou. ${failed[0].error}`)
          }
        }

        console.log(`[CampaignWorker] Batch ${batchIndex + 1}/${totalBatches} concluído: ${results.length - failed.length} enviados, ${failed.length} falhas`)

        return { results, campaignId, batchIndex }
      },
      {
        connection: redisWorker,
        concurrency: 5,
        lockDuration: 120000,
        maxStalledCount: 3,
      },
    )

    this.worker.on('failed', (job: Job<BatchJobData> | undefined, error: Error) => {
      if (!job) return
      const msg = `[CampaignWorker] Job ${job.id} (campaign ${job.data.campaignId}, batch ${job.data.batchIndex}) falhou definitivamente: ${error.message}`
      console.error(msg)
      sendWhatsAppAlert(`⚠️ *CampaignWorker DLQ*\nCampanha: ${job.data.campaignId}\nBatch: ${job.data.batchIndex + 1}/${job.data.totalBatches}\nErro: ${error.message}\nPropriedade: ${job.data.propertyId}`).catch(() => {})
    })

    this.worker.on('completed', (job: Job<BatchJobData>) => {
      console.log(`[CampaignWorker] Job ${job.id} concluído com sucesso`)
    })
  }

  getWorker(): Worker {
    return this.worker
  }

  async close(): Promise<void> {
    await this.worker.close()
  }
}
