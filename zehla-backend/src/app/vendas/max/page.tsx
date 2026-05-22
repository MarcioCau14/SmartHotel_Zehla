'use client';

import { Suspense } from 'react';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  Crown, 
  ShieldCheck, 
  Users, 
  Building2, 
  Brain,
  ArrowRight,
  Gem,
  Lock,
  Globe,
  Star
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ExclusiveWaitlistForm } from '@/components/sales/ExclusiveWaitlistForm';
import { PremiumUpsell } from '@/components/sales/PremiumUpsell';
import { LandingTracker } from '@/components/sales/LandingTracker';
import { MainFooter } from '@/components/landing/MainFooter';

export default function MaxSalesPage() {
  const [showWaitlist, setShowWaitlist] = useState(false);
  const waitlistRef = useRef<HTMLDivElement>(null);

  const handleExclusiveClick = () => {
    setShowWaitlist(true);
    setTimeout(() => {
      waitlistRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-100 font-sans selection:bg-[#00FF88]/30 selection:text-white relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-[#00FF88]/10 via-[#00FF88]/2 to-transparent rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#00FF88]/2 rounded-full blur-[140px] pointer-events-none -z-10" />

      <Suspense fallback={null}>
        <LandingTracker />
      </Suspense>
      
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center relative z-20">
        <Link href="/" className="flex items-center gap-3 group transition-transform hover:scale-[1.02] duration-300">
          <div className="w-10 h-10 rounded-xl bg-[#00FF88]/10 border border-[#00FF88]/20 flex items-center justify-center group-hover:bg-[#00FF88]/20 group-hover:border-[#00FF88]/40 transition-all duration-300 shadow-[0_0_15px_rgba(0,255,136,0.1)]">
            <Brain className="w-5 h-5 text-[#00FF88] group-hover:rotate-6 transition-transform duration-300" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg text-neutral-100 leading-none tracking-tight">ZEHLA</span>
            <span className="text-[10px] text-neutral-500 leading-none mt-0.5 tracking-wider font-semibold">SmartHotel</span>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-neutral-400 hover:text-white text-xs hover:bg-white/5 rounded-xl px-4 py-2 transition-all">
              Entrar no Dashboard
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-28 px-4 overflow-hidden text-center z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black tracking-[0.4em] text-[#00FF88] uppercase mb-10 shadow-[0_0_25px_rgba(0,255,136,0.12)] hover:scale-105 transition-all duration-300 select-none"
          >
            <Crown className="w-4 h-4 text-[#00FF88]" /> PERFORMANCE SEM LIMITES
          </motion.div>
          
          <h1 className="text-5xl md:text-8xl font-black mb-8 leading-[1.08] tracking-tighter text-white">
            Domine o mercado com <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF88] to-emerald-400 drop-shadow-[0_2px_20px_rgba(0,255,136,0.2)]">Custo Variável ZERO.</span>
          </h1>
          
          <p className="text-neutral-400 text-lg md:text-xl mb-16 max-w-3xl mx-auto leading-relaxed font-medium">
            O Plano MAX é a decisão estratégica de quem parou de dar dinheiro para as plataformas e decidiu <span className="text-white font-bold italic underline decoration-[#00FF88]/30">investir no próprio império.</span> Sem comissões, sem limites, suporte de elite.
          </p>

          <div className="grid md:grid-cols-12 gap-8 items-stretch text-left">
            {/* Features Detail */}
            <div className="md:col-span-7 glass-strong border border-white/5 rounded-[3rem] p-10 relative overflow-hidden flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:border-[#00FF88]/20 transition-all duration-500">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Building2 className="w-40 h-40 text-[#00FF88]" />
              </div>
              
              <div className="relative z-10">
                <h3 className="text-3xl font-bold mb-8 flex items-center gap-4 text-white">
                  <div className="w-12 h-12 rounded-2xl bg-[#00FF88]/10 border border-[#00FF88]/20 flex items-center justify-center shadow-[0_0_15px_rgba(0,255,136,0.15)]">
                    <Gem className="w-5 h-5 text-[#00FF88]" />
                  </div>
                  O que o Plano MAX oferece
                </h3>
                <div className="space-y-7">
                  {[
                    { t: 'Taxa Zero em Todas as Reservas', d: 'Mantenha 100% da sua receita direta. Sua única despesa é uma assinatura fixa, transformando seu custo variável em lucro líquido.' },
                    { t: 'Consolidação de Rede (Multi-Hotel)', d: 'Visão de Monarca sobre toda a sua rede. Controle financeiro e de ocupação centralizado em um único cockpit.' },
                    { t: 'Acesso Direto à Engenharia ZEHLA', d: 'Fila prioritária com nossos desenvolvedores seniores. Sua operação é nossa prioridade absoluta, 24/7.' },
                    { t: 'Inteligência de Mercado Exclusiva', d: 'Análise de dados de concorrência e comportamento de consumo para garantir que você esteja sempre à frente.' }
                  ].map((item) => (
                    <div key={item.t} className="group/item">
                      <h4 className="text-[#00FF88] font-bold text-base mb-1.5 flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-[#00FF88]/10 border border-[#00FF88]/20 flex items-center justify-center">
                          <Check className="w-3 h-3 text-[#00FF88]" />
                        </div>
                        {item.t}
                      </h4>
                      <p className="text-neutral-400 text-sm leading-relaxed pl-7.5">{item.d}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pricing Card */}
            <div className="md:col-span-5 bg-[#0b0b0d]/90 border border-[#00FF88]/20 rounded-[3rem] p-10 flex flex-col justify-center relative group shadow-[0_30px_70px_rgba(0,0,0,0.6)] hover:shadow-[0_35px_80px_rgba(0,255,136,0.1)] hover:border-[#00FF88]/40 transition-all duration-500 text-center overflow-hidden">
              {/* Card light */}
              <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-gradient-to-b from-[#00FF88]/5 to-transparent rounded-full blur-[60px]" />
              
              <div className="relative z-10">
                 <span className="text-neutral-500 text-xs font-black uppercase tracking-[0.3em] mb-4 block">Assinatura Profissional</span>
                 <div className="flex items-baseline justify-center gap-2 mb-6">
                    <span className="text-2xl text-neutral-500 font-bold">R$</span>
                    <span className="text-7xl font-black text-white tracking-tight">798</span>
                    <span className="text-2xl text-neutral-500 font-bold">/mês</span>
                 </div>
                 
                 {/* Active Fixed-Price Badge */}
                 <div className="py-3 px-6 rounded-2xl bg-gradient-to-r from-[#00FF88]/12 to-emerald-500/5 border border-[#00FF88]/30 text-[#00FF88] font-black text-sm mb-12 inline-flex items-center gap-2 uppercase tracking-[0.15em] shadow-[0_5px_15px_rgba(0,255,136,0.05)]">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF88] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00FF88]"></span>
                    </span>
                    Tudo Incluso — Sem Taxas
                 </div>

                 <Link href="/teste-gratis?plan=max" className="block w-full">
                    <Button className="w-full h-20 rounded-[1.8rem] bg-[#00FF88] hover:bg-[#05ff84] text-black text-xl font-black shadow-[0_15px_40px_rgba(0,255,136,0.25)] hover:shadow-[0_20px_50px_rgba(0,255,136,0.4)] transition-all duration-300 active:scale-95 group flex items-center justify-center border border-white/10">
                      Ativar Plano MAX
                      <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1.5 transition-transform duration-300" />
                    </Button>
                 </Link>
                 
                 <p className="mt-6 text-[10px] text-neutral-600 font-bold uppercase tracking-widest leading-relaxed">
                   Setup Profissional • Treinamento de Equipe • Suporte VIP
                 </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Grid */}
      <section className="py-32 px-4 relative z-10 border-t border-b border-white/5 bg-gradient-to-b from-[#050505] to-[#08080a]">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
           {[
             { i: Lock, t: 'Segurança de Dados', d: 'Proteção total das informações dos seus hóspedes e da sua pousada.' },
             { i: Globe, t: 'Alta Disponibilidade', d: 'Sistema operando 24h por dia, 7 dias por semana, sem interrupções.' },
             { i: Users, t: 'Equipe Conectada', d: 'Múltiplos acessos para sua recepção, gerência e financeiro.' },
             { i: Star, t: 'IA de Elite', d: 'Atendimento personalizado que mimetiza o tom de voz da sua marca.' }
           ].map((card, i) => (
             <div key={i} className="p-8 rounded-[2rem] glass-strong border border-white/5 hover:border-[#00FF88]/20 transition-all duration-300 group shadow-[0_10px_25px_rgba(0,0,0,0.3)]">
                <card.i className="w-8 h-8 text-neutral-500 group-hover:text-[#00FF88] transition-colors mb-6" />
                <h4 className="font-extrabold text-lg mb-2 text-white">{card.t}</h4>
                <p className="text-neutral-400 text-sm leading-relaxed">{card.d}</p>
             </div>
           ))}
        </div>
      </section>

      {/* Exclusive Section */}
      <section className="scroll-mt-24 relative z-10">
        <PremiumUpsell 
          currentPlan="MAX"
          targetPlan="EXCLUSIVE"
          title="Precisa de uma solução sob medida?"
          description="O pacote EXCLUSIVE é destinado a grandes grupos hoteleiros que necessitam de integrações personalizadas e consultoria estratégica presencial."
          benefits={[
            'Integrações customizadas',
            'Treinamento presencial de IA',
            'Hardware proprietário ZEHLA',
            'Consultoria Mensal de Resultados'
          ]}
          onTargetClick={handleExclusiveClick}
        />
        
        <AnimatePresence>
          {showWaitlist && (
            <motion.div 
              ref={waitlistRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="max-w-4xl mx-auto px-4 pb-32 overflow-hidden"
            >
              <div className="glass-strong border border-white/10 rounded-[2.5rem] p-8 md:p-16 relative shadow-[0_30px_70px_rgba(0,0,0,0.6)]">
                <div className="absolute top-0 right-0 p-8">
                  <Star className="w-8 h-8 text-[#00FF88] animate-pulse" />
                </div>
                <div className="text-center mb-12">
                   <h3 className="text-3xl font-black mb-4 text-white">Entre na Lista VIP Exclusive</h3>
                   <p className="text-neutral-400 max-w-lg mx-auto leading-relaxed text-sm">
                     Avaliamos individualmente cada solicitação para garantir o mais alto padrão de entrega. Preencha os dados abaixo e nossa equipe entrará em contato.
                   </p>
                </div>
                <ExclusiveWaitlistForm />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Footer */}
      <MainFooter />
    </div>
  );
}
