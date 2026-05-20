// ZEHLA SmartHotel Cognitive OS — MAL Types
// Malha de Aprendizado Agêntica (Machine Learning Agent Learning System)

export interface AgentTrainingProfile {
  agentId: string;
  domain: string;
  specializations: string[];
  primaryIntents: string[];
  knowledgeBase: KnowledgeDocument[];
  learningMetrics: LearningMetrics;
  confidenceScore: number; // 0-1, based on KL divergence (>=0.90 = locked)
  trainingStatus: 'idle' | 'learning' | 'training' | 'deploying' | 'ready';
  lastTrained: string;
  modelVersion: number;
  evolutionLog: EvolutionEntry[];
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  source: 'pousada_docs' | 'real_world' | 'system_generated' | 'uploaded';
  chunks: number;
  embeddingModel: string;
  ingestedAt: string;
  retentionPolicy: 'zdr_anonymized' | 'global_pattern' | 'tenant_specific';
}

export interface LearningMetrics {
  totalInteractions: number;
  learnedPatterns: number;
  accuracyTrend: number[]; // last 30 days
  latencyTrend: number[]; // last 30 days
  confidenceTrend: number[]; // last 30 days
  successRateEvolution: { period: string; rate: number }[];
  intentCoverage: { intent: string; accuracy: number; samples: number }[];
  currentEpoch: number;
  totalEpochs: number;
  loss: number; // training loss
}

export interface EvolutionEntry {
  date: string;
  type: 'pattern_learned' | 'intent_refined' | 'model_updated' | 'knowledge_expanded' | 'confidence_lock' | 'document_ingested';
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  metric?: { before: number; after: number; unit: string };
}

export interface AgentLearningState {
  agentId: string;
  isActive: boolean;
  currentTask: string | null;
  progress: number; // 0-100
  patternsProcessed: number;
  errors: number;
}
