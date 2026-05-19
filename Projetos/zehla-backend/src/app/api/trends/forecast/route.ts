import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { withApiSecurity } from "@/lib/server/with-api-security";

async function _GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const horizon = parseInt(searchParams.get("horizon") ?? "14", 10);

    const since = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

    const [dataPoints, signals, holidays] = await Promise.all([
      prisma.trendDataPoint.findMany({
        where: { date: { gte: since } },
        orderBy: { date: "asc" },
        take: 1000,
      }),
      prisma.trendSignal.findMany({
        where: { createdAt: { gte: since }, severity: { in: ["alta", "critica"] } },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.holidaySignal.findMany({
        where: { daysUntil: { gte: 0, lte: horizon } },
        orderBy: { daysUntil: "asc" },
      }),
    ]);

    const keywords = await prisma.trendKeyword.findMany({
      where: { isActive: true },
    });
    const keywordMap = new Map(keywords.map((k) => [k.id, k.keyword]));

    const trendLines = new Map<string, { dates: string[]; scores: number[] }>();
    for (const dp of dataPoints) {
      const label = keywordMap.get(dp.keywordId) ?? dp.keywordId;
      if (!trendLines.has(label)) trendLines.set(label, { dates: [], scores: [] });
      trendLines.get(label)!.dates.push(dp.date.toISOString().slice(0, 10));
      trendLines.get(label)!.scores.push(dp.interestScore);
    }

    const forecast = Array.from(trendLines.entries()).map(([keyword, series]) => {
      const avg =
        series.scores.length > 0
          ? series.scores.reduce((a, b) => a + b, 0) / series.scores.length
          : 50;
      const trend =
        series.scores.length >= 2
          ? series.scores[series.scores.length - 1] - series.scores[0]
          : 0;
      return { keyword, avgScore: Math.round(avg), trend, dataPoints: series.dates.length };
    });

    return NextResponse.json({
      success: true,
      data: {
        horizon,
        forecast,
        activeSignals: signals.map((s) => ({
          keyword: s.keyword,
          type: s.type,
          severity: s.severity,
          deltaPercent: s.deltaPercent,
        })),
        upcomingHolidays: holidays.map((h) => ({
          name: h.name,
          date: h.date,
          daysUntil: h.daysUntil,
          isExtended: h.isExtended,
        })),
        summary: {
          totalKeywords: forecast.length,
          risingTrends: forecast.filter((f) => f.trend > 10).length,
          fallingTrends: forecast.filter((f) => f.trend < -10).length,
          upcomingHolidays: holidays.length,
        },
      },
    });
  } catch (error) {
    console.error("❌ Erro em ZCC-TRENDS Forecast:", error);
    return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 });
  }
}

export const GET = withApiSecurity(_GET, { rateLimit: { limit: 30, windowSeconds: 60 } });
