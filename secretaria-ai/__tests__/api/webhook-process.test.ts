import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRequest, expectJson } from '../helpers/test-utils';

vi.mock('@/lib/resolve-tenant-by-phone', () => ({
  resolveTenantByPhone: vi.fn().mockResolvedValue('tenant-abc')
}));

vi.mock('@/lib/whatsapp-ai-responder', () => ({
  processIncomingMessage: vi.fn().mockResolvedValue({
    conversationId: 'conv-123',
    aiResponse: 'Olá, sou a ZÉLLA!',
    guestId: 'guest-456'
  })
}));

import { POST as webhookPost } from '@/app/api/webhook-whatsapp/route';
import { resolveTenantByPhone } from '@/lib/resolve-tenant-by-phone';
import { processIncomingMessage } from '@/lib/whatsapp-ai-responder';

describe('POST /api/webhook-whatsapp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('receives text message from WhatsApp, resolves tenant and triggers responder asynchronously', async () => {
    const payload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          changes: [
            {
              value: {
                messaging_product: 'whatsapp',
                metadata: {
                  display_phone_number: '5511999999999',
                  phone_number_id: 'phone-id-123'
                },
                contacts: [
                  {
                    profile: {
                      name: 'Marcio'
                    },
                    wa_id: '5511988888888'
                  }
                ],
                messages: [
                  {
                    from: '5511988888888',
                    id: 'wamid.HBgNNTUxMTk4ODg4ODg4OBUC',
                    timestamp: '1672531199',
                    text: {
                      body: 'Olá pousada!'
                    },
                    type: 'text'
                  }
                ]
              },
              field: 'messages'
            }
          ]
        }
      ]
    };

    const req = createRequest('/api/webhook-whatsapp', {
      method: 'POST',
      body: payload
    });

    const res = await webhookPost(req);
    const body = await expectJson(res, 200);

    expect(body.success).toBe(true);
    expect(body.processed).toBe(true);
    expect(resolveTenantByPhone).toHaveBeenCalledWith('5511999999999');
    expect(processIncomingMessage).toHaveBeenCalled();
  });

  it('ignores status updates without messages', async () => {
    const payload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          changes: [
            {
              value: {
                messaging_product: 'whatsapp',
                metadata: {
                  display_phone_number: '5511999999999',
                  phone_number_id: 'phone-id-123'
                },
                statuses: [
                  {
                    id: 'wamid.HBgNNTUxMTk4ODg4ODg4OBUC',
                    status: 'read',
                    timestamp: '1672531250',
                    recipient_id: '5511988888888'
                  }
                ]
              },
              field: 'messages'
            }
          ]
        }
      ]
    };

    const req = createRequest('/api/webhook-whatsapp', {
      method: 'POST',
      body: payload
    });

    const res = await webhookPost(req);
    const body = await expectJson(res, 200);

    expect(body.processed).toBe(0);
    expect(body.reason).toBe('status_update');
    expect(resolveTenantByPhone).not.toHaveBeenCalled();
    expect(processIncomingMessage).not.toHaveBeenCalled();
  });
});
