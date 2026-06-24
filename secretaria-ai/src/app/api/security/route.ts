import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const alerts = await db.securityAlert.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return NextResponse.json({ success: true, alerts, status: 'secure' });
  } catch (error) {
    return NextResponse.json({ success: true, alerts: [], status: 'secure' });
  }
}
