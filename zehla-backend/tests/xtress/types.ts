// XTRESS_TEST — Core Types
// EcoSSistema de Teste de Estresse para ZEHLA SMARTHOTEL

// ============================================================
// ENUMS
// ============================================================

export type ZCCAgent = 
  | "ZCC-REV" | "ZCC-MKT" | "ZCC-WPP" | "ZCC-ANA" 
  | "ZCC-FIN" | "ZCC-RES" | "ZCC-SEC" | "ZCC-OPN" 
  | "ZCC-SWP" | "ZCC-HRD";

export type MessageChannel = "whatsapp" | "sms" | "email" | "instagram";
export type MessageStatus = "QUEUED" | "SENT" | "DELIVERED" | "READ" | "FAILED";
export type MessageType = "marketing" | "transactional" | "service" | "alert";
export type PlanoZehla = "LITE" | "PRO" | "MAX";
export type SeverityLevel = "baixa" | "media" | "alta" | "critica";
export type TestRunStatus = "pending" | "running" | "completed" | "failed" | "cancelled";
export type VulnerabilityType = 
  | "timeout" | "bottleneck" | "memory_leak" | "race_condition" 
  | "fallback_chain" | "queue_overflow" | "cache_miss" | "error_spike" 
  | "degradation" | "single_point_of_failure";

export type GuestProfile = "casal" | "familia" | "solo" | "amigos" | "pet" | "business";
export type Formalidade = "formal" | "informal" | "muito_informal";
export type RegiaoBrasil = "sudeste" | "nordeste" | "sul" | "norte" | "centro_oeste";

export type MessageCategory = 
  | "disponibilidade" | "preco" | "reserva" | "checkin" 
  | "cancelamento" | "reclamacao" | "elogio" | "informacao"
  | "followup" | "fora_horario" | "solicitacao_especial" | "pet_friendly"
  | "grupo" | "imagem" | "longa" | "multi_idioma" | "malformada"
  | "transferencia" | "avaliacao" | "spam";

export type LoadProfile = 
  | "baseline" | "dia_normal" | "fim_de_semana" 
  | "feriado_bomba" | "crush_test" | "sustained_24h" | "chaos_monkey";

export type PousadaTipo = "familia" | "romantico" | "eco" | "pet_friendly" | "luxo" | "historico";
export type PousadaSituacao = "nova" | "consolidada" | "alta_temporada" | "baixa_temporada" | "com_problemas";

// ============================================================
// VIRTUAL POUSADA
// ============================================================

export interface VirtualPousada {
  id: string;
  propertyId: string;
  nome: string;
  destino: string;
  estado: string;
  regiao: string;
  totalQuartos: number;
  quartosDisponiveis: number;
  ocupacaoMedia: number;
  precoMedioDiaria: number;
  plano: PlanoZehla;
  tipo: PousadaTipo;
  situacao: PousadaSituacao;
  amenities: string[];
  whatsapp: string;
  email: string;
  agentesAtivos: ZCCAgent[];
  trendsKeywords: string[];
  reservasMes: number;
  avaliacaoMedia: number;
  mesesAtivo: number;
  createdAt: Date;
  scenarioId: string;
}

// ============================================================
// VIRTUAL GUEST
// ============================================================

export interface VirtualGuest {
  id: string;
  nomeCompleto: string;
  primeiroNome: string;
  sobrenome: string;
  telefone: string;
  ddd: string;
  estado: string;
  cidade: string;
  email: string;
  instagram?: string;
  perfilViagem: GuestProfile;
  faixaEtaria: "18-25" | "26-35" | "36-50" | "50+";
  preferenciaPagamento: "pix" | "cartao" | "boleto" | "dinheiro";
  formalidade: Formalidade;
  usaEmoji: boolean;
  regiaoLinguistica: RegiaoBrasil;
  ehHospedeRecorrente: boolean;
  visitasAnteriores: number;
  ultimaVisita?: Date;
  pousadaId: string;
  scenarioId: string;
  createdAt: Date;
}

// ============================================================
// GENERATED MESSAGE
// ============================================================

export interface GeneratedMessage {
  id: string;
  content: string;
  category: MessageCategory;
  pousadaId: string;
  guestId: string;
  guestPhone: string;
  channel: MessageChannel;
  timestamp: Date;
  scenarioId: string;
  metadata: {
    formalidade: Formalidade;
    regiao: RegiaoBrasil;
    usaEmoji: boolean;
    perfilHospede: GuestProfile;
    urgencia: "baixa" | "media" | "alta" | "critica";
    tokensEstimados: number;
  };
}

// ============================================================
// LOAD INJECTION
// ============================================================

export interface LoadConfig {
  profile: LoadProfile;
  maxConcurrent: number;
  requestsPerSecond: number;
  rampUpDuration: number;        // seconds
  sustainedDuration: number;     // seconds
  rampDownDuration: number;      // seconds
  timeoutPerRequest: number;     // ms
  retryOnFailure: boolean;
  maxRetries: number;
  batchSize: number;
  delayBetweenBatches: number;   // ms
  chaosEnabled: boolean;
  chaosProbability: number;      // 0-1
}

export interface InjectionEvent {
  id: string;
  messageId: string;
  testRunId: string;
  sentAt: Date;
  responseReceivedAt?: Date;
  statusCode?: number;
  responseTime?: number;         // ms
  error?: string;
  retryCount: number;
}

// ============================================================
// METRICS
// ============================================================

export interface MetricPoint {
  id: string;
  testRunId: string;
  timestamp: Date;
  category: "agent" | "zmg" | "lis" | "trends" | "system" | "injection";
  metricName: string;
  metricValue: number;
  unit?: string;                  // "ms", "%", "count", "msgs/s"
  agent?: ZCCAgent;
  channel?: MessageChannel;
  propertyId?: string;
  metadata: Record<string, unknown>;
}

export interface MetricSnapshot {
  timestamp: Date;
  throughput: number;             // msgs/s
  p50: number;                    // ms
  p95: number;                    // ms
  p99: number;                    // ms
  errorRate: number;              // %
  deliveryRate: number;           // %
  activeConnections: number;
  memoryUsageMB: number;
  cpuUsage: number;               // %
  queueSize: number;
}

// ============================================================
// VULNERABILITY
// ============================================================

export interface Vulnerability {
  id: string;
  testRunId: string;
  type: VulnerabilityType;
  severity: SeverityLevel;
  component: string;
  description: string;
  impact: string;
  recommendation: string;
  score: number;                  // 0-10
  evidence: {
    metricName: string;
    observed: number;
    threshold: number;
    duration: number;             // seconds
  };
  detectedAt: Date;
}

// ============================================================
// CALIBRATION
// ============================================================

export interface CalibrationAction {
  id: string;
  testRunId: string;
  vulnerabilityId: string;
  component: string;
  current: string;
  target: string;
  action: string;
  estimatedImpact: string;
  priority: SeverityLevel;
  complexity: "baixa" | "media" | "alta";
  phase: number;                  // 1-4
}

// ============================================================
// TEST RUN
// ============================================================

export interface TestRun {
  id: string;
  name: string;
  scenario: string;
  status: TestRunStatus;
  config: LoadConfig;
  startedAt?: Date;
  completedAt?: Date;
  totalMessages: number;
  totalErrors: number;
  totalFallbacks: number;
  avgResponseMs: number;
  p95ResponseMs: number;
  p99ResponseMs: number;
  deliveryRate: number;
  readRate: number;
  errorRate: number;
  throughputPeak: number;
  throughputAvg: number;
  memoryGrowthMB: number;
  cpuAvg: number;
  vulnerabilities: Vulnerability[];
  calibrations: CalibrationAction[];
  createdAt: Date;
}

// ============================================================
// TEST SCENARIOS
// ============================================================

export interface TestScenario {
  id: string;
  name: string;
  description: string;
  pousadaCount: number;
  guestMultiplier: number;       // guests per pousada
  messageMultiplier: number;     // messages per guest
  loadConfig: LoadConfig;
  durationMinutes: number;
  successCriteria: SuccessCriteria;
  tags: string[];
}

export interface SuccessCriteria {
  maxP95Ms: number;
  maxErrorRate: number;
  minDeliveryRate: number;
  maxMemoryGrowthMB: number;
  maxCpuAvg: number;
  maxDegradationPercent: number;
}

// ============================================================
// DESTINATIONS DATABASE
// ============================================================

export interface Destination {
  nome: string;
  estado: string;
  regiao: RegiaoBrasil;
  tipo: "litoral" | "serra" | "historico" | "natureza" | "urbano";
  clima: "tropical" | "subtropical" | "temperado" | "seco";
  altaTemporada: string[];        // meses ["dezembro", "janeiro", "fevereiro"]
  demandaMedia: number;           // 1-10
  precoMedio: number;             // R$ diaria
  ddd: string;
}

// ============================================================
// ZMG API TYPES (External)
// ============================================================

export interface ZMGSendMessageRequest {
  agentSource: ZCCAgent;
  propertyId: string;
  recipientPhone: string;
  recipientName?: string;
  messageType: MessageType;
  objective: string;
  content: string;
  context: {
    leadId?: string;
    reservationId?: string;
    trendSignalId?: string;
    swipeTemplateId?: string;
    customVariables: Record<string, string>;
  };
}

export interface ZMGSendMessageResponse {
  messageId: string;
  status: MessageStatus;
  primaryChannel: MessageChannel;
  estimatedCost: number;
  sentAt: string;
}

export interface ZMGWebhookEvent {
  messageId: string;
  event: string;
  channel: MessageChannel;
  status: MessageStatus;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// ============================================================
// CONFIGURATION
// ============================================================

export interface XtressConfig {
  zehlaBaseUrl: string;
  zehlaApiKey: string;
  zmgEndpoint: string;
  webhookCallbackUrl: string;
  dbPath: string;
  reportOutputDir: string;
  defaultTimeout: number;
  maxConcurrent: number;
  logLevel: "debug" | "info" | "warn" | "error";
}

// ============================================================
// CHAOS ENGINEERING
// ============================================================

export type ChaosType = 
  | "timeout" | "duplicate" | "malformed" | "burst" 
  | "silence" | "wrong_property" | "old_message" | "rate_limit";

export interface ChaosEvent {
  type: ChaosType;
  probability: number;
  duration?: number;              // seconds
  magnitude?: number;
}

// ============================================================
// REGIONAL DATA
// ============================================================

export const DDD_BY_STATE: Record<string, string[]> = {
  "SP": ["11","12","13","14","15","16","17","18","19"],
  "MG": ["31","32","33","34","35","37","38"],
  "RJ": ["21","22","24"],
  "BA": ["71","73","74","75","77"],
  "PR": ["41","42","43","44","45","46"],
  "SC": ["47","48","49"],
  "RS": ["51","53","54","55"],
  "PE": ["81","87"],
  "CE": ["85","88"],
  "PA": ["91","93","94"],
  "MA": ["98","99"],
  "GO": ["62","64"],
  "MT": ["65","66"],
  "MS": ["67"],
  "AM": ["92"],
  "RN": ["84"],
  "AL": ["82"],
  "PB": ["83"],
  "PI": ["86"],
  "SE": ["79"],
  "TO": ["63"],
  "RO": ["69"],
  "AC": ["68"],
  "AP": ["96"],
  "RR": ["95"],
  "ES": ["27","28"],
  "DF": ["61"],
};

export const AMENITIES_POOL: string[] = [
  "piscina", "wifi", "cafe_colonial", "estacionamento", "ar_condicionado",
  "churrasqueira", "playground", "spa", "lareira", "vista_mar",
  "vista_montanha", "jacuzzi", "sala_jogos", "bicicleta", "barco",
  "pet_friendly", "acessibilidade", "sala_eventos", "cozinha_compartilhada",
  "trilhas", "jardim", "hammock_area", "tv_cabo", "minibar",
  "roupa_cama_premium", "toalhas_quentes", "servico_quarto",
  "transfer", "guia_turistico", "massagem", "yoga"
];

export const PLANO_DISTRIBUTION: { plano: PlanoZehla; prob: number }[] = [
  { plano: "LITE", prob: 0.50 },
  { plano: "PRO", prob: 0.35 },
  { plano: "MAX", prob: 0.15 },
];

export const PRE_DEFINED_SCENARIOS: TestScenario[] = [
  {
    id: "domingo-a-noite",
    name: "Domingo a Noite",
    description: "Simula o pico de reservas de domingo a noite (maior volume semanal)",
    pousadaCount: 200,
    guestMultiplier: 10,
    messageMultiplier: 2,
    loadConfig: {
      profile: "fim_de_semana",
      maxConcurrent: 50,
      requestsPerSecond: 25,
      rampUpDuration: 1800,
      sustainedDuration: 7200,
      rampDownDuration: 1800,
      timeoutPerRequest: 10000,
      retryOnFailure: true,
      maxRetries: 2,
      batchSize: 10,
      delayBetweenBatches: 100,
      chaosEnabled: false,
      chaosProbability: 0,
    },
    durationMinutes: 180,
    successCriteria: { maxP95Ms: 2000, maxErrorRate: 0.05, minDeliveryRate: 0.95, maxMemoryGrowthMB: 50, maxCpuAvg: 0.80, maxDegradationPercent: 0.20 },
    tags: ["pico", "noite", "reservas"],
  },
  {
    id: "feriado-bomba",
    name: "Feriado Bomba",
    description: "Corpus Christi com demanda explosiva (+400%)",
    pousadaCount: 500,
    guestMultiplier: 15,
    messageMultiplier: 3,
    loadConfig: {
      profile: "feriado_bomba",
      maxConcurrent: 100,
      requestsPerSecond: 50,
      rampUpDuration: 3600,
      sustainedDuration: 21600,
      rampDownDuration: 3600,
      timeoutPerRequest: 15000,
      retryOnFailure: true,
      maxRetries: 3,
      batchSize: 20,
      delayBetweenBatches: 50,
      chaosEnabled: true,
      chaosProbability: 0.02,
    },
    durationMinutes: 480,
    successCriteria: { maxP95Ms: 3000, maxErrorRate: 0.08, minDeliveryRate: 0.92, maxMemoryGrowthMB: 100, maxCpuAvg: 0.85, maxDegradationPercent: 0.30 },
    tags: ["feriado", "alta_demanda", "trends"],
  },
  {
    id: "crush-test",
    name: "Crush Test",
    description: "Encontra o limite absoluto do sistema",
    pousadaCount: 500,
    guestMultiplier: 10,
    messageMultiplier: 2,
    loadConfig: {
      profile: "crush_test",
      maxConcurrent: 200,
      requestsPerSecond: 100,
      rampUpDuration: 600,
      sustainedDuration: 2400,
      rampDownDuration: 600,
      timeoutPerRequest: 30000,
      retryOnFailure: true,
      maxRetries: 1,
      batchSize: 50,
      delayBetweenBatches: 20,
      chaosEnabled: true,
      chaosProbability: 0.05,
    },
    durationMinutes: 60,
    successCriteria: { maxP95Ms: 10000, maxErrorRate: 0.50, minDeliveryRate: 0.70, maxMemoryGrowthMB: 200, maxCpuAvg: 0.95, maxDegradationPercent: 0.50 },
    tags: ["limite", "crash", "estresse"],
  },
  {
    id: "chaos-monkey",
    name: "Chaos Monkey",
    description: "Testa resiliencia com falhas aleatorias",
    pousadaCount: 200,
    guestMultiplier: 10,
    messageMultiplier: 2,
    loadConfig: {
      profile: "chaos_monkey",
      maxConcurrent: 50,
      requestsPerSecond: 20,
      rampUpDuration: 600,
      sustainedDuration: 9000,
      rampDownDuration: 600,
      timeoutPerRequest: 15000,
      retryOnFailure: true,
      maxRetries: 3,
      batchSize: 10,
      delayBetweenBatches: 100,
      chaosEnabled: true,
      chaosProbability: 0.15,
    },
    durationMinutes: 180,
    successCriteria: { maxP95Ms: 5000, maxErrorRate: 0.15, minDeliveryRate: 0.85, maxMemoryGrowthMB: 100, maxCpuAvg: 0.90, maxDegradationPercent: 0.40 },
    tags: ["chaos", "resiliencia", "falhas"],
  },
  {
    id: "maratona-24h",
    name: "Maratona 24 Horas",
    description: "Teste de resistencia prolongada (memory leaks, degradacao)",
    pousadaCount: 300,
    guestMultiplier: 8,
    messageMultiplier: 2,
    loadConfig: {
      profile: "sustained_24h",
      maxConcurrent: 50,
      requestsPerSecond: 15,
      rampUpDuration: 1800,
      sustainedDuration: 82800,
      rampDownDuration: 1800,
      timeoutPerRequest: 10000,
      retryOnFailure: true,
      maxRetries: 2,
      batchSize: 10,
      delayBetweenBatches: 150,
      chaosEnabled: false,
      chaosProbability: 0,
    },
    durationMinutes: 1440,
    successCriteria: { maxP95Ms: 3000, maxErrorRate: 0.05, minDeliveryRate: 0.95, maxMemoryGrowthMB: 50, maxCpuAvg: 0.80, maxDegradationPercent: 0.20 },
    tags: ["resistencia", "24h", "memory_leak"],
  },
  {
    id: "zero-to-hero",
    name: "Zero to Hero",
    description: "De 10 para 500 pousadas em 1 hora",
    pousadaCount: 500,
    guestMultiplier: 8,
    messageMultiplier: 2,
    loadConfig: {
      profile: "crush_test",
      maxConcurrent: 100,
      requestsPerSecond: 50,
      rampUpDuration: 3600,
      sustainedDuration: 1800,
      rampDownDuration: 600,
      timeoutPerRequest: 15000,
      retryOnFailure: true,
      maxRetries: 2,
      batchSize: 20,
      delayBetweenBatches: 50,
      chaosEnabled: false,
      chaosProbability: 0,
    },
    durationMinutes: 60,
    successCriteria: { maxP95Ms: 3000, maxErrorRate: 0.10, minDeliveryRate: 0.90, maxMemoryGrowthMB: 100, maxCpuAvg: 0.85, maxDegradationPercent: 0.25 },
    tags: ["scale", "crescimento", "stress"],
  },
];
