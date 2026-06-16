export enum PropertyStatus {
  PENDING_SETUP = 'PENDING_SETUP',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  CHURNED = 'CHURNED',
  TRIAL_EXPIRED = 'TRIAL_EXPIRED',
}

export enum Plan {
  FREE = 'FREE',
  LITE = 'LITE',
  PRO = 'PRO',
  MAX = 'MAX',
  BETA_TESTER = 'BETA_TESTER',
  EARLY_ADOPTER = 'EARLY_ADOPTER',
}

export enum Feature {
  COMMISSION_DISCOUNT = 'COMMISSION_DISCOUNT',
  IA_PERSONA = 'IA_PERSONA',
  WHATSAPP_LEARNING = 'WHATSAPP_LEARNING',
  ADVANCED_REPORTS = 'ADVANCED_REPORTS',
  SUPPLIER_MANAGEMENT = 'SUPPLIER_MANAGEMENT',
  NEURAL_VOICE = 'NEURAL_VOICE',
  CADASTUR_AUTO = 'CADASTUR_AUTO',
  FNRH_AUTO = 'FNRH_AUTO',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  PAST_DUE = 'PAST_DUE',
  CANCELED = 'CANCELED',
  TRIALING = 'TRIALING',
}

export enum CadasturStatus {
  VALID = 'VALID',
  EXPIRING = 'EXPIRING',
  EXPIRED = 'EXPIRED',
  PENDING = 'PENDING',
}

export enum WhatsappChannelType {
  GUESTS_ONLY = 'GUESTS_ONLY',
  GUESTS_AND_SUPPLIERS = 'GUESTS_AND_SUPPLIERS',
}

export const PROPERTY_STATUS_TRANSITIONS: Map<PropertyStatus, PropertyStatus[]> = new Map([
  [PropertyStatus.PENDING_SETUP, [PropertyStatus.ACTIVE]],
  [PropertyStatus.ACTIVE, [PropertyStatus.SUSPENDED, PropertyStatus.TRIAL_EXPIRED, PropertyStatus.CHURNED]],
  [PropertyStatus.SUSPENDED, [PropertyStatus.ACTIVE, PropertyStatus.CHURNED]],
  [PropertyStatus.TRIAL_EXPIRED, [PropertyStatus.ACTIVE]],
  [PropertyStatus.CHURNED, []],
])

export function canTransitionPropertyStatus(
  current: PropertyStatus,
  target: PropertyStatus
): boolean {
  return PROPERTY_STATUS_TRANSITIONS.get(current)?.includes(target) ?? false
}

export const FEATURE_MAP: Record<Plan, Feature[]> = {
  [Plan.FREE]: [],
  [Plan.LITE]: [Feature.COMMISSION_DISCOUNT],
  [Plan.PRO]: [
    Feature.COMMISSION_DISCOUNT,
    Feature.IA_PERSONA,
    Feature.WHATSAPP_LEARNING,
    Feature.ADVANCED_REPORTS,
    Feature.CADASTUR_AUTO,
  ],
  [Plan.MAX]: [
    Feature.COMMISSION_DISCOUNT,
    Feature.IA_PERSONA,
    Feature.WHATSAPP_LEARNING,
    Feature.ADVANCED_REPORTS,
    Feature.SUPPLIER_MANAGEMENT,
    Feature.NEURAL_VOICE,
    Feature.CADASTUR_AUTO,
    Feature.FNRH_AUTO,
  ],
  [Plan.BETA_TESTER]: [
    Feature.COMMISSION_DISCOUNT,
    Feature.IA_PERSONA,
    Feature.WHATSAPP_LEARNING,
    Feature.ADVANCED_REPORTS,
    Feature.SUPPLIER_MANAGEMENT,
    Feature.NEURAL_VOICE,
    Feature.CADASTUR_AUTO,
    Feature.FNRH_AUTO,
  ],
  [Plan.EARLY_ADOPTER]: [
    Feature.COMMISSION_DISCOUNT,
    Feature.IA_PERSONA,
    Feature.WHATSAPP_LEARNING,
  ],
}

export const ISO_4217_CURRENCIES = [
  'BRL', 'USD', 'EUR', 'GBP', 'ARS', 'CLP', 'COP', 'PEN', 'UYU', 'PYG', 'BOB',
]

export const IANA_TIMEZONES = [
  'America/Sao_Paulo', 'America/Manaus', 'America/Fortaleza', 'America/Recife',
  'America/Belem', 'America/Boa_Vista', 'America/Campo_Grande', 'America/Cuiaba',
  'America/Noronha', 'America/Porto_Velho', 'America/Rio_Branco',
  'America/Argentina/Buenos_Aires', 'America/Santiago', 'America/Mexico_City',
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'Europe/London', 'Europe/Lisbon', 'Europe/Madrid', 'Europe/Paris', 'Europe/Berlin',
  'Africa/Lagos', 'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Dubai', 'Australia/Sydney',
  'Pacific/Auckland', 'UTC',
]

export const RFC_5646_LOCALES = [
  'pt-BR', 'pt-PT', 'en-US', 'en-GB', 'es-ES', 'es-AR', 'fr-FR', 'de-DE',
  'it-IT', 'ja-JP', 'zh-CN', 'ko-KR', 'ar-SA', 'ru-RU', 'nl-NL',
]

export const UF_LIST = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]
