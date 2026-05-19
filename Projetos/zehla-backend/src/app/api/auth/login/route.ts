import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { verifyPassword, generateSessionToken } from '@/lib/auth';

import { withApiSecurity } from '@/lib/server/with-api-security';

async function _POST(request: NextRequest) : void {
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

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { properties: { include: { rooms: true } } },
    });

    if (!user) {
      return NextResponse.json({ error: 'E-mail ou senha incorretos' }, { status: 401 });
    }

    // Verify password
    const isValid = await verifyPassword(senha, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'E-mail ou senha incorretos' }, { status: 401 });
    }

    // Check if active
    if (!user.isActive) {
      return NextResponse.json({
        error: 'Conta inativa. Entre em contato com o suporte.',
        code: 'ACCOUNT_INACTIVE',
      }, { status: 403 });
    }

    // Generate token
    const token = generateSessionToken(user.id, user.email);

    // Get the first property for simple login flow
    const mainProperty = user.properties[0];

    return NextResponse.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        tenantId: user.id, // Compatibility
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token,
        property: mainProperty ? {
          id: mainProperty.id,
          name: mainProperty.name,
          slug: mainProperty.slug,
          city: mainProperty.city,
          state: mainProperty.state,
          roomsCount: mainProperty.rooms.length,
          trialEndsAt: mainProperty.trialEndsAt?.toISOString(),
          isTrial: mainProperty.isTrial,
        } : null,
      },
    });
  } catch (error) {
    console.error('[AUTH:LOGIN] Error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
  export const POST = withApiSecurity(_POST, { rateLimit: { limit: 30, windowSeconds: 60 } });

