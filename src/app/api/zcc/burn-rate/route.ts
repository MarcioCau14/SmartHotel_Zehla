import { NextRequest, NextResponse } from 'next/server';
import { verifyZCCAccessOrReject } from '@/lib/zcc-security';

// ═══════════════════════════════════════════════════════════════
// ZCC BURN RATE — Taxímetro Global de Tarifas Meta
// Recebe telemetria do simulador e atualiza o contador
// de economia de tarifas do ecossistema.
// Mock Mode: armazena em memória (produção → Prisma)
// ═══════════════════════════════════════════════════════════════

// In-memory store for mock mode (resets on server restart)
const burnRateStore = {
  totalEvents: 0,
  totalMessagesProcessed: 0,
  totalTariffsUsed: 0,
  totalTariffsSaved: 0,
  totalMetaCostSpent: 0,
  totalMetaCostSaved: 0,
  lastEventAt: null as string | null,
  byNiche: {
    pousada: { events: 0, messages: 0, tariffsUsed: 0, saved: 0 },
    airbnb: { events: 0, messages: 0, tariffsUsed: 0, saved: 0 },
  },
};

interface BurnRateEvent {
  event: string;
  messagesCount: number;
  tariffsUsed: number;
  tariffsSaved: number;
  metaCostSpent: number;
  metaCostSaved: number;
  economyPercent: number;
  niche: 'pousada' | 'airbnb';
  simulatorSessionId?: string;
}

// POST — Record a new telemetry event
export async function POST(request: NextRequest) {
  const security = await verifyZCCAccessOrReject(request);
  if (!security.allowed) return security.response!;

  let body: BurnRateEvent;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'INVALID_BODY', message: 'Corpo da requisição inválido.' },
      { status: 400 }
    );
  }

  const { event, messagesCount, tariffsUsed, tariffsSaved, metaCostSpent, metaCostSaved, niche } = body;

  if (!event || messagesCount === undefined) {
    return NextResponse.json(
      { error: 'MISSING_FIELDS', message: 'Campos obrigatórios: event, messagesCount.' },
      { status: 400 }
    );
  }

  // Update global counters
  burnRateStore.totalEvents += 1;
  burnRateStore.totalMessagesProcessed += messagesCount || 0;
  burnRateStore.totalTariffsUsed += tariffsUsed || 0;
  burnRateStore.totalTariffsSaved += tariffsSaved || 0;
  burnRateStore.totalMetaCostSpent += metaCostSpent || 0;
  burnRateStore.totalMetaCostSaved += metaCostSaved || 0;
  burnRateStore.lastEventAt = new Date().toISOString();

  // Update per-niche counters
  const nicheKey = niche === 'airbnb' ? 'airbnb' : 'pousada';
  burnRateStore.byNiche[nicheKey].events += 1;
  burnRateStore.byNiche[nicheKey].messages += messagesCount || 0;
  burnRateStore.byNiche[nicheKey].tariffsUsed += tariffsUsed || 0;
  burnRateStore.byNiche[nicheKey].saved += tariffsSaved || 0;

  return NextResponse.json({
    success: true,
    data: {
      eventRecorded: event,
      globalTotals: {
        totalEvents: burnRateStore.totalEvents,
        totalMessagesProcessed: burnRateStore.totalMessagesProcessed,
        totalTariffsUsed: burnRateStore.totalTariffsUsed,
        totalTariffsSaved: burnRateStore.totalTariffsSaved,
        totalMetaCostSpent: Math.round(burnRateStore.totalMetaCostSpent * 10000) / 10000,
        totalMetaCostSaved: Math.round(burnRateStore.totalMetaCostSaved * 10000) / 10000,
        globalEconomyPercent: burnRateStore.totalTariffsUsed + burnRateStore.totalTariffsSaved > 0
          ? Math.round((burnRateStore.totalTariffsSaved / (burnRateStore.totalTariffsUsed + burnRateStore.totalTariffsSaved)) * 100)
          : 0,
      },
      byNiche: burnRateStore.byNiche,
      lastEventAt: burnRateStore.lastEventAt,
    },
  });
}

// GET — Read current burn rate stats
export async function GET(request: NextRequest) {
  const security = await verifyZCCAccessOrReject(request);
  if (!security.allowed) return security.response!;

  return NextResponse.json({
    success: true,
    data: {
      globalTotals: {
        totalEvents: burnRateStore.totalEvents,
        totalMessagesProcessed: burnRateStore.totalMessagesProcessed,
        totalTariffsUsed: burnRateStore.totalTariffsUsed,
        totalTariffsSaved: burnRateStore.totalTariffsSaved,
        totalMetaCostSpent: Math.round(burnRateStore.totalMetaCostSpent * 10000) / 10000,
        totalMetaCostSaved: Math.round(burnRateStore.totalMetaCostSaved * 10000) / 10000,
        globalEconomyPercent: burnRateStore.totalTariffsUsed + burnRateStore.totalTariffsSaved > 0
          ? Math.round((burnRateStore.totalTariffsSaved / (burnRateStore.totalTariffsUsed + burnRateStore.totalTariffsSaved)) * 100)
          : 0,
      },
      byNiche: burnRateStore.byNiche,
      lastEventAt: burnRateStore.lastEventAt,
    },
  });
}
