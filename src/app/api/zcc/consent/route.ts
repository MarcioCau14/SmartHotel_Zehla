import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyZCCAccessOrReject } from '@/lib/zcc-security';

/**
 * GET /api/zcc/consent?tenantId=xxx
 * Returns consent records for a specific tenant.
 */
export async function GET(request: NextRequest) {
  // ── Security Gate V3 — 6-Layer Protection ──
  const security = await verifyZCCAccessOrReject(request);
  if (!security.allowed) return security.response!;

  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: 'Missing query param: tenantId' },
        { status: 400 }
      );
    }

    // Fetch ConsentRecord entries
    let consentRecords: Record<string, unknown>[] = [];
    try {
      consentRecords = await db.consentRecord.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
      });
    } catch {
      consentRecords = [];
    }

    // Also fetch ConsentLog entries for completeness
    let consentLogs: Record<string, unknown>[] = [];
    try {
      consentLogs = await db.consentLog.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
    } catch {
      consentLogs = [];
    }

    return NextResponse.json({
      success: true,
      data: {
        consentRecords,
        consentLogs,
        totalRecords: consentRecords.length,
        totalLogs: consentLogs.length,
      },
    });
  } catch (error) {
    console.error('[ZCC Consent GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/zcc/consent
 * Creates or updates a consent record.
 * Body: { tenantId, guestPhone, consentType, status, source, ipAddress?, userAgent?, expiresAt? }
 */
export async function POST(request: NextRequest) {
  // ── Security Gate V3 — 6-Layer Protection ──
  const security = await verifyZCCAccessOrReject(request);
  if (!security.allowed) return security.response!;

  try {
    const body = await request.json();
    const {
      tenantId,
      guestPhone,
      consentType,
      status,
      source,
      ipAddress,
      userAgent,
      expiresAt,
    } = body as {
      tenantId: string;
      guestPhone: string;
      consentType: string;
      status: 'granted' | 'denied' | 'pending' | 'withdrawn';
      source: string;
      ipAddress?: string;
      userAgent?: string;
      expiresAt?: string;
    };

    if (!tenantId || !guestPhone || !consentType || !status || !source) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: tenantId, guestPhone, consentType, status, source' },
        { status: 400 }
      );
    }

    const validConsentTypes = ['whatsapp_communication', 'data_processing', 'marketing'];
    if (!validConsentTypes.includes(consentType)) {
      return NextResponse.json(
        { success: false, error: `Invalid consentType. Must be one of: ${validConsentTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const validStatuses = ['granted', 'denied', 'pending', 'withdrawn'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Upsert: update if record exists for (tenantId, guestPhone, consentType)
    const consentRecord = await db.consentRecord.upsert({
      where: {
        tenantId_guestPhone_consentType: {
          tenantId,
          guestPhone,
          consentType,
        },
      },
      create: {
        tenantId,
        guestPhone,
        consentType,
        status,
        source,
        ipAddress: ipAddress ?? null,
        userAgent: userAgent ?? null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        withdrawnAt: status === 'withdrawn' ? new Date() : null,
      },
      update: {
        status,
        source,
        ipAddress: ipAddress ?? undefined,
        userAgent: userAgent ?? undefined,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        withdrawnAt: status === 'withdrawn' ? new Date() : null,
      },
    });

    // Also create a ConsentLog entry for audit trail
    try {
      await db.consentLog.create({
        data: {
          tenantId,
          guestId: 'system', // No specific guest for ZCC-level consent
          type: status === 'granted' ? 'opt_in' : 'opt_out',
          channel: source,
          ip: ipAddress ?? null,
          userAgent: userAgent ?? null,
          evidence: JSON.stringify({
            consentType,
            guestPhone,
            previousStatus: consentRecord.status,
            newStatus: status,
          }),
        },
      });
    } catch {
      // ConsentLog write is best-effort
    }

    return NextResponse.json({
      success: true,
      data: consentRecord,
    });
  } catch (error) {
    console.error('[ZCC Consent POST] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
