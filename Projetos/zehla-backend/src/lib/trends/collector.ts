import { detectSignal } from "./detector";
import { fetchHolidays } from "./holiday-collector";
import { fetchRSSFeeds } from "./rss-parser";
import { fetchWeatherForecast } from "./weather-collector";
import { fetchWikipediaPageviews } from "./wikipedia-api";
import { prisma } from "@/lib/prisma";

import { type TrendSignalInput } from "./types";

// src/lib/trends/collector.ts


/**
 * Orquestrador Central ZCC-TRENDS.
 * Executa a coleta de todas as fontes de custo zero e sincroniza com o banco.
 */
export async function collectAllTrends(tierFilter?: string) : void {
  try {
  
  
  const keywords = await prisma.trendKeyword.findMany({
    where: { isActive: true, ...(tierFilter ? { tier: tierFilter } : {}) },
  });

  const results = {
    rss: 0,
    wikipedia: 0,
    weather: 0,
    holidays: 0,
    signals: 0,
  };

  // 1. Google Trends RSS (Tempo Real)
  const rssTrends = await fetchRSSFeeds();
  for (const trend of rssTrends) {
    const matchedKeyword = keywords.find(kw =>
      trend.title.toLowerCase().includes(kw.keyword.toLowerCase()) ||
      kw.keyword.toLowerCase().includes(trend.title.toLowerCase())
    );

    if (matchedKeyword) {
      const signalData: TrendSignalInput = {
        type: "destino_boom",
        keyword: matchedKeyword.keyword,
        keywordId: matchedKeyword.id,
        category: matchedKeyword.category,
        interestScore: 100, // RSS trending = impacto máximo
        deltaPercent: 50,
        severity: "alta",
        geo: "BR"
      };

      await createTrendSignal(signalData);
      results.rss++;
      results.signals++;
    }
  }

  // 2. Wikipedia (Proxy de Demanda — 50 Destinos)
  const wikiDestinations = keywords.filter(k => k.category === "destino");
  const wikiEntries = [];
  const signalEntries = [];
  for (const kw of wikiDestinations) {
    const articleTitle = kw.keyword.replace(/^pousada em /i, "").trim();
    const wikiData = await fetchWikipediaPageviews(articleTitle);
    
    if (wikiData) {
      wikiEntries.push({
        keywordId: kw.id,
        interestScore: wikiData.pageviews,
        interestDelta: wikiData.deltaPercent,
        date: new Date(),
        source: "wikipedia",
      });

      const signal = detectSignal(kw, {
        interestScore: wikiData.pageviews,
        interestDelta: wikiData.deltaPercent,
      });

      if (signal) signalEntries.push(signal);
      results.wikipedia++;
    }
    await new Promise(r => setTimeout(r, 200));
  }
  if (wikiEntries.length > 0) {
    await prisma.$transaction(wikiEntries.map(data =>
      prisma.trendDataPoint.create({ data })
    ));
    results.signals += signalEntries.length;
    for (const s of signalEntries) await createTrendSignal(s);
  }

  // 3. Feriados (Programático)
  const holidays = await fetchHolidays();
  if (holidays.length > 0) {
    await prisma.$transaction(holidays.map(h =>
      prisma.holidaySignal.upsert({
        where: { id: `holiday-${h.name}-${h.date}` },
        update: { daysUntil: h.daysUntil, isExtended: h.isExtended },
        create: {
          id: `holiday-${h.name}-${h.date}`,
          name: h.name,
          date: new Date(h.date),
          type: h.type,
          isExtended: h.isExtended,
          daysUntil: h.daysUntil
        }
      })
    ));
    results.holidays = holidays.length;
  }

  // 4. Clima (Apenas para destinos ativos com coordenadas)
  const cities = [
    { name: "Imbituba", lat: -28.24, lon: -48.67, state: "SC" },
    { name: "Paraty", lat: -23.22, lon: -44.71, state: "RJ" },
    { name: "Gramado", lat: -29.37, lon: -50.87, state: "RS" }
  ];

  const weatherWrites = [];
  for (const city of cities) {
    const weatherSignals = await fetchWeatherForecast(city.lat, city.lon, city.name);
    for (const ws of weatherSignals) {
      weatherWrites.push(prisma.weatherSignal.create({
        data: {
          city: city.name,
          state: city.state,
          dateRange: ws.date,
          avgTemp: ws.tempMax,
          precipitation: ws.precipitation,
          condition: ws.condition,
          impactScore: ws.impactScore
        }
      }));
    }
  }
  if (weatherWrites.length > 0) {
    await prisma.$transaction(weatherWrites);
    results.weather = weatherWrites.length;
  }

  
  return results;
}

async function createTrendSignal(input: TrendSignalInput) {
  try {
  // Evitar sinais duplicados para a mesma keyword no mesmo dia
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await prisma.trendSignal.findFirst({
    where: {
      keyword: input.keyword,
      type: input.type,
      createdAt: { gte: today }
    }
  });

  if (!existing) {
    return await prisma.trendSignal.create({
      data: {
        type: input.type,
        keyword: input.keyword,
        keywordId: input.keywordId,
        category: input.category,
        interestScore: input.interestScore,
        deltaPercent: input.deltaPercent,
        severity: input.severity,
        geo: input.geo,
        dateDetected: new Date(),
        previousScore: input.previousScore,
        agentsNotified: "[]",
      }
    });
  }
  return existing;
}
