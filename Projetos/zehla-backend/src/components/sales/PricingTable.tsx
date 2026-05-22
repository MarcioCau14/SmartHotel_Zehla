'use client';

import Link from 'next/link';
import { Check, Minus, Zap, Crown, Star } from 'lucide-react';

interface FeatureRow {
  label: string;
  free: boolean | string;
  lite: boolean | string;
  pro: boolean | string;
  max: boolean | string;
}

const features: FeatureRow[] = [
  { label: 'Preço', free: 'R$ 0', lite: 'R$ 248/mês', pro: 'R$ 448/mês', max: 'R$ 798/mês' },
  { label: 'Taxa por reserva', free: '5%', lite: 'TAXA ZERO', pro: 'TAXA ZERO', max: 'TAXA ZERO' },
  { label: 'Atendente IA 24h', free: '50 msg/mês', lite: true, pro: true, max: true },
  { label: 'Perfil da Pousada', free: true, lite: true, pro: true, max: true },
  { label: 'Linktree ZEHLA', free: true, lite: true, pro: true, max: true },
  { label: 'Link Instagram', free: true, lite: true, pro: true, max: true },
  { label: 'Agenda de Reservas', free: '—', lite: 'Celular', pro: true, max: true },
  { label: 'Recebimento Pix', free: '—', lite: true, pro: true, max: true },
  { label: 'Preços Inteligentes', free: '—', lite: '—', pro: true, max: true },
  { label: 'Recuperação de Vendas', free: '—', lite: '—', pro: true, max: true },
  { label: 'Promoções por IA', free: '—', lite: '—', pro: true, max: true },
  { label: 'Suporte', free: 'Comunidade', lite: 'Email', pro: 'WhatsApp VIP', max: 'Engenharia' },
  { label: 'Multi-Hotel', free: '—', lite: '—', pro: '—', max: true },
  { label: 'Relatórios', free: 'Básico', lite: 'Básico', pro: 'Avançado', max: 'Profissional' },
];

function Cell({ value, isHighlight }: { value: boolean | string; isHighlight: boolean }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className={`w-4 h-4 mx-auto ${isHighlight ? 'text-orange-400' : 'text-emerald-400'}`} />
    ) : (
      <Minus className="w-4 h-4 mx-auto text-neutral-700" />
    );
  }
  const isZero = value === 'TAXA ZERO';
  return (
    <span className={`text-xs font-bold ${isZero ? 'text-emerald-400' : isHighlight ? 'text-orange-300' : 'text-neutral-300'}`}>
      {value}
    </span>
  );
}

const plans = [
  { key: 'free', label: 'GRÁTIS', price: 'R$ 0', href: '/teste-gratis?plan=free', cta: 'Começar Grátis', color: 'text-neutral-400', border: 'border-white/10' },
  { key: 'lite', label: 'LITE', price: 'R$ 248', href: '/teste-gratis?plan=lite', cta: 'Quero Lite', color: 'text-orange-400', border: 'border-orange-500/20' },
  { key: 'pro', label: 'PRO', price: 'R$ 448', href: '/teste-gratis?plan=pro', cta: 'Ativar PRO', color: 'text-orange-400', border: 'border-orange-500/30' },
  { key: 'max', label: 'MAX', price: 'R$ 798', href: '/teste-gratis?plan=max', cta: 'Falar com Consultor', color: 'text-emerald-400', border: 'border-emerald-500/30' },
];

export function PricingTable() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
            Escolha o plano ideal para sua pousada
          </h2>
          <p className="text-neutral-500 text-lg max-w-2xl mx-auto">
            Todos os planos pagos têm <span className="text-emerald-400 font-bold">TAXA ZERO</span> — você fica com 100% da reserva.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left text-neutral-500 text-xs font-bold uppercase tracking-widest pb-6 pr-8 w-48" />
                {plans.map((plan, i) => (
                  <th key={plan.key} className={`pb-6 px-4 text-center ${i === 2 ? 'relative' : ''}`}>
                    {i === 2 && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-black text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full whitespace-nowrap shadow-lg shadow-orange-500/30">
                        <Zap className="w-3 h-3 inline mr-1" />
                        MAIS ESCOLHIDO
                      </div>
                    )}
                    {i === 3 && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-400 text-black text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full whitespace-nowrap shadow-lg shadow-emerald-500/30">
                        <Star className="w-3 h-3 inline mr-1" />
                        MELHOR CUSTO-BENEFÍCIO
                      </div>
                    )}
                    <div className={`inline-flex flex-col items-center gap-2 px-8 py-5 glass-strong border ${plan.border} rounded-2xl`}>
                      <span className={`text-sm font-black tracking-widest ${plan.color}`}>{plan.label}</span>
                      <span className="text-3xl font-black text-white">{plan.price}</span>
                      <span className="text-[10px] text-neutral-600">/mês</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((row, i) => (
                <tr key={i} className="border-t border-white/5">
                  <td className="py-4 pr-8">
                    <span className="text-sm text-neutral-400 font-medium">{row.label}</span>
                  </td>
                  <td className="py-4 px-4 text-center"><Cell value={row.free} isHighlight={false} /></td>
                  <td className="py-4 px-4 text-center bg-orange-500/[0.02]"><Cell value={row.lite} isHighlight={true} /></td>
                  <td className="py-4 px-4 text-center"><Cell value={row.pro} isHighlight={true} /></td>
                  <td className="py-4 px-4 text-center bg-emerald-500/[0.02]"><Cell value={row.max} isHighlight={false} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-16 grid md:grid-cols-4 gap-4">
          {plans.map((plan, i) => (
            <Link
              key={plan.key}
              href={plan.href}
              className={`text-center py-5 px-6 rounded-2xl font-bold text-sm glass-strong border ${plan.border} hover:brightness-110 transition-all active:scale-[0.98] ${
                i === 2 ? 'bg-orange-500/20 shadow-lg shadow-orange-500/10' : ''
              } ${i === 3 ? 'bg-emerald-500/20 shadow-lg shadow-emerald-500/10' : ''}`}
            >
              <span className={`text-lg ${plan.color}`}>
                {i === 3 ? (
                  <><Crown className="w-4 h-4 inline mr-1.5" />{plan.cta}</>
                ) : plan.cta}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
