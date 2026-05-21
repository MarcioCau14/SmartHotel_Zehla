import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { logPiiAudit } from '@/lib/security/lgpd-audit';
import { withApiSecurity } from '@/lib/server/with-api-security';

async function _GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const email = req.nextUrl.searchParams.get('email');
    const phone = req.nextUrl.searchParams.get('phone');

    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Email ou telefone é obrigatório' },
        { status: 400 }
      );
    }

    const property = await prisma.property.findFirst({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Nenhuma propriedade encontrada' },
        { status: 404 }
      );
    }

    const reservations = await prisma.reservation.findMany({
      where: {
        propertyId: property.id,
        OR: [
          email ? { guestEmail: email } : {},
          phone ? { guestPhone: phone } : {},
        ].filter(Boolean),
      },
      select: {
        id: true,
        code: true,
        guestName: true,
        guestEmail: true,
        guestPhone: true,
        guestCpf: true,
        checkIn: true,
        checkOut: true,
        totalAmount: true,
        status: true,
        createdAt: true,
      },
    });

    const messages = await prisma.message.findMany({
      where: {
        propertyId: property.id,
        OR: [
          email ? { name: { contains: email } } : {},
          phone ? { phone } : {},
        ].filter(Boolean),
      },
      select: {
        id: true,
        phone: true,
        name: true,
        content: true,
        direction: true,
        createdAt: true,
      },
    });

    const piiFields = ['guestName', 'guestEmail', 'guestPhone', 'guestCpf'];

    await logPiiAudit({
      userId: session.user.id,
      tenantId: property.id,
      action: 'DATA_EXPORT',
      resource: 'guest_data_export',
      piiFields,
      ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || undefined,
      userAgent: req.headers.get('user-agent') || undefined,
      metadata: {
        searchEmail: email,
        searchPhone: phone,
        reservationCount: reservations.length,
        messageCount: messages.length,
      },
    });

    return NextResponse.json({
      guest: { email, phone },
      reservations,
      messages,
      exportedAt: new Date().toISOString(),
      requestedBy: session.user.id,
    });
  } catch (error) {
    console.error('[LGPD_EXPORT_ERROR]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export const GET = withApiSecurity(_GET, {
  rateLimit: { limit: 10, windowSeconds: 300 },
  audit: { resource: 'lgpd_export', piiFields: ['guestName', 'guestEmail', 'guestPhone', 'guestCpf'] },
});
