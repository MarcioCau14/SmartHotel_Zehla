import type { AgentTrainingProfile } from './mal-types';

// ZEHLA SmartHotel Cognitive OS — Visibility Agent Profile
// Agente 09: Especialista em SEO Local e Visibilidade (Google Business Profile)


export const visibilityAgentProfile: AgentTrainingProfile = {
  agentId: 'agent-9',
  domain: 'visibility_seo_local',
  specializations: [
    'nap_consistency',
    'seo_local',
    'google_business_profile',
    'review_management',
    'content_sync'
  ],
  primaryIntents: [
    'audit_nap',
    'optimize_gbp',
    'generate_review_response',
    'sync_instagram_post',
    'photo_validation'
  ],
  confidenceScore: 0.85,
  trainingStatus: 'ready',
  lastTrained: '2026-04-29T15:30:00Z',
  modelVersion: 1,
  knowledgeBase: [
    {
      id: 'doc-v1',
      title: 'Guia Google para Pousadas — Quarto Cheio',
      source: 'uploaded',
      chunks: 50,
      embeddingModel: 'text-embedding-3-small',
      ingestedAt: '2026-04-29T15:30:00Z',
      retentionPolicy: 'global_pattern'
    }
  ],
  learningMetrics: {
    totalInteractions: 120,
    learnedPatterns: 15,
    accuracyTrend: [0.85, 0.86, 0.88, 0.89, 0.91],
    latencyTrend: [120, 110, 95, 85, 70],
    confidenceTrend: [0.80, 0.82, 0.83, 0.84, 0.85],
    successRateEvolution: [
      { period: 'Abr/26', rate: 85.5 }
    ],
    intentCoverage: [
      { intent: 'audit_nap', accuracy: 92.4, samples: 45 },
      { intent: 'generate_review_response', accuracy: 94.1, samples: 38 },
      { intent: 'sync_instagram_post', accuracy: 88.7, samples: 22 },
      { intent: 'photo_validation', accuracy: 96.5, samples: 15 }
    ],
    currentEpoch: 5,
    totalEpochs: 10,
    loss: 0.045
  },
  evolutionLog: [
    {
      date: '2026-04-29',
      type: 'document_ingested',
      description: 'Guia Google para Pousadas ingerido — Estratégias de Visibilidade mapeadas',
      impact: 'high'
    },
    {
      date: '2026-04-29',
      type: 'intent_refined',
      description: 'Intent audit_nap calibrado para evitar falsos positivos em abreviações',
      impact: 'medium'
    }
  ]
};
