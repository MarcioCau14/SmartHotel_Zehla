// =============================================================================
// ZEHLA SmartHotel — iCal Synchronization Service
// Duas unidirecionais: Export (.ics feed) + Import (OTA → DB)
// 100% Mock Mode ready — ICAL_SYNC_PROVIDER=mock (default)
// =============================================================================

import { db } from '@/lib/db';
import * as crypto from 'crypto';

// ── Mock mode detection ──────────────────────────────────────────────────────
const IS_MOCK = process.env.ICAL_SYNC_PROVIDER !== 'real';

// ── Date helpers ─────────────────────────────────────────────────────────────

function formatDateICS(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function parseICSDate(raw: string | Date | undefined): Date | null {
  if (!raw) return null;
  if (raw instanceof Date) return raw;
  // iCal format: YYYYMMDDTHHMMSSZ
  const cleaned = raw.replace(/[TZ]/g, '');
  const year = parseInt(cleaned.slice(0, 4), 10);
  const month = parseInt(cleaned.slice(4, 6), 10) - 1;
  const day = parseInt(cleaned.slice(6, 8), 10);
  const hour = parseInt(cleaned.slice(8, 10) || '0', 10);
  const min = parseInt(cleaned.slice(10, 12) || '0', 10);
  const sec = parseInt(cleaned.slice(12, 14) || '0', 10);
  const d = new Date(year, month, day, hour, min, sec);
  return isNaN(d.getTime()) ? null : d;
}

// ── Token generation ─────────────────────────────────────────────────────────

export function generateSyncToken(): string {
  return crypto.randomBytes(24).toString('hex');
}

// =============================================================================
// EXPORT: Generate .ics feed from local bookings
// =============================================================================

export async function generateICalFeed(roomId: string): Promise<string> {
  const bookings = await db.booking.findMany({
    where: {
      roomId,
      status: { in: ['confirmed', 'checked_in', 'blocked'] },
    },
    orderBy: { checkIn: 'asc' },
  });

  const room = await db.room.findUnique({
    where: { id: roomId },
    include: { property: { include: { tenant: true } } },
  });

  const propertyName = room?.property?.name ?? 'ZÉHLA';
  const tenantEmail = room?.property?.tenant?.email ?? 'sync@zehla.ai';

  const events = bookings.map((b) => {
    const summary = b.status === 'blocked'
      ? `[BLOQUEADO] ${b.roomName}`
      : `Reserva: ${b.guestName} — ${b.roomName}`;

    return [
      'BEGIN:VEVENT',
      `UID:${b.id}@zehla.ai`,
      `DTSTART:${formatDateICS(b.checkIn)}`,
      `DTEND:${formatDateICS(b.checkOut)}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${b.nights} noite(s) | Hóspedes: ${b.guests} | Status: ${b.status}`,
      `STATUS:${b.status === 'cancelled' ? 'CANCELLED' : 'CONFIRMED'}`,
      `ORGANIZER;CN=${propertyName}:mailto:${tenantEmail}`,
      `END:VEVENT`,
    ].join('\r\n');
  });

  const now = formatDateICS(new Date());

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ZÉLLA SmartHotel//iCal Feed//PT-BR',
    `CALSCALE:GREGORIAN`,
    `METHOD:PUBLISH`,
    `X-WR-CALNAME:${propertyName}`,
    `X-WR-TIMEZONE:America/Sao_Paulo`,
    `DTSTAMP:${now}`,
    ...events,
    'END:VCALENDAR',
  ].join('\r\n');
}

// =============================================================================
// IMPORT: Parse external iCal feed and upsert bookings
// =============================================================================

interface ParsedEvent {
  uid: string;
  summary: string;
  start: Date;
  end: Date;
  description?: string;
}

export async function parseAndImportICal(syncConfigId: string): Promise<number> {
  if (IS_MOCK) {
    return mockImportFromICal(syncConfigId);
  }
  return realImportFromICal(syncConfigId);
}

async function realImportFromICal(syncConfigId: string): Promise<number> {
  const config = await db.calendarSync.findUnique({
    where: { id: syncConfigId },
  });

  if (!config || config.status !== 'active') return 0;

  try {
    const ical = await import('node-ical');
    const response = await fetch(config.syncUrl, {
      headers: { 'User-Agent': 'ZehlaSmartHotel/1.0' },
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const text = await response.text();
    const data = ical.parseICS(text);
    const events = parseICSEvents(data);

    let imported = 0;
    for (const event of events) {
      const nights = Math.max(1, Math.ceil(
        (event.end.getTime() - event.start.getTime()) / (1000 * 60 * 60 * 24)
      ));

      await db.booking.upsert({
        where: {
          tenantId_externalUid: {
            tenantId: config.tenantId,
            externalUid: event.uid,
          },
        },
        create: {
          tenantId: config.tenantId,
          guestId: null,
          guestName: event.summary || 'Hóspede OTA',
          roomName: '',
          roomId: config.roomId,
          checkIn: event.start,
          checkOut: event.end,
          nights,
          guests: 1,
          totalValue: 0,
          status: 'confirmed',
          source: config.otaName,
          aiGenerated: false,
          externalUid: event.uid,
          externalSource: config.otaName,
        },
        update: {
          checkIn: event.start,
          checkOut: event.end,
          nights,
          status: 'confirmed',
        },
      });
      imported++;
    }

    await db.calendarSync.update({
      where: { id: syncConfigId },
      data: {
        lastSync: new Date(),
        syncCount: { increment: 1 },
        status: 'active',
        errorMessage: '',
      },
    });

    return imported;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    await db.calendarSync.update({
      where: { id: syncConfigId },
      data: {
        status: 'error',
        errorMessage: msg,
      },
    });
    return 0;
  }
}

// =============================================================================
// MOCK IMPORT: Offline simulation
// =============================================================================

async function mockImportFromICal(syncConfigId: string): Promise<number> {
  const config = await db.calendarSync.findUnique({
    where: { id: syncConfigId },
  });

  if (!config || config.status !== 'active') return 0;

  const now = new Date();
  const mockBookings = [
    {
      uid: `mock-${config.otaName}-${config.roomId}-event1`,
      summary: `Reserva ${config.otaName} — Hóspede Mock`,
      start: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7),
      end: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 9),
    },
    {
      uid: `mock-${config.otaName}-${config.roomId}-event2`,
      summary: `Reserva ${config.otaName} — Família Silva`,
      start: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 15),
      end: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 18),
    },
  ];

  let imported = 0;
  for (const event of mockBookings) {
    const nights = Math.max(1, Math.ceil(
      (event.end.getTime() - event.start.getTime()) / (1000 * 60 * 60 * 24)
    ));

    await db.booking.upsert({
      where: {
        tenantId_externalUid: {
          tenantId: config.tenantId,
          externalUid: event.uid,
        },
      },
      create: {
        tenantId: config.tenantId,
        guestId: null,
        guestName: event.summary || 'Hóspede OTA',
        roomName: '',
        roomId: config.roomId,
        checkIn: event.start,
        checkOut: event.end,
        nights,
        guests: 1,
        totalValue: 0,
        status: 'confirmed',
        source: config.otaName,
        aiGenerated: false,
        externalUid: event.uid,
        externalSource: config.otaName,
      },
      update: {
        checkIn: event.start,
        checkOut: event.end,
        nights,
        status: 'confirmed',
      },
    });
    imported++;
  }

  await db.calendarSync.update({
    where: { id: syncConfigId },
    data: {
      lastSync: new Date(),
      syncCount: { increment: 1 },
      status: 'active',
      errorMessage: '',
    },
  });

  return imported;
}

// =============================================================================
// PARSE HELPERS
// =============================================================================

function parseICSEvents(data: Record<string, any>): ParsedEvent[] {
  const events: ParsedEvent[] = [];

  for (const key of Object.keys(data)) {
    const component = data[key];
    if (component.type !== 'VEVENT') continue;

    const start = parseICSDate(component.start);
    const end = parseICSDate(component.end);
    if (!start || !end) continue;

    events.push({
      uid: component.uid || `imported-${key}`,
      summary: component.summary || '',
      start,
      end,
      description: component.description || undefined,
    });
  }

  return events;
}

// =============================================================================
// BULK SYNC: Process all active sync configs
// =============================================================================

export async function syncAllActiveChannels(): Promise<{
  synced: number;
  errors: number;
  details: Array<{ configId: string; otaName: string; imported: number; error?: string }>;
}> {
  const configs = await db.calendarSync.findMany({
    where: { status: 'active' },
  });

  let synced = 0;
  let errors = 0;
  const details: Array<{ configId: string; otaName: string; imported: number; error?: string }> = [];

  for (const config of configs) {
    try {
      const imported = await parseAndImportICal(config.id);
      synced += imported;
      details.push({ configId: config.id, otaName: config.otaName, imported });
    } catch (error: unknown) {
      errors++;
      const msg = error instanceof Error ? error.message : String(error);
      details.push({ configId: config.id, otaName: config.otaName, imported: 0, error: msg });
    }
  }

  return { synced, errors, details };
}
