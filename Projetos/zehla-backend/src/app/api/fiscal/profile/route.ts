import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

/**
 * API de Perfil Fiscal
 * GET /api/fiscal/profile?propertyId=xxx — Busca perfil fiscal
 * POST /api/fiscal/profile — Cria/atualiza perfil fiscal
 */

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

    const profile = await prisma.taxProfile.findUnique({
      where: { propertyId },
    });

    if (!profile) {
      return NextResponse.json({ 
        message: 'Perfil fiscal não configurado',
        profile: null 
      });
    }

    // Remover campos sensíveis da resposta
    const { chaveAPIProvedor, certificadoDigital, ...safeProfile } = profile;

    return NextResponse.json({ profile: safeProfile });

  } catch (error) {
    console.error('❌ [FISCAL] Erro ao buscar perfil fiscal:', error);
    return NextResponse.json({ error: 'Erro interno ao buscar perfil fiscal' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { propertyId, ...data } = body;

    if (!propertyId) {
      return NextResponse.json({ error: 'propertyId é obrigatório' }, { status: 400 });
    }

    // Validações básicas
    if (data.cnpj && !/^\d{14}$/.test(data.cnpj.replace(/\D/g, ''))) {
      return NextResponse.json({ error: 'CNPJ inválido' }, { status: 400 });
    }

    // Upsert: atualiza se existe, cria se não existe
    const profile = await prisma.taxProfile.upsert({
      where: { propertyId },
      update: {
        ...data,
        updatedAt: new Date(),
      },
      create: {
        propertyId,
        ...data,
      },
    });

    console.log(`✅ [FISCAL] Perfil fiscal ${profile.isActive ? 'ativado' : 'salvo'} para propriedade ${propertyId}`);

    // Remover campos sensíveis da resposta
    const { chaveAPIProvedor, certificadoDigital, ...safeProfile } = profile;

    return NextResponse.json({ profile: safeProfile });

  } catch (error) {
    console.error('❌ [FISCAL] Erro ao salvar perfil fiscal:', error);
    return NextResponse.json({ error: 'Erro interno ao salvar perfil fiscal' }, { status: 500 });
  }
}
