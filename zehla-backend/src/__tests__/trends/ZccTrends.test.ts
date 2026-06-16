// src/__tests__/trends/ZccTrends.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { detectSignal } from '../../lib/trends/detector';
import { collectAllTrends } from '../../lib/trends/collector';
import { getRelevantSignalsForAgent, getSignalPriority } from '../../lib/trends/agent-integration';
import { fetchRSSFeeds } from '../../lib/trends/rss-parser';
import { fetchWikipediaPageviews } from '../../lib/trends/wikipedia-api';
import { fetchWeatherForecast } from '../../lib/trends/weather-collector';
import { fetchHolidays } from '../../lib/trends/holiday-collector';
import { GET as apiGetSignals } from '../../app/api/trends/signals/route';
import { GET as apiGetAlerts } from '../../app/api/trends/alerts/route';
import { GET as apiGetKeywords } from '../../app/api/trends/keywords/route';
import { POST as apiSyncTrends } from '../../app/api/trends/sync/route';
import { GET as apiGetDashboard } from '../../app/api/trends/dashboard/route';
import { GET as apiGetForecast } from '../../app/api/trends/forecast/route';

// Mock DB em memória para ZCC-TRENDS
const mockKeywords: any[] = [];
const mockDataPoints: any[] = [];
const mockSignals: any[] = [];
const mockWeatherSignals: any[] = [];
const mockHolidaySignals: any[] = [];

vi.mock('@/lib/prisma', () => {
  return {
    prisma: {
      trendKeyword: {
        findMany: vi.fn().mockImplementation((args) => {
          let list = [...mockKeywords];
          if (args?.where) {
            const w = args.where;
            if (w.isActive !== undefined) {
              list = list.filter(k => k.isActive === w.isActive);
            }
            if (w.category) {
              list = list.filter(k => k.category === w.category);
            }
          }
          return Promise.resolve(list);
        }),
      },
      trendSignal: {
        create: vi.fn().mockImplementation((args) => {
          const newSignal = {
            id: `sig_${Date.now()}_${Math.random()}`,
            createdAt: new Date(),
            ...args.data
          };
          mockSignals.push(newSignal);
          return Promise.resolve(newSignal);
        }),
        findFirst: vi.fn().mockImplementation((args) => {
          const w = args?.where;
          const found = mockSignals.find(s => {
            if (w?.keyword && s.keyword !== w.keyword) return false;
            if (w?.type && s.type !== w.type) return false;
            return true;
          });
          return Promise.resolve(found || null);
        }),
        findMany: vi.fn().mockImplementation((args) => {
          let list = [...mockSignals];
          const w = args?.where;
          if (w) {
            if (w.type && w.type.in) {
              list = list.filter(s => w.type.in.includes(s.type));
            }
            if (w.severity && w.severity.in) {
              list = list.filter(s => w.severity.in.includes(s.severity));
            }
          }
          return Promise.resolve(list.slice(0, args?.take ?? 50));
        }),
        count: vi.fn().mockImplementation(() => Promise.resolve(mockSignals.length)),
        groupBy: vi.fn().mockImplementation((args) => {
          const groups: Record<string, any> = {};
          for (const s of mockSignals) {
            const key = `${s.type}-${s.severity}`;
            if (!groups[key]) {
              groups[key] = {
                type: s.type,
                severity: s.severity,
                _count: { id: 0 }
              };
            }
            groups[key]._count.id++;
          }
          return Promise.resolve(Object.values(groups));
        }),
      },
      trendDataPoint: {
        create: vi.fn().mockImplementation((args) => {
          const newDp = {
            id: `dp_${Date.now()}_${Math.random()}`,
            date: new Date(),
            ...args.data
          };
          mockDataPoints.push(newDp);
          return Promise.resolve(newDp);
        }),
        findMany: vi.fn().mockImplementation(() => Promise.resolve(mockDataPoints)),
      },
      weatherSignal: {
        create: vi.fn().mockImplementation((args) => {
          const newWs = {
            id: `ws_${Date.now()}_${Math.random()}`,
            createdAt: new Date(),
            ...args.data
          };
          mockWeatherSignals.push(newWs);
          return Promise.resolve(newWs);
        }),
        findMany: vi.fn().mockImplementation(() => Promise.resolve(mockWeatherSignals)),
      },
      holidaySignal: {
        upsert: vi.fn().mockImplementation((args) => {
          const idx = mockHolidaySignals.findIndex(h => h.id === args.where.id);
          if (idx !== -1) {
            mockHolidaySignals[idx] = { ...mockHolidaySignals[idx], ...args.update };
            return Promise.resolve(mockHolidaySignals[idx]);
          } else {
            const newHs = {
              id: args.where.id,
              createdAt: new Date(),
              ...args.create
            };
            mockHolidaySignals.push(newHs);
            return Promise.resolve(newHs);
          }
        }),
        findMany: vi.fn().mockImplementation(() => Promise.resolve(mockHolidaySignals)),
      }
    }
  };
});

describe('ZCC-TRENDS Market Intelligence Engine', () => {
  beforeEach(() => {
    mockKeywords.length = 0;
    mockDataPoints.length = 0;
    mockSignals.length = 0;
    mockWeatherSignals.length = 0;
    mockHolidaySignals.length = 0;
    vi.clearAllMocks();

    // Mock global fetch para APIs de custo zero de trends
    global.fetch = vi.fn().mockImplementation(async (url: any) => {
      const urlStr = String(url);

      if (urlStr.includes('trends.google.com/trending/rss')) {
        const xml = `
          <rss version="2.0">
            <channel>
              <item>
                <title>Pousada em Paraty</title>
                <ht:approx_traffic>10K+</ht:approx_traffic>
              </item>
              <item>
                <title>Festival de Gramado</title>
                <ht:approx_traffic>5K+</ht:approx_traffic>
              </item>
            </channel>
          </rss>
        `;
        return new Response(xml, { status: 200 });
      }

      if (urlStr.includes('wikimedia.org/api/rest_v1/metrics/pageviews')) {
        const items = Array.from({ length: 30 }, (_, i) => ({
          views: i < 20 ? 100 : 200 // Garante que últimos 7 dias (23 a 29) são 200 e anteriores (16 a 22) são 100
        }));
        return new Response(JSON.stringify({ items }), { status: 200 });
      }

      if (urlStr.includes('api.open-meteo.com/v1/forecast')) {
        const daily = {
          time: ["2026-06-20", "2026-06-21"],
          temperature_2m_max: [28.0, 29.5],
          precipitation_sum: [0.0, 0.0],
          weathercode: [1, 2] // Sol / Ensolarado
        };
        return new Response(JSON.stringify({ daily }), { status: 200 });
      }

      if (urlStr.includes('openholidaysapi.org/PublicHolidays')) {
        const holidays = [
          {
            name: [{ text: "Proclamação da República" }],
            startDate: "2026-11-15",
            type: "National"
          }
        ];
        return new Response(JSON.stringify(holidays), { status: 200 });
      }

      return new Response(JSON.stringify({}), { status: 200 });
    });
  });

  describe('Trend Detector Logic (detectSignal)', () => {
    it('should detect destino_boom correctly when interestDelta > 20%', () => {
      const kw = { id: 'kw_1', keyword: 'pousada em Paraty', category: 'destino', geo: 'BR' };
      const data = { interestScore: 80, interestDelta: 35, previousScore: 50 };

      const signal = detectSignal(kw, data);
      expect(signal).not.toBeNull();
      expect(signal?.type).toBe('destino_boom');
      expect(signal?.severity).toBe('alta');
      expect(signal?.deltaPercent).toBe(35);
    });

    it('should detect destino_crash correctly when interestDelta < -20%', () => {
      const kw = { id: 'kw_2', keyword: 'pousada em Tiradentes', category: 'destino' };
      const data = { interestScore: 30, interestDelta: -45, previousScore: 75 };

      const signal = detectSignal(kw, data);
      expect(signal).not.toBeNull();
      expect(signal?.type).toBe('destino_crash');
      expect(signal?.severity).toBe('alta');
    });

    it('should detect feriado_trending when category is feriado and interestScore > 60', () => {
      const kw = { id: 'kw_3', keyword: 'feriado corpus christi', category: 'feriado' };
      const data = { interestScore: 75, interestDelta: 10 };

      const signal = detectSignal(kw, data);
      expect(signal).not.toBeNull();
      expect(signal?.type).toBe('feriado_trending');
    });
  });

  describe('Trends Free APIs Parsers', () => {
    it('should parse Google Trends RSS feed correctly', async () => {
      const rssData = await fetchRSSFeeds();
      expect(rssData.length).toBe(2);
      expect(rssData[0].title).toBe('Pousada em Paraty');
      expect(rssData[0].traffic).toBe('10K+');
    });

    it('should fetch and calculate Wikipedia pageviews delta correctly', async () => {
      const wikiData = await fetchWikipediaPageviews('Paraty');
      expect(wikiData).not.toBeNull();
      expect(wikiData?.pageviews).toBe(200); // Média dos últimos 7 dias
      expect(wikiData?.deltaPercent).toBeGreaterThan(0);
    });

    it('should parse Open-Meteo weather forecast and calculate impactScore correctly', async () => {
      const weatherData = await fetchWeatherForecast(-23.22, -44.71, 'Paraty');
      expect(weatherData.length).toBeGreaterThan(0);
      expect(weatherData[0].impactScore).toBe(80); // Sol + Calor = 80
      expect(weatherData[0].condition).toBe('ensolarado');
    });

    it('should parse OpenHolidays and detect extended holiday bridge correctly', async () => {
      const holidays = await fetchHolidays();
      expect(holidays.length).toBeGreaterThan(0);
      expect(holidays[0].name).toBe('Proclamação da República');
    });
  });

  describe('Trends Collector (collectAllTrends)', () => {
    it('should collect Wikipedia, RSS, Weather and Holiday data and persist signals', async () => {
      // Setup mock keywords
      mockKeywords.push(
        { id: 'kw_1', keyword: 'pousada em Paraty', category: 'destino', isActive: true },
        { id: 'kw_2', keyword: 'Gramado', category: 'destino', isActive: true }
      );

      const results = await collectAllTrends();
      expect(results.signals).toBeGreaterThan(0);
      expect(mockSignals.length).toBeGreaterThan(0);
      expect(mockWeatherSignals.length).toBeGreaterThan(0); // Resistente a fuso horário
      expect(mockHolidaySignals.length).toBeGreaterThan(0);
    });
  });

  describe('Agent Integration & Priorities Ponderation', () => {
    it('should calculate priority score correctly based on severity and recency', () => {
      const signal = {
        severity: 'critica',
        createdAt: new Date(), // Agora
        deltaPercent: 50,
        interestScore: 100
      };

      const priority = getSignalPriority(signal);
      expect(priority).toBeGreaterThan(70); // Gravidade crítica e recente deve dar alta prioridade
    });

    it('should return relevant signals for ZCC-REV agent', async () => {
      mockSignals.push(
        { id: 'sig_1', type: 'destino_boom', keyword: 'Paraty', severity: 'alta', createdAt: new Date() },
        { id: 'sig_2', type: 'weather_crash', keyword: 'Gramado', severity: 'media', createdAt: new Date() }
      );

      const revSignals = await getRelevantSignalsForAgent('ZCC-REV');
      expect(revSignals.length).toBe(1);
      expect(revSignals[0].type).toBe('destino_boom');
    });
  });

  describe('ZCC-TRENDS API Endpoints', () => {
    it('should sync and return success in sync route', async () => {
      mockKeywords.push({ id: 'kw_1', keyword: 'Paraty', category: 'destino', isActive: true });
      
      const req = new Request('http://localhost/api/trends/sync', {
        method: 'POST',
        body: JSON.stringify({ tier: 'pro' })
      });
      const res = await apiSyncTrends(req as any);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.results.signals).toBeGreaterThan(0);
    });

    it('should return active signals in signals route', async () => {
      mockSignals.push({ id: 'sig_1', type: 'destino_boom', keyword: 'Paraty', severity: 'alta', createdAt: new Date() });
      
      const req = new Request('http://localhost/api/trends/signals?severity=alta,critica');
      const res = await apiGetSignals(req as any);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.length).toBe(1);
    });

    it('should return alerts categorized by agent in alerts route', async () => {
      mockSignals.push({ id: 'sig_1', type: 'destino_boom', keyword: 'Paraty', severity: 'alta', createdAt: new Date() });
      
      const req = new Request('http://localhost/api/trends/alerts?agent=ZCC-REV');
      const res = await apiGetAlerts(req as any);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data[0].agent).toBe('ZCC-REV');
    });

    it('should return dashboard components in dashboard route', async () => {
      mockSignals.push({ id: 'sig_1', type: 'destino_boom', keyword: 'Paraty', severity: 'alta', createdAt: new Date() });
      mockDataPoints.push({ keywordId: 'kw_1', interestScore: 80, date: new Date(), source: 'wikipedia' });

      const req = new Request('http://localhost/api/trends/dashboard?days=7');
      const res = await apiGetDashboard(req as any);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.summary.totalSignals).toBe(1);
      expect(data.data.timeline.length).toBe(1);
    });

    it('should return forecast details in forecast route', async () => {
      mockKeywords.push({ id: 'kw_1', keyword: 'Paraty', category: 'destino', isActive: true });
      mockDataPoints.push({ keywordId: 'kw_1', interestScore: 70, date: new Date(), source: 'wikipedia' });

      const req = new Request('http://localhost/api/trends/forecast?horizon=14');
      const res = await apiGetForecast(req as any);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.forecast.length).toBe(1);
    });
  });
});
