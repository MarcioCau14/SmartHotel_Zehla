import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { withApiSecurity } from '@/lib/server/with-api-security';

/**
 * API de Mapeamento de Canais
 * 
 * Gerencia o mapeamento entre IDs externos de OTAs (Booking.com, Airbnb)
 * e IDs internos de quartos/propriedades do ZEHLA.
 * 
 * GET: Lista todos os mapeamentos da propriedade
 * POST: Cria um novo mapeamento
 * DELETE: Remove um mapeamento
 */

async function _GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const property = await prisma.property.findFirst({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!property) {
      return NextResponse.json({ error: 'Propriedade não encontrada' }, { status: 404 });
    }

    const mappings = await prisma.channelMapping.findMany({
      where: { propertyId: property.id },
      orderBy: [{ channel: 'asc' }, { type: 'asc' }],
    });

    const syncLogs = await prisma.channelSyncLog.findMany({
      where: { propertyId: property.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ mappings, syncLogs });
  } catch (error) {
    console.error('❌ [API:CANAL:MAPEAMENTO] Erro:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
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

    const property = await prisma.property.findFirst({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!property) {
      return NextResponse.json({ error: 'Propriedade não encontrada' }, { status: 404 });
    }

    const body = await req.json();
    const { channel, externalId, internalId, type, metadata } = body;

    if (!channel || !externalId || !internalId || !type) {
      return NextResponse.json(
        { error: 'channel, externalId, internalId e type são obrigatórios' },
        { status: 400 }
      );
    }

    const mapping = await prisma.channelMapping.upsert({
      where: {
        propertyId_channel_externalId_type: {
          propertyId: property.id,
          channel,
          externalId,
          type,
        },
      },
      create: {
        propertyId: property.id,
        channel,
        externalId,
        internalId,
        type,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
      },
      update: {
        internalId,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
        isActive: true,
      },
    });

    return NextResponse.json({ mapping });
  } catch (error) {
    console.error('❌ [API:CANAL:MAPEAMENTO] Erro:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

async function _DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const property = await prisma.property.findFirst({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!property) {
      return NextResponse.json({ error: 'Propriedade não encontrada' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const mappingId = searchParams.get('id');

    if (!mappingId) {
      return NextResponse.json(
        { error: 'ID do mapeamento é obrigatório' },
        { status: 400 }
      );
    }

    await prisma.channelMapping.delete({
      where: { id: mappingId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ [API:CANAL:MAPEAMENTO] Erro:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export const GET = withApiSecurity(_GET, {
  rateLimit: { limit: 30, windowSeconds: 60 },
});

export const POST = withApiSecurity(_POST, {
  rateLimit: { limit: 10, windowSeconds: 60 },
});

export const DELETE = withApiSecurity(_DELETE, {
  rateLimit: { limit: 10, windowSeconds: 60 },
});
