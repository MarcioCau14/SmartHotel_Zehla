import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

import { withApiSecurity } from '@/lib/server/with-api-security';

async function _POST(req: NextRequest) {
  try {
  const session = await getServerSession(authOptions) as any;
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const property = await prisma.property.findFirst({
      where: { userId: session.user.id },
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Nenhuma propriedade encontrada' },
        { status: 404 }
      );
    }

    const body = await req.json();

    const profile = await prisma.connectProfile.upsert({
      where: { propertyId: property.id },
      create: {
        slug: body.slug,
        bio: body.bio || '',
        avatarUrl: body.avatarUrl,
        coverUrl: body.coverUrl,
        whatsappNumber: body.whatsappNumber,
        status: body.status || 'draft',
        seoTitle: body.seoTitle,
        seoDescription: body.seoDescription,
        propertyId: property.id,
      },
      update: {
        slug: body.slug,
        bio: body.bio,
        avatarUrl: body.avatarUrl,
        coverUrl: body.coverUrl,
        whatsappNumber: body.whatsappNumber,
        status: body.status,
        seoTitle: body.seoTitle,
        seoDescription: body.seoDescription,
        publishedAt: body.status === 'published' ? new Date() : undefined,
      },
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

export const POST = withApiSecurity(_POST, {
  rateLimit: { limit: 30, windowSeconds: 60 },
});
