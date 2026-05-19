import { NextRequest, NextResponse } from 'next/server';
import { LISBatchValidator } from '@/lib/intelligence/lis-validator';
import { ZMGDispatcher } from '@/lib/delivery/zmg-dispatcher';
import { Guardian } from '@/lib/security/guardian';

/**
 * [OPERATIONAL] Ingestão em Lote (Zero Browser Policy)
 * Processa até 300 leads estritamente via JSON para evitar carga de CPU local.
 */
export async function POST(req: NextRequest) {
  // 1. BLINDAGEM: Rate Limiting Militar (2 req/min para lotes)
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const isAllowed = await Guardian.checkRateLimit(ip, 'POST_BATCH_INGESTION');
  
  if (!isAllowed) {
    return NextResponse.json({ error: 'Rate limit exceeded for batch ingestion.' }, { status: 429 });
  }

  try {
    const { leads, apiKey } = await req.json();

    // 2. SEGURANÇA: Validação de Chave Operacional (Simples para GHA)
    if (apiKey !== process.env.OPERATIONAL_API_KEY && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized operational request.' }, { status: 401 });
    }

    if (!Array.isArray(leads)) {
      return NextResponse.json({ error: 'Payload deve ser um array de leads.' }, { status: 400 });
    }

    console.log(`📦 [BATCH_INGEST] Recebido lote de ${leads.length} leads.`);

    // 3. PROCESSAMENTO: LIS Batch Validator (Zero Browser)
    const validator = new LISBatchValidator();
    const validatedLeads = await validator.processBatch(leads);

    if (validatedLeads.length > 0) {
      // 4. DESPACHO: ZMG Dispatcher (WhatsApp Warmup)
      const dispatcher = new ZMGDispatcher();
      await dispatcher.enqueueLeads(validatedLeads);
    }

    return NextResponse.json({
      success: true,
      processed: leads.length,
      validated: validatedLeads.length,
      message: `${validatedLeads.length} leads qualificados e enfileirados para ZMG.`
    });

  } catch (error: any) {
    console.error('❌ [BATCH_INGEST] Critical Failure:', error.message);
    return NextResponse.json({ error: 'Internal operational error.' }, { status: 500 });
  }
}
