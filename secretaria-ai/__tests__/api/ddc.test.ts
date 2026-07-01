import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createRequest,
  createMockDb,
  expectJson,
  expectSuccess,
  mockGuest,
  mockBooking,
  mockConversation,
  mockNotification,
  mockTrainingPrompt,
} from '../helpers/test-utils';

vi.mock('@/lib/db', () => ({ db: createMockDb() }));

// Mock resolveTenantId to avoid NextAuth dependency
vi.mock('@/lib/ddc/auth-utils', () => ({
  resolveTenantId: vi.fn().mockResolvedValue('tenant-test-001'),
}));

import { db } from '@/lib/db';

import {
  GET as getGuests,
  POST as createGuest,
} from '@/app/api/ddc/guests/route';
import {
  GET as getGuest,
  PUT as updateGuest,
  DELETE as deleteGuest,
} from '@/app/api/ddc/guests/[id]/route';
import {
  GET as getBookings,
  POST as createBooking,
} from '@/app/api/ddc/bookings/route';
import {
  GET as getConversations,
  DELETE as deleteConversation,
} from '@/app/api/ddc/conversations/route';
import {
  GET as getNotifications,
  PUT as updateNotification,
} from '@/app/api/ddc/notifications/route';
import { PUT as markAllRead } from '@/app/api/ddc/notifications/read-all/route';
import {
  GET as getTraining,
  POST as createTraining,
} from '@/app/api/ddc/training/route';
import { GET as getMetrics } from '@/app/api/ddc/metrics/route';
import { GET as getAIStatus } from '@/app/api/ddc/ai-status/route';

describe('DDC API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ════════════════════════════════════════════════════════════════════
  // GUESTS
  // ════════════════════════════════════════════════════════════════════
  describe('GET /api/ddc/guests', () => {
    it('returns 200 with guests list', async () => {
      (db.guest.findMany as any).mockResolvedValue([mockGuest]);
      const req = createRequest('/api/ddc/guests');
      const res = await getGuests(req);
      const body = await expectJson(res, 200);
      expectSuccess(body);
      expect(body.data.items).toHaveLength(1);
    });

    it('passes tenantId filter to Prisma', async () => {
      (db.guest.findMany as any).mockResolvedValue([]);
      const req = createRequest('/api/ddc/guests');
      await getGuests(req);
      const calledWith = (db.guest.findMany as any).mock.calls[0][0];
      expect(calledWith.where.tenantId).toBe('tenant-test-001');
    });

    it('passes status filter when provided', async () => {
      (db.guest.findMany as any).mockResolvedValue([]);
      const req = createRequest('/api/ddc/guests', {
        searchParams: { status: 'hot' },
      });
      await getGuests(req);
      const calledWith = (db.guest.findMany as any).mock.calls[0][0];
      expect(calledWith.where.status).toBe('hot');
    });

    it('passes search filter for name/phone/email', async () => {
      (db.guest.findMany as any).mockResolvedValue([]);
      const req = createRequest('/api/ddc/guests', {
        searchParams: { search: 'Maria' },
      });
      await getGuests(req);
      const calledWith = (db.guest.findMany as any).mock.calls[0][0];
      expect(calledWith.where.OR).toBeDefined();
    });
  });

  describe('POST /api/ddc/guests', () => {
    it('creates a guest and returns 201', async () => {
      (db.guest.create as any).mockResolvedValue(mockGuest);
      const req = createRequest('/api/ddc/guests', {
        method: 'POST',
        body: { name: 'Maria', phoneNumber: '+5521999990001' },
      });
      const res = await createGuest(req);
      const body = await expectJson(res, 201);
      expectSuccess(body);
      expect(db.guest.create).toHaveBeenCalledOnce();
    });

    it('returns 400 when name is missing', async () => {
      const req = createRequest('/api/ddc/guests', {
        method: 'POST',
        body: { phoneNumber: '+5521999990001' },
      });
      const res = await createGuest(req);
      expect(res.status).toBe(400);
    });

    it('returns 400 when phoneNumber is missing', async () => {
      const req = createRequest('/api/ddc/guests', {
        method: 'POST',
        body: { name: 'Maria' },
      });
      const res = await createGuest(req);
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/ddc/guests/[id]', () => {
    it('returns 200 with single guest', async () => {
      (db.guest.findUnique as any).mockResolvedValue(mockGuest);
      const req = createRequest('/api/ddc/guests/guest-1');
      const res = await getGuest(req, { params: Promise.resolve({ id: 'guest-1' }) });
      const body = await expectJson(res, 200);
      expectSuccess(body);
    });

    it('returns 404 when guest not found', async () => {
      (db.guest.findUnique as any).mockResolvedValue(null);
      const req = createRequest('/api/ddc/guests/nonexistent');
      const res = await getGuest(req, { params: Promise.resolve({ id: 'nonexistent' }) });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/ddc/guests/[id]', () => {
    it('deletes and returns 200', async () => {
      (db.guest.findUnique as any).mockResolvedValue(mockGuest);
      (db.guest.delete as any).mockResolvedValue(mockGuest);
      const req = createRequest('/api/ddc/guests/guest-1', { method: 'DELETE' });
      const res = await deleteGuest(req, { params: Promise.resolve({ id: 'guest-1' }) });
      expect(res.status).toBe(200);
    });
  });

  // ════════════════════════════════════════════════════════════════════
  // BOOKINGS
  // ════════════════════════════════════════════════════════════════════
  describe('GET /api/ddc/bookings', () => {
    it('returns 200 with bookings list', async () => {
      (db.booking.findMany as any).mockResolvedValue([mockBooking]);
      const req = createRequest('/api/ddc/bookings');
      const res = await getBookings(req);
      const body = await expectJson(res, 200);
      expectSuccess(body);
      expect(body.data.items).toHaveLength(1);
    });
  });

  describe('POST /api/ddc/bookings', () => {
    it('creates booking and returns 201', async () => {
      (db.booking.create as any).mockResolvedValue(mockBooking);
      const req = createRequest('/api/ddc/bookings', {
        method: 'POST',
        body: {
          guestId: 'guest-1',
          guestName: 'Maria Silva',
          roomName: 'Suite Master',
          checkIn: '2026-08-01',
          checkOut: '2026-08-04',
          total: 1200,
          paymentMethod: 'pix',
          source: 'whatsapp_ai',
        },
      });
      const res = await createBooking(req);
      const body = await expectJson(res, 201);
      expectSuccess(body);
    });

    it('returns 400 when required fields missing', async () => {
      const req = createRequest('/api/ddc/bookings', {
        method: 'POST',
        body: { guestId: 'guest-1' },
      });
      const res = await createBooking(req);
      expect(res.status).toBe(400);
    });
  });

  // ════════════════════════════════════════════════════════════════════
  // CONVERSATIONS
  // ════════════════════════════════════════════════════════════════════
  describe('GET /api/ddc/conversations', () => {
    it('returns 200 with conversations list', async () => {
      (db.conversationLog.findMany as any).mockResolvedValue([mockConversation]);
      const req = createRequest('/api/ddc/conversations');
      const res = await getConversations(req);
      const body = await expectJson(res, 200);
      expectSuccess(body);
    });
  });

  describe('DELETE /api/ddc/conversations', () => {
    it('deletes conversation and returns 200', async () => {
      (db.conversationLog.delete as any).mockResolvedValue(mockConversation);
      const req = createRequest('/api/ddc/conversations', {
        method: 'DELETE',
        body: { conversationId: 'conv-1' },
      });
      const res = await deleteConversation(req);
      expect(res.status).toBe(200);
    });
  });

  // ════════════════════════════════════════════════════════════════════
  // NOTIFICATIONS
  // ════════════════════════════════════════════════════════════════════
  describe('GET /api/ddc/notifications', () => {
    it('returns 200 with notifications', async () => {
      (db.notification.findMany as any).mockResolvedValue([mockNotification]);
      const req = createRequest('/api/ddc/notifications');
      const res = await getNotifications(req);
      const body = await expectJson(res, 200);
      expectSuccess(body);
    });
  });

  describe('PUT /api/ddc/notifications/read-all', () => {
    it('marks all as read and returns 200', async () => {
      (db.notification.updateMany as any).mockResolvedValue({ count: 5 });
      const req = createRequest('/api/ddc/notifications/read-all', {
        method: 'PUT',
      });
      const res = await markAllRead(req);
      const body = await expectJson(res, 200);
      expectSuccess(body);
      expect(db.notification.updateMany).toHaveBeenCalledOnce();
    });
  });

  // ════════════════════════════════════════════════════════════════════
  // TRAINING
  // ════════════════════════════════════════════════════════════════════
  describe('GET /api/ddc/training', () => {
    it('returns 200 with training prompts', async () => {
      (db.trainingPrompt.findMany as any).mockResolvedValue([mockTrainingPrompt]);
      const req = createRequest('/api/ddc/training');
      const res = await getTraining(req);
      const body = await expectJson(res, 200);
      expectSuccess(body);
    });
  });

  describe('POST /api/ddc/training', () => {
    it('creates training prompt and returns 201', async () => {
      (db.trainingPrompt.create as any).mockResolvedValue(mockTrainingPrompt);
      const req = createRequest('/api/ddc/training', {
        method: 'POST',
        body: {
          title: 'Test Prompt',
          category: 'persona',
          content: 'Você é um assistente...',
        },
      });
      const res = await createTraining(req);
      const body = await expectJson(res, 201);
      expectSuccess(body);
    });
  });

  // ════════════════════════════════════════════════════════════════════
  // METRICS
  // ════════════════════════════════════════════════════════════════════
  describe('GET /api/ddc/metrics', () => {
    it('returns 200 with metrics data', async () => {
      (db.performanceSnapshot.findMany as any).mockResolvedValue([]);
      (db.booking.findMany as any).mockResolvedValue([]);
      (db.conversationLog.findMany as any).mockResolvedValue([]);
      (db.aIActivityLog.findMany as any).mockResolvedValue([]);
      (db.room.count as any).mockResolvedValue(8);

      const req = createRequest('/api/ddc/metrics');
      const res = await getMetrics(req);
      const body = await expectJson(res, 200);
      expectSuccess(body);
      expect(typeof body.data.attendedToday).toBe('number');
      expect(body.data.revenue).toBeDefined();
    });

    it('supports period filter', async () => {
      (db.performanceSnapshot.findMany as any).mockResolvedValue([]);
      (db.booking.findMany as any).mockResolvedValue([]);
      (db.conversationLog.findMany as any).mockResolvedValue([]);
      (db.aIActivityLog.findMany as any).mockResolvedValue([]);
      (db.room.count as any).mockResolvedValue(8);

      const req = createRequest('/api/ddc/metrics', {
        searchParams: { period: 'week' },
      });
      const res = await getMetrics(req);
      expect(res.status).toBe(200);
    });
  });

  // ════════════════════════════════════════════════════════════════════
  // AI STATUS
  // ════════════════════════════════════════════════════════════════════
  describe('GET /api/ddc/ai-status', () => {
    it('returns 200 with AI status', async () => {
      (db.conversationLog.count as any)
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(15);
      (db.aIActivityLog.findMany as any).mockResolvedValue([]);
      (db.aIActivityLog.findFirst as any).mockResolvedValue({
        duration: 1200,
        timestamp: new Date(),
      });

      const req = createRequest('/api/ddc/ai-status');
      const res = await getAIStatus(req);
      const body = await expectJson(res, 200);
      expectSuccess(body);
      expect(body.data.activeConversations).toBe(3);
      expect(body.data.totalToday).toBe(15);
      expect(typeof body.data.averageResponseTime).toBe('number');
    });
  });
});
