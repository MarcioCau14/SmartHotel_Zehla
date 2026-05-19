import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

import { withApiSecurity } from '@/lib/server/with-api-security';

async function _GET(
  _req: NextRequest,
  context: { params: Promise<Record<string, string>> }
) {
  try {
    const { id } = await context.params;

    const contact = await prisma.crmContact.findFirst({
      where: { id, deletedAt: null },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        interactions: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: {
            user: { select: { id: true, name: true } },
          },
        },
        deals: {
          include: {
            pipeline: { select: { id: true, name: true } },
            owner: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        tasks: {
          orderBy: { createdAt: 'desc' },
          include: {
            assignedTo: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    return NextResponse.json({ contact });
  } catch (error) {
    console.error('[CRM] GET contact error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const GET = withApiSecurity(_GET, { rateLimit: { limit: 100, windowSeconds: 60 } });

async function _PUT(
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { name, email, phone, whatsapp, instagram, facebook, tags, customFields, source, ownerId, assignedToId } = body;

    const existing = await prisma.crmContact.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    const contact = await prisma.crmContact.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(whatsapp !== undefined && { whatsapp }),
        ...(instagram !== undefined && { instagram }),
        ...(facebook !== undefined && { facebook }),
        ...(tags !== undefined && { tags }),
        ...(customFields !== undefined && { customFields }),
        ...(source !== undefined && { source }),
        ...(ownerId !== undefined && { ownerId }),
        ...(assignedToId !== undefined && { assignedToId }),
      },
    });

    return NextResponse.json({ contact });
  } catch (error) {
    console.error('[CRM] PUT contact error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const PUT = withApiSecurity(_PUT, { rateLimit: { limit: 50, windowSeconds: 60 } });

async function _DELETE(
  _req: NextRequest,
  context: { params: Promise<Record<string, string>> }
) {
  try {
    const { id } = await context.params;

    const existing = await prisma.crmContact.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    await prisma.crmContact.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CRM] DELETE contact error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const DELETE = withApiSecurity(_DELETE, { rateLimit: { limit: 30, windowSeconds: 60 } });
