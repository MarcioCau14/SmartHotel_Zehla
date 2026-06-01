'use client';

import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Brain,
  TrendingUp,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PremiumUpsell } from '@/components/sales/PremiumUpsell';
import { LandingTracker } from '@/components/sales/LandingTracker';
import { SocialProof } from '@/components/sales/SocialProof';
import { FAQ } from '@/components/sales/FAQ';
import { PricingTable } from '@/components/sales/PricingTable';
import { MainFooter } from '@/components/landing/MainFooter';

export default function LiteSalesPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-neutral-100 font-sans selection:bg-[#FF5500]/30 selection:text-white relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-[#FF5500]/8 via-[#FF5500]/2 to-transparent rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#FF5500]/2 rounded-full blur-[120px] pointer-events-none -z-10" />

      <Suspense fallback={null}>
        <LandingTracker />
      </Suspense>
      
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center relative z-20">
        <Link href="/" className="flex items-center gap-3 group transition-transform hover:scale-[1.02] duration-300">
          <div className="w-10 h-10 rounded-xl bg-[#FF5500]/10 border border-[#FF5500]/20 flex items-center justify-center group-hover:bg-[#FF5500]/20 group-hover:border-[#FF5500]/40 transition-all duration-300 shadow-[0_0_15px_rgba(255,85,0,0.1)]">
            <Brain className="w-5 h-5 text-[#FF5500] group-hover:rotate-6 transition-transform duration-300" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg text-neutral-100 leading-none tracking-tight">ZEHLA</span>
            <span className="text-[10px] text-neutral-500 leading-none mt-0.5 tracking-wider font-semibold">SmartHotel</span>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/vendas/free" className="text-[10px] text-neutral-500 hover:text-white uppercase tracking-widest font-bold hidden sm:inline transition-colors">Grátis</Link>
          <Link href="/vendas/pro" className="text-[10px] text-neutral-500 hover:text-white uppercase tracking-widest font-bold hidden sm:inline transition-colors">PRO</Link>
          <Link href="/vendas/max" className="text-[10px] text-neutral-500 hover:text-white uppercase tracking-widest font-bold hidden sm:inline transition-colors">MAX</Link>
          <span className="text-xs text-neutral-500 hidden sm:inline">Pousadas de 5 a 10 quartos</span>
          <Link href="/login">
            <Button variant="ghost" className="text-neutral-400 hover:text-white text-xs">Entrar</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-28 px-4 overflow-hidden z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2.5 px-4.5 py-2 rounded-full bg-[#FF5500]/10 border border-[#FF5500]/20 text-[10px] font-black tracking-[0.2em] text-[#FF5500] uppercase mb-10 shadow-[0_4px_20px_rgba(255,85,0,0.1)] hover:scale-105 transition-transform duration-300 select-none"
          >
            <Zap className="w-3.5 h-3.5" /> Plano Lite: Comece agora
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-black mb-8 leading-[1.08] tracking-tighter text-white">
            Pare de sustentar plataformas e <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5500] to-amber-500 drop-shadow-[0_2px_20px_rgba(255,85,0,0.2)]">recupere seu lucro agora.</span>
          </h1>
          
          <p className="text-neutral-400 text-lg md:text-xl mb-16 max-w-3xl mx-auto leading-relaxed font-medium">
            O Plano Lite elimina a demora no WhatsApp e a dependência de sites que levam 15% do seu faturamento. Atendimento inteligente 24h para você focar no que importa: <span className="text-white font-bold">dinheiro no seu bolso.</span>
          </p>

          {/* Pricing Card Block */}
          <div className="glass-strong border border-white/10 rounded-[3rem] p-1.5 md:p-2.5 max-w-2xl mx-auto relative group shadow-[0_30px_80px_rgba(0,0,0,0.7)] transition-all duration-500 hover:shadow-[0_30px_100px_rgba(255,85,0,0.12)] hover:border-[#FF5500]/25 hover:scale-[1.01] text-center">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FF5500] to-transparent rounded-[3rem] opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-500" />
            
            <div className="bg-[#0b0b0d]/95 backdrop-blur-xl rounded-[2.8rem] p-8 md:p-12 relative border border-white/5 overflow-hidden">
              <div className="flex flex-col items-center mb-10">
                <span className="text-neutral-500 text-xs mb-3 font-bold tracking-[0.2em] uppercase">Investimento Lite</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl text-neutral-500 font-medium">R$</span>
                  <span className="text-7xl font-black text-white tracking-tight">248</span>
                  <span className="text-2xl text-neutral-500 font-medium">/mês</span>
                </div>
                
                {/* Active Fixed-Price Badge */}
                <div className="mt-5 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF5500]/10 to-amber-500/5 border border-[#FF5500]/20 text-[#FF5500] font-black text-xs uppercase tracking-[0.15em] shadow-[0_5px_20px_rgba(255,85,0,0.08)] flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF5500] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF5500]"></span>
                  </span>
                  Assinatura 100% Fixa — Taxa Zero
                </div>
              </div>

              {/* Feature Grid */}
              <div className="grid sm:grid-cols-2 gap-5 mb-10 text-left border-t border-b border-white/5 py-7">
                {[
                  'Atendente Inteligente 24h',
                  'Controle Simples de Ganhos',
                  'Agenda de Reservas no Celular',
                  'Suporte via Email',
                  'Lembrete para quem não fechou',
                  'Recebimento via PIX Direto'
                ].map((feat) => (
                  <div key={feat} className="flex items-center gap-3.5 text-neutral-300 hover:text-white transition-colors duration-300 group/item">
                    <div className="w-5 h-5 rounded-full bg-[#FF5500]/10 border border-[#FF5500]/20 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-[0_0_10px_rgba(255,85,0,0.1)]">
                      <Check className="w-3 h-3 text-[#FF5500]" />
                    </div>
                    <span className="text-sm font-semibold">{feat}</span>
                  </div>
                ))}
              </div>

              <div className="relative z-10">
                <Link href="/teste-gratis?plan=lite" className="block w-full">
                  <Button className="w-full h-18 rounded-[1.6rem] bg-[#FF5500] hover:bg-[#ff6611] text-white text-lg font-black shadow-[0_12px_30px_rgba(255,85,0,0.3)] transition-all duration-300 active:scale-95 border border-white/10 flex items-center justify-center gap-2">
                    Quero o Plano Lite
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
                  </Button>
                </Link>
                
                <p className="mt-4 text-[10px] text-neutral-600 uppercase tracking-widest font-black">
                  Tudo pronto em 10 minutos • 7 dias grátis
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Persuasion Section */}
      <section className="py-24 bg-gradient-to-b from-[#08080a] to-[#050505] border-t border-b border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12 text-center md:text-left">
            <div className="space-y-5 group">
              <div className="w-14 h-14 rounded-2xl bg-[#FF5500]/10 border border-[#FF5500]/20 flex items-center justify-center mx-auto md:mx-0 shadow-[0_0_15px_rgba(255,85,0,0.15)] group-hover:bg-[#FF5500]/20 transition-all duration-300">
                <Clock className="w-6 h-6 text-[#FF5500]" />
              </div>
              <h3 className="text-xl font-extrabold text-white">Atendimento que não dorme</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Muitas reservas acontecem à noite. O ZEHLA atende, tira dúvidas e envia o link de pagamento enquanto você descansa.
              </p>
            </div>
            
            <div className="space-y-5 group">
              <div className="w-14 h-14 rounded-2xl bg-[#FF5500]/10 border border-[#FF5500]/20 flex items-center justify-center mx-auto md:mx-0 shadow-[0_0_15px_rgba(255,85,0,0.15)] group-hover:bg-[#FF5500]/20 transition-all duration-300">
                <TrendingUp className="w-6 h-6 text-[#FF5500]" />
              </div>
              <h3 className="text-xl font-extrabold text-white">Fuja das taxas das plataformas</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Venda direto pelo seu WhatsApp e pare de pagar 15% ou 20% de comissão para sites de terceiros. O dinheiro fica no seu bolso.
              </p>
            </div>
            
            <div className="space-y-5 group">
              <div className="w-14 h-14 rounded-2xl bg-[#FF5500]/10 border border-[#FF5500]/20 flex items-center justify-center mx-auto md:mx-0 shadow-[0_0_15px_rgba(255,85,0,0.15)] group-hover:bg-[#FF5500]/20 transition-all duration-300">
                <ShieldCheck className="w-6 h-6 text-[#FF5500]" />
              </div>
              <h3 className="text-xl font-extrabold text-white uppercase tracking-tighter">Garantia ZEHLA ROI</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Se em 30 dias o ZEHLA não recuperar o valor da sua assinatura através de reservas diretas, nós devolvemos o seu dinheiro. O risco é 100% nosso.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Upsell Strategic Section */}
      <div className="relative z-10">
        <PremiumUpsell 
          currentPlan="LITE"
          targetPlan="PRO"
          title="Quer aumentar seu lucro com Preços Inteligentes?"
          description="O Plano PRO é para quem quer ir além. Nossa IA altera seus preços automaticamente conforme a procura e busca ativamente clientes que pararam de responder."
          benefits={[
            'Preços Inteligentes (Venda mais na Alta)',
            'Busca Automática de Clientes',
            'Suporte via WhatsApp',
            'TAXA ZERO por reserva'
          ]}
        />
      </div>

      {/* Social Proof & FAQ */}
      <SocialProof />
      <PricingTable />
      <FAQ />

      {/* Footer */}
      <MainFooter />
    </div>
  );
}
