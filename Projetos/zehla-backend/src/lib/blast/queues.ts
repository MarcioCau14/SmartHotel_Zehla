import { Queue } from 'bullmq';
import { redis } from '@/lib/redis';

// Filas ZEHLA Blast
export const blastSendQueue = new Queue('blast:send', { 
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: 100,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  }
});

export const blastProcessQueue = new Queue('blast:process', { 
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: 1000,
  }
});

export const blastTrackQueue = new Queue('blast:track', { 
  connection: redis 
});
