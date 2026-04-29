import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      take: 150
    });
    
    const total = await prisma.lead.count();
    const qualified = await prisma.lead.count({ where: { status: 'QUALIFIED' } });
    const converted = await prisma.lead.count({ where: { status: 'CONVERTED' } });
    const inCampaign = await prisma.lead.count({ where: { status: 'PROSPECT' } });

    return NextResponse.json({
      leads,
      stats: { total, qualified, converted, inCampaign }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
