import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { encryptText, maskApiKey } from '@/lib/encryption';
import { requireTenantId } from '@/lib/security/tenant-context';

export async function GET() {
  try {
    const tenantId = await requireTenantId();
    const rawKeys = await db.apiConfig.findMany({ where: { tenantId } });
    const keys = rawKeys.map(k => ({
      ...k,
      apiKey: maskApiKey(k.apiKey),
      apiSecret: k.apiSecret ? maskApiKey(k.apiSecret) : ''
    }));
    return NextResponse.json({ success: true, data: keys });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('UNAUTHORIZED')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error('[CONFIG_KEYS_GET]', error);
    return NextResponse.json({ success: true, data: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = await requireTenantId();
    const body = await request.json();
    
    if (body.apiKey) {
      body.apiKey = encryptText(body.apiKey);
    }
    if (body.apiSecret) {
      body.apiSecret = encryptText(body.apiSecret);
    }
    body.tenantId = tenantId;

    const key = await db.apiConfig.create({ data: body });
    
    const safeKey = {
      ...key,
      apiKey: maskApiKey(body.apiKey),
      apiSecret: body.apiSecret ? maskApiKey(body.apiSecret) : ''
    };
    
    return NextResponse.json({ success: true, data: safeKey });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('UNAUTHORIZED')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error('[CONFIG_KEYS_POST]', error);
    return NextResponse.json({ success: false, error: 'Failed to create key' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const tenantId = await requireTenantId();
    const { provider, apiKey, model } = await request.json();
    const existing = await db.apiConfig.findFirst({ where: { provider, tenantId } });

    if (existing) {
      const updateData: Record<string, unknown> = { model };
      if (apiKey) updateData.apiKey = encryptText(apiKey);
      const updated = await db.apiConfig.update({
        where: { id: existing.id },
        data: updateData,
      });
      return NextResponse.json({ success: true, data: { ...updated, apiKey: maskApiKey(apiKey || '') } });
    } else {
      const created = await db.apiConfig.create({
        data: { provider, apiKey: encryptText(apiKey || ''), model, isActive: true, tenantId },
      });
      return NextResponse.json({ success: true, data: { ...created, apiKey: maskApiKey(apiKey || '') } });
    }
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('UNAUTHORIZED')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error('[CONFIG_KEYS_PUT]', error);
    return NextResponse.json({ success: false, error: 'Failed to save key' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const tenantId = await requireTenantId();
    const { provider, isActive } = await request.json();
    const existing = await db.apiConfig.findFirst({ where: { provider, tenantId } });

    if (existing) {
      const updated = await db.apiConfig.update({
        where: { id: existing.id },
        data: { isActive },
      });
      return NextResponse.json({ success: true, data: updated });
    } else {
      const created = await db.apiConfig.create({
        data: { provider, apiKey: '', isActive, tenantId },
      });
      return NextResponse.json({ success: true, data: created });
    }
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('UNAUTHORIZED')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error('[CONFIG_KEYS_PATCH]', error);
    return NextResponse.json({ success: false, error: 'Failed to toggle provider' }, { status: 500 });
  }
}