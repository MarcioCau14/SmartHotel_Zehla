import type { NicheType } from '@/contexts/NicheContext';

// ─── PAIN POINTS ───────────────────────────────────────────────
export interface PainCard {
  icon: string;
  title: string;
  desc: string;
  stat?: { val: string; label: string };
  color: string;
  size: 'lg' | 'sm';
}

// ─── HOW IT WORKS ──────────────────────────────────────────────
export interface StepData {
  num: string;
  icon: string;
  title: string;
  subtitle: string;
  desc: string;
  color: string;
  highlights: string[];
  fields?: string[];
}

// ─── FEATURES ──────────────────────────────────────────────────
export interface FeatureData {
  icon: string;
  badge: string;
  heroStat: { val: string; label: string; gradient: string };
  headline: string;
  subtitle: string;
  desc: string;
  stats: { val: string; label: string; sublabel?: string; icon: string }[];
  pills: { text: string; accent?: boolean }[];
  bottomLine: string;
  mockup: 'whatsapp' | 'linkinbio';
  reverse: boolean;
}

// ─── DASHBOARD ─────────────────────────────────────────────────
export interface DashboardConfig {
  badge: string;
  headline: string;
  headlineAccent: string;
  desc: string;
  pains: { icon: string; title: string; desc: string }[];
  stats: { label: string; val: string; title: string; color: string }[];
  recentActivity: { color: string; text: string; time: string }[];
  footerLeft: { icon: string; label: string; value: string };
  footerRight: { icon: string; label: string; value: string };
  chatConversation: { sender: 'user' | 'bot'; name?: string; text: string; confidence?: string; actions?: string }[];
}

// ─── TESTIMONIALS ──────────────────────────────────────────────
export interface Testimonial {
  name: string;
  role: string;
  location: string;
  text: string;
  avatar: string;
  rating: number;
}

// ─── PRICING ───────────────────────────────────────────────────
export interface PricingCopy {
  focusLabel: string;
  focusDesc: string;
}

// ─── FAQ ───────────────────────────────────────────────────────
export interface FAQItem {
  question: string;
  answer: string;
}

// ─── NICHE SWITCHER ────────────────────────────────────────────
export interface SwitcherContent {
  headline: string;
  subheadline: string;
  heroStat: { val: string; label: string };
  backgroundImage: string;
  ctaText: string;
  accentColor: string;
  glowColor: string;
}

// ─── FULL NICHE CONTENT ────────────────────────────────────────
export interface NicheContent {
  switcher: SwitcherContent;
  painCards: PainCard[];
  steps: StepData[];
  features: FeatureData[];
  dashboard: DashboardConfig;
  testimonials: Testimonial[];
  pricing: PricingCopy;
  faqs: FAQItem[];
}

// ═══════════════════════════════════════════════════════════════
// POUSADAS CONTENT
// ═══════════════════════════════════════════════════════════════
const pousadasContent: NicheContent = {
  switcher: {
    headline: 'Acabe com a fila de espera no WhatsApp.',
    subheadline: 'Atenda 50 cotações simultâneas e aumente as reservas diretas. O Zélla responde, negocia e envia sua chave PIX — tudo sozinho, no tom da sua pousada.',
    heroStat: { val: '50+', label: 'cotações simultâneas' },
    backgroundImage: '/images/niche-pousadas-bg.jpg',
    ctaText: 'Ver como funciona para Pousadas',
    accentColor: 'emerald',
    glowColor: 'rgba(16, 185, 129, 0.08)',
  },

  painCards: [
    {
      icon: 'Clock',
      title: 'Nunca mais perca uma reserva',
      desc: 'Enquanto você descansa, a IA do Zélla atende cada hóspede em até 8 segundos — respondendo sobre disponibilidade, preços e enviando sua chave PIX cadastrada. Madrugada, feriado, domingo de chuva: sempre online.',
      stat: { val: '24/7', label: 'Atendimento ininterrupto' },
      color: 'emerald',
      size: 'lg',
    },
    {
      icon: 'MessageSquare',
      title: 'Uma mensagem, tudo resolvido',
      desc: 'Em vez de 5 balões fragmentados, o Zélla reúne saudação, disponibilidade, preço e chave PIX em um único balão completo. Mais profissional para o hóspede, mais eficiente para seu custo de API.',
      stat: { val: '1', label: 'Balão com tudo incluído' },
      color: 'blue',
      size: 'lg',
    },
    {
      icon: 'Users',
      title: 'Contexto inteligente',
      desc: 'O hóspede manda "Tem vaga?", "Preço?" e "Aceita pet?" em sequência? O Zélla agrupa tudo e responde de uma vez, entendendo a intenção completa da conversa.',
      color: 'sky',
      size: 'sm',
    },
    {
      icon: 'BarChart3',
      title: 'Painel de controle em tempo real',
      desc: 'Reservas geradas, receita do dia, taxa de ocupação — tudo num dashboard que se atualiza ao vivo. Relatórios semanais automáticos por e-mail para decisões sem achismo.',
      color: 'amber',
      size: 'sm',
    },
    {
      icon: 'DollarSign',
      title: 'Custo sob controle',
      desc: 'Você define o orçamento mensal e o Zélla gerencia o uso da API automaticamente. Sem surpresas na fatura, sem estresse.',
      color: 'violet',
      size: 'sm',
    },
    {
      icon: 'ShieldCheck',
      title: 'Pronto para outubro 2026',
      desc: 'A Meta está mudando as regras da API do WhatsApp. O Zélla já está adaptado para manter seus custos baixos e sua operação estável.',
      color: 'pink',
      size: 'sm',
    },
  ],

  steps: [
    {
      num: '01',
      icon: 'UserPlus',
      title: 'Cadastre sua pousada',
      subtitle: '5 minutos é tudo que você precisa',
      desc: 'Informe nome, WhatsApp oficial, endereço e quantidade de quartos. O Zélla cria o perfil da sua pousada e já personaliza as respostas com suas regras, preços e políticas. Sem necessidade de técnico.',
      color: 'emerald',
      highlights: ['Sem cartão de crédito', 'Onboarding guiado', 'Perfil instantâneo'],
      fields: ['Nome da pousada', 'WhatsApp oficial', 'Endereço completo', 'Qtd. de quartos', 'Chave PIX (opcional)', 'Regras da pousada'],
    },
    {
      num: '02',
      icon: 'MessageSquare',
      title: 'A IA atende por você',
      subtitle: 'Seu WhatsApp vira ponto de venda 24/7',
      desc: 'A IA responde perguntas, mostra disponibilidade, negocia preços e envia a chave PIX cadastrada para pagamento — tudo automaticamente, no tom da sua pousada. O primeiro hóspede atendido pela IA costuma chegar em menos de 24 horas.',
      color: 'blue',
      highlights: ['Resposta em até 8 segundos', 'Tom personalizado', 'Chave PIX automática'],
    },
    {
      num: '03',
      icon: 'BarChart3',
      title: 'Acompanhe e otimize',
      subtitle: 'Dados que guiam suas decisões',
      desc: 'No painel de controle, veja em tempo real as reservas geradas, a receita do mês, a taxa de ocupação e sugestões inteligentes para vender mais. Relatórios semanais automáticos no seu e-mail.',
      color: 'violet',
      highlights: ['Dashboard em tempo real', 'Relatórios semanais', 'Sugestões de preço'],
    },
  ],

  features: [
    {
      icon: 'MessageSquare',
      badge: 'WhatsApp Inteligente 24/7',
      heroStat: { val: '8s', label: 'tempo médio de resposta', gradient: 'from-emerald-400 to-cyan-400' },
      headline: 'Seu hóspede pergunta. O Zélla reserva.',
      subtitle: 'Não é só chat — é um motor de reservas automático.',
      desc: 'Cada mensagem que seu hóspede manda é uma oportunidade de reserva que o Zélla não deixa escapar. Disponibilidade, preço e sua chave PIX cadastrada — tudo num único balão, no tom da sua pousada.',
      stats: [
        { val: '24/7', label: 'Atendimento ininterrupto', sublabel: 'Sem folga, sem férias', icon: 'Clock' },
        { val: '+35%', label: 'Aumento em reservas', sublabel: 'Média nos primeiros 90 dias', icon: 'TrendingUp' },
      ],
      pills: [
        { text: '1 balão = tudo resolvido', accent: true },
        { text: 'Chave PIX cadastrada enviada automaticamente' },
        { text: 'Tom de voz personalizado' },
        { text: 'PT / ES — dois idiomas' },
      ],
      bottomLine: 'Deixe o software fazer o trabalho do software. Você cuide dos hóspedes.',
      mockup: 'whatsapp',
      reverse: false,
    },
    {
      icon: 'Wifi',
      badge: 'Link-in-Bio Profissional',
      heroStat: { val: '2', label: 'cliques para reservar', gradient: 'from-blue-400 to-violet-400' },
      headline: 'Bonito ganha elogios. Inteligente ganha reservas.',
      subtitle: 'Seu Instagram vira máquina de conversão.',
      desc: 'Cada seguidor no seu Instagram é uma reserva que não aconteceu ainda. O Link-in-Bio do Zélla transforma sua bio numa página de conversão — com galeria, reservas diretas e avaliações reais.',
      stats: [
        { val: '0%', label: 'Comissão de OTA', sublabel: 'Receita 100% direta', icon: 'Shield' },
        { val: '+20%', label: 'Receita por diária', sublabel: 'Com reservas diretas', icon: 'TrendingUp' },
      ],
      pills: [
        { text: 'Reservas diretas sem intermediário', accent: true },
        { text: 'Galeria de fotos otimizada' },
        { text: 'Avaliações reais de hóspedes' },
        { text: 'SEO + análise de tráfego' },
      ],
      bottomLine: 'Menos cliques para o hóspede. Mais receita direta para você. (PRO e MAX)',
      mockup: 'linkinbio',
      reverse: true,
    },
  ],

  dashboard: {
    badge: 'Centro de Comando Operacional',
    headline: 'Veja cada reserva acontecer,',
    headlineAccent: 'em tempo real.',
    desc: 'O Diário de Conversas dá controle absoluto sobre o atendimento. Monitore as conversas em tempo real, veja o que o hóspede precisa e assuma o chat com apenas um clique para manter o toque humano personalizado.',
    pains: [
      { icon: 'Activity', title: 'Acompanhamento ao Vivo', desc: 'Acompanhe as respostas automáticas em tempo real. Veja com clareza a segurança do assistente e garanta um atendimento livre de falhas.' },
      { icon: 'Hand', title: 'Assuma quando Quiser (1-Click Handover)', desc: 'Se o hóspede solicitar algo muito específico, pause a IA e assuma a conversa na hora. A transição de IA para humano é imperceptível.' },
      { icon: 'DollarSign', title: 'Métricas de Faturamento e Economia', desc: 'Acompanhe a receita de reservas diretas convertidas e visualize a economia de taxas de comissão (Booking, Airbnb) salvas pela IA.' },
    ],
    stats: [
      { label: 'Média das pousadas parceiras', val: '24/7', title: 'Atendimento IA', color: 'text-emerald-400' },
      { label: 'Média dos primeiros 90 dias', val: '+35%', title: 'Aumento em reservas', color: 'text-blue-400' },
      { label: 'Sua chave PIX cadastrada', val: 'PIX', title: 'Pagamento integrado', color: 'text-amber-400' },
      { label: 'Sem surpresas no fim do mês', val: 'R$ 197', title: 'A partir de /mês', color: 'text-zinc-300' },
    ],
    recentActivity: [
      { color: 'bg-blue-400', text: 'Reserva recebida (Maria)', time: 'agora' },
      { color: 'bg-emerald-400', text: 'Resposta completa enviada', time: '3m' },
      { color: 'bg-amber-400', text: 'PIX confirmado', time: '12m' },
    ],
    footerLeft: { icon: 'DollarSign', label: 'Total Convertido pela IA:', value: 'R$ 8.940,00' },
    footerRight: { icon: 'CheckCircle2', label: 'Taxa Booking Economizada:', value: 'R$ 1.341,00' },
    chatConversation: [
      { sender: 'user', name: 'Bernardo Silva', text: 'Olá! Gostaria de saber o valor da diária para casal no feriado de 7 de setembro.' },
      { sender: 'bot', confidence: '98%', actions: 'Calendário verificado — disponível', text: 'Olá, Bernardo! A diária do Quarto Casal Premium para o feriado de 7 de Setembro é R$ 447. Temos disponibilidade! Deseja que eu gere o link de reserva PIX?' },
      { sender: 'user', name: 'Bernardo Silva', text: 'Sim, por favor! Pode gerar.' },
    ],
  },

  testimonials: [
    {
      name: 'Carla Mendes',
      role: 'Proprietária',
      location: 'Pousada Serenity — Ubatuba, SP',
      text: 'O Zélla transformou nosso WhatsApp. Antes perdíamos reservas pela madrugada. Agora a IA atende, negocia e manda o PIX sozinha. Minha receita subiu 40% em 3 meses.',
      avatar: '/avatar-serenity.jpg',
      rating: 5,
    },
    {
      name: 'Roberto Almeida',
      role: 'Gerente',
      location: 'Chalé da Montanha — Monte Verde, MG',
      text: 'Nossos hóspedes elogiam a rapidez. Eles nem percebem que é IA. O painel de controle é sensacional — vejo tudo em tempo real.',
      avatar: '/pousada-chale.jpg',
      rating: 5,
    },
    {
      name: 'Fernanda Costa',
      role: 'Proprietária',
      location: 'Pousada Sol & Mar — Florianópolis, SC',
      text: 'Eu gastava 3 horas por dia no WhatsApp. Agora o Zélla resolve 90% das conversas. Eu só intervenho quando precisa de toque humano. Libertador!',
      avatar: '/pousada-vista.jpg',
      rating: 5,
    },
  ],

  pricing: {
    focusLabel: 'Volume de reservas',
    focusDesc: 'Quanto mais cotações a IA atende, mais reservas diretas você fecha. Sem comissão, sem intermediário.',
  },

  faqs: [
    { question: 'O Zélla funciona com o WhatsApp Business da minha pousada?', answer: 'Sim! O Zélla se conecta ao seu WhatsApp Business oficial. Seu número continua o mesmo, e você mantém acesso total ao histórico de conversas.' },
    { question: 'Como o hóspede recebe a chave PIX?', answer: 'O Zélla envia automaticamente a chave PIX cadastrada no momento certo da conversa — quando o hóspede confirma interesse na reserva. Tudo em um único balão, sem fragmentação.' },
    { question: 'Posso intervir na conversa quando quiser?', answer: 'Sim! O painel mostra todas as conversas em tempo real. Com um clique você pausa a IA e assume o atendimento. A transição é imperceptível para o hóspede.' },
    { question: 'O Zélla funciona com calendário de disponibilidade?', answer: 'Sim. O Zélla consulta seu calendário em tempo real antes de confirmar qualquer reserva. Não há risco de overbooking.' },
    { question: 'Qual o custo por mensagem?', answer: 'Nossos planos começam em R$ 197/mês com tudo incluído. Não cobramos por mensagem individual — você define o orçamento e o Zélla otimiza automaticamente.' },
    { question: 'E se a IA errar uma resposta?', answer: 'O Zélla tem taxa de confiança de 98%+. Quando a confiança cai abaixo do limiar, ele escala para você automaticamente. Você nunca perde o controle.' },
  ],
};

// ═══════════════════════════════════════════════════════════════
// ANFITRIÕES CONTENT — Inspirado na API do Airbnb
// ═══════════════════════════════════════════════════════════════
const anfitrioesContent: NicheContent = {
  switcher: {
    headline: 'Seu co-anfitrião que nunca dorme.',
    subheadline: 'Ele lê o seu anúncio Airbnb, entrega as chaves virtuais, responde com detalhes do imóvel e da redondeza, e converte hóspedes em reservas diretas — tudo automático, 24 horas por dia.',
    heroStat: { val: '0', label: 'interação necessária' },
    backgroundImage: '/images/niche-anfitrioes-bg.jpg',
    ctaText: 'Ver como funciona para Anfitriões',
    accentColor: 'blue',
    glowColor: 'rgba(65, 105, 225, 0.08)',
  },

  painCards: [
    {
      icon: 'Key',
      title: 'Check-in sem sua presença',
      desc: 'O hóspede fecha a reserva e recebe automaticamente as instruções de acesso com código da fechadura inteligente. Você nem precisa pegar no celular — nem de madrugada, nem no feriado.',
      stat: { val: '0 min', label: 'Tempo do anfitrião' },
      color: 'blue',
      size: 'lg',
    },
    {
      icon: 'Bot',
      title: 'A IA que conhece seu imóvel como você',
      desc: 'O Zélla importa as regras, fotos, localização, amenidades e políticas direto do seu anúncio Airbnb. Ele responde no WhatsApp com informações precisas sobre o imóvel e a vizinhança — restaurantes, praias, farmácias, transporte — como um anfitrião local que mora ali.',
      stat: { val: '100%', label: 'Baseado no seu anúncio' },
      color: 'emerald',
      size: 'lg',
    },
    {
      icon: 'Building2',
      title: 'Escale sem contratar equipe',
      desc: 'De 2 para 10 imóveis sem aumentar equipe. O Zélla atende todos simultaneamente, com respostas personalizadas para cada propriedade e sua vizinhança específica.',
      color: 'sky',
      size: 'sm',
    },
    {
      icon: 'ShieldCheck',
      title: 'Confiança que o hóspede sente',
      desc: 'Respostas rápidas, precisas e humanizadas transmitem segurança. O hóspede sente que está sendo cuidado por alguém que conhece o imóvel — e volta, e recomenda. A percepção de qualidade é o que gera avaliação 5 estrelas.',
      color: 'amber',
      size: 'sm',
    },
    {
      icon: 'DollarSign',
      title: 'Reservas diretas = mais receita',
      desc: 'Cada reserva via WhatsApp é uma comissão de 15% da Airbnb que fica no seu bolso. O Zélla converte hóspedes do Airbnb em clientes diretos recorrentes. Um hóspede que volta pelo WhatsApp nunca mais paga comissão.',
      stat: { val: '15%', label: 'Comissão Airbnb eliminada' },
      color: 'violet',
      size: 'sm',
    },
    {
      icon: 'MapPin',
      title: 'Conhecimento local automático',
      desc: 'O Zélla sabe informar sobre a redondeza: onde comer, como chegar, o que fazer, pontos turísticos, farmácias e emergências. Tudo baseado na localização do seu imóvel — sem você configurar nada.',
      color: 'pink',
      size: 'sm',
    },
  ],

  steps: [
    {
      num: '01',
      icon: 'Link',
      title: 'Cole a URL do seu anúncio',
      subtitle: 'O Zélla faz o resto sozinho',
      desc: 'Basta colar o link do seu anúncio Airbnb. O Zélla importa automaticamente as fotos, regras, preços, amenidades, localização, políticas e informações da vizinhança. Tudo preenchido sem você digitar nada — igual à API oficial do Airbnb.',
      color: 'blue',
      highlights: ['Importação automática completa', 'Zero digitação', 'Revisão guiada'],
      fields: ['URL do anúncio Airbnb', 'Chave PIX', 'WhatsApp do anfitrião', 'Código da fechadura', 'Instruções de check-in', 'Regras da casa'],
    },
    {
      num: '02',
      icon: 'Bot',
      title: 'A IA atende no seu lugar',
      subtitle: 'WhatsApp 24/7 com respostas do seu anúncio',
      desc: 'O Zélla responde perguntas sobre o imóvel, envia fotos, confirma disponibilidade, entrega as chaves virtuais e informa sobre a redondeza — tudo baseado no que ele aprendeu do seu anúncio e da localização. Respostas humanizadas que transmitem confiança e cuidado.',
      color: 'emerald',
      highlights: ['Respostas baseadas no anúncio', 'Chaves virtuais automáticas', 'Informações da vizinhança incluídas'],
    },
    {
      num: '03',
      icon: 'BarChart3',
      title: 'Escale e monitore',
      subtitle: 'De 2 para 10 imóveis sem estresse',
      desc: 'Adicione mais imóveis colando novas URLs. O painel mostra ocupação, receita e avaliações de todo o portfólio. Você cresce sem contratar ninguém — cada imóvel tem seu próprio atendimento personalizado.',
      color: 'violet',
      highlights: ['Portfólio centralizado', 'Relatórios consolidados', 'Alertas de avaliação'],
    },
  ],

  features: [
    {
      icon: 'Key',
      badge: 'Check-in Virtual Automático',
      heroStat: { val: '0', label: 'toques necessários', gradient: 'from-blue-400 to-indigo-400' },
      headline: 'O hóspede reserva. A chave já está lá.',
      subtitle: 'Fechadura inteligente + WhatsApp = check-in autônomo.',
      desc: 'Quando o hóspede confirma a reserva pelo WhatsApp, o Zélla envia automaticamente as instruções de acesso com o código da fechadura. Check-in autônomo, sem sua interação — nem de madrugada, nem no feriado. O hóspede chega e entra com a sensação de que tudo foi pensado para ele.',
      stats: [
        { val: '0 min', label: 'Tempo do anfitrião', sublabel: 'Check-in 100% automático', icon: 'Clock' },
        { val: '4.8★', label: 'Avaliação média', sublabel: 'Hóspedes adoram a autonomia', icon: 'Star' },
      ],
      pills: [
        { text: 'Código enviado automaticamente', accent: true },
        { text: 'Instruções de acesso passo a passo' },
        { text: 'Compatível com fechaduras smart' },
        { text: 'Suporte PT / ES' },
      ],
      bottomLine: 'Seu hóspede chega e entra. Você nem precisa acordar.',
      mockup: 'whatsapp',
      reverse: false,
    },
    {
      icon: 'Link',
      badge: 'Importação Airbnb 1-Click',
      heroStat: { val: '1', label: 'URL para configurar', gradient: 'from-amber-400 to-rose-400' },
      headline: 'Cole o link. O Zélla se configura.',
      subtitle: 'Seu anúncio vira a base de conhecimento da IA — incluindo a vizinhança.',
      desc: 'Não preencha formulários intermináveis. Cole a URL do seu anúncio Airbnb e o Zélla extrai tudo: fotos, regras, localização, preços, políticas, amenidades e pontos de interesse ao redor. Ele revisa e você só confirma — em 5 minutos está pronto para atender.',
      stats: [
        { val: '5 min', label: 'Tempo de setup', sublabel: 'Da URL ao atendimento ativo', icon: 'Zap' },
        { val: '98%', label: 'Precisão da importação', sublabel: 'Campos auto-preenchidos', icon: 'Sparkles' },
      ],
      pills: [
        { text: 'Importação automática via URL', accent: true },
        { text: 'Revisão guiada dos dados' },
        { text: 'Múltiplos anúncios, uma conta' },
        { text: 'Informações de vizinhança incluídas' },
      ],
      bottomLine: 'Sem configuração manual. A IA aprende com o seu anúncio. (PRO e MAX)',
      mockup: 'linkinbio',
      reverse: true,
    },
  ],

  dashboard: {
    badge: 'Portfólio Inteligente',
    headline: 'Todos os seus imóveis,',
    headlineAccent: 'um único painel.',
    desc: 'Acompanhe reservas, ocupação e avaliações de todo o seu portfólio em tempo real. Receba notificações quando o Zélla detectar intenção de reserva e aprove com um toque. Cada imóvel com seu próprio atendimento personalizado.',
    pains: [
      { icon: 'Building2', title: 'Visão de Portfólio Completa', desc: 'Acompanhe ocupação, receita e avaliação de todos os seus imóveis em um único painel. Relatórios consolidados para decisões estratégicas sobre crescimento.' },
      { icon: 'Bell', title: 'Notificação de Fechamento', desc: 'Quando o Zélla detecta intenção de reserva, ele te notifica com resumo da conversa e perfil do hóspede. Você aprova com um toque — sem abrir o WhatsApp.' },
      { icon: 'DollarSign', title: 'Receita Direta Maximizada', desc: 'Cada reserva via WhatsApp elimina a comissão de 15% da Airbnb. Veja quanto você está economizando em taxas e quantos hóspedes se tornaram clientes diretos recorrentes.' },
    ],
    stats: [
      { label: 'Sem tocar no celular', val: '24/7', title: 'Atendimento IA', color: 'text-blue-400' },
      { label: 'Economia em comissões', val: '15%', title: 'Receita direta', color: 'text-emerald-400' },
      { label: 'Do anúncio para a IA', val: '1 URL', title: 'Setup instantâneo', color: 'text-amber-400' },
      { label: 'Sem contratar equipe', val: '∞', title: 'Imóveis simultâneos', color: 'text-zinc-300' },
    ],
    recentActivity: [
      { color: 'bg-blue-400', text: 'Check-in virtual enviado (André)', time: 'agora' },
      { color: 'bg-emerald-400', text: 'Reserva detectada — aguardando aprovação', time: '5m' },
      { color: 'bg-amber-400', text: 'Avaliação 5★ recebida', time: '1h' },
    ],
    footerLeft: { icon: 'DollarSign', label: 'Receita Direta do Mês:', value: 'R$ 12.450,00' },
    footerRight: { icon: 'CheckCircle2', label: 'Comissões Airbnb Economizadas:', value: 'R$ 1.867,00' },
    chatConversation: [
      { sender: 'user', name: 'André Oliveira', text: 'Boa noite! Qual o valor para o apartamento de 2 quartos no feriado? Tem estacionamento próximo?' },
      { sender: 'bot', confidence: '97%', actions: 'Anúncio + localização consultados', text: 'Boa noite, André! O apartamento de 2 quartos está disponível para o feriado. Valor: R$ 380/noite. Sim, há estacionamento coberto a 2 quadras (R$ 25/dia). Posso enviar as instruções de check-in com o código da fechadura?' },
      { sender: 'user', name: 'André Oliveira', text: 'Perfeito! Quero reservar para 2 noites.' },
    ],
  },

  testimonials: [
    {
      name: 'Marcos Ferreira',
      role: 'Anfitrião Multi-Property',
      location: '5 apartamentos — São Paulo, SP',
      text: 'Com 5 apartamentos, eu não dava conta do WhatsApp. O Zélla importou tudo da Airbnb e agora atende sozinho — inclusive sobre a vizinhança. Minhas avaliações subiram porque o hóspede nunca fica sem resposta.',
      avatar: '/avatar-serenity.jpg',
      rating: 5,
    },
    {
      name: 'Patrícia Lopes',
      role: 'Anfitriã',
      location: '2 flats — Rio de Janeiro, RJ',
      text: 'O check-in virtual mudou minha vida. O hóspede recebe o código da fechadura e entra sozinho. Eu nem preciso estar na cidade. Isso é escalar de verdade — e o hóspede se sente seguro.',
      avatar: '/pousada-vista.jpg',
      rating: 5,
    },
    {
      name: 'Lucas Tanaka',
      role: 'Anfitrião',
      location: '3 chalés — Campos do Jordão, SP',
      text: 'A importação do anúncio é genial. Colei a URL e em 5 minutos o Zélla já estava respondendo com detalhes do imóvel e da redondeza. Antes eu gastava 2 horas por dia no WhatsApp, agora são 10 minutos de revisão.',
      avatar: '/pousada-chale.jpg',
      rating: 5,
    },
  ],

  pricing: {
    focusLabel: 'Escala de imóveis',
    focusDesc: 'Mais imóveis, mesma equipe zero. O Zélla atende todos simultaneamente e cada reserva direta elimina 15% de comissão Airbnb.',
  },

  faqs: [
    { question: 'O Zélla importa mesmo tudo do meu anúncio Airbnb?', answer: 'Sim! Basta colar a URL e o Zélla extrai fotos, regras, localização, preços, amenidades e políticas automaticamente — como a API oficial do Airbnb. Você revisa e confirma em 5 minutos.' },
    { question: 'Como funciona o check-in virtual?', answer: 'Quando o hóspede confirma a reserva, o Zélla envia automaticamente as instruções de acesso com o código da fechadura inteligente. Tudo pelo WhatsApp, sem sua interação — nem de madrugada.' },
    { question: 'O Zélla sabe informar sobre a vizinhança?', answer: 'Sim! Com base na localização do seu imóvel, o Zélla responde sobre restaurantes, praias, pontos turísticos, farmácias e transporte próximos. Tudo automático, sem configuração.' },
    { question: 'Posso usar com múltiplos imóveis?', answer: 'Sim! Adicione quantos anúncios quiser colando as URLs. O painel mostra todas as propriedades em um único lugar com métricas consolidadas. Cada imóvel tem seu próprio atendimento personalizado.' },
    { question: 'E se o hóspede tiver um problema que a IA não resolve?', answer: 'O Zélla detecta situações que precisam de atenção humana e te notifica imediatamente com o resumo da conversa. Você pode assumir o chat com um toque — a transição é imperceptível.' },
    { question: 'Quanto economizo em comissões?', answer: 'Cada reserva que o Zélla converte pelo WhatsApp elimina a comissão da Airbnb (cerca de 15%). Em um portfólio de 5 imóveis, isso pode representar mais de R$ 2.000/mês em economia. Hóspedes que voltam pelo WhatsApp nunca mais pagam comissão.' },
  ],
};

// ═══════════════════════════════════════════════════════════════
// PARCEIRO CONTENT — R$297/mês durante 24 meses (PRO com selo exclusivo)
// ═══════════════════════════════════════════════════════════════
const parceiroContent: NicheContent = {
  switcher: {
    headline: 'Plano PRO por R$297/mês. Preço congelado por 24 meses.',
    subheadline: 'Como Parceiro Zélla, você acessa o plano PRO completo por R$297/mês — R$100 a menos que o preço regular. Preço congelado por 24 meses + selo exclusivo de parceiro. Economia de R$2.400 em 2 anos.',
    heroStat: { val: 'R$297/mês', label: 'PRO por 24 meses congelado' },
    backgroundImage: '/images/niche-parceiro-bg.jpg',
    ctaText: 'Garantir minha vaga de Parceiro',
    accentColor: 'amber',
    glowColor: 'rgba(217, 165, 32, 0.08)',
  },

  painCards: [
    {
      icon: 'Crown',
      title: 'PRO por R$297/mês — preço de parceiro',
      desc: 'O plano PRO regular custa R$397/mês. Como Parceiro Zélla, você paga apenas R$297/mês com o preço congelado por 24 meses. São R$100 de desconto todo mês — R$2.400 de economia em 2 anos. Hóspedes ilimitados, mensagens ilimitadas, tudo do PRO.',
      stat: { val: 'R$2.400', label: 'Economia em 24 meses' },
      color: 'amber',
      size: 'lg',
    },
    {
      icon: 'ShieldCheck',
      title: 'Selo Exclusivo de Parceiro Zélla',
      desc: 'Receba o selo de parceiro oficial no seu perfil e communications. Transmita credibilidade e confiança aos seus hóspedes — eles sabem que estão sendo atendidos por uma empresa certificada. Diferencial que ninguém mais tem.',
      stat: { val: 'OFICIAL', label: 'Selo de parceiro' },
      color: 'emerald',
      size: 'lg',
    },
    {
      icon: 'Lock',
      title: 'Preço congelado por 24 meses',
      desc: 'Mesmo que o plano PRO sofra reajuste, seu preço de R$297/mês fica travado por 24 meses. Sem surpresa, sem reajuste surpresa. Você sabe exatamente quanto vai pagar durante 2 anos inteiros.',
      color: 'blue',
      size: 'sm',
    },
    {
      icon: 'Zap',
      title: 'Todas as funcionalidades do PRO',
      desc: 'Hóspedes ilimitados, mensagens ilimitadas, campanhas automatizadas, análise de sentimento, sugestões de preços inteligentes, suporte prioritário. Tudo que o PRO oferece, você tem como Parceiro.',
      color: 'sky',
      size: 'sm',
    },
    {
      icon: 'TrendingUp',
      title: 'ROI já na primeira semana',
      desc: 'Com mensagens ilimitadas e hóspedes ilimitados, uma única reserva gerada pelo Zélla já cobre a mensalidade. Depois disso, cada reserva extra é lucro direto no seu bolso — e você ainda tem o mês todo pela frente.',
      stat: { val: '1', label: 'Reserva para se pagar' },
      color: 'violet',
      size: 'sm',
    },
    {
      icon: 'Clock',
      title: 'Vagas limitadas — condição exclusiva',
      desc: 'O programa Parceiro Zélla tem vagas limitadas. Ao se tornar parceiro, você garante R$297/mês congelados por 24 meses — mesmo que o preço regular do PRO suba. Quanto antes entrar, mais economiza.',
      color: 'pink',
      size: 'sm',
    },
  ],

  steps: [
    {
      num: '01',
      icon: 'CreditCard',
      title: 'Assine o Parceiro por R$297/mês',
      subtitle: 'Cartão ou PIX — sem burocracia',
      desc: 'Assine o plano Parceiro Zélla por R$297/mês com o preço congelado por 24 meses. Pagamento mensal via PIX ou cartão de crédito. Em minutos você recebe o acesso completo ao PRO + selo exclusivo de parceiro.',
      color: 'amber',
      highlights: ['R$297/mês congelado por 24 meses', 'PIX ou cartão de crédito', 'Acesso imediato ao plano PRO'],
      fields: ['Nome completo', 'WhatsApp', 'E-mail', 'Chave PIX ou cartão'],
    },
    {
      num: '02',
      icon: 'UserPlus',
      title: 'Configure seu negócio no Zélla',
      subtitle: '5 minutos e está no ar',
      desc: 'Cadastre seu negócio ou importe seu anúncio de hospedagem. O Zélla importa tudo automaticamente e já começa a atender seus hóspedes. Em menos de 24 horas, a primeira reserva pela IA costuma chegar.',
      color: 'emerald',
      highlights: ['Importação automática ou cadastro manual', 'Setup em 5 minutos', 'Primeira reserva em até 24h'],
    },
    {
      num: '03',
      icon: 'TrendingUp',
      title: '2 anos de PRO com preço travado',
      subtitle: 'Economia garantida mês a mês',
      desc: 'Aproveite 24 meses de plano PRO completo por R$297/mês — R$100 a menos que o regular. Hóspedes ilimitados, mensagens ilimitadas, suporte prioritário, tudo incluído. Foque no que importa — o Zélla cuida do resto.',
      color: 'violet',
      highlights: ['24 meses de PRO congelado', 'R$100/mês de desconto', 'Suporte prioritário incluído'],
    },
  ],

  features: [
    {
      icon: 'Crown',
      badge: 'Plano Parceiro Exclusivo',
      heroStat: { val: 'R$297/mês', label: 'PRO congelado por 24 meses', gradient: 'from-amber-400 to-yellow-400' },
      headline: 'Plano PRO. Preço de Parceiro.',
      subtitle: 'R$100 de desconto todo mês + selo exclusivo de parceiro.',
      desc: 'O plano PRO regular custa R$397/mês. Como Parceiro Zélla, você paga R$297/mês com preço congelado por 24 meses — são R$100 de economia todo mês, totalizando R$2.400 em 2 anos. Hóspedes ilimitados, mensagens ilimitadas, suporte prioritário, tudo do PRO. E ainda ganha o selo exclusivo de parceiro.',
      stats: [
        { val: 'R$2.400', label: 'Economia vs. PRO regular', sublabel: 'R$100 × 24 meses', icon: 'DollarSign' },
        { val: 'R$100', label: 'Desconto por mês', sublabel: 'R$397 → R$297', icon: 'Calculator' },
      ],
      pills: [
        { text: 'Plano PRO completo — R$297/mês', accent: true },
        { text: 'Preço congelado por 24 meses' },
        { text: 'Selo exclusivo de Parceiro Zélla' },
        { text: 'Hóspedes e mensagens ilimitados' },
      ],
      bottomLine: 'R$100 a menos por mês durante 2 anos. O PRO nunca foi tão acessível.',
      mockup: 'whatsapp',
      reverse: false,
    },
    {
      icon: 'BarChart3',
      badge: 'Comparativo de Planos',
      heroStat: { val: '25%', label: 'de desconto no PRO', gradient: 'from-amber-400 to-orange-400' },
      headline: 'Veja quanto você economiza.',
      subtitle: 'O Parceiro é o melhor custo-benefício do Zélla.',
      desc: 'Em 24 meses, o plano PRO regular custa R$9.528. O Parceiro PRO custa R$7.128 — os mesmos R$297/mês congelados. Economia de R$2.400 que fica no seu bolso. Mesmo PRO, mesmas funcionalidades, mesmo atendimento — preço de parceiro.',
      stats: [
        { val: 'R$9.528', label: 'PRO regular em 24 meses', sublabel: 'R$397 × 24', icon: 'DollarSign' },
        { val: 'R$7.128', label: 'Parceiro em 24 meses', sublabel: 'R$297 × 24', icon: 'Crown' },
      ],
      pills: [
        { text: 'PRO regular: R$397/mês', accent: false },
        { text: 'Parceiro PRO: R$297/mês', accent: true },
        { text: 'Economia de R$2.400 em 2 anos', accent: true },
        { text: '25% de desconto real no PRO', accent: true },
      ],
      bottomLine: 'O melhor negócio do Zélla. Vagas limitadas — aproveite enquanto está disponível.',
      mockup: 'linkinbio',
      reverse: true,
    },
  ],

  dashboard: {
    badge: 'Painel do Parceiro',
    headline: 'PRO completo,',
    headlineAccent: 'por um preço que impressiona.',
    desc: 'O plano Parceiro dá acesso total ao dashboard PRO: reservas, receita, taxa de ocupação, campanhas, análise de sentimento — tudo em tempo real. Acompanhe seu ROI e veja a economia de R$100/mês acontecendo.',
    pains: [
      { icon: 'Activity', title: 'Dashboard PRO Completo', desc: 'Reservas geradas, receita do dia, taxa de ocupação, campanhas ativas — tudo em tempo real. Relatórios semanais automáticos no seu e-mail com métricas detalhadas.' },
      { icon: 'DollarSign', title: 'Economia de R$100/mês', desc: 'Veja exatamente quanto está economizando como Parceiro: R$100 todo mês comparado ao PRO regular. Em 24 meses, são R$2.400 que ficam no seu bolso.' },
      { icon: 'TrendingUp', title: 'ROI Visível desde a Primeira Semana', desc: 'Com mensagens ilimitadas e hóspedes ilimitados, uma única reserva gerada pelo Zélla já cobre a mensalidade de R$297. O ROI é visível no painel desde o primeiro dia.' },
    ],
    stats: [
      { label: 'Mensalidade Parceiro', val: 'R$297', title: 'Por mês (congelado)', color: 'text-amber-400' },
      { label: 'Mesmo atendimento dos planos mensais', val: '24/7', title: 'IA no WhatsApp', color: 'text-emerald-400' },
      { label: 'Desconto vs. PRO regular', val: 'R$100', title: 'Por mês', color: 'text-blue-400' },
      { label: 'Economia em 24 meses', val: 'R$2.400', title: 'Total garantido', color: 'text-zinc-300' },
    ],
    recentActivity: [
      { color: 'bg-amber-400', text: 'Plano Parceiro PRO ativado com sucesso', time: 'agora' },
      { color: 'bg-emerald-400', text: 'Primeira reserva gerada pela IA', time: '18h' },
      { color: 'bg-blue-400', text: 'PIX recebido — R$380,00', time: '1d' },
    ],
    footerLeft: { icon: 'DollarSign', label: 'Receita Gerada pela IA:', value: 'R$ 2.340,00' },
    footerRight: { icon: 'Crown', label: 'Plano Parceiro PRO:', value: 'R$ 297,00/mês' },
    chatConversation: [
      { sender: 'user', name: 'Luciana Ferreira', text: 'Olá! Vi que vocês têm o plano Parceiro PRO por R$297/mês. Como funciona o preço congelado?' },
      { sender: 'bot', confidence: '99%', actions: 'Plano Parceiro selecionado', text: 'Olá, Luciana! O Plano Parceiro PRO é simples: você paga R$297/mês e o preço fica congelado por 24 meses — mesmo que o PRO regular suba. São R$100 de desconto por mês em relação ao PRO de R$397. Tudo do PRO: hóspedes ilimitados, mensagens ilimitadas, suporte prioritário. E ainda ganha o selo exclusivo de parceiro. Quer garantir sua vaga?' },
      { sender: 'user', name: 'Luciana Ferreira', text: 'Isso é incrível! Quero garantir minha vaga de Parceiro agora!' },
    ],
  },

  testimonials: [
    {
      name: 'Thiago Ribeiro',
      role: 'Parceiro Zélla',
      location: 'Belo Horizonte, MG',
      text: 'R$297/mês pelo PRO congelado por 2 anos? É o melhor negócio que já fiz. O PRO regular é R$397, então já economizo R$100 todo mês. A primeira reserva que o Zélla gerou já cobriu a mensalidade. Depois disso, é lucro.',
      avatar: '/avatar-serenity.jpg',
      rating: 5,
    },
    {
      name: 'Camila Santos',
      role: 'Parceira Zélla',
      location: 'Ubatuba, SP',
      text: 'Eu estava em dúvida entre o PRO regular e o Parceiro. Fiz as contas: R$397/mês = R$9.528 em 2 anos. O Parceiro é R$297/mês = R$7.128. Economia de R$2.400! E é o mesmo PRO completo com selo de parceiro.',
      avatar: '/pousada-vista.jpg',
      rating: 5,
    },
    {
      name: 'Rafael Lima',
      role: 'Parceiro Zélla',
      location: 'Campos do Jordão, SP',
      text: 'O plano Parceiro PRO é imbatível. R$297/mês com tudo do PRO: mensagens ilimitadas, hóspedes ilimitados, preço congelado por 24 meses. Configurei em 5 minutos e em 3 dias já tinha a primeira reserva. ROI de 10x.',
      avatar: '/pousada-chale.jpg',
      rating: 5,
    },
  ],

  pricing: {
    focusLabel: 'PRO por preço de Parceiro',
    focusDesc: 'R$297/mês congelados por 24 meses. Plano PRO completo com hóspedes e mensagens ilimitados + selo exclusivo de parceiro. Economia de R$2.400 vs. PRO regular.',
  },

  faqs: [
    { question: 'O plano Parceiro é realmente R$297/mês?', answer: 'Sim! Como Parceiro Zélla, você paga R$297/mês pelo plano PRO completo — R$100 a menos que o preço regular de R$397/mês. O preço fica congelado por 24 meses, sem reajuste. É o nosso melhor custo-benefício.' },
    { question: 'O Parceiro tem as mesmas funcionalidades do PRO?', answer: 'Sim! O plano Parceiro inclui tudo do PRO: hóspedes ilimitados, mensagens ilimitadas, IA 24/7 no WhatsApp, campanhas automatizadas, análise de sentimento, suporte prioritário e dashboard completo. A diferença? Você paga R$100 a menos por mês e ganha o selo exclusivo de parceiro.' },
    { question: 'O que é o selo exclusivo de Parceiro?', answer: 'O selo de Parceiro Zélla é um distintivo oficial que aparece no seu perfil e comunicações. Mostra aos hóspedes que você é certificado pelo Zélla — transmitindo credibilidade e confiança. Apenas parceiros têm esse selo.' },
    { question: 'O preço de R$297/mês pode subir?', answer: 'Não durante 24 meses. Seu preço de R$297/mês fica congelado por 24 meses a partir da ativação, mesmo que o plano PRO regular sofra reajuste. Transparência total — você sabe exatamente quanto vai pagar.' },
    { question: 'Funciona para qualquer tipo de hospedagem?', answer: 'Sim! O plano Parceiro PRO funciona para pousadas, chalés, flats ou qualquer tipo de hospedagem. Você cadastra seu negócio ou importa seu anúncio — a IA importa tudo automaticamente. Hóspedes e mensagens são ilimitados para qualquer tipo de operação.' },
    { question: 'E se eu quiser o plano MAX depois?', answer: 'Se precisar de recursos exclusivos do MAX (consultoria mensal, onboarding personalizado, SLA garantido), você pode fazer upgrade pagando apenas a diferença. Seu preço de Parceiro é preservado se quiser voltar ao PRO depois.' },
  ],
};

// ═══════════════════════════════════════════════════════════════
// CONTENT RESOLVER
// ═══════════════════════════════════════════════════════════════
const contentMap: Record<NicheType, NicheContent> = {
  pousadas: pousadasContent,
  anfitrioes: anfitrioesContent,
  parceiro: parceiroContent,
};

export function getNicheContent(niche: NicheType): NicheContent {
  return contentMap[niche];
}
