import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { generateApiKey } from '@/lib/marketplace/DispatchPublicWebhookUseCase';

/**
 * API de Gerenciamento de API Keys
 * 
 * GET /api/marketplace/api-keys — Lista chaves da propriedade
 * POST /api/marketplace/api-keys — Cria nova chave
 * DELETE /api/marketplace/api-keys?id=xxx — Revoga chave
 * PATCH /api/marketplace/api-keys?id=xxx — Atualiza permissões
 */

export async function GET(req: NextRequest) {
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

    const keys = await prisma.apiKey.findMany({
      where: { propertyId: property.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        permissions: true,
        scopes: true,
        isActive: true,
        lastUsedAt: true,
        revokedAt: true,
        revokedReason: true,
        expiresAt: true,
        rateLimit: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ keys });

  } catch (error) {
    console.error('❌ [MARKETPLACE] Erro ao listar API keys:', error);
    return NextResponse.json({ error: 'Erro interno ao listar API keys' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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
    const { name, permissions, scopes, expiresAt, rateLimit } = body;

    if (!name) {
      return NextResponse.json({ error: 'Nome da chave é obrigatório' }, { status: 400 });
    }

    // Gerar nova chave
    const { plain, hash, prefix } = generateApiKey();

    const key = await prisma.apiKey.create({
      data: {
        propertyId: property.id,
        name,
        keyPrefix: prefix,
        keyHash: hash,
        keyPlain: plain, // Armazenada temporariamente para exibição única
        permissions: permissions || ['read'],
        scopes: scopes || ['reservations', 'rooms'],
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        rateLimit: rateLimit || 100,
      },
    });

    console.log(`🔑 [MARKETPLACE] API key criada: ${key.name} para propriedade ${property.id}`);

    // Remover chavePlain após criação (não armazenar permanentemente)
    await prisma.apiKey.update({
      where: { id: key.id },
      data: { keyPlain: '' },
    });

    return NextResponse.json({
      key: {
        id: key.id,
        name: key.name,
        keyPrefix: key.keyPrefix,
        permissions: key.permissions,
        scopes: key.scopes,
        expiresAt: key.expiresAt,
        rateLimit: key.rateLimit,
        createdAt: key.createdAt,
      },
      // Chave completa exibida apenas uma vez
      plainKey: plain,
      warning: 'Guarde esta chave! Ela não será exibida novamente.',
    }, { status: 201 });

  } catch (error) {
    console.error('❌ [MARKETPLACE] Erro ao criar API key:', error);
    return NextResponse.json({ error: 'Erro interno ao criar API key' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
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
    const keyId = searchParams.get('id');
    const reason = searchParams.get('reason') || 'Revogada pelo usuário';

    if (!keyId) {
      return NextResponse.json({ error: 'ID da chave é obrigatório' }, { status: 400 });
    }

    await prisma.apiKey.update({
      where: { id: keyId, propertyId: property.id },
      data: {
        isActive: false,
        revokedAt: new Date(),
        revokedReason: reason,
      },
    });

    console.log(`🚫 [MARKETPLACE] API key revogada: ${keyId}`);

    return NextResponse.json({ success: true, message: 'Chave revogada com sucesso' });

  } catch (error) {
    console.error('❌ [MARKETPLACE] Erro ao revogar API key:', error);
    return NextResponse.json({ error: 'Erro interno ao revogar API key' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
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
    const keyId = searchParams.get('id');

    if (!keyId) {
      return NextResponse.json({ error: 'ID da chave é obrigatório' }, { status: 400 });
    }

    const body = await req.json();
    const { permissions, scopes, rateLimit, isActive } = body;

    const key = await prisma.apiKey.update({
      where: { id: keyId, propertyId: property.id },
      data: {
        ...(permissions && { permissions }),
        ...(scopes && { scopes }),
        ...(rateLimit && { rateLimit }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ key });

  } catch (error) {
    console.error('❌ [MARKETPLACE] Erro ao atualizar API key:', error);
    return NextResponse.json({ error: 'Erro interno ao atualizar API key' }, { status: 500 });
  }
}
