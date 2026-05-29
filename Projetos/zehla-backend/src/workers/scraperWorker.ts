import { Worker, Job } from 'bullmq';

import { QUEUE_NAMES, WORKER_CONFIG } from '@/lib/queues';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { scraperService } from '@/lib/ai/engine/scraper-service';


// src/workers/scraperWorker.ts — ZEHLA Brain v4: Web Scraping 2.0 Engine

export const scraperWorker = new Worker(
  QUEUE_NAMES.DEEP_SCRAPE,
  async (job: Job) => {
    const { leadId, url } = job.data;

    try {
      const scrapedData = await scraperService.deepScrape(url);

      if (Object.keys(scrapedData).length === 0) {
        console.warn(`⚠️ [Scraper 2.0] Nenhum dado extraído para ${url}`);
        return { status: 'failed', reason: 'NO_DATA_EXTRACTED' };
      }

      // 1. Atualizar o Lead com os dados enriquecidos (18 Colunas)
      const updatedLead = await prisma.lead.update({
        where: { id: leadId },
        data: {
          whatsapp: scrapedData.whatsapp || undefined,
          email: scrapedData.email || undefined,
          roomsCount: scrapedData.roomsCount || undefined,
          location: scrapedData.location || undefined,
          city: scrapedData.city || undefined,
          state: scrapedData.state || undefined,
          qualification: scrapedData.qualification || undefined,
          socialMedia: scrapedData.socialMedia || undefined,
          buyingBehavior: scrapedData.buyingBehavior || undefined,
          intentSignals: scrapedData.intentSignals || undefined,
          validationStatus: 'ENRICHED_2.0',
          validationScore: 100,
        },
      });

      console.log(`✅ [Scraper 2.0] Lead ${leadId} enriquecido:`, updatedLead.id);

      return { 
        status: 'success', 
        leadId, 
        fieldsUpdated: Object.keys(scrapedData).filter(k => scrapedData[k as keyof typeof scrapedData]).length 
      };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`❌ [Scraper 2.0] Falha crítica no worker:`, msg);
      throw error;
    }
  },
  {
    connection: redis,
    concurrency: WORKER_CONFIG.concurrency.SCRAPE,
    limiter: WORKER_CONFIG.limiter,
  }
);

scraperWorker.on('failed', (job, err) => {
  console.error(`❌ [Scraper 2.0] Job ${job?.id} falhou:`, err.message);
});

export default scraperWorker;
