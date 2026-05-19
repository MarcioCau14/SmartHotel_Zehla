import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

import { withApiSecurity } from '@/lib/server/with-api-security';

async function _PATCH(
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { title, description, dueDate, completed, priority, type, assignedToId } = body;

    const existing = await prisma.crmTask.findFirst({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const task = await prisma.crmTask.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(completed !== undefined && { completed }),
        ...(priority !== undefined && { priority }),
        ...(type !== undefined && { type }),
        ...(assignedToId !== undefined && { assignedToId }),
      },
      include: {
        assignedTo: { select: { id: true, name: true } },
        contact: { select: { id: true, name: true } },
        deal: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json({ task });
  } catch (error) {
    console.error('[CRM] PATCH task error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const PATCH = withApiSecurity(_PATCH, { rateLimit: { limit: 60, windowSeconds: 60 } });

async function _DELETE(
  _req: NextRequest,
  context: { params: Promise<Record<string, string>> }
) {
  try {
    const { id } = await context.params;

    const existing = await prisma.crmTask.findFirst({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    await prisma.crmTask.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CRM] DELETE task error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const DELETE = withApiSecurity(_DELETE, { rateLimit: { limit: 30, windowSeconds: 60 } });
