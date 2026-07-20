import { NextRequest, NextResponse } from 'next/server';

// ═══════════════════════════════════════════════════════════════
// MAGIC LINK — Mock Scraper Engine
// ═══════════════════════════════════════════════════════════════
// Recebe URL do anúncio, simula delay de scraping e devolve
// dados ricos para hidratar o Dashboard.
//
// ⚠️ MODO MOCK — Quando pronto para produção, substituir por
// chamadas reais ao z-ai-web-dev-sdk (VLM + Web Reader)
// ═══════════════════════════════════════════════════════════════

interface MagicLinkRequest {
  url: string;
  niche: 'pousada' | 'airbnb';
  source: 'airbnb' | 'booking' | 'website';
}

interface MagicLinkResponse {
  propertyName: string;
  amenities: string[];
  checkInTime: string;
  checkOutTime: string;
  aiVoiceTone: string;
  source: 'airbnb' | 'booking' | 'website';
  location: string;
  rating: number;
  totalRooms: number;
  description: string;
}

// ── Mock Data Banks by Source ──────────────────────────────────

const POUSADA_MOCKS: Record<string, MagicLinkResponse> = {
  airbnb: {
    propertyName: 'Pousada Recanto das Águas',
    amenities: ['Piscina com cascata', 'Café da manhã incluso', 'Wi-Fi 200Mbps', 'Estacionamento gratuito'],
    checkInTime: '14:00',
    checkOutTime: '12:00',
    aiVoiceTone: 'Acolhedor e profissional — como um anfitrião que conhece cada cantinho da pousada',
    source: 'airbnb',
    location: 'Paraty, RJ',
    rating: 4.87,
    totalRooms: 12,
    description: 'Pousada encantadora rodeada pela Mata Atlântica, a 5 min do centro histórico. Quartos com varanda e vista para o jardim.',
  },
  booking: {
    propertyName: 'Pousada Vila dos Coqueiros',
    amenities: ['Praia privativa', 'Restaurante regional', 'Spa & Massagem', 'Transfer aeroporto'],
    checkInTime: '15:00',
    checkOutTime: '11:00',
    aiVoiceTone: 'Calmo e informativo — como um concierge que antecipa necessidades dos hóspedes',
    source: 'booking',
    location: 'Porto de Galinhas, PE',
    rating: 4.72,
    totalRooms: 18,
    description: 'Refúgio à beira-mar com acesso exclusivo à praia. Ideal para casais e famílias que buscam tranquilidade.',
  },
  website: {
    propertyName: 'Pousada Serra Limpa',
    amenities: ['Trilhas ecológicas', 'Lareira no quarto', 'Café colonial', 'Aceita pets'],
    checkInTime: '14:00',
    checkOutTime: '12:00',
    aiVoiceTone: 'Rústico e acolhedor — como um amigo que ama a serra e compartilha suas descobertas',
    source: 'website',
    location: 'Campos do Jordão, SP',
    rating: 4.91,
    totalRooms: 8,
    description: 'Chalés exclusivos no coração da Serra da Mantiqueira. Experiência mountain com todo conforto.',
  },
};

const AIRBNB_MOCKS: Record<string, MagicLinkResponse> = {
  airbnb: {
    propertyName: 'Flat Copacabana Beach View',
    amenities: ['Vista direta p/ mar', 'Ar-condicionado split', 'Cozinha completa', 'Portaria 24h'],
    checkInTime: '15:00',
    checkOutTime: '11:00',
    aiVoiceTone: 'Moderno e prático — como um anfitrião urbano que valoriza agilidade e clareza',
    source: 'airbnb',
    location: 'Rio de Janeiro, RJ',
    rating: 4.92,
    totalRooms: 2,
    description: 'Studio reformado com vista panorâmica da Praia de Copacabana. Localização privilegiada entre os postos 5 e 6.',
  },
  booking: {
    propertyName: 'Chalé Montanha & Canela',
    amenities: ['Hidromassagem privativa', 'Fogão a lenha', 'Deck com churrasqueira', 'Cafeteira Nespresso'],
    checkInTime: '16:00',
    checkOutTime: '10:00',
    aiVoiceTone: 'Descontraído e hospitaleiro — como um anfitrião que faz o hóspede se sentir em casa',
    source: 'booking',
    location: 'Gramado, RS',
    rating: 4.85,
    totalRooms: 3,
    description: 'Chalé aconchegante no coração da Serra Gaúcha. Perfeito para lua de mel ou fim de semana romântico.',
  },
  website: {
    propertyName: 'Studio Paulista Design',
    amenities: ['Decoração assinada', 'Smart TV 55"', 'Coworking café no prédio', 'Bicicletário'],
    checkInTime: '14:00',
    checkOutTime: '12:00',
    aiVoiceTone: 'Urbano e eficiente — como um concierge digital que resolve tudo em poucos toques',
    source: 'website',
    location: 'São Paulo, SP',
    rating: 4.78,
    totalRooms: 1,
    description: 'Studio designer na Av. Paulista, próximo ao MASP e metrô. Ideal para viagens de negócios ou turismo urbano.',
  },
};

export async function POST(request: NextRequest) {
  try {
    const body: MagicLinkRequest = await request.json();
    const { url, niche, source } = body;

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL é obrigatória' },
        { status: 400 }
      );
    }

    // ── Simulate network delay (scraping time) ──────────────
    // In production: replace with real VLM + Web Reader SDK calls
    await new Promise(r => setTimeout(r, 4500));

    // ── Select mock data by niche and source ─────────────────
    const mockBank = niche === 'airbnb' ? AIRBNB_MOCKS : POUSADA_MOCKS;
    const result = mockBank[source] || mockBank.website;

    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        scannedUrl: url,
        niche,
        source,
        timestamp: new Date().toISOString(),
        mode: 'mock', // flag para o frontend saber que é mock
      },
    });
  } catch (error) {
    console.error('[Magic Link] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno ao processar o link' },
      { status: 500 }
    );
  }
}
