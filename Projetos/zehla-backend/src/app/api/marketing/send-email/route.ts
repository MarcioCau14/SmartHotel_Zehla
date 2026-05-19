import { NextResponse } from 'next/server';
import { Queue } from 'bullmq';

import { prisma } from '@/lib/prisma';
import { redisConfig } from '@/lib/delivery/redis-connection';

import { withApiSecurity } from '@/lib/server/with-api-security';

const deliveryQueue = new Queue('delivery', { connection: redisConfig });

async function _POST(req: Request) : void {
  try {
    const { leadIds, campaignType } = await req.json();

    if (!leadIds || leadIds.length === 0) {
      return NextResponse.json({ error: 'Nenhum lead selecionado' }, { status: 400 });
    }

    const leads = await prisma.lead.findMany({
      where: { id: { in: leadIds } }
    });

    

    // Adicionar cada lead à fila de processamento
    const jobs = leads.map(lead => ({
      name: 'send-email',
      data: {
        id: lead.id,
        email: lead.email,
        name: lead.name,
        campaign: campaignType,
        property: lead.property
      },
      opts: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 }
      }
    }));

    await deliveryQueue.addBulk(jobs);

    return NextResponse.json({ 
      success: true, 
      message: `${leads.length} leads enviados para a fila de processamento.`,
      count: leads.length
    });

  } catch (error) {
    console.error('❌ [CAMPAIGN_ERROR]:', error);
    return NextResponse.json({ error: 'Falha ao iniciar campanha' }, { status: 500 });
  }
}
  export const POST = withApiSecurity(_POST, { rateLimit: { limit: 30, windowSeconds: 60 } });

