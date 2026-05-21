import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

import { withApiSecurity } from '@/lib/server/with-api-security';
import { logPiiAudit, extractPiiFields } from '@/lib/security/lgpd-audit';
import { clearTenantCache } from '@/lib/brain/mirofish-cache';

async function _POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const property = await prisma.property.findFirst({
      where: { userId: session.user.id },
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Nenhuma propriedade encontrada' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const piiFields = extractPiiFields(body);

    const profile = await prisma.connectProfile.upsert({
      where: { propertyId: property.id },
      create: {
        slug: body.slug,
        bio: body.bio || '',
        avatarUrl: body.avatarUrl,
        coverUrl: body.coverUrl,
        whatsappNumber: body.whatsappNumber,
        status: body.status || 'draft',
        seoTitle: body.seoTitle,
        seoDescription: body.seoDescription,
        propertyId: property.id,
      },
      update: {
        slug: body.slug,
        bio: body.bio,
        avatarUrl: body.avatarUrl,
        coverUrl: body.coverUrl,
        whatsappNumber: body.whatsappNumber,
        status: body.status,
        seoTitle: body.seoTitle,
        seoDescription: body.seoDescription,
        publishedAt: body.status === 'published' ? new Date() : undefined,
      },
    });

    if (piiFields.length > 0) {
      await logPiiAudit({
        userId: session.user.id,
        tenantId: property.id,
        action: 'PII_UPDATE',
        resource: 'connect_profile',
        resourceId: profile.id,
        piiFields,
        ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || undefined,
        userAgent: req.headers.get('user-agent') || undefined,
      });
    }

    // Invalidate MiroFish cache when settings change
    await clearTenantCache(property.id);

    return NextResponse.json(profile);
  } catch (error) {
    console.error('[API:CONNECT:PROFILE] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export const POST = withApiSecurity(_POST, {
  rateLimit: { limit: 30, windowSeconds: 60 },
});
