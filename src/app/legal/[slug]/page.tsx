'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText, Shield, Scale, CreditCard, Lock, Building2 } from 'lucide-react';

const LEGAL_PAGES: Record<string, {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  lastUpdated: string;
  sections: { heading: string; content: string }[];
}> = {
  'privacidade-central': {
    title: 'Central de Privacidade',
    subtitle: 'Gerencie suas preferências de privacidade',
    icon: Shield,
    lastUpdated: '01 de Julho, 2026',
    sections: [
      {
        heading: 'Sobre a Central de Privacidade',
        content: 'A Central de Privacidade do Seu Zélla é o espaço onde você pode gerenciar todas as suas preferências relacionadas ao tratamento dos seus dados pessoais. Nossa plataforma coleta e processa dados estritamente necessários para a prestação dos serviços contratados, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018). Aqui você encontra informações detalhadas sobre quais dados coletamos, por que coletamos, por quanto tempo armazenamos e como pode exercer seus direitos como titular.',
      },
      {
        heading: 'Dados Coletados',
        content: 'Coletamos os seguintes dados: (i) Dados de cadastro: nome, e-mail, telefone, CNPJ e endereço da pousada; (ii) Dados operacionais: reservas, check-ins, check-outs e preferências de hóspedes; (iii) Dados de comunicação: histórico de conversas via WhatsApp para atendimento ao hóspede; (iv) Dados de pagamento: informações necessárias para processamento via Mercado Pago. Todos os dados são criptografados em trânsito (TLS 1.3) e em repouso (AES-256-GCM).',
      },
      {
        heading: 'Seus Direitos',
        content: 'Como titular dos dados, você tem direito a: confirmação da existência de tratamento; acesso aos dados; correção de dados incompletos; anonimização, bloqueio ou eliminação de dados desnecessários; portabilidade dos dados; eliminação dos dados tratados com base no seu consentimento; informação sobre compartilhamento de dados; e revogação do consentimento. Para exercer qualquer direito, entre em contato pelo e-mail privacidade@zehla.com.br.',
      },
    ],
  },
  'termos-uso': {
    title: 'Termos de Uso',
    subtitle: 'Condições gerais de utilização da plataforma',
    icon: FileText,
    lastUpdated: '01 de Julho, 2026',
    sections: [
      {
        heading: '1. Aceitação dos Termos',
        content: 'Ao acessar e utilizar a plataforma Seu Zélla ("Plataforma"), você concorda integralmente com estes Termos de Uso. Caso não concorde com qualquer disposição, deverá cessar imediatamente o uso. A Zélla Tecnologia para Hospitalidade LTDA ("Empresa") reserva-se o direito de atualizar estes termos a qualquer momento, notificando os usuários por e-mail ou through da própria Plataforma. O uso continuado após alterações constitui aceitação dos novos termos.',
      },
      {
        heading: '2. Descrição do Serviço',
        content: 'O Seu Zélla é uma plataforma de automação inteligente para o setor de hospitalidade, que utiliza inteligência artificial para atendimento via WhatsApp, gestão de reservas, geração de PIX para pagamentos e fornecimento de métricas operacionais. Os serviços são oferecidos em modalidade SaaS (Software as a Service), com planos mensais ou anuais conforme tabela disponível na Plataforma. A Empresa não se responsabiliza por interrupções causadas por terceiros (WhatsApp/Meta, provedores de pagamento, operadoras de internet).',
      },
      {
        heading: '3. Conta do Usuário',
        content: 'É responsabilidade do usuário manter a confidencialidade de suas credenciais de acesso. O usuário é responsável por todas as atividades realizadas em sua conta. Em caso de suspeita de acesso não autorizado, o usuário deve notificar imediatamente a Empresa. Contas inativas por mais de 90 dias consecutivos poderão ser suspensas. A Empresa reserva-se o direito de encerrar contas que violem estes Termos.',
      },
      {
        heading: '4. Limitação de Responsabilidade',
        content: 'A Plataforma é fornecida "como está" (as is). A Empresa não garante disponibilidade ininterrupta, embora se esforce para manter 99,9% de uptime. A Empresa não se responsabiliza por danos indiretos, incidentais ou consequenciais decorrentes do uso ou incapacidade de uso da Plataforma. O valor máximo de responsabilidade da Empresa é limitado ao total pago pelo usuário nos últimos 3 meses anteriores ao evento.',
      },
    ],
  },
  'politica-privacidade': {
    title: 'Política de Privacidade',
    subtitle: 'Como tratamos e protegemos seus dados',
    icon: Lock,
    lastUpdated: '01 de Julho, 2026',
    sections: [
      {
        heading: '1. Controlador dos Dados',
        content: 'O controlador dos dados pessoais é a Zélla Tecnologia para Hospitalidade LTDA, com sede no Brasil, inscrita no CNPJ sob o nº XX.XXX.XXX/0001-XX, e-mail de contato: privacidade@zehla.com.br. Nossa Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas informações pessoais em conformidade com a LGPD (Lei 13.709/2018) e demais normas aplicáveis.',
      },
      {
        heading: '2. Base Legal para Tratamento',
        content: 'Tratamos seus dados pessoais com base nas seguintes hipóteses legais previstas na LGPD: (i) Execução de contrato (art. 7º, V) — para prestação dos serviços contratados; (ii) Legítimo interesse (art. 7º, IX) — para melhoria dos serviços e comunicação sobre novos recursos; (iii) Consentimento (art. 7º, I) — quando necessário para finalidades específicas como marketing; (iv) Cumprimento de obrigação legal (art. 7º, II) — para obrigações fiscais e regulatórias.',
      },
      {
        heading: '3. Compartilhamento de Dados',
        content: 'Seus dados podem ser compartilhados com: (i) Mercado Pago — exclusivamente para processamento de pagamentos, sob contrato de confidencialidade; (ii) Provedores de infraestrutura em nuvem — para hospedagem e processamento dos dados; (iii) WhatsApp Business API (Meta) — para envio e recebimento de mensagens; (iv) Autoridades competentes — quando exigido por lei. A Empresa não vende, aluga ou comercializa seus dados pessoais com terceiros para fins não relacionados ao serviço.',
      },
      {
        heading: '4. Retenção de Dados',
        content: 'Os dados pessoais são retidos pelo período necessário para cumprir as finalidades para as quais foram coletados: (i) Dados de cadastro: enquanto a conta estiver ativa e até 5 anos após encerramento para fins legais; (ii) Dados de comunicação WhatsApp: 90 dias, podendo ser excluídos antes mediante solicitação; (iii) Dados de pagamento: 5 anos conforme exigido pela legislação fiscal brasileira; (iv) Dados de acesso/log: 180 dias para fins de segurança.',
      },
    ],
  },
  'politica-cobranca': {
    title: 'Política de Cobrança',
    subtitle: 'Regras de faturamento e pagamentos',
    icon: CreditCard,
    lastUpdated: '01 de Julho, 2026',
    sections: [
      {
        heading: '1. Planos e Preços',
        content: 'O Seu Zélla oferece planos mensais e anuais conforme tabela apresentada na Plataforma. Os preços podem ser alterados com 30 dias de aviso prévio por e-mail. O período trial de 7 dias é gratuito e sem compromisso. Ao final do trial, o usuário deve escolher um plano para continuar utilizando a Plataforma. Caso não escolha, a conta é suspensa automaticamente sem cobranças.',
      },
      {
        heading: '2. Métodos de Pagamento',
        content: 'Aceitamos pagamentos via: (i) PIX — através do Mercado Pago, com confirmação instantânea; (ii) Cartão de crédito — Visa, Mastercard, Elo, American Express, com fatura mensal. O pagamento é processado de forma recorrente (assinatura). A primeira cobrança é realizada na data de escolha do plano, e as subsequentes no mesmo dia de cada mês.',
      },
      {
        heading: '3. Cancelamento e Reembolso',
        content: 'O usuário pode cancelar sua assinatura a qualquer momento pela Plataforma ou por e-mail. O cancelamento é efetivado ao final do período já pago — não há reembolso proporcional de períodos em curso. Após o cancelamento, os dados são mantidos por 90 dias para possível reativação. Após esse período, os dados são excluídos conforme nossa Política de Privacidade. Não há multa ou taxa de cancelamento. Planos anuais possuem desconto e não geram direito a reembolso diferenciado.',
      },
      {
        heading: '4. Inadimplência',
        content: 'Caso o pagamento não seja aprovado, o usuário tem 3 dias úteis para atualizar os dados de pagamento. Durante esse período, a Plataforma continua funcionando normalmente. Após 3 dias sem pagamento, o acesso é suspenso até a regularização. Não há cobrança de juros ou multa por atraso — o serviço é simplesmente pausado. Após 30 dias de inadimplência, a conta pode ser encerrada.',
      },
    ],
  },
  'contrato-saas': {
    title: 'Contrato de Prestação de Serviços SaaS',
    subtitle: 'Acordo de licença e uso da plataforma',
    icon: Scale,
    lastUpdated: '01 de Julho, 2026',
    sections: [
      {
        heading: 'CLÁUSULA 1 — DAS PARTES',
        content: 'De um lado, ZÉLLA TECNOLOGIA PARA HOSPITALIDADE LTDA, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº XX.XXX.XXX/0001-XX, com sede na [Endereço], doravante denominada "CONTRATADA". De outro lado, o usuário pessoa jurídica ou física que adere à Plataforma, doravante denominado "CONTRATANTE". As partes agreezam este Contrato de Prestação de Serviços SaaS, mediante as cláusulas e condições seguintes.',
      },
      {
        heading: 'CLÁUSULA 2 — DO OBJETO',
        content: 'O objeto deste contrato é a prestação de serviços de plataforma digital (SaaS) denominada "Seu Zélla", que inclui: (i) Atendimento automatizado via WhatsApp com inteligência artificial; (ii) Dashboard de controle operacional (DDC); (iii) Geração de links de pagamento PIX; (iv) Métricas e relatórios de desempenho; (v) Integração com canais de reserva. Os serviços são fornecidos exclusivamente de forma remota, por meio da internet.',
      },
      {
        heading: 'CLÁUSULA 3 — DO PRAZO E RESCISÃO',
        content: 'O contrato tem prazo indeterminado, iniciando-se na data de adesão ao plano escolhido. Qualquer das partes pode rescindir o contrato a qualquer momento, sem necessidade de notificação prévia ou justificativa. O CONTRATANTE não será cobrado por períodos futuros após o cancelamento. A rescisão não exime o CONTRATANTE do pagamento dos valores referentes ao período já utilizado. Os dados do CONTRATANTE serão mantidos por 90 dias após a rescisão para possível reativação.',
      },
      {
        heading: 'CLÁUSULA 4 — DA PROPRIEDADE INTELECTUAL',
        content: 'Todos os direitos de propriedade intelectual relacionados à Plataforma, incluindo mas não se limitando a software, design, marca, logotipos, base de conhecimento de IA e documentação, são de titularidade exclusiva da CONTRATADA. O CONTRATANTE recebe uma licença limitada, não exclusiva, intransferível e revogável para utilizar a Plataforma exclusivamente para seus fins internos de hospedagem. É vedada a reprodução, modificação, distribuição ou engenharia reversa de qualquer elemento da Plataforma.',
      },
      {
        heading: 'CLÁUSULA 5 — DA LGPD E PROTEÇÃO DE DADOS',
        content: 'As partes comprometem-se a observar a Lei Geral de Proteção de Dados (LGPD) e demais normas aplicáveis à proteção de dados pessoais. A CONTRATADA atua como operadora de dados em relação aos dados dos hóspedes do CONTRATANTE, processando-os exclusivamente conforme instruções do CONTRATANTE e para as finalidades descritas neste contrato. A CONTRATADA implementa medidas técnicas e organizacionais adequadas para proteger os dados, incluindo criptografia AES-256-GCM e TLS 1.3.',
      },
    ],
  },
};

const FALLBACK = {
  title: 'Página não encontrada',
  subtitle: 'O documento jurídico solicitado não existe',
  icon: FileText,
  lastUpdated: '',
  sections: [],
};

const SLUG_LIST = [
  { slug: 'privacidade-central', label: 'Central de Privacidade' },
  { slug: 'termos-uso', label: 'Termos de Uso' },
  { slug: 'politica-privacidade', label: 'Política de Privacidade' },
  { slug: 'politica-cobranca', label: 'Política de Cobrança' },
  { slug: 'contrato-saas', label: 'Contrato SaaS' },
];

export default function LegalPage() {
  const params = useParams<{ slug: string }>();
  const page = LEGAL_PAGES[params.slug] ?? FALLBACK;
  const Icon = page.icon;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/[0.05]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="text-white/30 hover:text-white/60 transition-colors p-1.5 rounded-lg hover:bg-white/[0.04]"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-white tracking-tight">Seu <span className="text-emerald-400">ZÉLLA</span></span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Icon className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{page.title}</h1>
              <p className="text-sm text-neutral-400 mt-0.5">{page.subtitle}</p>
            </div>
          </div>
          {page.lastUpdated && (
            <p className="text-xs text-neutral-500 ml-[52px]">Última atualização: {page.lastUpdated}</p>
          )}
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {page.sections.map((section, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-6 md:p-8">
              <h2 className="text-lg font-semibold text-white mb-3">{section.heading}</h2>
              <p className="text-sm text-neutral-400 leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>

        {/* No sections fallback */}
        {page.sections.length === 0 && (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
            <p className="text-neutral-400 text-sm mb-6">Documento não encontrado.</p>
            <Link href="/" className="text-emerald-400 text-sm font-semibold hover:text-emerald-300 transition-colors">
              Voltar ao início
            </Link>
          </div>
        )}

        {/* Sidebar Navigation */}
        <div className="mt-12 pt-8 border-t border-white/[0.05]">
          <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-widest mb-4">Documentos Jurídicos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SLUG_LIST.map((item) => (
              <Link
                key={item.slug}
                href={`/legal/${item.slug}`}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${
                  params.slug === item.slug
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-white/[0.02] text-neutral-400 hover:text-white hover:bg-white/[0.04] border border-white/[0.04]'
                }`}
              >
                <FileText className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}