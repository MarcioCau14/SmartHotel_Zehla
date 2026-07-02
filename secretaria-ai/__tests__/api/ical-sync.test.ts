import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ── Mock DB ──────────────────────────────────────────────────────────────────
const mockBookings = [
  {
    id: 'booking-1',
    roomId: 'room-abc',
    roomName: 'Suíte Beira Mar',
    guestName: 'Maria Silva',
    status: 'confirmed',
    checkIn: new Date('2025-08-15T14:00:00Z'),
    checkOut: new Date('2025-08-17T11:00:00Z'),
    nights: 2,
    guests: 2,
    totalValue: 760,
    source: 'whatsapp_ai',
    aiGenerated: true,
    externalUid: null,
    externalSource: null,
    metadata: '{}',
  },
  {
    id: 'booking-blocked',
    roomId: 'room-abc',
    roomName: 'Suíte Beira Mar',
    guestName: '',
    status: 'blocked',
    checkIn: new Date('2025-08-20T14:00:00Z'),
    checkOut: new Date('2025-08-22T11:00:00Z'),
    nights: 2,
    guests: 0,
    totalValue: 0,
    source: 'direct',
    aiGenerated: false,
    externalUid: null,
    externalSource: null,
    metadata: '{}',
  },
];

const mockRoom = {
  id: 'room-abc',
  name: 'Suíte Beira Mar',
  propertyId: 'prop-1',
  property: {
    id: 'prop-1',
    name: 'Pousada Sol e Mar',
    tenantId: 'tenant-1',
    tenant: {
      id: 'tenant-1',
      email: 'contato@solemar.com.br',
    },
  },
};

const mockSyncConfig = {
  id: 'sync-1',
  tenantId: 'tenant-1',
  roomId: 'room-abc',
  otaName: 'airbnb',
  syncUrl: 'https://airbnb.com/calendar/ical/mock',
  syncToken: 'valid-token-abc123',
  status: 'active',
  lastSync: null,
  errorMessage: '',
  syncCount: 0,
  metadata: '{}',
};

const mockDb: Record<string, any> = {
  booking: {
    findMany: vi.fn().mockResolvedValue(mockBookings),
    upsert: vi.fn().mockImplementation(async (args: any) => ({
      id: 'new-booking-' + Math.random().toString(36).slice(2, 6),
      ...args.create,
    })),
  },
  room: {
    findUnique: vi.fn().mockResolvedValue(mockRoom),
  },
  calendarSync: {
    findUnique: vi.fn().mockResolvedValue(mockSyncConfig),
    findFirst: vi.fn().mockResolvedValue(mockSyncConfig),
    findMany: vi.fn().mockResolvedValue([mockSyncConfig]),
    update: vi.fn().mockImplementation(async (args: any) => ({
      ...mockSyncConfig,
      ...args.data,
    })),
  },
};

vi.mock('@/lib/db', () => ({ db: mockDb }));

// =============================================================================
// 1. Geração de feed .ics
// =============================================================================
describe('iCal Feed Generation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb.booking.findMany.mockResolvedValue(mockBookings);
    mockDb.room.findUnique.mockResolvedValue(mockRoom);
  });

  it('should generate valid .ics feed with VCALENDAR, VEVENT, DTSTART, DTEND, UID', async () => {
    const { generateICalFeed } = await import('@/lib/integrations/ical-service');
    const feed = await generateICalFeed('room-abc');

    expect(feed).toContain('BEGIN:VCALENDAR');
    expect(feed).toContain('END:VCALENDAR');
    expect(feed).toContain('VERSION:2.0');
    expect(feed).toContain('BEGIN:VEVENT');
    expect(feed).toContain('END:VEVENT');
    expect(feed).toContain('DTSTART:');
    expect(feed).toContain('DTEND:');
    expect(feed).toContain('UID:');
    expect(feed).toContain('SUMMARY:');
    expect(feed).toContain('Reserva: Maria Silva');
    expect(feed).toContain('BLOQUEADO');
    expect(feed).toContain('PRODID:-//ZÉLLA SmartHotel//iCal Feed//PT-BR');
  });

  it('should query bookings filtered by roomId and correct statuses', async () => {
    const { generateICalFeed } = await import('@/lib/integrations/ical-service');
    await generateICalFeed('room-abc');

    expect(mockDb.booking.findMany).toHaveBeenCalledWith({
      where: {
        roomId: 'room-abc',
        status: { in: ['confirmed', 'checked_in', 'blocked'] },
      },
      orderBy: { checkIn: 'asc' },
    });
  });
});

// =============================================================================
// 2. Parsing de feed iCal mock
// =============================================================================
describe('iCal Mock Import', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb.calendarSync.findUnique.mockResolvedValue(mockSyncConfig);
    mockDb.calendarSync.update.mockResolvedValue({
      ...mockSyncConfig,
      lastSync: new Date(),
      syncCount: 1,
    });
  });

  it('should import mock bookings without making HTTP requests', async () => {
    const { parseAndImportICal } = await import('@/lib/integrations/ical-service');
    const count = await parseAndImportICal('sync-1');

    expect(count).toBeGreaterThanOrEqual(0);
    expect(mockDb.calendarSync.findUnique).toHaveBeenCalledWith({
      where: { id: 'sync-1' },
    });
  });
});

// =============================================================================
// 3. Deduplicação por externalUid (upsert)
// =============================================================================
describe('Deduplication via externalUid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb.calendarSync.findUnique.mockResolvedValue(mockSyncConfig);
    mockDb.calendarSync.findMany.mockResolvedValue([mockSyncConfig]);
  });

  it('should use upsert to prevent duplicate bookings on repeated sync', async () => {
    const { syncAllActiveChannels } = await import('@/lib/integrations/ical-service');
    await syncAllActiveChannels();

    expect(mockDb.booking.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tenantId_externalUid: expect.any(Object),
        }),
      })
    );
  });
});

// =============================================================================
// 4. Rejeição de token inválido
// =============================================================================
describe('GET /api/integrations/ical/[roomId] - Token Security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should reject request without token (401)', async () => {
    const { GET } = await import('@/app/api/integrations/ical/[roomId]/route');
    const req = new NextRequest('http://localhost:3000/api/integrations/ical/room-abc');
    const res = await GET(req, { params: Promise.resolve({ roomId: 'room-abc' }) });

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toContain('Token');
  });

  it('should reject request with wrong token (403)', async () => {
    mockDb.calendarSync.findFirst.mockResolvedValue(null);
    const { GET } = await import('@/app/api/integrations/ical/[roomId]/route');
    const req = new NextRequest('http://localhost:3000/api/integrations/ical/room-abc?token=wrong-token');
    const res = await GET(req, { params: Promise.resolve({ roomId: 'room-abc' }) });

    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toContain('Token');
  });
});

// =============================================================================
// 5. Modo mock ativo — sem chamadas HTTP externas
// =============================================================================
describe('Mock Mode Isolation', () => {
  it('ICAL_SYNC_PROVIDER should default to mock (no real HTTP calls)', () => {
    const isMock = process.env.ICAL_SYNC_PROVIDER !== 'real';
    expect(isMock).toBe(true);
  });

  it('syncAllActiveChannels should not throw in mock mode', async () => {
    vi.clearAllMocks();
    mockDb.calendarSync.findMany.mockResolvedValue([mockSyncConfig]);
    mockDb.calendarSync.findUnique.mockResolvedValue(mockSyncConfig);
    mockDb.calendarSync.update.mockResolvedValue({
      ...mockSyncConfig,
      syncCount: 1,
    });

    const { syncAllActiveChannels } = await import('@/lib/integrations/ical-service');
    const result = await syncAllActiveChannels();

    expect(result).toHaveProperty('synced');
    expect(result).toHaveProperty('errors');
    expect(result).toHaveProperty('details');
    expect(Array.isArray(result.details)).toBe(true);
  });
});
