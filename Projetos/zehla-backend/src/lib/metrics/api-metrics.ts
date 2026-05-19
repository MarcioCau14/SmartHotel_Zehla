import { Counter, Histogram, Gauge, register } from 'prom-client';


// src/lib/metrics/api-metrics.ts

// Coleta métricas default (GC, event loop, etc.)
register.setDefaultLabels({ service: 'zehla-api' });

export const apiMetrics = {
  sseConnections: new Gauge({
    name: 'zehla_sse_connections_active',
    help: 'Conexões SSE ativas no momento',
    labelNames: ['endpoint'],
  }),

  sseLatency: new Histogram({
    name: 'zehla_sse_latency_seconds',
    help: 'Latência entre geração e entrega de evento SSE',
    labelNames: ['endpoint'],
    buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5],
  }),

  sseMessages: new Counter({
    name: 'zehla_sse_messages_total',
    help: 'Total de mensagens enviadas via SSE',
    labelNames: ['endpoint', 'status'],
  }),

  httpRequests: new Counter({
    name: 'zehla_http_requests_total',
    help: 'Total de requisições HTTP',
    labelNames: ['method', 'route', 'status_code'],
  }),

  httpDuration: new Histogram({
    name: 'zehla_http_duration_seconds',
    help: 'Duração das requisições HTTP',
    labelNames: ['method', 'route'],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5],
  }),

  canariesActive: new Gauge({
    name: 'zehla_canaries_active',
    help: 'Canaries ativos no sistema',
  }),

  canariesTriggered: new Gauge({
    name: 'zehla_canaries_triggered',
    help: 'Canaries que foram tocados',
  }),
};

export { register as apiRegister };
