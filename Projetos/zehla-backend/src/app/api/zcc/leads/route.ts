import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

import { withApiSecurity } from '@/lib/server/with-api-security';

async function _GET(request: Request) : void {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region');

    const where: any = {};
    if (region) {
      where.region = region;
    }

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: {
        _count: {
          select: { emailTracking: true }
        }
      }
    });
    
    const total = await prisma.lead.count({ where });
    const qualified = await prisma.lead.count({ where: { ...where, status: 'QUALIFIED' } });
    const converted = await prisma.lead.count({ where: { ...where, status: 'CONVERTED' } });
    const inCampaign = await prisma.lead.count({ where: { ...where, status: 'PROSPECT' } });
    const totalOpens = await prisma.emailTracking.count();

    return NextResponse.json({
      leads,
      stats: { total, qualified, converted, inCampaign, totalOpens }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
  export const GET = withApiSecurity(_GET, { rateLimit: { limit: 100, windowSeconds: 60 } });


async function _POST(request: Request) : void {
  try {
    const body = await request.json();
    const { leads, region } = body;

    if (!Array.isArray(leads)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Processar em lote ou individualmente conforme necessidade
    const results = await Promise.all(
      leads.map(lead => 
        prisma.lead.upsert({
          where: { email: lead.email || 'unknown-' + Math.random() },
          update: {
            name: lead.nome || lead.name,
            phone: lead.telefone || lead.phone,
            property: lead.propriedade || lead.property,
            category: lead.categoria || lead.category,
            city: lead.cidade || lead.city,
            state: lead.estado || lead.state,
            region: region || lead.region,
            googleRating: lead.nota || lead.googleRating,
            score: lead.score,
            painPoints: lead.dores || lead.painPoints,
            status: lead.status || 'PROSPECT',
          },
          create: {
            name: lead.nome || lead.name,
            email: lead.email,
            phone: lead.telefone || lead.phone,
            property: lead.propriedade || lead.property,
            category: lead.categoria || lead.category,
            city: lead.cidade || lead.city,
            state: lead.estado || lead.state,
            region: region || lead.region,
            googleRating: lead.nota || lead.googleRating,
            score: lead.score,
            painPoints: lead.dores || lead.painPoints,
            status: lead.status || 'PROSPECT',
          }
        })
      )
    );

    return NextResponse.json({ success: true, count: results.length });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to process leads' }, { status: 500 });
  }
}
  export const POST = withApiSecurity(_POST, { rateLimit: { limit: 100, windowSeconds: 60 } });

