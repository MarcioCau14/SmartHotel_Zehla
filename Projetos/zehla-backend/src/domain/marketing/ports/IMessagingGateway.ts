import { Result } from '../../../shared/Result';

export class MessagingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MessagingError';
  }
}

export interface IMessagingGateway {
  sendMessage(phone: string, content: string): Promise<Result<void, MessagingError>>;
  sendTemplate(
    phone: string,
    templateId: string,
    variables: Record<string, string>
  ): Promise<Result<void, MessagingError>>;
}
