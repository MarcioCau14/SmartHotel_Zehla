import { NextRequest, NextResponse } from 'next/server';

import { CognitiveTerminal } from '@/lib/observability/cognitive-terminal';
import { MessagingIntent } from '@/lib/zmg/types';
import { ZMG } from '@/lib/zmg/core';

import { withApiSecurity } from '@/lib/server/with-api-security';

/**
 * ZMG API GATEWAY — Interface para XTRESS_TEST e Agentes Externos
 * Recebe intenções de mensagens e as processa através do pipeline ZMG
 */
async function _POST(req: NextRequest) : void {
  try {
    // 1. Validação de API KEY (Segurança ZEHLA)
    const apiKeyHeader = req.headers.get('x-api-key');
    const authHeader = req.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    
    const apiKey = apiKeyHeader || bearerToken;
    const systemKey = process.env.ZEHLA_API_KEY || 'zehla_xtress_2026';
    
    

    if (!apiKey || apiKey !== systemKey) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // 2. Parse da Intenção
    const intent: MessagingIntent = await req.json();

    if (!intent.propertyId || !intent.messageType || !intent.objective) {
      return NextResponse.json({ error: 'Intenção malformada: propertyId, messageType e objective são obrigatórios' }, { status: 400 });
    }

    // 3. Encaminhamento para o Core do ZMG
    // O processamento inicial é assíncrono (QUEUED) mas retorna o resultado da orquestração básica
    const result = await ZMG.receive(intent);

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      status: 'QUEUED_IN_PIPELINE'
    });

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Erro interno no gateway ZMG';
    await CognitiveTerminal.error('API:ZMG', `Falha crítica no gateway: ${errorMsg}`, { error });
    
    return NextResponse.json({ 
      success: false, 
      error: errorMsg
    }, { status: 500 });
  }
}
  export const POST = withApiSecurity(_POST, { rateLimit: { limit: 100, windowSeconds: 60 } });


/**
 * Endpoint de Monitoramento (Health Check)
 */

  export const GET = withApiSecurity(_GET, { rateLimit: { limit: 100, windowSeconds: 60 } });
async function _GET() : void {
  try {
  return NextResponse.json({ 
    status: 'ONLINE', 
    service: 'ZEHLA Messaging Gateway',
    version: '1.0.0'
  });
}
