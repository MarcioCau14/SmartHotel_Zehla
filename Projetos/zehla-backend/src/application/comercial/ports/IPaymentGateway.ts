import { Result } from '@/domain/shared/Result';
import { Money } from '@/domain/comercial/value-objects/Money';

export interface CheckoutSessionInput {
  propostaId: string;
  propriedadeId: string;
  amount: Money;
  phone: string;
  email: string;
}

export interface CheckoutSessionOutput {
  checkoutUrl: string;
  pixQrCode: string;
  pixQrCodeCopy: string;
  transactionId: string;
}

export interface IPaymentGateway {
  criarSessaoCheckout(input: CheckoutSessionInput): Promise<Result<CheckoutSessionOutput, Error>>;
  consultarTransacao(transactionId: string): Promise<Result<{ status: string; amount: number }, Error>>;
}
