'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { Activity, Hand, DollarSign, MessageSquare, ShieldAlert, CheckCircle2 } from 'lucide-react';

export function DashboardPreviewSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative py-24 sm:py-32 bg-[#08080a] overflow-hidden border-t border-white/[0.02]">
      {/* Glow de fundo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-500/[0.03] blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* LADO ESQUERDO: TEXTOS E COPYS DE VENDAS */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="flex flex-col space-y-6"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 self-start text-xs font-semibold text-emerald-400">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              Centro de Comando Operacional
            </div>

            {/* Título Principal */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Veja cada reserva acontecer, <br className="hidden sm:inline" />
              <span className="gradient-text-royal font-bold">
                em tempo real.
              </span>
            </h2>

            <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
              O Diário de Conversas dá controle absoluto sobre o atendimento. 
              Monitore as conversas em tempo real, veja o que o hóspede precisa e assuma 
              o chat com apenas um clique para manter o toque humano personalizado.
            </p>

            {/* Blocos de Solução de Dores */}
            <div className="space-y-4 pt-4">
              {/* Dor 1: IA sem controle */}
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm sm:text-base">Acompanhamento ao Vivo</h4>
                  <p className="text-zinc-500 text-xs sm:text-sm mt-0.5">
                    Acompanhe as respostas automáticas em tempo real. Veja com clareza a segurança do assistente e garanta um atendimento livre de falhas.
                  </p>
                </div>
              </div>

              {/* Dor 2: Intervenção rápida */}
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Hand className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm sm:text-base">Assuma quando Quiser (1-Click Handover)</h4>
                  <p className="text-zinc-500 text-xs sm:text-sm mt-0.5">
                    Se o hóspede solicitar algo muito específico, pause a IA e assuma a conversa na hora. A transição de IA para humano é imperceptível.
                  </p>
                </div>
              </div>

              {/* Dor 3: Onde está o dinheiro? */}
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm sm:text-base">Métricas de Faturamento e Economia</h4>
                  <p className="text-zinc-500 text-xs sm:text-sm mt-0.5">
                    Acompanhe a receita de reservas diretas convertidas e visualize a economia de taxas de comissão (Booking, Airbnb) salvas pela IA.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA da Seção */}
            <div className="pt-6">
              <Link
                href="#precos"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20 text-sm sm:text-base cursor-pointer hover:translate-x-1"
              >
                Quero ter esse controle
                <span className="text-base">→</span>
              </Link>
            </div>
          </motion.div>

          {/* LADO DIREITO: INTERFACE MOCKUP DO DIÁRIO DE CONVERSAS */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full relative"
          >
            {/* Elemento decorativo de brilho lateral */}
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-purple-500/20 opacity-30 blur-lg pointer-events-none" />

            <div className="relative bg-[#111] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[480px] w-full text-xs font-sans select-none">
              
              {/* Header do Mockup */}
              <div className="bg-[#16161a] border-b border-white/[0.05] px-4 py-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-[10px] text-zinc-400 font-bold tracking-wider ml-2">PAINEL DE CONTROLE DE RESERVAS — SEU ZÉLLA</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400 font-medium text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Conectado
                </div>
              </div>

              {/* Corpo da Interface (Sidebar + Chat Area) */}
              <div className="flex flex-1 overflow-hidden">
                
                {/* 1. Sidebar de Conversas (30% largura) */}
                <div className="w-[30%] bg-[#121215] border-r border-white/[0.04] flex flex-col overflow-y-auto hidden sm:flex">
                  <div className="p-2.5 border-b border-white/[0.03] text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                    Conversas Recentes
                  </div>
                  
                  {/* Item 1: Bernardo (Ativo) */}
                  <div className="p-2.5 bg-white/[0.02] border-b border-white/[0.03] flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-zinc-200">Bernardo Silva</span>
                      <span className="text-[7px] px-1 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-sm">IA ATIVA</span>
                    </div>
                    <p className="text-[9px] text-zinc-500 truncate">Gerar diária de casal...</p>
                  </div>

                  {/* Item 2: Juliana (Humano/Escalado) */}
                  <div className="p-2.5 border-b border-white/[0.03] flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-zinc-400">Juliana Lima</span>
                      <span className="text-[7px] px-1 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-sm font-semibold flex items-center gap-0.5">
                        <ShieldAlert className="w-2 h-2" /> ESCALADO
                      </span>
                    </div>
                    <p className="text-[9px] text-zinc-600 truncate">Dúvida sobre berço extra...</p>
                  </div>

                  {/* Item 3: Felipe (Reservado/Concluído) */}
                  <div className="p-2.5 border-b border-white/[0.03] flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-zinc-400">Felipe Santos</span>
                      <span className="text-[7px] px-1 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-sm">RESERVA</span>
                    </div>
                    <p className="text-[9px] text-zinc-600 truncate">Confirmado PIX de reserva!</p>
                  </div>
                </div>

                {/* 2. Janela de Chat Central (70% largura) */}
                <div className="flex-1 bg-[#16161a] flex flex-col justify-between">
                  {/* Histórico do Chat */}
                  <div className="p-4 space-y-3.5 overflow-y-auto flex-1">
                    
                    {/* Mensagem Hóspede */}
                    <div className="flex flex-col space-y-1 max-w-[85%]">
                      <span className="text-[8px] text-zinc-500 ml-1 font-semibold">Bernardo Silva</span>
                      <div className="bg-zinc-800 text-zinc-200 p-2.5 rounded-2xl rounded-tl-sm text-[11px] leading-relaxed">
                        Olá! Gostaria de saber o valor da diária para casal no feriado de 7 de setembro.
                      </div>
                    </div>

                    {/* Resposta Inteligente da IA */}
                    <div className="flex flex-col space-y-1 items-end max-w-[85%] ml-auto">
                      <span className="text-[8px] text-emerald-400 mr-1 font-semibold flex items-center gap-1">
                        ZÉLLA (IA) 
                        <span className="px-1 py-[0.5px] bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[6px] font-bold rounded-sm">98% Confiança</span>
                      </span>
                      <div className="bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 p-2.5 rounded-2xl rounded-tr-sm text-[11px] leading-relaxed">
                        Olá, Bernardo! A diária do Quarto Casal Premium para o feriado de 7 de Setembro é R$ 447. Temos disponibilidade! Deseja que eu gere o link de reserva PIX?
                      </div>
                      <span className="text-[7px] text-emerald-500/70 font-semibold tracking-wide mt-0.5">
                        ⚡ Ações do ZÉLLA: Verificando disponibilidade no calendário da pousada... OK
                      </span>
                    </div>

                    {/* Mensagem Hóspede 2 */}
                    <div className="flex flex-col space-y-1 max-w-[85%]">
                      <span className="text-[8px] text-zinc-500 ml-1 font-semibold">Bernardo Silva</span>
                      <div className="bg-zinc-800 text-zinc-200 p-2.5 rounded-2xl rounded-tl-sm text-[11px] leading-relaxed">
                        Sim, por favor! Pode gerar.
                      </div>
                    </div>

                  </div>

                  {/* Barra de Ação de Intervenção Humana (Foco Pousadeiro) */}
                  <div className="p-3 bg-[#111114] border-t border-white/[0.04] flex items-center justify-between shrink-0">
                    <span className="text-[9px] text-zinc-500 font-medium">Hóspede está aguardando o link...</span>
                    
                    {/* Botão de Handover Humano */}
                    <button
                      type="button"
                      className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/35 hover:bg-emerald-500/20 text-emerald-400 font-bold rounded-lg flex items-center gap-1.5 transition-all duration-200 cursor-pointer shadow-md shadow-emerald-500/5 active:scale-95"
                    >
                      <Hand className="w-3.5 h-3.5" />
                      Assumir Conversa (Pausar IA)
                    </button>
                  </div>

                </div>

              </div>

              {/* Rodapé de Métricas Financeiras */}
              <div className="bg-[#1b1b22] border-t border-white/[0.05] px-4 py-2 flex items-center justify-between text-[10px] shrink-0 text-zinc-400 font-medium">
                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  Total Convertido pela IA: <span className="text-white font-bold">R$ 8.940,00</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Taxa Booking Economizada: <span className="text-emerald-400 font-bold">R$ 1.341,00</span>
                </div>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
