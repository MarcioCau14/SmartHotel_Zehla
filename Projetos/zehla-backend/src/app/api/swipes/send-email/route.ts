// src/app/api/swipes/send-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EmailService } from '@/lib/email/email-service';

export async function POST(req: NextRequest) {
  try {
    const { leadId, swipeId } = await req.json();

    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    const swipe = await prisma.swipeTemplate.findUnique({ where: { id: swipeId } });

    if (!lead || !swipe) {
      return NextResponse.json({ error: 'Lead or Swipe not found' }, { status: 404 });
    }

    // Chamando o serviço de e-mail (Custo Zero de IA, mas usa a infra do Listmonk)
    const result = await EmailService.sendSwipeEmail(lead, swipe);

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
