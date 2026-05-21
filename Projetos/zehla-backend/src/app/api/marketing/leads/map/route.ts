import { NextResponse } from 'next/server';
import { PrismaClient, LeadStatus } from '@prisma/client';
import { withApiSecurity } from '@/lib/server/with-api-security';
import type { RouteHandler } from '@/lib/server/with-api-security';
import { geolocalizarCidade } from '@/lib/mapa/cidades-coord';

const mapPrisma = new PrismaClient();

const getHandler: RouteHandler = async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const regiao = searchParams.get('regiao');
    const uf = searchParams.get('uf');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};
    if (regiao && regiao !== 'todas') where.region = regiao;
    if (uf && uf !== 'todos') where.state = uf;
    if (status && status !== 'todos') {
      where.status = status.toUpperCase() as LeadStatus;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const leads = await mapPrisma.lead.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: 500,
      select: {
        id: true, name: true, email: true, whatsapp: true, phone: true,
        roomsCount: true, localPraia: true, city: true, state: true,
        region: true, score: true, scoreValid: true,
        latitude: true, longitude: true, status: true,
        estimatedValues: true, qualification: true, validationStatus: true,
        intentSignals: true, socialMedia: true, site: true,
        phoneSecondary: true, buyingBehavior: true,
        lastInteractionAt: true, observacoes: true, updatedAt: true,
      },
    });

    const statusMap: Record<string, string> = {
      PROSPECT: 'novo',
      QUALIFIED: 'contatado',
      TRIAL_STARTED: 'respondido',
      CONVERTED: 'convertido',
      BLACKLISTED: 'perdido',
    };

    const mapLeads = leads.map(l => {
      let lat = l.latitude ?? 0;
      let lng = l.longitude ?? 0;

      if ((lat === 0 || lng === 0) && l.city) {
        const fallback = geolocalizarCidade(l.city);
        if (fallback) {
          lat = fallback[0] + (Math.random() - 0.5) * 0.04;
          lng = fallback[1] + (Math.random() - 0.5) * 0.04;
        }
      }

      return {
        id: l.id,
        pousada: l.name,
        email: l.email || '',
        whatsapp: l.whatsapp || l.phone || '',
        qtdQuartos: l.roomsCount,
        localPraia: l.localPraia || null,
        cidade: l.city || '',
        uf: l.state || '',
        valoresEstimados: l.estimatedValues || null,
        qualificacao: l.qualification || null,
        validacao: l.validationStatus || 'pendente',
        comportamentoCompra: l.buyingBehavior || null,
        sinaisIntencao: l.intentSignals || null,
        redesSociais: l.socialMedia || null,
        site: l.site || null,
        telefone: l.phoneSecondary || null,
        scoreQual: l.score ?? 0,
        scoreValid: l.scoreValid ?? 0,
        latitude: lat,
        longitude: lng,
        regiao: l.region || '',
        status: statusMap[l.status] || 'novo',
        ultimoContato: l.lastInteractionAt?.toISOString() || null,
        observacoes: l.observacoes || null,
      };
    });

    const total = await mapPrisma.lead.count();

    const porUfRaw = await mapPrisma.lead.groupBy({
      by: ['state'],
      _count: true,
      orderBy: { _count: { id: 'desc' } },
    });

    const porStatusRaw = await mapPrisma.lead.groupBy({
      by: ['status'],
      _count: true,
    });

    const porRegiaoRaw = await mapPrisma.lead.groupBy({
      by: ['region'],
      _count: true,
    });

    const avgScore = await mapPrisma.lead.aggregate({ _avg: { score: true } });
    const avgScoreValid = await mapPrisma.lead.aggregate({ _avg: { scoreValid: true } });

    return NextResponse.json({
      leads: mapLeads,
      stats: {
        total,
        porUf: porUfRaw.filter(g => g.state).map(g => ({ uf: g.state!, count: g._count })),
        porStatus: porStatusRaw.map(g => ({ status: statusMap[g.status] || g.status.toLowerCase(), count: g._count })),
        porRegiao: porRegiaoRaw.filter(g => g.region).map(g => ({ regiao: g.region!, count: g._count })),
        avgScoreQual: Math.round(avgScore._avg.score || 0),
        avgScoreValid: Math.round(avgScoreValid._avg.scoreValid || 0),
      },
    });
  } catch (error) {
    console.error('Error fetching lead map data:', error);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
};

export const GET = withApiSecurity(getHandler);
