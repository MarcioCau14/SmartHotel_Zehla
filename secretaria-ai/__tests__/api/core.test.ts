import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRequest, createMockDb, expectJson } from '../helpers/test-utils';

vi.mock('@/lib/db', () => ({ db: createMockDb() }));
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn(),
    withRequest: vi.fn().mockReturnThis(),
    getBufferStats: vi.fn().mockReturnValue({ total: 0, high: 0, medium: 0, low: 0 }),
  },
}));
vi.mock('@/lib/monitoring', () => ({
  getSystemMetrics: vi.fn().mockReturnValue({
    uptime: 3600,
    uptimeHuman: '1h',
    memory: { rss: 50 * 1024 * 1024, heapUsed: 25 * 1024 * 1024, heapTotal: 30 * 1024 * 1024 },
    cpu: { user: 10, system: 5 },
    loadAvg: [1, 2, 1],
  }),
  getCounters: vi.fn().mockReturnValue([]),
  getTimers: vi.fn().mockReturnValue([]),
  getRequestStats: vi.fn().mockReturnValue([]),
  getHealthChecks: vi.fn().mockReturnValue([]),
}));
vi.mock('@/lib/ai/zaos-neuro-router', () => ({
  getNeuroRouter: vi.fn().mockReturnValue({
    generate: vi.fn().mockResolvedValue({ text: 'mock response' }),
    getProviders: vi.fn().mockResolvedValue([]),
    health: vi.fn().mockResolvedValue({ status: 'healthy' }),
  }),
}));

import { GET as healthGet } from '@/app/api/health/route';
import { POST as readinessPost } from '@/app/api/readiness/route';
import { GET as monitoringGet } from '@/app/api/monitoring/route';
import { GET as brainHealthGet } from '@/app/api/brain/health/route';
import { GET as agentsGet } from '@/app/api/agents/route';
import { GET as tenantsGet } from '@/app/api/tenants/route';
import { GET as securityGet } from '@/app/api/security/route';

import { db } from '@/lib/db';

describe('Core API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/health', () => {
    it('returns 200 with status ok', async () => {
      const req = createRequest('/api/health');
      const res = await healthGet(req);
      const body = await expectJson(res, 200);
      expect(body.status).toBe('ok');
    });
  });

  describe('POST /api/readiness', () => {
    it('returns 200 with readiness score and category', async () => {
      const req = createRequest('/api/readiness', {
        method: 'POST',
        body: {
          hasPMS: true, hasChannelManager: true, hasBookingEngine: true,
          hasWhatsAppAutomation: true, hasReviewAutomation: false,
          hasConsolidatedDatabase: false, hasHistoricalData: false,
          teamOpenToAI: true, teamTrained: true,
        },
      });
      const res = await readinessPost(req);
      const body = await expectJson(res, 200);
      expect(body.score).toBeDefined();
      expect(body.category).toBeDefined();
    });
  });

  describe('GET /api/monitoring', () => {
    it('returns 200 with monitoring data', async () => {
      const req = createRequest('/api/monitoring');
      const res = await monitoringGet(req);
      const body = await expectJson(res, 200);
      expect(body.ok).toBe(true);
      expect(body.health).toBeDefined();
    });
  });

  describe('GET /api/brain/health', () => {
    it('returns 200 with brain health data', async () => {
      const req = createRequest('/api/brain/health');
      const res = await brainHealthGet(req);
      const body = await expectJson(res, 200);
      expect(body.edge_latency).toBeDefined();
      expect(body.brain_queue).toBeDefined();
    });
  });

  describe('GET /api/agents', () => {
    it('returns 200 with agents list', async () => {
      const req = createRequest('/api/agents');
      const res = await agentsGet(req);
      const body = await expectJson(res, 200);
      expect(Array.isArray(body.agents)).toBe(true);
    });
  });

  describe('GET /api/tenants', () => {
    it('returns 200 with tenants list', async () => {
      (db.tenant.findMany as any).mockResolvedValue([
        { id: 't1', name: 'Pousada A', plan: 'pro' },
      ]);
      const req = createRequest('/api/tenants');
      const res = await tenantsGet(req);
      const body = await expectJson(res, 200);
      expect(body.tenants).toBeDefined();
    });

    it('returns 200 with empty array when no tenants', async () => {
      (db.tenant.findMany as any).mockResolvedValue([]);
      const req = createRequest('/api/tenants');
      const res = await tenantsGet(req);
      const body = await expectJson(res, 200);
      expect(body.tenants).toHaveLength(0);
    });
  });

  describe('GET /api/security', () => {
    it('returns 200 with security status', async () => {
      const req = createRequest('/api/security');
      const res = await securityGet(req);
      const body = await expectJson(res, 200);
      expect(body.status).toBeDefined();
    });
  });
});
