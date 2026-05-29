/**
 * ZMG Intelligence Enricher
 * Cross-references contacts with ZCC-TRENDS and Swipe Intelligence
 */

import { prisma } from '@/lib/prisma';
import { ContactProfile } from '@prisma/client';

export interface TrendSignal {
  id: string;
  location: string; // "Paraty", "SC", "Litoral Gaúcho"
  type: 'HOLIDAY' | 'WEATHER' | 'EVENT' | 'DEMAND_BOOM';
  title: string;
  urgency: number; // 0 to 100
  description: string;
}

export class ZMGEnricher {
  /**
   * Encontra sinais de tendência relevantes para um contato específico
   */
  static async getRelevantTrends(contact: ContactProfile): Promise<TrendSignal[]> {
    // 1. Identificar localização do contato (simplificado por enquanto)
    // Em produção, usaríamos o city/state do ContactProfile
    const phone = contact.normalizedPhone || '';
    let geoFilter = 'Geral';
    
    if (phone.includes('+5511') || phone.includes('+5512') || phone.includes('+5513')) geoFilter = 'SP';
    if (phone.includes('+5547') || phone.includes('+5548')) geoFilter = 'SC';
    if (phone.includes('+5521') || phone.includes('+5522') || phone.includes('+5524')) geoFilter = 'RJ';

    const signals: TrendSignal[] = [];

    try {
      // 2. Buscar TrendSignals do banco (últimas 48h)
      const dbTrends = await prisma.trendSignal.findMany({
        where: {
          geo: { in: [geoFilter, 'Geral', 'Brasil', 'BR'] },
          dateDetected: { gte: new Date(Date.now() - 48 * 60 * 60 * 1000) }
        },
        orderBy: { interestScore: 'desc' },
        take: 2
      });

      for (const t of dbTrends) {
        signals.push({
          id: t.id,
          location: t.geo || 'Geral',
          type: t.type as any,
          title: `Tendência: ${t.keyword}`,
          urgency: t.interestScore,
          description: `${t.category}: Interesse subiu ${t.deltaPercent.toFixed(1)}% recentemente.`
        });
      }

      // 3. Buscar WeatherSignals críticos
      const dbWeather = await prisma.weatherSignal.findMany({
        where: {
          impactScore: { gte: 70 }
        },
        take: 1
      });

      for (const w of dbWeather) {
        signals.push({
          id: w.id,
          location: w.city,
          type: 'WEATHER',
          title: `Clima: ${w.condition}`,
          urgency: w.impactScore,
          description: `Previsão de ${w.condition} em ${w.city} (${w.dateRange}). Impacto alto na demanda.`
        });
      }

      // 4. Buscar Feriados próximos (próximos 15 dias)
      const dbHolidays = await prisma.holidaySignal.findMany({
        where: {
          daysUntil: { lte: 15 }
        },
        take: 1
      });

      for (const h of dbHolidays) {
        signals.push({
          id: h.id,
          location: 'Brasil',
          type: 'HOLIDAY',
          title: `Feriado: ${h.name}`,
          urgency: Math.max(0, 100 - (h.daysUntil * 5)),
          description: `Faltam apenas ${h.daysUntil} dias para o feriado de ${h.name}.`
        });
      }

    } catch (error) {
      console.error('❌ [ZMG:ENRICH] Erro ao buscar tendências reais:', error);
    }

    return signals;
  }

  /**
   * Enriquece as variáveis de contexto com dados de tendência
   */
  static async enrichContext(contact: ContactProfile, variables: Record<string, string>): Promise<Record<string, string>> {
    const trends = await this.getRelevantTrends(contact);
    
    let enriched: Record<string, string> = {
      ...variables,
      NOME: contact.name || 'Proprietário(a)'
    };

    if (trends.length > 0) {
      const topTrend = trends[0];
      enriched = {
        ...enriched,
        TENDENCIA_LOCAL: topTrend.location,
        TENDENCIA_TITULO: topTrend.title,
        TENDENCIA_URGENCIA: `${topTrend.urgency}%`,
        TENDENCIA_DETALHE: topTrend.description,
        DOR_CONVERSAO: "Não perca essas reservas para os concorrentes que já estão usando IA."
      };
    }

    return enriched;
  }
}
