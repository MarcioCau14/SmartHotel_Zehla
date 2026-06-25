import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRequest, createMockDb, expectJson } from '../helpers/test-utils';

vi.mock('@/lib/db', () => ({ db: createMockDb() }));

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('$2b$10$hashedpassword'),
    compare: vi.fn().mockResolvedValue(true),
  },
  genSalt: vi.fn().mockResolvedValue('$2b$10$'),
}));

vi.mock('next-auth', () => ({
  default: () => null,
}));

import { db } from '@/lib/db';
import { POST as checkoutCreate } from '@/app/api/checkout/create/route';
import { POST as checkoutWebhook } from '@/app/api/checkout/webhook/route';
import { POST as checkoutUpgrade } from '@/app/api/checkout/upgrade/route';
import { POST as checkoutDowngrade } from '@/app/api/checkout/downgrade/route';
import { POST as authRegister } from '@/app/api/auth/register/route';

describe('Checkout API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ════════════════════════════════════════════════════════════════════
  // CHECKOUT CREATE
  // ════════════════════════════════════════════════════════════════════
  describe('POST /api/checkout/create', () => {
    it('creates gratuito plan immediately (no PIX)', async () => {
      (db.user.findUnique as any).mockResolvedValue(null);
      (db.user.create as any).mockResolvedValue({
        id: 'user-1', email: 'test@test.com', name: 'Test',
      });
      (db.tenant.findUnique as any).mockResolvedValue(null);
      (db.tenant.create as any).mockResolvedValue({
        id: 'tenant-1', email: 'test@test.com',
      });
      (db.subscription.create as any).mockResolvedValue({
        id: 'sub-1', tenantId: 'tenant-1', planType: 'gratuito',
      });

      const req = createRequest('/api/checkout/create', {
        method: 'POST',
        body: {
          email: 'test@test.com',
          name: 'Test User',
          planType: 'gratuito',
          paymentMethod: 'pix',
        },
      });
      const res = await checkoutCreate(req);
      const body = await expectJson(res, 200);
      expect(body.success).toBe(true);
      expect(body.subscriptionId).toBeDefined();
    });

    it('returns 400 when missing required fields', async () => {
      const req = createRequest('/api/checkout/create', {
        method: 'POST',
        body: { email: 'test@test.com' },
      });
      const res = await checkoutCreate(req);
      expect(res.status).toBe(400);
    });

    it('returns 400 for invalid plan type', async () => {
      const req = createRequest('/api/checkout/create', {
        method: 'POST',
        body: {
          email: 'test@test.com',
          name: 'Test',
          planType: 'enterprise',
          paymentMethod: 'pix',
        },
      });
      const res = await checkoutCreate(req);
      expect(res.status).toBe(400);
    });
  });

  // ════════════════════════════════════════════════════════════════════
  // CHECKOUT WEBHOOK
  // ════════════════════════════════════════════════════════════════════
  describe('POST /api/checkout/webhook', () => {
    it('returns 200 for unknown payment (graceful)', async () => {
      (db.paymentTransaction.findFirst as any).mockResolvedValue(null);
      const req = createRequest('/api/checkout/webhook', {
        method: 'POST',
        body: {
          action: 'payment.updated',
          type: 'payment',
          data: { id: 'unknown-payment-id' },
        },
      });
      const res = await checkoutWebhook(req);
      const body = await res.json();
      expect(body.received).toBe(true);
    });

    it('returns 200 for non-payment events', async () => {
      const req = createRequest('/api/checkout/webhook', {
        method: 'POST',
        body: { action: 'other.event', type: 'something_else' },
      });
      const res = await checkoutWebhook(req);
      expect(res.status).toBe(200);
    });
  });

  // ════════════════════════════════════════════════════════════════════
  // CHECKOUT UPGRADE
  // ════════════════════════════════════════════════════════════════════
  describe('POST /api/checkout/upgrade', () => {
    it('returns 400 when missing tenantId', async () => {
      const req = createRequest('/api/checkout/upgrade', {
        method: 'POST',
        body: { newPlanType: 'pro' },
      });
      const res = await checkoutUpgrade(req);
      expect(res.status).toBe(400);
    });

    it('returns 400 for invalid plan', async () => {
      const req = createRequest('/api/checkout/upgrade', {
        method: 'POST',
        body: { tenantId: 't1', newPlanType: 'enterprise' },
      });
      const res = await checkoutUpgrade(req);
      expect(res.status).toBe(400);
    });

    it('returns 404 when no subscription exists', async () => {
      (db.subscription.findFirst as any).mockResolvedValue(null);
      const req = createRequest('/api/checkout/upgrade', {
        method: 'POST',
        body: { tenantId: 't1', newPlanType: 'pro' },
      });
      const res = await checkoutUpgrade(req);
      expect(res.status).toBe(404);
    });

    it('returns 400 when trying to downgrade via upgrade', async () => {
      (db.subscription.findFirst as any).mockResolvedValue({
        id: 'sub-1',
        tenantId: 't1',
        planType: 'pro',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 86400000),
        metadata: '{}',
      });
      const req = createRequest('/api/checkout/upgrade', {
        method: 'POST',
        body: { tenantId: 't1', newPlanType: 'lite' },
      });
      const res = await checkoutUpgrade(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toContain('downgrade');
    });

    it('upgrades from lite to pro successfully', async () => {
      (db.subscription.findFirst as any).mockResolvedValue({
        id: 'sub-1',
        tenantId: 't1',
        planType: 'lite',
        currentPeriodStart: new Date(Date.now() - 15 * 86400000),
        currentPeriodEnd: new Date(Date.now() + 15 * 86400000),
        metadata: '{}',
      });
      (db.tenant.findUnique as any).mockResolvedValue({
        id: 't1',
        name: 'Pousada Teste',
        email: 'test@pousada.com',
      });
      (db.paymentTransaction.create as any).mockResolvedValue({
        id: 'tx-1',
        subscriptionId: 'sub-1',
        amount: 148.5,
        status: 'pending',
      });
      (db.subscription.update as any).mockResolvedValue({ id: 'sub-1' });
      (db.tenant.update as any).mockResolvedValue({ id: 't1' });

      const req = createRequest('/api/checkout/upgrade', {
        method: 'POST',
        body: { tenantId: 't1', newPlanType: 'pro' },
      });
      const res = await checkoutUpgrade(req);
      const body = await expectJson(res, 200);
      expect(body.success).toBe(true);
      expect(body.newPlanType).toBe('pro');
      expect(body.proratedCost).toBeDefined();
    });
  });

  // ════════════════════════════════════════════════════════════════════
  // CHECKOUT DOWNGRADE
  // ════════════════════════════════════════════════════════════════════
  describe('POST /api/checkout/downgrade', () => {
    it('returns 400 when missing fields', async () => {
      const req = createRequest('/api/checkout/downgrade', {
        method: 'POST',
        body: {},
      });
      const res = await checkoutDowngrade(req);
      expect(res.status).toBe(400);
    });

    it('returns 404 when no subscription exists', async () => {
      (db.subscription.findFirst as any).mockResolvedValue(null);
      const req = createRequest('/api/checkout/downgrade', {
        method: 'POST',
        body: { tenantId: 't1', newPlanType: 'lite' },
      });
      const res = await checkoutDowngrade(req);
      expect(res.status).toBe(404);
    });

    it('returns 400 when trying to upgrade via downgrade', async () => {
      (db.subscription.findFirst as any).mockResolvedValue({
        id: 'sub-1',
        planType: 'lite',
        currentPeriodEnd: new Date(Date.now() + 15 * 86400000),
        metadata: '{}',
      });
      const req = createRequest('/api/checkout/downgrade', {
        method: 'POST',
        body: { tenantId: 't1', newPlanType: 'pro' },
      });
      const res = await checkoutDowngrade(req);
      expect(res.status).toBe(400);
    });

    it('schedules downgrade from pro to lite', async () => {
      const periodEnd = new Date(Date.now() + 15 * 86400000);
      (db.subscription.findFirst as any).mockResolvedValue({
        id: 'sub-1',
        tenantId: 't1',
        planType: 'pro',
        currentPeriodEnd: periodEnd,
        metadata: '{}',
      });
      (db.subscription.update as any).mockResolvedValue({ id: 'sub-1' });

      const req = createRequest('/api/checkout/downgrade', {
        method: 'POST',
        body: { tenantId: 't1', newPlanType: 'lite' },
      });
      const res = await checkoutDowngrade(req);
      const body = await expectJson(res, 200);
      expect(body.success).toBe(true);
      expect(body.newPlanType).toBe('lite');
      expect(body.effectiveDate).toBeDefined();
      expect(db.subscription.update).toHaveBeenCalledOnce();
    });
  });
});

describe('Auth API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('registers new tenant and returns 200', async () => {
      (db.tenant.findUnique as any).mockResolvedValue(null);
      (db.user.findUnique as any).mockResolvedValue(null);
      (db.user.create as any).mockResolvedValue({
        id: 'user-1', email: 'novo@pousada.com', name: 'João',
      });
      (db.tenant.create as any).mockResolvedValue({
        id: 'tenant-1', name: 'Pousada Nova', email: 'novo@pousada.com',
      });
      const req = createRequest('/api/auth/register', {
        method: 'POST',
        body: {
          email: 'novo@pousada.com',
          name: 'João Pousada',
          password: 'SenhaForte123!',
          pousadaName: 'Pousada Nova',
          phone: '+5521987654321',
        },
      });
      const res = await authRegister(req);
      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(db.tenant.create).toHaveBeenCalledOnce();
    });

    it('returns 400 when email already exists', async () => {
      (db.user.findUnique as any).mockResolvedValue({
        id: 'existing', email: 'ja@existe.com',
      });
      (db.tenant.findUnique as any).mockResolvedValue({
        id: 't-existing', email: 'ja@existe.com',
      });

      const req = createRequest('/api/auth/register', {
        method: 'POST',
        body: {
          email: 'ja@existe.com',
          name: 'João',
          password: 'SenhaForte123!',
          pousadaName: 'Pousada',
          phone: '+5521987654321',
        },
      });
      const res = await authRegister(req);
      expect(res.status).toBe(409);
    });
  });
});
