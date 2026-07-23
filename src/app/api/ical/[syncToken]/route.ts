import { NextRequest, NextResponse } from 'next/server';
import { generateICalExport } from '@/lib/ical-import-engine';

// GET /api/ical/[syncToken] — Public iCal feed for Booking.com import (no auth required)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ syncToken: string }> },
) {
  try {
    const { syncToken } = await params;

    const icalContent = await generateICalExport(syncToken);

    return new NextResponse(icalContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `inline; filename="zella-availability.ics"`,
        'Cache-Control': 'no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('[iCalExport] Error:', error);
    return new NextResponse('BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Zella//EN\r\nEND:VCALENDAR\r\n', {
      status: 500,
      headers: { 'Content-Type': 'text/calendar' },
    });
  }
}
