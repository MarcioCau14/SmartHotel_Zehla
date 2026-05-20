import { NextRequest, NextResponse } from 'next/server';
import { dnaClonerService } from '@/lib/ai/engine/dna-cloner-service';
import { getTenantId } from '@/lib/security/tenant-context';

export async function POST(req: NextRequest) {
  try {
    const tenantId = getTenantId();
    if (!tenantId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { chatLog } = await req.json();
    if (!chatLog || chatLog.length < 100) {
      return NextResponse.json({ error: 'Log de chat muito curto ou ausente' }, { status: 400 });
    }

    const dnaMetrics = await dnaClonerService.extractDNA(chatLog);

    return NextResponse.json({ 
      success: true, 
      metrics: dnaMetrics,
      message: 'DNA extraído com sucesso!' 
    });
  } catch (error: any) {
    console.error('[DNA_CLONE_ERROR]', error);
    return NextResponse.json({ 
      error: error.message || 'Erro ao clonar DNA' 
    }, { status: 500 });
  }
}
