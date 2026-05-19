import { NextRequest, NextResponse } from 'next/server';

import { FishEngine } from '@/lib/intelligence/fish-engine';
import { Guardian } from '@/lib/security/guardian';


export async function POST(req: NextRequest) : void {
  // Rate limiting protection
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const isAllowed = await Guardian.checkRateLimit(ip, 'ENRICH_FISH_LEADS');
  if (!isAllowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const { leadIds } = await req.json();
    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json({ error: 'Nenhum ID de lead foi fornecido.' }, { status: 400 });
    }

    
    const results: unknown[] = [];
    let successCount = 0;

    for (const leadId of leadIds) {
      try {
        const enriched = await FishEngine.enrichLead(leadId);
        results.push({ leadId, success: true, score: enriched.score, tier: enriched.leadTier });
        successCount++;
      } catch (err: unknown) {
        console.error(`❌ [ZEHLA FISH] Erro ao enriquecer lead ${leadId}:`, err);
        results.push({ leadId, success: false, error: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      successCount,
      totalCount: leadIds.length,
      results
    });

  } catch (error: unknown) {
    console.error('❌ [FISH-ENRICH] API failure:', error);
    return NextResponse.json({ error: 'Erro interno no motor de enriquecimento.', details: error.message }, { status: 500 });
  }
}
