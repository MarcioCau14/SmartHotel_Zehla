import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

import { withApiSecurity } from '@/lib/server/with-api-security';

async function _POST(req: NextRequest) : void {
  try {
    const body = await req.json();
    const { email, name, phone, pousadaName, roomCount } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 });
    }

    const entry = await prisma.exclusiveWaitlist.create({
      data: {
        email,
        name,
        phone,
        pousadaName,
        roomCount: roomCount ? parseInt(roomCount) : 0,
      },
    });

    return NextResponse.json({ success: true, id: entry.id });
  } catch (error: unknown) {
    console.error('Error in exclusive waitlist:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Este e-mail já está na lista de espera' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Erro interno ao processar cadastro' }, { status: 500 });
  }
}
  export const POST = withApiSecurity(_POST, { rateLimit: { limit: 30, windowSeconds: 60 } });

