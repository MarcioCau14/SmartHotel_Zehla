// ZEHLA SmartHotel Cognitive OS — MAL Training Profiles
// Malha de Aprendizado Agêntica — Perfil de treinamento por agente

import type { AgentTrainingProfile } from './mal-types';
import { visibilityAgentProfile } from './visibility-agent';

// Helper: generate a 30-day trend from start → end with some noise
function generateTrend(start: number, end: number, noise = 0.003): number[] {
  const trend: number[] = [];
  for (let i = 0; i < 30; i++) {
    const base = start + ((end - start) * i) / 29;
    const n = (Math.random() - 0.5) * noise * 100;
    trend.push(+(base + n).toFixed(4));
  }
  // Ensure last value is close to target
  trend[29] = end;
  return trend;
}

// Helper: generate descending trend (e.g. latency decreasing)
function generateDescendingTrend(start: number, end: number, noise = 5): number[] {
  const trend: number[] = [];
  for (let i = 0; i < 30; i++) {
    const base = start - ((start - end) * i) / 29;
    const n = (Math.random() - 0.5) * noise;
    trend.push(Math.round(base + n));
  }
  trend[29] = end;
  return trend;
}

const profiles: AgentTrainingProfile[] = [
  // ===== AGENT 1: RECEPCIONISTA =====
  {
    agentId: 'agent-1',
    domain: 'hospitality_frontdesk',
    specializations: ['check-in', 'check-out', 'welcome_message', 'guest_registration', 'complaint_handling'],
    primaryIntents: ['wifi_password', 'late_checkin', 'early_checkout', 'room_upgrade', 'complaint_handling', 'extra_bed', 'amenity_request'],
    confidenceScore: 0.96,
    trainingStatus: 'ready',
    lastTrained: '2025-04-14T06:30:00Z',
    modelVersion: 3,
    knowledgeBase: [
      { id: 'doc-r1', title: 'Manual de Check-in e Check-out', source: 'pousada_docs', chunks: 24, embeddingModel: 'text-embedding-3-small', ingestedAt: '2025-01-15T10:00:00Z', retentionPolicy: 'tenant_specific' },
      { id: 'doc-r2', title: 'Protocolos de Atendimento ao Hóspede', source: 'pousada_docs', chunks: 18, embeddingModel: 'text-embedding-3-small', ingestedAt: '2025-01-15T10:05:00Z', retentionPolicy: 'tenant_specific' },
      { id: 'doc-r3', title: 'FAQ — Perguntas Frequentes dos Hóspedes', source: 'real_world', chunks: 42, embeddingModel: 'text-embedding-3-small', ingestedAt: '2025-02-20T14:30:00Z', retentionPolicy: 'global_pattern' },
      { id: 'doc-r4', title: 'Gestão de Reclamações — Best Practices', source: 'system_generated', chunks: 15, embeddingModel: 'text-embedding-3-small', ingestedAt: '2025-03-05T08:00:00Z', retentionPolicy: 'zdr_anonymized' },
      { id: 'doc-r5', title: 'WhatsApp Templates — Mensagens Prontas', source: 'pousada_docs', chunks: 31, embeddingModel: 'text-embedding-3-small', ingestedAt: '2025-03-10T12:00:00Z', retentionPolicy: 'tenant_specific' },
      { id: 'doc-r6', title: 'Histórico de Interações — Últimos 6 Meses', source: 'real_world', chunks: 156, embeddingModel: 'text-embedding-3-small', ingestedAt: '2025-04-01T00:00:00Z', retentionPolicy: 'zdr_anonymized' },
    ],
    learningMetrics: {
      totalInteractions: 2847,
      learnedPatterns: 412,
      accuracyTrend: generateTrend(0.920, 0.986),
      latencyTrend: generateDescendingTrend(78, 42),
      confidenceTrend: generateTrend(0.880, 0.960),
      successRateEvolution: [
        { period: 'Nov/24', rate: 92.1 },
        { period: 'Dez/24', rate: 94.3 },
        { period: 'Jan/25', rate: 95.8 },
        { period: 'Fev/25', rate: 97.1 },
        { period: 'Mar/25', rate: 97.9 },
        { period: 'Abr/25', rate: 98.6 },
      ],
      intentCoverage: [
        { intent: 'wifi_password', accuracy: 99.2, samples: 1247 },
        { intent: 'complaint_handling', accuracy: 96.8, samples: 321 },
        { intent: 'late_checkin', accuracy: 98.4, samples: 167 },
        { intent: 'amenity_request', accuracy: 97.1, samples: 198 },
        { intent: 'room_upgrade', accuracy: 94.3, samples: 89 },
        { intent: 'extra_bed', accuracy: 95.7, samples: 112 },
        { intent: 'early_checkout', accuracy: 96.9, samples: 134 },
      ],
      currentEpoch: 47,
      totalEpochs: 50,
      loss: 0.0231,
    },
    evolutionLog: [
      { date: '2025-01-15', type: 'document_ingested', description: 'Manual de check-in ingerido — 24 chunks processados', impact: 'high', metric: { before: 0, after: 24, unit: 'chunks' } },
      { date: '2025-02-03', type: 'pattern_learned', description: 'Padrão de check-in tardio identificado — 73% dos pedidos entre 22h-00h', impact: 'medium' },
      { date: '2025-02-28', type: 'intent_refined', description: 'Intent wifi_password refinado — cache hit subiu para 98.5%', impact: 'high', metric: { before: 88.2, after: 98.5, unit: '%' } },
      { date: '2025-03-15', type: 'model_updated', description: 'Modelo atualizado para v3 — fine-tuning com 2.847 interações', impact: 'critical', metric: { before: 0.93, after: 0.97, unit: 'accuracy' } },
      { date: '2025-03-22', type: 'pattern_learned', description: 'Padrão de upsell detectado — hóspedes Suite aceitam late checkout 3.2x mais', impact: 'medium' },
      { date: '2025-04-10', type: 'confidence_lock', description: 'Confiança atingiu 0.96 — modelo locked para produção', impact: 'critical', metric: { before: 0.94, after: 0.96, unit: 'confidence' } },
      { date: '2025-04-14', type: 'knowledge_expanded', description: 'Base expandida com histórico ZDR — 156 chunks anonimizados adicionados', impact: 'high', metric: { before: 286, after: 442, unit: 'chunks' } },
    ],
  },

  // ===== AGENT 2: CONCIERGE =====
  {
    agentId: 'agent-2',
    domain: 'tourism_local_info',
    specializations: ['local_restaurants', 'tours', 'transportation', 'beaches', 'events'],
    primaryIntents: ['local_tourism', 'restaurant_reservation', 'transfer_service', 'pool_hours', 'parking_info'],
    confidenceScore: 0.94,
    trainingStatus: 'ready',
    lastTrained: '2025-04-13T18:00:00Z',
    modelVersion: 2,
    knowledgeBase: [
      { id: 'doc-c1', title: 'Guia Turístico — Fernando de Noronha', source: 'pousada_docs', chunks: 36, embeddingModel: 'text-embedding-3-small', ingestedAt: '2025-01-20T09:00:00Z', retentionPolicy: 'tenant_specific' },
      { id: 'doc-c2', title: 'Restaurantes Locais — Recomendações Verificadas', source: 'real_world', chunks: 28, embeddingModel: 'text-embedding-3-small', ingestedAt: '2025-02-10T11:00:00Z', retentionPolicy: 'global_pattern' },
      { id: 'doc-c3', title: 'Serviços de Transfer e Transporte', source: 'pousada_docs', chunks: 12, embeddingModel: 'text-embedding-3-small', ingestedAt: '2025-02-15T16:00:00Z', retentionPolicy: 'tenant_specific' },
      { id: 'doc-c4', title: 'Calendário de Eventos Locais 2025', source: 'system_generated', chunks: 19, embeddingModel: 'text-embedding-3-small', ingestedAt: '2025-03-01T08:00:00Z', retentionPolicy: 'global_pattern' },
      { id: 'doc-c5', title: 'Feedback de Hóspedes — Avaliações de Restaurantes', source: 'real_world', chunks: 87, embeddingModel: 'text-embedding-3-small', ingestedAt: '2025-04-05T00:00:00Z', retentionPolicy: 'zdr_anonymized' },
    ],
    learningMetrics: {
      totalInteractions: 1534,
      learnedPatterns: 289,
      accuracyTrend: generateTrend(0.890, 0.985),
      latencyTrend: generateDescendingTrend(95, 58),
      confidenceTrend: generateTrend(0.850, 0.940),
      successRateEvolution: [
        { period: 'Nov/24', rate: 89.4 },
        { period: 'Dez/24', rate: 92.1 },
        { period: 'Jan/25', rate: 94.7 },
        { period: 'Fev/25', rate: 96.2 },
        { period: 'Mar/25', rate: 97.5 },
        { period: 'Abr/25', rate: 98.5 },
      ],
      intentCoverage: [
        { intent: 'local_tourism', accuracy: 97.8, samples: 289 },
        { intent: 'restaurant_reservation', accuracy: 96.2, samples: 445 },
        { intent: 'pool_hours', accuracy: 99.1, samples: 87 },
        { intent: 'parking_info', accuracy: 98.4, samples: 634 },
        { intent: 'transfer_service', accuracy: 93.7, samples: 76 },
      ],
      currentEpoch: 42,
      totalEpochs: 50,
      loss: 0.0318,
    },
    evolutionLog: [
      { date: '2025-01-20', type: 'document_ingested', description: 'Guia turístico de Noronha ingerido — 36 chunks', impact: 'high', metric: { before: 0, after: 36, unit: 'chunks' } },
      { date: '2025-02-10', type: 'knowledge_expanded', description: 'Recomendações de restaurantes verificadas adicionadas', impact: 'medium' },
      { date: '2025-02-25', type: 'pattern_learned', description: 'Padrão sazonal detectado — Tours de barco em alta entre dez-mar', impact: 'medium' },
      { date: '2025-03-20', type: 'model_updated', description: 'Modelo atualizado para v2 — embeddings refinados com feedback de hóspedes', impact: 'high', metric: { before: 0.92, after: 0.97, unit: 'accuracy' } },
      { date: '2025-04-05', type: 'knowledge_expanded', description: '87 chunks de avaliações anonimizadas ingeridos', impact: 'medium' },
      { date: '2025-04-12', type: 'confidence_lock', description: 'Confiança locked em 0.94 — ready para produção', impact: 'high' },
    ],
  },

  // ===== AGENT 3: RESERVAS =====
  {
    agentId: 'agent-3',
    domain: 'reservation_management',
    specializations: ['booking', 'availability_check', 'confirmation', 'cancellation', 'modification', 'overbooking_prevention'],
    primaryIntents: ['reservation_create', 'reservation_modify', 'reservation_cancel', 'availability_check', 'group_booking'],
    confidenceScore: 0.97,
    trainingStatus: 'ready',
    lastTrained: '2025-04-14T04:15:00Z',
    modelVersion: 3,
    knowledgeBase: [
      { id: 'doc-rs1', title: 'Políticas de Reserva e Cancelamento', source: 'pousada_docs', chunks: 22, embeddingModel: 'text-embedding-3-small', ingestedAt: '2025-01-10T08:00:00Z', retentionPolicy: 'tenant_specific' },
      { id: 'doc-rs2', title: 'Tabela de Preços Sazonal 2025', source: 'pousada_docs', chunks: 14, embeddingModel: 'text-embedding-3-small', ingestedAt: '2025-01-10T08:05:00Z', retentionPolicy: 'tenant_specific' },
      { id: 'doc-rs3', title: 'Padrões de Overbooking — Análise Histórica', source: 'real_world', chunks: 33, embeddingModel: 'text-embedding-3-small', ingestedAt: '2025-02-28T12:00:00Z', retentionPolicy: 'zdr_anonymized' },
      { id: 'doc-rs4', title: 'Gestão de Disponibilidade em Tempo Real', source: 'system_generated', chunks: 19, embeddingModel: 'text-embedding-3-small', ingestedAt: '2025-03-15T09:00:00Z', retentionPolicy: 'global_pattern' },
      { id: 'doc-rs5', title: 'Histórico de Reservas — Últimos 12 Meses', source: 'real_world', chunks: 203, embeddingModel: 'text-embedding-3-small', ingestedAt: '2025-04-10T00:00:00Z', retentionPolicy: 'zdr_anonymized' },
    ],
    learningMetrics: {
      totalInteractions: 3210,
      learnedPatterns: 498,
      accuracyTrend: generateTrend(0.935, 0.992),
      latencyTrend: generateDescendingTrend(65, 35),
      confidenceTrend: generateTrend(0.900, 0.970),
      successRateEvolution: [
        { period: 'Nov/24', rate: 93.5 },
        { period: 'Dez/24', rate: 95.2 },
        { period: 'Jan/25', rate: 96.8 },
        { period: 'Fev/25', rate: 97.9 },
        { period: 'Mar/25', rate: 98.4 },
        { period: 'Abr/25', rate: 99.2 },
      ],
      intentCoverage: [
        { intent: 'reservation_create', accuracy: 99.1, samples: 876 },
        { intent: 'reservation_modify', accuracy: 98.4, samples: 342 },
        { intent: 'reservation_cancel', accuracy: 97.8, samples: 198 },
        { intent: 'availability_check', accuracy: 99.5, samples: 1523 },
        { intent: 'group_booking', accuracy: 95.2, samples: 67 },
      ],
      currentEpoch: 49,
      totalEpochs: 50,
      loss: 0.0145,
    },
    evolutionLog: [
      { date: '2025-01-10', type: 'document_ingested', description: 'Políticas de reserva e tabela de preços ingeridas', impact: 'high' },
      { date: '2025-02-05', type: 'pattern_learned', description: 'Padrão de cancelamento: 68% das reservas canceladas são feitas <48h', impact: 'medium' },
      { date: '2025-02-28', type: 'knowledge_expanded', description: 'Análise de overbooking histórica adicionada — 33 chunks', impact: 'high' },
      { date: '2025-03-10', type: 'intent_refined', description: 'Intent availability_check refinado — latência caiu 40%', impact: 'critical', metric: { before: 95, after: 57, unit: 'ms' } },
      { date: '2025-03-25', type: 'model_updated', description: 'Modelo v3 deployado — overbooking prevention ativo', impact: 'critical' },
      { date: '2025-04-10', type: 'knowledge_expanded', description: 'Histórico de 12 meses de reservas ingerido — 203 chunks', impact: 'high' },
      { date: '2025-04-14', type: 'confidence_lock', description: 'Confiança locked em 0.97 — epoch 49/50, loss mínima', impact: 'critical' },
    ],
  },

  // ===== AGENT 4: HOUSEKEEPING =====
  {
    agentId: 'agent-4',
    domain: 'housekeeping_maintenance',
    specializations: ['room_cleaning', 'maintenance_dispatch', 'preventive_maintenance', 'inventory_control', 'quality_inspection'],
    primaryIntents: ['room_cleaning', 'maintenance_request', 'minibar_refill', 'laundry_service', 'deep_cleaning'],
    confidenceScore: 0.98,
    trainingStatus: 'ready',
    lastTrained: '2025-04-14T02:00:00Z',
    modelVersion: 4,
    knowledgeBase: [
      { id: 'doc-h1', title: 'SOP — Limpeza de Quartos Padrão', source: 'pousada_docs', chunks: 28, embeddingModel: 'text-embedding-3-small', ingestedAt: '2025-01-12T07:00:00Z', retentionPolicy: 'tenant_specific' },
      { id: 'doc-h2', title: 'Checklist de Inspeção de Qualidade', source: 'pousada_docs', chunks: 16, embeddingModel: 'text-embedding-3-small', ingestedAt: '2025-01-12T07:05:00Z', retentionPolicy: 'tenant_specific' },
      { id: 'doc-h3', title: 'Protocolos de Manutenção Preventiva', source: 'system_generated', chunks: 22, embeddingModel: 'text-embedding-3-small', ingestedAt: '2025-02-01T10:00:00Z', retentionPolicy: 'global_pattern' },
      { id: 'doc-h4', title: 'Controle de Estoque — Produtos de Limpeza', source: 'pousada_docs', chunks: 11, embeddingModel: 'text-embedding-3-small', ingestedAt: '2025-02-15T14:00:00Z', retentionPolicy: 'tenant_specific' },
      { id: 'doc-h5', title: 'Histórico de Ordens de Manutenção', source: 'real_world', chunks: 178, embeddingModel: 'text-embedding-3-small', ingestedAt: '2025-04-08T00:00:00Z', retentionPolicy: 'zdr_anonymized' },
      { id: 'doc-h6', title: 'Feedback de Hóspedes — Limpeza e Conforto', source: 'real_world', chunks: 94, embeddingModel: 'text-embedding-3-small', ingestedAt: '2025-04-12T00:00:00Z', retentionPolicy: 'zdr_anonymized' },
    ],
    learningMetrics: {
      totalInteractions: 4218,
      learnedPatterns: 634,
      accuracyTrend: generateTrend(0.945, 0.994),
      latencyTrend: generateDescendingTrend(48, 22),
      confidenceTrend: generateTrend(0.920, 0.980),
      successRateEvolution: [
        { period: 'Nov/24', rate: 94.5 },
        { period: 'Dez/24', rate: 96.1 },
        { period: 'Jan/25', rate: 97.4 },
        { period: 'Fev/25', rate: 98.3 },
        { period: 'Mar/25', rate: 98.9 },
        { period: 'Abr/25', rate: 99.4 },
      ],
      intentCoverage: [
        { intent: 'room_cleaning', accuracy: 99.6, samples: 1856 },
        { intent: 'maintenance_request', accuracy: 98.2, samples: 534 },
        { intent: 'minibar_refill', accuracy: 97.8, samples: 312 },
        { intent: 'laundry_service', accuracy: 98.5, samples: 278 },
        { intent: 'deep_cleaning', accuracy: 97.1, samples: 98 },
      ],
      currentEpoch: 50,
      totalEpochs: 50,
      loss: 0.0089,
    },
    evolutionLog: [
      { date: '2025-01-12', type: 'document_ingested', description: 'SOP de limpeza e checklist ingeridos — 44 chunks', impact: 'high' },
      { date: '2025-01-30', type: 'pattern_learned', description: 'Padrão temporal: quartos 1-5 precisam de limpeza antes das 14h em 92% dos dias', impact: 'high' },
      { date: '2025-02-20', type: 'intent_refined', description: 'Intent maintenance_request refinado — dispatch automático ativo', impact: 'critical', metric: { before: 85, after: 98, unit: '% accuracy' } },
      { date: '2025-03-05', type: 'model_updated', description: 'Modelo v4 — predictive maintenance integrado', impact: 'critical', metric: { before: 0.95, after: 0.99, unit: 'accuracy' } },
      { date: '2025-03-28', type: 'confidence_lock', description: 'Confiança locked em 0.98 — menor loss da frota (0.0089)', impact: 'critical' },
      { date: '2025-04-08', type: 'knowledge_expanded', description: '178 chunks de ordens de manutenção históricas ingeridos', impact: 'high' },
      { date: '2025-04-12', type: 'pattern_learned', description: 'Insight: ACs das suítes precisam de manutenção a cada 45 dias', impact: 'medium' },
    ],
  },

  // ===== AGENT 5: FINANCEIRO =====
  {
    agentId: 'agent-5',
    domain: 'financial_operations',
    specializations: ['payment_processing', 'pix_transactions', 'invoicing', 'revenue_tracking', 'refund_processing'],
    primaryIntents: ['payment_issue', 'invoice_request', 'refund_request', 'pix_confirmation', 'receipt'],
    confidenceScore: 0.99,
    trainingStatus: 'ready',
    lastTrained: '2025-04-14T05:45:00Z',
    modelVersion: 4,
    knowledgeBase: [
      { id: 'doc-f1', title: 'Procedimentos de Pagamento — PIX, Cartão, Dinheiro', source: 'pousada_docs', chunks: 20, embeddingModel: 'text-embedding-3-small', ingestedAt: '2025-01-08T08:00:00Z', retentionPolicy: 'tenant_specific' },
      { id: 'doc-f2', title: 'Política de Reembolso e Estorno', source: 'pousada_docs', chunks: 14, embeddingModel: 'text-embedding-3-small', ingestedAt: '2025-01-08T08:05:00Z', retentionPolicy: 'tenant_specific' },
      { id: 'doc-f3', title: 'LGPD — Tratamento de Dados Financeiros', source: 'system_generated', chunks: 18, embeddingModel: 'text-embedding-3-small', ingestedAt: '2025-01-15T12:00:00Z', retentionPolicy: 'zdr_anonymized' },
      { id: 'doc-f4', title: 'Modelos de Nota Fiscal e Recibo', source: 'pousada_docs', chunks: 9, embeddingModel: 'text-embedding-3-small', ingestedAt: '2025-02-01T10:00:00Z', retentionPolicy: 'tenant_specific' },
      { id: 'doc-f5', title: 'Histórico de Transações — Últimos 12 Meses', source: 'real_world', chunks: 312, embeddingModel: 'text-embedding-3-small', ingestedAt: '2025-04-10T00:00:00Z', retentionPolicy: 'zdr_anonymized' },
    ],
    learningMetrics: {
      totalInteractions: 1892,
      learnedPatterns: 367,
      accuracyTrend: generateTrend(0.960, 0.997),
      latencyTrend: generateDescendingTrend(72, 50),
      confidenceTrend: generateTrend(0.940, 0.990),
      successRateEvolution: [
        { period: 'Nov/24', rate: 96.2 },
        { period: 'Dez/24', rate: 97.5 },
        { period: 'Jan/25', rate: 98.4 },
        { period: 'Fev/25', rate: 99.0 },
        { period: 'Mar/25', rate: 99.3 },
        { period: 'Abr/25', rate: 99.7 },
      ],
      intentCoverage: [
        { intent: 'pix_confirmation', accuracy: 99.8, samples: 634 },
        { intent: 'invoice_request', accuracy: 99.5, samples: 312 },
        { intent: 'receipt', accuracy: 99.7, samples: 456 },
        { intent: 'payment_issue', accuracy: 99.2, samples: 234 },
        { intent: 'refund_request', accuracy: 98.6, samples: 98 },
      ],
      currentEpoch: 50,
      totalEpochs: 50,
      loss: 0.0056,
    },
    evolutionLog: [
      { date: '2025-01-08', type: 'document_ingested', description: 'Procedimentos financeiros ingeridos — 34 chunks', impact: 'high' },
      { date: '2025-01-20', type: 'pattern_learned', description: 'Padrão PIX: 87% dos pagamentos via PIX são confirmados <5 min', impact: 'medium' },
      { date: '2025-02-10', type: 'intent_refined', description: 'Intent pix_confirmation refinado — automação total', impact: 'critical', metric: { before: 94, after: 99.8, unit: '% accuracy' } },
      { date: '2025-03-01', type: 'model_updated', description: 'Modelo v4 — LGPD compliance integrado ao pipeline financeiro', impact: 'critical' },
      { date: '2025-03-20', type: 'confidence_lock', description: 'Confiança locked em 0.99 — loss mais baixo da frota', impact: 'critical' },
      { date: '2025-04-10', type: 'knowledge_expanded', description: '312 chunks de transações anonimizadas ingeridos', impact: 'high' },
    ],
  },

  // ===== AGENT 6: GUARDIÃO =====
  {
    agentId: 'agent-6',
    domain: 'security_compliance',
    specializations: ['fraud_detection', 'data_protection', 'access_control', 'lgpd_compliance', 'threat_monitoring'],
    primaryIntents: ['security_alert', 'data_breach', 'access_violation', 'compliance_check', 'audit_request'],
    confidenceScore: 0.99,
    trainingStatus: 'ready',
    lastTrained: '2025-04-14T03:00:00Z',
    modelVersion: 4,
    knowledgeBase: [
      { id: 'doc-g1', title: 'Manual LGPD — Diretrizes de Proteção de Dados', source: 'system_generated', chunks: 45, embeddingModel: 'text-embedding-3-small', ingestedAt: '2025-01-05T08:00:00Z', retentionPolicy: 'zdr_anonymized' },
      { id: 'doc-g2', title: 'PCI DSS — Padrões de Segurança de Cartões', source: 'system_generated', chunks: 38, embeddingModel: 'text-embedding-3-small', ingestedAt: '2025-01-05T08:05:00Z', retentionPolicy: 'zdr_anonymized' },
      { id: 'doc-g3', title: 'Políticas de Acesso e Controle de Permissões', source: 'pousada_docs', chunks: 16, embeddingModel: 'text-embedding-3-small', ingestedAt: '2025-01-15T10:00:00Z', retentionPolicy: 'tenant_specific' },
      { id: 'doc-g4', title: 'Histórico de Ameaças e Incidentes', source: 'real_world', chunks: 267, embeddingModel: 'text-embedding-3-small', ingestedAt: '2025-04-01T00:00:00Z', retentionPolicy: 'zdr_anonymized' },
    ],
    learningMetrics: {
      totalInteractions: 2156,
      learnedPatterns: 523,
      accuracyTrend: generateTrend(0.975, 0.999),
      latencyTrend: generateDescendingTrend(35, 15),
      confidenceTrend: generateTrend(0.960, 0.990),
      successRateEvolution: [
        { period: 'Nov/24', rate: 97.5 },
        { period: 'Dez/24', rate: 98.3 },
        { period: 'Jan/25', rate: 99.1 },
        { period: 'Fev/25', rate: 99.5 },
        { period: 'Mar/25', rate: 99.7 },
        { period: 'Abr/25', rate: 99.9 },
      ],
      intentCoverage: [
        { intent: 'security_alert', accuracy: 99.9, samples: 876 },
        { intent: 'compliance_check', accuracy: 99.8, samples: 543 },
        { intent: 'access_violation', accuracy: 99.7, samples: 234 },
        { intent: 'audit_request', accuracy: 99.9, samples: 312 },
        { intent: 'data_breach', accuracy: 99.5, samples: 45 },
      ],
      currentEpoch: 50,
      totalEpochs: 50,
      loss: 0.0034,
    },
    evolutionLog: [
      { date: '2025-01-05', type: 'document_ingested', description: 'Manual LGPD e PCI DSS ingeridos — 83 chunks', impact: 'critical' },
      { date: '2025-01-25', type: 'pattern_learned', description: 'Padrão de fraude: 3 IPs com anomalias de login bloqueados automaticamente', impact: 'critical', metric: { before: 12, after: 0, unit: 'breaches' } },
      { date: '2025-02-15', type: 'model_updated', description: 'Modelo v3 — HITL (Human-in-the-Loop) integrado para refunds', impact: 'critical' },
      { date: '2025-03-01', type: 'intent_refined', description: 'Intent audit_request refinado — geração automática de relatórios', impact: 'high' },
      { date: '2025-03-15', type: 'confidence_lock', description: 'Confiança locked em 0.99 — menor latência da frota (15ms)', impact: 'critical' },
      { date: '2025-04-01', type: 'knowledge_expanded', description: '267 chunks de incidentes de segurança ingeridos', impact: 'high' },
      { date: '2025-04-14', type: 'model_updated', description: 'Modelo v4 — sovereign model hash verification integrado', impact: 'critical' },
    ],
  },

  // ===== AGENT 7: MARKETING =====
  {
    agentId: 'agent-7',
    domain: 'marketing_acquisition',
    specializations: ['campaign_management', 'lead_generation', 'social_media', 'seo_optimization', 'guest_retention'],
    primaryIntents: ['campaign_create', 'lead_qualify', 'review_request', 'loyalty_program', 'promotion'],
    confidenceScore: 0.82,
    trainingStatus: 'training',
    lastTrained: '2025-04-13T22:00:00Z',
    modelVersion: 2,
    knowledgeBase: [
      { id: 'doc-m1', title: 'Estratégias de Marketing para Pousadas', source: 'system_generated', chunks: 34, embeddingModel: 'text-embedding-3-small', ingestedAt: '2025-02-01T10:00:00Z', retentionPolicy: 'global_pattern' },
      { id: 'doc-m2', title: 'Templates de Campanhas — Alta Temporada', source: 'pousada_docs', chunks: 21, embeddingModel: 'text-embedding-3-small', ingestedAt: '2025-02-15T14:00:00Z', retentionPolicy: 'tenant_specific' },
      { id: 'doc-m3', title: 'Análise de Leads B2B — Pipeline', source: 'real_world', chunks: 56, embeddingModel: 'text-embedding-3-small', ingestedAt: '2025-03-10T12:00:00Z', retentionPolicy: 'zdr_anonymized' },
      { id: 'doc-m4', title: 'Redes Sociais — Melhores Práticas Hospitalidade', source: 'system_generated', chunks: 28, embeddingModel: 'text-embedding-3-small', ingestedAt: '2025-03-25T09:00:00Z', retentionPolicy: 'global_pattern' },
    ],
    learningMetrics: {
      totalInteractions: 834,
      learnedPatterns: 156,
      accuracyTrend: generateTrend(0.780, 0.880),
      latencyTrend: generateDescendingTrend(185, 115),
      confidenceTrend: generateTrend(0.720, 0.820),
      successRateEvolution: [
        { period: 'Nov/24', rate: 78.2 },
        { period: 'Dez/24', rate: 80.5 },
        { period: 'Jan/25', rate: 83.1 },
        { period: 'Fev/25', rate: 86.4 },
        { period: 'Mar/25', rate: 89.7 },
        { period: 'Abr/25', rate: 91.3 },
      ],
      intentCoverage: [
        { intent: 'campaign_create', accuracy: 87.3, samples: 145 },
        { intent: 'lead_qualify', accuracy: 84.6, samples: 234 },
        { intent: 'review_request', accuracy: 89.2, samples: 178 },
        { intent: 'loyalty_program', accuracy: 81.5, samples: 67 },
        { intent: 'promotion', accuracy: 86.8, samples: 89 },
      ],
      currentEpoch: 33,
      totalEpochs: 50,
      loss: 0.0891,
    },
    evolutionLog: [
      { date: '2025-02-01', type: 'document_ingested', description: 'Estratégias de marketing ingeridas — 34 chunks', impact: 'medium' },
      { date: '2025-02-20', type: 'pattern_learned', description: 'Padrão: leads com score >85 convertem 4.2x mais', impact: 'high', metric: { before: 12, after: 48, unit: '% conversion' } },
      { date: '2025-03-10', type: 'knowledge_expanded', description: 'Pipeline B2B de leads adicionado — 56 chunks', impact: 'medium' },
      { date: '2025-03-25', type: 'intent_refined', description: 'Intent lead_qualify refinado — scoring aprimorado com dados de mercado', impact: 'high' },
      { date: '2025-04-10', type: 'model_updated', description: 'Modelo v2 — treinamento com dados de alta temporada iniciado', impact: 'high' },
      { date: '2025-04-13', type: 'pattern_learned', description: 'Padrão sazonal: promoções de feriado geram 3.8x mais engagement', impact: 'medium' },
    ],
  },

  // ===== AGENT 8: APRENDIZ =====
  {
    agentId: 'agent-8',
    domain: 'continuous_learning',
    specializations: ['pattern_extraction', 'model_optimization', 'cross_agent_learning', 'knowledge_synthesis', 'meta_learning'],
    primaryIntents: ['optimize_response', 'detect_pattern', 'suggest_improvement', 'cross_reference', 'knowledge_gap'],
    confidenceScore: 0.91,
    trainingStatus: 'learning',
    lastTrained: '2025-04-14T07:00:00Z',
    modelVersion: 2,
    knowledgeBase: [
      { id: 'doc-a1', title: 'Meta-Learning — Fundamentos e Aplicações', source: 'system_generated', chunks: 42, embeddingModel: 'text-embedding-3-small', ingestedAt: '2025-01-05T08:00:00Z', retentionPolicy: 'global_pattern' },
      { id: 'doc-a2', title: 'Cross-Agent Patterns — Síntese de Conhecimento', source: 'system_generated', chunks: 67, embeddingModel: 'text-embedding-3-small', ingestedAt: '2025-02-20T12:00:00Z', retentionPolicy: 'global_pattern' },
      { id: 'doc-a3', title: 'Knowledge Gaps Identificados — Q1 2025', source: 'system_generated', chunks: 23, embeddingModel: 'text-embedding-3-small', ingestedAt: '2025-03-30T06:00:00Z', retentionPolicy: 'global_pattern' },
      { id: 'doc-a4', title: 'Otimização de Respostas — Benchmarks', source: 'system_generated', chunks: 35, embeddingModel: 'text-embedding-3-small', ingestedAt: '2025-04-10T00:00:00Z', retentionPolicy: 'global_pattern' },
      { id: 'doc-a5', title: 'Agent Communication Logs — Cross-Reference Data', source: 'real_world', chunks: 189, embeddingModel: 'text-embedding-3-small', ingestedAt: '2025-04-12T00:00:00Z', retentionPolicy: 'zdr_anonymized' },
    ],
    learningMetrics: {
      totalInteractions: 1245,
      learnedPatterns: 234,
      accuracyTrend: generateTrend(0.850, 0.930),
      latencyTrend: generateDescendingTrend(280, 200),
      confidenceTrend: generateTrend(0.830, 0.910),
      successRateEvolution: [
        { period: 'Nov/24', rate: 85.2 },
        { period: 'Dez/24', rate: 87.8 },
        { period: 'Jan/25', rate: 90.1 },
        { period: 'Fev/25', rate: 91.9 },
        { period: 'Mar/25', rate: 93.2 },
        { period: 'Abr/25', rate: 94.5 },
      ],
      intentCoverage: [
        { intent: 'optimize_response', accuracy: 94.2, samples: 345 },
        { intent: 'detect_pattern', accuracy: 92.8, samples: 267 },
        { intent: 'suggest_improvement', accuracy: 91.5, samples: 198 },
        { intent: 'cross_reference', accuracy: 93.6, samples: 234 },
        { intent: 'knowledge_gap', accuracy: 89.3, samples: 123 },
      ],
      currentEpoch: 38,
      totalEpochs: 50,
      loss: 0.0567,
    },
    evolutionLog: [
      { date: '2025-01-05', type: 'document_ingested', description: 'Fundamentos de meta-learning ingeridos — 42 chunks', impact: 'high' },
      { date: '2025-02-10', type: 'pattern_learned', description: 'Cross-agent pattern: Reservas + Recepcionista têm 12% de overlap de intents', impact: 'high' },
      { date: '2025-02-20', type: 'knowledge_expanded', description: 'Síntese cross-agent inicial — 67 chunks de padrões compartilhados', impact: 'high' },
      { date: '2025-03-15', type: 'model_updated', description: 'Modelo v2 — meta-learning ativo com feedback loop de 6 agentes', impact: 'critical' },
      { date: '2025-03-30', type: 'pattern_learned', description: 'Knowledge gap identificado: Marketing precisa de 23% mais dados sazonais', impact: 'medium', metric: { before: 23, after: 23, unit: '% gap' } },
      { date: '2025-04-10', type: 'knowledge_expanded', description: 'Benchmarks de otimização adicionados — 35 chunks', impact: 'medium' },
      { date: '2025-04-12', type: 'pattern_learned', description: 'Cross-reference: padrão de horário pico idêntico em 4 propriedades', impact: 'high' },
      { date: '2025-04-14', type: 'pattern_learned', description: 'Sintetizando conhecimento cross-agent de 6 propriedades em tempo real', impact: 'critical' },
    ],
  },
  visibilityAgentProfile,
];

export function getTrainingProfiles(): AgentTrainingProfile[] {
  return profiles;
}
