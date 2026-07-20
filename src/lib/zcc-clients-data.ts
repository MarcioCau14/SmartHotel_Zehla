// =============================================================================
// ZEHLA SmartHotel — Dados dos Clientes (Pousadas + Anfitriões Airbnb + Parceiros)
// =============================================================================
// DADOS ZERADOS — Nenhum cliente/teste ativo ainda.
// Quando as "Zélla Pousadas Testes" e "Zélla Airbnb Testes" forem criadas,
// os dados serão alimentados aqui ou via banco de dados (Prisma).
// =============================================================================

export interface ClientFriend {
  id: string;
  name: string;
  cnpj: string;
  ownerInitials: string;
  owner?: string;
  region: string;
  city: string;
  state: string;
  rooms: number;
  whatsapp?: string;
  email?: string;
  plan: 'gratuito' | 'lite' | 'pro' | 'max' | 'parceiro';
  status: 'BETA_TESTER' | 'EARLY_ADOPTER' | 'ACTIVE' | 'ONBOARDING';
  avatar: string; // initials
  color: string; // tailwind bg color
  niche: 'pousada' | 'airbnb';
  // Métricas atuais
  totalReservations: number;
  monthlyRevenue: number;
  aiMessagesProcessed: number;
  conversionRate: number;
  occupancyRate: number;
  avgRating: number;
  activatedAt: string;
  lastActivity: string;
  // Cérebro ZÉLLA data
  brainStatus: 'learning' | 'calibrated' | 'optimizing';
  brainAccuracy: number;
  priceAdjustmentsToday: number;
  automatedReplies24h: number;
}

// =============================================================================
// Airbnb Host Data
// =============================================================================

export interface AirbnbHost {
  id: string;
  name: string;
  ownerInitials: string;
  owner?: string;
  region: string;
  city: string;
  state: string;
  avatar: string;
  color: string;
  plan: 'pro' | 'max';
  status: 'ACTIVE' | 'ONBOARDING' | 'TRIAL';
  superhost: boolean;
  // Property data
  properties: {
    id: string;
    airbnbId: string;
    name: string;
    propertyType: string;
    listingUrl: string | null;
    bedrooms: number;
    bathrooms: number;
    maxGuests: number;
    avgNightlyRate: number;
    occupancyRate: number;
    totalReviews: number;
    avgRating: number;
    responseRate: number;
    responseTimeMin: number;
    icalSyncEnabled: boolean;
    lastIcalSync: string | null;
  }[];
  // Metrics
  totalBookings: number;
  monthlyRevenue: number;
  aiMessagesProcessed: number;
  aiResponseRate: number; // % of inquiries answered by AI
  avgResponseTime: number; // minutes
  conversionRate: number;
  cancelationRate: number;
  // Brain
  brainStatus: 'learning' | 'calibrated' | 'optimizing';
  brainAccuracy: number;
  activatedAt: string;
  lastActivity: string;
}

// =============================================================================
// Parceiro Zélla Data
// =============================================================================

export interface ParceiroZella {
  id: string;
  name: string;
  ownerInitials: string;
  region: string;
  city: string;
  state: string;
  avatar: string;
  color: string;
  status: 'ACTIVE' | 'ONBOARDING';
  sealEnabled: boolean;
  linkInBioSlug: string;
  planPrice: number;
  frozenMonths: number;
  contractedAt: string;
  // Metrics
  referrals: number;
  referralConversions: number;
  commissionEarned: number;
  lastActivity: string;
}

// =============================================================================
// DADOS — ZERADOS (sem clientes ativos ainda)
// =============================================================================

export const airbnbHosts: AirbnbHost[] = [];

export const parceirosZella: ParceiroZella[] = [];

export const tenClientFriends: ClientFriend[] = [];

// =============================================================================
// Aggregated Global Metrics — TUDO ZERADO
// =============================================================================

export const airbnbMetrics = {
  totalHosts: 0,
  totalProperties: 0,
  superhosts: 0,
  totalBookings: 0,
  monthlyRevenue: 0,
  aiMessagesProcessed: 0,
  avgAiResponseRate: 0,
  avgConversionRate: 0,
  icalSyncEnabled: 0,
  icalSyncTotal: 0,
  proCount: 0,
  maxCount: 0,
  onboarding: 0,
};

export const parceiroMetrics = {
  totalPartners: 0,
  activePartners: 0,
  onboarding: 0,
  sealEnabled: 0,
  monthlyMRR: 0,
  totalReferrals: 0,
  totalConversions: 0,
  totalCommission: 0,
  betaSlots: 100,
  slotsRemaining: 100,
};

export const globalMetrics = {
  totalClients: 0,
  totalRooms: 0,
  totalReservations: 0,
  totalRevenue: 0,
  totalMessagesProcessed: 0,
  avgConversionRate: 0,
  avgOccupancy: 0,
  avgBrainAccuracy: 0,
  totalPriceAdjustments: 0,
  totalAutomatedReplies: 0,
  activeBetas: 0,
  earlyAdopters: 0,
  monthlyGrowth: 0,
  // Niche breakdown
  pousada: {
    clients: 0,
    revenue: 0,
    reservations: 0,
  },
  airbnb: {
    clients: 0,
    revenue: 0,
    reservations: 0,
    properties: 0,
    superhosts: 0,
  },
  parceiro: {
    clients: 0,
    mrr: 0,
    referrals: 0,
  },
  // Produtos SaaS ZEHLA
  linkinbioStandaloneSubscribers: 0,
  linkinbioStandalonePrice: 47,
  linkinbioStandaloneMRR: 0,
  // Matriz de preços vigente (mantida como referência)
  pricing: {
    gratuito: 0,
    lite: 197,
    liteCard: 247,
    pro: 397,
    max: 797,
    parceiro: 247,
    linkinbioStandalone: 47,
  },
};
