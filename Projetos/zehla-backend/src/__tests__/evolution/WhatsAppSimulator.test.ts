import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../../app/api/webhooks/whatsapp/route';

// Mock do ProcessReplyUseCase para evitar chamadas de negócio ou RAG reais no teste
vi.mock('@/application/growth/use-cases/ProcessReplyUseCase', () => {
  return {
    ProcessReplyUseCase: class {
      execute = vi.fn().mockImplementation(() => {
        return Promise.resolve({ isOk: true, isFail: false, value: undefined });
      });
    }
  };
});

describe('WhatsApp Simulator Webhook (Evolution API)', () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NODE_ENV = 'development';
  });

  it('deve aceitar bypass de HMAC se a assinatura for a de simulador em ambiente de desenvolvimento', async () => {
    const payload = {
      event: 'messages.upsert',
      instance: 'zehla-instance-property-1',
      data: {
        key: {
          remoteJid: '5511999999999@s.whatsapp.net',
          fromMe: false,
          id: 'simulated-msg-id-123'
        },
        pushName: 'João Simulado',
        message: {
          conversation: 'Quero reservar um quarto'
        },
        messageTimestamp: Math.floor(Date.now() / 1000)
      },
      propertyId: 'property-1'
    };

    const req = new NextRequest('http://localhost/api/webhooks/whatsapp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-WhatsApp-Signature': 'sandbox-mock-bypass-signature'
      },
      body: JSON.stringify(payload)
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.status).toBe('verified_and_processed');
    expect(json.messageId).toBe('simulated-msg-id-123');
  });

  it('deve rejeitar bypass de HMAC se o ambiente não for development', async () => {
    process.env.NODE_ENV = 'production';

    const payload = {
      phone: '5511999999999',
      content: 'Oi'
    };

    const req = new NextRequest('http://localhost/api/webhooks/whatsapp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-WhatsApp-Signature': 'sandbox-mock-bypass-signature'
      },
      body: JSON.stringify(payload)
    });

    const res = await POST(req);
    // Deve retornar 401 Unauthorized por rejeição de HMAC
    expect(res.status).toBe(401);
  });

  it('deve processar webhook anêmico tradicional (com phone/content brutos) se enviado pelo simulador antigo', async () => {
    const payload = {
      phone: '5511999999999',
      content: 'Mensagem simplificada',
      messageId: 'simple-msg-777'
    };

    const req = new NextRequest('http://localhost/api/webhooks/whatsapp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-WhatsApp-Signature': 'sandbox-mock-bypass-signature'
      },
      body: JSON.stringify(payload)
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.messageId).toBe('simple-msg-777');
  });
});
