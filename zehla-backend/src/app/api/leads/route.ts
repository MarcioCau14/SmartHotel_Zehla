import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Guardian } from '@/lib/security/guardian';
import { getServerSession } from 'next-auth';

export async function GET(req: NextRequest) {
  // 1. BLINDAGEM: Rate Limiting (50 req/min)
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const isAllowed = await Guardian.checkRateLimit(ip, 'GET_LEADS');
  if (!isAllowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  // 2. BLINDAGEM: Autenticação (Apenas usuários logados)
  const session = await getServerSession();
  if (!session && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const region = searchParams.get('region');
  const state = searchParams.get('state');
  const minScore = parseInt(searchParams.get('minScore') || '0');
  const search = searchParams.get('search');

  try {
    const where: any = {};
    if (region && region !== 'all') where.region = region;
    if (state && state !== 'all') where.state = state;
    if (minScore > 0) where.score = { gte: minScore };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [leads, stats] = await Promise.all([
      prisma.lead.findMany({
        where,
        select: {
          id: true,
          name: true,
          city: true,
          state: true,
          latitude: true,
          longitude: true,
          score: true,
          validationScore: true,
          status: true,
          whatsapp: true,
          intentSignals: true,
          qualification: true,
        },
        orderBy: { score: 'desc' },
        take: 3000, // Expansão para visualização completa da base (2.7k+ leads)
      }),
      prisma.lead.aggregate({
        where,
        _count: true,
        _avg: {
          score: true,
          validationScore: true,
        },
      }),
    ]);

    // Agregação por região para o HUD
    const byRegion = await prisma.lead.groupBy({
      by: ['region'],
      _count: true,
      where,
    });

    return NextResponse.json({
      leads,
      stats: {
        total: stats._count,
        avgScore: Math.round(stats._avg.score || 0),
        avgValidation: Math.round(stats._avg.validationScore || 0),
        byRegion: byRegion.map(r => ({ name: r.region, count: r._count })),
      }
    });
  } catch (error) {
    console.error('Lead API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // 1. BLINDAGEM: Rate Limiting Agressivo para Cadastro (10 req/min por IP)
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const isAllowed = await Guardian.checkRateLimit(ip, 'POST_LEAD_CAPTURE');
  if (!isAllowed) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  try {
    const data = await req.json();
    const { name, email, whatsapp, city, state, source } = data;

    // Validação mínima inegociável
    if (!name || !whatsapp) {
      return NextResponse.json({ error: 'Nome e WhatsApp são obrigatórios' }, { status: 400 });
    }

    // 2. INGESTÃO: Persistir no Lead Intelligence System (LIS)
    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        whatsapp,
        city: city || 'Unknown',
        state: state || 'Unknown',
        region: 'OUTROS', // Será classificado pela Secretaria-IA
        source: source || 'LANDING_PAGE',
        status: 'NEW',
        score: 0,
        validationScore: 0,
        intentSignals: ['VISIT_VITRINE'],
        qualification: 'Aguardando Processamento Neural...',
      },
    });

    // 3. GATILHO: Disparar Secretaria-IA para Raio-X (Async)
    // Aqui injetamos no background worker para não atrasar o 100/100 Lighthouse
    // Em ambiente de desenvolvimento, podemos simular ou chamar uma função async sem await
    processLeadQualification(lead.id).catch(err => 
      console.error('❌ [Secretaria-IA] Erro ao enfileirar qualificação:', err)
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Lead capturado e enviado para qualificação neural.',
      leadId: lead.id 
    });
  } catch (error) {
    console.error('❌ [LIS] Erro na captura de lead:', error);
    return NextResponse.json({ error: 'Erro interno na captura' }, { status: 500 });
  }
}

// Simulação de enfileiramento (BullMQ Integration Ready)
async function processLeadQualification(leadId: string) {
  // TODO: Integrar com BullMQ 'SECRETARIA_QUALIFY'
  console.log(`🧠 [Secretaria-IA] Iniciando Raio-X do Lead: ${leadId}`);
}
