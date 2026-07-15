import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { resolveTenantId } from '@/lib/ddc/auth-utils';

// GET /api/ddc/airb/properties — List all Airbnb properties for tenant
export async function GET() {
  try {
    const tenantId = await resolveTenantId();
    if (!tenantId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const properties = await db.airBProperty.findMany({
      where: { tenantId },
      include: { _count: { select: { conversations: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: properties });
  } catch (error) {
    console.error('[AIRB] Error listing properties:', error);
    return NextResponse.json({ success: false, error: 'Failed to list properties' }, { status: 500 });
  }
}

// POST /api/ddc/airb/properties — Create new Airbnb property
export async function POST(request: NextRequest) {
  try {
    const tenantId = await resolveTenantId();
    if (!tenantId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, airbnbId, airbnbUrl, city, state, propertyType, bedrooms, bathrooms, maxGuests,
            checkinTime, checkoutTime, wifiName, wifiPassword, lockProvider, lockCode, pricePerNight,
            neighborhood, description } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Property name is required' }, { status: 400 });
    }

    // Check plan limits
    const tenant = await db.tenant.findUnique({
      where: { id: tenantId },
      include: { _count: { select: { airbProperties: true } } },
    });

    const currentPlan = tenant?.plan || 'trial';
    const maxProps = currentPlan === 'max' ? 12 : currentPlan === 'pro' || currentPlan === 'business' ? 4 : 0;

    if (tenant && tenant._count.airbProperties >= maxProps && maxProps > 0) {
      return NextResponse.json({
        success: false,
        error: `Limite de ${maxProps} imóveis atingido para o plano ${currentPlan.toUpperCase()}. Faça upgrade para adicionar mais.`,
      }, { status: 403 });
    }

    if (maxProps === 0 && currentPlan !== 'pro' && currentPlan !== 'max' && currentPlan !== 'business') {
      // For trial/lite plans, still allow creation for demo purposes
    }

    const property = await db.airBProperty.create({
      data: {
        tenantId,
        name: name.trim(),
        airbnbId: airbnbId || null,
        airbnbUrl: airbnbUrl || null,
        city: city || '',
        state: state || '',
        neighborhood: neighborhood || '',
        description: description || '',
        propertyType: propertyType || 'apartment',
        bedrooms: bedrooms || 1,
        bathrooms: bathrooms || 1,
        maxGuests: maxGuests || 2,
        checkinTime: checkinTime || '15:00',
        checkoutTime: checkoutTime || '11:00',
        wifiName: wifiName || null,
        wifiPassword: wifiPassword || null,
        lockProvider: lockProvider || null,
        lockCode: lockCode || null,
        pricePerNight: pricePerNight || null,
        scrapingSource: airbnbId ? 'magic_onboarding' : 'manual',
        scrapedAt: airbnbId ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true, data: property }, { status: 201 });
  } catch (error) {
    console.error('[AIRB] Error creating property:', error);
    return NextResponse.json({ success: false, error: 'Failed to create property' }, { status: 500 });
  }
}

// DELETE /api/ddc/airb/properties?id=xxx — Delete a property
export async function DELETE(request: NextRequest) {
  try {
    const tenantId = await resolveTenantId();
    if (!tenantId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Property ID is required' }, { status: 400 });
    }

    // Verify ownership
    const property = await db.airBProperty.findFirst({
      where: { id, tenantId },
    });

    if (!property) {
      return NextResponse.json({ success: false, error: 'Property not found' }, { status: 404 });
    }

    await db.airBProperty.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[AIRB] Error deleting property:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete property' }, { status: 500 });
  }
}
