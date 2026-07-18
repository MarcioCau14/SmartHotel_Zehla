// =============================================================================
// ZEHLA SmartHotel — Dados dos Clientes (Pousadas Beta + Anfitriões Airbnb)
// =============================================================================

export interface ClientFriend {
  id: string;
  name: string;
  cnpj: string;
  whatsapp: string;
  owner: string;
  email: string;
  city: string;
  state: string;
  rooms: number;
  plan: 'fundador' | 'lite' | 'pro' | 'max' | 'parceiro';
  status: 'BETA_TESTER' | 'EARLY_ADOPTER' | 'ACTIVE' | 'ONBOARDING';
  avatar: string; // initials
  color: string; // tailwind bg color
  niche: 'pousadas' | 'anfitrioes' | 'parceiro';
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
  owner: string;
  email: string;
  whatsapp: string;
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

export const airbnbHosts: AirbnbHost[] = [
  {
    id: 'airb-001',
    name: 'Apartamento Copacabana View',
    owner: 'Marcos Vinícius',
    email: 'marcos@copacabanaview.com',
    whatsapp: '5521998880001',
    city: 'Rio de Janeiro',
    state: 'RJ',
    avatar: 'MV',
    color: 'from-sky-500 to-sky-700',
    plan: 'pro',
    status: 'ACTIVE',
    superhost: true,
    properties: [
      {
        id: 'prop-001',
        airbnbId: '48291037',
        name: 'Apto Vista Mar Copacabana',
        propertyType: 'Apartamento inteiro',
        listingUrl: null,
        bedrooms: 2,
        bathrooms: 1,
        maxGuests: 4,
        avgNightlyRate: 320,
        occupancyRate: 89,
        totalReviews: 147,
        avgRating: 4.92,
        responseRate: 98,
        responseTimeMin: 3,
        icalSyncEnabled: true,
        lastIcalSync: '2026-07-18T10:30:00Z',
      },
      {
        id: 'prop-002',
        airbnbId: '51829374',
        name: 'Studio Moderno Ipanema',
        propertyType: 'Studio',
        listingUrl: null,
        bedrooms: 1,
        bathrooms: 1,
        maxGuests: 2,
        avgNightlyRate: 280,
        occupancyRate: 82,
        totalReviews: 89,
        avgRating: 4.87,
        responseRate: 100,
        responseTimeMin: 2,
        icalSyncEnabled: true,
        lastIcalSync: '2026-07-18T10:28:00Z',
      },
    ],
    totalBookings: 234,
    monthlyRevenue: 18200,
    aiMessagesProcessed: 3847,
    aiResponseRate: 94,
    avgResponseTime: 3,
    conversionRate: 41.2,
    cancelationRate: 2.1,
    brainStatus: 'optimizing',
    brainAccuracy: 93.8,
    activatedAt: '2026-05-10T09:00:00Z',
    lastActivity: '2026-07-18T10:45:00Z',
  },
  {
    id: 'airb-002',
    name: 'Flat Paulista Premium',
    owner: 'Juliana Santos',
    email: 'juliana@flatpaulista.com',
    whatsapp: '5511997770002',
    city: 'São Paulo',
    state: 'SP',
    avatar: 'JS',
    color: 'from-violet-500 to-violet-700',
    plan: 'pro',
    status: 'ACTIVE',
    superhost: true,
    properties: [
      {
        id: 'prop-003',
        airbnbId: '62749182',
        name: 'Flat Executivo Av. Paulista',
        propertyType: 'Apartamento inteiro',
        listingUrl: null,
        bedrooms: 1,
        bathrooms: 1,
        maxGuests: 2,
        avgNightlyRate: 250,
        occupancyRate: 85,
        totalReviews: 203,
        avgRating: 4.95,
        responseRate: 100,
        responseTimeMin: 1,
        icalSyncEnabled: true,
        lastIcalSync: '2026-07-18T09:15:00Z',
      },
    ],
    totalBookings: 178,
    monthlyRevenue: 12750,
    aiMessagesProcessed: 2934,
    aiResponseRate: 97,
    avgResponseTime: 2,
    conversionRate: 38.7,
    cancelationRate: 1.8,
    brainStatus: 'calibrated',
    brainAccuracy: 91.2,
    activatedAt: '2026-05-12T14:00:00Z',
    lastActivity: '2026-07-18T09:30:00Z',
  },
  {
    id: 'airb-003',
    name: 'Casa Floripa Beach',
    owner: 'Rafael Oliveira',
    email: 'rafael@casafloripa.com',
    whatsapp: '5548996660003',
    city: 'Florianópolis',
    state: 'SC',
    avatar: 'RO',
    color: 'from-teal-500 to-teal-700',
    plan: 'max',
    status: 'ACTIVE',
    superhost: true,
    properties: [
      {
        id: 'prop-004',
        airbnbId: '73859204',
        name: 'Casa com Piscina Jurerê',
        propertyType: 'Casa inteira',
        listingUrl: null,
        bedrooms: 3,
        bathrooms: 2,
        maxGuests: 6,
        avgNightlyRate: 580,
        occupancyRate: 91,
        totalReviews: 312,
        avgRating: 4.97,
        responseRate: 99,
        responseTimeMin: 2,
        icalSyncEnabled: true,
        lastIcalSync: '2026-07-18T11:00:00Z',
      },
      {
        id: 'prop-005',
        airbnbId: '84960315',
        name: 'Loft Barra da Lagoa',
        propertyType: 'Loft',
        listingUrl: null,
        bedrooms: 1,
        bathrooms: 1,
        maxGuests: 3,
        avgNightlyRate: 350,
        occupancyRate: 87,
        totalReviews: 124,
        avgRating: 4.89,
        responseRate: 96,
        responseTimeMin: 4,
        icalSyncEnabled: true,
        lastIcalSync: '2026-07-18T10:55:00Z',
      },
      {
        id: 'prop-006',
        airbnbId: '95071426',
        name: 'Chalé Ribeirão da Ilha',
        propertyType: 'Chalé',
        listingUrl: null,
        bedrooms: 2,
        bathrooms: 1,
        maxGuests: 4,
        avgNightlyRate: 420,
        occupancyRate: 79,
        totalReviews: 67,
        avgRating: 4.85,
        responseRate: 92,
        responseTimeMin: 8,
        icalSyncEnabled: false,
        lastIcalSync: null,
      },
    ],
    totalBookings: 342,
    monthlyRevenue: 38900,
    aiMessagesProcessed: 6128,
    aiResponseRate: 91,
    avgResponseTime: 3,
    conversionRate: 44.1,
    cancelationRate: 3.2,
    brainStatus: 'optimizing',
    brainAccuracy: 96.4,
    activatedAt: '2026-05-08T11:00:00Z',
    lastActivity: '2026-07-18T11:15:00Z',
  },
  {
    id: 'airb-004',
    name: 'Studio Savassi BH',
    owner: 'Camila Ribeiro',
    email: 'camila@studiosavassi.com',
    whatsapp: '5531995550004',
    city: 'Belo Horizonte',
    state: 'MG',
    avatar: 'CR',
    color: 'from-rose-500 to-rose-700',
    plan: 'pro',
    status: 'ONBOARDING',
    superhost: false,
    properties: [
      {
        id: 'prop-007',
        airbnbId: '106182537',
        name: 'Studio Moderno Savassi',
        propertyType: 'Studio',
        listingUrl: null,
        bedrooms: 1,
        bathrooms: 1,
        maxGuests: 2,
        avgNightlyRate: 190,
        occupancyRate: 62,
        totalReviews: 23,
        avgRating: 4.78,
        responseRate: 78,
        responseTimeMin: 35,
        icalSyncEnabled: false,
        lastIcalSync: null,
      },
    ],
    totalBookings: 34,
    monthlyRevenue: 4280,
    aiMessagesProcessed: 412,
    aiResponseRate: 45,
    avgResponseTime: 22,
    conversionRate: 22.3,
    cancelationRate: 8.4,
    brainStatus: 'learning',
    brainAccuracy: 62.1,
    activatedAt: '2026-07-01T16:00:00Z',
    lastActivity: '2026-07-17T22:10:00Z',
  },
  {
    id: 'airb-005',
    name: 'Recanto Porto de Galinhas',
    owner: 'Diego Costa',
    email: 'diego@recantoporto.com',
    whatsapp: '5581994440005',
    city: 'Ipojuca',
    state: 'PE',
    avatar: 'DC',
    color: 'from-amber-500 to-amber-700',
    plan: 'max',
    status: 'ACTIVE',
    superhost: true,
    properties: [
      {
        id: 'prop-008',
        airbnbId: '117293648',
        name: 'Casa Praia Porto de Galinhas',
        propertyType: 'Casa inteira',
        listingUrl: null,
        bedrooms: 4,
        bathrooms: 3,
        maxGuests: 8,
        avgNightlyRate: 720,
        occupancyRate: 93,
        totalReviews: 198,
        avgRating: 4.94,
        responseRate: 99,
        responseTimeMin: 2,
        icalSyncEnabled: true,
        lastIcalSync: '2026-07-18T08:45:00Z',
      },
    ],
    totalBookings: 189,
    monthlyRevenue: 28100,
    aiMessagesProcessed: 4213,
    aiResponseRate: 96,
    avgResponseTime: 2,
    conversionRate: 46.8,
    cancelationRate: 1.5,
    brainStatus: 'optimizing',
    brainAccuracy: 95.1,
    activatedAt: '2026-05-20T10:00:00Z',
    lastActivity: '2026-07-18T08:50:00Z',
  },
];

// =============================================================================
// Parceiro Zélla Data
// =============================================================================

export interface ParceiroZella {
  id: string;
  name: string;
  owner: string;
  email: string;
  whatsapp: string;
  city: string;
  state: string;
  avatar: string;
  color: string;
  status: 'ACTIVE' | 'ONBOARDING';
  sealEnabled: boolean;
  instagramProfile: string | null;
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

export const parceirosZella: ParceiroZella[] = [
  {
    id: 'parc-001',
    name: 'Digital Host Pro',
    owner: 'Thiago Andrade',
    email: 'thiago@digitalhostpro.com',
    whatsapp: '5521993330001',
    city: 'Rio de Janeiro',
    state: 'RJ',
    avatar: 'TA',
    color: 'from-yellow-500 to-yellow-700',
    status: 'ACTIVE',
    sealEnabled: true,
    instagramProfile: '@digitalhostpro',
    linkInBioSlug: 'digitalhostpro',
    planPrice: 247,
    frozenMonths: 24,
    contractedAt: '2026-06-01T10:00:00Z',
    referrals: 7,
    referralConversions: 3,
    commissionEarned: 1191,
    lastActivity: '2026-07-18T09:20:00Z',
  },
  {
    id: 'parc-002',
    name: 'Hospedagem Inteligente',
    owner: 'Fernanda Abreu',
    email: 'fernanda@hospedageminteligente.com',
    whatsapp: '5511992220002',
    city: 'São Paulo',
    state: 'SP',
    avatar: 'FA',
    color: 'from-pink-500 to-pink-700',
    status: 'ACTIVE',
    sealEnabled: true,
    instagramProfile: '@hospedageminteligente',
    linkInBioSlug: 'hospedageminteligente',
    planPrice: 247,
    frozenMonths: 24,
    contractedAt: '2026-06-05T14:00:00Z',
    referrals: 4,
    referralConversions: 1,
    commissionEarned: 397,
    lastActivity: '2026-07-17T18:45:00Z',
  },
  {
    id: 'parc-003',
    name: 'Airbnb Master Class',
    owner: 'Ricardo Gomes',
    email: 'ricardo@airbnbmasterclass.com',
    whatsapp: '5531991110003',
    city: 'Belo Horizonte',
    state: 'MG',
    avatar: 'RG',
    color: 'from-emerald-500 to-emerald-700',
    status: 'ONBOARDING',
    sealEnabled: false,
    instagramProfile: '@airbnbmasterclass',
    linkInBioSlug: 'airbnbmasterclass',
    planPrice: 247,
    frozenMonths: 24,
    contractedAt: '2026-07-10T09:00:00Z',
    referrals: 0,
    referralConversions: 0,
    commissionEarned: 0,
    lastActivity: '2026-07-17T15:30:00Z',
  },
];

// =============================================================================
// 10 Pousadas Clientes (Beta Testers)
// =============================================================================

export const tenClientFriends: ClientFriend[] = [
  {
    id: 'client-001',
    name: 'Pousada Serenity',
    cnpj: '12.345.678/0001-90',
    whatsapp: '5532999990001',
    owner: 'Ana Claudia Martins',
    email: 'ana@pousadaserenity.com.br',
    city: 'Tiradentes',
    state: 'MG',
    rooms: 12,
    plan: 'fundador',
    status: 'BETA_TESTER',
    avatar: 'AM',
    color: 'from-emerald-500 to-emerald-700',
    niche: 'pousadas',
    totalReservations: 847,
    monthlyRevenue: 38400,
    aiMessagesProcessed: 12847,
    conversionRate: 34.2,
    occupancyRate: 87,
    avgRating: 4.9,
    activatedAt: '2026-05-01T10:00:00Z',
    lastActivity: '2026-06-18T09:45:00Z',
    brainStatus: 'optimizing',
    brainAccuracy: 94.7,
    priceAdjustmentsToday: 8,
    automatedReplies24h: 156,
  },
  {
    id: 'client-002',
    name: 'Chalés da Montanha',
    cnpj: '23.456.789/0001-01',
    whatsapp: '5554999990002',
    owner: 'Roberto Silva',
    email: 'roberto@chalesdamontanha.com.br',
    city: 'Campos do Jordão',
    state: 'SP',
    rooms: 8,
    plan: 'fundador',
    status: 'BETA_TESTER',
    avatar: 'RS',
    color: 'from-blue-500 to-blue-700',
    niche: 'pousadas',
    totalReservations: 623,
    monthlyRevenue: 29100,
    aiMessagesProcessed: 8934,
    conversionRate: 31.8,
    occupancyRate: 82,
    avgRating: 4.8,
    activatedAt: '2026-05-02T14:00:00Z',
    lastActivity: '2026-06-18T08:30:00Z',
    brainStatus: 'calibrated',
    brainAccuracy: 91.2,
    priceAdjustmentsToday: 5,
    automatedReplies24h: 112,
  },
  {
    id: 'client-003',
    name: 'Pousada dos Coqueiros',
    cnpj: '34.567.890/0001-12',
    whatsapp: '5581999990003',
    owner: 'Fernanda Lima',
    email: 'fernanda@pousadadoscoqueiros.com.br',
    city: 'Fernando de Noronha',
    state: 'PE',
    rooms: 6,
    plan: 'fundador',
    status: 'BETA_TESTER',
    avatar: 'FL',
    color: 'from-purple-500 to-purple-700',
    niche: 'pousadas',
    totalReservations: 412,
    monthlyRevenue: 45200,
    aiMessagesProcessed: 6721,
    conversionRate: 38.5,
    occupancyRate: 94,
    avgRating: 4.9,
    activatedAt: '2026-05-03T09:00:00Z',
    lastActivity: '2026-06-18T10:15:00Z',
    brainStatus: 'optimizing',
    brainAccuracy: 96.1,
    priceAdjustmentsToday: 12,
    automatedReplies24h: 89,
  },
  {
    id: 'client-004',
    name: 'Eco Lodge Araçá',
    cnpj: '45.678.901/0001-23',
    whatsapp: '5532999990004',
    owner: 'Lucas Mendes',
    email: 'lucas@ecolodgearaca.com.br',
    city: 'Tiradentes',
    state: 'MG',
    rooms: 10,
    plan: 'fundador',
    status: 'BETA_TESTER',
    avatar: 'LM',
    color: 'from-amber-500 to-amber-700',
    niche: 'pousadas',
    totalReservations: 534,
    monthlyRevenue: 22800,
    aiMessagesProcessed: 7562,
    conversionRate: 28.4,
    occupancyRate: 75,
    avgRating: 4.7,
    activatedAt: '2026-05-04T11:30:00Z',
    lastActivity: '2026-06-18T07:20:00Z',
    brainStatus: 'learning',
    brainAccuracy: 78.3,
    priceAdjustmentsToday: 3,
    automatedReplies24h: 67,
  },
  {
    id: 'client-005',
    name: 'Villa Mar e Sol',
    cnpj: '56.789.012/0001-34',
    whatsapp: '5573999990005',
    owner: 'Patrícia Rodrigues',
    email: 'patricia@villamaresol.com.br',
    city: 'Porto Seguro',
    state: 'BA',
    rooms: 15,
    plan: 'fundador',
    status: 'BETA_TESTER',
    avatar: 'PR',
    color: 'from-rose-500 to-rose-700',
    niche: 'pousadas',
    totalReservations: 721,
    monthlyRevenue: 33600,
    aiMessagesProcessed: 10892,
    conversionRate: 32.1,
    occupancyRate: 85,
    avgRating: 4.8,
    activatedAt: '2026-05-05T08:00:00Z',
    lastActivity: '2026-06-18T11:00:00Z',
    brainStatus: 'calibrated',
    brainAccuracy: 89.5,
    priceAdjustmentsToday: 6,
    automatedReplies24h: 134,
  },
  {
    id: 'client-006',
    name: 'Pousada Terra Mater',
    cnpj: '67.890.123/0001-45',
    whatsapp: '5531999990006',
    owner: 'Carlos Almeida',
    email: 'carlos@pousadaterramater.com.br',
    city: 'Ouro Preto',
    state: 'MG',
    rooms: 9,
    plan: 'fundador',
    status: 'BETA_TESTER',
    avatar: 'CA',
    color: 'from-cyan-500 to-cyan-700',
    niche: 'pousadas',
    totalReservations: 389,
    monthlyRevenue: 18900,
    aiMessagesProcessed: 5431,
    conversionRate: 26.7,
    occupancyRate: 71,
    avgRating: 4.6,
    activatedAt: '2026-05-06T15:00:00Z',
    lastActivity: '2026-06-17T22:45:00Z',
    brainStatus: 'learning',
    brainAccuracy: 74.8,
    priceAdjustmentsToday: 2,
    automatedReplies24h: 45,
  },
  {
    id: 'client-007',
    name: 'Refúgio das Nuvens',
    cnpj: '78.901.234/0001-56',
    whatsapp: '5535999990007',
    owner: 'Mariana Costa',
    email: 'mariana@refugiodasnuvens.com.br',
    city: 'Gramado',
    state: 'RS',
    rooms: 11,
    plan: 'fundador',
    status: 'BETA_TESTER',
    avatar: 'MC',
    color: 'from-indigo-500 to-indigo-700',
    niche: 'pousadas',
    totalReservations: 678,
    monthlyRevenue: 41200,
    aiMessagesProcessed: 9876,
    conversionRate: 35.9,
    occupancyRate: 91,
    avgRating: 4.9,
    activatedAt: '2026-05-07T10:30:00Z',
    lastActivity: '2026-06-18T09:00:00Z',
    brainStatus: 'optimizing',
    brainAccuracy: 95.3,
    priceAdjustmentsToday: 10,
    automatedReplies24h: 143,
  },
  {
    id: 'client-008',
    name: 'Solar das Palmeiras',
    cnpj: '89.012.345/0001-67',
    whatsapp: '5582999990008',
    owner: 'Eduardo Nascimento',
    email: 'eduardo@solardaspalmeiras.com.br',
    city: 'Jericoacoara',
    state: 'CE',
    rooms: 7,
    plan: 'fundador',
    status: 'EARLY_ADOPTER',
    avatar: 'EN',
    color: 'from-teal-500 to-teal-700',
    niche: 'pousadas',
    totalReservations: 298,
    monthlyRevenue: 21500,
    aiMessagesProcessed: 4234,
    conversionRate: 30.2,
    occupancyRate: 79,
    avgRating: 4.7,
    activatedAt: '2026-05-15T12:00:00Z',
    lastActivity: '2026-06-18T06:30:00Z',
    brainStatus: 'learning',
    brainAccuracy: 72.1,
    priceAdjustmentsToday: 1,
    automatedReplies24h: 34,
  },
  {
    id: 'client-009',
    name: 'Pousada Vila do Sol',
    cnpj: '90.123.456/0001-78',
    whatsapp: '5521999990009',
    owner: 'Beatriz Souza',
    email: 'beatriz@viladosol.com.br',
    city: 'Búzios',
    state: 'RJ',
    rooms: 14,
    plan: 'fundador',
    status: 'BETA_TESTER',
    avatar: 'BS',
    color: 'from-orange-500 to-orange-700',
    niche: 'pousadas',
    totalReservations: 567,
    monthlyRevenue: 35800,
    aiMessagesProcessed: 8123,
    conversionRate: 33.4,
    occupancyRate: 88,
    avgRating: 4.8,
    activatedAt: '2026-05-08T09:45:00Z',
    lastActivity: '2026-06-18T10:50:00Z',
    brainStatus: 'calibrated',
    brainAccuracy: 90.8,
    priceAdjustmentsToday: 7,
    automatedReplies24h: 121,
  },
  {
    id: 'client-010',
    name: 'Canto da Mata',
    cnpj: '01.234.567/0001-89',
    whatsapp: '5547999990010',
    owner: 'Gustavo Ferreira',
    email: 'gustavo@cantodamata.com.br',
    city: 'Canela',
    state: 'RS',
    rooms: 5,
    plan: 'fundador',
    status: 'EARLY_ADOPTER',
    avatar: 'GF',
    color: 'from-lime-500 to-lime-700',
    niche: 'pousadas',
    totalReservations: 187,
    monthlyRevenue: 14200,
    aiMessagesProcessed: 2876,
    conversionRate: 25.1,
    occupancyRate: 68,
    avgRating: 4.5,
    activatedAt: '2026-05-20T14:30:00Z',
    lastActivity: '2026-06-17T20:15:00Z',
    brainStatus: 'learning',
    brainAccuracy: 68.4,
    priceAdjustmentsToday: 1,
    automatedReplies24h: 23,
  },
];

// =============================================================================
// Aggregated Global Metrics (all niches)
// =============================================================================

export const airbnbMetrics = {
  totalHosts: airbnbHosts.length,
  totalProperties: airbnbHosts.reduce((s, h) => s + h.properties.length, 0),
  superhosts: airbnbHosts.filter(h => h.superhost).length,
  totalBookings: airbnbHosts.reduce((s, h) => s + h.totalBookings, 0),
  monthlyRevenue: airbnbHosts.reduce((s, h) => s + h.monthlyRevenue, 0),
  aiMessagesProcessed: airbnbHosts.reduce((s, h) => s + h.aiMessagesProcessed, 0),
  avgAiResponseRate: Math.round(airbnbHosts.reduce((s, h) => s + h.aiResponseRate, 0) / airbnbHosts.length),
  avgConversionRate: parseFloat((airbnbHosts.reduce((s, h) => s + h.conversionRate, 0) / airbnbHosts.length).toFixed(1)),
  icalSyncEnabled: airbnbHosts.reduce((s, h) => s + h.properties.filter(p => p.icalSyncEnabled).length, 0),
  icalSyncTotal: airbnbHosts.reduce((s, h) => s + h.properties.length, 0),
  proCount: airbnbHosts.filter(h => h.plan === 'pro').length,
  maxCount: airbnbHosts.filter(h => h.plan === 'max').length,
  onboarding: airbnbHosts.filter(h => h.status === 'ONBOARDING').length,
};

export const parceiroMetrics = {
  totalPartners: parceirosZella.length,
  activePartners: parceirosZella.filter(p => p.status === 'ACTIVE').length,
  onboarding: parceirosZella.filter(p => p.status === 'ONBOARDING').length,
  sealEnabled: parceirosZella.filter(p => p.sealEnabled).length,
  monthlyMRR: parceirosZella.reduce((s, p) => s + p.planPrice, 0),
  totalReferrals: parceirosZella.reduce((s, p) => s + p.referrals, 0),
  totalConversions: parceirosZella.reduce((s, p) => s + p.referralConversions, 0),
  totalCommission: parceirosZella.reduce((s, p) => s + p.commissionEarned, 0),
  betaSlots: 100,
  slotsRemaining: 100 - parceirosZella.length,
};

export const globalMetrics = {
  totalClients: 10 + airbnbHosts.length + parceirosZella.length, // all niches
  totalRooms: 97 + airbnbMetrics.totalProperties,
  totalReservations: 5256 + airbnbMetrics.totalBookings,
  totalRevenue: 300700 + airbnbMetrics.monthlyRevenue + parceiroMetrics.monthlyMRR,
  totalMessagesProcessed: 77496 + airbnbMetrics.aiMessagesProcessed,
  avgConversionRate: 31.6,
  avgOccupancy: 82,
  avgBrainAccuracy: 86.1,
  totalPriceAdjustments: 55,
  totalAutomatedReplies: 924,
  activeBetas: 8,
  earlyAdopters: 2,
  monthlyGrowth: 18.4,
  // Niche breakdown
  pousadas: {
    clients: 10,
    revenue: 300700,
    reservations: 5256,
  },
  anfitrioes: {
    clients: airbnbHosts.length,
    revenue: airbnbMetrics.monthlyRevenue,
    reservations: airbnbMetrics.totalBookings,
    properties: airbnbMetrics.totalProperties,
    superhosts: airbnbMetrics.superhosts,
  },
  parceiro: {
    clients: parceirosZella.length,
    mrr: parceiroMetrics.monthlyMRR,
    referrals: parceiroMetrics.totalReferrals,
  },
  // Produtos SaaS ZEHLA
  linkinbioStandaloneSubscribers: 0,
  linkinbioStandalonePrice: 47,
  linkinbioStandaloneMRR: 0,
  // Matriz de preços vigente
  pricing: {
    trial: 0,
    lite: 197,
    liteCard: 247,
    pro: 397,
    max: 797,
    betaPartner: 247,
    linkinbioStandalone: 47,
  },
};
