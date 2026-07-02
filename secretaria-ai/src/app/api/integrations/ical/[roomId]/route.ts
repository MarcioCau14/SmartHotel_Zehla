import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateICalFeed } from '@/lib/integrations/ical-service';

/**
 * GET /api/integrations/ical/[roomId]?token=<syncToken>
 *
 * Serves the iCal feed for a room's availability.
 * Protected by cryptographic sync token in query string.
 * Content-Type: text/calendar (RFC 5545)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token de sincronização obrigatório' },
        { status: 401 }
      );
    }

    // Validate token against CalendarSync table
    const syncConfig = await db.calendarSync.findFirst({
      where: {
        roomId,
        syncToken: token,
        status: 'active',
      },
    });

    if (!syncConfig) {
      return NextResponse.json(
        { error: 'Token inválido ou configuração inativa' },
        { status: 403 }
      );
    }

    // Verify room exists
    const room = await db.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return NextResponse.json(
        { error: 'Quarto não encontrado' },
        { status: 404 }
      );
    }

    // Generate iCal feed
    const icsFeed = await generateICalFeed(roomId);

    return new NextResponse(icsFeed, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="room-${roomId.slice(0, 8)}.ics"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('[iCal Feed API] Error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
