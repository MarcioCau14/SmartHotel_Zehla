import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 1x1 Transparent GIF
const TRANSPARENT_GIF = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

export async function GET(
  req: NextRequest,
  { params }: { params: { leadId: string } }
) {
  const { leadId } = params;

  try {
    // 🧠 Estímulo ao Cérebro: Registrar o evento de abertura
    await prisma.leadEvent.create({
      data: {
        leadId,
        type: 'EMAIL_OPEN',
        metadata: JSON.stringify({
          userAgent: req.headers.get('user-agent'),
          ip: req.headers.get('x-forwarded-for') || 'unknown',
        }),
      },
    });

    // Atualizar o estado do lead no Funil e Score
    // O Cérebro ZEHLA reage a este estímulo
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        funnelStage: 'AWARE',
        lastInteractionAt: new Date(),
        conversionScore: {
          increment: 5 // Pequeno boost por abertura
        }
      },
    });

    // Retornar o pixel invisível
    return new NextResponse(TRANSPARENT_GIF, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Tracking Error:', error);
    // Mesmo em erro, retornamos o pixel para não quebrar a experiência do usuário
    return new NextResponse(TRANSPARENT_GIF, {
      headers: { 'Content-Type': 'image/gif' },
    });
  }
}
