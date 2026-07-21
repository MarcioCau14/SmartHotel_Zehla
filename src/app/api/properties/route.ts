// =============================================================================
// API — Properties CRUD
// =============================================================================
// GET  /api/properties    — Lista propriedades do tenant
// POST /api/properties    — Cria nova propriedade
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { canAddProperty, getMaxProperties } from '@/lib/features';

// Demo tenant ID (in production, this would come from auth)
const DEMO_TENANT_ID = 'demo';

async function getTenantId(request: NextRequest): Promise<string | null> {
  // TODO: In production, extract from auth session
  // For now, find the first tenant
  const tenant = await db.tenant.findFirst({ where: { isActive: true } });
  return tenant?.id ?? null;
}

export async function GET(request: NextRequest) {
  try {
    const tenantId = await getTenantId(request);
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    const properties = await db.airBProperty.findMany({
      where: { tenantId, isActive: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        airbnbId: true,
        listingUrl: true,
        name: true,
        propertyType: true,
        accommodates: true,
        bedrooms: true,
        beds: true,
        bathrooms: true,
        neighborhood: true,
        city: true,
        state: true,
        rating: true,
        reviewCount: true,
        basePrice: true,
        currency: true,
        amenities: true,
        photoCount: true,
        highlights: true,
        aiSummary: true,
        scrapingStatus: true,
        lastScrapedAt: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Get tenant info for feature gating
    const tenant = await db.tenant.findUnique({
      where: { id: tenantId },
      include: { plan: true },
    });

    const currentCount = properties.length;
    const maxCount = tenant ? getMaxProperties(tenant.planSlug) : 0;

    return NextResponse.json({
      properties,
      count: currentCount,
      maxProperties: maxCount,
      canAddMore: tenant ? canAddProperty(tenant.planSlug, currentCount) : false,
    });
  } catch (error) {
    console.error('[api/properties] GET Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = await getTenantId(request);
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    const body = await request.json();
    const tenant = await db.tenant.findUnique({
      where: { id: tenantId },
      include: { plan: true },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Check property limit
    const currentCount = await db.airBProperty.count({
      where: { tenantId, isActive: true },
    });

    if (!canAddProperty(tenant.planSlug, currentCount)) {
      return NextResponse.json(
        { error: `Limite de ${getMaxProperties(tenant.planSlug)} imóveis atingido para o plano ${tenant.planSlug.toUpperCase()}. Considere fazer upgrade.` },
        { status: 403 }
      );
    }

    const {
      // From scraping (Camada 1 + 2)
      airbnbId,
      listingUrl,
      name,
      description,
      propertyType,
      accommodates,
      bedrooms,
      beds,
      bathrooms,
      neighborhood,
      city,
      state,
      country,
      fullAddress,
      latitude,
      longitude,
      rating,
      reviewCount,
      basePrice,
      currency,
      amenities,
      photos,
      photoCount,
      houseRules,
      checkInTime,
      checkOutTime,
      hostName,
      hostIsSuperhost,
      hostResponseRate,
      hostResponseTime,
      aiSummary,
      highlights,
      targetAudience,
      sellingPoints,
      localTipsFromReviews,
      reviewSentiment,
      keywords,
      // From host (Camada 3)
      wifiName,
      wifiPassword,
      lockboxCode,
      lockboxLocation,
      accessInstructions,
      emergencyContact,
      maintenanceContact,
      parkingSpot,
      personalLocalTips,
      favoriteRestaurants,
      supermarketLocation,
      additionalRules,
      quietHoursStart,
      quietHoursEnd,
      customCheckInInstructions,
      customCheckOutInstructions,
      internalNotes,
    } = body;

    if (!airbnbId || !name) {
      return NextResponse.json(
        { error: 'Campos "airbnbId" e "name" são obrigatórios.' },
        { status: 400 }
      );
    }

    // Check for duplicate
    const existing = await db.airBProperty.findUnique({
      where: { tenantId_airbnbId: { tenantId, airbnbId: String(airbnbId) } },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Imóvel com código ${airbnbId} já está cadastrado.` },
        { status: 409 }
      );
    }

    const property = await db.airBProperty.create({
      data: {
        tenantId,
        airbnbId: String(airbnbId),
        listingUrl,
        name,
        description,
        propertyType,
        accommodates: accommodates ? Number(accommodates) : null,
        bedrooms: bedrooms ? Number(bedrooms) : null,
        beds: beds ? Number(beds) : null,
        bathrooms: bathrooms ? Number(bathrooms) : null,
        neighborhood,
        city,
        state,
        country,
        fullAddress,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        rating: rating ? Number(rating) : null,
        reviewCount: reviewCount ? Number(reviewCount) : null,
        basePrice: basePrice ? Number(basePrice) : null,
        currency: currency || 'BRL',
        amenities: amenities ? (typeof amenities === 'string' ? amenities : JSON.stringify(amenities)) : null,
        photos: photos ? (typeof photos === 'string' ? photos : JSON.stringify(photos)) : null,
        photoCount: photoCount ? Number(photoCount) : null,
        houseRules,
        checkInTime,
        checkOutTime,
        hostName,
        hostIsSuperhost: hostIsSuperhost ?? false,
        hostResponseRate: hostResponseRate ? Number(hostResponseRate) : null,
        hostResponseTime,
        aiSummary,
        highlights: highlights ? (typeof highlights === 'string' ? highlights : JSON.stringify(highlights)) : null,
        targetAudience: targetAudience ? (typeof targetAudience === 'string' ? targetAudience : JSON.stringify(targetAudience)) : null,
        sellingPoints: sellingPoints ? (typeof sellingPoints === 'string' ? sellingPoints : JSON.stringify(sellingPoints)) : null,
        localTipsFromReviews: localTipsFromReviews ? (typeof localTipsFromReviews === 'string' ? localTipsFromReviews : JSON.stringify(localTipsFromReviews)) : null,
        reviewSentiment,
        keywords: keywords ? (typeof keywords === 'string' ? keywords : JSON.stringify(keywords)) : null,
        wifiName,
        wifiPassword,
        lockboxCode,
        lockboxLocation,
        accessInstructions,
        emergencyContact,
        maintenanceContact,
        parkingSpot,
        personalLocalTips,
        favoriteRestaurants,
        supermarketLocation,
        additionalRules,
        quietHoursStart,
        quietHoursEnd,
        customCheckInInstructions,
        customCheckOutInstructions,
        internalNotes,
        scrapingStatus: body.scrapingStatus || 'complete',
        lastScrapedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, property }, { status: 201 });
  } catch (error) {
    console.error('[api/properties] POST Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
