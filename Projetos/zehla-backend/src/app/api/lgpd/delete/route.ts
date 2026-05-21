import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { logPiiAudit } from '@/lib/security/lgpd-audit';
import { withApiSecurity } from '@/lib/server/with-api-security';

async function _POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { email, phone, action } = body;

    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Email ou telefone é obrigatório' },
        { status: 400 }
      );
    }

    if (!['anonymize', 'delete'].includes(action)) {
      return NextResponse.json(
        { error: 'Ação deve ser "anonymize" ou "delete"' },
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

    const whereClause = {
      propertyId: property.id,
      OR: [
        email ? { guestEmail: email } : {},
        phone ? { guestPhone: phone } : {},
      ].filter(Boolean),
    };

    let result: { anonymized: number } | { deleted: number };

    if (action === 'anonymize') {
      const anonymizedName = 'Hóspede Anonimizado';
      const anonymizedEmail = `anon_${Date.now()}@zehla.local`;

      const updateResult = await prisma.reservation.updateMany({
        where: whereClause,
        data: {
          guestName: anonymizedName,
          guestEmail: anonymizedEmail,
          guestPhone: null,
          guestCpf: null,
        },
      });

      result = { anonymized: updateResult.count };

      await logPiiAudit({
        userId: session.user.id,
        tenantId: property.id,
        action: 'PII_ANONYMIZE',
        resource: 'guest_data_anonymization',
        piiFields: ['guestName', 'guestEmail', 'guestPhone', 'guestCpf'],
        ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || undefined,
        userAgent: req.headers.get('user-agent') || undefined,
        metadata: {
          searchEmail: email,
          searchPhone: phone,
          anonymizedCount: updateResult.count,
        },
      });
    } else {
      const deleteResult = await prisma.reservation.deleteMany({
        where: whereClause,
      });

      result = { deleted: deleteResult.count };

      await logPiiAudit({
        userId: session.user.id,
        tenantId: property.id,
        action: 'DATA_DELETION',
        resource: 'guest_data_deletion',
        piiFields: ['guestName', 'guestEmail', 'guestPhone', 'guestCpf'],
        ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || undefined,
        userAgent: req.headers.get('user-agent') || undefined,
        metadata: {
          searchEmail: email,
          searchPhone: phone,
          deletedCount: deleteResult.count,
        },
      });
    }

    return NextResponse.json({
      success: true,
      action,
      ...result,
      processedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[LGPD_DELETE_ERROR]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export const POST = withApiSecurity(_POST, {
  rateLimit: { limit: 5, windowSeconds: 300 },
  audit: { resource: 'lgpd_delete', piiFields: ['guestName', 'guestEmail', 'guestPhone', 'guestCpf'] },
});
