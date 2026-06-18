import { prisma } from '../../prisma';
import { detectSignal } from "./detector";

export async function collectTrends(tierFilter?: string) {
  const keywords = await prisma.trendKeyword.findMany({
    where: { isActive: true, ...(tierFilter ? { tier: tierFilter } : {}) },
  });

  const results: any[] = [];

  for (const kw of keywords) {
    const lastPoint = await prisma.trendDataPoint.findFirst({
      where: { keywordId: kw.id },
      orderBy: { date: 'desc' },
    });
    const previousScore = lastPoint?.interestScore ?? 50;

    const data = await fetchTrendData(kw.keyword, kw.geo || undefined);
    if (data) {
      const fullData = { ...data, previousScore };
      await prisma.trendDataPoint.create({
        data: {
          keywordId: kw.id,
          interestScore: fullData.interestScore,
          interestDelta: fullData.interestDelta,
          geo: kw.geo || 'BR',
          date: new Date(),
          source: fullData.source,
          value: fullData.interestScore,
        },
      });
      const signal = detectSignal(kw as any, fullData);
      if (signal) {
        await prisma.trendSignal.create({ data: signal as any });
        results.push(signal);
      }
    }
  }

  await prisma.trendKeyword.updateMany({
    where: { id: { in: keywords.map(k => k.id) } },
    data: { lastCheckedAt: new Date() },
  });

  return results;
}

async function fetchTrendData(keyword: string, geo?: string): Promise<{ interestScore: number; interestDelta: number; source: string } | null> {
  try {
    const response = await fetch(`https://trends.google.com/trends/api/explore?q=${encodeURIComponent(keyword)}&geo=${geo || 'BR'}`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return { interestScore: data.default?.averages?.[0] || 50, interestDelta: 0, source: 'google_trends' };
  } catch {
    return null;
  }
}
