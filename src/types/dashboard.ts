// ==============================================================================
// ZEHLA DDC — Dashboard do Cliente — Type Definitions
// ==============================================================================
// Interfaces de produção para o fluxo completo do DDC:
//   1. TenantProfile      — Perfil unificado do proprietário
//   2. PropertyOnboarding — Fluxo Airbnb URL → Scrape → Review → Ativação
//   3. ClosingNotification — Payload de notificação ao dono quando Zélla fecha reserva
//   4. TrainingClosingScenario — Schema de treinamento do Cérebro Zélla
//   5. OnboardingWizardState — Estado do wizard multi-step
//   6. ScraperResult — Saída estruturada do scraping Airbnb
//
// Alinhado com:
//   - Prisma models: Tenant, Property, AirBProperty, AirBScrapingJob, AirBSubscription
//   - Tipos existentes: src/types/ddc.ts, src/types/index.ts
// ==============================================================================

// ==============================================================================
// UTILITY TYPES
// ==============================================================================

/** Fonte de dados usada para preencher um campo durante o onboarding */
export type ScrapingSource = 'airbnb_api' | 'ai_extractor' | 'manual' | 'demo';

/** Status geral do onboarding de uma propriedade */
export type OnboardingStatus =
  | 'pending'
  | 'in_progress'
  | 'scraping'
  | 'reviewing'
  | 'customizing'
  | 'activating'
  | 'active'
  | 'paused'
  | 'error';

/** Etapas do wizard de onboarding, em ordem sequencial */
export type OnboardingStep =
  | 'url_entry'
  | 'scraping'
  | 'review_auto'
  | 'customize_manual'
  | 'subscription_check'
  | 'activate';

/** Todas as etapas possíveis do wizard, em ordem */
export const ONBOARDING_STEP_ORDER: readonly OnboardingStep[] = [
  'url_entry',
  'scraping',
  'review_auto',
  'customize_manual',
  'subscription_check',
  'activate',
] as const;

/**
 * Envolve qualquer campo com metadados de confiança e proveniência.
 * Usado para distinguir campos auto-preenchidos (com confiança < 1.0)
 * daqueles confirmados manualmente pelo proprietário.
 *
 * @template T - Tipo do valor armazenado no campo
 */
export interface FieldWithConfidence<T> {
  /** O valor do campo */
  value: T;
  /**
   * Score de confiança do preenchimento automático (0.0 a 1.0).
   * - 1.0 = confirmado manualmente pelo proprietário
   * - 0.8–0.99 = extraído com alta confiança
   * - 0.5–0.79 = precisa de revisão
   * - < 0.5 = incerto, provavelmente incorreto
   */
  confidence: number;
  /** De onde o valor veio */
  source: ScrapingSource;
  /** Se o proprietário já revisou e confirmou este campo */
  reviewed: boolean;
}

// ==============================================================================
// 1. TENANT PROFILE — Perfil unificado do proprietário
// ==============================================================================

/** Método de pagamento principal do proprietário */
export type PaymentMethod = 'pix' | 'cartao' | 'boleto';

/** Status da autorização de delegação WhatsApp */
export type WhatsAppDelegationStatus = 'pending' | 'authorized' | 'revoked' | 'expired';

/** Escopos de permissão que o proprietário pode conceder à Zélla no WhatsApp */
export type WhatsAppPermissionScope =
  | 'read_messages'
  | 'send_messages'
  | 'manage_bookings'
  | 'send_payment_links'
  | 'escalate_to_owner'
  | 'access_guest_profile';

/** Plano do tenant — alinhado com AirBSubscription.planType */
export type TenantPlan = 'trial' | 'starter' | 'pro' | 'business' | 'airb_pro' | 'airb_max';

/** Etapas do onboarding do tenant — persistidas no DB, NÃO no localStorage */
export type TenantOnboardingStep =
  | 'account_created'
  | 'profile_completed'
  | 'property_added'
  | 'whatsapp_connected'
  | 'first_bot_activation'
  | 'subscription_active';

/** Entrada no log de consentimento do proprietário */
export interface ConsentLogEntry {
  /** ID único da entrada */
  id: string;
  /** Tipo de ação de consentimento */
  action: 'granted' | 'revoked' | 'updated';
  /** Escopo da permissão afetada */
  scope: WhatsAppPermissionScope;
  /** Timestamp da ação */
  timestamp: Date;
  /** Endereço IP de onde partiu a ação */
  ipAddress?: string;
  /** User-Agent do navegador no momento da ação */
  userAgent?: string;
  /** Observações ou motivo (especialmente para revogação) */
  notes?: string;
}

/** Registro financeiro do tenant — complementa AirBTransaction */
export interface BillingHistoryEntry {
  /** ID único do registro */
  id: string;
  /** Referência externa (ex: Mercado Pago payment ID) */
  externalId?: string;
  /** Tipo de transação */
  type: 'subscription_payment' | 'refund' | 'adjustment' | 'trial_extension';
  /** Valor em BRL */
  amount: number;
  /** Status do pagamento */
  status: 'pending' | 'approved' | 'rejected' | 'refunded';
  /** Método de pagamento utilizado */
  method: PaymentMethod;
  /** Período coberto (início) */
  periodStart?: Date;
  /** Período cobrado (fim) */
  periodEnd?: Date;
  /** Descrição legível */
  description?: string;
  /** Data de criação */
  createdAt: Date;
}

/**
 * Perfil completo do proprietário (Tenant) — unifica dados do modelo Prisma Tenant
 * com informações financeiras, autorização WhatsApp e estado de onboarding.
 *
 * Alinhado com: Prisma `Tenant`, `AirBSubscription`, `AirBTransaction`
 */
export interface TenantProfile {
  // ---------------------------------------------------------------------------
  // Dados pessoais (estende campos do modelo Tenant)
  // ---------------------------------------------------------------------------
  /** ID do Tenant no banco */
  id: string;
  /** Nome completo do proprietário */
  name: string;
  /** E-mail principal (login) */
  email: string;
  /** Telefone principal */
  phone?: string;
  /** WhatsApp secundário para atendimento ao hóspede */
  phoneAlt?: string;
  /** Papel no sistema: owner | admin | staff */
  role: 'owner' | 'admin' | 'staff';
  /** Plano atual do tenant */
  plan: TenantPlan;
  /** Status da conta */
  status: 'active' | 'suspended' | 'churned';
  /** Início do período de trial */
  trialStart?: Date;
  /** Fim do período de trial */
  trialEnd?: Date;
  /** Data em que a assinatura foi ativada */
  subscriptionAt?: Date;

  // ---------------------------------------------------------------------------
  // Controle financeiro
  // ---------------------------------------------------------------------------
  /** Chave PIX para recebimento de reservas */
  pixKey?: string;
  /** Tipo da chave PIX */
  pixKeyType?: 'cpf' | 'email' | 'phone' | 'random';
  /** Método de pagamento preferido para cobrança da assinatura */
  defaultPaymentMethod?: PaymentMethod;
  /** Histórico de cobranças e pagamentos */
  billingHistory: BillingHistoryEntry[];
  /** Limite de propriedades do plano atual */
  propertyLimit: number;
  /** Quantidade atual de propriedades ativas */
  currentPropertyCount: number;

  // ---------------------------------------------------------------------------
  // Autorização de delegação WhatsApp
  // ---------------------------------------------------------------------------
  /** Status geral da autorização de delegação */
  whatsAppDelegationStatus: WhatsAppDelegationStatus;
  /** Permissões concedidas à Zélla */
  whatsAppPermissions: WhatsAppPermissionScope[];
  /** Log de consentimento — audit trail completo */
  consentLog: ConsentLogEntry[];
  /** Data da última autorização/renovação */
  delegationAuthorizedAt?: Date;
  /** Data de expiração da autorização (renovação automática se ativa) */
  delegationExpiresAt?: Date;

  // ---------------------------------------------------------------------------
  // Estado de onboarding — persistido no DB
  // ---------------------------------------------------------------------------
  /** Etapas do onboarding já concluídas */
  completedOnboardingSteps: TenantOnboardingStep[];
  /** Data de conclusão de cada etapa */
  onboardingStepTimestamps: Record<TenantOnboardingStep, Date | undefined>;
  /** Se o onboarding inicial foi concluído */
  onboardingComplete: boolean;

  // ---------------------------------------------------------------------------
  // Metadata
  // ---------------------------------------------------------------------------
  /** Data de criação */
  createdAt: Date;
  /** Data de atualização */
  updatedAt: Date;
}

// ==============================================================================
// 2. PROPERTY ONBOARDING — O fluxo Airbnb URL → Scrape → Review → Ativar
// ==============================================================================

/** Tipo de propriedade Airbnb — alinhado com AirBProperty.propertyType */
export type AirBPropertyType =
  | 'apartment'
  | 'house'
  | 'loft'
  | 'studio'
  | 'chalet'
  | 'villa'
  | 'cabin'
  | 'cottage'
  | 'townhouse'
  | 'other';

/** Tipo de amenidade extraída do scraping */
export interface ScrapedAmenity {
  /** Nome da amenidade (ex: "Wi-Fi", "Piscina", "Ar condicionado") */
  name: string;
  /** Categoria da amenidade */
  category?: 'essential' | 'feature' | 'location' | 'safety';
  /** Se a amenidade foi confirmada como existente (vs. inferida) */
  confirmed: boolean;
}

/** Regra da casa extraída do scraping */
export interface ScrapedHouseRule {
  /** Descrição da regra */
  rule: string;
  /** Se é uma regra proibitiva (ex: "Não permite festas") */
  isProhibition: boolean;
  /** Se é uma regra de horário (ex: "Silêncio após 22h") */
  isTimeBased: boolean;
}

/** Foto extraída do scraping */
export interface ScrapedPhoto {
  /** URL da imagem */
  url: string;
  /** Alt text ou legenda */
  caption?: string;
  /** Se é a foto de capa */
  isCover: boolean;
  /** Ordem de exibição */
  order: number;
}

/** Contato de emergência fornecido pelo proprietário */
export interface EmergencyContact {
  /** Nome do contato */
  name: string;
  /** Telefone */
  phone: string;
  /** Relação ou função (ex: "Síndico", "Hospital mais próximo") */
  role: string;
  /** Disponibilidade (ex: "24h", "Comercial") */
  availability?: string;
}

/** Dica de vizinhança fornecida pelo proprietário */
export interface NeighborhoodTip {
  /** Categoria da dica */
  category:
    | 'beach'
    | 'bakery'
    | 'pharmacy'
    | 'supermarket'
    | 'tourism'
    | 'restaurant'
    | 'hospital'
    | 'transport'
    | 'atm'
    | 'leisure'
    | 'other';
  /** Nome do local */
  name: string;
  /** Distância em km */
  distance?: number;
  /** Tempo caminhando em minutos */
  walkingTimeMin?: number;
  /** Descrição ou dica */
  tip: string;
}

/**
 * Dados de onboarding de uma propriedade — o modelo central do fluxo
 * "Airbnb URL → Scrape → Review → Customize → Activate".
 *
 * Separa claramente campos auto-preenchidos (com confiança) daqueles
 * que o proprietário DEVE revisar manualmente antes de ativar o bot.
 *
 * Alinhado com: Prisma `AirBProperty`, `AirBScrapingJob`
 */
export interface PropertyOnboarding {
  // ---------------------------------------------------------------------------
  // Identificação
  // ---------------------------------------------------------------------------
  /** ID do tenant proprietário */
  tenantId: string;
  /** ID da propriedade no banco (criado após scraping bem-sucedido) */
  propertyId?: string;
  /** ID do scraping job associado */
  scrapingJobId?: string;

  // ---------------------------------------------------------------------------
  // URL de origem
  // ---------------------------------------------------------------------------
  /** URL do anúncio Airbnb fornecida pelo proprietário */
  airbnbUrl: string;
  /** ID do anúncio no Airbnb (extraído da URL) */
  airbnbId?: string;

  // ---------------------------------------------------------------------------
  // Campos auto-preenchidos pelo scraping (com score de confiança)
  // ---------------------------------------------------------------------------
  /** Título do anúncio */
  title: FieldWithConfidence<string>;
  /** Descrição completa do anúncio */
  description: FieldWithConfidence<string>;
  /** Tipo de propriedade */
  propertyType: FieldWithConfidence<AirBPropertyType>;
  /** Preço por noite em BRL */
  pricePerNight: FieldWithConfidence<number>;
  /** Capacidade máxima de hóspedes */
  maxGuests: FieldWithConfidence<number>;
  /** Número de quartos */
  bedrooms: FieldWithConfidence<number>;
  /** Número de banheiros */
  bathrooms: FieldWithConfidence<number>;
  /** Regras da casa */
  houseRules: FieldWithConfidence<ScrapedHouseRule[]>;
  /** Horário de check-in */
  checkinTime: FieldWithConfidence<string>;
  /** Horário de checkout */
  checkoutTime: FieldWithConfidence<string>;
  /** Amenidades */
  amenities: FieldWithConfidence<ScrapedAmenity[]>;
  /** Fotos do anúncio */
  photos: FieldWithConfidence<ScrapedPhoto[]>;
  /** Cidade */
  city: FieldWithConfidence<string>;
  /** Estado */
  state: FieldWithConfidence<string>;
  /** Bairro */
  neighborhood: FieldWithConfidence<string>;
  /** Endereço completo */
  address: FieldWithConfidence<string>;
  /** Latitude */
  latitude: FieldWithConfidence<number | null>;
  /** Longitude */
  longitude: FieldWithConfidence<number | null>;

  // ---------------------------------------------------------------------------
  // Campos que o proprietário DEVE revisar manualmente antes de ativar
  // ---------------------------------------------------------------------------
  /** Nome da rede Wi-Fi */
  wifiName: string | null;
  /** Senha do Wi-Fi */
  wifiPassword: string | null;
  /** Provedor do smartlock (ex: "Nuki", "August") */
  lockProvider: string | null;
  /** Código do smartlock */
  lockCode: string | null;
  /** Conhecimento do host — dicas e informações que a Zélla deve saber */
  hostKnowledge: string[];
  /** Dicas de vizinhança fornecidas pelo proprietário */
  neighborhoodTips: NeighborhoodTip[];
  /** Contatos de emergência */
  emergencyContacts: EmergencyContact[];
  /** Instruções de check-in personalizadas */
  checkinInstructions: string;
  /** Regras da casa personalizadas (além das extraídas do Airbnb) */
  customHouseRules: string[];
  /** Chave PIX para pagamento (override do padrão do tenant) */
  pixKeyOverride: string | null;

  // ---------------------------------------------------------------------------
  // Estado do onboarding
  // ---------------------------------------------------------------------------
  /** Status atual do processo */
  status: OnboardingStatus;
  /** Etapa atual no wizard */
  currentStep: OnboardingStep;
  /** Etapas concluídas com timestamps */
  completedSteps: Record<OnboardingStep, Date | undefined>;
  /** Mensagem de erro (se status === 'error') */
  errorMessage?: string;
  /** Tentativas de scraping */
  scrapingRetryCount: number;
  /** Máximo de tentativas de scraping */
  scrapingMaxRetries: number;

  // ---------------------------------------------------------------------------
  // Metadata
  // ---------------------------------------------------------------------------
  /** Data de criação do registro de onboarding */
  createdAt: Date;
  /** Data da última atualização */
  updatedAt: Date;
}

// ==============================================================================
// 3. CLOSING NOTIFICATION — Notificação ao proprietário quando Zélla fecha reserva
// ==============================================================================

/** Status do pagamento no momento da notificação */
export type NotificationPaymentStatus = 'pending' | 'paid' | 'pending_confirmation' | 'pix_generated';

/** Contexto da propriedade na notificação */
export interface NotificationPropertyContext {
  /** ID da propriedade */
  propertyId: string;
  /** Nome/título da propriedade */
  propertyName: string;
  /** Tipo da propriedade */
  propertyType: AirBPropertyType;
  /** Cidade */
  city: string;
  /** Bairro */
  neighborhood: string;
}

/** Informações do hóspede na notificação */
export interface NotificationGuestInfo {
  /** Nome do hóspede */
  name: string;
  /** Telefone (se disponível) */
  phone?: string;
  /** Plataforma de origem da conversa */
  platform: 'airbnb_app' | 'airbnb_web' | 'direct' | 'whatsapp' | 'unknown';
  /** Número de hóspedes no grupo */
  guestCount: number;
}

/** Detalhes da reserva na notificação */
export interface NotificationReservationDetails {
  /** Data de check-in */
  checkIn: Date;
  /** Data de checkout */
  checkOut: Date;
  /** Número de noites */
  nights: number;
  /** Número de hóspedes */
  guests: number;
  /** Valor total em BRL */
  totalAmount: number;
  /** Valor por noite */
  perNight: number;
  /** Status do pagamento */
  paymentStatus: NotificationPaymentStatus;
  /** ID da chave PIX usada (parcial, para confirmação) */
  pixKeyLastDigits?: string;
}

/** Resumo da conversa que levou ao fechamento */
export interface NotificationConversationSummary {
  /** Número de mensagens trocadas */
  messageCount: number;
  /** Duração da conversa em minutos */
  durationMinutes: number;
  /** Técnica de fechamento utilizada pela Zélla */
  closingTechnique: string;
  /** Se houve escalonamento em algum ponto */
  hadEscalation: boolean;
  /** Confiança do modelo na decisão de fechamento */
  confidence: number;
  /** Principais intenções detectadas do hóspede */
  detectedIntents: string[];
}

/**
 * Payload completo de notificação enviado ao proprietário
 * quando a IA Zélla fecha uma reserva automaticamente.
 *
 * Este é o conteúdo estruturado por trás da mensagem WhatsApp
 * formatada enviada ao dono.
 */
export interface ClosingNotification {
  /** ID único da notificação */
  id: string;
  /** ID do tenant */
  tenantId: string;
  /** Timestamp do fechamento */
  closedAt: Date;

  // ---------------------------------------------------------------------------
  // Contexto
  // ---------------------------------------------------------------------------
  /** Dados da propriedade */
  property: NotificationPropertyContext;
  /** Dados do hóspede */
  guest: NotificationGuestInfo;
  /** Detalhes da reserva */
  reservation: NotificationReservationDetails;
  /** Resumo da conversa */
  conversationSummary: NotificationConversationSummary;

  // ---------------------------------------------------------------------------
  // Mensagem formatada
  // ---------------------------------------------------------------------------
  /** Texto completo da mensagem WhatsApp enviada ao proprietário */
  formattedWhatsAppMessage: string;
  /** Se a notificação foi lida pelo proprietário */
  read: boolean;
  /** Se o proprietário confirmou/rejeitou a reserva */
  ownerResponse?: 'confirmed' | 'rejected' | 'needs_review';
  /** Data da resposta do proprietário */
  ownerRespondedAt?: Date;
}

// ==============================================================================
// 4. TRAINING CLOSING SCENARIO — Schema de treinamento do Cérebro Zélla
// ==============================================================================

/** Classificação de intenção do hóspede */
export type GuestIntentTag =
  | 'price_inquiry'
  | 'availability_check'
  | 'booking_request'
  | 'discount_negotiation'
  | 'amenity_inquiry'
  | 'location_inquiry'
  | 'checkin_inquiry'
  | 'complaint'
  | 'cancellation'
  | 'general_question'
  | 'payment_inquiry'
  | 'group_booking'
  | 'long_stay'
  | 'special_request';

/** Técnica de fechamento utilizada pela Zélla */
export type ClosingTechnique =
  | 'direct_close'
  | 'urgency_close'
  | 'value_close'
  | 'assumptive_close'
  | 'alternative_close'
  | 'summary_close'
  | 'empathy_close'
  | 'objection_handling'
  | 'social_proof_close'
  | 'scarcity_close';

/** Ponto de escalonamento durante a conversa */
export interface EscalationPoint {
  /** Momento na conversa (índice da mensagem) */
  messageIndex: number;
  /** Motivo do escalonamento */
  reason: string;
  /** Se foi resolvido automaticamente pela Zélla */
  resolved: boolean;
  /** Como foi resolvido (se aplicável) */
  resolution?: string;
}

/** Contexto da propriedade no cenário de treinamento */
export interface TrainingPropertyContext {
  /** Tipo de propriedade */
  type: AirBPropertyType;
  /** Cidade */
  city: string;
  /** Estado */
  state: string;
  /** Bairro */
  neighborhood: string;
  /** "Vibe" da propriedade (ex: "praia", "montanha", "urbano", "rústico") */
  vibe: string;
  /** Faixa de preço */
  priceRange: 'budget' | 'mid' | 'premium' | 'luxury';
  /** Capacidade máxima */
  maxGuests: number;
}

/** Resumo da conversa para treinamento */
export interface TrainingConversationSummary {
  /** O que o hóspede perguntou inicialmente */
  initialInquiry: string;
  /** Objeções levantadas pelo hóspede */
  objections: string[];
  /** Como a Zélla conduziu a conversa até o "sim" */
  closingPath: string;
  /** Momento decisivo em que o hóspede aceitou */
  decisionMoment: string;
  /** Número total de turnos de conversa */
  totalTurns: number;
}

/**
 * Schema de cada exemplo de treinamento no dataset do Cérebro Zélla.
 * Usado para treinar e avaliar a capacidade de fechamento da IA.
 */
export interface TrainingClosingScenario {
  /** ID único do cenário */
  id: string;
  /** Título descritivo do cenário */
  title: string;

  // ---------------------------------------------------------------------------
  // Contexto
  // ---------------------------------------------------------------------------
  /** Contexto da propriedade */
  propertyContext: TrainingPropertyContext;
  /** Resumo da conversa */
  conversationSummary: TrainingConversationSummary;
  /** Payload de notificação gerado */
  notificationPayload: ClosingNotification;

  // ---------------------------------------------------------------------------
  // Classificação de intenção
  // ---------------------------------------------------------------------------
  /** Tags de intenção do hóspede */
  intentTags: GuestIntentTag[];
  /** Intenção principal */
  primaryIntent: GuestIntentTag;

  // ---------------------------------------------------------------------------
  // Metadata de sucesso
  // ---------------------------------------------------------------------------
  /** Confiança do modelo no fechamento (0.0 a 1.0) */
  confidence: number;
  /** Técnica de fechamento utilizada */
  closingTechnique: ClosingTechnique;
  /** Pontos de escalonamento (se houve) */
  escalationPoints: EscalationPoint[];
  /** Se o cenário foi validado como exemplo positivo */
  isValidated: boolean;
  /** Eficácia do cenário (taxa de sucesso em testes) */
  effectivenessScore: number;

  // ---------------------------------------------------------------------------
  // Auditoria
  // ---------------------------------------------------------------------------
  /** Quem criou o cenário (humano ou IA) */
  createdBy: 'human' | 'ai' | 'imported';
  /** Data de criação */
  createdAt: Date;
  /** Data da última atualização */
  updatedAt: Date;
}

// ==============================================================================
// 5. ONBOARDING WIZARD STATE — Estado do wizard multi-step
// ==============================================================================

/** Status de validação de uma etapa do wizard */
export type StepValidationStatus = 'unvalidated' | 'valid' | 'invalid' | 'warning';

/** Detalhes da validação de uma etapa */
export interface StepValidation {
  /** Status da validação */
  status: StepValidationStatus;
  /** Mensagens de erro (se invalid) */
  errors: string[];
  /** Mensagens de aviso (se warning) */
  warnings: string[];
  /** Timestamp da última validação */
  validatedAt?: Date;
}

/** Status da verificação de assinatura AirB */
export interface AirBSubscriptionCheck {
  /** Se o tenant tem assinatura ativa */
  hasActiveSubscription: boolean;
  /** Plano atual */
  planType?: 'airb_pro' | 'airb_max';
  /** Limite de propriedades do plano */
  propertyLimit: number;
  /** Quantidade de propriedades já em uso */
  currentPropertyCount: number;
  /** Se pode adicionar mais propriedades */
  canAddProperty: boolean;
  /** Se a assinatura está em período de carência */
  isInGracePeriod: boolean;
  /** Data de expiração (se aplicável) */
  expiresAt?: Date;
  /** Mensagem informativa sobre a assinatura */
  message?: string;
}

/**
 * Estado completo do wizard de onboarding de uma propriedade.
 * Rastreia a etapa atual, etapas concluídas, validação por etapa
 * e verificação de assinatura AirB.
 */
export interface OnboardingWizardState {
  /** ID do tenant */
  tenantId: string;
  /** ID do processo de onboarding (gerado ao iniciar) */
  onboardingId: string;
  /** Etapa atual do wizard */
  currentStep: OnboardingStep;
  /** Índice da etapa atual (0-based, conforme ONBOARDING_STEP_ORDER) */
  currentStepIndex: number;
  /** Total de etapas no wizard */
  totalSteps: number;

  // ---------------------------------------------------------------------------
  // Progresso
  // ---------------------------------------------------------------------------
  /** Etapas concluídas com timestamp de conclusão */
  completedSteps: Record<OnboardingStep, Date | undefined>;
  /** Porcentagem de conclusão (0–100) */
  progressPercentage: number;

  // ---------------------------------------------------------------------------
  // Validação por etapa
  // ---------------------------------------------------------------------------
  /** Status de validação de cada etapa */
  stepValidations: Record<OnboardingStep, StepValidation>;
  /** Se o wizard pode avançar para a próxima etapa */
  canAdvance: boolean;
  /** Se o wizard pode retroceder para a etapa anterior */
  canGoBack: boolean;

  // ---------------------------------------------------------------------------
  // Verificação de assinatura
  // ---------------------------------------------------------------------------
  /** Resultado da verificação de assinatura AirB */
  subscriptionCheck: AirBSubscriptionCheck;

  // ---------------------------------------------------------------------------
  // Dados do formulário (referência ao PropertyOnboarding)
  // ---------------------------------------------------------------------------
  /** Referência ao registro de onboarding da propriedade */
  onboardingData?: PropertyOnboarding;

  // ---------------------------------------------------------------------------
  // Estado da UI
  // ---------------------------------------------------------------------------
  /** Se o wizard está processando (ex: scraping em andamento) */
  isProcessing: boolean;
  /** Se houve erro geral no wizard */
  hasError: boolean;
  /** Mensagem de erro geral */
  errorMessage?: string;
  /** Timestamp de início do wizard */
  startedAt?: Date;
  /** Timestamp da última interação */
  lastInteractionAt: Date;
}

// ==============================================================================
// 6. SCRAPER RESULT — Saída estruturada do scraping Airbnb
// ==============================================================================

/** Status do resultado do scraping */
export type ScrapingResultStatus = 'success' | 'partial' | 'failure';

/** Campo que precisa de revisão manual */
export interface FieldRequiringReview<T> {
  /** Nome do campo */
  fieldName: string;
  /** Rótulo legível do campo */
  fieldLabel: string;
  /** Valor extraído (pode estar incorreto) */
  extractedValue?: T;
  /** Motivo pelo qual precisa de revisão */
  reason: string;
  /** Score de confiança baixo */
  confidence: number;
  /** Sugestão de valor correto (se a IA puder inferir) */
  suggestion?: T;
}

/** Dados brutos preservados do scraping */
export interface RawScrapedData {
  /** HTML bruto da página (se aplicável) */
  rawHtml?: string;
  /** JSON bruto retornado pela API (se aplicável) */
  rawJson?: Record<string, unknown>;
  /** Screenshots capturados (URLs) */
  screenshots?: string[];
  /** Headers HTTP da resposta */
  responseHeaders?: Record<string, string>;
  /** Timestamp da captura */
  capturedAt: Date;
}

/**
 * Resultado estruturado do serviço de scraping Airbnb.
 * Classifica campos por confiança, identifica aqueles que precisam
 * de revisão manual e preserva os dados brutos para re-processamento.
 *
 * Alinhado com: Prisma `AirBScrapingJob`
 */
export interface ScraperResult {
  // ---------------------------------------------------------------------------
  // Status geral
  // ---------------------------------------------------------------------------
  /** Status do scraping */
  status: ScrapingResultStatus;
  /** Mensagem resumida do resultado */
  message: string;
  /** Se o scraping produziu dados utilizáveis (ainda que parciais) */
  hasUsableData: boolean;

  // ---------------------------------------------------------------------------
  // Identificação
  // ---------------------------------------------------------------------------
  /** URL do anúncio que foi scrapeado */
  sourceUrl: string;
  /** ID do anúncio no Airbnb (extraído da URL) */
  airbnbId?: string;
  /** Job ID no banco */
  jobId?: string;
  /** Fonte/método de scraping utilizado */
  source: ScrapingSource;

  // ---------------------------------------------------------------------------
  // Campos auto-preenchidos com score de confiança
  // ---------------------------------------------------------------------------
  /** Título do anúncio */
  title: FieldWithConfidence<string>;
  /** Descrição */
  description: FieldWithConfidence<string>;
  /** Tipo de propriedade */
  propertyType: FieldWithConfidence<AirBPropertyType>;
  /** Preço por noite em BRL */
  pricePerNight: FieldWithConfidence<number>;
  /** Capacidade máxima de hóspedes */
  maxGuests: FieldWithConfidence<number>;
  /** Número de quartos */
  bedrooms: FieldWithConfidence<number>;
  /** Número de banheiros */
  bathrooms: FieldWithConfidence<number>;
  /** Regras da casa */
  houseRules: FieldWithConfidence<ScrapedHouseRule[]>;
  /** Horário de check-in */
  checkinTime: FieldWithConfidence<string>;
  /** Horário de checkout */
  checkoutTime: FieldWithConfidence<string>;
  /** Amenidades */
  amenities: FieldWithConfidence<ScrapedAmenity[]>;
  /** Fotos */
  photos: FieldWithConfidence<ScrapedPhoto[]>;
  /** Cidade */
  city: FieldWithConfidence<string>;
  /** Estado */
  state: FieldWithConfidence<string>;
  /** Bairro */
  neighborhood: FieldWithConfidence<string>;
  /** Endereço */
  address: FieldWithConfidence<string>;
  /** Latitude */
  latitude: FieldWithConfidence<number | null>;
  /** Longitude */
  longitude: FieldWithConfidence<number | null>;

  // ---------------------------------------------------------------------------
  // Campos que precisam de revisão manual
  // ---------------------------------------------------------------------------
  /** Lista de campos com confiança insuficiente que o proprietário deve revisar */
  fieldsRequiringReview: FieldRequiringReview<unknown>[];
  /** Quantidade total de campos extraídos */
  totalFieldsExtracted: number;
  /** Quantidade de campos com confiança alta (≥ 0.8) */
  highConfidenceFields: number;
  /** Quantidade de campos que precisam de revisão */
  fieldsNeedingReview: number;

  // ---------------------------------------------------------------------------
  // Dados brutos preservados
  // ---------------------------------------------------------------------------
  /** Dados brutos do scraping (para re-processamento ou debug) */
  rawData: RawScrapedData;

  // ---------------------------------------------------------------------------
  // Metadata
  // ---------------------------------------------------------------------------
  /** Duração do scraping em milissegundos */
  durationMs: number;
  /** Tentativas realizadas */
  attempts: number;
  /** Erros encontrados (se houver) */
  errors: Array<{
    /** Timestamp do erro */
    timestamp: Date;
    /** Mensagem do erro */
    message: string;
    /** Código do erro */
    code?: string;
    /** Se o erro é recuperável */
    recoverable: boolean;
  }>;
  /** Timestamp de conclusão */
  completedAt: Date;
}

// ==============================================================================
// HELPER FUNCTIONS
// ==============================================================================

/**
 * Retorna a próxima etapa do wizard após a etapa informada.
 * Retorna `null` se a etapa atual for a última.
 */
export function getNextStep(currentStep: OnboardingStep): OnboardingStep | null {
  const idx = ONBOARDING_STEP_ORDER.indexOf(currentStep);
  if (idx === -1 || idx >= ONBOARDING_STEP_ORDER.length - 1) return null;
  return ONBOARDING_STEP_ORDER[idx + 1];
}

/**
 * Retorna a etapa anterior do wizard antes da etapa informada.
 * Retorna `null` se a etapa atual for a primeira.
 */
export function getPreviousStep(currentStep: OnboardingStep): OnboardingStep | null {
  const idx = ONBOARDING_STEP_ORDER.indexOf(currentStep);
  if (idx <= 0) return null;
  return ONBOARDING_STEP_ORDER[idx - 1];
}

/**
 * Calcula a porcentagem de conclusão do onboarding
 * com base nas etapas concluídas.
 */
export function calculateOnboardingProgress(
  completedSteps: Record<OnboardingStep, Date | undefined>,
): number {
  const total = ONBOARDING_STEP_ORDER.length;
  const completed = ONBOARDING_STEP_ORDER.filter(
    (step) => completedSteps[step] !== undefined,
  ).length;
  return Math.round((completed / total) * 100);
}

/**
 * Cria um FieldWithConfidence com valores padrão.
 * Útil para inicializar campos do formulário de onboarding.
 */
export function createFieldWithConfidence<T>(
  value: T,
  confidence: number = 0,
  source: ScrapingSource = 'manual',
  reviewed: boolean = false,
): FieldWithConfidence<T> {
  return { value, confidence, source, reviewed };
}

/**
 * Cria um Record vazio de StepValidation para todas as etapas do wizard.
 */
export function createEmptyStepValidations(): Record<OnboardingStep, StepValidation> {
  const validations = {} as Record<OnboardingStep, StepValidation>;
  for (const step of ONBOARDING_STEP_ORDER) {
    validations[step] = {
      status: 'unvalidated',
      errors: [],
      warnings: [],
    };
  }
  return validations;
}

/**
 * Cria um Record vazio de timestamps para as etapas do wizard.
 */
export function createEmptyCompletedSteps(): Record<OnboardingStep, Date | undefined> {
  const steps = {} as Record<OnboardingStep, Date | undefined>;
  for (const step of ONBOARDING_STEP_ORDER) {
    steps[step] = undefined;
  }
  return steps;
}
