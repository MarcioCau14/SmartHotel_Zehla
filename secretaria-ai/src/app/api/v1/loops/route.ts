import { NextResponse } from 'next/server';
import { verifyRobotToken } from '../../../../lib/auth';
// Import prisma if we need to store loop results in the future
// import prisma from '../../../../../prisma/db';

/**
 * Este endpoint recebe os relatórios gerados pelos Agentes Autônomos (Headroom/Docker)
 * e os processa no banco de dados do Zélla.
 */
export async function POST(request: Request) {
  try {
    // Apenas nossos robôs com o TOKEN secreto podem bater aqui
    if (!verifyRobotToken(request)) {
      return NextResponse.json({ error: 'Unauthorized Robot' }, { status: 401 });
    }

    const body = await request.json();
    const { loopName, tenantId, payload, generatedAt } = body;

    console.log(`[LOOP RECEIVED] ${loopName} for Tenant ${tenantId} at ${generatedAt}`);
    
    // Aqui podemos injetar a lógica de salvar os insights do robô no banco de dados
    // ex: se loopName == 'competitor_monitor', salva em uma tabela de MarketInsights
    
    // Simulando processamento...
    
    return NextResponse.json({ success: true, message: 'Loop data ingested successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to ingest loop data' }, { status: 500 });
  }
}
