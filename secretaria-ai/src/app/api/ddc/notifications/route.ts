import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { resolveTenantId, mapNotification } from '@/lib/ddc/ddc-mapper';

export async function GET(request: NextRequest) {
  try {
    const tenantId = await resolveTenantId();
    const notifications = await db.notification.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: notifications.map(mapNotification) });
  } catch (error) {
    console.error('[DDC notifications] Prisma error:', error);
    return NextResponse.json({ success: true, data: [] });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId, status } = body;
    if (!notificationId || !status) {
      return NextResponse.json({ success: false, error: { code: '400', message: 'Missing required fields: notificationId, status' } }, { status: 400 });
    }
    const updated = await db.notification.update({
      where: { id: notificationId },
      data: { read: status === 'read' },
    });
    return NextResponse.json({ success: true, data: mapNotification(updated) });
  } catch (error) {
    console.error('[DDC notifications PUT] Error:', error);
    return NextResponse.json({ success: false, error: { code: '500', message: 'Failed to update notification' } }, { status: 500 });
  }
}
