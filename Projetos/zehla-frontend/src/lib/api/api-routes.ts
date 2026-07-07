export const API = {
  CRM: {
    LEADS: '/api/comercial/leads',
    MOVE_LEAD: '/api/comercial/leads/move',
    LEAD_BY_ID: (id: string) => `/api/comercial/leads/${id}`,
    QUALIFICAR: (id: string) => `/api/comercial/leads/${id}/qualificar`,
    HANDOFF: (id: string) => `/api/comercial/leads/${id}/handoff`,
    ESCADA_VALOR: (id: string) => `/api/comercial/leads/${id}/escada-valor`,
  },
  FARMER: {
    CANDIDATES: '/api/crm/farmer/candidates',
    REACTIVATE: '/api/crm/farmer/reactivate',
  },
  DASHBOARD: {
    METRICS: '/api/dashboard/metrics',
    FORECAST: '/api/dashboard/metrics/forecast',
  },
  BRAIN: {
    LOGS: '/api/brain/logs',
    COMMAND: '/api/brain',
    METRICS: '/api/brain/metrics',
    AUDIT: '/api/brain/audit/d1',
    QUALITY_PROXY: '/api/brain/quality-proxy',
  },
  SOCIAL: {
    WEBHOOK: '/api/webhooks/social',
    QUEUE_STATS: '/api/social/queue/stats',
    CAPTURED: '/api/social/captured',
  },
  RESERVATIONS: {
    BASE: '/api/reservations',
    CANCEL: (id: string) => `/api/reservations/${id}/cancel`,
  },
  STRATEGY: {
    BASE: '/api/revenue/strategy',
    RECOMMEND: '/api/revenue/strategy',
    BATCH_RECOMMEND: '/api/revenue/strategy',
  },
  OUTBOUND: {
    BASE: '/api/marketing/outbound',
    VARIANTS: '/api/marketing/outbound',
    DISPATCH: '/api/marketing/outbound',
    BATCH_DISPATCH: '/api/marketing/outbound',
  },
} as const
