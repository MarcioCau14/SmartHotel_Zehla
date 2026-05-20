import { NextRequest, NextResponse } from 'next/server';

import { db as prisma } from '@/lib/db';
import { parseSessionToken } from '@/lib/auth';


// POST: Complete onboarding - creates property, rooms, api configs
export async function POST(request: NextRequest) : void {
  try {
    const body = await request.json();
    const { tenantId, property, rooms, services, payment } = body;

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId é obrigatório' }, { status: 400 });
    }

    // Verify tenant exists
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant não encontrado' }, { status: 404 });
    }

    // Create or update property
    const prop = await prisma.property.upsert({
      where: { tenantId },
      create: {
        tenantId,
        name: property?.nome || tenant.name,
        document: property?.documento || '',
        street: property?.rua || '',
        number: property?.numero || '',
        neighborhood: property?.bairro || '',
        city: property?.cidade || '',
        state: property?.estado || '',
        zipCode: property?.cep || '',
        type: property?.tipo || 'pousada',
        website: property?.site || '',
        description: property?.descricao || '',
        services: JSON.stringify(services?.selected || []),
        paymentMethods: JSON.stringify(payment?.methods || ['pix']),
        pixKey: payment?.pixKey || '',
        pixKeyType: payment?.pixKeyType || 'cpf',
        bankName: payment?.bankName || '',
        bankAgency: payment?.bankAgency || '',
        bankAccount: payment?.bankAccount || '',
        bankAccountType: payment?.bankAccountType || '',
        bankCpf: payment?.bankCpf || '',
      },
      update: {
        name: property?.nome || tenant.name,
        document: property?.documento || '',
        street: property?.rua || '',
        number: property?.numero || '',
        neighborhood: property?.bairro || '',
        city: property?.cidade || '',
        state: property?.estado || '',
        zipCode: property?.cep || '',
        type: property?.tipo || 'pousada',
        website: property?.site || '',
        description: property?.descricao || '',
        services: JSON.stringify(services?.selected || []),
        paymentMethods: JSON.stringify(payment?.methods || ['pix']),
        pixKey: payment?.pixKey || '',
        pixKeyType: payment?.pixKeyType || 'cpf',
        bankName: payment?.bankName || '',
        bankAgency: payment?.bankAgency || '',
        bankAccount: payment?.bankAccount || '',
        bankAccountType: payment?.bankAccountType || '',
        bankCpf: payment?.bankCpf || '',
      },
    });

    // Create rooms
    if (rooms && rooms.length > 0) {
      await prisma.room.deleteMany({ where: { propertyId: prop.id } });
      await prisma.room.createMany({
        data: rooms.map((room: Record<string, unknown>) => ({
          propertyId: prop.id,
          name: String(room.nome || room.name || ''),
          type: String(room.tipo || room.type || 'standard'),
          capacity: Number(room.capacidade || room.capacity || 2),
          price: Number(room.preco || room.price || 150),
          status: 'disponivel',
        })),
      });
    }

    // Create default API configs (all inactive, ready for activation)
    const defaultProviders = [
      { provider: 'zai_sdk', model: 'default', notes: 'Z.ai SDK - Gratuito - Provedor principal' },
      { provider: 'gemini', model: 'gemini-2.5-flash', notes: 'Google Gemini Flash - Gratuito' },
      { provider: 'openai', model: 'gpt-4o-mini', notes: 'OpenAI GPT-4o Mini - Pago' },
      { provider: 'groq', model: 'llama-3.3-70b-versatile', notes: 'Groq Llama 3.3 - Gratuito' },
      { provider: 'huggingface', model: 'mistral-small', notes: 'HuggingFace Inference - Gratuito' },
      { provider: 'anthropic', model: 'claude-3-haiku-20240307', notes: 'Anthropic Claude - Pago' },
    ];

    for (const p of defaultProviders) {
      await prisma.apiConfig.upsert({
        where: {
          tenantId_provider: { tenantId, provider: p.provider },
        },
        create: {
          tenantId,
          provider: p.provider,
          model: p.model,
          notes: p.notes,
          isActive: p.provider === 'zai_sdk',
        },
        update: { notes: p.notes },
      });
    }

    // Create default agent configs
    const defaultAgents = [
      { agentId: 'agent-1', agentName: 'Recepcionista' },
      { agentId: 'agent-2', agentName: 'Concierge' },
      { agentId: 'agent-3', agentName: 'Reservas' },
      { agentId: 'agent-4', agentName: 'Housekeeping' },
      { agentId: 'agent-5', agentName: 'Financeiro' },
      { agentId: 'agent-6', agentName: 'Guardião' },
      { agentId: 'agent-7', agentName: 'Marketing' },
      { agentId: 'agent-8', agentName: 'Aprendiz' },
    ];

    for (const agent of defaultAgents) {
      await prisma.agentConfig.upsert({
        where: {
          tenantId_agentId: { tenantId, agentId: agent.agentId },
        },
        create: { tenantId, agentId: agent.agentId, agentName: agent.agentName },
        update: {},
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId,
        action: 'onboarding_complete',
        details: JSON.stringify({
          propertyName: prop.name,
          roomsCount: rooms?.length || 0,
          servicesCount: services?.selected?.length || 0,
          paymentMethods: payment?.methods || [],
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Onboarding completo! ZEHLA está configurado.',
      data: {
        propertyId: prop.id,
        roomsCount: rooms?.length || 0,
        apiConfigsCreated: defaultProviders.length,
        agentConfigsCreated: defaultAgents.length,
      },
    });
  } catch (error) {
    console.error('[ONBOARDING] Error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
