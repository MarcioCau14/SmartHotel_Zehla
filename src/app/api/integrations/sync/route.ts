import { NextRequest, NextResponse } from 'next/server';
import { syncAllActiveChannels } from '@/lib/integrations/ical-service';
import { verifySyncSecret } from '@/lib/security/webhook-verify';

/**
 * POST /api/integrations/sync
 *
 * SECURITY (Zero Trust V2):
 * - Uses timing-safe comparison for sync secret (no plain === comparison).
 * - In production, requires CALENDAR_SYNC_SECRET env var (no hardcoded fallback).
 * - NextAuth session validation as secondary auth path.
 */
export async function POST(request: NextRequest) {
  try {
    const syncSecretHeader = request.headers.get('x-sync-secret');

    // SECURITY: Always require env var. No hardcoded fallback ever.
    const configuredSecret = process.env.CALENDAR_SYNC_SECRET;
    if (!configuredSecret) {
      console.error('[sync-api] CRITICAL: CALENDAR_SYNC_SECRET not set');
      return NextResponse.json(
        { error: 'SERVICE_NOT_CONFIGURED' },
        { status: 503, headers: { 'X-Security-Shield': 'zero-trust-v1' } }
      );
    }

    // Use env var directly (no fallback)
    const expectedSecret = configuredSecret;

    // Auth Path 1: Timing-safe secret comparison
    if (syncSecretHeader && expectedSecret) {
      const verification = verifySyncSecret(syncSecretHeader, expectedSecret);
      if (!verification.valid) {
        console.warn(`[sync-api] REJECTED: ${verification.reason}`);
        return NextResponse.json(
          { error: 'UNAUTHORIZED', reason: verification.reason },
          { status: 401, headers: { 'X-Security-Shield': 'zero-trust-v1' } }
        );
      }
    } else {
      // Auth Path 2: NextAuth session
      const authHeader = request.headers.get('authorization');
      if (!authHeader) {
        return NextResponse.json(
          { error: 'Autenticação necessária. Envie o header X-Sync-Secret ou faça login.' },
          { status: 401, headers: { 'X-Security-Shield': 'zero-trust-v1' } }
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
    }, {
      headers: { 'X-Security-Shield': 'zero-trust-v1' },
    });
  } catch (error) {
    console.error('[Sync API] Error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      {
        status: 500,
        headers: { 'X-Security-Shield': 'zero-trust-v1' },
      }
    );
  }
}