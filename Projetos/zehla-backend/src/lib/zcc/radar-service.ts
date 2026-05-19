import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';


/**
 * Radar Service - Consolidador de Dados Geográficos para o ZCC Dashboard.
 * Utiliza o Redis (DB 0) para evitar estresse no PostgreSQL.
 */
export class RadarService {
  private static CACHE_KEY = 'zcc:radar:heatmap';

  /**
   * Consolida as coordenadas de leads e pousadas para o mapa de calor.
   */
  static async consolidateHeatmap() {
    

    // 1. Buscar Leads com Coordenadas (LAT/LONG capturados pela Secretaria-IA)
    const leads = await prisma.lead.findMany({
      where: { 
        latitude: { not: null },
        longitude: { not: null }
      },
      select: { id: true, name: true, property: true, latitude: true, longitude: true },
      take: 200 // Limite para manter a UI fluida
    });

    // 2. Buscar Pousadas Ativas (Nossos Clientes)
    const properties = await prisma.property.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, name: true, latitude: true, longitude: true }
    });

    // 3. Formatar para a UI (Normalizando 0-100 para o SVG do Radar)
    // Nota: Em produção, o front-end usaria um mapa real (Leaflet/Mapbox). 
    // Aqui mantemos a compatibilidade com o SVG tático do dashboard.
    const heatmap = [
      ...leads.map(l => ({
        id: l.id,
        label: l.property || l.name,
        type: 'LEAD',
        x: this.normalizeLon(l.longitude || 0),
        y: this.normalizeLat(l.latitude || 0)
      })),
      ...properties.map(p => ({
        id: p.id,
        label: p.name,
        type: 'ACTIVE_NODE',
        x: this.normalizeLon(p.longitude || 0),
        y: this.normalizeLat(p.latitude || 0)
      }))
    ];

    // 4. Gravar no Redis DB 0 (Expira em 5 min para forçar atualização)
    await redis.set(this.CACHE_KEY, JSON.stringify(heatmap), 'EX', 300);
    
    return heatmap;
  }

  static async getHeatmap() {
    const cached = await redis.get(this.CACHE_KEY);
    if (cached) return JSON.parse(cached);
    
    // Se não houver cache, consolida na hora (fallback)
    return this.consolidateHeatmap();
  }

  // Helpers de normalização para o Radar SVG (Provisório)
  private static normalizeLon(lon: number) {
    // Mapeia Longitude do Brasil (-74 a -35) para 20-80% do SVG
    return ((lon + 74) / (74 - 35)) * 60 + 20;
  }

  private static normalizeLat(lat: number) {
    // Mapeia Latitude do Brasil (5 a -33) para 20-80% do SVG
    return ((lat - 5) / (-33 - 5)) * 60 + 20;
  }
}
