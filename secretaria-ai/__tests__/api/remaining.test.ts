import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { createRequest, expectSuccess, expectError } from '../helpers/test-utils';

const { mockDb, _now } = vi.hoisted(() => {
  const _now = new Date('2025-06-24T12:00:00.000Z');
  const m = (val: unknown = []) => vi.fn().mockResolvedValue(val);
  const createModel = () => ({
    findMany: m([]), findUnique: m(null), findFirst: m(null),
    create: vi.fn().mockImplementation((args: { data?: Record<string, unknown> }) => ({
      id: 'mock-id', ...args?.data, createdAt: _now, updatedAt: _now,
    })),
    update: vi.fn().mockImplementation((args: { data?: Record<string, unknown> }) => ({
      id: 'mock-id', ...args?.data, createdAt: _now, updatedAt: _now,
    })),
    updateMany: vi.fn().mockResolvedValue({ count: 0 }),
    delete: vi.fn().mockResolvedValue({ id: 'mock-id', createdAt: _now, updatedAt: _now }),
    count: m(0), aggregate: vi.fn().mockResolvedValue({ _sum: { totalValue: 0, costUsd: 0 } }),
    groupBy: m([]),
  });
  return {
    mockDb: { agentLog: createModel(), routerProvider: createModel(), budgetGuardState: createModel(), paymentTransaction: createModel(), subscription: createModel() },
    _now,
  };
});

vi.mock('next-auth', () => ({
  getServerSession: vi.fn().mockResolvedValue({ user: { tenantId: 'test-tenant' } }),
}));

vi.mock('@/lib/rate-limit', () => ({
  apiRatelimit: { limit: vi.fn().mockResolvedValue({ success: true }) },
  authRatelimit: { limit: vi.fn().mockResolvedValue({ success: true }) },
}));

vi.mock('@/lib/db', () => ({ db: mockDb }));

import { GET as agentLogsGet } from '@/app/api/agent-logs/route';
import { GET as providersGet, POST as providersPost } from '@/app/api/router/providers/route';
import { GET as budgetGet, POST as budgetPost } from '@/app/api/router/budget/route';
import { GET as pixStatusGet } from '@/app/api/checkout/pix-status/route';
import { GET as checkoutCancelGet } from '@/app/api/checkout/cancel/route';
import { GET as rootGet } from '@/app/api/route';

async function expectJson(res: Response): Promise<Record<string, unknown>> {
  const body = await res.json();
  return body;
}

function expectSuccessBody(body: Record<string, unknown>): Record<string, unknown> {
  expectSuccess(body);
  return body;
}

function expectErrorBody(body: Record<string, unknown>): Record<string, unknown> {
  expectError(body);
  return body;
}

describe('Remaining routes', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('GET /api/agent-logs', () => {
    it('returns array with ISO dates', async () => {
      mockDb.agentLog.findMany.mockResolvedValue([{ id: 'log-1', agentId: 'a1', action: 'test', createdAt: _now }]);
      const res = await agentLogsGet(createRequest('/api/agent-logs'));
      const body = await expectJson(res);
      expect(Array.isArray(body)).toBe(true);
      expect(body[0].createdAt).toBe(_now.toISOString());
    });
    it('respects limit param', async () => {
      mockDb.agentLog.findMany.mockResolvedValue([]);
      await agentLogsGet(createRequest('/api/agent-logs?limit=5'));
      expect(mockDb.agentLog.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 5 }));
    });
    it('respects agentId filter', async () => {
      mockDb.agentLog.findMany.mockResolvedValue([]);
      await agentLogsGet(createRequest('/api/agent-logs?agentId=a42'));
      expect(mockDb.agentLog.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { agentId: 'a42' } }));
    });
    it('defaults to limit=10', async () => {
      mockDb.agentLog.findMany.mockResolvedValue([]);
      await agentLogsGet(createRequest('/api/agent-logs'));
      expect(mockDb.agentLog.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 10 }));
    });
  });

  describe('GET /api/router/providers', () => {
    it('returns array with ISO dates', async () => {
      mockDb.routerProvider.findMany.mockResolvedValue([{ id: 'p1', provider: 'groq', alpha: 5, beta: 2, circuitStatus: 'closed', lastFailureAt: null, createdAt: _now, updatedAt: _now }]);
      const res = await providersGet(createRequest('/api/router/providers'));
      const body = await expectJson(res);
      expect(Array.isArray(body)).toBe(true);
      expect(body[0].lastFailureAt).toBeNull();
      expect(body[0].createdAt).toBe(_now.toISOString());
    });
    it('returns empty array', async () => {
      mockDb.routerProvider.findMany.mockResolvedValue([]);
      const res = await providersGet(createRequest('/api/router/providers'));
      const body = await expectJson(res);
      expect(body).toEqual([]);
    });
  });

  describe('POST /api/router/providers', () => {
    it('400 missing fields', async () => {
      const res = await providersPost(createRequest('/api/router/providers', { method: 'POST', body: { providerId: 'p1' } }));
      expect(res.status).toBe(400);
    });
    it('404 not found', async () => {
      mockDb.routerProvider.findUnique.mockResolvedValue(null);
      const res = await providersPost(createRequest('/api/router/providers', { method: 'POST', body: { providerId: 'x', success: true, latencyMs: 100 } }));
      const body = await expectJson(res);
      expect(res.status).toBe(404);
      expect(body.error).toContain('não encontrado');
    });
    it('200 success=true', async () => {
      const p = { id: 'p1', alpha: 10, beta: 2, successCount: 10, failureCount: 2, avgLatencyMs: 150, circuitStatus: 'closed', lastFailureAt: null, createdAt: _now, updatedAt: _now };
      mockDb.routerProvider.findUnique.mockResolvedValue(p);
      mockDb.routerProvider.update.mockResolvedValue({ ...p, alpha: 11 });
      const res = await providersPost(createRequest('/api/router/providers', { method: 'POST', body: { providerId: 'p1', success: true, latencyMs: 200 } }));
      const body = await expectJson(res);
      expect(body.alpha).toBe(11);
    });
    it('200 success=false', async () => {
      const p = { id: 'p1', alpha: 10, beta: 2, successCount: 10, failureCount: 2, avgLatencyMs: 150, circuitStatus: 'closed', lastFailureAt: null, createdAt: _now, updatedAt: _now };
      mockDb.routerProvider.findUnique.mockResolvedValue(p);
      mockDb.routerProvider.update.mockResolvedValue({ ...p, beta: 3, failureCount: 3 });
      const res = await providersPost(createRequest('/api/router/providers', { method: 'POST', body: { providerId: 'p1', success: false, latencyMs: 300 } }));
      const body = await expectJson(res);
      expect(body.beta).toBe(3);
    });
  });

  describe('GET /api/router/budget', () => {
    it('returns state with ISO dates', async () => {
      mockDb.budgetGuardState.findUnique.mockResolvedValue({ id: 'b1', date: '2025-06-24', dailySpendUsd: 25, dailyBudgetUsd: 50, monthlySpendUsd: 500, monthlyBudgetUsd: 1500, criticalLevel: 'nominal', createdAt: _now, updatedAt: _now });
      const res = await budgetGet(createRequest('/api/router/budget'));
      const body = await expectJson(res);
      expect(body.createdAt).toBe(_now.toISOString());
      expect(body.dailySpendUsd).toBe(25);
    });
    it('creates state if not exists', async () => {
      mockDb.budgetGuardState.findUnique.mockResolvedValue(null);
      mockDb.budgetGuardState.create.mockResolvedValue({ id: 'bn', date: '2025-06-24', dailySpendUsd: 0, dailyBudgetUsd: 50, monthlySpendUsd: 0, monthlyBudgetUsd: 1500, criticalLevel: 'nominal', createdAt: _now, updatedAt: _now });
      await budgetGet(createRequest('/api/router/budget'));
      expect(mockDb.budgetGuardState.create).toHaveBeenCalledTimes(1);
    });
    it('critical when daily > 0.9', async () => {
      mockDb.budgetGuardState.findUnique.mockResolvedValue({ id: 'b1', date: '2025-06-24', dailySpendUsd: 46, dailyBudgetUsd: 50, monthlySpendUsd: 100, monthlyBudgetUsd: 1500, criticalLevel: 'nominal', createdAt: _now, updatedAt: _now });
      const res = await budgetGet(createRequest('/api/router/budget'));
      const body = await expectJson(res);
      expect(body.criticalLevel).toBe('critical');
    });
    it('warning when daily > 0.7', async () => {
      mockDb.budgetGuardState.findUnique.mockResolvedValue({ id: 'b1', date: '2025-06-24', dailySpendUsd: 40, dailyBudgetUsd: 50, monthlySpendUsd: 100, monthlyBudgetUsd: 1500, criticalLevel: 'nominal', createdAt: _now, updatedAt: _now });
      const res = await budgetGet(createRequest('/api/router/budget'));
      const body = await expectJson(res);
      expect(body.criticalLevel).toBe('warning');
    });
    it('nominal when low', async () => {
      mockDb.budgetGuardState.findUnique.mockResolvedValue({ id: 'b1', date: '2025-06-24', dailySpendUsd: 20, dailyBudgetUsd: 50, monthlySpendUsd: 500, monthlyBudgetUsd: 1500, criticalLevel: 'nominal', createdAt: _now, updatedAt: _now });
      const res = await budgetGet(createRequest('/api/router/budget'));
      const body = await expectJson(res);
      expect(body.criticalLevel).toBe('nominal');
    });
  });

  describe('POST /api/router/budget', () => {
    it('400 negative costUsd', async () => {
      const res = await budgetPost(createRequest('/api/router/budget', { method: 'POST', body: { costUsd: -5 } }));
      expect(res.status).toBe(400);
    });
    it('400 non-number', async () => {
      const res = await budgetPost(createRequest('/api/router/budget', { method: 'POST', body: { costUsd: 'abc' } }));
      expect(res.status).toBe(400);
    });
    it('200 updated spend', async () => {
      mockDb.budgetGuardState.findUnique.mockResolvedValue({ id: 'b1', date: '2025-06-24', dailySpendUsd: 10, dailyBudgetUsd: 50, monthlySpendUsd: 100, monthlyBudgetUsd: 1500, criticalLevel: 'nominal', createdAt: _now, updatedAt: _now });
      mockDb.budgetGuardState.update.mockImplementation((args: any) => ({ ...args.data, id: 'b1', dailyBudgetUsd: 50, monthlyBudgetUsd: 1500, createdAt: _now, updatedAt: _now }));
      const res = await budgetPost(createRequest('/api/router/budget', { method: 'POST', body: { costUsd: 5 } }));
      const body = await expectJson(res);
      expect(body.dailySpendUsd).toBe(15);
      expect(body.criticalLevel).toBe('nominal');
    });
    it('warning on POST', async () => {
      mockDb.budgetGuardState.findUnique.mockResolvedValue({ id: 'b1', date: '2025-06-24', dailySpendUsd: 35, dailyBudgetUsd: 50, monthlySpendUsd: 100, monthlyBudgetUsd: 1500, criticalLevel: 'nominal', createdAt: _now, updatedAt: _now });
      mockDb.budgetGuardState.update.mockImplementation((args: any) => ({ ...args.data, id: 'b1', dailyBudgetUsd: 50, monthlyBudgetUsd: 1500, createdAt: _now, updatedAt: _now }));
      const res = await budgetPost(createRequest('/api/router/budget', { method: 'POST', body: { costUsd: 5 } }));
      const body = await expectJson(res);
      expect(body.criticalLevel).toBe('warning');
    });
    it('critical on POST', async () => {
      mockDb.budgetGuardState.findUnique.mockResolvedValue({ id: 'b1', date: '2025-06-24', dailySpendUsd: 44, dailyBudgetUsd: 50, monthlySpendUsd: 100, monthlyBudgetUsd: 1500, criticalLevel: 'nominal', createdAt: _now, updatedAt: _now });
      mockDb.budgetGuardState.update.mockImplementation((args: any) => ({ ...args.data, id: 'b1', dailyBudgetUsd: 50, monthlyBudgetUsd: 1500, createdAt: _now, updatedAt: _now }));
      const res = await budgetPost(createRequest('/api/router/budget', { method: 'POST', body: { costUsd: 5 } }));
      const body = await expectJson(res);
      expect(body.criticalLevel).toBe('critical');
    });
  });

  describe('GET /api/checkout/pix-status', () => {
    const orig = process.env.MP_ACCESS_TOKEN;
    beforeEach(() => { delete process.env.MP_ACCESS_TOKEN; });
    afterAll(() => { if (orig !== undefined) process.env.MP_ACCESS_TOKEN = orig; });
    it('400 missing payment_id', async () => {
      const res = await pixStatusGet(createRequest('/api/checkout/pix-status') as any);
      expect(res.status).toBe(400);
    });
    it('500 MP not configured', async () => {
      (mockDb.paymentTransaction.findFirst as any).mockResolvedValue({
        id: 'tx-1',
        externalId: 'pay1',
        subscriptionId: 'sub-1',
      });
      (mockDb.subscription.findUnique as any).mockResolvedValue({
        id: 'sub-1',
        tenantId: 'test-tenant',
      });
      const res = await pixStatusGet(createRequest('/api/checkout/pix-status?payment_id=pay1') as any);
      const body = await res.json();
      expect(res.status).toBe(500);
      expect(body.error).toBeDefined();
    });
  });

  describe('GET /api/checkout/cancel', () => {
    it('redirects to /?payment=cancelled', async () => {
      const res = await checkoutCancelGet(createRequest('/api/checkout/cancel') as any);
      expect(res.status).toBe(307);
      expect(res.headers.get('Location')).toContain('/?payment=cancelled');
    });
  });

  describe('GET /api (root)', () => {
    it('returns API info', async () => {
      const res = await rootGet();
      const body = await expectJson(res);
      expect(body.api).toBe('ZEHLA SmartHotel API');
      expect(body.version).toBe('2.0');
      expect(body.endpoints).toBeDefined();
      expect(body.endpoints.total).toBeGreaterThan(0);
    });
  });
});
