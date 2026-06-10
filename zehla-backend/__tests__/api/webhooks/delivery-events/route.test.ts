import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../../../../src/app/api/webhooks/delivery-events/route';
import { NextRequest } from 'next/server';
import { createHmac } from 'crypto';
import { Lead } from '../../../../src/domain/comercial/entities/Lead';
import { Canal } from '../../../../src/domain/comercial/value-objects/Canal';
import { Score } from '../../../../src/domain/comercial/value-objects/Score';
import { Result } from '../../../../src/shared/Result';

const mockBuscarLeadPorId = vi.fn();
const mockAtualizarLead = vi.fn();

vi.mock('../../../../src/infrastructure/persistence/comercial/PrismaLeadRepository', () => {
  return {
    PrismaLeadRepository: class {
      buscarLeadPorId = mockBuscarLeadPorId;
      atualizarLead = mockAtualizarLead;
    }
  };
});

// Mock do rate-limit
vi.mock('../../../../src/lib/security/rate-limit-webhook', () => ({
  webhookRateGuard: vi.fn().mockResolvedValue(null)
}));

const createTestLead = (scoreVal = 10, status: any = 'prospect') => {
  const canal = Canal.criar('WHATSAPP').value;
  const score = Score.criar(scoreVal).value;
  return Lead.create({
    id: 'test-lead-id',
    canal,
    propriedadeId: 'test-prop-id',
    dataCaptura: new Date(),
    nome: 'João Silva',
    score,
    status
  }).value;
};

describe('POST /api/webhooks/delivery-events', () => {
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

  it('deve retornar 200 e atualizar status e score do lead com assinatura correta', async () => {
    const payload = { leadId: 'test-lead-id', status: 'READ', propriedadeId: 'test-prop-id' };
    const bodyString = JSON.stringify(payload);
    const signature = createHmac('sha256', secret).update(bodyString).digest('hex');

    const lead = createTestLead(10, 'prospect');
    mockBuscarLeadPorId.mockResolvedValue(Result.ok(lead));

    const updatedLead = createTestLead(20, 'prospect');
    mockAtualizarLead.mockResolvedValue(Result.ok(updatedLead));

    const req = new NextRequest('http://localhost/api/webhooks/delivery-events', {
      method: 'POST',
      headers: {
        'x-hub-signature-256': `sha256=${signature}`
      },
      body: bodyString
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.status).toBe('processed');

    expect(mockBuscarLeadPorId).toHaveBeenCalledWith('test-lead-id', 'test-prop-id');
    expect(mockAtualizarLead).toHaveBeenCalledWith('test-lead-id', 'test-prop-id', {
      score: 20,
      status: 'prospect'
    });
  });

  it('deve promover lead para qualified se atingir score maior ou igual a 30', async () => {
    const payload = { leadId: 'test-lead-id', status: 'READ', propriedadeId: 'test-prop-id' };
    const bodyString = JSON.stringify(payload);
    const signature = createHmac('sha256', secret).update(bodyString).digest('hex');

    const lead = createTestLead(20, 'prospect');
    mockBuscarLeadPorId.mockResolvedValue(Result.ok(lead));

    const updatedLead = createTestLead(30, 'qualified');
    mockAtualizarLead.mockResolvedValue(Result.ok(updatedLead));

    const req = new NextRequest('http://localhost/api/webhooks/delivery-events', {
      method: 'POST',
      headers: {
        'x-hub-signature-256': `sha256=${signature}`
      },
      body: bodyString
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    
    expect(mockAtualizarLead).toHaveBeenCalledWith('test-lead-id', 'test-prop-id', {
      score: 30,
      status: 'qualified'
    });
  });
});
