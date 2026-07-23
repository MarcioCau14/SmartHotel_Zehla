import { db } from '@/lib/db';

/**
 * iCal Import Engine — Fetches and parses iCal feeds from Booking.com
 * and creates Booking records in the database.
 */

interface ICalEvent {
  uid: string;
  summary: string;
  startDate: string;
  endDate: string;
  description?: string;
  location?: string;
  status?: string;
}

interface ICalImportResult {
  imported: number;
  skipped: number;
  errors: number;
  details: Array<{ uid: string; action: string; reason?: string }>;
}

/**
 * Import iCal data from a URL
 */
export async function importICal(tenantId: string, icalUrl: string): Promise<ICalImportResult> {
  const result: ICalImportResult = {
    imported: 0,
    skipped: 0,
    errors: 0,
    details: [],
  };

  try {
    // Fetch the iCal feed
    const response = await fetch(icalUrl, {
      headers: { 'Accept': 'text/calendar' },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      result.errors++;
      result.details.push({ uid: 'fetch', action: 'error', reason: `HTTP ${response.status}` });
      return result;
    }

    const icalText = await response.text();
    const events = parseICal(icalText);

    // Process each event
    for (const event of events) {
      try {
        const checkIn = new Date(event.startDate + 'T14:00:00');
        const checkOut = new Date(event.endDate + 'T11:00:00');

        if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
          result.skipped++;
          result.details.push({ uid: event.uid, action: 'skipped', reason: 'Invalid dates' });
          continue;
        }

        // Extract guest name from summary
        const guestName = event.summary?.replace(/^(Reserved|Blocked|Not available)\s*:?\s*/i, '').trim() || 'Booking.com Guest';

        // Check for existing booking with same external UID
        const existing = await db.booking.findFirst({
          where: {
            tenantId,
            externalUid: event.uid,
            source: 'booking',
          },
        });

        if (existing) {
          // Update if dates changed
          if (existing.checkIn.getTime() !== checkIn.getTime() || existing.checkOut.getTime() !== checkOut.getTime()) {
            await db.booking.update({
              where: { id: existing.id },
              data: { checkIn, checkOut, status: event.status === 'CANCELLED' ? 'cancelled' : 'confirmed' },
            });
            result.details.push({ uid: event.uid, action: 'updated' });
          } else {
            result.skipped++;
            result.details.push({ uid: event.uid, action: 'skipped', reason: 'Already exists' });
          }
          continue;
        }

        // Calculate nights and price
        const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

        // Try to find a room
        const property = await db.property.findFirst({ where: { tenantId } });
        const room = property ? await db.room.findFirst({ where: { propertyId: property.id } }) : null;
        const pricePerNight = room?.price || 150;

        // Create booking
        await db.booking.create({
          data: {
            tenantId,
            guestName,
            roomName: room?.name || 'Quarto Booking.com',
            roomId: room?.id || null,
            checkIn,
            checkOut,
            nights,
            guests: 1,
            totalValue: pricePerNight * nights,
            status: 'confirmed',
            source: 'booking',
            externalUid: event.uid,
            externalSource: 'booking.com',
          },
        });

        result.imported++;
        result.details.push({ uid: event.uid, action: 'created' });
      } catch (err) {
        result.errors++;
        result.details.push({ uid: event.uid, action: 'error', reason: err instanceof Error ? err.message : 'Unknown error' });
      }
    }
  } catch (error) {
    result.errors++;
    result.details.push({ uid: 'fetch', action: 'error', reason: error instanceof Error ? error.message : 'Fetch failed' });
  }

  return result;
}

/**
 * Parse iCal text into structured events
 */
export function parseICal(icalText: string): ICalEvent[] {
  const events: ICalEvent[] = [];
  const lines = icalText.split(/\r?\n/);

  let currentEvent: Partial<ICalEvent> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line === 'BEGIN:VEVENT') {
      currentEvent = {};
    } else if (line === 'END:VEVENT' && currentEvent) {
      if (currentEvent.uid && currentEvent.startDate && currentEvent.endDate) {
        events.push(currentEvent as ICalEvent);
      }
      currentEvent = null;
    } else if (currentEvent) {
      // Handle folded lines (continuation lines start with space or tab)
      let fullLine = line;
      while (i + 1 < lines.length && (lines[i + 1].startsWith(' ') || lines[i + 1].startsWith('\t'))) {
        i++;
        fullLine += lines[i].trim();
      }

      const match = fullLine.match(/^([A-Z-]+):(.+)$/);
      if (match) {
        const [, key, value] = match;

        switch (key.toUpperCase()) {
          case 'UID':
            currentEvent.uid = value;
            break;
          case 'SUMMARY':
            currentEvent.summary = value;
            break;
          case 'DTSTART':
            currentEvent.startDate = parseICalDate(value);
            break;
          case 'DTEND':
            currentEvent.endDate = parseICalDate(value);
            break;
          case 'DESCRIPTION':
            currentEvent.description = value;
            break;
          case 'LOCATION':
            currentEvent.location = value;
            break;
          case 'STATUS':
            currentEvent.status = value.toUpperCase();
            break;
        }
      }
    }
  }

  return events;
}

/**
 * Parse iCal date format
 * Formats: YYYYMMDD, YYYYMMDDTHHMMSS, YYYYMMDDTHHMMSSZ
 */
function parseICalDate(value: string): string {
  // Remove VALUE=DATE prefix if present
  const cleaned = value.replace(/^VALUE=DATE:/, '');

  // YYYYMMDD format
  if (/^\d{8}$/.test(cleaned)) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6, 8)}`;
  }

  // YYYYMMDDTHHMMSS or YYYYMMDDTHHMMSSZ
  const dateMatch = cleaned.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/);
  if (dateMatch) {
    return `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
  }

  return value;
}

/**
 * Generate iCal export content for a tenant's availability
 * This is served as a public feed that Booking.com can import
 */
export async function generateICalExport(syncToken: string): Promise<string> {
  const config = await db.bookingSyncConfig.findFirst({
    where: { syncToken },
  });

  if (!config) {
    return 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Zella//EN\r\nEND:VCALENDAR\r\n';
  }

  const bookings = await db.booking.findMany({
    where: {
      tenantId: config.tenantId,
      status: { in: ['confirmed', 'checked_in', 'blocked'] },
    },
    orderBy: { checkIn: 'asc' },
  });

  let ical = 'BEGIN:VCALENDAR\r\n';
  ical += 'VERSION:2.0\r\n';
  ical += 'PRODID:-//Zella//GestaoInteligente//PT\r\n';
  ical += 'CALSCALE:GREGORIAN\r\n';
  ical += 'METHOD:PUBLISH\r\n';

  for (const booking of bookings) {
    const checkInStr = formatICalDate(booking.checkIn);
    const checkOutStr = formatICalDate(booking.checkOut);
    const uid = booking.externalUid || `zella-${booking.id}`;

    ical += 'BEGIN:VEVENT\r\n';
    ical += `UID:${uid}\r\n`;
    ical += `DTSTART;VALUE=DATE:${checkInStr}\r\n`;
    ical += `DTEND;VALUE=DATE:${checkOutStr}\r\n`;
    ical += `SUMMARY:Reserved - ${booking.guestName || 'Guest'}\r\n`;
    ical += `DESCRIPTION:Booking via Zélla. ${booking.roomName || ''} ${booking.nights} nights.\r\n`;
    ical += `STATUS:CONFIRMED\r\n`;
    ical += 'END:VEVENT\r\n';
  }

  ical += 'END:VCALENDAR\r\n';
  return ical;
}

/**
 * Format a Date object to iCal date format (YYYYMMDD)
 */
function formatICalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}
