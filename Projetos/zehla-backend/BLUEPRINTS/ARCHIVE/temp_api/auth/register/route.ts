import { NextRequest, NextResponse } from 'next/server';

import { db as prisma } from '@/lib/db';
import { hashPassword, generateSessionToken, checkPasswordStrength } from '@/lib/auth';


export async function POST(request: NextRequest) : void {
  try {
    const body = await request.json();
    const { nome, email, senha, whatsappProprietario, whatsappAtendimento } = body;

    // Validation
    if (!nome?.trim()) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }
    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'E-mail inválido' }, { status: 400 });
    }
    if (!senha || senha.length < 6) {
      return NextResponse.json({ error: 'Senha deve ter no mínimo 6 caracteres' }, { status: 400 });
    }
    if (!whatsappProprietario?.trim()) {
      return NextResponse.json({ error: 'WhatsApp do proprietário é obrigatório' }, { status: 400 });
    }

    // Check if tenant already exists
    const existing = await prisma.tenant.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existing) {
      return NextResponse.json({
        error: 'Este e-mail já está cadastrado',
        code: 'EMAIL_EXISTS',
      }, { status: 409 });
    }

    // Hash password
    const passwordHash = await hashPassword(senha);
    const pwdStrength = checkPasswordStrength(senha);

    // Calculate trial dates
    const trialStart = new Date();
    const trialEnd = new Date(trialStart);
    trialEnd.setDate(trialEnd.getDate() + 7);

    // Create tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: nome.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        phone: whatsappProprietario.trim(),
        phoneAlt: whatsappAtendimento?.trim() || whatsappProprietario.trim(),
        plan: 'trial',
        status: 'active',
        trialStart,
        trialEnd,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        tenantId: tenant.id,
        action: 'register',
        details: JSON.stringify({ name: tenant.name, plan: 'trial', trialDays: 7 }),
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    });

    // Generate session token
    const token = generateSessionToken(tenant.id, tenant.email);

    return NextResponse.json({
      success: true,
      message: 'Conta criada com sucesso! Trial de 7 dias ativado.',
      data: {
        tenantId: tenant.id,
        name: tenant.name,
        email: tenant.email,
        plan: tenant.plan,
        trialStart: tenant.trialStart?.toISOString(),
        trialEnd: tenant.trialEnd?.toISOString(),
        trialDaysLeft: 7,
        token,
        passwordStrength: pwdStrength,
      },
    });
  } catch (error) {
    console.error('[AUTH:REGISTER] Error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
