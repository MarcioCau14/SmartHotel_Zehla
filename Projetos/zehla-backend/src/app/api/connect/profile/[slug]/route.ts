import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

import { withApiSecurity } from '@/lib/server/with-api-security';

async function _GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const profile = await prisma.connectProfile.findUnique({
      where: { slug },
      include: {
        links: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
        theme: true,
        reviews: {
          where: { isApproved: true },
          orderBy: { createdAt: 'desc' },
        },
        media: {
          orderBy: { order: 'asc' },
        },
        property: {
          select: {
            name: true,
            city: true,
            state: true,
            latitude: true,
            longitude: true,
            whatsapp: true,
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Perfil não encontrado' },
        { status: 404 }
      );
    }

    if (profile.status !== 'published') {
      return NextResponse.json(
        { error: 'Perfil não disponível' },
        { status: 404 }
      );
    }

    await prisma.connectProfile.update({
      where: { id: profile.id },
      data: { totalViews: { increment: 1 } },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error('[API:CONNECT:PROFILE] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export const GET = withApiSecurity(_GET, {
  rateLimit: { limit: 100, windowSeconds: 60 },
});
