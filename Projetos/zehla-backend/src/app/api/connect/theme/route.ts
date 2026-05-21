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

    const theme = await prisma.connectTheme.findUnique({
      where: { profileId },
    });

    return NextResponse.json(theme || {
      layout: 'centered',
      fontFamily: 'inter',
      colors: { primary: '#25D366', secondary: '#075E54', accent: '#128C7E', background: '#F0F2F5', text: '#111B21' },
      buttonStyle: 'rounded',
      galleryLayout: 'carousel',
    });
  } catch (error) {
    console.error('[API:CONNECT:THEME] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

async function _PUT(req: NextRequest) {
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

    const theme = await prisma.connectTheme.upsert({
      where: { profileId },
      create: {
        profileId,
        layout: body.layout || 'centered',
        fontFamily: body.fontFamily || 'inter',
        colors: body.colors || { primary: '#25D366', secondary: '#075E54', accent: '#128C7E', background: '#F0F2F5', text: '#111B21' },
        buttonStyle: body.buttonStyle || 'rounded',
        galleryLayout: body.galleryLayout || 'carousel',
      },
      update: {
        layout: body.layout,
        fontFamily: body.fontFamily,
        colors: body.colors,
        buttonStyle: body.buttonStyle,
        galleryLayout: body.galleryLayout,
      },
    });

    return NextResponse.json(theme);
  } catch (error) {
    console.error('[API:CONNECT:THEME] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export const GET = withApiSecurity(_GET, {
  rateLimit: { limit: 100, windowSeconds: 60 },
});

export const PUT = withApiSecurity(_PUT, {
  rateLimit: { limit: 30, windowSeconds: 60 },
});
