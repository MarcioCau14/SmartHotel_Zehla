import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withPublicApiAuth, ApiKeyContext } from '@/lib/security/api-key-validator';

/**
 * API Pública — Quartos
 * 
 * GET /api/public/v1/rooms — Lista quartos e status
 * 
 * Autenticação: Bearer token via header Authorization
 */

export const GET = withPublicApiAuth(
  async (req: NextRequest, context: ApiKeyContext) => {
    try {
      const { searchParams } = new URL(req.url);
      const status = searchParams.get('status');
      const type = searchParams.get('type');

      const where: any = { propertyId: context.propertyId };
      if (status) where.status = status;
      if (type) where.type = type;

      const rooms = await prisma.room.findMany({
        where,
        orderBy: [{ number: 'asc' }],
        select: {
          id: true,
          number: true,
          name: true,
          type: true,
          capacity: true,
          basePrice: true,
          status: true,
          amenities: true,
          description: true,
          images: true,
          _count: {
            select: { reservations: true },
          },
        },
      });

      return NextResponse.json({
        rooms: rooms.map(r => ({
          id: r.id,
          number: r.number,
          name: r.name,
          type: r.type,
          capacity: r.capacity,
          basePrice: r.basePrice,
          status: r.status,
          amenities: r.amenities,
          description: r.description,
          images: r.images,
          reservationCount: r._count.reservations,
        })),
        total: rooms.length,
      });

    } catch (error) {
      console.error('❌ [API PÚBLICA] Erro ao listar quartos:', error);
      return NextResponse.json({ error: 'Erro interno ao listar quartos' }, { status: 500 });
    }
  },
  'read'
);
