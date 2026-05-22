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
import { Navbar } from '@/components/sales/Navbar';
import { PricingTable } from '@/components/sales/PricingTable';
import { SocialProof } from '@/components/sales/SocialProof';
import { FAQ } from '@/components/sales/FAQ';
import { PremiumUpsell } from '@/components/sales/PremiumUpsell';
import { LandingTracker } from '@/components/sales/LandingTracker';
import { MainFooter } from '@/components/landing/MainFooter';

export default function LiteSalesPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-orange-500/30">
      <Suspense fallback={null}>
        <LandingTracker />
      </Suspense>

      <Navbar currentPlan="lite" />

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 px-4 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-orange-500/5 blur-[120px] -z-10" />

        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-[10px] font-bold tracking-widest text-orange-500 uppercase mb-8"
          >
            <Zap className="w-3 h-3" /> Plano Lite: Comece agora
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tighter">
            Pare de sustentar plataformas e <br /><span className="text-orange-500">recupere seu lucro agora.</span>
          </h1>

          <p className="text-neutral-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
            O Plano Lite elimina a demora no WhatsApp e a dependência de sites que levam 15% do seu faturamento. Atendimento inteligente 24h para você focar no que importa: <span className="text-white font-bold">dinheiro no seu bolso.</span>
          </p>

          <div className="glass-strong border border-white/5 rounded-3xl p-8 md:p-12 max-w-2xl mx-auto relative group text-center">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity blur" />
            <div className="relative">
              <div className="flex flex-col items-center mb-8">
                <span className="text-neutral-500 text-xs mb-1 uppercase tracking-widest font-bold">Investimento Lite</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl text-neutral-500">R$</span>
                  <span className="text-6xl font-black text-white">248</span>
                  <span className="text-xl text-neutral-500">/mês</span>
                </div>
                <div className="mt-3 px-4 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                  Assinatura 100% Fixa — TAXA ZERO
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-10 text-left">
                {[
                  'Atendente Inteligente 24h',
                  'Controle Simples de Ganhos',
                  'Agenda de Reservas no Celular',
                  'Suporte via Email',
                  'Lembrete para quem não fechou',
                  'Recebimento via PIX Direto',
                ].map((feat) => (
                  <div key={feat} className="flex items-center gap-3 text-neutral-400">
                    <Check className="w-4 h-4 text-orange-500" />
                    <span className="text-sm">{feat}</span>
                  </div>
                ))}
              </div>

              <Link href="/teste-gratis?plan=lite" className="block w-full">
                <Button className="w-full h-16 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-lg font-bold shadow-xl shadow-orange-500/20 transition-all active:scale-95">
                  Quero o Plano Lite
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <p className="mt-4 text-[10px] text-neutral-600 uppercase tracking-widest font-bold">
                Tudo pronto em 10 minutos • 7 dias grátis
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Grid de Features */}
      <section className="py-24 bg-neutral-900/30 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12 text-center md:text-left">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto md:mx-0">
                <Clock className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold">Atendimento que não dorme</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">
                Muitas reservas acontecem à noite. O ZEHLA atende, tira dúvidas e envia o link de pagamento enquanto você descansa.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto md:mx-0">
                <TrendingUp className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold">Fuja das taxas das plataformas</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">
                Venda direto pelo seu WhatsApp e pare de pagar 15% ou 20% de comissão para sites de terceiros. O dinheiro fica no seu bolso.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto md:mx-0">
                <ShieldCheck className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold uppercase tracking-tighter">Garantia ZEHLA ROI</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">
                Se em 30 dias o ZEHLA não recuperar o valor da sua assinatura através de reservas diretas, nós devolvemos o seu dinheiro. O risco é 100% nosso.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <SocialProof />

      {/* Pricing Table */}
      <PricingTable />

      {/* FAQ */}
      <FAQ />

      {/* Upsell LITE → PRO */}
      <PremiumUpsell
        currentPlan="LITE"
        targetPlan="PRO"
        title="Quer aumentar seu lucro com Preços Inteligentes?"
        description="O Plano PRO é para quem quer ir além. Nossa IA altera seus preços automaticamente conforme a procura e busca ativamente clientes que pararam de responder."
        benefits={[
          'Preços Inteligentes (Venda mais na Alta)',
          'Busca Automática de Clientes',
          'Suporte via WhatsApp VIP',
          'Recuperação de vendas perdidas',
        ]}
      />

      {/* Footer */}
      <MainFooter />
    </div>
  );
}
