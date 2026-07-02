import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { parseAndImportICal } from '@/lib/integrations/ical-service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const syncSecret = process.env.SYNC_SECRET || 'dev-sync-secret';
    const requestSecret = request.headers.get('x-sync-secret');

    let isAuthorized = false;

    // 1. Autorização via Cron Secret (Header)
    if (requestSecret && requestSecret === syncSecret) {
      isAuthorized = true;
    }

    // 2. Autorização via sessão de login do NextAuth (DDC Dashboard)
    if (!isAuthorized) {
      const session = await getServerSession(authOptions);
      if (session?.user) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Busca todas as sincronizações ativas
    const configs = await db.calendarSync.findMany({
      where: {
        status: { in: ['active', 'error'] }
      }
    });

    const results = [];
    let synced = 0;
    let errors = 0;

    for (const config of configs) {
      try {
        const count = await parseAndImportICal(config.id);
        synced++;
        results.push({
          id: config.id,
          ota: config.otaName,
          roomId: config.roomId,
          status: 'success',
          createdBookings: count
        });
      } catch (err: any) {
        errors++;
        results.push({
          id: config.id,
          ota: config.otaName,
          roomId: config.roomId,
          status: 'error',
          message: err.message || 'Erro durante a sincronização'
        });
      }
    }

    return NextResponse.json({
      success: true,
      synced,
      errors,
      details: results
    });
  } catch (error: any) {
    console.error('Error running calendar sync batch:', error);
    return NextResponse.json({ error: error.message || 'Erro interno do servidor' }, { status: 500 });
  }
}
