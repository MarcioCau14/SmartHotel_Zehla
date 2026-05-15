// src/lib/queues.ts — ZEHLA Brain v4: Central Queue Orchestration
// 5 filas BullMQ dedicadas para o Pipeline Cognitivo
import { Queue } from 'bullmq';
import { redis } from './redis';

// Queue names para cada estágio da pipeline
export const QUEUE_NAMES = {
  CAPTURE:  'brain-capture',
  VALIDATE: 'brain-validate',
  ENRICH:   'brain-enrich',
  CLASSIFY: 'brain-classify',
  ACT:      'brain-act',
  SWIPE_MATCH: 'brain-swipe-match',
  DEEP_SCRAPE: 'brain-deep-scrape',
} as const;

// Configuração de Concorrência e Rate Limiting (Proteção de API Keys)
export const WORKER_CONFIG = {
  // Concorrência padrão (Override via env)
  concurrency: {
    CAPTURE:  Number(process.env.CONCURRENCY_CAPTURE)  || 10,
    VALIDATE: Number(process.env.CONCURRENCY_VALIDATE) || 10,
    ENRICH:   Number(process.env.CONCURRENCY_ENRICH)   || 5,
    CLASSIFY: Number(process.env.CONCURRENCY_CLASSIFY) || 5,
    ACT:      Number(process.env.CONCURRENCY_ACT)      || 2, // Crítico para não estourar WhatsApp/Resend
    SCRAPE:   Number(process.env.CONCURRENCY_SCRAPE)   || 3,
  },
  // Rate Limiting (Previne 429 Too Many Requests)
  limiter: {
    max: Number(process.env.RATE_LIMIT_MAX) || 50,
    duration: Number(process.env.RATE_LIMIT_DURATION) || 1000,
  }
} as const;

// Score mapping por tipo de evento (centralizado)
export const EVENT_SCORES: Record<string, number> = {
  EMAIL_OPEN:      5,
  LINK_CLICK:      15,
  LANDING_VISIT:   10,
  WHATSAPP_OPEN:   25,
  AD_VIEW:         3,
  WHATSAPP_REPLY:  30,
  TRIAL_STARTED:   50,
  PAYMENT_MADE:    100,
  CONVERSION:      100,
};

// Cluster thresholds
export const CLUSTER_THRESHOLDS = {
  HOT:  60,
  WARM: 30,
  COLD: 0,
} as const;

export type Cluster = 'HOT' | 'WARM' | 'COLD';

export function determineCluster(score: number): Cluster {
  if (score >= CLUSTER_THRESHOLDS.HOT) return 'HOT';
  if (score >= CLUSTER_THRESHOLDS.WARM) return 'WARM';
  return 'COLD';
}

// Ações por transição de cluster
export const CLUSTER_ACTIONS: Record<string, string[]> = {
  'COLD->WARM': [
    'send_nurture_email_welcome',
    'activate_remarketing_campaign',
  ],
  'COLD->HOT': [
    'send_sales_alert_urgent',
    'sugerir_swipe_zcc',
    'activate_whatsapp_sequence',
    'adjust_ad_bid_increase',
    'send_trial_invitation',
  ],
  'WARM->HOT': [
    'send_sales_alert_hot_lead',
    'sugerir_swipe_zcc',
    'send_conversion_email',
    'activate_whatsapp_sequence',
    'adjust_ad_bid_increase',
  ],
  'HOT->WARM': [
    'send_nurture_email',
    'schedule_follow_up',
    'adjust_ad_bid_normal',
  ],
  'HOT->COLD': [
    'send_churn_prevention_email',
    'pause_aggressive_campaigns',
    'create_winback_task',
  ],
  'WARM->COLD': [
    'send_reengagement_email',
    'reduce_ad_spend',
  ],
};

// Criação das 5 filas (lazy — só conectam quando usadas)
const queueOptions = {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 500 },
    attempts: 3,
    backoff: {
      type: 'exponential' as const,
      delay: 2000,
    },
  },
};

export const captureQueue  = new Queue(QUEUE_NAMES.CAPTURE,  queueOptions);
export const validateQueue = new Queue(QUEUE_NAMES.VALIDATE, queueOptions);
export const enrichQueue   = new Queue(QUEUE_NAMES.ENRICH,   queueOptions);
export const classifyQueue = new Queue(QUEUE_NAMES.CLASSIFY, queueOptions);
export const actQueue      = new Queue(QUEUE_NAMES.ACT,      queueOptions);
export const swipeMatchQueue = new Queue(QUEUE_NAMES.SWIPE_MATCH, queueOptions);
export const scraperQueue  = new Queue(QUEUE_NAMES.DEEP_SCRAPE, queueOptions);

console.log('🧠 [ZEHLA Brain] 6 filas BullMQ inicializadas: capture → validate → enrich → classify → act → deep-scrape');
