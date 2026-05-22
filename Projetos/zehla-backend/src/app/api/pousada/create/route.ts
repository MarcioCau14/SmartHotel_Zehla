import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { slug, nome, descricao, whatsapp, instagram, cidade, estado, quartos, fotos } = body;

    if (!slug || !nome) {
      return NextResponse.json({ error: 'slug e nome são obrigatórios' }, { status: 400 });
    }

    const property = await prisma.property.findUnique({
      where: { userId: session.user.id },
    });
    if (!property) {
      return NextResponse.json({ error: 'Propriedade não encontrada' }, { status: 404 });
    }

    const existing = await prisma.connectProfile.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: 'Slug já está em uso' }, { status: 409 });
    }

    const profile = await prisma.connectProfile.create({
      data: {
        slug,
        propertyId: property.id,
        bio: descricao || '',
        whatsappNumber: whatsapp || '',
        avatarUrl: fotos?.[0] || null,
        coverUrl: fotos?.[1] || null,
        status: 'published',
        publishedAt: new Date(),
      },
    });

    if (fotos?.length > 0) {
      await prisma.connectMedia.createMany({
        data: fotos.map((url: string) => ({
          connectProfileId: profile.id,
          url,
          type: 'image',
        })),
      });
    }

    return NextResponse.json({ success: true, data: { slug: profile.slug } });
  } catch (error) {
    console.error('[POUSADA_CREATE]', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
