import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { leadId: string } }
) {
  const { leadId } = params;
  const targetUrl = req.nextUrl.searchParams.get('url') || '/';

  try {
    // 🧠 Estímulo Cerebral de Alta Intensidade: Link Clicado
    await prisma.leadEvent.create({
      data: {
        leadId,
        type: 'LINK_CLICK',
        metadata: JSON.stringify({
          targetUrl,
          userAgent: req.headers.get('user-agent'),
        }),
      },
    });

    // Escalada de Funil e Score
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        funnelStage: 'INTEREST',
        lastInteractionAt: new Date(),
        conversionScore: {
          increment: 15 // Grande boost por clique
        }
      },
    });

    // Redirecionamento instantâneo
    return NextResponse.redirect(new URL(targetUrl, req.url));
  } catch (error) {
    console.error('Click Tracking Error:', error);
    return NextResponse.redirect(new URL(targetUrl, req.url));
  }
}
