import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ReservationControllerFactory } from '@/infrastructure/http/reservation/ReservationControllerFactory';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const useCase = ReservationControllerFactory.makeListUseCase();

    const result = await useCase.execute({
      propertyId: searchParams.get('propertyId') ?? undefined,
      status: searchParams.get('status') ?? undefined,
    });

    if (result.isFail) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.value.reservations);
  } catch (error: any) {
    console.error('❌ [RESERVATIONS API] Error:', error);
    return NextResponse.json({ error: 'Erro interno', details: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id, action, status } = await request.json();
    const resolvedAction = action ?? (
      status === 'CANCELLED' ? 'CANCEL' :
      status === 'CHECKED_IN' ? 'CHECK_IN' :
      status === 'CHECKED_OUT' ? 'CHECK_OUT' :
      null
    );

    switch (resolvedAction) {
      case 'CANCEL': {
        const useCase = ReservationControllerFactory.makeCancelUseCase();
        const result = await useCase.execute({ reservationId: id });
        if (result.isFail) {
          return NextResponse.json({ error: result.error }, { status: 400 });
        }
        return NextResponse.json({ success: true });
      }

      case 'CHECK_IN': {
        const useCase = ReservationControllerFactory.makeCheckInUseCase();
        const result = await useCase.execute({ reservationId: id });
        if (result.isFail) {
          return NextResponse.json({ error: result.error }, { status: 400 });
        }
        return NextResponse.json({ success: true, data: result.value });
      }

      case 'CHECK_OUT': {
        const useCase = ReservationControllerFactory.makeCheckOutUseCase();
        const result = await useCase.execute({ reservationId: id });
        if (result.isFail) {
          return NextResponse.json({ error: result.error }, { status: 400 });
        }
        return NextResponse.json({ success: true, data: result.value });
      }

      default:
        return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Erro ao atualizar reserva', details: error.message }, { status: 500 });
  }
}
