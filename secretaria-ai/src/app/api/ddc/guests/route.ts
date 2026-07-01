import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { resolveTenantId, mapGuest } from '@/lib/ddc/ddc-mapper';
import { apiRatelimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  try {
    const tenantId = await resolveTenantId();
    if (!tenantId || tenantId === 'client-001') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { success } = await apiRatelimit.limit(tenantId);
    if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const scoreMin = searchParams.get('scoreMin');
    const scoreMax = searchParams.get('scoreMax');
    const search = searchParams.get('search');

    const where: any = { tenantId };
    if (status) where.status = status;
    if (scoreMin) where.aiScore = { ...where.aiScore, gte: parseInt(scoreMin) };
    if (scoreMax) where.aiScore = { ...where.aiScore, lte: parseInt(scoreMax) };
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const guests = await db.guest.findMany({ where, orderBy: { lastContact: 'desc' } });
    return NextResponse.json({
      success: true,
      data: {
        items: guests.map(mapGuest),
        total: guests.length,
        page: 1,
        limit: guests.length,
        totalPages: 1,
      }
    });
  } catch (error) {
    console.error('[DDC guests] Prisma error:', error);
    return NextResponse.json({
      success: true,
      data: { items: [], total: 0, page: 1, limit: 0, totalPages: 0 }
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = await resolveTenantId();
    if (!tenantId || tenantId === 'client-001') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { success } = await apiRatelimit.limit(tenantId);
    if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const body = await request.json();
    if (!body.name || !body.phoneNumber) {
      return NextResponse.json({ success: false, error: { code: '400', message: 'Missing required fields: name and phoneNumber' } }, { status: 400 });
    }
    const guest = await db.guest.create({
      data: {
        tenantId,
        name: body.name,
        phone: body.phoneNumber,
        email: body.email,
        status: body.status === 'hot' || body.status === 'warm' ? body.status : 'cold',
        aiScore: body.score || 50,
        source: body.source || 'whatsapp',
        value: body.value || 0,
        notes: body.notes,
        checkIn: body.checkIn ? new Date(body.checkIn) : null,
        checkOut: body.checkOut ? new Date(body.checkOut) : null,
      }
    });
    return NextResponse.json({ success: true, data: mapGuest(guest) }, { status: 201 });
  } catch (error) {
    console.error('[DDC guests POST] Error:', error);
    return NextResponse.json({ success: false, error: { code: '500', message: 'Failed to create guest', details: error instanceof Error ? error.message : 'Unknown error' } }, { status: 500 });
  }
}
