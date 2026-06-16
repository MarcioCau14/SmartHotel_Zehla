import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getActiveSignals, getSignalPriority, type AgentType } from "@/lib/trends/agent-integration";

import { withApiSecurity } from "@/lib/server/with-api-security";

const AGENTS_WITH_ALERTS: { agent: AgentType; label: string }[] = [
  { agent: "ZCC-REV", label: "Financeiro" },
  { agent: "ZCC-MKT", label: "Marketing" },
  { agent: "ZCC-RES", label: "Reservas" },
  { agent: "ZCC-HRD", label: "Guardião" },
];

async function _GET(request: NextRequest) {
  try {
  const { searchParams } = new URL(request.url);
    const agentFilter = searchParams.get("agent")?.toUpperCase();

    const signals = await getActiveSignals({
      severity: ["alta", "critica"],
      since: new Date(Date.now() - 72 * 60 * 60 * 1000),
      limit: 100,
    });

    const alerts: any[] = [];

    for (const signal of signals) {
      const priority = getSignalPriority(signal as any);

      for (const { agent, label } of AGENTS_WITH_ALERTS) {
        if (agentFilter && agent !== agentFilter) continue;

        alerts.push({
          id: `${signal.id}-${agent}`,
          signalId: signal.id,
          agent,
          agentLabel: label,
          keyword: signal.keyword,
          type: signal.type,
          severity: signal.severity,
          priority,
          deltaPercent: signal.deltaPercent,
          message: buildAlertMessage(signal as any, agent),
          detectedAt: signal.createdAt,
          read: false,
        });
      }
    }

    alerts.sort((a, b) => b.priority - a.priority);

    const unread = alerts.filter((a) => !a.read).length;

    return NextResponse.json({
      success: true,
      data: alerts,
      meta: {
        total: alerts.length,
        unread,
        agents: AGENTS_WITH_ALERTS.map((a) => a.agent),
      },
    });
  } catch (error) {
    console.error("❌ Erro em ZCC-TRENDS Alerts:", error);
    return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 });
  }
}

function buildAlertMessage(signal: { keyword: string; type: string; deltaPercent?: number | null; severity: string }, agent: string): string {
  const delta = signal.deltaPercent ?? 0;
  const absDelta = Math.abs(delta);
  const direction = delta >= 0 ? "alta" : "queda";

  const messages: Record<string, string> = {
    "ZCC-REV": `Tendência de ${direction} em "${signal.keyword}" (${absDelta.toFixed(0)}%) — avalie ajuste de preço dinâmico.`,
    "ZCC-MKT": `Sinal "${signal.type}" detectado para "${signal.keyword}" — oportunidade de campanha.`,
    "ZCC-RES": `Demanda ${direction === "alta" ? "crescente" : "em queda"} para "${signal.keyword}" (${absDelta.toFixed(0)}%) — ajuste disponibilidade.`,
    "ZCC-HRD": `Anomalia de mercado: ${signal.type} em "${signal.keyword}" com severidade ${signal.severity}.`,
  };

  return messages[agent] ?? `Sinal "${signal.type}" para "${signal.keyword}" requer atenção.`;
}

export const GET = withApiSecurity(_GET, { rateLimit: { limit: 30, windowSeconds: 60 } });
