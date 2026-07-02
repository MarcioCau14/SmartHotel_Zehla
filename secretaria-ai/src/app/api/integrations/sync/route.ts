import { NextRequest, NextResponse } from 'next/server';
import { syncAllActiveChannels } from '@/lib/integrations/ical-service';

const SYNC_SECRET = process.env.CALENDAR_SYNC_SECRET ?? 'zehla-sync-dev-secret-2024';

/**
 * POST /api/integrations/sync
 *
 * Triggers synchronization of all active iCal channels.
 * Protected by X-Sync-Secret header (for cron jobs) or NextAuth session.
 */
export async function POST(request: NextRequest) {
  try {
    // Auth: X-Sync-Secret header (cron) OR NextAuth session
    const syncSecret = request.headers.get('x-sync-secret');

    if (syncSecret !== SYNC_SECRET) {
      // Fallback: check for NextAuth session via authorization header
      const authHeader = request.headers.get('authorization');
      const hasSession = !!authHeader;

      if (!hasSession) {
        return NextResponse.json(
          { error: 'Autenticação necessária. Envie o header X-Sync-Secret ou faça login.' },
          { status: 401 }
        );
      }
    }

    const result = await syncAllActiveChannels();

    return NextResponse.json({
      success: true,
      synced: result.synced,
      errors: result.errors,
      details: result.details,
      message: `Sincronização concluída: ${result.synced} reservas importadas, ${result.errors} erros.`,
    });
  } catch (error) {
    console.error('[Sync API] Error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
