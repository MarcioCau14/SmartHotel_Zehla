'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  MessageSquare,
  TrendingUp,
  Bot,
  CreditCard,
  Wifi,
  Shield,
  Check,
} from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: 'WhatsApp Inteligente com IA',
    subtitle: 'Atendimento que vende 24/7',
    desc: 'Respostas automáticas em português natural que vendem, reservam e encantam. A IA do ZEHLA entende contexto, negoceia preços e converte curiosos em hóspedes — tudo pelo WhatsApp que seu cliente já usa.',
    highlights: ['Resposta em 2 segundos', '24/7 sem pausas', 'Tom personalizado', 'Gera PIX automaticamente'],
    mockup: 'whatsapp',
    reverse: false,
  },
  {
    icon: TrendingUp,
    title: 'Preços Dinâmicos Automáticos',
    subtitle: 'Cérebro ZÉLLA',
    desc: 'Analisa demanda, sazonalidade e concorrência para ajustar preços em tempo real. Sem mais deixar dinheiro na mesa: feriado lotado? Preço sobe. Terça vazia? Promoção estratégica.',
    highlights: ['Thompson Sampling', 'Demand forecasting', '+35% receita média', 'Roteamento inteligente'],
    mockup: 'pricing',
    reverse: true,
  },
  {
    icon: Bot,
    title: 'Hunter de Leads Automático',
    subtitle: 'Prospecte enquanto dorme',
    desc: 'O ZEHLA encontra pousadas que precisam dos seus serviços e inicia conversas qualificadas automaticamente. IA que prospecta, qualifica e converte enquanto você foca no que importa.',
    highlights: ['Prospecção automática', 'Qualificação IA', 'Swipe Templates', 'Campanhas automatizadas'],
    mockup: 'hunter',
    reverse: false,
  },
  {
    icon: CreditCard,
    title: 'PIX & Pagamentos Integrados',
    subtitle: 'Mercado Pago Oficial',
    desc: 'Checkout pelo WhatsApp com PIX gerado automaticamente. Receba em segundos com confirmação instantânea. Gateway Mercado Pago com taxa de apenas 0,99% no PIX e split automático.',
    highlights: ['Taxa PIX 0,99%', 'Split automático', 'Confirmação instantânea', 'Checkout no chat'],
    mockup: 'payment',
    reverse: true,
  },
  {
    icon: Wifi,
    title: 'Link-in-Bio Profissional',
    subtitle: 'Estilo Linktree para sua pousada',
    desc: 'Galeria, reservas, avaliações e contato — tudo num link único. Coloque na bio do Instagram e transforme seguidores em hóspedes pagantes.',
    highlights: ['Galeria integrada', 'SEO otimizado', 'Reservas diretas', 'Análise de tráfego'],
    mockup: 'linkinbio',
    reverse: false,
  },
  {
    icon: Shield,
    title: 'Segurança & Conformidade',
    subtitle: 'Proteção enterprise',
    desc: 'Dados criptografados, LGPD compliant, Circuit Breaker para proteção contra falhas e Budget Guard que controla gastos com IA.',
    highlights: ['LGPD compliant', 'Circuit Breaker', 'Budget Guard', 'SLA 99.9%'],
    mockup: 'security',
    reverse: true,
  },
];

function FeatureMockup({ type }: { type: string }) {
  if (type === 'whatsapp') {
    return (
      <div className="bg-[#111] rounded-2xl border border-white/[0.06] p-4 space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-white/[0.04]">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <MessageSquare className="w-3 h-3 text-emerald-400" />
          </div>
          <span className="text-white text-xs font-medium">Pousada Serenity — 3 conversas ativas</span>
        </div>
        {[
          { from: 'bot', msg: 'Boa noite! Somos a Pousada Serenity. Temos suítes disponíveis para o final de semana. Posso verificar datas para você?' },
          { from: 'guest', msg: 'Olá! Quero para 2 pessoas, sexta e sábado' },
          { from: 'bot', msg: 'Perfeito! Temos o Chalé Vista Mar por R$520 (PIX) ou R$580 (cartão 3x). Inclui café da manhã. Deseja reservar?' },
          { from: 'guest', msg: 'Quero! Gera o PIX pra mim' },
          { from: 'bot', msg: 'PIX gerado: R$520,00. Você também pode pagar em 3x de R$193,33 no cartão. A reserva é confirmada automaticamente após o pagamento!' },
        ].map((chat, i) => (
          <div key={i} className={`flex gap-2 ${chat.from === 'guest' ? 'justify-end' : ''}`}>
            {chat.from === 'bot' && (
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                <Bot className="w-3 h-3 text-emerald-400" />
              </div>
            )}
            <div className={`rounded-xl px-3 py-2 text-[11px] max-w-[85%] ${
              chat.from === 'guest'
                ? 'bg-emerald-500/10 text-emerald-300 rounded-tr-sm'
                : 'bg-white/[0.05] text-neutral-300 rounded-tl-sm'
            }`}>
              {chat.msg}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'pricing') {
    return (
      <div className="bg-[#111] rounded-2xl border border-white/[0.06] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-white text-xs font-medium">Preços Dinâmicos — Cérebro ZÉLLA</span>
          <span className="text-emerald-400 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10">Ativo</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { room: 'Chalé Premium', orig: 'R$350', new: 'R$480', up: '+37%', active: true },
            { room: 'Suíte Standard', orig: 'R$200', new: 'R$200', up: '0%', active: false },
            { room: 'Suíte Deluxe', orig: 'R$280', new: 'R$340', up: '+21%', active: true },
          ].map((r) => (
            <div key={r.room} className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.05]">
              <div className="text-neutral-400 text-[10px] mb-1">{r.room}</div>
              <div className={`text-sm font-bold ${r.active ? 'text-emerald-400' : 'text-neutral-400'}`}>{r.new}</div>
              {r.active && (
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-neutral-600 text-[9px] line-through">{r.orig}</span>
                  <span className="text-emerald-400 text-[9px] font-medium">{r.up}</span>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="text-[10px] text-neutral-500 text-center">Demanda prevista: Alta — Feriado prolongado</div>
      </div>
    );
  }

  if (type === 'hunter') {
    return (
      <div className="bg-[#111] rounded-2xl border border-white/[0.06] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-white text-xs font-medium">Hunter de Leads — Executando</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        <div className="space-y-2">
          {[
            { name: 'Pousada Estrela do Mar', loc: 'Florianópolis, SC', status: 'Qualificado', statusColor: 'text-emerald-400' },
            { name: 'Chalés Serra Gaúcha', loc: 'Canela, RS', status: 'Contatando...', statusColor: 'text-amber-400' },
            { name: 'Eco Pousada Tiradentes', loc: 'Tiradentes, MG', status: 'Lead novo', statusColor: 'text-blue-400' },
          ].map((lead) => (
            <div key={lead.name} className="flex items-center justify-between p-2.5 bg-white/[0.02] rounded-lg border border-white/[0.04]">
              <div>
                <div className="text-white text-[11px] font-medium">{lead.name}</div>
                <div className="text-neutral-600 text-[9px]">{lead.loc}</div>
              </div>
              <span className={`text-[10px] font-medium ${lead.statusColor}`}>{lead.status}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'payment') {
    return (
      <div className="bg-[#111] rounded-2xl border border-white/[0.06] p-4 space-y-3">
        <div className="text-white text-xs font-medium mb-2">Checkout — Mercado Pago</div>
        <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.05] text-center">
          <div className="text-neutral-500 text-[10px]">Reserva #4821 — Chalé Premium</div>
          <div className="text-2xl font-bold text-white my-1">R$480,00</div>
          <div className="text-emerald-400 text-[10px] font-medium">PIX — Confirmação instantânea</div>
        </div>
        <div className="bg-emerald-500/5 rounded-lg p-2 border border-emerald-500/15 text-center">
          <div className="text-emerald-400 text-[10px] font-bold">Pagamento Confirmado</div>
          <div className="text-neutral-500 text-[9px]">em 1.2s via Mercado Pago</div>
        </div>
      </div>
    );
  }

  if (type === 'linkinbio') {
    return (
      <div className="bg-[#111] rounded-2xl border border-white/[0.06] p-4 space-y-3">
        <div className="text-white text-xs font-medium mb-2">Link-in-Bio — @pousadaserenity</div>
        <div className="space-y-2">
          {['Reservar Agora', 'Galeria de Fotos', 'Avaliações', 'Como Chegar', 'WhatsApp'].map((link, i) => (
            <div key={link} className={`p-2.5 rounded-lg text-[11px] text-white font-medium text-center cursor-default ${
              i === 0 ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-white/[0.04] border border-white/[0.06]'
            }`}>
              {link}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // security
  return (
    <div className="bg-[#111] rounded-2xl border border-white/[0.06] p-4 space-y-3">
      <div className="text-white text-xs font-medium mb-2">Segurança & Monitoramento</div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Circuit Breaker', val: 'CLOSED', color: 'text-emerald-400' },
          { label: 'Budget Guard', val: 'R$47/mês', color: 'text-blue-400' },
          { label: 'Uptime', val: '99.97%', color: 'text-emerald-400' },
          { label: 'LGPD', val: 'Compliant', color: 'text-purple-400' },
        ].map((s) => (
          <div key={s.label} className="bg-white/[0.03] rounded-lg p-2.5 border border-white/[0.05]">
            <div className="text-neutral-500 text-[9px]">{s.label}</div>
            <div className={`text-xs font-bold ${s.color}`}>{s.val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <section ref={ref} id="funcionalidades" className="py-20 sm:py-28 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Core features
          </h2>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
            O ZEHLA é cheio de funcionalidades inovadoras. Estas são as mais importantes para sua pousada decolar.
          </p>
        </motion.div>

        {/* Feature Rows — Alternating layout like mysmarthotel */}
        <div className="space-y-24">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${
                feature.reverse ? 'lg:[direction:rtl]' : ''
              }`}
            >
              {/* Text side */}
              <div className={feature.reverse ? 'lg:[direction:ltr]' : ''}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-xl">{feature.title}</h3>
                    <span className="text-emerald-400 text-xs font-medium">{feature.subtitle}</span>
                  </div>
                </div>
                <p className="text-neutral-400 text-sm leading-relaxed mb-5">{feature.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {feature.highlights.map((h) => (
                    <span key={h} className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-neutral-300 text-[11px]">
                      <Check className="w-3 h-3 text-emerald-400" />
                      {h}
                    </span>
                  ))}
                </div>
              </div>

              {/* Mockup side */}
              <div className={feature.reverse ? 'lg:[direction:ltr]' : ''}>
                <FeatureMockup type={feature.mockup} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
