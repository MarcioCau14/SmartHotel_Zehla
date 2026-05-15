// src/lib/trends/rss-parser.ts

/**
 * Google Trends RSS — 100% GRÁTIS, sem chave, sem limite.
 * Retorna as buscas que estão em ALTA AGORA no Brasil.
 */
export async function fetchRSSFeeds(): Promise<Array<{ title: string; traffic: string }>> {
  const url = "https://trends.google.com/trending/rss?geo=BR";

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`Google Trends RSS error: ${response.statusText}`);
    }

    const text = await response.text();
    const trends: Array<{ title: string; traffic: string }> = [];

    // Parser XML simples — extrai <item><title> e <item><ht:approx_traffic>
    // Usando regex para evitar dependências pesadas de XML parser na fase inicial
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    while ((match = itemRegex.exec(text)) !== null) {
      const item = match[1];
      
      // Extrair título
      const titleMatch = /<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/.exec(item);
      // Extrair tráfego aproximado (formato ht:approx_traffic)
      const trafficMatch = /<ht:approx_traffic>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/ht:approx_traffic>/.exec(item);

      if (titleMatch) {
        trends.push({
          title: titleMatch[1].trim(),
          traffic: trafficMatch ? trafficMatch[1].trim() : "N/A",
        });
      }
    }

    return trends;
  } catch (error) {
    console.error("❌ [RSS-PARSER] Erro ao buscar Google Trends RSS:", error);
    return [];
  }
}
