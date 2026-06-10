import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MercadoPagoGateway } from '../../../../src/infrastructure/finance/gateways/MercadoPagoGateway';
import { Money } from '../../../../src/domain/financeiro/value-objects/Money';
import { PaymentMethodType } from '../../../../src/domain/financeiro/enums/PaymentMethodType';

describe('MercadoPagoGateway', () => {
  let gateway: MercadoPagoGateway;

  beforeEach(() => {
    gateway = new MercadoPagoGateway({
      accessToken: 'TEST-TOKEN',
      publicKey: 'TEST-PUBLIC-KEY',
      webhookSecret: 'TEST-SECRET',
      sandbox: true,
      idempotencyKeyPrefix: 'test'
    });
  });

  describe('createPixPayment', () => {
    it('deve criar pagamento PIX com sucesso', async () => {
      // Mock do cliente Mercado Pago
      const mockPayment = {
        create: vi.fn().mockResolvedValue({
          id: '123456789',
          status: 'pending',
          transaction_amount: 197.00,
          point_of_interaction: {
            transaction_data: {
              qr_code: '00020126580014BR.GOV.BCB.PIX0136...',
              qr_code_base64: 'iVBORw0KGgoAAAANSUhEUgAA...'
            }
          },
          external_reference: 'inv-001',
          date_created: new Date().toISOString()
        })
      };

      // Inject mock
      (gateway as any).payment = mockPayment;

      const invoice = {
        id: 'inv-001',
        amount: Money.create(197.00, 'BRL').value,
        description: 'ZEHLA LITE - Mensalidade',
        customerEmail: 'teste@pousada.com',
        customerName: 'João Silva',
        propertyId: 'prop-001',
        tenantId: 'tenant-001'
      } as any;

      const result = await gateway.createPixPayment(invoice);

      expect(result.isOk).toBe(true);
      const payment = result.value;
      expect(payment.externalId).toBe('123456789');
      expect(payment.status).toBe('pending');
      expect(payment.pointOfInteraction?.qrCode).toBeDefined();
    });

    it('deve retornar erro em caso de falha no gateway', async () => {
      const mockPayment = {
        create: vi.fn().mockRejectedValue({
          cause: [{ code: 'invalid_transaction_amount', description: 'Valor inválido' }]
        })
      };

      (gateway as any).payment = mockPayment;

      const invoice = {
        id: 'inv-002',
        amount: Money.create(0, 'BRL').isFail ? Money.zero() : Money.create(10, 'BRL').value,
        description: 'Teste',
        customerEmail: 'teste@teste.com'
      } as any;

      const result = await gateway.createPixPayment(invoice);

      expect(result.isFail).toBe(true);
      expect(result.error.code).toBe('invalid_transaction_amount');
    });
  });

  describe('validateWebhook', () => {
    it('deve validar formato de assinatura HMAC retorno boleano', () => {
      const payload = {
        data: { id: '123' }
      };
      const signature = 'ts=1718000000,v1=abc1234567890abcdef';
      const isValid = gateway.validateWebhook(payload, signature);
      expect(typeof isValid).toBe('boolean');
    });
  });

  describe('mapError', () => {
    it('deve mapear erro 500 como retryable', () => {
      const error = {
        cause: [{ code: '500', description: 'Internal server error' }],
        status: 500
      };

      const mapped = (gateway as any).mapError(error);
      expect(mapped.retryable).toBe(true);
    });

    it('deve mapear erro 400 como não retryable', () => {
      const error = {
        cause: [{ code: 'bad_request', description: 'Bad request' }],
        status: 400
      };

      const mapped = (gateway as any).mapError(error);
      expect(mapped.retryable).toBe(false);
    });
  });
});
