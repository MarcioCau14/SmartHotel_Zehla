import { Worker, Job } from 'bullmq';
import { redisWorker } from '@/lib/redis';
import { prisma } from '@/lib/prisma';

/**
 * Marketing Events Worker
 * 
 * Processa eventos do funil de marketing da fila 'zehla-marketing-events':
 * 1. Busca lead pelo email
 * 2. Registra FunnelEvent no PostgreSQL
 * 3. Atualiza lead score baseado no evento
 * 4. Recalcula cluster do lead (COLD → WARM → HOT)
 * 5. Atualiza lastInteractionAt
 * 
 * Eventos e pontuação:
 * - email_opened: +5 pontos
 * - email_clicked: +15 pontos
 * - email_delivered: +1 ponto
 * - email_bounced: -10 pontos
 * - email_unsubscribed: -20 pontos
 * - email_spam_report: -50 pontos
 * 
 * Thresholds de cluster:
 * - score >= 50: HOT (pronto para abordagem direta)
 * - score >= 20: WARM (engajado, nurturing)
 * - score < 20: COLD (pouco engajado)
 */

const CLUSTER_THRESHOLDS = {
  HOT: 50,
  WARM: 20,
};

export const marketingEventsWorker = new Worker('zehla-marketing-events', async (job: Job) => {
  const { email, eventType, campaignId, campaignName, metadata, scoreDelta, ip, userAgent } = job.data;

  if (!email) {
    console.warn('⚠️ [MARKETING WORKER] Evento sem email, ignorando');
    return { status: 'IGNORADO_SEM_EMAIL' };
  }

  console.log(`📧 [MARKETING WORKER] Processando ${eventType} para ${email}`);

  try {
    // 1. Buscar lead pelo email
    const lead = await prisma.lead.findFirst({
      where: {
        OR: [
          { email },
          { whatsapp: email },
        ],
      },
    });

    // 2. Registrar FunnelEvent
    const funnelEvent = await prisma.funnelEvent.create({
      data: {
        leadId: lead?.id || null,
        email,
        eventType,
        campaignId: campaignId || null,
        campaignName: campaignName || null,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
        ip: ip || null,
        userAgent: userAgent || null,
        scoreDelta,
      },
    });

    // 3. Se lead existe, atualizar score e cluster
    if (lead) {
      const currentScore = lead.conversionScore || 0;
      const newScore = Math.max(0, currentScore + scoreDelta); // Nunca negativo

      // Determinar novo cluster
      let newCluster = lead.cluster || 'COLD';
      if (newScore >= CLUSTER_THRESHOLDS.HOT) {
        newCluster = 'HOT';
      } else if (newScore >= CLUSTER_THRESHOLDS.WARM) {
        newCluster = 'WARM';
      } else {
        newCluster = 'COLD';
      }

      // Atualizar funnel stage baseado no evento
      let newFunnelStage = lead.funnelStage || 'NEUTRAL';
      switch (eventType) {
        case 'email_clicked':
          newFunnelStage = 'INTERESTED';
          break;
        case 'email_opened':
          if (newFunnelStage === 'NEUTRAL') {
            newFunnelStage = 'AWARE';
          }
          break;
        case 'trial_started':
          newFunnelStage = 'TRIAL';
          break;
        case 'trial_converted':
          newFunnelStage = 'CONVERTED';
          break;
      }

      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          conversionScore: newScore,
          cluster: newCluster,
          funnelStage: newFunnelStage,
          lastInteractionAt: new Date(),
          updatedAt: new Date(),
        },
      });

      console.log(`✅ [MARKETING WORKER] Lead ${lead.name} atualizado: score ${currentScore} → ${newScore}, cluster ${lead.cluster} → ${newCluster}`);

      // Se lead virou HOT, log para possível ação da Secretaria-AI
      if (newCluster === 'HOT' && lead.cluster !== 'HOT') {
        console.log(`🔥 [MARKETING WORKER] Lead ${lead.name} (${lead.email}) virou HOT! Considerar abordagem via WhatsApp.`);
        
        // Registrar evento especial para trigger da Secretaria-AI
        await prisma.funnelEvent.create({
          data: {
            leadId: lead.id,
            email,
            eventType: 'lead_activated_hot',
            campaignId: campaignId || null,
            campaignName: campaignName || null,
            metadata: { 
              trigger: 'cluster_upgraded_to_hot',
              previousCluster: lead.cluster,
              score: newScore,
            },
            scoreDelta: 0,
          },
        });
      }
    } else {
      console.log(`ℹ️ [MARKETING WORKER] Email ${email} não encontrado como lead, evento registrado sem associação`);
    }

    return { 
      status: 'processado', 
      eventType, 
      email, 
      leadId: lead?.id,
      scoreDelta,
    };

  } catch (error) {
    console.error(`❌ [MARKETING WORKER] Falha ao processar evento para ${email}:`, error);
    throw error; // BullMQ vai tentar novamente com backoff exponencial
  }
}, {
  connection: redisWorker,
  concurrency: 5, // Processa 5 eventos em paralelo
});

console.log('🚀 [MARKETING WORKER] Worker de eventos de marketing iniciado');
