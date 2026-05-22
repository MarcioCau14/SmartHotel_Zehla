'use client';

import { Suspense } from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  ArrowRight,
  Smartphone,
  Instagram,
  Camera,
  MapPin,
  Share2,
  Sparkles,
  Crown,
  Zap,
  ShieldCheck,
  TrendingUp,
  Clock,
  Lock,
  Globe,
  Users,
  Star,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PricingTable } from '@/components/sales/PricingTable';
import { SocialProof } from '@/components/sales/SocialProof';
import { HowItWorks } from '@/components/sales/HowItWorks';
import { FAQ } from '@/components/sales/FAQ';
import { PremiumUpsell } from '@/components/sales/PremiumUpsell';
import { LandingTracker } from '@/components/sales/LandingTracker';
import { MainFooter } from '@/components/landing/MainFooter';

export default function VendasPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-orange-500/30">
      <Suspense fallback={null}>
        <LandingTracker />
      </Suspense>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-black/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
              <Zap className="w-5 h-5 text-orange-500" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-neutral-100 leading-none">ZEHLA</span>
              <span className="text-[10px] text-neutral-500 leading-none">SmartHotel</span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/teste-gratis?plan=free"
              className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-lg shadow-orange-500/20"
            >
              Criar Perfil Grátis
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/login"
              className="text-xs text-neutral-400 hover:text-white font-medium transition-colors px-4 py-2 rounded-full border border-white/10 hover:border-white/20"
            >
              Entrar
            </Link>
          </div>
        </div>
      </nav>

      {/* === HERO === */}
      <section className="relative pt-24 pb-32 px-4 overflow-hidden">
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

      {/* === PLANOS (cards overview) === */}
      <section className="py-32 px-4 bg-neutral-900/20 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">Escolha o plano ideal para sua pousada</h2>
            <p className="text-neutral-500 max-w-xl mx-auto">
              Todos os planos com assinatura fixa — <span className="text-white font-bold">zero comissão por reserva.</span>
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* FREE */}
            <div id="gratis" className="scroll-mt-24 lg:col-span-2 lg:grid lg:grid-cols-2 gap-6 glass-strong border border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden">
              <div className="flex flex-col justify-between">
                <div>
                  <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-4">Grátis</span>
                  <h3 className="text-3xl font-black text-white mb-2">FREE</h3>
                  <p className="text-neutral-500 text-sm mb-6">Perfil digital para sua pousada. Ideal para começar.</p>
                  <ul className="space-y-3 mb-8">
                    {[
                      'Perfil com fotos e WhatsApp',
                      'Link na bio do Instagram',
                      'Reserva direta sem taxa',
                      '2 minutos para criar',
                    ].map((f) => (
                      <li key={f} className="flex items-start gap-3 text-sm text-neutral-400">
                        <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link href="/teste-gratis?plan=free">
                  <Button className="w-full h-14 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold transition-all active:scale-95">
                    Criar Grátis
                  </Button>
                </Link>
              </div>
              <div className="hidden lg:flex items-center justify-center">
                <div className="glass-strong border border-white/5 rounded-2xl p-4 w-full max-w-[220px]">
                  <div className="text-center mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center mx-auto mb-2 shadow-lg">
                      <span className="text-sm font-black text-black">PS</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">Pousada do Sol</h4>
                    <div className="flex items-center justify-center gap-1 text-[10px] text-neutral-500">
                      <MapPin className="w-2.5 h-2.5" />
                      Paraty, RJ
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-green-500/10 border border-green-500/20">
                      <Smartphone className="w-3.5 h-3.5 text-green-400 shrink-0" />
                      <span className="text-[10px] text-green-400 font-medium">Reservar via WhatsApp</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-pink-500/10 border border-pink-500/20">
                      <Instagram className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                      <span className="text-[10px] text-pink-400 font-medium">Siga no Instagram</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* LITE */}
            <div id="lite" className="scroll-mt-24 glass-strong border border-white/5 rounded-[2.5rem] p-8 flex flex-col justify-between relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/20 to-transparent rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity blur" />
              <div className="relative">
                <span className="inline-block px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-bold uppercase tracking-widest mb-4">Taxa Zero</span>
                <h3 className="text-3xl font-black text-white mb-2">LITE</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-lg text-neutral-500">R$</span>
                  <span className="text-4xl font-black text-white">248</span>
                  <span className="text-sm text-neutral-500">/mês</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    'Atendente Inteligente 24h',
                    'Agenda de Reservas',
                    'Recebimento Pix Direto',
                    'Suporte via Email',
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-neutral-400">
                      <Check className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <Link href="/teste-gratis?plan=lite">
                <Button className="w-full h-14 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-lg shadow-orange-500/20 transition-all active:scale-95">
                  Quero Lite
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* PRO */}
            <div id="pro" className="scroll-mt-24 glass-strong border border-orange-500/20 rounded-[2.5rem] p-8 flex flex-col justify-between relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 rounded-[2.5rem] opacity-10 blur-xl group-hover:opacity-30 transition-opacity" />
              <div className="relative">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 text-[10px] font-black tracking-widest text-orange-400 uppercase mb-4">
                  <Sparkles className="w-3 h-3" /> MAIS ESCOLHIDO
                </div>
                <h3 className="text-3xl font-black text-white mb-2">PRO</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-lg text-neutral-500">R$</span>
                  <span className="text-4xl font-black text-white">448</span>
                  <span className="text-sm text-neutral-500">/mês</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    'Preços Inteligentes (IA)',
                    'Busca de Clientes',
                    'Relatórios de Lucro',
                    'Suporte VIP WhatsApp',
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-neutral-400">
                      <div className="w-4 h-4 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center mt-0.5 shrink-0">
                        <Check className="w-2.5 h-2.5 text-orange-500" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <Link href="/teste-gratis?plan=pro">
                <Button className="w-full h-14 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold shadow-xl shadow-orange-500/30 transition-all active:scale-95">
                  Ativar PRO
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* MAX */}
            <div id="max" className="scroll-mt-24 glass-strong border border-emerald-500/20 rounded-[2.5rem] p-8 flex flex-col justify-between relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-transparent rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity blur" />
              <div className="relative">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black tracking-widest text-emerald-400 uppercase mb-4">
                  <Crown className="w-3 h-3" /> TOPO DE LINHA
                </div>
                <h3 className="text-3xl font-black text-white mb-2">MAX</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-lg text-neutral-500">R$</span>
                  <span className="text-4xl font-black text-white">798</span>
                  <span className="text-sm text-neutral-500">/mês</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    'TUDO dos planos anteriores',
                    'Quartos Ilimitados',
                    'Multi-Hotel (rede)',
                    'Suporte de Elite 24h',
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-neutral-400">
                      <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <Link href="/teste-gratis?plan=max">
                <Button className="w-full h-14 rounded-2xl bg-emerald-400 hover:bg-emerald-500 text-black font-bold shadow-xl shadow-emerald-400/30 transition-all active:scale-95">
                  Ativar MAX
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* === SEÇÕES DETALHADAS POR PLANO === */}

      {/* #lite — Plano Lite Detalhado */}
      <section id="lite-detalhe" className="scroll-mt-24 py-32 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-orange-500/5 blur-[120px] -z-10" />
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-[10px] font-bold tracking-widest text-orange-500 uppercase mb-8">
            <Zap className="w-3 h-3" /> Plano Lite: Comece agora
          </div>

          <h2 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tighter">
            Pare de sustentar plataformas e <br /><span className="text-orange-500">recupere seu lucro agora.</span>
          </h2>

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

        {/* Lite Feature Grid */}
        <div className="max-w-7xl mx-auto mt-24 grid md:grid-cols-3 gap-12 text-center md:text-left">
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
      </section>

      {/* #pro — Plano PRO Detalhado */}
      <section id="pro-detalhe" className="scroll-mt-24 py-32 px-4 relative overflow-hidden text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] bg-orange-500/10 blur-[150px] -z-10" />

        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 text-[10px] font-black tracking-[0.2em] text-orange-400 uppercase mb-8 shadow-2xl shadow-orange-500/20">
            <Sparkles className="w-4 h-4" /> PLANO MAIS ESCOLHIDO
          </div>

          <h2 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tighter">
            Escala e <span className="text-orange-500">Lucro Invisível.</span>
          </h2>

          <p className="text-neutral-400 text-lg md:text-xl mb-12 max-w-3xl mx-auto leading-relaxed">
            O Plano PRO não é apenas um sistema, é o seu <span className="text-white font-bold">Diretor de Estratégia Digital.</span> Nossa IA sabe exatamente quando subir seus preços para maximizar sua margem e busca clientes que não fecharam de forma incansável.
          </p>

          <div className="glass-strong border border-white/10 rounded-[3rem] p-1 md:p-2 max-w-3xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 rounded-[3rem] opacity-20 blur-xl group-hover:opacity-40 transition-opacity" />

            <div className="bg-neutral-950 rounded-[2.8rem] p-8 md:p-12 relative border border-white/5">
              <div className="flex flex-col items-center mb-10">
                <span className="text-neutral-500 text-xs mb-2 font-bold tracking-widest uppercase">Investimento Pro</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl text-neutral-500">R$</span>
                  <span className="text-7xl font-black text-white">448</span>
                  <span className="text-xl text-neutral-500">/mês</span>
                </div>
                <div className="mt-3 px-4 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                  Assinatura 100% Fixa — Sem Comissões
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6 mb-12 text-left">
                {[
                  'Preços Inteligentes (Venda mais na Alta)',
                  'Busca de Clientes que não fecharam',
                  'Relatórios Fáceis de Entender',
                  'Suporte VIP via WhatsApp',
                  'Gestão de Lucratividade',
                  'Promoções Automáticas por IA',
                  'Tudo do Plano Lite incluso',
                ].map((feat) => (
                  <div key={feat} className="flex items-start gap-3 text-neutral-300">
                    <div className="w-5 h-5 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-orange-500" />
                    </div>
                    <span className="text-sm font-medium">{feat}</span>
                  </div>
                ))}
              </div>

              <Link href="/teste-gratis?plan=pro" className="block w-full">
                <button className="w-full h-20 rounded-[1.5rem] bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xl font-bold shadow-2xl shadow-orange-500/40 transition-all active:scale-95 group flex items-center justify-center">
                  Ativar Plano PRO
                  <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </button>
              </Link>
              <div className="mt-6 flex items-center justify-center gap-6 text-[10px] text-neutral-500 font-bold uppercase tracking-widest">
                <span>✓ 7 Dias Grátis</span>
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-800" />
                <span>✓ Sem Fidelidade</span>
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-800" />
                <span>✓ Setup Full</span>
              </div>
            </div>
          </div>
        </div>

        {/* PRO Intelligence */}
        <div className="max-w-7xl mx-auto mt-32 grid md:grid-cols-2 gap-16 items-center text-left">
          <div className="space-y-8">
            <h2 className="text-4xl font-bold leading-tight">
              Onde o PRO faz sua pousada <span className="text-orange-500">lucrar mais</span>
            </h2>
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4 p-6 rounded-3xl glass-strong border border-white/5">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center flex-shrink-0 mx-auto md:mx-0">
                  <TrendingUp className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Recuperação de Vendas</h4>
                  <p className="text-neutral-500 text-sm">O ZEHLA identifica quem parou de responder e faz o contato na hora certa para garantir que a reserva seja sua, não do vizinho.</p>
                </div>
              </div>
              <div className="p-6 rounded-3xl glass-strong border border-white/5">
                <h4 className="font-bold text-lg mb-1 uppercase tracking-tighter text-orange-500">O Algoritmo de Lucro</h4>
                <p className="text-neutral-400 text-sm leading-relaxed">Baseado no modelo G-Solis, o ZEHLA identifica picos de demanda na sua cidade e ajusta sua tarifa em milissegundos. <span className="text-white font-bold italic">Você fatura mais no mesmo quarto, sem esforço.</span></p>
              </div>
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="absolute -inset-10 bg-orange-500/10 blur-[80px] -z-10" />
            <div className="glass-strong border border-white/5 rounded-3xl p-2">
              <div className="aspect-video bg-neutral-950 rounded-2xl border border-white/5 flex items-center justify-center overflow-hidden">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-1.5 h-8 bg-orange-500/40 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                    ))}
                  </div>
                  <span className="text-[10px] text-neutral-600 font-mono tracking-widest uppercase">Inteligência Analisando Demanda...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* #max — Plano MAX Detalhado */}
      <section id="max-detalhe" className="scroll-mt-24 py-32 px-4 relative overflow-hidden text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[600px] bg-emerald-500/5 blur-[180px] -z-10" />

        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black tracking-[0.4em] text-emerald-400 uppercase mb-10 shadow-[0_0_20px_rgba(52,211,153,0.1)]">
            <Crown className="w-4 h-4" /> PERFORMANCE SEM LIMITES
          </div>

          <h2 className="text-5xl md:text-7xl font-black mb-8 leading-tight tracking-tighter">
            Domine o mercado com <br /><span className="text-emerald-400">Custo Variável ZERO.</span>
          </h2>

          <p className="text-neutral-400 text-lg md:text-xl mb-16 max-w-3xl mx-auto leading-relaxed">
            O Plano MAX é a decisão estratégica de quem parou de dar dinheiro para as plataformas e decidiu <span className="text-white font-bold italic underline decoration-emerald-500/30">investir no próprio império.</span> Sem comissões, sem limites, suporte de elite.
          </p>

          <div className="grid md:grid-cols-12 gap-8 items-stretch text-left">
            <div className="md:col-span-7 glass-strong border border-white/5 rounded-[3rem] p-10 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Building2 className="w-40 h-40" />
              </div>

              <div className="relative">
                <h3 className="text-3xl font-bold mb-8 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-400/10 flex items-center justify-center">
                    <Star className="w-5 h-5 text-emerald-400" />
                  </div>
                  O que o Plano MAX oferece
                </h3>
                <div className="space-y-6">
                  {[
                    { t: 'Taxa Zero em Todas as Reservas', d: 'Mantenha 100% da sua receita direta. Sua única despesa é uma assinatura fixa, transformando seu custo variável em lucro líquido.' },
                    { t: 'Consolidação de Rede (Multi-Hotel)', d: 'Visão de Monarca sobre toda a sua rede. Controle financeiro e de ocupação centralizado em um único cockpit.' },
                    { t: 'Acesso Direto à Engenharia ZEHLA', d: 'Fila prioritária com nossos desenvolvedores seniores. Sua operação é nossa prioridade absoluta, 24/7.' },
                    { t: 'Inteligência de Mercado Exclusiva', d: 'Análise de dados de concorrência e comportamento de consumo para garantir que você esteja sempre à frente.' },
                  ].map((item) => (
                    <div key={item.t}>
                      <h4 className="text-emerald-400 font-bold mb-1 flex items-center gap-2">
                        <Check className="w-4 h-4" /> {item.t}
                      </h4>
                      <p className="text-neutral-500 text-sm leading-relaxed pl-6">{item.d}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="md:col-span-5 bg-neutral-900/50 border border-emerald-500/20 rounded-[3rem] p-10 flex flex-col justify-center relative group">
              <div className="relative text-center">
                <span className="text-neutral-500 text-xs font-black uppercase tracking-[0.3em] mb-4 block">Assinatura Profissional</span>
                <div className="flex items-baseline justify-center gap-2 mb-6">
                  <span className="text-2xl text-neutral-500 font-bold">R$</span>
                  <span className="text-7xl font-black text-white">798</span>
                  <span className="text-2xl text-neutral-500 font-bold">/mês</span>
                </div>
                <div className="py-3 px-6 rounded-2xl bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 font-black text-xl mb-4 inline-block">
                  TUDO INCLUSO
                </div>
                <div className="mb-12 px-4 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest inline-block">
                  Tudo Incluso — Sem Taxas
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

        {/* MAX Trust Grid */}
        <div className="max-w-7xl mx-auto mt-32 grid md:grid-cols-4 gap-8 text-left">
          {[
            { i: Lock, t: 'Segurança de Dados', d: 'Proteção total das informações dos seus hóspedes e da sua pousada.' },
            { i: Globe, t: 'Alta Disponibilidade', d: 'Sistema operando 24h por dia, 7 dias por semana, sem interrupções.' },
            { i: Users, t: 'Equipe Conectada', d: 'Múltiplos acessos para sua recepção, gerência e financeiro.' },
            { i: Star, t: 'IA de Elite', d: 'Atendimento personalizado que mimetiza o tom de voz da sua marca.' },
          ].map((card, i) => (
            <div key={i} className="p-8 rounded-[2rem] glass-strong border border-white/5 hover:border-emerald-400/30 transition-all group">
              <card.i className="w-8 h-8 text-neutral-600 group-hover:text-emerald-400 transition-colors mb-6" />
              <h4 className="font-bold text-lg mb-2">{card.t}</h4>
              <p className="text-neutral-500 text-sm">{card.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <HowItWorks />

      {/* Pricing Table */}
      <PricingTable />

      {/* Social Proof */}
      <SocialProof />

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
