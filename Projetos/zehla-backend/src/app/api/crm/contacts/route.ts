import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

import { withApiSecurity } from '@/lib/server/with-api-security';

async function _GET(req: NextRequest) {
  try {
  const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const source = searchParams.get('source');
    const ownerId = searchParams.get('ownerId');
    const tag = searchParams.get('tag');
    const deleted = searchParams.get('deleted') === 'true';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));

    const where: any = {};

    if (!deleted) {
      where.deletedAt = null;
    }

    if (source) {
      where.source = source;
    }

    if (ownerId) {
      where.ownerId = ownerId;
    }

    if (tag) {
      where.tags = { array_contains: tag };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { whatsapp: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [contacts, total] = await Promise.all([
      prisma.crmContact.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          owner: { select: { id: true, name: true, email: true } },
          assignedTo: { select: { id: true, name: true, email: true } },
          _count: { select: { interactions: true, deals: true, tasks: true } },
        },
      }),
      prisma.crmContact.count({ where }),
    ]);

    return NextResponse.json({
      contacts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[CRM] GET contacts error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const GET = withApiSecurity(_GET, { rateLimit: { limit: 100, windowSeconds: 60 } });

async function _POST(req: NextRequest) {
  try {
  const body = await req.json();
    const { name, email, phone, whatsapp, instagram, facebook, tags, customFields, source, ownerId, assignedToId } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const propertyId = body.propertyId || (await prisma.property.findFirst().then(p => p?.id));
    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
    }

    const contact = await prisma.crmContact.create({
      data: {
        name,
        email,
        phone,
        whatsapp,
        instagram,
        facebook,
        tags: tags || [],
        customFields: customFields || {},
        source: source || 'MANUAL',
        ownerId,
        assignedToId,
        propertyId,
      },
    });

    return NextResponse.json({ contact }, { status: 201 });
  } catch (error) {
    console.error('[CRM] POST contact error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const POST = withApiSecurity(_POST, { rateLimit: { limit: 50, windowSeconds: 60 } });
