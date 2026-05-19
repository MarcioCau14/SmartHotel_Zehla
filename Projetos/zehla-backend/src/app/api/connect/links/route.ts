import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

import { withApiSecurity } from '@/lib/server/with-api-security';

async function getProfileId(session: { user: { id: string } }): Promise<string | null> {
  const property = await prisma.property.findFirst({
    where: { userId: session.user.id },
    include: { connectProfile: true },
  });
  return property?.connectProfile?.id || null;
}

async function _GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const profileId = await getProfileId(session as any);
    if (!profileId) {
      return NextResponse.json(
        { error: 'Perfil Connect não encontrado' },
        { status: 404 }
      );
    }

    const links = await prisma.connectLink.findMany({
      where: { profileId },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(links);
  } catch (error) {
    console.error('[API:CONNECT:LINKS] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

async function _POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const profileId = await getProfileId(session as any);
    if (!profileId) {
      return NextResponse.json(
        { error: 'Perfil Connect não encontrado' },
        { status: 404 }
      );
    }

    const body = await req.json();

    const maxOrder = await prisma.connectLink.aggregate({
      where: { profileId },
      _max: { order: true },
    });

    const link = await prisma.connectLink.create({
      data: {
        label: body.label,
        url: body.url,
        icon: body.icon || 'link',
        type: body.type || 'external',
        order: body.order ?? (maxOrder._max.order ?? -1) + 1,
        isActive: body.isActive ?? true,
        profileId,
      },
    });

    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    console.error('[API:CONNECT:LINKS] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export const GET = withApiSecurity(_GET, {
  rateLimit: { limit: 100, windowSeconds: 60 },
});

export const POST = withApiSecurity(_POST, {
  rateLimit: { limit: 30, windowSeconds: 60 },
});
