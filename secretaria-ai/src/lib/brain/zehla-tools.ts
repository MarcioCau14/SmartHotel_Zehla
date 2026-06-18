import { prisma } from '../../prisma';

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
    case 'zehla_analisar_ocupacao': return analisarOcupacao(args);
    case 'zehla_sugerir_preco': return sugerirPreco(args);
    case 'zehla_analisar_reviews': return analisarReviews(args);
    case 'zehla_gerar_relatorio_diario': return gerarRelatorioDiario(args);
    case 'zehla_buscar_dados_property': return buscarDadosProperty(args);
    default: return JSON.stringify({ error: `Ferramenta desconhecida: ${toolName}` });
  }
}

export const ZEHLA_TOOLS: ToolDefinition[] = [
  { type: 'function', function: { name: 'zehla_analisar_ocupacao', description: 'Analisa taxa de ocupação.', parameters: { type: 'object', properties: { pousada_id: { type: 'string' }, periodo_inicio: { type: 'string' }, periodo_fim: { type: 'string' } }, required: ['pousada_id'] } } },
  { type: 'function', function: { name: 'zehla_sugerir_preco', description: 'Sugere preço ótimo.', parameters: { type: 'object', properties: { pousada_id: { type: 'string' }, tipo_quarto: { type: 'string' }, data_checkin: { type: 'string' }, data_checkout: { type: 'string' } }, required: ['pousada_id', 'tipo_quarto', 'data_checkin', 'data_checkout'] } } },
  { type: 'function', function: { name: 'zehla_analisar_reviews', description: 'Analisa reviews.', parameters: { type: 'object', properties: { pousada_id: { type: 'string' }, limite: { type: 'number', default: 20 } }, required: ['pousada_id'] } } },
  { type: 'function', function: { name: 'zehla_gerar_relatorio_diario', description: 'Relatório operacional diário.', parameters: { type: 'object', properties: { pousada_id: { type: 'string' }, data: { type: 'string' } }, required: ['pousada_id'] } } },
  { type: 'function', function: { name: 'zehla_buscar_dados_property', description: 'Dados cadastrais da pousada.', parameters: { type: 'object', properties: { pousada_id: { type: 'string' } }, required: ['pousada_id'] } } },
];

async function analisarOcupacao(args: Record<string, any>): Promise<string> {
  const { pousada_id, periodo_inicio, periodo_fim } = args;
  const start = periodo_inicio ? new Date(periodo_inicio) : new Date(Date.now() - 30 * 86400000);
  const end = periodo_fim ? new Date(periodo_fim) : new Date();
  const totalRooms = await prisma.lead.count({ where: { city: pousada_id || undefined } });
  const reservations = await prisma.lead.findMany({ where: { createdAt: { gte: start, lte: end } } });
  const totalNights = Math.ceil((end.getTime() - start.getTime()) / 86400000);
  const occupiedRoomNights = reservations.length;
  const occupancyRate = totalRooms > 0 ? (occupiedRoomNights / (totalRooms * totalNights)) * 100 : 0;
  return JSON.stringify({ pousada_id, periodo: `${start.toISOString().slice(0, 10)} a ${end.toISOString().slice(0, 10)}`, total_quartos: totalRooms, reservas: reservations.length, ocupacao_media: Math.round(occupancyRate * 100) / 100, alertas: occupancyRate < 40 ? ['Ocupação baixa'] : occupancyRate > 85 ? ['Ocupação alta'] : [], fonte: 'secretaria_ai' }, null, 2);
}

async function sugerirPreco(args: Record<string, any>): Promise<string> {
  const { tipo_quarto, data_checkin } = args;
  const checkin = new Date(data_checkin || Date.now());
  const month = checkin.getMonth();
  const isHighSeason = [0, 6, 11].includes(month);
  const basePrice = 250;
  const multiplier = isHighSeason ? 1.35 : 1.0;
  const suggestedPrice = Math.round(basePrice * multiplier);
  return JSON.stringify({ tipo_quarto, preco_base: basePrice, multiplicador_sazonal: multiplier, preco_sugerido: suggestedPrice, justificativa: isHighSeason ? 'Alta temporada' : 'Período regular', fonte: 'secretaria_ai' }, null, 2);
}

async function analisarReviews(args: Record<string, any>): Promise<string> {
  const { limite = 20 } = args;
  const leads = await prisma.lead.findMany({ where: { googleRating: { not: null } }, take: limite, orderBy: { updatedAt: 'desc' }, select: { name: true, googleRating: true, score: true, city: true } });
  const ratings = leads.filter(l => l.googleRating).map(l => l.googleRating!) as number[];
  const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
  return JSON.stringify({ total_reviews: leads.length, nota_media: Math.round(avgRating * 10) / 10, sentimento_geral: avgRating >= 4 ? 'positivo' : avgRating >= 3 ? 'neutro' : 'negativo', fonte: 'secretaria_ai' }, null, 2);
}

async function gerarRelatorioDiario(args: Record<string, any>): Promise<string> {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const amanha = new Date(hoje);
  amanha.setDate(amanha.getDate() + 1);
  const totalLeads = await prisma.lead.count();
  const novosHoje = await prisma.lead.count({ where: { createdAt: { gte: hoje } } });
  const hotLeads = await prisma.lead.count({ where: { leadTier: 'HOT' } });
  return JSON.stringify({ data: hoje.toISOString().slice(0, 10), metricas: { total_leads: totalLeads, novos_hoje: novosHoje, hot_leads: hotLeads }, fonte: 'secretaria_ai' }, null, 2);
}

async function buscarDadosProperty(args: Record<string, any>): Promise<string> {
  const { pousada_id } = args;
  const lead = await prisma.lead.findFirst({ where: { name: { contains: pousada_id || '' } } });
  if (!lead) return JSON.stringify({ error: 'Propriedade não encontrada' });
  return JSON.stringify({ id: lead.id, nome: lead.name, cidade: lead.city, estado: lead.state, quartos: lead.roomsCount, fonte: 'secretaria_ai' }, null, 2);
}
