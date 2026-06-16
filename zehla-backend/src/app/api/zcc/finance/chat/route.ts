import { NextResponse } from 'next/server';
import { PrismaPousadaFinanceRepository } from '@/infrastructure/persistence/financeiro/PrismaPousadaFinanceRepository';
import { EnviarPerguntaChatFinanceiroUseCase } from '@/application/financeiro/use-cases/EnviarPerguntaChatFinanceiroUseCase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { propertyId, message } = body;

    if (!propertyId || !message) {
      return NextResponse.json(
        { error: 'Campos obrigatórios ausentes: propertyId, message' },
        { status: 400 }
      );
    }

    const pousadaFinanceRepo = new PrismaPousadaFinanceRepository();
    const useCase = new EnviarPerguntaChatFinanceiroUseCase(pousadaFinanceRepo);

    const result = await useCase.execute({ propertyId, message });

    if (result.isFail) {
      return NextResponse.json({ error: result.error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      reply: result.value.reply,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
