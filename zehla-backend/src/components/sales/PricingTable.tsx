'use client';

import { Check, ArrowRight, Sparkles, Crown, Zap, Star, X } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface PlanFeature {
  name: string;
  free: boolean | string;
  lite: boolean | string;
  pro: boolean | string;
  max: boolean | string;
}

const PLANS = [
  {
    id: 'free',
    name: 'Grátis',
    price: '0',
    period: '/mês',
    badge: 'Comece Agora',
    badgeColor: 'text-neutral-400 border-neutral-600',
    cta: 'Criar Perfil Grátis',
    href: '/teste-gratis?plan=free',
    gradient: 'from-neutral-600 to-neutral-800',
    shadow: 'shadow-neutral-500/10',
    highlight: false,
  },
  {
    id: 'lite',
    name: 'Lite',
    price: '248',
    period: '/mês',
    badge: 'Taxa Zero',
    badgeColor: 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10',
    cta: 'Quero o Plano Lite',
    href: '/teste-gratis?plan=lite',
    gradient: 'from-orange-500 to-amber-600',
    shadow: 'shadow-orange-500/20',
    highlight: false,
  },
  {
    id: 'pro',
    name: 'PRO',
    price: '448',
    period: '/mês',
    badge: 'Mais Escolhido',
    badgeColor: 'text-orange-500 border-orange-500/20 bg-orange-500/10',
    cta: 'Ativar Plano PRO',
    href: '/teste-gratis?plan=pro',
    gradient: 'from-orange-500 to-amber-600',
    shadow: 'shadow-orange-500/30',
    highlight: true,
  },
  {
    id: 'max',
    name: 'MAX',
    price: '798',
    period: '/mês',
    badge: 'Melhor Custo-Benefício',
    badgeColor: 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10',
    cta: 'Ativar Plano MAX',
    href: '/teste-gratis?plan=max',
    gradient: 'from-emerald-400 to-teal-500',
    shadow: 'shadow-emerald-400/20',
    highlight: false,
  },
];

const FEATURES: PlanFeature[] = [
  { name: 'Perfil da Pousada', free: true, lite: true, pro: true, max: true },
  { name: 'Linktree ZEHLA (Link da Bio)', free: true, lite: true, pro: true, max: true },
  { name: 'Link Direto para Instagram', free: true, lite: true, pro: true, max: true },
  { name: 'Link Direto para WhatsApp', free: true, lite: true, pro: true, max: true },
  { name: 'Atendente Inteligente 24h', free: '50 msg/mês', lite: 'Ilimitado', pro: 'Ilimitado', max: 'Ilimitado' },
  { name: 'Taxa por Reserva', free: '5%', lite: 'TAXA ZERO', pro: 'TAXA ZERO', max: 'TAXA ZERO' },
  { name: 'Agenda de Reservas', free: false, lite: 'Celular', pro: 'Completa', max: 'Completa' },
  { name: 'Recebimento via PIX', free: false, lite: 'Direto', pro: 'Direto', max: 'Direto' },
  { name: 'Preços Inteligentes (IA)', free: false, lite: false, pro: true, max: true },
  { name: 'Recuperação de Vendas', free: false, lite: false, pro: true, max: true },
  { name: 'Promoções Automáticas IA', free: false, lite: false, pro: true, max: true },
  { name: 'Suporte', free: 'Comunidade', lite: 'Email', pro: 'WhatsApp VIP', max: 'Engenharia 24/7' },
  { name: 'Multi-Hotel (Redes)', free: false, lite: false, pro: false, max: true },
  { name: 'Relatórios e Analytics', free: 'Básico', lite: 'Básico', pro: 'Avançado', max: 'Profissional' },
  { name: 'Consultoria de Resultados', free: false, lite: false, pro: false, max: 'Mensal' },
];

function CheckIcon({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="w-4 h-4 text-emerald-400" />;
  if (value === false) return <X className="w-4 h-4 text-neutral-700" />;
  return <span className="text-[10px] font-bold text-neutral-300">{value}</span>;
}

export function PricingTable() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-24">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black tracking-[0.2em] text-neutral-400 uppercase mb-5">
          <Star className="w-3.5 h-3.5" />
          COMPARE OS PLANOS
        </div>
        <h2 className="text-3xl md:text-4xl font-bold">
          O plano ideal para <span className="text-orange-500">sua pousada</span>
        </h2>
        <p className="text-neutral-500 mt-3 text-sm max-w-lg mx-auto">
          Do perfil grátis ao ecossistema completo. Todos os planos têm Taxa Zero (exeto plano Grátis).
        </p>
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-12">
        {PLANS.map((plan, idx) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className={`relative rounded-[2rem] p-6 md:p-8 border ${plan.highlight ? 'border-orange-500/30 bg-neutral-900' : 'border-white/5 bg-neutral-900/50'} ${plan.highlight ? 'ring-1 ring-orange-500/20' : ''}`}
          >
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-600 text-white text-[8px] font-black uppercase tracking-[0.2em] shadow-xl shadow-orange-500/30">
                + VENDIDO
              </div>
            )}

            <div className="text-center mb-6 mt-2">
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[8px] font-bold uppercase tracking-wider ${plan.badgeColor}`}>
                <Sparkles className="w-2.5 h-2.5" />
                {plan.badge}
              </div>
              <div className="mt-4">
                <span className="text-xs text-neutral-500 font-bold uppercase tracking-widest">{plan.name}</span>
                <div className="flex items-baseline justify-center gap-1 mt-1">
                  <span className="text-2xl text-neutral-500">R$</span>
                  <span className="text-4xl md:text-5xl font-black text-white">{plan.price}</span>
                  <span className="text-sm text-neutral-500">{plan.period}</span>
                </div>
              </div>
            </div>

            <Link href={plan.href} className="block">
              <button className={`w-full py-3.5 rounded-2xl bg-gradient-to-r ${plan.gradient} text-white font-bold text-xs shadow-xl ${plan.shadow} transition-all active:scale-95 hover:opacity-90 flex items-center justify-center gap-2`}>
                {plan.cta}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Features Table */}
      <div className="glass-strong border border-white/5 rounded-[2rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                <th className="p-4 md:p-6 text-xs font-bold uppercase tracking-widest text-neutral-400 w-[200px] md:w-[280px]">Funcionalidade</th>
                <th className="p-4 md:p-6 text-xs font-bold uppercase tracking-widest text-neutral-400 text-center">Grátis</th>
                <th className="p-4 md:p-6 text-xs font-bold uppercase tracking-widest text-neutral-400 text-center">Lite</th>
                <th className="p-4 md:p-6 text-xs font-bold uppercase tracking-widest text-orange-500 text-center">PRO</th>
                <th className="p-4 md:p-6 text-xs font-bold uppercase tracking-widest text-emerald-400 text-center">MAX</th>
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((feat, i) => (
                <tr key={feat.name} className={`border-b border-white/5 ${i % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                  <td className="p-4 md:p-6 text-sm font-medium text-neutral-300">{feat.name}</td>
                  <td className="p-4 md:p-6 text-center"><CheckIcon value={feat.free} /></td>
                  <td className="p-4 md:p-6 text-center"><CheckIcon value={feat.lite} /></td>
                  <td className="p-4 md:p-6 text-center"><CheckIcon value={feat.pro} /></td>
                  <td className="p-4 md:p-6 text-center"><CheckIcon value={feat.max} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[10px] text-neutral-600 text-center mt-6 uppercase tracking-widest font-bold">
        Todos os planos incluem 7 dias grátis • Sem fidelidade • Cancele quando quiser
      </p>
    </section>
  );
}
