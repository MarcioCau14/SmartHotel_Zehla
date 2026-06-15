import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MercadoPagoGateway } from '../../infrastructure/payment/MercadoPagoGateway';
import { Money } from '../../domain/comercial/value-objects/Money';

describe('MercadoPagoGateway Adapter (Sandbox & Security)', () => {
  const originalEnv = process.env.NODE_ENV;
  const originalToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    process.env.MERCADO_PAGO_ACCESS_TOKEN = originalToken;
  });

  it('deve instanciar em modo Sandbox se a credencial começar com TEST-', () => {
    process.env.NODE_ENV = 'development';
    process.env.MERCADO_PAGO_ACCESS_TOKEN = 'TEST-8291029312389';

    const gateway = new MercadoPagoGateway();
    // Acessando propriedades privadas usando type assertion ou checando comportamento do método
    expect((gateway as any).isSandbox).toBe(true);
  });

  it('deve instanciar em modo Produção se a credencial não começar com TEST-', () => {
    process.env.NODE_ENV = 'development';
    process.env.MERCADO_PAGO_ACCESS_TOKEN = 'APP_USR-8291029312389';

    const gateway = new MercadoPagoGateway();
    expect((gateway as any).isSandbox).toBe(false);
  });

  it('deve lançar erro de segurança no boot se o ambiente for produção e a chave for de Sandbox (TEST-)', () => {
    process.env.NODE_ENV = 'production';
    process.env.MERCADO_PAGO_ACCESS_TOKEN = 'TEST-8291029312389';

    expect(() => {
      new MercadoPagoGateway();
    }).toThrowError(/MERCADO PAGO SECURITY FAILURE/);
  });

  it('deve criar sessao de checkout simulada se estiver em modo Sandbox', async () => {
    process.env.NODE_ENV = 'development';
    process.env.MERCADO_PAGO_ACCESS_TOKEN = 'TEST-12345';

    const gateway = new MercadoPagoGateway();
    const moneyRes = Money.criar(15000); // R$ 150.00
    expect(moneyRes.isOk).toBe(true);

    const checkoutRes = await gateway.criarSessaoCheckout({
      propostaId: 'prop-123',
      propriedadeId: 'pousada-1',
      amount: moneyRes.value,
      phone: '5511999999999',
      email: 'joao@email.com'
    });

    expect(checkoutRes.isOk).toBe(true);
    const checkout = checkoutRes.value;
    expect(checkout.checkoutUrl).toContain('sandbox.mercadopago.com/checkout');
    expect(checkout.pixQrCodeCopy).toContain('simulated-pix-key');
    expect(checkout.transactionId).toContain('sandbox-tx-');
  });
});
