import { IMessagingGateway, MessagingError } from '@/domain/marketing/ports/IMessagingGateway';
import { Result } from '@/shared/Result';

interface EvolutionConfig {
  baseUrl: string;
  apiKey: string;
  defaultInstance: string;
}

export class EvolutionMessagingGateway implements IMessagingGateway {
  constructor(private readonly config: EvolutionConfig) {}

  private async request(method: string, path: string, body?: unknown): Promise<unknown> {
    const res = await fetch(`${this.config.baseUrl}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        apikey: this.config.apiKey,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Evolution API ${res.status} on ${method} ${path}: ${text}`);
    }
    if (res.status === 204) return undefined;
    return res.json();
  }

  async sendText(phone: string, message: string): Promise<Result<void, MessagingError>> {
    const instance = this.config.defaultInstance;
    try {
      await this.request('POST', `/message/sendText/${instance}`, {
        number: phone,
        options: { delay: 1200, presence: 'composing' },
        textMessage: { text: message },
      });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        new MessagingError(error instanceof Error ? error.message : 'Unknown error')
      );
    }
  }

  async sendTemplate(
    phone: string,
    templateId: string,
    variables: Record<string, string>
  ): Promise<Result<void, MessagingError>> {
    const instance = this.config.defaultInstance;
    try {
      const parameters = Object.entries(variables).map(([key, value]) => ({
        type: 'text',
        text: value,
      }));

      await this.request('POST', `/message/sendTemplate/${instance}`, {
        number: phone,
        template: {
          name: templateId,
          language: {
            code: 'pt_BR',
            policy: 'deterministic',
          },
          components: [
            {
              type: 'body',
              parameters: parameters,
            },
          ],
        },
      });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        new MessagingError(error instanceof Error ? error.message : 'Unknown error')
      );
    }
  }
}
