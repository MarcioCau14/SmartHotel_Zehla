import { NextRequest, NextResponse } from 'next/server';
import { db, isDatabaseAvailable } from '@/lib/db';
import { resolveTenantId } from '@/lib/ddc/auth-utils';

const demoProperties = [
  {
    id: 'demo-airb-1',
    tenantId: 'demo',
    name: 'Apartamento Vista Mar - Jurerê Internacional',
    airbnbId: '18584298',
    airbnbUrl: 'https://www.airbnb.com.br/rooms/18584298',
    city: 'Florianópolis',
    state: 'SC',
    neighborhood: 'Jurerê Internacional',
    description: 'Apartamento com vista panorâmica para o mar em Jurerê Internacional.',
    propertyType: 'apartment',
    bedrooms: 2,
    bathrooms: 1,
    maxGuests: 4,
    pricePerNight: 350,
    checkinTime: '15:00',
    checkoutTime: '11:00',
    wifiName: 'VistaMar_WiFi',
    wifiPassword: 'praia2024',
    lockProvider: 'smart',
    lockCode: '4821',
    scrapingSource: 'demo',
    scrapedAt: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    _count: { conversations: 3 },
  },
  {
    id: 'demo-airb-2',
    tenantId: 'demo',
    name: 'Studio Moderno - Copacabana',
    airbnbId: '9283741',
    airbnbUrl: 'https://www.airbnb.com.br/rooms/9283741',
    city: 'Rio de Janeiro',
    state: 'RJ',
    neighborhood: 'Copacabana',
    description: 'Studio moderno a 2 quadras da praia de Copacabana. Perfeito para casais.',
    propertyType: 'studio',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    pricePerNight: 220,
    checkinTime: '14:00',
    checkoutTime: '10:00',
    wifiName: 'StudioCopacabana',
    wifiPassword: 'rio2024',
    lockProvider: 'nuki',
    lockCode: '1593',
    scrapingSource: 'demo',
    scrapedAt: new Date(Date.now() - 172800000).toISOString(),
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
    _count: { conversations: 1 },
  },
  {
    id: 'demo-airb-3',
    tenantId: 'demo',
    name: 'Casa com Piscina - Campos do Jordão',
    airbnbId: '51928403',
    airbnbUrl: 'https://www.airbnb.com.br/rooms/51928403',
    city: 'Campos do Jordão',
    state: 'SP',
    neighborhood: 'Alto do Capivari',
    description: 'Casa aconchegante com lareira e piscina aquecida. Ideal para famílias.',
    propertyType: 'house',
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6,
    pricePerNight: 580,
    checkinTime: '16:00',
    checkoutTime: '12:00',
    wifiName: 'CasaPiscina_WiFi',
    wifiPassword: 'campos2024',
    lockProvider: 'august',
    lockCode: '7720',
    scrapingSource: 'demo',
    scrapedAt: new Date(Date.now() - 259200000).toISOString(),
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: new Date(Date.now() - 259200000).toISOString(),
    _count: { conversations: 2 },
  },
];

// GET /api/ddc/airb/properties — List all Airbnb properties for tenant
export async function GET() {
  try {
    const dbAvailable = await isDatabaseAvailable();
    if (!dbAvailable) {
      return NextResponse.json({ success: true, data: demoProperties });
    }

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
    const dbAvailable = await isDatabaseAvailable();
    if (!dbAvailable) {
      return NextResponse.json({ success: false, error: 'Banco de dados indisponível' }, { status: 503 });
    }

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
    const dbAvailable = await isDatabaseAvailable();
    if (!dbAvailable) {
      return NextResponse.json({ success: false, error: 'Banco de dados indisponível' }, { status: 503 });
    }

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
