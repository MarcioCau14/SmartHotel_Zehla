import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateICalFeed } from '@/lib/integrations/ical-service';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ roomId: string }> }
) {
  try {
    const params = await props.params;
    const { roomId } = params;
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!roomId) {
      return NextResponse.json({ error: 'Parâmetro roomId ausente' }, { status: 400 });
    }

    if (!token) {
      return NextResponse.json({ error: 'Token de sincronização ausente' }, { status: 401 });
    }

    // Valida se existe um CalendarSync com o syncToken correspondente para este roomId
    const sync = await db.calendarSync.findFirst({
      where: {
        roomId,
        syncToken: token
      }
    });

    if (!sync) {
      return NextResponse.json({ error: 'Token inválido ou sincronização não cadastrada' }, { status: 403 });
    }

    const icsContent = await generateICalFeed(roomId);

    return new Response(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="room-${roomId}.ics"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error: any) {
    console.error('Error generating iCal feed:', error);
    return NextResponse.json({ error: error.message || 'Erro interno do servidor' }, { status: 500 });
  }
}
