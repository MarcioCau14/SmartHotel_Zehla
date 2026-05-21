import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { generateWebhookSecret } from '@/lib/marketplace/DispatchPublicWebhookUseCase';

/**
 * API de Gerenciamento de Webhook Subscriptions
 * 
 * GET /api/marketplace/subscriptions — Lista assinaturas
 * POST /api/marketplace/subscriptions — Cria nova assinatura
 * DELETE /api/marketplace/subscriptions?id=xxx — Remove assinatura
 * PATCH /api/marketplace/subscriptions?id=xxx — Atualiza assinatura
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

    const subscriptions = await prisma.webhookSubscription.findMany({
      where: { propertyId: property.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        endpointUrl: true,
        events: true,
        isActive: true,
        lastTriggeredAt: true,
        lastStatus: true,
        failureCount: true,
        disabledAt: true,
        createdAt: true,
      },
    });

    // Buscar logs recentes de entrega
    const recentLogs = await prisma.webhookDeliveryLog.findMany({
      where: { propertyId: property.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        eventType: true,
        endpointUrl: true,
        status: true,
        responseStatus: true,
        responseTime: true,
        attempt: true,
        error: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ subscriptions, recentLogs });

  } catch (error) {
    console.error('❌ [MARKETPLACE] Erro ao listar webhooks:', error);
    return NextResponse.json({ error: 'Erro interno ao listar webhooks' }, { status: 500 });
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
    const { name, endpointUrl, events } = body;

    if (!name || !endpointUrl || !events || events.length === 0) {
      return NextResponse.json(
        { error: 'name, endpointUrl e events são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar URL
    try {
      new URL(endpointUrl);
    } catch {
      return NextResponse.json({ error: 'URL do endpoint inválida' }, { status: 400 });
    }

    // Gerar secretKey único
    const secretKey = generateWebhookSecret();

    const subscription = await prisma.webhookSubscription.create({
      data: {
        propertyId: property.id,
        name,
        endpointUrl,
        secretKey,
        events,
      },
    });

    console.log(`📡 [MARKETPLACE] Webhook subscription criada: ${name} para ${endpointUrl}`);

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        name: subscription.name,
        endpointUrl: subscription.endpointUrl,
        events: subscription.events,
        isActive: subscription.isActive,
        createdAt: subscription.createdAt,
      },
      // SecretKey exibido apenas uma vez
      secretKey,
      warning: 'Guarde este secretKey! Ele será usado para verificar a assinatura HMAC dos webhooks.',
    }, { status: 201 });

  } catch (error) {
    console.error('❌ [MARKETPLACE] Erro ao criar webhook subscription:', error);
    return NextResponse.json({ error: 'Erro interno ao criar webhook subscription' }, { status: 500 });
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
    const subscriptionId = searchParams.get('id');

    if (!subscriptionId) {
      return NextResponse.json({ error: 'ID da assinatura é obrigatório' }, { status: 400 });
    }

    await prisma.webhookSubscription.delete({
      where: { id: subscriptionId, propertyId: property.id },
    });

    console.log(`🗑️ [MARKETPLACE] Webhook subscription removida: ${subscriptionId}`);

    return NextResponse.json({ success: true, message: 'Assinatura removida com sucesso' });

  } catch (error) {
    console.error('❌ [MARKETPLACE] Erro ao remover webhook subscription:', error);
    return NextResponse.json({ error: 'Erro interno ao remover webhook subscription' }, { status: 500 });
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
    const subscriptionId = searchParams.get('id');

    if (!subscriptionId) {
      return NextResponse.json({ error: 'ID da assinatura é obrigatório' }, { status: 400 });
    }

    const body = await req.json();
    const { name, endpointUrl, events, isActive } = body;

    const subscription = await prisma.webhookSubscription.update({
      where: { id: subscriptionId, propertyId: property.id },
      data: {
        ...(name && { name }),
        ...(endpointUrl && { endpointUrl }),
        ...(events && { events }),
        ...(isActive !== undefined && { isActive, disabledAt: isActive ? null : new Date() }),
      },
    });

    return NextResponse.json({ subscription });

  } catch (error) {
    console.error('❌ [MARKETPLACE] Erro ao atualizar webhook subscription:', error);
    return NextResponse.json({ error: 'Erro interno ao atualizar webhook subscription' }, { status: 500 });
  }
}
