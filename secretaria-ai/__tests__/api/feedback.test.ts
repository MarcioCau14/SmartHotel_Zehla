import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRequest, createMockDb, expectJson } from '../helpers/test-utils';

vi.mock('@/lib/db', () => ({ db: createMockDb() }));

vi.mock('@/lib/ddc/auth-utils', () => ({
  resolveTenantId: vi.fn().mockResolvedValue('tenant-123')
}));

import { POST as feedbackPost } from '@/app/api/feedback/route';
import { GET as feedbackStatsGet } from '@/app/api/feedback/stats/route';
import { db } from '@/lib/db';

const mockDb = db as any;

describe('Feedback API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/feedback', () => {
    it('records feedback successfully with valid data', async () => {
      const payload = {
        conversationId: 'conv-456',
        messageId: 'msg-789',
        rating: 5,
        notes: 'Excelente resposta',
        source: 'ddc'
      };

      mockDb.feedback.create.mockResolvedValueOnce({
        id: 'fb-001',
        ...payload,
        tenantId: 'tenant-123',
        createdAt: new Date()
      });

      const req = createRequest('/api/feedback', {
        method: 'POST',
        body: payload
      });

      const res = await feedbackPost(req);
      const body = await expectJson(res, 200);

      expect(body.success).toBe(true);
      expect(body.feedback.id).toBe('fb-001');
      expect(mockDb.feedback.create).toHaveBeenCalled();
    });

    it('returns 400 validation error if fields are invalid', async () => {
      const req = createRequest('/api/feedback', {
        method: 'POST',
        body: { rating: 10 } // Invalid rating
      });

      const res = await feedbackPost(req);
      await expectJson(res, 400);
    });
  });

  describe('GET /api/feedback/stats', () => {
    it('calculates aggregate stats and returns recent feedbacks', async () => {
      mockDb.feedback.findMany.mockResolvedValueOnce([
        { id: 'fb-1', rating: 5, notes: 'Muito bom', tenantId: 'tenant-123', createdAt: new Date(), conversationId: 'c1' },
        { id: 'fb-2', rating: 1, notes: 'Errou o preço', tenantId: 'tenant-123', createdAt: new Date(), conversationId: 'c2' },
        { id: 'fb-3', rating: 5, notes: 'Show', tenantId: 'tenant-123', createdAt: new Date(), conversationId: 'c3' }
      ]);

      const req = createRequest('/api/feedback/stats');
      const res = await feedbackStatsGet();
      const body = await expectJson(res, 200);

      expect(body.success).toBe(true);
      expect(body.stats.totalFeedback).toBe(3);
      expect(body.stats.thumbsUpCount).toBe(2);
      expect(body.stats.thumbsDownCount).toBe(1);
      expect(body.stats.satisfactionRate).toBe(67);
      expect(body.stats.recentFeedbacks.length).toBe(3);
    });
  });
});
