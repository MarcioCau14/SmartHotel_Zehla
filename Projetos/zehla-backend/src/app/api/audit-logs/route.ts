import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { withApiSecurity } from '@/lib/server/with-api-security';

async function _GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
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

    const logs = await prisma.auditLog.findMany({
      where: { tenantId: property.id },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('[API:AUDIT_LOGS] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export const GET = withApiSecurity(_GET, {
  rateLimit: { limit: 30, windowSeconds: 60 },
});
