import { NextResponse } from 'next/server';

import { getFinanceAgent } from '@/lib/intelligence/finance-agents-brain';
import { prisma } from '@/lib/prisma'; // Assumindo que este é o caminho do prisma client

import { withApiSecurity } from '@/lib/server/with-api-security';

/**
 * API: Dashboard Financeiro ZCC (Jony, Maria & Tedd)
 */
async function _GET(request: Request) : void {
  const { searchParams } = new URL(request.url);
  const propertyId = searchParams.get('propertyId') || 'default-smart-hotel';
  const days = parseInt(searchParams.get('days') || '30');

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 1. Busca dados agregados
    const finances = await (prisma as any).pousadaFinance.findMany({
      where: { propertyId, date: { gte: startDate } },
      orderBy: { date: 'asc' },
    });

    // 2. Busca alertas não lidos (Gerados pelo Jony/Maria/Tedd)
    const alerts = await (prisma as any).financeAlert.findMany({
      where: { propertyId, isRead: false },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // 3. Calcula KPIs
    const totalRevenue = finances.reduce((sum: number, f: unknown) => sum + f.netRevenue, 0);
    const totalCosts = finances.reduce((sum: number, f: unknown) => sum + f.totalCosts, 0);
    const avgOccupancy = finances.length > 0 
      ? finances.reduce((sum: number, f: unknown) => sum + f.occupancyRate, 0) / finances.length 
      : 0;

    // 4. Seleciona Agente (Jony para dashboard diário)
    const agent = getFinanceAgent('daily');

    // Mock do Insight da IA (Em produção, aqui chamaria o ZAI / OpenAI)
    const aiInsight = `Jony diz: Sua receita nos últimos ${days} dias foi de R$ ${totalRevenue.toLocaleString('pt-BR')}. ` +
                      `A ocupação média está em ${avgOccupancy.toFixed(1)}%. ` +
                      (alerts.length > 0 ? `Atenção: Existem ${alerts.length} alertas financeiros pendentes!` : "Tudo sob controle hoje.");

    return NextResponse.json({
      summary: {
        totalRevenue,
        totalCosts,
        profit: totalRevenue - totalCosts,
        profitMargin: totalRevenue > 0 ? ((totalRevenue - totalCosts) / totalRevenue) * 100 : 0,
        avgOccupancy,
      },
      chartData: finances.map((f: unknown) => ({
        date: f.date,
        revenue: f.netRevenue,
        costs: f.totalCosts,
        occupancy: f.occupancyRate,
      })),
      alerts,
      aiInsight,
      healthScore: avgOccupancy > 70 ? 90 : 60, // Lógica simplificada
      agentName: agent.name
    });

  } catch (error) {
    console.error('Erro na API Financeira:', error);
    return NextResponse.json({ error: 'Erro ao buscar dados financeiros' }, { status: 500 });
  }
}
  export const GET = withApiSecurity(_GET, { rateLimit: { limit: 100, windowSeconds: 60 } });

