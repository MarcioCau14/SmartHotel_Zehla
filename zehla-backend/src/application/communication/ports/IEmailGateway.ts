import { Result } from '../../../domain/shared/Result';

export interface EmailDeliveryStatus {
  messageId: string;
  recipientId: string;
  status: 'sent' | 'delivered' | 'failed' | 'bounced';
  sentAt: Date;
  error?: string;
}

export interface IEmailGateway {
  sendEmail(
    to: string,
    subject: string,
    body: string,
    html?: string
  ): Promise<Result<EmailDeliveryStatus, Error>>;
}
