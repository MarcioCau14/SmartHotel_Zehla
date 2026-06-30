import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const campaigns = await db.campaign.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const mapped = campaigns.map((c) => ({
      id: c.id,
      name: c.name,
      type: (c.type || 'whatsapp') as 'whatsapp' | 'email' | 'ads',
      status: (c.status || 'draft') as 'active' | 'paused' | 'completed' | 'draft',
      sent: c.totalSent,
      delivered: c.totalDelivered,
      read: c.totalRead,
      replied: c.totalReplied,
      total: c.totalDelivered || 100,
      createdAt: c.createdAt.toISOString().split('T')[0],
      template: c.messageTemplate || c.name,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('[ZCC Campaigns]', error);
    return NextResponse.json([], { status: 500 });
  }
}
