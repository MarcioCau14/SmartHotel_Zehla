import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const reservations = await prisma.reservation.findMany({
      where: status && status !== 'all' ? { status: status as any } : {},
      include: {
        room: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Adapt to the format expected by the frontend
    const formatted = reservations.map(res => ({
      id: res.id,
      guestName: res.guestName,
      guestEmail: res.guestEmail,
      guestPhone: res.guestPhone,
      roomNumber: res.room?.number || 'N/A',
      roomType: res.room?.type || 'Standard',
      checkIn: res.checkIn.toLocaleDateString('pt-BR'),
      checkOut: res.checkOut.toLocaleDateString('pt-BR'),
      status: res.status,
      totalAmount: res.totalAmount,
      propertyId: res.propertyId,
      createdAt: res.createdAt.toISOString()
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error('❌ [RESERVATIONS API] Error:', error);
    return NextResponse.json({ error: 'Erro interno', details: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id, status } = await request.json();

    const updated = await prisma.reservation.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Erro ao atualizar reserva', details: error.message }, { status: 500 });
  }
}
