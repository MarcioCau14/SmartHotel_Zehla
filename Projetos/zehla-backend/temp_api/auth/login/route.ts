import { NextRequest, NextResponse } from 'next/server';

import { db as prisma } from '@/lib/db';
import { verifyPassword, generateSessionToken } from '@/lib/auth';


export async function POST(request: NextRequest) : void {
  try {
    const body = await request.json();
    const { email, senha } = body;

    // Validation
    if (!email?.trim()) {
      return NextResponse.json({ error: 'E-mail é obrigatório' }, { status: 400 });
    }
    if (!senha?.trim()) {
      return NextResponse.json({ error: 'Senha é obrigatória' }, { status: 400 });
    }

    // Find tenant
    const tenant = await prisma.tenant.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { property: { include: { rooms: true } } },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'E-mail ou senha incorretos' }, { status: 401 });
    }

    // Verify password
    const isValid = await verifyPassword(senha, tenant.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'E-mail ou senha incorretos' }, { status: 401 });
    }

    // Check if suspended
    if (tenant.status === 'suspended') {
      return NextResponse.json({
        error: 'Conta suspensa. Entre em contato com o suporte.',
        code: 'ACCOUNT_SUSPENDED',
      }, { status: 403 });
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

    // Generate token
    const token = generateSessionToken(tenant.id, tenant.email);

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId: tenant.id,
        action: 'login',
        details: JSON.stringify({ method: 'credentials' }),
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Login realizado com sucesso',
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
        token,
        property: tenant.property ? {
          name: tenant.property.name,
          type: tenant.property.type,
          city: tenant.property.city,
          state: tenant.property.state,
          roomsCount: tenant.property.rooms.length,
        } : null,
      },
    });
  } catch (error) {
    console.error('[AUTH:LOGIN] Error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
