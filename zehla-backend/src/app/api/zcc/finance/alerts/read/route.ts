import { NextResponse } from 'next/server';
import { PrismaFinanceAlertRepository } from '@/infrastructure/persistence/financeiro/PrismaFinanceAlertRepository';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { alertId } = body;

    if (!alertId) {
      return NextResponse.json({ error: 'alertId é obrigatório' }, { status: 400 });
    }

    const alertRepo = new PrismaFinanceAlertRepository();
    await alertRepo.markAsRead(alertId);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
