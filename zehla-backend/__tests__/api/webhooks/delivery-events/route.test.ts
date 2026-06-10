import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../../../../src/app/api/webhooks/delivery-events/route';
import { NextRequest } from 'next/server';
import { createHmac } from 'crypto';
import { trackingEventsQueue } from '../../../../src/lib/queues';

// Mock do queues
vi.mock('../../../../src/lib/queues', () => ({
  trackingEventsQueue: {
    add: vi.fn().mockResolvedValue({ id: 'job-123' })
  }
}));

// Mock do rate-limit
vi.mock('../../../../src/lib/security/rate-limit-webhook', () => ({
  webhookRateGuard: vi.fn().mockResolvedValue(null)
}));

describe('POST /api/webhooks/delivery-events (Asíncrono)', () => {
  const secret = 'zehla_whatsapp_webhook_secret_2026';
  
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.WHATSAPP_WEBHOOK_SECRET = secret;
  });

  it('deve retornar 401 se o cabeçalho de assinatura estiver ausente', async () => {
    const payload = { leadId: 'test-lead-id', status: 'READ', propriedadeId: 'test-prop-id' };
    const req = new NextRequest('http://localhost/api/webhooks/delivery-events', {
      method: 'POST',
      headers: {},
      body: JSON.stringify(payload)
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toContain('Missing signature header');
  });

  it('deve retornar 401 se a assinatura for inválida', async () => {
    const payload = { leadId: 'test-lead-id', status: 'READ', propriedadeId: 'test-prop-id' };
    const req = new NextRequest('http://localhost/api/webhooks/delivery-events', {
      method: 'POST',
      headers: {
        'x-hub-signature-256': 'sha256=invalid-signature'
      },
      body: JSON.stringify(payload)
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toContain('Unauthorized Signature');
  });

  it('deve retornar 202 e enfileirar o evento com assinatura HMAC válida', async () => {
    const payload = { leadId: 'test-lead-id', status: 'READ', propriedadeId: 'test-prop-id' };
    const bodyString = JSON.stringify(payload);
    const signature = createHmac('sha256', secret).update(bodyString).digest('hex');

    const req = new NextRequest('http://localhost/api/webhooks/delivery-events', {
      method: 'POST',
      headers: {
        'x-hub-signature-256': `sha256=${signature}`
      },
      body: bodyString
    });

    const res = await POST(req);
    expect(res.status).toBe(202);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.status).toBe('queued');

    expect(trackingEventsQueue.add).toHaveBeenCalledWith('process-delivery-status', {
      leadId: 'test-lead-id',
      propriedadeId: 'test-prop-id',
      status: 'READ'
    });
  });
});
