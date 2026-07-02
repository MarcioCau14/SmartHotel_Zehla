import { db } from '@/lib/db';
import ical from 'node-ical';

/**
 * Gera um feed iCal válido no formato RFC 5545 contendo todos os bloqueios e reservas
 * confirmados do quarto fornecido.
 */
export async function generateICalFeed(roomId: string): Promise<string> {
  const room = await db.room.findUnique({
    where: { id: roomId },
    include: {
      bookings: {
        where: {
          status: { in: ['confirmed', 'checked_in', 'checked_out', 'blocked'] }
        }
      }
    }
  });

  if (!room) {
    throw new Error('Room not found');
  }

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Zehla SmartHotel//iCal Sync Feed//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];

  for (const booking of room.bookings) {
    const startStr = booking.checkIn.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endStr = booking.checkOut.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const createdStr = booking.createdAt.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const uid = booking.externalUid || `booking-${booking.id}@zehla.com.br`;
    const summary = booking.status === 'blocked' ? 'Bloqueado (Zehla)' : `Reserva: ${booking.guestName} (${booking.source})`;

    ics.push('BEGIN:VEVENT');
    ics.push(`UID:${uid}`);
    ics.push(`DTSTAMP:${createdStr}`);
    ics.push(`DTSTART:${startStr}`);
    ics.push(`DTEND:${endStr}`);
    ics.push(`SUMMARY:${summary}`);
    ics.push('DESCRIPTION:Reserva integrada via Seu ZÉLLA.');
    ics.push('END:VEVENT');
  }

  ics.push('END:VCALENDAR');
  return ics.join('\r\n');
}

/**
 * Puxa, parseia e integra as reservas do iCal da OTA configurada no banco de dados.
 */
export async function parseAndImportICal(syncConfigId: string): Promise<number> {
  const sync = await db.calendarSync.findUnique({
    where: { id: syncConfigId },
    include: { room: true }
  });

  if (!sync) {
    throw new Error('CalendarSync config not found');
  }

  const isMock = process.env.ICAL_SYNC_PROVIDER === 'mock' || !process.env.LLM_API_KEY || process.env.LLM_API_KEY.startsWith('sk-mock');
  if (isMock) {
    return mockImportFromICal(syncConfigId);
  }

  try {
    const res = await fetch(sync.syncUrl);
    if (!res.ok) {
      throw new Error(`Failed to fetch iCal feed: ${res.statusText}`);
    }
    const icsText = await res.text();
    const data = ical.parseICS(icsText);
    
    let count = 0;
    
    for (const k in data) {
      if (data.hasOwnProperty(k)) {
        const ev = data[k];
        if (ev.type === 'VEVENT') {
          const checkIn = new Date(ev.start as Date);
          const checkOut = new Date(ev.end as Date);
          const externalUid = ev.uid;
          
          if (!externalUid) continue;

          // Deduplicação: verifica se já existe booking com esse tenantId e externalUid
          const existing = await db.booking.findUnique({
            where: {
              tenantId_externalUid: {
                tenantId: sync.tenantId,
                externalUid: externalUid
              }
            }
          });

          if (!existing) {
            const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
            
            await db.booking.create({
              data: {
                tenantId: sync.tenantId,
                roomId: sync.roomId,
                roomName: sync.room.name || 'Quarto Integrado',
                checkIn,
                checkOut,
                nights: nights > 0 ? nights : 1,
                guests: 2,
                guestName: `Hóspede ${sync.otaName.toUpperCase()}`,
                totalValue: 0.0,
                status: 'confirmed',
                paymentMethod: 'none',
                paymentStatus: 'none',
                source: 'ical_import',
                externalUid,
                externalSource: sync.otaName,
                metadata: JSON.stringify({ summary: ev.summary || '' })
              }
            });
            count++;
          }
        }
      }
    }

    await db.calendarSync.update({
      where: { id: syncConfigId },
      data: {
        lastSync: new Date(),
        status: 'active',
        errorMessage: '',
        syncCount: { increment: count }
      }
    });

    return count;
  } catch (err: any) {
    await db.calendarSync.update({
      where: { id: syncConfigId },
      data: {
        lastSync: new Date(),
        status: 'error',
        errorMessage: err.message || 'Unknown integration sync error'
      }
    });
    throw err;
  }
}

/**
 * Mock offline de importação para simular o download de calendário.
 */
export async function mockImportFromICal(syncConfigId: string): Promise<number> {
  const sync = await db.calendarSync.findUnique({
    where: { id: syncConfigId },
    include: { room: true }
  });

  if (!sync) {
    throw new Error('CalendarSync config not found');
  }

  const ota = sync.otaName.toLowerCase();
  
  // Datas deterministas no futuro para simular eventos de iCal
  const mockEvents = [
    {
      uid: `mock-event-1-${ota}-${sync.roomId}`,
      summary: `Reserva Mock ${ota.toUpperCase()}`,
      checkIn: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      checkOut: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    },
    {
      uid: `mock-event-2-${ota}-${sync.roomId}`,
      summary: `Reserva Mock 2 ${ota.toUpperCase()}`,
      checkIn: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      checkOut: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    }
  ];

  let count = 0;

  for (const ev of mockEvents) {
    const existing = await db.booking.findUnique({
      where: {
        tenantId_externalUid: {
          tenantId: sync.tenantId,
          externalUid: ev.uid
        }
      }
    });

    if (!existing) {
      const nights = Math.ceil((ev.checkOut.getTime() - ev.checkIn.getTime()) / (1000 * 60 * 60 * 24));
      
      await db.booking.create({
        data: {
          tenantId: sync.tenantId,
          roomId: sync.roomId,
          roomName: sync.room.name || 'Quarto Integrado Mock',
          checkIn: ev.checkIn,
          checkOut: ev.checkOut,
          nights: nights > 0 ? nights : 1,
          guests: 2,
          guestName: `Hóspede Mock ${sync.otaName.toUpperCase()}`,
          totalValue: 150.0 * (nights > 0 ? nights : 1),
          status: 'confirmed',
          paymentMethod: 'none',
          paymentStatus: 'none',
          source: 'ical_import',
          externalUid: ev.uid,
          externalSource: sync.otaName,
          metadata: JSON.stringify({ summary: ev.summary })
        }
      });
      count++;
    }
  }

  await db.calendarSync.update({
    where: { id: syncConfigId },
    data: {
      lastSync: new Date(),
      status: 'active',
      errorMessage: '',
      syncCount: { increment: count }
    }
  });

  return count;
}

/**
 * Auxiliar para gerar strings de feed em formato iCal para fins de teste.
 */
export function mockICalFeed(): string {
  const start = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  const end = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
  const startStr = start.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const endStr = end.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Zehla SmartHotel//iCal Sync Feed Mock//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:mock-external-event-uid-999',
    'DTSTAMP:20260701T000000Z',
    `DTSTART:${startStr}`,
    `DTEND:${endStr}`,
    'SUMMARY:Reserva Mock Externa',
    'DESCRIPTION:Reserva mock simulada para teste de importacao.',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}
