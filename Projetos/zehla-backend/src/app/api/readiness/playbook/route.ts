import { NextRequest, NextResponse } from 'next/server';
import { withApiSecurity } from '@/lib/server/with-api-security';
import { authenticateRequest } from '@/infrastructure/http/auth/jwtAuth';
import { prisma } from '@/lib/prisma';

async function _GET(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if (auth.isFail) {
      return NextResponse.json({ error: auth.error.message }, { status: 401 });
    }

    const propertyId = auth.value.pousadaId;
    if (!propertyId) {
      return NextResponse.json({ error: 'ID da pousada inválido no token de autenticação' }, { status: 400 });
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { configJson: true }
    });

    const config = property?.configJson ? (property.configJson as Record<string, any>) : {};

    return NextResponse.json({
      playbookUrl: config.playbookUrl || null,
      playbookGeneratedAt: config.playbookGeneratedAt || null,
      readinessScore: config.readinessScore || null,
      lgpdRisk: config.lgpdRisk || null,
    }, { status: 200 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export const GET = withApiSecurity(_GET, { rateLimit: { limit: 60, windowSeconds: 60 } });
