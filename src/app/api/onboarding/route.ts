// =============================================================================
// API — Onboarding
// =============================================================================
// POST /api/onboarding — Completa o onboarding do tenant
// GET  /api/onboarding — Verifica status do onboarding
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const tenant = await db.tenant.findFirst({ where: { isActive: true } });
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    return NextResponse.json({
      onboardingComplete: tenant.onboardingComplete,
      mode: tenant.mode,
      planSlug: tenant.planSlug,
      name: tenant.name,
    });
  } catch (error) {
    console.error('[api/onboarding] GET Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mode, planSlug, name, email, password } = body as {
      mode: 'pousada' | 'airbnb';
      planSlug: 'pro' | 'max';
      name: string;
      email: string;
      password?: string;
    };

    if (!mode || !planSlug || !name || !email) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: mode, planSlug, name, email' },
        { status: 400 }
      );
    }

    if (!['pousada', 'airbnb'].includes(mode)) {
      return NextResponse.json(
        { error: 'Mode deve ser "pousada" ou "airbnb"' },
        { status: 400 }
      );
    }

    if (!['pro', 'max'].includes(planSlug)) {
      return NextResponse.json(
        { error: 'PlanSlug deve ser "pro" ou "max"' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      // Update existing user's tenant
      const existingTenant = await db.tenant.findUnique({ where: { userId: existingUser.id } });
      if (existingTenant) {
        // Update tenant
        await db.tenant.update({
          where: { id: existingTenant.id },
          data: {
            name,
            mode,
            planSlug,
            onboardingComplete: true,
          },
        });

        return NextResponse.json({
          success: true,
          tenant: { id: existingTenant.id, name, mode, planSlug },
          message: 'Onboarding atualizado com sucesso!',
        });
      }

      // Create tenant for existing user
      const tenant = await db.tenant.create({
        data: {
          name,
          mode,
          planSlug,
          onboardingComplete: true,
          userId: existingUser.id,
        },
      });

      return NextResponse.json({
        success: true,
        tenant: { id: tenant.id, name, mode, planSlug },
        message: 'Onboarding completado com sucesso!',
      });
    }

    // Create new user + tenant
    const user = await db.user.create({
      data: {
        email,
        name: name,
        password: password || null,
        tenant: {
          create: {
            name,
            mode,
            planSlug,
            onboardingComplete: true,
          },
        },
      },
      include: { tenant: true },
    });

    return NextResponse.json({
      success: true,
      tenant: user.tenant ? {
        id: user.tenant.id,
        name: user.tenant.name,
        mode: user.tenant.mode,
        planSlug: user.tenant.planSlug,
      } : null,
      message: 'Onboarding completado com sucesso!',
    }, { status: 201 });
  } catch (error) {
    console.error('[api/onboarding] POST Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
