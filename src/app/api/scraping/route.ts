// =============================================================================
// API — Scraping de Imóveis Airbnb
// =============================================================================
// POST /api/scraping — Raspa dados de um imóvel a partir de URL ou código
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getScrapingEngine, extractPropertyCode } from '@/lib/scraping/PropertyScrapingEngine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { input } = body as { input: string };

    if (!input || typeof input !== 'string') {
      return NextResponse.json(
        { error: 'Campo "input" é obrigatório. Envie a URL do Airbnb ou código do imóvel.' },
        { status: 400 }
      );
    }

    // Verificar se o código pode ser extraído
    const propertyCode = extractPropertyCode(input);
    if (!propertyCode) {
      return NextResponse.json(
        { error: 'Não foi possível extrair o código do imóvel. Use a URL completa do Airbnb (ex: airbnb.com/rooms/12345) ou apenas o código numérico.' },
        { status: 400 }
      );
    }

    // Executar raspagem
    const engine = getScrapingEngine();
    const result = await engine.scrapeProperty(input);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Falha ao raspar dados do imóvel.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      propertyCode,
      publicData: result.publicData,
      enrichedData: result.enrichedData,
      layers: result.layers,
    });
  } catch (error) {
    console.error('[api/scraping] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
