import { NextResponse } from 'next/server';
import { PrismaClient, LeadStatus } from '@prisma/client';

const rawPrisma = new PrismaClient();

export async function GET() {
  try {
    const leads = await rawPrisma.lead.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 200,
      select: {
        id: true, name: true, city: true, state: true,
        phone: true, whatsapp: true, email: true,
        googleRating: true, score: true, status: true,
        painPoints: true, updatedAt: true,
      },
    });

    const total = await rawPrisma.lead.count();
    const porStatus = await rawPrisma.lead.groupBy({
      by: ['status'],
      _count: true,
    });

    return NextResponse.json({
      leads: leads.map(l => ({
        id: l.id,
        name: l.name,
        category: 'pousada',
        city: l.city,
        state: l.state,
        phone: l.phone || l.whatsapp,
        emails: l.email ? [l.email] : [],
        googleRating: l.googleRating,
        leadScore: l.score ?? 0,
        status: l.status.toLowerCase(),
        painPoints: l.painPoints ? l.painPoints.split(',').map(s => s.trim()) : [],
      })),
      stats: {
        total,
        porStatus: porStatus.map(g => ({ status: g.status.toLowerCase(), count: g._count })),
      },
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}
