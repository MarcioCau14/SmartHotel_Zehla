import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

import { withApiSecurity } from '@/lib/server/with-api-security';

async function _GET(req: NextRequest) {
  try {
  const { searchParams } = new URL(req.url);
    const completed = searchParams.get('completed');
    const assignedToId = searchParams.get('assignedToId');
    const contactId = searchParams.get('contactId');
    const dealId = searchParams.get('dealId');
    const priority = searchParams.get('priority');
    const type = searchParams.get('type');
    const dueDateFrom = searchParams.get('dueDateFrom');
    const dueDateTo = searchParams.get('dueDateTo');

    const where: any = {};

    if (completed === 'true') where.completed = true;
    else if (completed === 'false') where.completed = false;

    if (assignedToId) where.assignedToId = assignedToId;
    if (contactId) where.contactId = contactId;
    if (dealId) where.dealId = dealId;
    if (priority) where.priority = priority;
    if (type) where.type = type;

    if (dueDateFrom || dueDateTo) {
      where.dueDate = {};
      if (dueDateFrom) where.dueDate.gte = new Date(dueDateFrom);
      if (dueDateTo) where.dueDate.lte = new Date(dueDateTo);
    }

    const tasks = await prisma.crmTask.findMany({
      where,
      orderBy: [
        { completed: 'asc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        contact: { select: { id: true, name: true } },
        deal: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('[CRM] GET tasks error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const GET = withApiSecurity(_GET, { rateLimit: { limit: 100, windowSeconds: 60 } });

async function _POST(req: NextRequest) {
  try {
  const body = await req.json();
    const { title, description, dueDate, priority, type, contactId, dealId, assignedToId } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const property = await prisma.property.findFirst();
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    const task = await prisma.crmTask.create({
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || 'MEDIUM',
        type: type || 'OTHER',
        contactId,
        dealId,
        assignedToId,
        propertyId: property.id,
      },
      include: {
        assignedTo: { select: { id: true, name: true } },
        contact: { select: { id: true, name: true } },
        deal: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('[CRM] POST task error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const POST = withApiSecurity(_POST, { rateLimit: { limit: 50, windowSeconds: 60 } });
