'use client';

import { useState } from 'react';
import { 
  Check, CreditCard, Sparkles, Zap, ShieldCheck, 
  ChevronRight, Calendar, MessageSquare, BarChart3 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const plans = [
  {
    id: 'LITE',
    name: 'ZEHLA Lite',
    price: '248',
    fee: '5%',
    features: [
      'WhatsApp ZEHLA 24/7',
      'Dashboard Financeiro Básico',
      'Gestão de Reservas',
      'Suporte via Email'
    ],
    color: 'border-white/10'
  },
  {
    id: 'PRO',
    name: 'ZEHLA Pro',
    price: '448',
    fee: '2%',
    popular: true,
    features: [
      'Tudo do Lite',
      'Precificação Dinâmica IA',
      'Promoções Automáticas',
      'Relatórios de Performance',
      'Suporte Prioritário WhatsApp'
    ],
    color: 'border-orange-500/50'
  },
  {
    id: 'MAX',
    name: 'ZEHLA Max',
    price: '798',
    fee: '0%',
    features: [
      'Tudo do Pro',
      'TAXA ZERO por reserva',
      'Zehla Control Center (ZCC)',
      'Multi-propriedades',
      'Gestor de Conta Dedicado'
    ],
    color: 'border-blue-500/50'
  }
];

export function SubscriptionSelector() {
  const [selectedPlan, setSelectedPlan] = useState('PRO');
  const [step, setStep] = useState<'plans' | 'payment'>('plans');

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {step === 'plans' ? (
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-neutral-100">Seu trial terminou. Escolha seu plano:</h2>
            <p className="text-neutral-500 text-sm">Continue automatizando seu hotel com o cérebro ZEHLA.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div 
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`glass-card p-6 cursor-pointer transition-all relative border-2 ${
                  selectedPlan === plan.id ? plan.color : 'border-transparent'
                } hover:bg-white/[0.05]`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Mais Escolhido
                  </span>
                )}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-neutral-100">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-bold text-orange-400">R$ {plan.price}</span>
                      <span className="text-xs text-neutral-500">/mês</span>
                    </div>
                    <div className="text-[10px] text-neutral-400 mt-1 uppercase font-bold tracking-tight">
                      Taxa de Reserva: {plan.fee}
                    </div>
                  </div>

                  <ul className="space-y-2.5">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-neutral-400">
                        <Check className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <Button 
              size="lg" 
              className="bg-orange-500 hover:bg-orange-600 text-white px-12"
              onClick={() => setStep('payment')}
            >
              Próximo: Dados de Pagamento
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-neutral-100">Cartão de Crédito</h2>
            <p className="text-neutral-500 text-sm">Assinatura do Plano {selectedPlan}</p>
          </div>

          <div className="glass-card p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-neutral-500 ml-1">Número do Cartão</label>
              <div className="relative">
                <Input className="bg-[#1a1a1a] border-[#2e2e2e] text-neutral-200 pl-10" placeholder="0000 0000 0000 0000" />
                <CreditCard className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-neutral-500 ml-1">Vencimento</label>
                <Input className="bg-[#1a1a1a] border-[#2e2e2e] text-neutral-200" placeholder="MM/AA" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-neutral-500 ml-1">CVC</label>
                <Input className="bg-[#1a1a1a] border-[#2e2e2e] text-neutral-200" placeholder="123" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-neutral-500 ml-1">Nome no Cartão</label>
              <Input className="bg-[#1a1a1a] border-[#2e2e2e] text-neutral-200" placeholder="TITULAR DO CARTÃO" />
            </div>

            <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold h-12">
              Ativar Plano {selectedPlan}
            </Button>
            
            <p className="text-[10px] text-center text-neutral-600">
              Pagamento processado de forma segura pelo Stripe. Ao clicar em Ativar, você concorda com os Termos de Uso.
            </p>
          </div>

          <button 
            onClick={() => setStep('plans')}
            className="text-xs text-neutral-500 hover:text-neutral-300 w-full text-center"
          >
            ← Voltar para seleção de planos
          </button>
        </div>
      )}
    </div>
  );
}
