import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { withApiSecurity } from "@/lib/server/with-api-security";

async function _GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") ?? "7", 10);

    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [signals, dataPoints, weather, holidays] = await Promise.all([
      prisma.trendSignal.groupBy({
        by: ["type", "severity"],
        where: { createdAt: { gte: since } },
        _count: { id: true },
      }),
      prisma.trendDataPoint.findMany({
        where: { date: { gte: since } },
        orderBy: { date: "asc" },
        take: 500,
      }),
      prisma.weatherSignal.findMany({
        where: { createdAt: { gte: since } },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.holidaySignal.findMany({
        where: { date: { gte: since } },
        orderBy: { date: "asc" },
        take: 30,
      }),
    ]);

    const severityBreakdown = {
      critica: 0,
      alta: 0,
      media: 0,
      baixa: 0,
    };
    for (const s of signals) {
      if (s.severity in severityBreakdown) {
        severityBreakdown[s.severity as keyof typeof severityBreakdown] += s._count.id;
      }
    }

    const typeBreakdown = signals.map((s) => ({
      type: s.type,
      severity: s.severity,
      count: s._count.id,
    }));

    const timeline = dataPoints.map((dp) => ({
      date: dp.date.toISOString().slice(0, 10),
      score: dp.interestScore,
      keywordId: dp.keywordId,
      source: dp.source,
    }));

    return NextResponse.json({
      success: true,
      data: {
        period: { days, since },
        summary: {
          totalSignals: signals.reduce((a, s) => a + s._count.id, 0),
          severityBreakdown,
          uniqueTypes: new Set(signals.map((s) => s.type)).size,
        },
        typeBreakdown,
        timeline,
        weather,
        holidays,
      },
    });
  } catch (error) {
    console.error("❌ Erro em ZCC-TRENDS Dashboard:", error);
    return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 });
  }
}

export const GET = withApiSecurity(_GET, { rateLimit: { limit: 30, windowSeconds: 60 } });
