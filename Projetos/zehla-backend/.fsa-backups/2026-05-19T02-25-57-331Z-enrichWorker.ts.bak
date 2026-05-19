// src/workers/enrichWorker.ts — ZEHLA Brain v4: Estágio 3 (Enrich)
// Geo enrichment, device parsing, histórico do lead
import { Worker, Job } from 'bullmq';
import { redis } from '@/lib/redis';
import { QUEUE_NAMES, WORKER_CONFIG, classifyQueue, scraperQueue } from '@/lib/queues';
import { prisma } from '@/lib/prisma';

export const enrichWorker = new Worker(
  QUEUE_NAMES.ENRICH,
  async (job: Job) => {
    const { eventId, leadId, eventType, metadata, sessionId, fingerprint } = job.data;

    console.log(`[Enrich] Enriquecendo evento: ${eventId}`);

    // 1. Buscar dados existentes do lead
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: {
        id: true, city: true, state: true, region: true,
        latitude: true, longitude: true, name: true, email: true,
        whatsapp: true, site: true,
      },
    });

    if (!lead) {
      throw new Error(`Lead não encontrado: ${leadId}`);
    }

    // 2. Enriquecimento contextual
    const enrichedData: Record<string, any> = {};

    // Geo: usar dados já existentes do lead (da Secretaria-IA)
    if (lead.city || lead.state) {
      enrichedData.geo = {
        city: lead.city,
        state: lead.state,
        region: lead.region,
        lat: lead.latitude,
        lng: lead.longitude,
        source: 'secretaria_ai',
      };
    }

    // NEW: Web Scraping 2.0 Hook
    // Se o lead tem site mas falta WhatsApp ou Email, dispara Deep Scrape
    if (lead.site && (!lead.whatsapp || !lead.email)) {
      console.log(`🕵️ [Enrich] Detectado site para Deep Scrape: ${lead.site}`);
      await scraperQueue.add('deep-scrape-lead', {
        leadId: lead.id,
        url: lead.site
      });
      enrichedData.deepScrapeTriggered = true;
    }

    // Device parsing via user-agent (se disponível nos metadados)
    const userAgent = metadata?.user_agent || metadata?.userAgent;
    if (userAgent) {
      enrichedData.device = {
        userAgent,
        browser: parseBrowser(userAgent),
        os: parseOS(userAgent),
        mobile: /Mobile|Android|iPhone/i.test(userAgent),
      };
    }

    // 3. Histórico: contar eventos dos últimos 30 dias
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentEvents = await prisma.leadEvent.count({
      where: {
        leadId,
        timestamp: { gte: thirtyDaysAgo },
        status: { in: ['validated', 'enriched', 'classified'] },
      },
    });
    enrichedData.history = {
      recentEventCount: recentEvents,
      windowDays: 30,
    };

    // 4. Atualizar metadados do evento
    await prisma.leadEvent.update({
      where: { id: eventId },
      data: {
        metadata: { ...metadata, ...enrichedData },
        status: 'enriched',
      },
    });

    // 5. Encaminhar para classificação
    await classifyQueue.add('classify-event', {
      eventId,
      leadId,
      eventType,
      scoreImpact: job.data.scoreImpact,
      enrichedMetadata: enrichedData,
    });

    console.log(`[Enrich] Evento enriquecido: ${eventId} (${Object.keys(enrichedData).length} campos adicionados)`);

    return { status: 'enriched', eventId, enrichmentsApplied: Object.keys(enrichedData).length };
  },
  {
    connection: redis,
    concurrency: WORKER_CONFIG.concurrency.ENRICH,
    limiter: WORKER_CONFIG.limiter,
  }
);

// Helpers de parsing
function parseBrowser(ua: string): string {
  if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Edg')) return 'Edge';
  return 'Unknown';
}

function parseOS(ua: string): string {
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac OS')) return 'macOS';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  if (ua.includes('Linux')) return 'Linux';
  return 'Unknown';
}

enrichWorker.on('failed', (job, err) => {
  console.error(`[Enrich] Job ${job?.id} falhou:`, err.message);
});

export default enrichWorker;
