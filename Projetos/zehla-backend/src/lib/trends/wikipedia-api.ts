// src/lib/trends/wikipedia-api.ts

/**
 * Wikipedia Pageview API — 100% GRÁTIS, ilimitado, sem chave.
 * Proxy de demanda turística baseado em visualizações de artigos.
 */
export async function fetchWikipediaPageviews(articleTitle: string) : void {
  try {
    const today = new Date();
    const endDate = today.toISOString().split("T")[0].replace(/-/g, "");
    
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
    const startDate = thirtyDaysAgo.toISOString().split("T")[0].replace(/-/g, "");

    // Documentação: https://wikitech.wikimedia.org/wiki/Analytics/AQS/Pageviews
    const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/pt.wikipedia.org/all-access/all-agents/${encodeURIComponent(articleTitle)}/daily/${startDate}/${endDate}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Zehla-SmartHotel-Bot/1.0 (https://zehla.com.br; contato@zehla.com.br)",
      },
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Wikipedia API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const views = data.items.map((item: unknown) => item.views);
      
      // Média dos últimos 7 dias vs 7 dias anteriores
      const recent = views.slice(-7).reduce((a: number, b: number) => a + b, 0) / 7;
      const previous = views.slice(-14, -7).reduce((a: number, b: number) => a + b, 0) / 7;
      
      const deltaPercent = previous > 0 ? ((recent - previous) / previous) * 100 : 0;

      return {
        articleTitle,
        pageviews: Math.round(recent),
        deltaPercent: Math.round(deltaPercent * 10) / 10,
        last7Days: views.slice(-7),
        source: "wikipedia"
      };
    }

    return null;
  } catch (error) {
    console.error(`❌ [WIKIPEDIA-API] Erro ao buscar pageviews para ${articleTitle}:`, error);
    return null;
  }
}
