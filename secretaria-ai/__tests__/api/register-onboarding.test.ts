import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRequest, createMockDb, expectJson } from '../helpers/test-utils';

vi.mock('@/lib/db', () => ({ db: createMockDb() }));

import { POST as registerPost } from '@/app/api/auth/register/route';
import { db } from '@/lib/db';

const mockDb = db as any;

describe('POST /api/auth/register (Onboarding Automático)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('performs full onboarding inside transaction when registering new tenant', async () => {
    const payload = {
      name: 'Pousada Recanto Verde',
      email: 'recantoverde@example.com',
      password: 'password123',
      phone: '5511988888888',
      pousadaName: 'Recanto Verde Flat'
    };

    mockDb.tenant.create.mockResolvedValueOnce({ id: 'tenant-green', name: 'Recanto Verde Flat' });
    mockDb.agentConfig.create.mockResolvedValueOnce({ id: 'agent-config-id' });
    mockDb.apiConfig.create.mockResolvedValueOnce({ id: 'api-config-id' });
    mockDb.subscription.create.mockResolvedValueOnce({ id: 'sub-id' });
    mockDb.knowledgeEntry.createMany.mockResolvedValueOnce({ count: 8 });

    const req = createRequest('/api/auth/register', {
      method: 'POST',
      body: payload
    });

    const res = await registerPost(req);
    const body = await expectJson(res, 200);

    expect(body.success).toBe(true);
    expect(body.tenant.id).toBe('tenant-green');
    expect(mockDb.tenant.create).toHaveBeenCalled();
    expect(mockDb.knowledgeEntry.createMany).toHaveBeenCalled();
  });
});
