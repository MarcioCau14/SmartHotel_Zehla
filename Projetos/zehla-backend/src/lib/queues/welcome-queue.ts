import { Queue } from 'bullmq';
import { redisWorker } from '@/lib/redis';

export const welcomeQueue = new Queue('zehla-welcome', {
  connection: redisWorker,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: { age: 86400, count: 100 },
    removeOnFail: { age: 604800 },
  },
});

export async function dispatchWelcomeMessage(data: {
  userId: string;
  propertyName: string;
  ownerName: string;
  email: string;
  whatsapp: string;
  trialEndsAt: string;
  utmCampaign?: string;
}) {
  await welcomeQueue.add('send-welcome', data, {
    jobId: `welcome-${data.userId}`,
  });
}
