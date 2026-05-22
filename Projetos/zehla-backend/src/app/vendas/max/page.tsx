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
    <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500/30">
      <Suspense fallback={null}>
        <LandingTracker />
      </Suspense>
      
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
            <Brain className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-neutral-100 leading-none">ZEHLA</span>
            <span className="text-[10px] text-neutral-500 leading-none">SmartHotel</span>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-neutral-400 hover:text-white text-xs">Entrar no Dashboard</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-32 px-4 overflow-hidden text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[600px] bg-emerald-500/5 blur-[180px] -z-10" />
        
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black tracking-[0.4em] text-emerald-400 uppercase mb-10 shadow-[0_0_20px_rgba(52,211,153,0.1)]"
          >
            <Crown className="w-4 h-4" /> PERFORMANCE SEM LIMITES
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight tracking-tighter">
            Domine o mercado com <br/><span className="text-emerald-400">Custo Variável ZERO.</span>
          </h1>
          
          <p className="text-neutral-400 text-lg md:text-xl mb-16 max-w-3xl mx-auto leading-relaxed">
            O Plano MAX é a decisão estratégica de quem parou de dar dinheiro para as plataformas e decidiu <span className="text-white font-bold italic underline decoration-emerald-500/30">investir no próprio império.</span> Sem comissões, sem limites, suporte de elite.
          </p>

          <div className="grid md:grid-cols-12 gap-8 items-stretch">
            {/* Features Detail */}
            <div className="md:col-span-7 glass-strong border border-white/5 rounded-[3rem] p-10 text-left relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Building2 className="w-40 h-40" />
              </div>
              
              <div className="relative">
                <h3 className="text-3xl font-bold mb-8 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-400/10 flex items-center justify-center">
                    <Gem className="w-5 h-5 text-emerald-400" />
                  </div>
                  O que o Plano MAX oferece
                </h3>
                <div className="space-y-6">
                  {[
                    { t: 'Taxa Zero em Todas as Reservas', d: 'Mantenha 100% da sua receita direta. Sua única despesa é uma assinatura fixa, transformando seu custo variável em lucro líquido.' },
                    { t: 'Consolidação de Rede (Multi-Hotel)', d: 'Visão de Monarca sobre toda a sua rede. Controle financeiro e de ocupação centralizado em um único cockpit.' },
                    { t: 'Acesso Direto à Engenharia ZEHLA', d: 'Fila prioritária com nossos desenvolvedores seniores. Sua operação é nossa prioridade absoluta, 24/7.' },
                    { t: 'Inteligência de Mercado Exclusiva', d: 'Análise de dados de concorrência e comportamento de consumo para garantir que você esteja sempre à frente.' }
                  ].map((item) => (
                    <div key={item.t} className="group">
                      <h4 className="text-emerald-400 font-bold mb-1 flex items-center gap-2">
                        <Check className="w-4 h-4" /> {item.t}
                      </h4>
                      <p className="text-neutral-500 text-sm leading-relaxed pl-6">{item.d}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pricing Card */}
            <div className="md:col-span-5 bg-neutral-900/50 border border-emerald-500/20 rounded-[3rem] p-10 flex flex-col justify-center relative group">
              <div className="relative text-center">
                 <span className="text-neutral-500 text-xs font-black uppercase tracking-[0.3em] mb-4 block">Assinatura Profissional</span>
                 <div className="flex items-baseline justify-center gap-2 mb-6">
                    <span className="text-2xl text-neutral-500 font-bold">R$</span>
                    <span className="text-7xl font-black text-white">798</span>
                    <span className="text-2xl text-neutral-500 font-bold">/mês</span>
                 </div>
                  <div className="py-3 px-6 rounded-2xl bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 font-black text-xl mb-12 inline-block">
                     TUDO INCLUSO
                  </div>

                 <Link href="/teste-gratis?plan=max" className="block w-full">
                    <Button className="w-full h-20 rounded-[2rem] bg-emerald-400 hover:bg-emerald-500 text-black text-xl font-black shadow-2xl shadow-emerald-400/30 transition-all active:scale-95 group">
                      Ativar Plano MAX
                      <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
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
      <section className="py-32 px-4 relative">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
           {[
             { i: Lock, t: 'Segurança de Dados', d: 'Proteção total das informações dos seus hóspedes e da sua pousada.' },
             { i: Globe, t: 'Alta Disponibilidade', d: 'Sistema operando 24h por dia, 7 dias por semana, sem interrupções.' },
             { i: Users, t: 'Equipe Conectada', d: 'Múltiplos acessos para sua recepção, gerência e financeiro.' },
             { i: Star, t: 'IA de Elite', d: 'Atendimento personalizado que mimetiza o tom de voz da sua marca.' }
           ].map((card, i) => (
             <div key={i} className="p-8 rounded-[2rem] glass-strong border border-white/5 hover:border-emerald-400/30 transition-all group">
                <card.i className="w-8 h-8 text-neutral-600 group-hover:text-emerald-400 transition-colors mb-6" />
                <h4 className="font-bold text-lg mb-2">{card.t}</h4>
                <p className="text-neutral-500 text-sm">{card.d}</p>
             </div>
           ))}
        </div>
      </section>

      {/* Exclusive Section */}
      <section className="scroll-mt-24">
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
              <div className="glass-strong border border-white/10 rounded-[2.5rem] p-8 md:p-16 relative">
                <div className="absolute top-0 right-0 p-8">
                  <Star className="w-8 h-8 text-emerald-400 animate-pulse" />
                </div>
                <div className="text-center mb-12">
                   <h3 className="text-3xl font-bold mb-4">Entre na Lista VIP Exclusive</h3>
                   <p className="text-neutral-500 max-w-lg mx-auto">
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
