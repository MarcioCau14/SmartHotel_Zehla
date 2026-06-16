import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

import { withApiSecurity } from '@/lib/server/with-api-security';

async function _GET(
  _req: NextRequest,
  context?: { params: Promise<Record<string, string>> }
) {
  try {
  const { id } = await context!.params;

    const contact = await prisma.crmContact.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    const interactions = await prisma.crmInteraction.findMany({
      where: { contactId: id },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ interactions });
  } catch (error) {
    console.error('[CRM] GET interactions error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const GET = withApiSecurity(_GET, { rateLimit: { limit: 100, windowSeconds: 60 } });

async function _POST(
  req: NextRequest,
  context?: { params: Promise<Record<string, string>> }
) {
  try {
  const { id } = await context!.params;
    const body = await req.json();
    const { type, content, metadata } = body;

    if (!type || !content) {
      return NextResponse.json({ error: 'Type and content are required' }, { status: 400 });
    }

    const validTypes = ['NOTE', 'CALL', 'EMAIL', 'WHATSAPP', 'MEETING'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const contact = await prisma.crmContact.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, propertyId: true },
    });

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    const interaction = await prisma.crmInteraction.create({
      data: {
        type,
        content,
        metadata: metadata || null,
        contactId: id,
        propertyId: contact.propertyId,
      },
    });

    await prisma.crmContact.update({
      where: { id },
      data: { lastContactedAt: new Date() },
    });

    return NextResponse.json({ interaction }, { status: 201 });
  } catch (error) {
    console.error('[CRM] POST interaction error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const POST = withApiSecurity(_POST, { rateLimit: { limit: 50, windowSeconds: 60 } });
