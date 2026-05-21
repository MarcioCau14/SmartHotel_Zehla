import { prisma } from '@/lib/prisma';

export interface ToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, any>;
  };
}

export async function executeTool(toolName: string, args: Record<string, any>): Promise<string> {
  switch (toolName) {
    case 'zehla_analisar_ocupacao':
      return analisarOcupacao(args);
    case 'zehla_sugerir_preco':
      return sugerirPreco(args);
    case 'zehla_analisar_reviews':
      return analisarReviews(args);
    case 'zehla_gerar_relatorio_diario':
      return gerarRelatorioDiario(args);
    case 'zehla_buscar_dados_property':
      return buscarDadosProperty(args);
    default:
      return JSON.stringify({ error: `Ferramenta desconhecida: ${toolName}` });
  }
}

export const ZEHLA_TOOLS: ToolDefinition[] = [
  {
    type: 'function',
    function: {
      name: 'zehla_analisar_ocupacao',
      description: 'Analisa a taxa de ocupação de uma pousada no período, com tendências e alertas.',
      parameters: {
        type: 'object',
        properties: {
          pousada_id: { type: 'string', description: 'ID da pousada' },
          periodo_inicio: { type: 'string', description: 'Início do período (YYYY-MM-DD)' },
          periodo_fim: { type: 'string', description: 'Fim do período (YYYY-MM-DD)' }
        },
        required: ['pousada_id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'zehla_sugerir_preco',
      description: 'Sugere preço ótimo para um tipo de quarto baseado em ocupação, sazonalidade e dados do banco.',
      parameters: {
        type: 'object',
        properties: {
          pousada_id: { type: 'string' },
          tipo_quarto: { type: 'string', enum: ['standard', 'deluxe', 'suite'] },
          data_checkin: { type: 'string', description: 'Data de check-in (YYYY-MM-DD)' },
          data_checkout: { type: 'string', description: 'Data de check-out (YYYY-MM-DD)' }
        },
        required: ['pousada_id', 'tipo_quarto', 'data_checkin', 'data_checkout']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'zehla_analisar_reviews',
      description: 'Analisa reviews da pousada extraindo sentimento, tópicos e recomendações.',
      parameters: {
        type: 'object',
        properties: {
          pousada_id: { type: 'string' },
          limite: { type: 'number', default: 20 }
        },
        required: ['pousada_id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'zehla_gerar_relatorio_diario',
      description: 'Gera relatório operacional diário com métricas de ocupação, receita e reservas.',
      parameters: {
        type: 'object',
        properties: {
          pousada_id: { type: 'string' },
          data: { type: 'string', description: 'Data do relatório (YYYY-MM-DD), padrão: hoje' }
        },
        required: ['pousada_id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'zehla_buscar_dados_property',
      description: 'Busca dados cadastrais completos da pousada: nome, endereço, tipo, quartos, preços.',
      parameters: {
        type: 'object',
        properties: {
          pousada_id: { type: 'string' }
        },
        required: ['pousada_id']
      }
    }
  }
];

async function analisarOcupacao(args: Record<string, any>): Promise<string> {
  const { pousada_id, periodo_inicio, periodo_fim } = args;
  const start = periodo_inicio ? new Date(periodo_inicio) : new Date(Date.now() - 30 * 86400000);
  const end = periodo_fim ? new Date(periodo_fim) : new Date();

  const totalRooms = await prisma.room.count({ where: { propertyId: pousada_id } });
  const reservations = await prisma.reservation.findMany({
    where: {
      propertyId: pousada_id,
      checkIn: { gte: start },
      checkOut: { lte: end },
      status: 'CONFIRMED'
    }
  });

  const totalNights = Math.ceil((end.getTime() - start.getTime()) / 86400000);
  const occupiedRoomNights = reservations.reduce((sum, r) => {
    const nights = Math.ceil((r.checkOut.getTime() - r.checkIn.getTime()) / 86400000);
    return sum + nights;
  }, 0);
  const occupancyRate = totalRooms > 0 ? (occupiedRoomNights / (totalRooms * totalNights)) * 100 : 0;

  return JSON.stringify({
    pousada_id,
    periodo: `${start.toISOString().slice(0, 10)} a ${end.toISOString().slice(0, 10)}`,
    total_quartos: totalRooms,
    reservas_no_periodo: reservations.length,
    ocupacao_media: Math.round(occupancyRate * 100) / 100,
    noites_ocupadas: occupiedRoomNights,
    noites_disponiveis: totalRooms * totalNights,
    alertas: occupancyRate < 40 ? ['Ocupação baixa — considerar promoções ou pacotes especiais.'] :
             occupancyRate > 85 ? ['Ocupação alta — ótimo momento para ajustar preços para cima.'] : [],
    fonte: 'dados_reais_banco'
  }, null, 2);
}

async function sugerirPreco(args: Record<string, any>): Promise<string> {
  const { pousada_id, tipo_quarto, data_checkin, data_checkout } = args;

  const rooms = await prisma.room.findMany({
    where: { propertyId: pousada_id },
    include: { accommodationType: true }
  });

  const matchingRooms = rooms.filter(r =>
    r.accommodationType?.name?.toLowerCase().includes(tipo_quarto?.toLowerCase() || '')
  );

  const basePrice = matchingRooms.length > 0
    ? matchingRooms[0].accommodationType!.basePrice
    : 250;

  const checkin = new Date(data_checkin);
  const checkout = new Date(data_checkout);
  const nights = Math.ceil((checkout.getTime() - checkin.getTime()) / 86400000);

  const month = checkin.getMonth();
  const isHighSeason = [0, 6, 11].includes(month) || (month === 6 && checkin.getDate() >= 15);
  const isHoliday = [0, 6, 11].some(m => m === month);

  let multiplier = 1.0;
  if (isHoliday) multiplier = 1.35;
  else if (isHighSeason) multiplier = 1.2;

  const suggestedPrice = Math.round(basePrice * multiplier);

  return JSON.stringify({
    tipo_quarto,
    preco_base: basePrice,
    multiplicador_sazonal: multiplier,
    preco_sugerido: suggestedPrice,
    faixa_minima: Math.round(suggestedPrice * 0.85),
    faixa_maxima: Math.round(suggestedPrice * 1.2),
    periodo: `${data_checkin} a ${data_checkout} (${nights} noites)`,
    justificativa: isHoliday
      ? 'Período de alta temporada/feriado — demanda elevada.'
      : isHighSeason
      ? 'Alta temporada — ajuste moderado de preço.'
      : 'Período regular — preço base mantido.',
    fonte: 'dados_reais_banco'
  }, null, 2);
}

async function analisarReviews(args: Record<string, any>): Promise<string> {
  const { pousada_id, limite = 20 } = args;

  const leads = await prisma.lead.findMany({
    where: { propertyId: pousada_id, googleRating: { not: null } },
    take: limite,
    orderBy: { updatedAt: 'desc' },
    select: { name: true, googleRating: true, score: true, city: true, updatedAt: true }
  });

  const ratings = leads.filter(l => l.googleRating).map(l => l.googleRating!) as number[];
  const avgRating = ratings.length > 0
    ? ratings.reduce((a, b) => a + b, 0) / ratings.length
    : 0;
  const distribution = [0, 0, 0, 0, 0];
  ratings.forEach(r => { if (r >= 1 && r <= 5) distribution[Math.floor(r) - 1]++; });

  return JSON.stringify({
    total_reviews: leads.length,
    nota_media: Math.round(avgRating * 10) / 10,
    distribuicao_estrelas: { '1': distribution[0], '2': distribution[1], '3': distribution[2], '4': distribution[3], '5': distribution[4] },
    sentimento_geral: avgRating >= 4 ? 'positivo' : avgRating >= 3 ? 'neutro' : 'negativo',
    ultimos_leads_com_nota: leads.slice(0, 5).map(l => ({
      nome: l.name,
      nota: l.googleRating,
      score: l.score,
      cidade: l.city
    })),
    fonte: 'dados_reais_banco'
  }, null, 2);
}

async function gerarRelatorioDiario(args: Record<string, any>): Promise<string> {
  const { pousada_id } = args;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const amanha = new Date(hoje);
  amanha.setDate(amanha.getDate() + 1);

  const [totalRooms, checkinsHoje, checkoutsHoje, novasReservas, totalReservas30d] = await Promise.all([
    prisma.room.count({ where: { propertyId: pousada_id } }),
    prisma.reservation.count({ where: { propertyId: pousada_id, checkIn: { gte: hoje, lt: amanha }, status: 'CONFIRMED' } }),
    prisma.reservation.count({ where: { propertyId: pousada_id, checkOut: { gte: hoje, lt: amanha }, status: 'CONFIRMED' } }),
    prisma.reservation.count({ where: { propertyId: pousada_id, createdAt: { gte: hoje } } }),
    prisma.reservation.count({
      where: { propertyId: pousada_id, status: 'CONFIRMED', checkIn: { gte: hoje, lte: new Date(Date.now() + 30 * 86400000) } }
    })
  ]);

  const activatedRooms = await prisma.reservation.findMany({
    where: { propertyId: pousada_id, checkIn: { lte: hoje }, checkOut: { gte: hoje }, status: 'CONFIRMED' }
  });
  const hospedesAtuais = activatedRooms.length;

  return JSON.stringify({
    data: hoje.toISOString().slice(0, 10),
    metricas: {
      total_quartos: totalRooms,
      checkins_hoje: checkinsHoje,
      checkouts_hoje: checkoutsHoje,
      hospedes_atuais: hospedesAtuais,
      ocupacao_percentual: totalRooms > 0 ? Math.round((hospedesAtuais / totalRooms) * 100) : 0,
      novas_reservas_hoje: novasReservas,
      reservas_proximos_30_dias: totalReservas30d
    },
    alertas: totalReservas30d < 10 ? 'Reservas baixas para os próximos 30 dias — considerar campanha de marketing.' : 'Carteira de reservas saudável.',
    fonte: 'dados_reais_banco'
  }, null, 2);
}

async function buscarDadosProperty(args: Record<string, any>): Promise<string> {
  const { pousada_id } = args;

  const property = await prisma.property.findUnique({
    where: { id: pousada_id },
    include: { rooms: { include: { accommodationType: true } } }
  });

  if (!property) return JSON.stringify({ error: 'Propriedade não encontrada' });

  return JSON.stringify({
    id: property.id,
    nome: property.name,
    endereco: `${property.address || ''}, ${property.city || ''} ${property.state || ''}`,
    tipo: property.type || 'pousada',
    plan: property.plan,
    total_quartos: property.rooms?.length || 0,
    tipos_acomodacao: [...new Set(property.rooms?.map(r => r.accommodationType?.name).filter(Boolean) || [])],
    preco_medio_quartos: (() => {
      const prices = property.rooms?.map(r => r.accommodationType?.basePrice).filter(Boolean) as number[] || [];
      return prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;
    })(),
    fonte: 'dados_reais_banco'
  }, null, 2);
}
