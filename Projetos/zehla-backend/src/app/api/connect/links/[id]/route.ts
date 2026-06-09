import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

import { withApiSecurity } from '@/lib/server/with-api-security';

async function getOwnedLinkId(session: { user: { id: string } }, linkId: string): Promise<boolean> {
  const property = await prisma.property.findFirst({
    where: { userId: session.user.id },
    include: {
      connectProfile: {
        include: { links: { where: { id: linkId }, select: { id: true } } },
      },
    },
  });
  return property?.connectProfile?.links?.length === 1;
}

async function _PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const owns = await getOwnedLinkId(session as any, id);
    if (!owns) {
      return NextResponse.json({ error: 'Link não encontrado' }, { status: 404 });
    }

    const body = await req.json();

    const link = await prisma.connectLink.update({
      where: { id },
      data: {
        label: body.label,
        url: body.url,
        icon: body.icon,
        type: body.type,
        order: body.order,
        isActive: body.isActive,
      },
    });

    return NextResponse.json(link);
  } catch (error) {
    console.error('[API:CONNECT:LINKS] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

async function _DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const owns = await getOwnedLinkId(session as any, id);
    if (!owns) {
      return NextResponse.json({ error: 'Link não encontrado' }, { status: 404 });
    }

    await prisma.connectLink.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API:CONNECT:LINKS] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export const PUT = withApiSecurity(_PUT, {
  rateLimit: { limit: 30, windowSeconds: 60 },
});

export const DELETE = withApiSecurity(_DELETE, {
  rateLimit: { limit: 30, windowSeconds: 60 },
});
