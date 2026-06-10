import { MercadoPagoConfig, Payment, PreApproval } from 'mercadopago';
import { Result } from '../../../domain/shared/Result';
import {
  IPaymentGateway,
  PaymentIntent,
  CardPaymentIntent,
  SubscriptionPlan,
  CustomerInfo,
  PaymentResult,
  SubscriptionResult,
  PaymentError,
  WebhookPayload,
  PaymentEvent
} from '../../../domain/financeiro/gateways/IPaymentGateway';
import { Invoice } from '../../../domain/financeiro/entities/Invoice';
import { PaymentMethodType } from '../../../domain/financeiro/enums/PaymentMethodType';
import { MercadoPagoMapper } from '../mappers/MercadoPagoMapper';
import { createHmac } from 'crypto';

export interface MercadoPagoGatewayConfig {
  accessToken: string;
  publicKey: string;
  webhookSecret: string;
  sandbox: boolean;
  idempotencyKeyPrefix: string;
}

export class MercadoPagoGateway implements IPaymentGateway {
  private client: MercadoPagoConfig;
  private payment: Payment;
  private preApproval: PreApproval;
  private idempotencyBarrier: Map<string, boolean> = new Map(); // Em prod: usar Redis

  constructor(private readonly config: MercadoPagoGatewayConfig) {
    this.client = new MercadoPagoConfig({
      accessToken: config.accessToken,
      options: { timeout: 30000 }
    });
    this.payment = new Payment(this.client);
    this.preApproval = new PreApproval(this.client);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // PIX
  // ═══════════════════════════════════════════════════════════════════════
  async createPixPayment(invoice: Invoice): Promise<Result<PaymentResult, PaymentError>> {
    try {
      const idempotencyKey = this.generateIdempotencyKey(invoice.id, 'pix');
      
      if (await this.isDuplicate(idempotencyKey)) {
        return Result.fail({
          code: 'IDEMPOTENCY_VIOLATION',
          message: 'Pagamento PIX já processado para esta fatura',
          retryable: false
        });
      }

      const response = await this.payment.create({
        body: {
          transaction_amount: invoice.amount.toNumber(),
          description: invoice.description,
          payment_method_id: 'pix',
          payer: {
            email: invoice.customerEmail,
            first_name: invoice.customerName?.split(' ')[0] || 'Cliente',
            last_name: invoice.customerName?.split(' ').slice(1).join(' ') || 'ZEHLA',
            identification: invoice.customerCpf ? {
              type: 'CPF',
              number: invoice.customerCpf.replace(/\D/g, '')
            } : undefined
          },
          notification_url: `${process.env.WEBHOOK_URL}/api/webhooks/mercado-pago`,
          external_reference: invoice.id,
          metadata: {
            invoice_id: invoice.id,
            property_id: invoice.propertyId,
            tenant_id: invoice.tenantId,
            plan: invoice.plan || 'none'
          }
        },
        requestOptions: {
          idempotencyKey
        }
      });

      await this.markAsProcessed(idempotencyKey);
      return Result.ok(MercadoPagoMapper.toPaymentResult(response, PaymentMethodType.PIX));
    } catch (error: any) {
      return Result.fail(this.mapError(error));
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // CARTÃO (Crédito/Débito)
  // ═══════════════════════════════════════════════════════════════════════
  async createCardPayment(intent: CardPaymentIntent): Promise<Result<PaymentResult, PaymentError>> {
    try {
      const idempotencyKey = this.generateIdempotencyKey(intent.metadata?.invoice_id || '', 'card');
      
      if (await this.isDuplicate(idempotencyKey)) {
        return Result.fail({
          code: 'IDEMPOTENCY_VIOLATION',
          message: 'Pagamento com cartão já processado',
          retryable: false
        });
      }

      const response = await this.payment.create({
        body: {
          transaction_amount: intent.amount,
          description: intent.description,
          payment_method_id: intent.paymentMethodId, // 'visa', 'master', etc.
          token: intent.cardToken,
          installments: intent.installments,
          payer: {
            email: intent.customerEmail,
            identification: intent.customerCpf ? {
              type: 'CPF',
              number: intent.customerCpf.replace(/\D/g, '')
            } : undefined
          },
          notification_url: `${process.env.WEBHOOK_URL}/api/webhooks/mercado-pago`,
          external_reference: intent.metadata?.invoice_id,
          metadata: intent.metadata
        },
        requestOptions: { idempotencyKey }
      });

      await this.markAsProcessed(idempotencyKey);
      
      const isDebit = intent.paymentMethodId === 'visa_electron' || intent.paymentMethodId === 'maestro';
      return Result.ok(MercadoPagoMapper.toPaymentResult(response, 
        isDebit ? PaymentMethodType.DEBIT_CARD : PaymentMethodType.CREDIT_CARD
      ));
    } catch (error: any) {
      return Result.fail(this.mapError(error));
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // BOLETO
  // ═══════════════════════════════════════════════════════════════════════
  async createBoletoPayment(intent: PaymentIntent): Promise<Result<PaymentResult, PaymentError>> {
    try {
      const idempotencyKey = this.generateIdempotencyKey(intent.metadata?.invoice_id || '', 'boleto');
      
      const response = await this.payment.create({
        body: {
          transaction_amount: intent.amount,
          description: intent.description,
          payment_method_id: 'bolbradesco', // ou 'bolsantander'
          payer: {
            email: intent.customerEmail,
            first_name: intent.customerName?.split(' ')[0] || 'Cliente',
            last_name: intent.customerName?.split(' ').slice(1).join(' ') || 'ZEHLA',
            identification: intent.customerCpf ? {
              type: 'CPF',
              number: intent.customerCpf.replace(/\D/g, '')
            } : undefined,
            address: {
              zip_code: intent.metadata?.cep || '00000000',
              street_name: intent.metadata?.street || 'Não informado',
              street_number: parseInt(intent.metadata?.number || '0'),
              neighborhood: intent.metadata?.neighborhood || 'Não informado',
              city: intent.metadata?.city || 'São Paulo',
              federal_unit: intent.metadata?.state || 'SP'
            }
          },
          notification_url: `${process.env.WEBHOOK_URL}/api/webhooks/mercado-pago`,
          external_reference: intent.metadata?.invoice_id,
          metadata: intent.metadata
        },
        requestOptions: { idempotencyKey }
      });

      return Result.ok(MercadoPagoMapper.toPaymentResult(response, PaymentMethodType.BOLETO));
    } catch (error: any) {
      return Result.fail(this.mapError(error));
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // ASSINATURA RECORRENTE (LITE/PRO/MAX)
  // ═══════════════════════════════════════════════════════════════════════
  async createSubscription(
    plan: SubscriptionPlan, 
    customer: CustomerInfo
  ): Promise<Result<SubscriptionResult, PaymentError>> {
    try {
      const idempotencyKey = this.generateIdempotencyKey(plan.id, 'subscription');
      
      const response = await this.preApproval.create({
        body: {
          reason: plan.name,
          auto_recurring: {
            frequency: plan.frequency,
            frequency_type: plan.frequencyType,
            transaction_amount: plan.amount,
            currency_id: plan.currency,
            start_date: new Date().toISOString(),
            end_date: null
          },
          payer_email: customer.email,
          back_url: plan.backUrl,
          notification_url: plan.notificationUrl,
          external_reference: plan.id,
          status: 'pending'
        },
        requestOptions: { idempotencyKey }
      });

      return Result.ok({
        id: plan.id,
        externalId: response.id || '',
        status: 'pending',
        initPoint: response.init_point || '',
        sandboxInitPoint: response.sandbox_init_point || ''
      });
    } catch (error: any) {
      return Result.fail(this.mapError(error));
    }
  }

  async pauseSubscription(externalId: string): Promise<Result<void, PaymentError>> {
    try {
      await this.preApproval.update({
        id: externalId,
        body: { status: 'paused' }
      });
      return Result.ok(undefined);
    } catch (error: any) {
      return Result.fail(this.mapError(error));
    }
  }

  async cancelSubscription(externalId: string): Promise<Result<void, PaymentError>> {
    try {
      await this.preApproval.update({
        id: externalId,
        body: { status: 'cancelled' }
      });
      return Result.ok(undefined);
    } catch (error: any) {
      return Result.fail(this.mapError(error));
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // CONSULTA E REEMBOLSO
  // ═══════════════════════════════════════════════════════════════════════
  async getPayment(externalId: string): Promise<Result<PaymentResult, PaymentError>> {
    try {
      const response = await this.payment.get({ id: externalId });
      return Result.ok(MercadoPagoMapper.toPaymentResult(response));
    } catch (error: any) {
      return Result.fail(this.mapError(error));
    }
  }

  async refundPayment(externalId: string, amount?: number): Promise<Result<PaymentResult, PaymentError>> {
    try {
      const response = await this.payment.refund({
        id: externalId,
        body: amount ? { amount } : undefined
      });
      return Result.ok(MercadoPagoMapper.toPaymentResult(response));
    } catch (error: any) {
      return Result.fail(this.mapError(error));
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // WEBHOOK
  // ═══════════════════════════════════════════════════════════════════════
  validateWebhook(payload: unknown, signature: string): boolean {
    try {
      const [tsPart, hashPart] = signature.split(',');
      const timestamp = tsPart.replace('ts=', '');
      const hash = hashPart.replace('v1=', '');
      
      const template = `id:${(payload as any).data?.id};request-id:${(payload as any).data?.id};ts:${timestamp};`;
      const crypted = createHmac('sha256', this.config.webhookSecret)
        .update(template)
        .digest('hex');
      
      return crypted === hash;
    } catch {
      return false;
    }
  }

  async processWebhook(payload: WebhookPayload): Promise<Result<PaymentEvent, PaymentError>> {
    try {
      const { type, data } = payload;
      const eventMap: Record<string, PaymentEvent['type']> = {
        'payment.created': 'payment.approved',
        'payment.updated': 'payment.approved',
        'subscription_preapproval.authorized': 'subscription.authorized',
        'subscription_preapproval.cancelled': 'subscription.cancelled',
        'subscription_preapproval.charged': 'subscription.charged'
      };
      
      const eventType = eventMap[type];
      if (!eventType) {
        return Result.fail({
          code: 'UNKNOWN_WEBHOOK_TYPE',
          message: `Tipo de webhook não mapeado: ${type}`,
          retryable: false
        });
      }

      let details: any;
      if (type.startsWith('payment')) {
        details = await this.payment.get({ id: data.id });
      } else {
        details = await this.preApproval.get({ id: data.id });
      }

      return Result.ok({
        type: eventType,
        externalId: data.id,
        internalId: details.external_reference || '',
        amount: details.transaction_amount || details.auto_recurring?.transaction_amount || 0,
        status: details.status || details.auto_recurring?.status || 'unknown',
        metadata: {
          payment_method_id: details.payment_method_id,
          payment_type_id: details.payment_type_id,
          date_created: details.date_created,
          date_approved: details.date_approved,
          money_release_date: details.money_release_date,
          point_of_interaction: details.point_of_interaction,
          ...details.metadata
        }
      });
    } catch (error: any) {
      return Result.fail(this.mapError(error));
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // HELPERS PRIVADOS
  // ═══════════════════════════════════════════════════════════════════════
  private generateIdempotencyKey(reference: string, type: string): string {
    return `${this.config.idempotencyKeyPrefix}:${type}:${reference}:${Date.now()}`;
  }

  private async isDuplicate(key: string): Promise<boolean> {
    return this.idempotencyBarrier.has(key);
  }

  private async markAsProcessed(key: string): Promise<void> {
    this.idempotencyBarrier.set(key, true);
  }

  private mapError(error: any): PaymentError {
    const mpError = error.cause?.[0] || error;
    
    const retryableCodes = ['500', '502', '503', '504', 'timeout'];
    const isRetryable = retryableCodes.some(code => 
      mpError.code?.includes(code) || mpError.status?.toString().startsWith('5')
    );
    
    return {
      code: mpError.code || 'UNKNOWN_ERROR',
      message: mpError.description || mpError.message || 'Erro desconhecido no Mercado Pago',
      retryable: isRetryable,
      mercadoPagoCode: mpError.code,
      status: mpError.status
    };
  }
}
