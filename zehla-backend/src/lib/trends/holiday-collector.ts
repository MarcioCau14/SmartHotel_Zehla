// src/lib/trends/holiday-collector.ts

/**
 * OpenHolidays API — Feriados brasileiros programáticos.
 * Mapeia feriados e "pontes" para antecipação de demanda.
 */
export async function fetchHolidays() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s Timeout Rigoroso

  try {
    const year = new Date().getFullYear();
    const url = `https://openholidaysapi.org/PublicHolidays?countryIsoCode=BR&validFrom=${year}-01-01&validTo=${year}-12-31&languageIsoCode=PT`;

    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "Accept": "application/json" }
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`OpenHolidays error: ${response.statusText}`);
    }

    const data = await response.json();
    
    return data.map((h: any) => {
      const date = new Date(h.startDate);
      const dayOfWeek = date.getDay();
      
      // Verificar se forma ponte (Terça ou Quinta)
      const isExtended = dayOfWeek === 2 || dayOfWeek === 4;

      return {
        name: h.name[0].text,
        date: h.startDate,
        type: h.type,
        isExtended,
        daysUntil: Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      };
    }).filter((h: any) => h.daysUntil >= 0); // Apenas feriados futuros

  } catch (error) {
    console.error("❌ [HOLIDAY-COLLECTOR] Erro ao buscar feriados:", error);
    
    // Fallback: Retorna um sinal de "Temporada Regional" para manter o motor de vendas aquecido
    return [{
      name: "Feriado Regional / Temporada",
      date: new Date(Date.now() + 86400000 * 7).toISOString(), // Daqui a 7 dias
      type: "Regional",
      isExtended: true,
      daysUntil: 7
    }];
  }
}
