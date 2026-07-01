import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockDb } from '../helpers/test-utils';

vi.mock('@/lib/db', () => ({ db: createMockDb() }));

import { resolveTenantByPhone } from '@/lib/resolve-tenant-by-phone';
import { db } from '@/lib/db';

const mockDb = db as any;

describe('resolveTenantByPhone', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('resolves tenant by exact phone number match', async () => {
    mockDb.tenant.findFirst.mockResolvedValueOnce({ id: 'tenant-123', name: 'Pousada Sol e Mar' });
    const result = await resolveTenantByPhone('5511999999999');
    expect(result).toBe('tenant-123');
  });

  it('falls back to the first active tenant if no phone number matches', async () => {
    // First call returns null (not found), second returns fallback tenant
    mockDb.tenant.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 'tenant-fallback', name: 'Fallback Pousada' });

    const result = await resolveTenantByPhone('nonexistent');
    expect(result).toBe('tenant-fallback');
  });
});
