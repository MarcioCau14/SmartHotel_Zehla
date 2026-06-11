import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTenantId } from '@/lib/security/tenant-context';
import { PrismaTaxProfileRepository } from '@/infrastructure/persistence/financeiro/PrismaTaxProfileRepository';
import { AtualizarPerfilFiscalUseCase } from '@/application/financeiro/use-cases/AtualizarPerfilFiscalUseCase';

export async function GET(req: NextRequest) {
  try {
    const tenantId = await getTenantId();
    if (!tenantId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const repo = new PrismaTaxProfileRepository(prisma);
    const profile = await repo.findByPropertyId(tenantId);
    if (!profile) {
      return NextResponse.json(null);
    }

    return NextResponse.json(profile.toDTO());
  } catch (error: any) {
    console.error('❌ [GET /api/zcc/tax-profile] Erro:', error);
    return NextResponse.json({ error: 'Erro ao buscar perfil fiscal' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenantId = await getTenantId();
    if (!tenantId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const repo = new PrismaTaxProfileRepository(prisma);
    const useCase = new AtualizarPerfilFiscalUseCase(repo);

    // Forçamos o propertyId extraído do token JWT, ignorando qualquer um enviado no body
    const result = await useCase.execute({
      ...body,
      propertyId: tenantId,
    });

    if (result.isFail) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.value);
  } catch (error: any) {
    console.error('❌ [POST /api/zcc/tax-profile] Erro:', error);
    return NextResponse.json({ error: 'Erro ao salvar perfil fiscal' }, { status: 500 });
  }
}
