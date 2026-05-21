import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withPublicApiAuth, ApiKeyContext } from '@/lib/security/api-key-validator';
import { dispatchWebhook } from '@/lib/marketplace/DispatchPublicWebhookUseCase';

/**
 * API Pública — Reservas
 * 
 * GET /api/public/v1/reservations — Lista reservas
 * POST /api/public/v1/reservations — Cria nova reserva
 * 
 * Autenticação: Bearer token via header Authorization
 * Rate limiting: Configurado por API key
 */

export const GET = withPublicApiAuth(
  async (req: NextRequest, context: ApiKeyContext) => {
    try {
      const { searchParams } = new URL(req.url);
      const status = searchParams.get('status');
      const roomId = searchParams.get('roomId');
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');
      const checkInFrom = searchParams.get('checkInFrom');
      const checkInTo = searchParams.get('checkInTo');

      const where: any = { propertyId: context.propertyId };

      if (status) where.status = status;
      if (roomId) where.roomId = roomId;
      if (checkInFrom || checkInTo) {
        where.checkIn = {};
        if (checkInFrom) where.checkIn.gte = new Date(checkInFrom);
        if (checkInTo) where.checkIn.lte = new Date(checkInTo);
      }

      const [reservations, total] = await Promise.all([
        prisma.reservation.findMany({
          where,
          include: { room: { select: { number: true, name: true, type: true } } },
          orderBy: { checkIn: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.reservation.count({ where }),
      ]);

      return NextResponse.json({
        reservations: reservations.map(r => ({
          id: r.id,
          code: r.code,
          guestName: r.guestName,
          guestEmail: r.guestEmail,
          guestPhone: r.guestPhone,
          guestCount: r.guestCount,
          checkIn: r.checkIn,
          checkOut: r.checkOut,
          nights: r.nights,
          roomPrice: r.roomPrice,
          totalAmount: r.totalAmount,
          status: r.status,
          source: r.source,
          room: r.room,
          createdAt: r.createdAt,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });

    } catch (error) {
      console.error('❌ [API PÚBLICA] Erro ao listar reservas:', error);
      return NextResponse.json({ error: 'Erro interno ao listar reservas' }, { status: 500 });
    }
  },
  'read'
);

export const POST = withPublicApiAuth(
  async (req: NextRequest, context: ApiKeyContext) => {
    try {
      const body = await req.json();
      const { roomId, guestName, guestEmail, guestPhone, guestCount, checkIn, checkOut, totalAmount, notes } = body;

      if (!roomId || !guestName || !checkIn || !checkOut) {
        return NextResponse.json(
          { error: 'roomId, guestName, checkIn e checkOut são obrigatórios' },
          { status: 400 }
        );
      }

      // Verificar se o quarto existe e pertence à propriedade
      const room = await prisma.room.findFirst({
        where: { id: roomId, propertyId: context.propertyId },
      });

      if (!room) {
        return NextResponse.json({ error: 'Quarto não encontrado ou não pertence a esta propriedade' }, { status: 404 });
      }

      // Calcular noites
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

      if (nights <= 0) {
        return NextResponse.json({ error: 'checkOut deve ser posterior a checkIn' }, { status: 400 });
      }

      // Gerar código único
      const code = `API-${Date.now().toString(36).toUpperCase()}`;

      // Criar reserva
      const reservation = await prisma.reservation.create({
        data: {
          code,
          guestName,
          guestEmail: guestEmail || null,
          guestPhone: guestPhone || '',
          guestCount: guestCount || 1,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          nights,
          roomPrice: totalAmount ? totalAmount / nights : room.basePrice,
          totalAmount: totalAmount || room.basePrice * nights,
          status: 'CONFIRMED',
          checkInStatus: 'PENDING',
          source: 'API',
          notes: notes || `Criado via API Pública — ${context.name}`,
          roomId,
          propertyId: context.propertyId,
        },
      });

      console.log(`✅ [API PÚBLICA] Reserva criada: ${code} para ${guestName}`);

      // Despachar webhook para assinantes
      dispatchWebhook(context.propertyId, 'reservation.created', {
        id: reservation.id,
        code: reservation.code,
        guestName: reservation.guestName,
        checkIn: reservation.checkIn,
        checkOut: reservation.checkOut,
        roomId,
        roomNumber: room.number,
        totalAmount: reservation.totalAmount,
        source: 'API',
      }).catch(err => console.error('❌ [API PÚBLICA] Falha ao despachar webhook:', err));

      return NextResponse.json({
        success: true,
        reservation: {
          id: reservation.id,
          code: reservation.code,
          guestName: reservation.guestName,
          checkIn: reservation.checkIn,
          checkOut: reservation.checkOut,
          nights: reservation.nights,
          totalAmount: reservation.totalAmount,
          status: reservation.status,
          room: { id: room.id, number: room.number, name: room.name },
        },
      }, { status: 201 });

    } catch (error) {
      console.error('❌ [API PÚBLICA] Erro ao criar reserva:', error);
      return NextResponse.json({ error: 'Erro interno ao criar reserva' }, { status: 500 });
    }
  },
  'write'
);
