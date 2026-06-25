import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRequest, createMockDb, expectJson } from '../helpers/test-utils';

vi.mock('@/lib/db', () => ({ db: createMockDb() }));
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn(),
    withRequest: vi.fn().mockReturnThis(),
  },
}));

import { db } from '@/lib/db';
import { GET as getLeads, POST as createLead } from '@/app/api/leads/route';
import { GET as getTargets, POST as createTarget } from '@/app/api/targets/route';
import { GET as getCampaigns, POST as createCampaign } from '@/app/api/campaigns/route';
import { GET as getSwipeTemplates } from '@/app/api/swipe-templates/route';
import { POST as bulkWhatsApp } from '@/app/api/bulk-whatsapp/route';
import { POST as diagnose } from '@/app/api/diagnose/route';
import { GET as dashboardOverview } from '@/app/api/dashboard/overview/route';

describe('CRUD API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Leads ───────────────────────────────────────────────────────
  describe('GET /api/leads', () => {
    const now = new Date();
    it('returns 200 with leads list', async () => {
      (db.lead.findMany as any).mockResolvedValue([
        { id: 'l1', empresa: 'Pousada Sol', status: 'pending', createdAt: now, updatedAt: now },
      ]);
      (db.lead.count as any).mockResolvedValue(1);
      const req = createRequest('/api/leads');
      const res = await getLeads(req);
      const body = await expectJson(res, 200);
      expect(body.data).toBeDefined();
    });
  });

  describe('POST /api/leads', () => {
    it('creates a lead and returns 201', async () => {
      (db.lead.create as any).mockResolvedValue({
        id: 'l1', empresa: 'Pousada Lua', status: 'pending',
        createdAt: new Date(), updatedAt: new Date(),
      });
      const req = createRequest('/api/leads', {
        method: 'POST',
        body: { empresa: 'Pousada Lua', decisor: 'João', email: 'joao@lua.com' },
      });
      const res = await createLead(req);
      expect(res.status).toBe(201);
    });
  });

  // ── Targets ────────────────────────────────────────────────────
  describe('GET /api/targets', () => {
    const now = new Date();
    it('returns 200 with targets list', async () => {
      (db.target.findMany as any).mockResolvedValue([
        { id: 't1', name: 'Pousada Serenity', status: 'active', createdAt: now, updatedAt: now },
      ]);
      const req = createRequest('/api/targets');
      const res = await getTargets(req);
      const body = await expectJson(res, 200);
      expect(Array.isArray(body)).toBe(true);
    });
  });

  describe('POST /api/targets', () => {
    it('creates a target and returns 201', async () => {
      (db.target.create as any).mockResolvedValue({
        id: 't1', name: 'Hotel Beira Rio', domain: 'beirario.com',
        createdAt: new Date(), updatedAt: new Date(),
      });
      const req = createRequest('/api/targets', {
        method: 'POST',
        body: { name: 'Hotel Beira Rio', domain: 'beirario.com' },
      });
      const res = await createTarget(req);
      expect(res.status).toBe(201);
    });
  });

  // ── Campaigns ───────────────────────────────────────────────────
  describe('GET /api/campaigns', () => {
    const now = new Date();
    it('returns 200 with campaigns list', async () => {
      (db.campaign.findMany as any).mockResolvedValue([
        { id: 'c1', name: 'Campanha Verão', status: 'active', createdAt: now, updatedAt: now },
      ]);
      const req = createRequest('/api/campaigns');
      const res = await getCampaigns(req);
      const body = await expectJson(res, 200);
      expect(Array.isArray(body)).toBe(true);
    });
  });

  describe('POST /api/campaigns', () => {
    it('creates a campaign and returns 201', async () => {
      (db.campaign.create as any).mockResolvedValue({
        id: 'c1', name: 'Black Friday', status: 'draft',
        createdAt: new Date(), updatedAt: new Date(),
      });
      const req = createRequest('/api/campaigns', {
        method: 'POST',
        body: { name: 'Black Friday', type: 'whatsapp' },
      });
      const res = await createCampaign(req);
      expect(res.status).toBe(201);
    });
  });

  // ── Swipe Templates ────────────────────────────────────────────
  describe('GET /api/swipe-templates', () => {
    const now = new Date();
    it('returns 200 with templates list', async () => {
      (db.swipeTemplate.findMany as any).mockResolvedValue([
        { id: 'st1', name: 'Prospecção Inicial', category: 'prospecção', createdAt: now, updatedAt: now },
      ]);
      const req = createRequest('/api/swipe-templates');
      const res = await getSwipeTemplates(req);
      const body = await expectJson(res, 200);
      expect(Array.isArray(body)).toBe(true);
    });
  });

  // ── Bulk WhatsApp ──────────────────────────────────────────────
  describe('POST /api/bulk-whatsapp', () => {
    it('returns 200 for bulk send request', async () => {
      (db.swipeTemplate.findUnique as any).mockResolvedValue({ id: 'st1' });
      const req = createRequest('/api/bulk-whatsapp', {
        method: 'POST',
        body: { templateId: 'st1', leadIds: ['t1', 't2'] },
      });
      const res = await bulkWhatsApp(req);
      expect(res.status).toBe(200);
    });
  });

  // ── Diagnose ────────────────────────────────────────────────────
  describe('POST /api/diagnose', () => {
    it('returns 200 with diagnostic data', async () => {
      (db.lead.findUnique as any).mockResolvedValue({
        id: 'lead-1', empresa: 'Pousada Teste', website: 'pousada.com',
        createdAt: new Date(), updatedAt: new Date(),
      });
      (db.agentLog.create as any).mockResolvedValue({ id: 'log-1' });
      const req = createRequest('/api/diagnose', {
        method: 'POST',
        body: { leadId: 'lead-1' },
      });
      const res = await diagnose(req);
      const body = await expectJson(res, 200);
      expect(body.idp).toBeDefined();
      expect(body.hotelName).toBeDefined();
    });
  });

  // ── Dashboard Overview ─────────────────────────────────────────
  describe('GET /api/dashboard/overview', () => {
    it('returns 200 with dashboard data', async () => {
      const req = createRequest('/api/dashboard/overview');
      const res = await dashboardOverview(req);
      const body = await expectJson(res, 200);
      expect(body).toBeDefined();
    });
  });
});
