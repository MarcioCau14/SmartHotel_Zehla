'use client';

import { useRef, useState, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Calculator,
  ArrowRight,
  TrendingUp,
  Moon,
  Users,
  Wallet,
  BadgeDollarSign,
  Sparkles,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { useNiche } from '@/contexts/NicheContext';

// ============================================================================
// Constantes de negócio (baseadas em dados do setor hoteleiro brasileiro)
// ============================================================================
const CONVERSAO_SEM_ZELLA = 0.20;   // 20% — resposta lenta, horário comercial só
const CONVERSAO_COM_ZELLA = 0.35;   // 35% — resposta instantânea 24/7 + PIX na hora
const ESTADIA_MEDIA_HOSPEDAGEM = 2.5; // noites por reserva (média pousadas/anfitriões BR)
const ECONOMIA_RECEPCIONISTA = 1200;  // R$/mês economizados cobrindo madrugada/fim de semana
const CUSTO_ZELLA_PRO = 397;          // R$/mês plano PRO (referência para cálculo)
const CUSTO_ZELLA_PARCEIRO = 247;     // R$/mês plano Parceiro Zélla

export function SavingsCalculator() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const { isPousada, isAirbnb } = useNiche();

  const [contatosMes, setContatosMes] = useState(80);
  const [valorMedio, setValorMedio] = useState(350);

  // --------------------------------------------------------------------------
  // Matemática verificada
  // --------------------------------------------------------------------------
  const custoZellaMensal = CUSTO_ZELLA_PRO;
  const estadiaMedia = ESTADIA_MEDIA_HOSPEDAGEM;

  const calc = useMemo(() => {
    // Conversões
    const conversoesSem = Math.round(contatosMes * CONVERSAO_SEM_ZELLA);
    const conversoesCom = Math.round(contatosMes * CONVERSAO_COM_ZELLA);
    const conversoesAMais = conversoesCom - conversoesSem;

    // Receita mensal
    const receitaSem = conversoesSem * valorMedio * estadiaMedia;
    const receitaCom = conversoesCom * valorMedio * estadiaMedia;
    const receitaExtraMensal = receitaCom - receitaSem;
    const receitaExtraAnual = receitaExtraMensal * 12;

    // Custo-benefício
    const economiaRecepcionistaAnual = ECONOMIA_RECEPCIONISTA * 12;
    const custoZellaAnual = custoZellaMensal * 12;
    const lucroLiquidoAnual = receitaExtraAnual + economiaRecepcionistaAnual - custoZellaAnual;
    const roiPercent = custoZellaAnual > 0
      ? Math.round(((receitaExtraAnual + economiaRecepcionistaAnual - custoZellaAnual) / custoZellaAnual) * 100)
      : 0;

    return {
      conversoesSem,
      conversoesCom,
      conversoesAMais,
      receitaSem,
      receitaCom,
      receitaExtraMensal,
      receitaExtraAnual,
      economiaRecepcionistaAnual,
      custoZellaAnual,
      lucroLiquidoAnual,
      roiPercent,
    };
  }, [contatosMes, valorMedio, estadiaMedia, custoZellaMensal]);

  // --------------------------------------------------------------------------
  // Helpers de formatação
  // --------------------------------------------------------------------------
  const fmt = (v: number) =>
    v >= 1000
      ? `R$ ${Math.round(v).toLocaleString('pt-BR')}`
      : `R$ ${Math.round(v).toLocaleString('pt-BR')}`;

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <section ref={ref} id="calculadora" className="py-28 sm:py-36 lg:py-44 bg-[#060608]">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
            <Calculator className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400 text-xs font-medium">Simulador de Resultados</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
            {isPousada ? 'Quanto sua pousada' : 'Quanto seus imóveis'}{' '}
            <span className="text-emerald-400 font-bold">ganha com o Zélla?</span>
          </h2>
          <p className="text-neutral-400 text-lg sm:text-xl max-w-2xl mx-auto">
            Insira os dados reais da sua operação e veja o impacto no seu faturamento
          </p>
        </motion.div>

        {/* Calculator Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative rounded-3xl bg-[#111] border border-white/[0.06] p-10 sm:p-14 overflow-hidden"
        >
          {/* Background glows */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/[0.07] rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-blue-500/[0.05] rounded-full blur-[80px]" />

          <div className="relative z-10">
            {/* ===== INPUTS ===== */}
            <div className="max-w-2xl mx-auto mb-14">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                {/* Input 1: Contatos/mês */}
                <div className="space-y-3">
                  <label className="block text-neutral-300 text-sm font-medium">
                    Contatos de WhatsApp por mês
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setContatosMes(Math.max(10, contatosMes - 10))}
                      className="w-11 h-11 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white font-bold text-xl hover:bg-white/[0.1] transition-all cursor-pointer active:scale-95"
                    >
                      -
                    </button>
                    <div className="flex-1 h-12 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center">
                      <span className="text-3xl font-extrabold text-white">{contatosMes}</span>
                    </div>
                    <button
                      onClick={() => setContatosMes(Math.min(400, contatosMes + 10))}
                      className="w-11 h-11 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white font-bold text-xl hover:bg-white/[0.1] transition-all cursor-pointer active:scale-95"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-neutral-500 text-[11px]">
                    Inclui perguntas de disponibilidade, preço e reserva
                  </p>
                </div>

                {/* Input 2: Valor médio */}
                <div className="space-y-3">
                  <label className="block text-neutral-300 text-sm font-medium">
                    {isPousada ? 'Diária média da pousada' : 'Valor médio por noite do imóvel'}
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setValorMedio(Math.max(80, valorMedio - 50))}
                      className="w-11 h-11 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white font-bold text-xl hover:bg-white/[0.1] transition-all cursor-pointer active:scale-95"
                    >
                      -
                    </button>
                    <div className="flex-1 h-12 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center">
                      <span className="text-2xl sm:text-3xl font-extrabold text-white">
                        R$ {valorMedio.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <button
                      onClick={() => setValorMedio(Math.min(3000, valorMedio + 50))}
                      className="w-11 h-11 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white font-bold text-xl hover:bg-white/[0.1] transition-all cursor-pointer active:scale-95"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-neutral-500 text-[11px]">
                    {isPousada ? 'Valor médio cobrado por noite de hospedagem' : 'Valor médio cobrado por noite no imóvel'}
                  </p>
                </div>
              </div>
            </div>

            {/* ===== RESULTADOS PRINCIPAIS ===== */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
              {/* Reservas a mais */}
              <div className="text-center p-6 rounded-2xl bg-emerald-500/[0.06] border border-emerald-500/15">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                  <Users className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                  +{calc.conversoesAMais}
                </div>
                <div className="text-neutral-500 text-xs mt-1">reservas/mês</div>
              </div>

              {/* Receita extra mensal */}
              <div className="text-center p-6 rounded-2xl bg-blue-500/[0.06] border border-blue-500/15">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-blue-400">
                  {fmt(calc.receitaExtraMensal)}
                </div>
                <div className="text-neutral-500 text-xs mt-1">receita extra/mês</div>
              </div>

              {/* Receita extra anual */}
              <div className="text-center p-6 rounded-2xl bg-purple-500/[0.06] border border-purple-500/15">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center mx-auto mb-3">
                  <BadgeDollarSign className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-purple-400">
                  {fmt(calc.receitaExtraAnual)}
                </div>
                <div className="text-neutral-500 text-xs mt-1">receita extra/ano</div>
              </div>

              {/* ROI */}
              <div className="text-center p-6 rounded-2xl bg-amber-500/[0.06] border border-amber-500/15">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">
                  {calc.roiPercent > 0 ? '+' : ''}{calc.roiPercent}%
                </div>
                <div className="text-neutral-500 text-xs mt-1">ROI anual</div>
              </div>
            </div>

            {/* ===== COMPARAÇÃO VISUAL ===== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
              {/* Sem Zélla */}
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-neutral-500" />
                  <span className="text-neutral-400 text-sm font-semibold">Sem o Zélla</span>
                  <span className="ml-auto text-[10px] text-neutral-600 bg-white/[0.04] px-2 py-0.5 rounded-full">
                    20% conversão
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Reservas/mês</span>
                    <span className="text-neutral-300 font-semibold">{calc.conversoesSem}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Receita/mês</span>
                    <span className="text-neutral-300 font-semibold">{fmt(calc.receitaSem)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Resposta após horas</span>
                    <span className="text-red-400/80 font-medium">Perde hóspedes</span>
                  </div>
                </div>
                <div className="mt-3 h-2.5 rounded-full bg-white/[0.04] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-neutral-600 to-neutral-500 transition-all duration-500"
                    style={{ width: `${CONVERSAO_SEM_ZELLA * 100 / CONVERSAO_COM_ZELLA}%` }}
                  />
                </div>
              </div>

              {/* Com Zélla */}
              <div className="p-6 rounded-2xl bg-emerald-500/[0.04] border border-emerald-500/15">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 text-sm font-semibold">Com o Zélla</span>
                  <span className="ml-auto text-[10px] text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                    35% conversão
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Reservas/mês</span>
                    <span className="text-emerald-300 font-bold">{calc.conversoesCom} <span className="text-emerald-500">(+{calc.conversoesAMais})</span></span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Receita/mês</span>
                    <span className="text-emerald-300 font-bold">{fmt(calc.receitaCom)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Resposta instantânea 24/7</span>
                    <span className="text-emerald-400 font-medium">Sua chave PIX na hora</span>
                  </div>
                </div>
                <div className="mt-3 h-2.5 rounded-full bg-white/[0.04] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            </div>

            {/* ===== DETALHAMENTO FINANCEIRO ===== */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
              {/* Economia recepcionista / automação */}
              <div className="flex items-center gap-4 p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                  <Moon className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{fmt(ECONOMIA_RECEPCIONISTA)}/mês</div>
                  <div className="text-[11px] text-neutral-500">Economia recepcionista noturno</div>
                </div>
              </div>

              {/* Custo Zélla */}
              <div className="flex items-center gap-4 p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
                  <Wallet className="w-5 h-5 text-neutral-400" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{fmt(custoZellaMensal)}/mês</div>
                  <div className="text-[11px] text-neutral-500">Investimento no plano PRO</div>
                </div>
              </div>

              {/* Lucro líquido anual */}
              <div className="flex items-center gap-4 p-5 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/15">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-sm font-bold text-emerald-400">{fmt(calc.lucroLiquidoAnual)}/ano</div>
                  <div className="text-[11px] text-neutral-500">Lucro líquido (receita + economia - custo)</div>
                </div>
              </div>
            </div>

            {/* ===== HIPOTESES ===== */}
            <div className="bg-white/[0.02] rounded-2xl p-5 border border-white/[0.05] mb-12">
              <h4 className="text-neutral-300 text-xs font-bold uppercase tracking-wider mb-3">
                Como calculamos esses números?
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-[11px] text-neutral-500 leading-relaxed">
                <div className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>Sem Zélla: <strong className="text-neutral-400">20% de conversão</strong> — resposta demorada perde hóspedes para concorrentes</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>Com Zélla: <strong className="text-emerald-400">35% de conversão</strong> — resposta instantânea + sua chave PIX na hora convertem mais</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span>Estadia média: <strong className="text-neutral-400">2,5 noites</strong> por reserva (média do setor)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span>Economia recepcionista: <strong className="text-neutral-400">R$ 1.200/mês</strong> cobrindo madrugadas e fins de semana</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                  <span>Receita extra = reservas adicionais × {isPousada ? 'diária' : 'valor médio'} × 2,5 noites</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                  <span>ROI = ((receita extra + economia recepcionista - custo Zélla) / custo Zélla) x 100</span>
                </div>
              </div>
            </div>

            {/* ===== CTA ===== */}
            <div className="text-center">
              <p className="text-neutral-500 text-sm mb-6">
                Estimativa baseada nos dados informados. Teste grátis por 7 dias e comprove na prática.
              </p>
              <button
                onClick={() => {
                  const el = document.querySelector('#precos');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-xl hover:from-emerald-400 hover:to-emerald-500 transition-all duration-200 shadow-xl shadow-emerald-500/30 cursor-pointer"
              >
                Começar meu teste grátis
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}