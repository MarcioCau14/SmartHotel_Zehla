import { Result } from '../../../../src/domain/shared/Result'
import { IMessagingGateway, MessageDeliveryStatus } from '../../../../src/application/marketing/ports/IMessagingGateway'

export class FakeMessagingGateway implements IMessagingGateway {
  public sentMessages: Array<{ phone: string; templateId?: string; text?: string; variables?: Record<string, string> }> = []

  async sendTemplate(phone: string, templateId: string, variables: Record<string, string>): Promise<Result<MessageDeliveryStatus, Error>> {
    this.sentMessages.push({ phone, templateId, variables })
    return Result.ok({
      messageId: `msg_${Date.now()}`,
      recipientId: phone,
      status: 'sent',
      sentAt: new Date(),
    })
  }

  async sendText(phone: string, text: string): Promise<Result<MessageDeliveryStatus, Error>> {
    this.sentMessages.push({ phone, text })
    return Result.ok({
      messageId: `msg_${Date.now()}`,
      recipientId: phone,
      status: 'sent',
      sentAt: new Date(),
    })
  }

  async getDeliveryStatus(messageId: string): Promise<Result<MessageDeliveryStatus, Error>> {
    return Result.ok({
      messageId,
      recipientId: 'any',
      status: 'delivered',
      sentAt: new Date(),
    })
  }
}
