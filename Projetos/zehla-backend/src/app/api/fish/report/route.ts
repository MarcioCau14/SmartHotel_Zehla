import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { withApiSecurity } from '@/lib/server/with-api-security';
import type { RouteHandler } from '@/lib/server/with-api-security';

const execFileAsync = promisify(execFile);

const handler: RouteHandler = async (req) => {
  const { searchParams } = new URL(req.url);
  const leadId = searchParams.get('leadId');
  
  if (!leadId) {
    return NextResponse.json({ error: 'O parâmetro leadId é obrigatório.' }, { status: 400 });
  }

  try {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) {
      return NextResponse.json({ error: 'Lead não encontrado.' }, { status: 404 });
    }

    const payload = {
      name: lead.name,
      property: lead.property || lead.name,
      city: lead.city || 'Desconhecida',
      state: lead.state || 'SC',
      roomsCount: lead.roomsCount || 0,
      instagramFollowers: lead.instagramFollowers || 0,
      googleRating: lead.googleRating || 0,
      googleReviewsCount: lead.googleReviewsCount || 0,
      otaCommissionLost: lead.otaCommissionLost || 0.0,
      otaDependenceLevel: lead.otaDependenceLevel || 'MEDIUM',
      buyingBehavior: lead.buyingBehavior || 'Tradicional',
      conversionProbability: lead.conversionProbability || 0.0,
      score: lead.score || 0,
      leadTier: lead.leadTier || 'COLD',
      recommendedPitch: lead.recommendedPitch || '',
      objectKeywords: lead.objectKeywords || '{}'
    };

    const tempDir = path.join(process.cwd(), 'scratch');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const payloadPath = path.join(tempDir, `payload_${leadId}.json`);
    const pdfPath = path.join(tempDir, `dossier_${leadId}.pdf`);

    fs.writeFileSync(payloadPath, JSON.stringify(payload, null, 2));

    const scriptPath = path.join(process.cwd(), 'scripts', 'generate_body.py');
    await execFileAsync('python3', [scriptPath, payloadPath, pdfPath]);

    if (!fs.existsSync(pdfPath)) {
      throw new Error('O script Python de compilação ReportLab falhou ao gravar o PDF.');
    }

    const pdfBuffer = fs.readFileSync(pdfPath);

    try {
      fs.unlinkSync(payloadPath);
      fs.unlinkSync(pdfPath);
    } catch (cleanErr) {
      console.warn('⚠️ [FISH-REPORT] Falha ao excluir arquivos temporários:', cleanErr);
    }

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="ZEHLA_FISH_Dossier_${lead.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`,
      },
    });

  } catch (error: any) {
    console.error('❌ [FISH-REPORT] Falha na compilação do Dossier:', error);
    return NextResponse.json({ error: 'Erro interno ao compilar o dossier PDF.', details: error.message }, { status: 500 });
  }
};

export const GET = withApiSecurity(handler);
