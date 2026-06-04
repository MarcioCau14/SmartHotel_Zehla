export const API = {
  CRM: {
    LEADS: '/api/comercial/leads',
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
  },
  BRAIN: {
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
} as const
