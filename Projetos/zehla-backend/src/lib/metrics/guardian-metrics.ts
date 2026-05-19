import { Counter, Histogram, Gauge, register } from 'prom-client';


// src/lib/metrics/guardian-metrics.ts

// Registradores do Guardian
export const guardianMetrics = {
  alertsTotal: new Counter({
    name: 'guardian_alerts_total',
    help: 'Total de alertas processados pelo Guardian',
    labelNames: ['severity', 'alert_type', 'tenant_id'],
  }),

  alertLatency: new Histogram({
    name: 'guardian_alert_latency_seconds',
    help: 'Tempo de processamento de um alerta',
    labelNames: ['severity'],
    buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1],
  }),

  actionsExecuted: new Counter({
    name: 'guardian_actions_total',
    help: 'Ações executadas pelo Guardian',
    labelNames: ['action', 'result'],
  }),

  tenantsIsolated: new Gauge({
    name: 'guardian_tenants_isolated',
    help: 'Número de tenants atualmente isolados',
  }),

  incidentsActive: new Gauge({
    name: 'guardian_incidents_active',
    help: 'Incidentes de segurança ativos',
    labelNames: ['severity'],
  }),

  workerUp: new Gauge({
    name: 'guardian_worker_up',
    help: 'Status do worker Guardian (1=up, 0=down)',
  }),

  redisStreamLag: new Gauge({
    name: 'guardian_redis_stream_lag_seconds',
    help: 'Lag entre produção e consumo do stream Redis',
  }),
};

// Exporta registry para endpoint HTTP
export { register };
