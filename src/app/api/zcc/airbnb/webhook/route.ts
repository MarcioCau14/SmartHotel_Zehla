import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function verifyZCCAccess(request: NextRequest): boolean {
  const cookie = request.cookies.get('zcc_godmode')?.value;
  const header = request.headers.get('X-ZCC-Master-Key');
  return cookie === 'zella-ctrl-2026' || header === 'zella-ctrl-2026';
}

export async function POST(request: NextRequest) {
  try {
    if (!verifyZCCAccess(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized — ZCC access required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { tenantId, eventType, payload } = body as {
      tenantId: string;
      eventType: string;
      payload?: object;
    };

    if (!tenantId || !eventType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: tenantId, eventType' },
        { status: 400 }
      );
    }

    // Verify tenant exists
    const tenant = await db.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true, name: true },
    });

    if (!tenant) {
      return NextResponse.json(
        { success: false, error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // Create AirbnbWebhookEvent record
    const webhookEvent = await db.airbnbWebhookEvent.create({
      data: {
        tenantId,
        eventType,
        payload: JSON.stringify(payload ?? {}),
        processed: false,
        mockTriggered: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: webhookEvent,
    });
  } catch (error) {
    console.error('[ZCC Airbnb Webhook] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
