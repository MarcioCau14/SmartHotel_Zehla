import { NextResponse } from 'next/server';
import { PrismaPousadaFinanceRepository } from '@/infrastructure/persistence/financeiro/PrismaPousadaFinanceRepository';
import { PrismaFinanceTransactionRepository } from '@/infrastructure/persistence/financeiro/PrismaFinanceTransactionRepository';
import { PrismaFinanceAlertRepository } from '@/infrastructure/persistence/financeiro/PrismaFinanceAlertRepository';
import { ObterDashboardFinanceiroUseCase } from '@/application/financeiro/use-cases/ObterDashboardFinanceiroUseCase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const daysParam = searchParams.get('days');
    const days = daysParam ? parseInt(daysParam, 10) : 30;

    if (!propertyId) {
      return NextResponse.json({ error: 'propertyId é obrigatório' }, { status: 400 });
    }

    const pousadaFinanceRepo = new PrismaPousadaFinanceRepository();
    const transactionRepo = new PrismaFinanceTransactionRepository();
    const alertRepo = new PrismaFinanceAlertRepository();

    const useCase = new ObterDashboardFinanceiroUseCase(
      pousadaFinanceRepo,
      transactionRepo,
      alertRepo
    );

    const result = await useCase.execute({ propertyId, days });

    if (result.isFail) {
      return NextResponse.json({ error: result.error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result.value,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
