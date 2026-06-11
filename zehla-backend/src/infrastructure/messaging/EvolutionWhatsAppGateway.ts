import { Result } from '../../domain/shared/Result';
import { IMessagingGateway, MessageDeliveryStatus } from '../../application/marketing/ports/IMessagingGateway';
import { EvolutionWhatsAppAdapter } from '../external/evolution/EvolutionWhatsAppAdapter';
import {
  checkMessagingRateLimit,
  registerBackoff,
  resetBackoff,
} from '../../lib/security/rate-limit-messaging';

function stripPlus(phone: string): string {
  return phone.startsWith('+') ? phone.slice(1) : phone;
}

export class EvolutionWhatsAppGateway implements IMessagingGateway {
  private adapter: EvolutionWhatsAppAdapter;

  constructor() {
    this.adapter = new EvolutionWhatsAppAdapter({
      baseUrl: process.env.EVOLUTION_API_URL || 'http://localhost:8080',
      apiKey: process.env.EVOLUTION_API_KEY || '',
      defaultInstance: process.env.EVOLUTION_INSTANCE || 'zehla',
    });
  }

  private getGaussianDelayMs(meanMs: number = 2000, stdDevMs: number = 500): number {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    const delay = num * stdDevMs + meanMs;
    return Math.max(500, Math.floor(delay));
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async sendTemplate(
    phone: string,
    templateId: string,
    variables: Record<string, string>,
  ): Promise<Result<MessageDeliveryStatus, Error>> {
    const messageBody = variables.message || variables.text || variables.body ||
      Object.values(variables).join('\n');
    return this.send(phone, messageBody);
  }

  async sendText(phone: string, text: string): Promise<Result<MessageDeliveryStatus, Error>> {
    return this.send(phone, text);
  }

  private async send(phone: string, text: string): Promise<Result<MessageDeliveryStatus, Error>> {
    try {
      // Rate limit check (1 msg/3s per phone)
      const rateCheck = await checkMessagingRateLimit(phone)
      if (!rateCheck.allowed) {
        if (rateCheck.retryAfterMs > 100) {
          await this.sleep(rateCheck.retryAfterMs)
        }
      }

      // Gaussian anti-ban delay (mean 2s, stddev 0.5s)
      const gaussianMs = this.getGaussianDelayMs(2000, 500);
      await this.sleep(gaussianMs);

      const result = await this.adapter.sendText({
        to: stripPlus(phone),
        content: text,
        delay: 1200,
      });

      if (result.success) {
        await resetBackoff(phone)
        return Result.ok({
          messageId: result.externalId || `msg_${Date.now()}`,
          recipientId: phone,
          status: 'sent',
          sentAt: new Date(),
        });
      }

      const isRateLimited = result.error?.toLowerCase().includes('429') ||
        result.error?.toLowerCase().includes('rate') ||
        result.error?.toLowerCase().includes('too many')
      if (isRateLimited) {
        await registerBackoff(phone)
      }

      return Result.fail(new Error(result.error || 'Falha ao enviar mensagem'));
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Erro ao enviar mensagem via Evolution API'
      const isRateLimited = errMsg.toLowerCase().includes('429') ||
        errMsg.toLowerCase().includes('rate') ||
        errMsg.toLowerCase().includes('too many')
      if (isRateLimited) {
        await registerBackoff(phone)
      }
      return Result.fail(error instanceof Error ? error : new Error(errMsg));
    }
  }

  async getDeliveryStatus(messageId: string): Promise<Result<MessageDeliveryStatus, Error>> {
    return Result.ok({
      messageId,
      recipientId: '',
      status: 'sent',
      sentAt: new Date(),
    });
  }
}
