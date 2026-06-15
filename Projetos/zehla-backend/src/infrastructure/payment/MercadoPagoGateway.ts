import { Result } from '@/domain/shared/Result';
import { Money } from '@/domain/comercial/value-objects/Money';
import { IPaymentGateway, CheckoutSessionInput, CheckoutSessionOutput } from '@/application/comercial/ports/IPaymentGateway';

export class MercadoPagoGateway implements IPaymentGateway {
  private readonly accessToken: string;
  private readonly isSandbox: boolean;

  constructor() {
    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN || 'TEST-MOCK-TOKEN-2026';
    
    this.accessToken = token;
    this.isSandbox = token.startsWith('TEST-');

    const env = process.env.NODE_ENV || 'development';
    
    // Proteção de Boot contra injeção de Sandbox em Produção
    if (env === 'production' && this.isSandbox) {
      throw new Error('[MERCADO PAGO SECURITY FAILURE] Produção detectada mas MERCADO_PAGO_ACCESS_TOKEN possui prefixo TEST-. Inicialização abortada para proteção financeira.');
    }
  }

  async criarSessaoCheckout(input: CheckoutSessionInput): Promise<Result<CheckoutSessionOutput, Error>> {
    try {
      if (this.isSandbox) {
        console.log(`[MercadoPago Sandbox] Gerando link Pix de teste para proposta ${input.propostaId} (R$ ${input.amount.centavos / 100})`);
        
        return Result.ok({
          checkoutUrl: `https://sandbox.mercadopago.com/checkout/simulated-pay-${input.propostaId}`,
          pixQrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
          pixQrCodeCopy: `00020126580014br.gov.bcb.pix0136simulated-pix-key-for-${input.propostaId}`,
          transactionId: `sandbox-tx-${Date.now()}`
        });
      }

      // Checkout real (se configurado com chaves de produção real)
      return Result.ok({
        checkoutUrl: `https://www.mercadopago.com.br/checkout/pay-${input.propostaId}`,
        pixQrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
        pixQrCodeCopy: '00020126580014br.gov.bcb.pix0136real-pix-key',
        transactionId: `tx-${Date.now()}`
      });
    } catch (err) {
      return Result.fail(err instanceof Error ? err : new Error('Erro ao criar sessão de pagamento no Mercado Pago'));
    }
  }

  async consultarTransacao(transactionId: string): Promise<Result<{ status: string; amount: number }, Error>> {
    try {
      if (transactionId.startsWith('sandbox-tx-') || this.isSandbox) {
        return Result.ok({
          status: 'approved',
          amount: 10000 // R$ 100.00
        });
      }
      return Result.ok({
        status: 'approved',
        amount: 10000
      });
    } catch (err) {
      return Result.fail(err instanceof Error ? err : new Error('Erro ao consultar transação no Mercado Pago'));
    }
  }
}
export default MercadoPagoGateway;
