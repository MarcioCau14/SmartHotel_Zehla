import { Result } from '../../domain/shared/Result';
import { IEmailGateway, EmailDeliveryStatus } from '../../application/communication/ports/IEmailGateway';
import { Resend } from 'resend';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { redis } from '../../lib/redis';

export class ResendEmailGateway implements IEmailGateway {
  private resend: Resend;
  private limiter: RateLimiterRedis | null = null;
  private dailyLimit: number;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY || '');
    this.dailyLimit = process.env.RESEND_DAILY_LIMIT ? parseInt(process.env.RESEND_DAILY_LIMIT, 10) : 100;
    
    try {
      this.limiter = new RateLimiterRedis({
        storeClient: redis,
        keyPrefix: 'rl_resend_email',
        points: this.dailyLimit,
        duration: 86400, // 24 horas em segundos
        blockDuration: 0, // não bloqueia o IP/chave, apenas consome o ponto
      });
    } catch (err) {
      console.warn('⚠️ [ResendEmailGateway] Falha ao instanciar RateLimiterRedis, rate limiting desabilitado.', err);
    }
  }

  async sendEmail(
    to: string,
    subject: string,
    body: string,
    html?: string
  ): Promise<Result<EmailDeliveryStatus, Error>> {
    // 1. Verificar Rate Limit
    if (this.limiter) {
      try {
        // O limite diário é global para a nossa conta/chave da API do Resend
        await this.limiter.consume('global_resend_counter', 1);
      } catch (err: any) {
        return Result.fail(
          new Error(`Rate limit excedido para envios diários de e-mail (${this.dailyLimit}/dia).`)
        );
      }
    }

    // 2. Enviar via Resend
    try {
      const { data, error } = await this.resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'ZEHLA PRIME <onboarding@resend.dev>',
        to: [to],
        subject,
        text: body,
        html: html || body,
      });

      if (error) {
        return Result.fail(new Error(`Erro da API Resend: ${error.message}`));
      }

      return Result.ok({
        messageId: data?.id || `res_${Date.now()}`,
        recipientId: to,
        status: 'sent',
        sentAt: new Date(),
      });
    } catch (err: any) {
      return Result.fail(
        new Error(err instanceof Error ? err.message : 'Erro desconhecido ao enviar e-mail via Resend')
      );
    }
  }
}
