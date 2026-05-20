import { NextRequest, NextResponse } from 'next/server';

import { db as prisma } from '@/lib/db';
import { parseSessionToken } from '@/lib/auth';


export async function GET(request: NextRequest) : void {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('zehla_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const session = parseSessionToken(token);
    if (!session) {
      return NextResponse.json({ error: 'Sessão expirada' }, { status: 401 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: session.tid },
      include: {
        property: { include: { rooms: true } },
        apiConfigs: true,
        agentConfigs: true,
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant não encontrado' }, { status: 404 });
    }

    // Calculate trial info
    const now = new Date();
    let trialDaysLeft = 0;
    let isExpired = false;
    let isWarning = false;

    if (tenant.trialStart && tenant.trialEnd) {
      const elapsedMs = now.getTime() - tenant.trialStart.getTime();
      const elapsedDays = Math.floor(elapsedMs / (24 * 60 * 60 * 1000));
      trialDaysLeft = Math.max(0, 7 - elapsedDays);
      isExpired = trialDaysLeft <= 0;
      isWarning = trialDaysLeft === 1;
    }

    return NextResponse.json({
      success: true,
      data: {
        tenantId: tenant.id,
        name: tenant.name,
        email: tenant.email,
        phone: tenant.phone,
        phoneAlt: tenant.phoneAlt,
        plan: tenant.plan,
        status: tenant.status,
        trialStart: tenant.trialStart?.toISOString(),
        trialEnd: tenant.trialEnd?.toISOString(),
        trialDaysLeft,
        isExpired,
        isWarning,
        property: tenant.property ? {
          id: tenant.property.id,
          name: tenant.property.name,
          type: tenant.property.type,
          city: tenant.property.city,
          state: tenant.property.state,
          rooms: tenant.property.rooms,
          services: JSON.parse(tenant.property.services || '[]'),
          paymentMethods: JSON.parse(tenant.property.paymentMethods || '[]'),
        } : null,
        apiConfigs: tenant.apiConfigs.map(c => ({
          id: c.id,
          provider: c.provider,
          isActive: c.isActive,
          model: c.model,
          hasKey: !!c.apiKey,
          usageCurrent: c.usageCurrent,
        })),
        agentConfigs: tenant.agentConfigs.map(c => ({
          id: c.id,
          agentId: c.agentId,
          agentName: c.agentName,
          isActive: c.isActive,
          learnedPatterns: c.learnedPatterns,
          confidenceScore: c.confidenceScore,
        })),
      },
    });
  } catch (error) {
    console.error('[AUTH:ME] Error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
