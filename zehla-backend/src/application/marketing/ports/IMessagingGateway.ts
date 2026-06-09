import { Result } from '../../../domain/shared/Result'

export interface MessageDeliveryStatus {
  messageId: string
  recipientId: string
  status: 'sent' | 'delivered' | 'failed' | 'opened'
  sentAt: Date
  error?: string
}

export interface IMessagingGateway {
  sendTemplate(
    phone: string,
    templateId: string,
    variables: Record<string, string>
  ): Promise<Result<MessageDeliveryStatus, Error>>

  sendText(phone: string, text: string): Promise<Result<MessageDeliveryStatus, Error>>

  getDeliveryStatus(messageId: string): Promise<Result<MessageDeliveryStatus, Error>>
}
