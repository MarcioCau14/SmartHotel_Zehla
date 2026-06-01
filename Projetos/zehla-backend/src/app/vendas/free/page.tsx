'use client';

import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { 
  Check, 
  ArrowRight, 
  Zap, 
  Brain,
  Sparkles,
  Share2,
  Image as ImageIcon,
  Smartphone,
  Instagram,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PremiumUpsell } from '@/components/sales/PremiumUpsell';
import { LandingTracker } from '@/components/sales/LandingTracker';
import { SocialProof } from '@/components/sales/SocialProof';
import { FAQ } from '@/components/sales/FAQ';
import { HowItWorks } from '@/components/sales/HowItWorks';
import { PricingTable } from '@/components/sales/PricingTable';
import { MainFooter } from '@/components/landing/MainFooter';

export default function FreeSalesPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-orange-500/30">
      <Suspense fallback={null}>
        <LandingTracker />
      </Suspense>
      
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
            <Brain className="w-5 h-5 text-orange-500" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-neutral-100 leading-none">ZEHLA</span>
            <span className="text-[10px] text-neutral-500 leading-none">SmartHotel</span>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/vendas/lite" className="text-[10px] text-neutral-500 hover:text-white uppercase tracking-widest font-bold hidden sm:inline transition-colors">Lite</Link>
          <Link href="/vendas/pro" className="text-[10px] text-neutral-500 hover:text-white uppercase tracking-widest font-bold hidden sm:inline transition-colors">PRO</Link>
          <Link href="/vendas/max" className="text-[10px] text-neutral-500 hover:text-white uppercase tracking-widest font-bold hidden sm:inline transition-colors">MAX</Link>
          <Link href="/login">
            <Button variant="ghost" className="text-neutral-400 hover:text-white text-xs">Entrar</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-28 px-4 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] bg-gradient-to-r from-orange-500/5 via-amber-500/5 to-orange-500/5 blur-[150px] -z-10" />
        
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black tracking-[0.2em] text-neutral-400 uppercase mb-8"
          >
            <Sparkles className="w-3.5 h-3.5" /> 100% GRÁTIS — SEM CARTÃO DE CRÉDITO
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tighter">
            Sua pousada merece <br/><span className="text-orange-500">ser encontrada.</span>
          </h1>
          
          <p className="text-neutral-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            Crie seu perfil grátis em 2 minutos. Um link na bio do Instagram que mostra sua pousada com fotos, WhatsApp e reserva direta. <span className="text-white font-bold">Sem taxa, sem risco, sem compromisso.</span>
          </p>

          {/* Mockup do Perfil */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-sm mx-auto mb-12"
          >
            <div className="glass-strong border border-white/10 rounded-[2rem] p-1 shadow-2xl shadow-orange-500/5">
              <div className="bg-gradient-to-b from-neutral-900 to-black rounded-[1.8rem] p-6 border border-white/5">
                {/* Profile Header */}
                <div className="text-center mb-5">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-orange-500/20">
                    PS
                  </div>
                  <h3 className="font-bold text-white">Pousada do Sol</h3>
                  <p className="text-[10px] text-neutral-500">📍 Paraty, RJ · 12 quartos</p>
                </div>

                {/* Links */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-400/10 flex items-center justify-center">
                      <Brain className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-xs font-bold text-white">Reservar via WhatsApp</div>
                      <div className="text-[9px] text-neutral-500">Atendente IA 24h · resposta imediata</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                      <Instagram className="w-4 h-4 text-pink-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-xs font-bold text-white">Siga no Instagram</div>
                      <div className="text-[9px] text-neutral-500">@pousadadosol_oficial</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                    <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center">
                      <ImageIcon className="w-4 h-4 text-orange-500" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-xs font-bold text-white">Fotos da Pousada</div>
                      <div className="text-[9px] text-neutral-500">10 fotos · veja o ambiente</div>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-4 p-3 rounded-2xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 text-center">
                  <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">Clique e reserve · sem taxa</span>
                </div>
              </div>
            </div>
            <p className="text-[9px] text-neutral-600 mt-3 uppercase tracking-widest font-bold">
              📱 Esse é o perfil da sua pousada. Compartilhe o link no Instagram.
            </p>
          </motion.div>

          <Link href="/teste-gratis?plan=free">
            <Button className="h-16 px-10 rounded-2xl bg-white hover:bg-neutral-200 text-black text-lg font-bold shadow-2xl shadow-white/10 transition-all active:scale-95">
              Criar Perfil Grátis
              <ArrowRight className="ml-3 w-5 h-5" />
            </Button>
          </Link>
          <p className="mt-4 text-[10px] text-neutral-600 uppercase tracking-widest font-bold">
            ✅ 2 minutos de setup • ✅ Sem cartão de crédito • ✅ 50 atendimentos IA grátis/mês
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-neutral-900/30 border-y border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold">Tudo que você ganha <span className="text-orange-500">de graça</span></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Share2, title: 'Link na Bio do Instagram', desc: 'Um link bonito que vende por você. Cole na bio e seus seguidores veem sua pousada completa.' },
              { icon: Instagram, title: 'Instagram Integrado', desc: 'Link direto para o Instagram da sua pousada. Hóspedes descobrem e seguem sua página.' },
              { icon: Smartphone, title: 'Atendente IA (50/mês)', desc: 'Responda automaticamente as primeiras 50 mensagens do WhatsApp por mês. Não perca nenhuma reserva.' },
            ].map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center md:text-left space-y-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto md:mx-0">
                  <feat.icon className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="text-lg font-bold">{feat.title}</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
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

      {/* Upsell */}
      <PremiumUpsell 
        currentPlan="FREE"
        targetPlan="LITE"
        title="Quer atendimento ilimitado 24h?"
        description="O Plano Lite elimina o limite de 50 mensagens. Atendente IA 24h, taxa zero em todas as reservas e agenda de reservas no celular."
        benefits={[
          'Atendente IA ILIMITADO',
          'TAXA ZERO por reserva',
          'Agenda de Reservas no Celular',
          'Recebimento via PIX Direto'
        ]}
      />

      {/* Footer */}
      <MainFooter />
    </div>
  );
}
