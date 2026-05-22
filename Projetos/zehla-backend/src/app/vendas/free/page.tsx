'use client';

import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Smartphone, Instagram, Camera, MapPin, Share2 } from 'lucide-react';
import Link from 'next/link';
import { Navbar } from '@/components/sales/Navbar';
import { PricingTable } from '@/components/sales/PricingTable';
import { SocialProof } from '@/components/sales/SocialProof';
import { HowItWorks } from '@/components/sales/HowItWorks';
import { FAQ } from '@/components/sales/FAQ';
import { PremiumUpsell } from '@/components/sales/PremiumUpsell';
import { LandingTracker } from '@/components/sales/LandingTracker';
import { MainFooter } from '@/components/landing/MainFooter';

export default function FreeSalesPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-orange-500/30">
      <Suspense fallback={null}>
        <LandingTracker />
      </Suspense>

      <Navbar currentPlan="free" />

      {/* Hero */}
      <section className="relative pt-16 pb-24 px-4 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] bg-orange-500/5 blur-[150px] -z-10" />

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-[10px] font-bold tracking-widest text-orange-500 uppercase mb-6">
                <Share2 className="w-3 h-3" /> 100% GRÁTIS
              </div>

              <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tighter">
                Sua pousada merece ser{' '}
                <span className="text-orange-500">encontrada.</span>
              </h1>

              <p className="text-neutral-400 text-lg mb-8 leading-relaxed">
                Crie seu perfil grátis em 2 minutos. Um link na bio do Instagram que mostra sua pousada com fotos, WhatsApp e reserva direta. <span className="text-white font-bold">Sem taxa, sem risco, sem compromisso.</span>
              </p>

              <Link href="/teste-gratis?plan=free">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-10 py-5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg rounded-2xl shadow-2xl shadow-orange-500/30 transition-all inline-flex items-center gap-3"
                >
                  Criar Perfil Grátis
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <p className="mt-4 text-[10px] text-neutral-600 uppercase tracking-widest font-bold">
                Sem cartão de crédito • 2 minutos
              </p>
            </motion.div>

            {/* Mockup do Perfil */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-br from-orange-500/10 to-transparent rounded-[3rem] blur-2xl" />
              <div className="relative glass-strong border border-white/10 rounded-[2.5rem] p-6 overflow-hidden">
                {/* Mockup Header */}
                <div className="text-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center mx-auto mb-4 shadow-xl">
                    <span className="text-2xl font-black text-black">PS</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">Pousada do Sol</h3>
                  <div className="flex items-center justify-center gap-1 text-sm text-neutral-500 mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Paraty, RJ</span>
                  </div>
                </div>

                {/* Action Cards */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-green-400">Reservar via WhatsApp</div>
                      <div className="text-[10px] text-neutral-500">Clique e reserve · sem taxa</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-green-400" />
                  </div>

                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-pink-500/10 border border-pink-500/20 hover:bg-pink-500/20 transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
                      <Instagram className="w-5 h-5 text-pink-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-pink-400">Siga no Instagram</div>
                      <div className="text-[10px] text-neutral-500">@pousadadosol_oficial</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <Camera className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-blue-400">Fotos da Pousada</div>
                      <div className="text-[10px] text-neutral-500">12 fotos disponíveis</div>
                    </div>
                  </div>
                </div>

                {/* Badge */}
                <div className="text-center">
                  <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                    Grátis · Clique e reserve · sem taxa
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <HowItWorks />

      {/* Social Proof */}
      <SocialProof />

      {/* Pricing Table */}
      <PricingTable />

      {/* FAQ */}
      <FAQ />

      {/* Premium Upsell FREE → LITE */}
      <PremiumUpsell
        currentPlan="FREE"
        targetPlan="PRO"
        title="Quer atendimento ilimitado 24h?"
        description="O Plano PRO é para quem quer ir além. Atendente IA ilimitado, taxa zero em todas as reservas, agenda completa e recebimento Pix direto. Sua pousada vendendo 24h por dia."
        benefits={[
          'Atendente IA ilimitado 24h',
          'Taxa zero em todas as reservas',
          'Agenda de reservas completa',
          'Recebimento Pix direto',
        ]}
      />

      {/* Footer */}
      <MainFooter />
    </div>
  );
}
