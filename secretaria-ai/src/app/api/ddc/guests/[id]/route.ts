import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mapGuest } from '@/lib/ddc/ddc-mapper';

interface RouteContext { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const guest = await db.guest.findUnique({ where: { id } });
    if (!guest) return NextResponse.json({ success: false, error: { code: '404', message: 'Guest not found' } }, { status: 404 });
    return NextResponse.json({ success: true, data: mapGuest(guest) });
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: '500', message: 'Failed to fetch guest' } }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const existing = await db.guest.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, error: { code: '404', message: 'Guest not found' } }, { status: 404 });

    const updateData: any = {};
    if (body.name) updateData.name = body.name;
    if (body.phoneNumber) updateData.phone = body.phoneNumber;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.status) updateData.status = body.status === 'cold' ? 'new' : body.status === 'closed' ? 'booked' : body.status;
    if (body.score !== undefined) updateData.aiScore = body.score;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.value !== undefined) updateData.value = body.value;

    const updated = await db.guest.update({ where: { id }, data: updateData });
    return NextResponse.json({ success: true, data: mapGuest(updated) });
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: '500', message: 'Failed to update guest' } }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    await db.guest.delete({ where: { id } });
    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: '500', message: 'Failed to delete guest' } }, { status: 500 });
  }
}
