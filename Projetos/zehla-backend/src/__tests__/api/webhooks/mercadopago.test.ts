import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IdempotencyBarrier } from '../../../infrastructure/security/IdempotencyBarrier';
import crypto from 'crypto';

// Mock do redis
vi.mock('../../../lib/redis', () => {
  const store = new Map();
  return {
    redis: {
      set: vi.fn(async (key, value, mode, ttl, nx) => {
        if (nx === 'NX') {
          if (store.has(key)) return null;
          store.set(key, value);
          return 'OK';
        }
        store.set(key, value);
        return 'OK';
      }),
      get: vi.fn(async (key) => store.get(key) || null),
      del: vi.fn(async (key) => {
        store.delete(key);
      }),
    },
  };
});

// Mock do ProcessPaymentProofUseCase
vi.mock('../../../lib/brain/use-cases/ProcessPaymentProofUseCase', () => {
  return {
    ProcessPaymentProofUseCase: {
      execute: vi.fn(async (phone, propertyId, receiptData) => {
        if (phone === 'error-phone') {
          return { success: false, message: 'Mocked Database Error' };
        }
        return { success: true, reservationId: 'res-123' };
      }),
    },
  };
});

import { POST } from '../../../app/api/webhooks/mercadopago/route';
import { NextRequest } from 'next/server';

describe('Mercado Pago Webhook & Idempotency Barrier', () => {
  const secret = 'mp-secret-key-2026';
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve validar a barreira de idempotência corretamente', async () => {
    const key = 'test:idempotency:123';
    
    // Primeira tentativa deve permitir a trava
    const first = await IdempotencyBarrier.checkAndLock(key, 10);
    expect(first).toBe(true);
    
    // Segunda tentativa com a mesma chave deve ser bloqueada
    const second = await IdempotencyBarrier.checkAndLock(key, 10);
    expect(second).toBe(false);
  });

  it('deve rejeitar requisição com assinatura HMAC inválida', async () => {
    const payload = JSON.stringify({ id: 12345, propertyId: 'prop-1' });
    const req = new NextRequest('http://localhost/api/webhooks/mercadopago', {
      method: 'POST',
      headers: {
        'x-signature': 'assinatura-invalida',
      },
      body: payload,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Assinatura inválida');
  });

  it('deve aceitar requisição com assinatura válida e processar pagamento', async () => {
    const payload = JSON.stringify({ id: 99999, propertyId: 'prop-1', phone: '5548999999999', amount: 250 });
    
    // Calcular assinatura
    const calculatedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    const req = new NextRequest('http://localhost/api/webhooks/mercadopago', {
      method: 'POST',
      headers: {
        'x-signature': calculatedSignature,
      },
      body: payload,
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('success');
    expect(data.reservationId).toBe('res-123');
  });

  it('deve interceptar e ignorar requisição de webhook duplicada (idempotência)', async () => {
    const payload = JSON.stringify({ id: 77777, propertyId: 'prop-1', phone: '5548999999999', amount: 250 });
    const calculatedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    // Primeira chamada
    const req1 = new NextRequest('http://localhost/api/webhooks/mercadopago', {
      method: 'POST',
      headers: { 'x-signature': calculatedSignature },
      body: payload,
    });
    const res1 = await POST(req1);
    expect(res1.status).toBe(200);
    const data1 = await res1.json();
    expect(data1.status).toBe('success');

    // Segunda chamada duplicada
    const req2 = new NextRequest('http://localhost/api/webhooks/mercadopago', {
      method: 'POST',
      headers: { 'x-signature': calculatedSignature },
      body: payload,
    });
    const res2 = await POST(req2);
    expect(res2.status).toBe(200);
    const data2 = await res2.json();
    expect(data2.status).toBe('duplicate_ignored');
  });

  it('deve retornar 200 OK mesmo quando o Use Case interno falhar para impedir retries infinitos', async () => {
    const payload = JSON.stringify({ id: 88888, propertyId: 'prop-1', phone: 'error-phone', amount: 250 });
    const calculatedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    const req = new NextRequest('http://localhost/api/webhooks/mercadopago', {
      method: 'POST',
      headers: { 'x-signature': calculatedSignature },
      body: payload,
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('error_logged');
    expect(data.details).toBe('Mocked Database Error');
  });
});
