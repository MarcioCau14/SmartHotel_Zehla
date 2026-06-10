import { Result } from '../../domain/shared/Result'
import { IMessagingGateway, MessageDeliveryStatus } from '../../application/marketing/ports/IMessagingGateway'
import { EvolutionWhatsAppAdapter } from '../external/evolution/EvolutionWhatsAppAdapter'

function stripPlus(phone: string): string {
  return phone.startsWith('+') ? phone.slice(1) : phone
}

export class EvolutionApiMessagingGateway implements IMessagingGateway {
  private adapter: EvolutionWhatsAppAdapter

  constructor() {
    this.adapter = new EvolutionWhatsAppAdapter({
      baseUrl: process.env.EVOLUTION_API_URL || 'http://localhost:8080',
      apiKey: process.env.EVOLUTION_API_KEY || '',
      defaultInstance: process.env.EVOLUTION_INSTANCE || 'zehla',
    })
  }

  async sendTemplate(
    phone: string,
    templateId: string,
    variables: Record<string, string>,
  ): Promise<Result<MessageDeliveryStatus, Error>> {
    const messageBody = variables.message || variables.text || variables.body ||
      Object.values(variables).join('\n')
    return this.send(phone, messageBody)
  }

  async sendText(phone: string, text: string): Promise<Result<MessageDeliveryStatus, Error>> {
    return this.send(phone, text)
  }

  private async send(phone: string, text: string): Promise<Result<MessageDeliveryStatus, Error>> {
    try {
      const result = await this.adapter.sendText({
        to: stripPlus(phone),
        content: text,
        delay: 1200,
      })

      if (result.success) {
        return Result.ok({
          messageId: result.externalId || `msg_${Date.now()}`,
          recipientId: phone,
          status: 'sent',
          sentAt: new Date(),
        })
      }

      return Result.fail(new Error(result.error || 'Falha ao enviar mensagem'))
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao enviar mensagem via Evolution API'))
    }
  }

  async getDeliveryStatus(messageId: string): Promise<Result<MessageDeliveryStatus, Error>> {
    return Result.ok({
      messageId,
      recipientId: '',
      status: 'sent',
      sentAt: new Date(),
    })
  }
}
