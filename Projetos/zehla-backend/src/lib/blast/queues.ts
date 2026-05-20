import { Queue } from 'bullmq';
import { redis } from '@/lib/redis';

function createQueue(name: string, opts?: Record<string, unknown>) {
  try {
    return new Queue(name, { connection: redis, ...opts } as any);
  } catch {
    return null;
  }
}

export const blastSendQueue = createQueue('blast-send', {
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: 100,
    attempts: 3,
    backoff: {
      type: 'exponential' as const,
      delay: 5000,
    },
  }
});

export const blastProcessQueue = createQueue('blast-process', {
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: 1000,
  }
});

export const blastTrackQueue = createQueue('blast-track', {
  connection: redis,
});
