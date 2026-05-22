import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId: userId, property, rooms, services, payment } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId (tenantId) é obrigatório' }, { status: 400 });
    }

    // Verify user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Create or update property
    // We use slug as a unique identifier, generating it from the name
    const slug = (property?.nome || user.name)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '') + '-' + userId.slice(-4);

    // Gerar Número de Registro Sequencial: 0001/PRO/SC
    const propertyCount = await prisma.property.count();
    const nextNumber = (propertyCount + 1).toString().padStart(4, '0');
    const plan = 'PRO'; // Default para onboarding conforme linha 45
    const uf = property?.estado || 'SC';
    const registrationNumber = `${nextNumber}/${plan}/${uf}`;

    const prop = await prisma.property.create({
      data: {
        userId,
        registrationNumber,
        name: property?.nome || user.name,
        slug,
        description: property?.descricao || '',
        address: `${property?.rua || ''}, ${property?.numero || ''} ${property?.bairro || ''}`,
        city: property?.cidade || 'Imbituba',
        state: property?.estado || 'SC',
        zipCode: property?.cep || '',
        capacity: property?.capacidade || 10,
        phone: user.phone,
        whatsapp: user.phone,
        website: property?.site || '',
        pixKey: payment?.pixKey || '',
        pixKeyType: (payment?.pixKeyType?.toUpperCase() as any) || 'CPF',
        status: 'ACTIVE',
        plan: 'PRO',
        isTrial: true,
        trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        utmSource: body.utm?.utm_source || null,
        utmMedium: body.utm?.utm_medium || null,
        utmCampaign: body.utm?.utm_campaign || null,
        utmTerm: body.utm?.utm_term || null,
        utmContent: body.utm?.utm_content || null,
        refSource: body.utm?.ref || null,
      },
    });

    // Create rooms
    if (rooms && rooms.length > 0) {
      await prisma.room.createMany({
        data: rooms.map((room: any) => ({
          propertyId: prop.id,
          number: String(room.nome || room.number || '101'),
          type: (room.tipo?.toUpperCase() as any) || 'STANDARD',
          pricingType: (room.pricingType?.toUpperCase() as any) || 'PER_ROOM',
          capacity: Number(room.capacidade || room.capacity || 2),
          basePrice: Number(room.preco || room.price || 150),
          status: 'AVAILABLE',
        })),
      });
    }

    // Create services
    if (services?.selected && services.selected.length > 0) {
      await prisma.service.createMany({
        data: services.selected.map((serviceName: string) => ({
          propertyId: prop.id,
          name: serviceName,
          isIncluded: true,
        })),
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Onboarding completo! ZEHLA está configurado.',
      data: {
        propertyId: prop.id,
        slug: prop.slug,
        roomsCount: rooms?.length || 0,
      },
    });
  } catch (error) {
    console.error('[ONBOARDING] Error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
