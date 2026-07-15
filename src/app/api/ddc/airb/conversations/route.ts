import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { resolveTenantId } from '@/lib/ddc/auth-utils';

// GET /api/ddc/airb/conversations — List all Airbnb conversations for tenant
export async function GET() {
  try {
    const tenantId = await resolveTenantId();
    if (!tenantId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const conversations = await db.airBConversation.findMany({
      where: { tenantId },
      include: { property: { select: { name: true } } },
      orderBy: { lastMessageAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: conversations });
  } catch (error) {
    console.error('[AIRB] Error listing conversations:', error);
    return NextResponse.json({ success: false, error: 'Failed to list conversations' }, { status: 500 });
  }
}
