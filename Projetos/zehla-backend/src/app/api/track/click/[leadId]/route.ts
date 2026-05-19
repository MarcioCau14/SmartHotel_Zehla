import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

import { withApiSecurity } from '@/lib/server/with-api-security';

async function _GET(
  req: NextRequest,
  { params }
  export const GET = withApiSecurity(_GET, { rateLimit: { limit: 100, windowSeconds: 60 } });
: { params: { leadId: string } }
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
