import { NextResponse } from 'next/server';
import { PrismaTaxProfileRepository } from '@/infrastructure/persistence/financeiro/PrismaTaxProfileRepository';
import { AtualizarPerfilFiscalUseCase } from '@/application/financeiro/use-cases/AtualizarPerfilFiscalUseCase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      propertyId,
      cnpj,
      razaoSocial,
      inscricaoEstadual,
      inscricaoMunicipal,
      taxRegime,
      environment,
      encryptedKeys,
    } = body;

    if (!propertyId || !cnpj || !razaoSocial || !taxRegime || !environment) {
      return NextResponse.json(
        { error: 'Campos obrigatórios ausentes: propertyId, cnpj, razaoSocial, taxRegime, environment' },
        { status: 400 }
      );
    }

    const repo = new PrismaTaxProfileRepository();
    const useCase = new AtualizarPerfilFiscalUseCase(repo);

    const result = await useCase.execute({
      propertyId,
      cnpj,
      razaoSocial,
      inscricaoEstadual,
      inscricaoMunicipal,
      taxRegime,
      environment,
      encryptedKeys,
    });

    if (result.isFail) {
      return NextResponse.json({ error: result.error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result.value.toJSON(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');

    if (!propertyId) {
      return NextResponse.json({ error: 'propertyId é obrigatório' }, { status: 400 });
    }

    const repo = new PrismaTaxProfileRepository();
    const profile = await repo.findByPropertyId(propertyId);

    if (!profile) {
      return NextResponse.json({ success: true, data: null });
    }

    return NextResponse.json({
      success: true,
      data: profile.toJSON(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
