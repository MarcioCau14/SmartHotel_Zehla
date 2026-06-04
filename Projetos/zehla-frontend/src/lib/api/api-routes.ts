export const API = {
  CRM: {
    LEADS: '/api/crm/leads',
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
    QUEUE_STATS: '/api/social/queue/stats',
    CAPTURED: '/api/social/captured',
  },
  RESERVATIONS: {
    BASE: '/api/reservations',
    CANCEL: (id: string) => `/api/reservations/${id}/cancel`,
  },
  STRATEGY: {
    RECOMMEND: '/api/comercial/leads/recommend',
    BATCH_RECOMMEND: '/api/comercial/leads/recommend/batch',
  },
  OUTBOUND: {
    DISPATCH: '/api/marketing/outbound/dispatch',
    BATCH_DISPATCH: '/api/marketing/outbound/batch',
    VARIANTS: '/api/marketing/outbound/variants',
  },
} as const
