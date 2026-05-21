import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { calculateDynamicPricing, type DynamicPricingInput } from '@/lib/revenue/use-cases/CalculateDynamicPricingUseCase';
import { withApiSecurity } from '@/lib/server/with-api-security';

async function _POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const property = await prisma.property.findFirst({
      where: { userId: session.user.id },
      include: { rooms: true },
    });

    if (!property) {
      return NextResponse.json({ error: 'Propriedade não encontrada' }, { status: 404 });
    }

    const body = await req.json();
    const { roomId, checkIn, checkOut, basePrice } = body;

    if (!checkIn || !checkOut) {
      return NextResponse.json(
        { error: 'Check-in e check-out são obrigatórios' },
        { status: 400 }
      );
    }

    const room = property.rooms.find(r => r.id === roomId);
    const totalRooms = property.rooms.length;
    const price = basePrice || room?.basePrice || 150;

    const input: DynamicPricingInput = {
      propertyId: property.id,
      roomId,
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      basePrice: price,
      totalRooms,
    };

    const result = await calculateDynamicPricing(input);

    // Log the pricing decision
    await prisma.revenuePricingLog.create({
      data: {
        propertyId: property.id,
        roomId,
        originalPrice: result.originalPrice,
        finalPrice: result.finalPrice,
        occupancyRate: result.occupancyRate,
        surgeMultiplier: result.surgeMultiplier,
        reason: result.reason,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        metadata: JSON.parse(JSON.stringify({
          breakdown: result.breakdown,
          nights: Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)),
          totalStay: result.totalStay,
          recommendedAction: result.recommendedAction,
        })),
      },
    });

    return NextResponse.json({
      pricing: result,
      roomName: room?.name || room?.number || 'Quarto',
    });
  } catch (error) {
    console.error('[API:REVENUE:PRICING] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export const POST = withApiSecurity(_POST, {
  rateLimit: { limit: 100, windowSeconds: 60 },
});
