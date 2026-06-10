import { Result } from '../../domain/shared/Result';
import { IMessagingGateway, MessageDeliveryStatus } from '../../application/marketing/ports/IMessagingGateway';
import { EvolutionWhatsAppAdapter } from '../external/evolution/EvolutionWhatsAppAdapter';

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
    return Math.max(500, Math.floor(delay)); // Garante pelo menos 500ms
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
      // Injeta delay gaussiano com Box-Muller (média 2s, desvio padrão 0.5s)
      const delayMs = this.getGaussianDelayMs(2000, 500);
      await this.sleep(delayMs);

      const result = await this.adapter.sendText({
        to: stripPlus(phone),
        content: text,
        delay: 1200,
      });

      if (result.success) {
        return Result.ok({
          messageId: result.externalId || `msg_${Date.now()}`,
          recipientId: phone,
          status: 'sent',
          sentAt: new Date(),
        });
      }

      return Result.fail(new Error(result.error || 'Falha ao enviar mensagem'));
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao enviar mensagem via Evolution API'));
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
