import { Result } from '../../shared/Result';
import { Payment } from '../entities/Payment';
import { Invoice } from '../entities/Invoice';
import { Subscription } from '../entities/Subscription';
import { PixCode } from '../value-objects/PixCode';
import { PaymentMethodType } from '../enums/PaymentMethodType';

export interface PaymentIntent {
  amount: number;
  currency: string; // 'BRL'
  description: string;
  customerEmail: string;
  customerName: string;
  customerCpf?: string;
  metadata: Record<string, string>;
}

export interface CardPaymentIntent extends PaymentIntent {
  cardToken: string;        // Token do cartão (gerado no frontend)
  installments: number;     // 1-12 parcelas
  paymentMethodId: string;  // 'visa', 'master', etc.
}

export interface SubscriptionPlan {
  id: string;
  name: string;             // 'ZEHLA LITE', 'ZEHLA PRO', 'ZEHLA MAX'
  amount: number;           // em centavos
  currency: string;
  frequency: number;        // 1 (mensal)
  frequencyType: 'months' | 'days';
  backUrl: string;
  notificationUrl: string;
}

export interface PaymentResult {
  id: string;               // ID interno ZEHLA
  externalId: string;       // ID Mercado Pago
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  paymentMethod: PaymentMethodType;
  amount: number;
  paidAmount: number;
  transactionDetails?: {
    bankTransferId?: string;
    financialInstitution?: string;
    installmentAmount?: number;
    totalPaidAmount?: number;
  };
  pointOfInteraction?: {
    qrCode?: string;
    qrCodeBase64?: string;
    ticketUrl?: string;
  };
  createdAt: Date;
}

export interface WebhookPayload {
  id: string;
  type: string;               // 'payment', 'subscription_preapproval', etc.
  action: string;             // 'payment.created', 'payment.updated'
  data: {
    id: string;
    [key: string]: unknown;
  };
  live_mode: boolean;
  created_at: string;
}

export interface IPaymentGateway {
  // PIX
  createPixPayment(intent: PaymentIntent): Promise<Result<PaymentResult, PaymentError>>;
  
  // Cartão
  createCardPayment(intent: CardPaymentIntent): Promise<Result<PaymentResult, PaymentError>>;
  
  // Boleto
  createBoletoPayment(intent: PaymentIntent): Promise<Result<PaymentResult, PaymentError>>;
  
  // Assinatura
  createSubscription(plan: SubscriptionPlan, customer: CustomerInfo): Promise<Result<SubscriptionResult, PaymentError>>;
  pauseSubscription(externalId: string): Promise<Result<void, PaymentError>>;
  cancelSubscription(externalId: string): Promise<Result<void, PaymentError>>;
  
  // Consulta
  getPayment(externalId: string): Promise<Result<PaymentResult, PaymentError>>;
  refundPayment(externalId: string, amount?: number): Promise<Result<PaymentResult, PaymentError>>;
  
  // Webhook
  validateWebhook(payload: unknown, signature: string): boolean;
  processWebhook(payload: WebhookPayload): Promise<Result<PaymentEvent, PaymentError>>;
}

export interface CustomerInfo {
  email: string;
  name: string;
  cpf?: string;
  phone?: string;
}

export interface SubscriptionResult {
  id: string;
  externalId: string;
  status: 'pending' | 'authorized' | 'paused' | 'cancelled';
  initPoint: string;        // URL para pagamento
  sandboxInitPoint: string;
}

export interface PaymentError {
  code: string;
  message: string;
  retryable: boolean;
  mercadoPagoCode?: string;
  status?: number;
}

export interface PaymentEvent {
  type: 'payment.approved' | 'payment.rejected' | 'payment.refunded' |
         'subscription.authorized' | 'subscription.cancelled' | 'subscription.charged';
  externalId: string;
  internalId: string;
  amount: number;
  status: string;
  metadata: Record<string, unknown>;
}
