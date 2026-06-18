// ZCC Mock Data — ZEHLA SmartHotel Control Center

export type LeadStatus = 'pending' | 'verified' | 'contacted' | 'converted' | 'inactive';
export type CampaignStatus = 'active' | 'paused' | 'completed' | 'draft';
export type CampaignType = 'whatsapp' | 'email' | 'ads';
export type TargetStatus = 'active' | 'pending' | 'inactive';

export interface Lead {
  id: string;
  empresa: string;
  decisor: string;
  cargo: string;
  email: string;
  whatsapp: string;
  porte: 'pequeno' | 'médio' | 'grande' | 'luxo';
  score: number;
  status: LeadStatus;
  targetId?: string;
  idpScore?: number;
  receitaAtual?: number;
  receitaPotencial?: number;
  diariaMedia?: number;
  ocupacaoMedia?: number;
  gapPercent?: number;
  auditText?: string;
  whatsappScript?: string;
}

export interface Target {
  id: string;
  name: string;
  domain: string;
  city: string;
  state: string;
  priority: number;
  status: TargetStatus;
  leadCount: number;
}

export interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  sent: number;
  delivered: number;
  read: number;
  replied: number;
  total: number;
  createdAt: string;
  template: string;
}

export const mockLeads: Lead[] = [
  {
    id: 'L001',
    empresa: 'Pousada Mar e Sol',
    decisor: 'Carlos Andrade',
    cargo: 'Proprietário',
    email: 'carlos@mareesol.com.br',
    whatsapp: '+5521998765432',
    porte: 'médio',
    score: 94,
    status: 'verified',
    targetId: 'T01',
    idpScore: 87,
    receitaAtual: 285000,
    receitaPotencial: 420000,
    diariaMedia: 280,
    ocupacaoMedia: 52,
    gapPercent: 47,
    auditText: 'Pousada com excelente localização em Búzios, mas com presença digital fraca. Site desatualizado, sem integração com OTAs modernas. Pricing dinâmico inexistente — diárias fixas há 3 anos. Potencial de aumento de receita de 47% com otimização de canais e precificação inteligente.',
    whatsappScript: 'Olá Carlos! Sou da ZEHLA SmartHotel. Analisamos a Pousada Mar e Sol e identificamos um potencial de +R$135k/ano em receita. Seu índice IDP é 87/100 — excelente base para otimização. Posso te mostrar como em 5 minutos?',
  },
  {
    id: 'L002',
    empresa: 'Hotel Cantagalo',
    decisor: 'Maria Fernanda Lima',
    cargo: 'Diretora Comercial',
    email: 'mfernanda@cantagalo.com.br',
    whatsapp: '+5522987654321',
    porte: 'grande',
    score: 91,
    status: 'contacted',
    targetId: 'T01',
    idpScore: 82,
    receitaAtual: 620000,
    receitaPotencial: 890000,
    diariaMedia: 450,
    ocupacaoMedia: 61,
    gapPercent: 44,
    auditText: 'Hotel com boa infraestrutura mas distribuição fragmentada. 4 OTAs sem gestão centralizada. Taxa de cancelamento de 23% (média do setor: 15%). Recomendação: canal de vendas direto + precificação dinâmica.',
    whatsappScript: 'Olá Maria Fernanda! Analisamos o Hotel Cantagalo e seu potencial de receita é impressionante — +R$270k/ano. Sua taxa de cancelamento está 8pp acima da média. Tenho uma proposta para resolver isso. Podemos conversar?',
  },
  {
    id: 'L003',
    empresa: 'Pousada do Vale',
    decisor: 'João Pedro Martins',
    cargo: 'Gerente Geral',
    email: 'jp@valeserrano.com',
    whatsapp: '+5531987651234',
    porte: 'pequeno',
    score: 78,
    status: 'pending',
    targetId: 'T02',
    idpScore: 65,
    receitaAtual: 145000,
    receitaPotencial: 198000,
    diariaMedia: 180,
    ocupacaoMedia: 45,
    gapPercent: 37,
    auditText: 'Pousada charmosa em Serra da Mantiqueira com foco em ecoturismo. Baixa ocupação fora de temporada. Sem estratégia de marketing digital. Instagram com <500 seguidores e sem reservas online.',
    whatsappScript: 'Olá João Pedro! A Pousada do Vale tem um charme incrível. Identificamos que sua ocupação poderia subir de 45% para 68% com algumas ações simples. Quer ver o diagnóstico completo?',
  },
  {
    id: 'L004',
    empresa: 'Resort Praia Dourada',
    decisor: 'Ana Beatriz Costa',
    cargo: 'CEO',
    email: 'abcosta@praiadourada.com.br',
    whatsapp: '+5571988765432',
    porte: 'luxo',
    score: 96,
    status: 'converted',
    targetId: 'T03',
    idpScore: 93,
    receitaAtual: 1250000,
    receitaPotencial: 1680000,
    diariaMedia: 890,
    ocupacaoMedia: 58,
    gapPercent: 34,
    auditText: 'Resort 5 estrelas com alto padrão. Oportunidade em upselling de pacotes, experiência personalizada para hóspedes e revenue management avançado. Migrando para ZEHLA em progresso.',
    whatsappScript: 'Ana Beatriz, excelente notícia! O Resort Praia Dourada está no top 5% do nosso ranking IDP (93/100). Já estamos preparando a migração completa. Aumento projetado: +R$430k/ano.',
  },
  {
    id: 'L005',
    empresa: 'Pousada Serrana',
    decisor: 'Roberto Silva',
    cargo: 'Proprietário',
    email: 'roberto@serrana.com.br',
    whatsapp: '+5535987654321',
    porte: 'médio',
    score: 72,
    status: 'pending',
    targetId: 'T02',
    idpScore: 58,
    receitaAtual: 210000,
    receitaPotencial: 275000,
    diariaMedia: 220,
    ocupacaoMedia: 48,
    gapPercent: 31,
    auditText: 'Boa estrutura mas sem presença online. Booking.com como único canal. Google My Business não reivindicado. Sem site próprio funcional.',
    whatsappScript: 'Olá Roberto! Sua pousada tem tudo para crescer. Identificamos oportunidades simples que podem adicionar R$65k/ano. Uma delas é reivindicar seu Google My Business — isso sozinho pode aumentar reservas diretas em 20%.',
  },
  {
    id: 'L006',
    empresa: 'Hotel Eco Trancoso',
    decisor: 'Luciana Mendes',
    cargo: 'Diretora de Operações',
    email: 'luciana@ecotrance.com.br',
    whatsapp: '+5573988761234',
    porte: 'grande',
    score: 88,
    status: 'verified',
    targetId: 'T03',
    idpScore: 79,
    receitaAtual: 540000,
    receitaPotencial: 720000,
    diariaMedia: 520,
    ocupacaoMedia: 55,
    gapPercent: 33,
    auditText: 'Conceito de eco-turismo forte, mas revenue management básico. Sem pacotes sazonais. Review score no Booking caiu de 9.2 para 8.4 nos últimos 6 meses. Necessário plano de gestão de reputação.',
    whatsappScript: 'Luciana, notei que o score do Hotel Eco Trancoso caiu no Booking. Isso impacta diretamente suas reservas — cada 0.1 ponto = ~3% menos conversão. Posso te mostrar como reverter isso?',
  },
  {
    id: 'L007',
    empresa: 'Pousada das Flores',
    decisor: 'Fernanda Oliveira',
    cargo: 'Proprietária',
    email: 'nanda@florespousada.com',
    whatsapp: '+5531988123456',
    porte: 'pequeno',
    score: 65,
    status: 'inactive',
    targetId: 'T04',
    idpScore: 42,
    receitaAtual: 98000,
    receitaPotencial: 115000,
    gapPercent: 17,
    auditText: 'Micro pousada com 6 quartos. Operação familiar sem profissionalização. Sem sistema de reservas. Margem apertada. Reavaliar em 90 dias.',
    whatsappScript: 'Fernanda, entendo que pode não ser o momento ideal. Deixo aqui nosso diagnóstico caso mude de ideia — a Pousada das Flores tem potencial de +R$17k/ano com ações de baixo custo.',
  },
  {
    id: 'L008',
    empresa: 'Grand Hotel Litoral',
    decisor: 'Ricardo Almeida',
    cargo: 'Gerente de Receita',
    email: 'ricardo@grandlitoral.com.br',
    whatsapp: '+5511988765432',
    porte: 'grande',
    score: 92,
    status: 'contacted',
    targetId: 'T04',
    idpScore: 85,
    receitaAtual: 890000,
    receitaPotencial: 1200000,
    diariaMedia: 680,
    ocupacaoMedia: 63,
    gapPercent: 35,
    auditText: 'Hotel bem posicionado no litoral paulista. Revenue manager experiente mas ferramentas limitadas. Sem integração PMS-OTA em tempo real. Oportunidade de automação de pricing.',
    whatsappScript: 'Ricardo, com sua experiência em revenue, vai adorar o que preparamos. O Grand Litoral pode automatizar 80% do pricing e ganhar +R$310k/ano. Posso mandar um demo?',
  },
  {
    id: 'L009',
    empresa: 'Pousada Raízes',
    decisor: 'Patrícia Santos',
    cargo: 'Proprietária',
    email: 'patricia@raizes.com.br',
    whatsapp: '+5562987654321',
    porte: 'médio',
    score: 83,
    status: 'verified',
    targetId: 'T02',
    idpScore: 71,
    receitaAtual: 320000,
    receitaPotencial: 435000,
    diariaMedia: 310,
    ocupacaoMedia: 50,
    gapPercent: 36,
    auditText: 'Pousada em Goiás com conceito de turismo rural. Boa avaliação no Google (4.8), mas sem estratégia de remarketing. Hóspedes satisfeitos não retornam. Programa de fidelidade ausente.',
    whatsappScript: 'Patrícia, seus hóspedes amam a Pousada Raízes (4.8 no Google!), mas apenas 12% retornam. Com um programa simples de fidelidade, podemos subir isso para 35%. Isso significa +R$115k/ano.',
  },
  {
    id: 'L010',
    empresa: 'Casa & Mar Boutique',
    decisor: 'Thiago Nascimento',
    cargo: 'Sócio-Administrador',
    email: 'thiago@casamarboutique.com.br',
    whatsapp: '+5581987654321',
    porte: 'luxo',
    score: 89,
    status: 'pending',
    targetId: 'T03',
    idpScore: 76,
    receitaAtual: 780000,
    receitaPotencial: 1050000,
    diariaMedia: 750,
    ocupacaoMedia: 56,
    gapPercent: 35,
    auditText: 'Boutique hotel em Fernando de Noronha com ocupação sazonal extrema (85% alta vs 25% baixa). Necessário desenvolver ofertas para baixa temporada. Revenue management pode equilibrar a curva.',
    whatsappScript: 'Thiago, a Casa & Mar é incrível mas sofre com sazonalidade. 85% vs 25% de ocupação. Nosso modelo prevê equilibrar isso para ~65% constante. Isso adiciona R$270k/ano. Vamos conversar?',
  },
  {
    id: 'L011',
    empresa: 'Pousada Convento',
    decisor: 'Isabela Ferreira',
    cargo: 'Gerente',
    email: 'isabela@convento.com.br',
    whatsapp: '+5531986543210',
    porte: 'médio',
    score: 76,
    status: 'pending',
    targetId: 'T04',
    idpScore: 61,
    receitaAtual: 195000,
    receitaPotencial: 258000,
    diariaMedia: 240,
    ocupacaoMedia: 47,
    gapPercent: 32,
    auditText: 'Pousada histórica em Ouro Preto com charme único. Problema: 78% das reservas vêm de uma única OTA. Dependência crítica de canal. Necessário diversificar.',
    whatsappScript: 'Isabela, 78% das suas reservas em um único canal é um risco sério. Se essa OTA mudar algoritmo, suas vendas caem. Posso te mostrar como diversificar e ganhar +R$63k/ano?',
  },
  {
    id: 'L012',
    empresa: 'Hotel Mirante',
    decisor: 'Eduardo Campos',
    cargo: 'Diretor Financeiro',
    email: 'eduardo@mirantehotel.com.br',
    whatsapp: '+5541987651234',
    porte: 'grande',
    score: 85,
    status: 'contacted',
    targetId: 'T01',
    idpScore: 74,
    receitaAtual: 470000,
    receitaPotencial: 625000,
    diariaMedia: 390,
    ocupacaoMedia: 53,
    gapPercent: 33,
    auditText: 'Hotel em Florianópolis com boa localização. Custo de aquisição por hóspede (CAC) alto: R$180. LTV de R$420. Ratio CAC/LTV precisa melhorar. Marketing digital ineficiente.',
    whatsappScript: 'Eduardo, seu CAC está R$60 acima do ideal. Com nossa plataforma de marketing inteligente, podemos reduzir para R$120 e aumentar conversões. Projeção: +R$155k/ano líquido.',
  },
];

export const mockTargets: Target[] = [
  {
    id: 'T01',
    name: 'Rede Costa Atlântica',
    domain: 'costa-atlantica.com.br',
    city: 'Búzios',
    state: 'RJ',
    priority: 5,
    status: 'active',
    leadCount: 4,
  },
  {
    id: 'T02',
    name: 'Pousadas de Montanha',
    domain: 'montanha-pousadas.com.br',
    city: 'Campos do Jordão',
    state: 'SP',
    priority: 4,
    status: 'active',
    leadCount: 3,
  },
  {
    id: 'T03',
    name: 'Noronha Premium Group',
    domain: 'noronhapremium.com',
    city: 'Fernando de Noronha',
    state: 'PE',
    priority: 5,
    status: 'active',
    leadCount: 3,
  },
  {
    id: 'T04',
    name: 'Circuito Histórico',
    domain: 'circuitohistorico.com.br',
    city: 'Ouro Preto',
    state: 'MG',
    priority: 3,
    status: 'pending',
    leadCount: 2,
  },
  {
    id: 'T05',
    name: 'Bahia Eco Resorts',
    domain: 'bahia-eco.com.br',
    city: 'Porto Seguro',
    state: 'BA',
    priority: 2,
    status: 'inactive',
    leadCount: 0,
  },
];

export const mockCampaigns: Campaign[] = [
  {
    id: 'C001',
    name: 'Campanha Búzios Q3 2025',
    type: 'whatsapp',
    status: 'active',
    sent: 234,
    delivered: 228,
    read: 189,
    replied: 42,
    total: 300,
    createdAt: '2025-07-01',
    template: 'Diagnóstico de Receita',
  },
  {
    id: 'C002',
    name: 'Reengajamento Inativos',
    type: 'email',
    status: 'paused',
    sent: 156,
    delivered: 148,
    read: 67,
    replied: 12,
    total: 200,
    createdAt: '2025-06-15',
    template: 'Follow-up Personalizado',
  },
  {
    id: 'C003',
    name: 'Lançamento Noronha Premium',
    type: 'whatsapp',
    status: 'active',
    sent: 89,
    delivered: 87,
    read: 72,
    replied: 28,
    total: 120,
    createdAt: '2025-07-10',
    template: 'Convite Exclusivo',
  },
  {
    id: 'C004',
    name: 'Google Ads - Pousadas SP',
    type: 'ads',
    status: 'completed',
    sent: 1500,
    delivered: 1420,
    read: 380,
    replied: 85,
    total: 1500,
    createdAt: '2025-05-01',
    template: 'Landing Page Otimizada',
  },
  {
    id: 'C005',
    name: 'Upsell Serrana Setembro',
    type: 'whatsapp',
    status: 'draft',
    sent: 0,
    delivered: 0,
    read: 0,
    replied: 0,
    total: 80,
    createdAt: '2025-08-01',
    template: 'Oferta Sazonal',
  },
];

export const mockDashboardStats = {
  totalLeads: mockLeads.length,
  verifiedLeads: mockLeads.filter(l => l.status === 'verified' || l.status === 'contacted' || l.status === 'converted').length,
  messagesSent: Math.round(mockLeads.filter(l => l.status === 'verified' || l.status === 'contacted' || l.status === 'converted').length * 3.87),
  activeCampaigns: mockCampaigns.filter(c => c.status === 'active').length,
  conversionRate: ((mockLeads.filter(l => l.status === 'converted').length / mockLeads.length) * 100).toFixed(1),
  monthlyAICost: 47.50,
};