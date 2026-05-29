import { Worker, Queue, QueueEvents } from 'bullmq';

import { TelemetryEngine } from '../lib/ai/engine/telemetry-engine';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/delivery/redis-connection';


const TELEMETRY_QUEUE = 'business-telemetry';

export const telemetryQueue = new Queue(TELEMETRY_QUEUE, {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: 1000,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  },
});

export const telemetryWorker = new Worker(
  TELEMETRY_QUEUE,
  async (job) => {
    

    if (job.name === 'AGGREGATE_ALL') {
      const properties = await prisma.property.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true }
      });

      const propertyIds = properties.map(p => p.id);
      if (propertyIds.length === 0) return;

      const startDate = new Date();
      startDate.setHours(startDate.getHours() - 1);
      const endDate = new Date();

      try {
        const metricsMap = await TelemetryEngine.calculateAllMetrics(propertyIds, startDate, endDate);
        await TelemetryEngine.saveAllTelemetry(metricsMap);
      } catch (error) {
        console.error('❌ [TELEMETRY-WORKER] Erro no batch aggregate:', error);
      }
    }
  },
  {
    connection: redis,
    concurrency: 1,
  }
);

// Schedule the job (Run every hour)
export async function scheduleTelemetry(): Promise<void> {
  const jobs = await telemetryQueue.getRepeatableJobs();
  
  // Clean existing repeatable jobs to avoid duplicates during dev
  for (const job of jobs) {
    await telemetryQueue.removeRepeatableByKey(job.key);
  }

  await telemetryQueue.add(
    'AGGREGATE_ALL',
    {},
    {
      repeat: {
        pattern: '0 * * * *', // Every hour at minute 0
      },
    }
  );
}

// Start scheduling if this file is run directly or imported
if (process.env.START_WORKERS === 'true') {
  scheduleTelemetry();
}

export { TELEMETRY_QUEUE };
