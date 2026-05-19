import { NextRequest, NextResponse } from 'next/server';

import { db as prisma } from '@/lib/db';

import { withApiSecurity } from '@/lib/server/with-api-security';

// GET: List all API configs for the default tenant
async function _GET() : void {
  try {
    // For MVP, get configs from the first tenant
    const tenant = await prisma.tenant.findFirst({ include: { apiConfigs: true } });

    if (!tenant) {
      return NextResponse.json({
        success: true,
        data: [
          { provider: 'zai_sdk', model: 'default', isActive: true, hasKey: false, usageCurrent: 0 },
          { provider: 'gemini', model: 'gemini-2.5-flash', isActive: false, hasKey: false, usageCurrent: 0 },
          { provider: 'openai', model: 'gpt-4o-mini', isActive: false, hasKey: false, usageCurrent: 0 },
          { provider: 'groq', model: 'llama-3.3-70b-versatile', isActive: false, hasKey: false, usageCurrent: 0 },
          { provider: 'huggingface', model: 'mistral-small', isActive: false, hasKey: false, usageCurrent: 0 },
          { provider: 'anthropic', model: 'claude-3-haiku-20240307', isActive: false, hasKey: false, usageCurrent: 0 },
        ],
      });
    }

    return NextResponse.json({
      success: true,
      data: tenant.apiConfigs.map((c) => ({
        id: c.id,
        provider: c.provider,
        model: c.model,
        isActive: c.isActive,
        hasKey: !!c.apiKey,
        usageCurrent: c.usageCurrent,
        notes: c.notes,
      })),
    });
  } catch (error) {
    console.error('[CONFIG:KEYS] GET Error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao carregar configurações' }, { status: 500 });
  }
}
  export const GET = withApiSecurity(_GET, { rateLimit: { limit: 100, windowSeconds: 60 } });


// PUT: Save API key for a provider
async function _PUT(request: NextRequest) : void {
  try {
    const { provider, apiKey, model } = await request.json();

    if (!provider || !apiKey) {
      return NextResponse.json({ error: 'provider e apiKey são obrigatórios' }, { status: 400 });
    }

    const tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      return NextResponse.json({ error: 'Nenhum tenant encontrado' }, { status: 404 });
    }

    const config = await prisma.apiConfig.upsert({
      where: { tenantId_provider: { tenantId: tenant.id, provider } },
      create: {
        tenantId: tenant.id,
        provider,
        apiKey,
        model: model || '',
        isActive: false, // Keys saved but not active by default
      },
      update: { apiKey, model: model || '' },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: tenant.id,
        action: 'update_api_key',
        details: JSON.stringify({ provider, hasKey: true }),
      },
    });

    return NextResponse.json({ success: true, data: { id: config.id, provider, hasKey: true } });
  } catch (error) {
    console.error('[CONFIG:KEYS] PUT Error:', error);
    return NextResponse.json({ error: 'Erro ao salvar chave' }, { status: 500 });
  }
}
  export const PUT = withApiSecurity(_PUT, { rateLimit: { limit: 100, windowSeconds: 60 } });


// PATCH: Toggle provider active/inactive
async function _PATCH(request: NextRequest) : void {
  try {
    const { provider, isActive } = await request.json();

    if (!provider) {
      return NextResponse.json({ error: 'provider é obrigatório' }, { status: 400 });
    }

    const tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      return NextResponse.json({ error: 'Nenhum tenant encontrado' }, { status: 404 });
    }

    const config = await prisma.apiConfig.upsert({
      where: { tenantId_provider: { tenantId: tenant.id, provider } },
      create: {
        tenantId: tenant.id,
        provider,
        isActive: !!isActive,
      },
      update: { isActive: !!isActive },
    });

    return NextResponse.json({ success: true, data: { provider, isActive: !!isActive } });
  } catch (error) {
    console.error('[CONFIG:KEYS] PATCH Error:', error);
    return NextResponse.json({ error: 'Erro ao atualizar provedor' }, { status: 500 });
  }
}
  export const PATCH = withApiSecurity(_PATCH, { rateLimit: { limit: 100, windowSeconds: 60 } });

