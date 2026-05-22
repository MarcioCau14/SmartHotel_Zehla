export interface DynamicHeadline {
  h1: string;
  h1Highlight: string;
  subtitle: string;
}

const campaignHeadlines: Record<string, DynamicHeadline> = {
  dor_financeira: {
    h1: 'Recupere até 30% das suas',
    h1Highlight: 'reservas diretas',
    subtitle: 'Pare de perder receita para as OTAs. O cérebro ZEHLA automatiza reservas diretas via WhatsApp, precificação inteligente e financeiro integrado — tudo sem planilhas.',
  },
  ocupacao: {
    h1: 'Aumente sua ocupação em',
    h1Highlight: 'até 40% este mês',
    subtitle: 'Preencha quartos vazios com IA que responde hóspedes 24/7 no WhatsApp, ajusta preços automaticamente e converte curiosos em reservas confirmadas.',
  },
  whatsapp: {
    h1: 'Seu WhatsApp no',
    h1Highlight: 'piloto automático',
    subtitle: 'Atenda hóspedes instantaneamente, confirme reservas, envie boletos e faça upsell — tudo via WhatsApp com IA que aprende com sua pousada.',
  },
  precificacao: {
    h1: 'Precificação inteligente que',
    h1Highlight: 'maximiza sua receita',
    subtitle: 'Ajuste preços automaticamente baseado em demanda, sazonalidade e concorrência. O ZEHLA calcula o preço ideal para cada quarto, a cada dia.',
  },
  ota: {
    h1: 'Reduza a dependência de',
    h1Highlight: 'Booking e Airbnb',
    subtitle: 'Construa seu canal direto de reservas com WhatsApp automatizado, landing pages personalizadas e pagamentos via Pix. Sua pousada, suas regras.',
  },
  baixa_temporada: {
    h1: 'Lote sua pousada na',
    h1Highlight: 'baixa temporada',
    subtitle: 'Campanhas automáticas de reativação, pacotes personalizados e precificação dinâmica para manter sua ocupação alta o ano inteiro.',
  },
  gestor: {
    h1: 'Gerencie sua pousada',
    h1Highlight: 'sem estresse',
    subtitle: 'Dashboard completo com reservas, financeiro, equipe e WhatsApp em um só lugar. Setup em 10 minutos, sem cartão de crédito.',
  },
};

const defaultHeadline: DynamicHeadline = {
  h1: 'Sua pousada no',
  h1Highlight: 'piloto automático',
  subtitle: 'Automatize reservas, WhatsApp, precificação e financeiro — tudo em um só lugar. Sem planilhas, sem estresse.',
};

export function getDynamicHeadline(utmCampaign: string): DynamicHeadline {
  const campaign = utmCampaign.toLowerCase().trim();
  return campaignHeadlines[campaign] || defaultHeadline;
}
