'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  MessageSquare, 
  Target, 
  Brain, 
  TrendingUp, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  Cpu
} from 'lucide-react';

export default function WhatsAppAgentHub() {
  const [isAutonomous, setIsAutonomous] = useState(true);

  return (
    <div className="flex h-[calc(100vh-12rem)] gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Left Column: Conversation Monitoring */}
      <div className="flex-1 flex flex-col glass-card border-white/5 overflow-hidden">
        <header className="p-6 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-orange-400" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0a0a0a] animate-pulse"></div>
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                Monitoramento em Tempo Real
                <span className="px-1.5 py-0.5 rounded bg-orange-500/10 border border-orange-500/20 text-[9px] text-orange-400 uppercase tracking-widest font-mono">PRO Active</span>
              </h2>
              <p className="text-[10px] text-neutral-500">Agente IA operando como "Donos da Pousada"</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
              <span className="text-[10px] font-mono text-neutral-500 uppercase">Modo Autônomo</span>
              <button 
                onClick={() => setIsAutonomous(!isAutonomous)}
                className={`w-8 h-4 rounded-full transition-all relative ${isAutonomous ? 'bg-orange-500' : 'bg-neutral-700'}`}
              >
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${isAutonomous ? 'left-4.5' : 'left-0.5'}`} />
              </button>
            </div>
          </div>
        </header>

        {/* Conversation Feed Simulation */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-[radial-gradient(circle_at_top_right,_#111,_transparent_40%)] zehla-scroll">
          <div className="flex justify-center">
            <span className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-mono text-neutral-600 uppercase tracking-widest">Hoje • 03 de Maio</span>
          </div>

          {/* Guest Message */}
          <div className="flex flex-col items-start gap-2 max-w-[80%]">
            <div className="p-4 rounded-2xl rounded-tl-none bg-white/5 border border-white/10 text-sm text-neutral-300 leading-relaxed">
              Bom dia! Vimos as fotos e ficamos encantados. Teria disponibilidade para um casal entre os dias 15 e 18 de Junho?
            </div>
            <span className="text-[9px] font-mono text-neutral-600 px-2">Ricardo Mendes • 09:42</span>
          </div>

          {/* AI Response */}
          <div className="flex flex-col items-end gap-2 ml-auto max-w-[80%]">
            <div className="p-4 rounded-2xl rounded-tr-none bg-orange-500/10 border border-orange-500/20 text-sm text-neutral-100 leading-relaxed">
              Olá Ricardo! Que bom que gostaram. 😊 Para essas datas, temos a Suíte Master com Vista Mar disponível. O valor total fica em R$ 2.550,00 com café incluso. Quer que eu reserve ou prefere ver fotos?
            </div>
            <div className="flex items-center gap-1.5 px-2">
              <span className="text-[9px] font-mono text-orange-500/80 uppercase">Zehla Manager AI</span>
              <ShieldCheck className="w-3 h-3 text-orange-500" />
            </div>
          </div>

          {/* Typying indicator */}
          <div className="flex gap-1 items-center px-4 py-2 bg-white/5 rounded-full w-fit">
            <div className="w-1 h-1 bg-neutral-600 rounded-full animate-bounce"></div>
            <div className="w-1 h-1 bg-neutral-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
            <div className="w-1 h-1 bg-neutral-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
          </div>
        </div>

        {/* Handover Area */}
        <footer className="p-6 border-t border-white/5 bg-black/40">
          <div className="p-4 rounded-xl border border-dashed border-neutral-800 bg-white/[0.01] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-4 h-4 text-neutral-600" />
              <span className="text-xs text-neutral-500">IA está conduzindo este lead para conversão.</span>
            </div>
            <button className="text-[10px] font-bold text-neutral-400 hover:text-white transition-colors uppercase tracking-widest">
              Assumir Controle Manual
            </button>
          </div>
        </footer>
      </div>

      {/* Right Column: Brain & Analytics */}
      <div className="w-80 flex flex-col gap-6">
        
        {/* Persona Brain Widget */}
        <div className="glass-card p-6 border-white/5 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Persona Brain</h3>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          </div>

          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-blue-400 font-bold uppercase tracking-tighter">Tom de Voz Aprendido</span>
                <Cpu className="w-3 h-3 text-blue-500" />
              </div>
              <p className="text-[11px] text-blue-100/70 italic leading-relaxed">
                "Acolhedor, focado em exclusividade e hospitalidade premium da Praia do Rosa."
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-[10px] uppercase">
                <span className="text-neutral-500">Mimetismo de Linguagem</span>
                <span className="text-neutral-200">92%</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[92%] shadow-[0_0_10px_rgba(59,130,246,0.3)]" />
              </div>
            </div>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="glass-card p-6 border-white/5 space-y-6 flex-1">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Funil de Vendas</h3>
            <TrendingUp className="w-4 h-4 text-neutral-600" />
          </div>

          <div className="space-y-3">
            {[
              { label: 'Conversas', value: '142', color: 'bg-orange-500/20' },
              { label: 'Interesse Real', value: '38', color: 'bg-orange-500/40' },
              { label: 'Fechamentos', value: '12', color: 'bg-orange-500/80' },
            ].map((step, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-[10px] uppercase">
                  <span className="text-neutral-500">{step.label}</span>
                  <span className="text-neutral-200">{step.value}</span>
                </div>
                <div className={`h-2 rounded-full ${step.color}`} style={{ width: `${100 - (i * 25)}%` }} />
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-[9px] text-neutral-600 block uppercase mb-1">Conv. Rate</span>
              <span className="text-lg font-bold text-green-500 font-mono">8.4%</span>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-[9px] text-neutral-600 block uppercase mb-1">LATÊNCIA</span>
              <span className="text-lg font-bold text-neutral-300 font-mono">1.2s</span>
            </div>
          </div>
        </div>

        {/* Handover Action */}
        <button className="w-full py-4 bg-red-500/10 border border-red-500/20 rounded-2xl group hover:bg-red-500/20 transition-all shadow-[0_0_20px_-10px_rgba(239,68,68,0.2)]">
          <span className="text-[10px] font-bold text-red-400 group-hover:text-red-300 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Human Handover
          </span>
        </button>

      </div>
    </div>
  );
}
