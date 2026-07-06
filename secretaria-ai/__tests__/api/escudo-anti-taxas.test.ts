import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockDb } from '../helpers/test-utils';

vi.mock('@/lib/db', () => ({ db: createMockDb() }));

import { db } from '@/lib/db';
import { getEffectivePlan } from '@/lib/plan-resolver';
import { checkZelladorRateLimit } from '@/lib/ddc/rate-limiter';
import { registerOptIn, registerOptOut, canSendMarketing } from '@/lib/lgpd-consent';

const mockDb = db as any;

describe('Escudo Anti-Taxas — Plan, Rate Limiter & LGPD Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1. Plan Resolution Verification
  describe('getEffectivePlan', () => {
    it('prioritizes active subscription planType over tenant plan', async () => {
      mockDb.subscription.findFirst.mockResolvedValueOnce({
        id: 'sub-active',
        planType: 'lite',
        status: 'active',
      });

      const plan = await getEffectivePlan('tenant-1');
      expect(plan).toBe('lite');
      expect(mockDb.subscription.findFirst).toHaveBeenCalled();
    });

    it('falls back to Tenant.plan when no active subscription exists', async () => {
      mockDb.subscription.findFirst.mockResolvedValueOnce(null);
      mockDb.tenant.findUnique.mockResolvedValueOnce({
        id: 'tenant-1',
        plan: 'business', // maps to max
      });

      const plan = await getEffectivePlan('tenant-1');
      expect(plan).toBe('max');
    });

    it('maps starter/gratuito Tenant plan to trial', async () => {
      mockDb.subscription.findFirst.mockResolvedValueOnce(null);
      mockDb.tenant.findUnique.mockResolvedValueOnce({
        id: 'tenant-1',
        plan: 'starter',
      });

      const plan = await getEffectivePlan('tenant-1');
      expect(plan).toBe('trial');
    });
  });

  // 2. Distributed Rate Limiter Verification (Local fallback mode)
  describe('checkZelladorRateLimit', () => {
    it('allows requests within limits and throttles when minute limit is exceeded', async () => {
      const tenantId = 'rate-tenant-1';

      // 10 requests allowed
      for (let i = 0; i < 10; i++) {
        const res = await checkZelladorRateLimit(tenantId);
        expect(res.allowed).toBe(true);
      }

      // 11th request should be blocked
      const blockedRes = await checkZelladorRateLimit(tenantId);
      expect(blockedRes.allowed).toBe(false);
      expect(blockedRes.remainingMinute).toBe(0);
      expect(blockedRes.retryAfterSeconds).toBeDefined();
    });
  });

  // 3. LGPD Consent Verification
  describe('LGPD Consent', () => {
    it('records active Opt-in and allows marketing', async () => {
      mockDb.guest.findFirst.mockResolvedValueOnce({
        optInAt: new Date(),
        optOutAt: null,
      });

      const consent = await canSendMarketing('tenant-1', 'guest-1');
      expect(consent).toBe(true);
    });

    it('denies marketing when guest opted out', async () => {
      mockDb.guest.findFirst.mockResolvedValueOnce({
        optInAt: new Date(),
        optOutAt: new Date(),
      });

      const consent = await canSendMarketing('tenant-1', 'guest-1');
      expect(consent).toBe(false);
    });
  });
});
