import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRequest, createMockDb, expectJson } from '../helpers/test-utils';

// Mock de next-auth para evitar chamadas de request store fora do escopo do vitest
vi.mock('next-auth', () => ({
  getServerSession: vi.fn().mockResolvedValue(null),
}));

// Mock do banco de dados
vi.mock('@/lib/db', () => ({ db: createMockDb() }));

import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { 
  generateICalFeed, 
  parseAndImportICal, 
  mockImportFromICal, 
  mockICalFeed 
} from '@/lib/integrations/ical-service';
import { GET as icalGet } from '@/app/api/integrations/ical/[roomId]/route';
import { POST as syncPost } from '@/app/api/integrations/sync/route';

const mockDb = db as any;
const mockGetSession = getServerSession as any;

// Mapeia os métodos mocks para a tabela calendarSync (que é nova no schema)
mockDb.calendarSync = {
  findUnique: vi.fn(),
  findFirst: vi.fn(),
  findMany: vi.fn(),
  create: vi.fn(),
  createMany: vi.fn(),
  update: vi.fn(),
};

describe('Sincronização de Calendários iCal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ICAL_SYNC_PROVIDER = 'mock';
    mockGetSession.mockReset();
    mockGetSession.mockResolvedValue(null);
  });

  describe('Serviço iCal (ical-service)', () => {
    it('gera feed .ics válido a partir de reservas de um quarto', async () => {
      const mockRoom = {
        id: 'room-1',
        name: 'Suíte Master',
        bookings: [
          {
            id: 'book-1',
            guestName: 'João da Silva',
            checkIn: new Date('2026-07-10T14:00:00Z'),
            checkOut: new Date('2026-07-15T12:00:00Z'),
            createdAt: new Date('2026-07-01T10:00:00Z'),
            status: 'confirmed',
            source: 'whatsapp_ai',
            externalUid: null
          },
          {
            id: 'book-2',
            guestName: 'Bloqueio Técnico',
            checkIn: new Date('2026-07-20T14:00:00Z'),
            checkOut: new Date('2026-07-22T12:00:00Z'),
            createdAt: new Date('2026-07-01T11:00:00Z'),
            status: 'blocked',
            source: 'direct',
            externalUid: 'block-uid-123'
          }
        ]
      };

      mockDb.room.findUnique.mockResolvedValueOnce(mockRoom);

      const ics = await generateICalFeed('room-1');

      expect(ics).toContain('BEGIN:VCALENDAR');
      expect(ics).toContain('BEGIN:VEVENT');
      expect(ics).toContain('SUMMARY:Reserva: João da Silva (whatsapp_ai)');
      expect(ics).toContain('SUMMARY:Bloqueado (Zehla)');
      expect(ics).toContain('UID:block-uid-123');
      expect(ics).toContain('END:VCALENDAR');
    });

    it('executa a importação offline mock e insere novas reservas', async () => {
      const mockSync = {
        id: 'sync-1',
        tenantId: 'tenant-1',
        roomId: 'room-1',
        otaName: 'airbnb',
        room: { name: 'Suíte Executiva' }
      };

      mockDb.calendarSync.findUnique.mockResolvedValueOnce(mockSync);
      mockDb.booking.findUnique.mockResolvedValue(null); // Nenhuma reserva duplicada
      mockDb.booking.create.mockResolvedValue({ id: 'new-book' });
      mockDb.calendarSync.update.mockResolvedValue({ id: 'sync-1' });

      const inserted = await mockImportFromICal('sync-1');

      expect(inserted).toBe(2); // O mock gera 2 eventos por padrão
      expect(mockDb.booking.create).toHaveBeenCalledTimes(2);
      expect(mockDb.calendarSync.update).toHaveBeenCalled();
    });

    it('previne duplicatas usando o externalUid e fazendo deduplicação', async () => {
      const mockSync = {
        id: 'sync-1',
        tenantId: 'tenant-1',
        roomId: 'room-1',
        otaName: 'airbnb',
        room: { name: 'Suíte Executiva' }
      };

      mockDb.calendarSync.findUnique.mockResolvedValueOnce(mockSync);
      // Simula que a primeira reserva mock já existe no banco de dados
      mockDb.booking.findUnique
        .mockResolvedValueOnce({ id: 'existing-book-1' }) // 1º evento: já existe
        .mockResolvedValueOnce(null); // 2º evento: não existe

      mockDb.booking.create.mockResolvedValue({ id: 'new-book' });
      mockDb.calendarSync.update.mockResolvedValue({ id: 'sync-1' });

      const inserted = await mockImportFromICal('sync-1');

      expect(inserted).toBe(1); // Apenas a segunda deve ser inserida
      expect(mockDb.booking.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('Endpoints de API (Routes)', () => {
    it('GET /api/integrations/ical/[roomId] rejeita requisição sem token válido', async () => {
      // 1. Sem token
      const req1 = createRequest('/api/integrations/ical/room-1');
      const res1 = await icalGet(req1, { params: Promise.resolve({ roomId: 'room-1' }) });
      const body1 = await expectJson(res1, 401);
      expect(body1.error).toContain('Token de sincronização ausente');

      // 2. Token inválido (não cadastrado no banco)
      mockDb.calendarSync.findFirst.mockResolvedValueOnce(null);
      const req2 = createRequest('/api/integrations/ical/room-1?token=wrong-token');
      const res2 = await icalGet(req2, { params: Promise.resolve({ roomId: 'room-1' }) });
      const body2 = await expectJson(res2, 403);
      expect(body2.error).toContain('Token inválido');
    });

    it('GET /api/integrations/ical/[roomId] serve feed .ics se token for válido', async () => {
      mockDb.calendarSync.findFirst.mockResolvedValueOnce({ id: 'sync-1' });
      
      // Mock da geração do feed
      const mockRoom = {
        id: 'room-1',
        bookings: []
      };
      mockDb.room.findUnique.mockResolvedValueOnce(mockRoom);

      const req = createRequest('/api/integrations/ical/room-1?token=valid-token');
      const res = await icalGet(req, { params: Promise.resolve({ roomId: 'room-1' }) });
      
      expect(res.status).toBe(200);
      expect(res.headers.get('Content-Type')).toContain('text/calendar');
      
      const bodyText = await res.text();
      expect(bodyText).toContain('BEGIN:VCALENDAR');
    });

    it('POST /api/integrations/sync rejeita se não houver cabeçalho x-sync-secret nem sessão', async () => {
      mockGetSession.mockResolvedValueOnce(null);

      const req = createRequest('/api/integrations/sync', { method: 'POST' });
      const res = await syncPost(req);
      await expectJson(res, 401);
    });

    it('POST /api/integrations/sync aceita se o header x-sync-secret for correto', async () => {
      process.env.SYNC_SECRET = 'my-secret-key';
      mockGetSession.mockResolvedValueOnce(null);
      
      // Simula nenhuma configuração ativa para simplificar
      mockDb.calendarSync.findMany.mockResolvedValueOnce([]);

      const req = createRequest('/api/integrations/sync', {
        method: 'POST',
        headers: {
          'x-sync-secret': 'my-secret-key'
        }
      });
      const res = await syncPost(req);
      const body = await expectJson(res, 200);

      expect(body.success).toBe(true);
      expect(body.synced).toBe(0);
    });
  });
});
