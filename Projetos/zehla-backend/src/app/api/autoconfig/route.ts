import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { autoConfigSkill } from '@/lib/brain/autoconfig/AutoConfigSkill';

/**
 * API de Auto-Configuração via IA
 * 
 * POST /api/autoconfig — Executa comando em linguagem natural
 * GET /api/autoconfig?propertyId=xxx — Lista logs de auto-config
 */

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { propertyId, command } = body;

    if (!propertyId || !command) {
      return NextResponse.json(
        { error: 'propertyId e command são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar propriedade
    const property = await prisma.property.findFirst({
      where: { id: propertyId, userId: session.user.id },
    });

    if (!property) {
      return NextResponse.json({ error: 'Propriedade não encontrada' }, { status: 404 });
    }

    const result = await autoConfigSkill.execute(propertyId, session.user.id, command);

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ [AUTO-CONFIG] Erro:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar comando' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get('propertyId');

    if (!propertyId) {
      return NextResponse.json({ error: 'propertyId é obrigatório' }, { status: 400 });
    }

    const property = await prisma.property.findFirst({
      where: { id: propertyId, userId: session.user.id },
    });

    if (!property) {
      return NextResponse.json({ error: 'Propriedade não encontrada' }, { status: 404 });
    }

    const logs = await prisma.autoConfigLog.findMany({
      where: { propertyId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ logs });

  } catch (error) {
    console.error('❌ [AUTO-CONFIG] Erro ao listar logs:', error);
    return NextResponse.json(
      { error: 'Erro interno ao listar logs' },
      { status: 500 }
    );
  }
}
