// =============================================================================
// ZÉLLA — Property Scraping Engine
// =============================================================================
// Motor de raspagem de dados de imóveis Airbnb em 3 camadas:
//   Camada 1: API/Scraper (dados públicos) — ~70% dos campos
//   Camada 2: AI Extractor (enriquecimento) — ~15% dos campos
//   Camada 3: Manual Host (dados privados) — ~15% dos campos
// =============================================================================

// ── Tipos de Resultado ──────────────────────────────────────────────────────

export interface ScrapedPublicData {
  airbnbId: string;
  listingUrl: string;
  name: string;
  description: string;
  propertyType: string;
  accommodates: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  fullAddress: string;
  rating: number;
  reviewCount: number;
  basePrice: number;
  currency: string;
  amenities: string[];
  photos: Array<{ url: string; caption?: string }>;
  photoCount: number;
  houseRules: string;
  checkInTime: string;
  checkOutTime: string;
  hostName: string;
  hostIsSuperhost: boolean;
  hostResponseRate: number;
  hostResponseTime: string;
}

export interface AIEnrichedData {
  aiSummary: string;
  highlights: string[];
  targetAudience: string[];
  sellingPoints: string[];
  localTipsFromReviews: string[];
  reviewSentiment: 'excellent' | 'good' | 'average';
  keywords: string[];
}

export interface PropertyScrapingResult {
  success: boolean;
  publicData: ScrapedPublicData | null;
  enrichedData: AIEnrichedData | null;
  error?: string;
  layers: {
    layer1: 'pending' | 'success' | 'failed';
    layer2: 'pending' | 'success' | 'failed';
    layer3: 'pending'; // Always pending — host must fill manually
  };
}

// ── Extração de Código do Imóvel ────────────────────────────────────────────

/**
 * Extrai o código do imóvel Airbnb de uma URL ou texto.
 * Suporta:
 *  - URL completa: https://www.airbnb.com/rooms/18584298
 *  - Apenas código: 18584298
 *  - Com label: "Código: 18584298"
 */
export function extractPropertyCode(input: string): string | null {
  if (!input || typeof input !== 'string') return null;

  const trimmed = input.trim();

  // Padrão 1: URL completa do Airbnb
  const urlMatch = trimmed.match(/airbnb\.(com|com\.br)\/rooms\/(\d+)/);
  if (urlMatch) return urlMatch[2];

  // Padrão 2: Apenas código numérico (5-20 dígitos)
  const codeMatch = trimmed.match(/^(\d{5,20})$/);
  if (codeMatch) return codeMatch[1];

  // Padrão 3: "Código: 18584298" ou "código 18584298"
  const labelMatch = trimmed.match(/c[oó]digo[:\s]+(\d{5,20})/i);
  if (labelMatch) return labelMatch[1];

  // Padrão 4: URL sem domínio específico
  const pathMatch = trimmed.match(/\/rooms\/(\d+)/);
  if (pathMatch) return pathMatch[1];

  return null;
}

/**
 * Constrói a URL do Airbnb a partir do código do imóvel.
 */
export function buildAirbnbUrl(propertyId: string): string {
  return `https://www.airbnb.com/rooms/${propertyId}`;
}

// ── Motor de Raspagem ───────────────────────────────────────────────────────

/**
 * Dados de demonstração para desenvolvimento.
 * Em produção, estes dados viriam das APIs de scraping.
 */
const DEMO_PROPERTIES: Record<string, ScrapedPublicData> = {
  '18584298': {
    airbnbId: '18584298',
    listingUrl: 'https://www.airbnb.com/rooms/18584298',
    name: 'Oceanfront Black Otter Cove w/hot tub',
    description: 'Stunning oceanfront property with panoramic views, private hot tub, and direct beach access. Perfect for families and groups looking for an unforgettable coastal getaway. The space features 4 bedrooms, 3 bathrooms, a fully equipped kitchen, and a spacious living area opening to a large deck with ocean views.',
    propertyType: 'entire_home',
    accommodates: 8,
    bedrooms: 4,
    beds: 5,
    bathrooms: 3,
    neighborhood: 'Lagoa da Conceição',
    city: 'Florianópolis',
    state: 'SC',
    country: 'Brasil',
    latitude: -27.5833,
    longitude: -48.4333,
    fullAddress: 'Lagoa da Conceição, Florianópolis - SC, Brasil',
    rating: 4.95,
    reviewCount: 237,
    basePrice: 450,
    currency: 'BRL',
    amenities: ['WiFi', 'Air Conditioning', 'Pool', 'Hot Tub', 'Kitchen', 'Free Parking', 'Washer', 'Dryer', 'TV', 'BBQ Grill', 'Beach Access', 'Garden'],
    photos: [],
    photoCount: 45,
    houseRules: 'No smoking, No parties/events, Check-in after 15:00, Check-out before 11:00',
    checkInTime: '15:00',
    checkOutTime: '11:00',
    hostName: 'Carlos',
    hostIsSuperhost: true,
    hostResponseRate: 99,
    hostResponseTime: 'within an hour',
  },
  '9283741': {
    airbnbId: '9283741',
    listingUrl: 'https://www.airbnb.com/rooms/9283741',
    name: 'Charmoso Studio em Copacabana',
    description: 'Studio moderno e aconchegante a 2 quadras da praia de Copacabana. Ideal para casais ou viajantes solo. Com varanda, cozinha completa e vista parcial do mar.',
    propertyType: 'entire_home',
    accommodates: 2,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    neighborhood: 'Copacabana',
    city: 'Rio de Janeiro',
    state: 'RJ',
    country: 'Brasil',
    latitude: -22.9714,
    longitude: -43.1823,
    fullAddress: 'Copacabana, Rio de Janeiro - RJ, Brasil',
    rating: 4.88,
    reviewCount: 156,
    basePrice: 280,
    currency: 'BRL',
    amenities: ['WiFi', 'Air Conditioning', 'Kitchen', 'TV', 'Elevator', 'Doorman', 'Washer'],
    photos: [],
    photoCount: 28,
    houseRules: 'No smoking, No pets, No parties/events, Quiet hours 22:00-08:00',
    checkInTime: '14:00',
    checkOutTime: '11:00',
    hostName: 'Ana',
    hostIsSuperhost: true,
    hostResponseRate: 97,
    hostResponseTime: 'within 2 hours',
  },
  '51928403': {
    airbnbId: '51928403',
    listingUrl: 'https://www.airbnb.com/rooms/51928403',
    name: 'Casa de Praia com Piscina em Jericoacoara',
    description: 'Casa espaçosa com piscina privativa, a 5 min da praia principal de Jericoacoara. 3 suítes, área gourmet completa, redes e muito conforto para toda a família.',
    propertyType: 'entire_home',
    accommodates: 6,
    bedrooms: 3,
    beds: 4,
    bathrooms: 3,
    neighborhood: 'Centro',
    city: 'Jericoacoara',
    state: 'CE',
    country: 'Brasil',
    latitude: -2.7928,
    longitude: -40.5056,
    fullAddress: 'Centro, Jericoacoara - CE, Brasil',
    rating: 4.92,
    reviewCount: 89,
    basePrice: 650,
    currency: 'BRL',
    amenities: ['WiFi', 'Air Conditioning', 'Pool', 'Kitchen', 'Free Parking', 'BBQ Grill', 'Hammock', 'Garden', 'Beach Access'],
    photos: [],
    photoCount: 36,
    houseRules: 'No smoking inside, No parties/events after 22h, Check-in after 14:00, Check-out before 12:00',
    checkInTime: '14:00',
    checkOutTime: '12:00',
    hostName: 'Marcos',
    hostIsSuperhost: false,
    hostResponseRate: 92,
    hostResponseTime: 'within 4 hours',
  },
};

/**
 * Gera dados de enriquecimento AI para um imóvel.
 * Em produção, usaria GPT-4o-mini para extrair highlights, resumo, etc.
 */
function generateAIEnrichment(data: ScrapedPublicData): AIEnrichedData {
  const highlights: string[] = [];
  const sellingPoints: string[] = [];
  const keywords: string[] = [];
  const targetAudience: string[] = [];
  const localTipsFromReviews: string[] = [];

  // Extrair highlights das amenities
  if (data.amenities.includes('Pool')) highlights.push('Piscina');
  if (data.amenities.includes('Hot Tub')) highlights.push('Hidro privativa');
  if (data.amenities.includes('Beach Access')) highlights.push('Acesso direto à praia');
  if (data.amenities.includes('BBQ Grill')) highlights.push('Churrasqueira');
  if (data.amenities.includes('Garden')) highlights.push('Jardim');
  if (data.amenities.includes('Elevator')) highlights.push('Elevador');

  // Highlights baseados em capacidade
  if (data.accommodates >= 6) highlights.push('Espaço para grupos');
  if (data.bedrooms >= 3) highlights.push(`${data.bedrooms} quartos`);

  // Selling points
  if (data.hostIsSuperhost) sellingPoints.push(`Superhost com ${data.reviewCount} reviews ${data.rating}`);
  if (data.rating >= 4.9) sellingPoints.push(`Avaliação excepcional: ${data.rating}`);
  sellingPoints.push(`Diária a partir de R$${data.basePrice}`);
  if (data.neighborhood) sellingPoints.push(`Localização: ${data.neighborhood}`);

  // Target audience
  if (data.accommodates >= 6) targetAudience.push('famílias', 'grupos');
  else if (data.accommodates >= 3) targetAudience.push('casais', 'famílias pequenas');
  else targetAudience.push('casais', 'viajantes solo');

  // Keywords
  keywords.push(data.city.toLowerCase());
  if (data.neighborhood) keywords.push(data.neighborhood.toLowerCase());
  highlights.forEach(h => keywords.push(h.toLowerCase()));
  if (data.amenities.includes('Pool')) keywords.push('piscina');
  if (data.amenities.includes('Beach Access')) keywords.push('praia');

  // Local tips (simulado baseado na localização)
  if (data.city === 'Florianópolis') {
    localTipsFromReviews.push('Padaria do Zé a 2 quadras', 'Restaurante Mar e Cia na esquina', 'Trilha do Morro das Aranhas perto');
  } else if (data.city === 'Rio de Janeiro') {
    localTipsFromReviews.push('Barraca do Pepe na orla', 'Metrô Cardeal Arcoverde a 3 min', 'Farmácia 24h na esquina');
  } else if (data.city === 'Jericoacoara') {
    localTipsFromReviews.push('Pôr do sol na Duna', 'Restaurante Na Orla', 'Mercadinho São Francisco');
  }

  // Sentimento
  const reviewSentiment = data.rating >= 4.9 ? 'excellent' : data.rating >= 4.5 ? 'good' : 'average';

  // AI Summary
  const aiSummary = `${data.name} — ${data.propertyType === 'entire_home' ? 'Imóvel inteiro' : 'Quarto privado'} em ${data.neighborhood}, ${data.city}. Capacidade para ${data.accommodates} hóspedes em ${data.bedrooms} quartos. ${highlights.length > 0 ? `Destaques: ${highlights.join(', ')}.` : ''} Avaliação ${data.rating} com ${data.reviewCount} reviews.`;

  return {
    aiSummary,
    highlights,
    targetAudience,
    sellingPoints,
    localTipsFromReviews,
    reviewSentiment,
    keywords,
  };
}

/**
 * PropertyScrapingEngine — Motor de raspagem de imóveis.
 *
 * Em produção:
 *   Camada 1: Chamaria APIs como StayingAPI, AirROI, Apify
 *   Camada 2: Chamaria GPT-4o-mini para enriquecimento
 *   Camada 3: Sempre manual — host preenche no DDC
 *
 * Em desenvolvimento:
 *   Usa dados de demonstração pré-definidos.
 */
export class PropertyScrapingEngine {
  private useDemo: boolean;

  constructor(options?: { useDemo?: boolean }) {
    this.useDemo = options?.useDemo ?? true; // Default: demo mode
  }

  /**
   * Raspagem completa de um imóvel (Camada 1 + Camada 2).
   * A Camada 3 (dados privados) é sempre preenchida manualmente pelo host.
   */
  async scrapeProperty(input: string): Promise<PropertyScrapingResult> {
    const result: PropertyScrapingResult = {
      success: false,
      publicData: null,
      enrichedData: null,
      layers: {
        layer1: 'pending',
        layer2: 'pending',
        layer3: 'pending',
      },
    };

    // Extrair código do imóvel
    const propertyCode = extractPropertyCode(input);
    if (!propertyCode) {
      result.error = 'Não foi possível extrair o código do imóvel. Use a URL do Airbnb ou o código numérico.';
      return result;
    }

    // ── Camada 1: Raspagem de dados públicos ──────────────────────────────
    try {
      const publicData = await this.fetchPublicData(propertyCode);
      if (publicData) {
        result.publicData = publicData;
        result.layers.layer1 = 'success';
      } else {
        result.layers.layer1 = 'failed';
        result.error = `Imóvel ${propertyCode} não encontrado. Verifique o código e tente novamente.`;
        return result;
      }
    } catch (error) {
      result.layers.layer1 = 'failed';
      result.error = `Erro ao raspar dados do imóvel: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
      return result;
    }

    // ── Camada 2: Enriquecimento AI ───────────────────────────────────────
    try {
      const enrichedData = await this.enrichWithAI(result.publicData!);
      result.enrichedData = enrichedData;
      result.layers.layer2 = 'success';
    } catch (error) {
      // Camada 2 é opcional — não bloqueia o cadastro
      result.layers.layer2 = 'failed';
      console.warn('[ScrapingEngine] AI enrichment failed:', error);
    }

    result.success = result.layers.layer1 === 'success';
    return result;
  }

  /**
   * Camada 1: Busca dados públicos do imóvel.
   * Em produção: chamaria StayingAPI / AirROI / Apify
   * Em demo: usa dados pré-definidos ou gera dados simulados
   */
  private async fetchPublicData(propertyCode: string): Promise<ScrapedPublicData | null> {
    if (this.useDemo) {
      const demoData = DEMO_PROPERTIES[propertyCode];
      if (demoData) return demoData;
      return this.generateSimulatedData(propertyCode);
    }

    // TODO: Em produção, integrar com APIs reais
    return null;
  }

  /**
   * Gera dados simulados para desenvolvimento quando o código não está no demo.
   */
  private generateSimulatedData(propertyCode: string): ScrapedPublicData {
    const cities = [
      { city: 'São Paulo', state: 'SP', neighborhood: 'Vila Madalena' },
      { city: 'Rio de Janeiro', state: 'RJ', neighborhood: 'Ipanema' },
      { city: 'Salvador', state: 'BA', neighborhood: 'Pelourinho' },
      { city: 'Florianópolis', state: 'SC', neighborhood: 'Jurere Internacional' },
      { city: 'Porto Seguro', state: 'BA', neighborhood: 'Trancoso' },
    ];

    const location = cities[Math.floor(Math.random() * cities.length)];
    const bedrooms = Math.floor(Math.random() * 4) + 1;
    const accommodates = bedrooms * 2;

    return {
      airbnbId: propertyCode,
      listingUrl: buildAirbnbUrl(propertyCode),
      name: `Imóvel Airbnb #${propertyCode}`,
      description: `Acomodação em ${location.neighborhood}, ${location.city}. Conforto e praticidade para sua estadia.`,
      propertyType: 'entire_home',
      accommodates,
      bedrooms,
      beds: bedrooms + Math.floor(Math.random() * 2),
      bathrooms: Math.max(1, bedrooms - 1) + (Math.random() > 0.5 ? 0.5 : 0),
      neighborhood: location.neighborhood,
      city: location.city,
      state: location.state,
      country: 'Brasil',
      latitude: null,
      longitude: null,
      fullAddress: `${location.neighborhood}, ${location.city} - ${location.state}, Brasil`,
      rating: 4.5 + Math.random() * 0.5,
      reviewCount: Math.floor(Math.random() * 200) + 10,
      basePrice: Math.floor(Math.random() * 400) + 150,
      currency: 'BRL',
      amenities: ['WiFi', 'Air Conditioning', 'Kitchen', 'TV', 'Washer'],
      photos: [],
      photoCount: Math.floor(Math.random() * 30) + 10,
      houseRules: 'No smoking, No parties/events',
      checkInTime: '15:00',
      checkOutTime: '11:00',
      hostName: 'Anfitrião',
      hostIsSuperhost: Math.random() > 0.5,
      hostResponseRate: 90 + Math.floor(Math.random() * 10),
      hostResponseTime: 'within a few hours',
    };
  }

  /**
   * Camada 2: Enriquece dados com AI.
   * Em produção: chamaria GPT-4o-mini
   * Em demo: usa lógica baseada em regras
   */
  private async enrichWithAI(data: ScrapedPublicData): Promise<AIEnrichedData> {
    return generateAIEnrichment(data);
  }
}

// ── Singleton ───────────────────────────────────────────────────────────────

let engineInstance: PropertyScrapingEngine | null = null;

export function getScrapingEngine(): PropertyScrapingEngine {
  if (!engineInstance) {
    engineInstance = new PropertyScrapingEngine({ useDemo: true });
  }
  return engineInstance;
}
