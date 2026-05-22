import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const profile = await prisma.connectProfile.findUnique({
      where: { slug, status: { not: 'draft' } },
      include: {
        property: {
          select: { name: true, city: true, state: true, rooms: { select: { id: true } } },
        },
        media: { select: { url: true, type: true } },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
    }

    const data = {
      nome: profile.property?.name || profile.slug,
      slug: profile.slug,
      descricao: profile.bio,
      cidade: profile.property?.city || '',
      estado: profile.property?.state || '',
      whatsapp: profile.whatsappNumber || '',
      quartos: profile.property?.rooms.length || 0,
      fotos: profile.media.map((m) => m.url),
      avatarUrl: profile.avatarUrl,
      coverUrl: profile.coverUrl,
    };

    await prisma.connectProfile.update({
      where: { id: profile.id },
      data: { totalViews: { increment: 1 } },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('[POUSADA_GET]', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
