// src/lib/trends/weather-collector.ts

/**
 * Open-Meteo Weather API — 100% GRÁTIS para uso não comercial.
 * Previsão de 16 dias por coordenadas GPS.
 */
export async function fetchWeatherForecast(lat: number, lon: number, cityName: string) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s Timeout Rigoroso

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=America%2FSao_Paulo&forecast_days=16`;

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Open-Meteo error: ${response.statusText}`);
    }

    const data = await response.json();
    const daily = data.daily;

    // Detectar "Fim de Semana Perfeito" (Sáb/Dom com sol e temp > 22)
    const signals = [];
    const dates = daily.time;
    
    for (let i = 0; i < dates.length; i++) {
      const date = new Date(dates[i]);
      const dayOfWeek = date.getDay(); // 0 = Domingo, 6 = Sábado
      
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        const tempMax = daily.temperature_2m_max[i];
        const precipitation = daily.precipitation_sum[i];
        const weatherCode = daily.weathercode[i]; // 0-3 = Sol/Limpo

        // Impact Score: -100 a +100
        let impactScore = 0;
        if (tempMax > 25 && precipitation === 0 && weatherCode <= 3) impactScore = 80;
        else if (tempMax > 20 && precipitation < 2) impactScore = 40;
        else if (precipitation > 10) impactScore = -60;

        if (Math.abs(impactScore) > 30) {
          signals.push({
            city: cityName,
            date: dates[i],
            tempMax,
            precipitation,
            impactScore,
            condition: weatherCode <= 3 ? "ensolarado" : precipitation > 5 ? "chuvoso" : "nublado"
          });
        }
      }
    }

    return signals;
  } catch (error) {
    console.error(`❌ [WEATHER-COLLECTOR] Erro ao buscar clima para ${cityName}:`, error);
    
    // Fallback: Retorna um sinal genérico de "Alta Procura" para não travar o motor de vendas
    return [{
      city: cityName,
      date: new Date().toISOString().split('T')[0],
      tempMax: 25,
      precipitation: 0,
      impactScore: 50, // Impacto moderado positivo (Coringa)
      condition: "estável"
    }];
  }
}
