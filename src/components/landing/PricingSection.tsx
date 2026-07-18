'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Check,
  X,
  Crown,
  Sparkles,
  Rocket,
  Star,
  Zap,
  CreditCard,
  QrCode,
  Shield,
  Gift,
  Loader2,
  Building2,
} from 'lucide-react';
import { useNiche } from '@/contexts/NicheContext';
import { getNicheContent } from '@/data/niche-content';

type PaymentMode = 'pix' | 'cartao';

const plans = [
  {
    id: 'gratuito',
    name: 'Gratuito',
    nameShort: 'Free',
    badge: 'Teste Grátis',
    badgeColor: 'bg-neutral-500/20 text-neutral-300 border-neutral-500/30',
    icon: Zap,
    iconBg: 'from-neutral-400/20 to-neutral-600/10',
    iconColor: 'text-neutral-400',
    pricePix: 0,
    priceCartao: 0,
    priceLabel: 'Grátis',
    desc: 'Comece a testar o Zélla na sua pousada sem custo nenhum. Veja a IA atendendo seus hóspedes por 7 dias.',
    descAnfitrioes: 'Comece a testar o Zélla no seu imóvel sem custo nenhum. Veja a IA atendendo seus hóspedes por 7 dias.',
    cta: 'Começar Trial Grátis',
    ctaStyle: 'border border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]',
    popular: false,
    idealPara: '1 imóvel',
    features: [
      { text: '5 hospedes atendidos dentro dos 7 dias', included: true },
      { text: 'Link-in-bio basico', included: true },
      { text: '100 mensagens nos 7 dias', included: true },
      { text: '7 dias de teste gratis', included: true },
      { text: 'Dashboard basico', included: true },
      { text: 'Marca d\'agua ZELLA obrigatoria', included: true },
      { text: 'Atendimento 24h nos 7 dias', included: true },
      { text: 'IA respondendo seus hóspedes 24h', included: true },
    ],
  },
  {
    id: 'lite',
    name: 'LITE',
    nameShort: 'Lite',
    badge: 'Mais Escolhido',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    icon: Rocket,
    iconBg: 'from-neutral-500/20 to-neutral-600/10',
    iconColor: 'text-neutral-400',
    pricePix: 197,
    priceCartao: 247,
    priceLabel: 'R$197',
    desc: 'Tudo que sua pousada precisa para vender mais pelo WhatsApp. IA 24/7, PIX integrado e dashboard completo.',
    descAnfitrioes: 'Tudo que você precisa para atender hóspedes pelo WhatsApp. IA 24/7, check-in virtual e dashboard completo.',
    cta: 'Assinar LITE via PIX',
    ctaStyle: 'border border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]',
    popular: false,
    idealPara: '1–2 imóveis',
    features: [
      { text: '50 hospedes atendidos por mes', included: true },
      { text: '500 mensagens mensais', included: true },
      { text: 'Recarga de 250 mensagens por R$97 (se precisar)', included: true },
      { text: 'WhatsApp IA 24/7 com tom personalizado', included: true },
      { text: 'Checkout PIX integrado (Mercado Pago)', included: true },
      { text: 'Dashboard de metricas completo', included: true },
      { text: 'Relatorios semanais por e-mail', included: true },
      { text: 'Sem marca d\'agua ZELLA', included: true },
      { text: 'Respostas otimizadas para economia', included: true },
    ],
  },
  {
    id: 'pro',
    name: 'PRO',
    nameShort: 'Pro',
    badge: 'Mais Popular',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    icon: Star,
    iconBg: 'from-emerald-500/20 to-emerald-900/10',
    iconColor: 'text-emerald-400',
    pricePix: 397,
    priceCartao: 397,
    priceLabel: 'R$397',
    onlyCard: true,
    desc: 'Para pousadas que querem crescer sem limites. Mensagens ilimitadas, campanhas automatizadas e suporte prioritário.',
    descAnfitrioes: 'Para anfitriões que querem escalar sem limites. Mensagens ilimitadas, importação de anúncios e suporte prioritário.',
    cta: 'Assinar PRO via Cartão',
    ctaStyle: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-400 hover:to-emerald-500 shadow-lg shadow-emerald-500/25',
    popular: true,
    idealPara: '3–5 imóveis',
    features: [
      { text: 'Hóspedes ilimitados', included: true },
      { text: 'Link-in-bio profissional liberado', included: true },
      { text: 'Mensagens ilimitadas (sem recargas)', included: true },
      { text: 'WhatsApp IA com tom 100% personalizado', included: true },
      { text: 'Checkout Cartão integrado', included: true },
      { text: 'Dashboard completo', included: true },
      { text: 'Sugestoes de precos inteligentes', included: true },
      { text: 'Campanhas automatizadas', included: true },
      { text: 'Analise de sentimento', included: true },
      { text: 'Suporte prioritario', included: true },
      { text: 'Economia inteligente nas mensagens', included: true },
    ],
  },
  {
    id: 'max',
    name: 'MAX',
    nameShort: 'Max',
    badge: 'High End',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    icon: Crown,
    iconBg: 'from-amber-500/20 to-amber-900/10',
    iconColor: 'text-amber-400',
    pricePix: 797,
    priceCartao: 797,
    priceLabel: 'R$797',
    onlyCard: true,
    desc: 'Para redes e pousadas de alto padrão. Suporte VIP, consultoria personalizada e recursos exclusivos.',
    descAnfitrioes: 'Para portfólios grandes e imóveis de alto padrão. Suporte VIP, consultoria personalizada e recursos exclusivos.',
    cta: 'Assinar MAX via Cartão',
    ctaStyle: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-400 hover:to-amber-500 shadow-lg shadow-amber-500/25',
    popular: false,
    idealPara: '6+ imóveis',
    features: [
      { text: 'Tudo do plano PRO', included: true },
      { text: 'Link-in-bio profissional liberado', included: true },
      { text: 'Mensagens ilimitadas (sem recargas)', included: true },
      { text: 'Ajuste de preços inteligente avançado', included: true },
      { text: 'Dashboard completo', included: true },
      { text: 'Split de pagamentos automático', included: true },
      { text: 'Atendimentos 24 por 7', included: true },
      { text: 'Integrações customizadas', included: true },
      { text: 'Gerente de conta IA Dedicado para Treinamento', included: true },
      { text: 'Consultoria mensal com a equipe', included: true },
      { text: 'Onboarding personalizado', included: true },
      { text: 'SLA garantido 99.9%', included: true },
      { text: 'Treinamento mensal com equipe', included: true },
    ],
  },
  {
    id: 'parceiro',
    name: 'PARCEIRO PRO',
    nameShort: 'Parceiro PRO',
    badge: 'Melhor Custo-Benefício',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    icon: Crown,
    iconBg: 'from-amber-500/20 to-amber-900/10',
    iconColor: 'text-amber-400',
    pricePix: 297,
    priceCartao: 297,
    priceLabel: 'R$297',
    onlyCard: false,
    isParceiro: true,
    desc: 'Plano PRO completo por R$297/mês — R$100 a menos que o regular. Preço congelado por 24 meses + selo exclusivo de parceiro. Hóspedes e mensagens ilimitados.',
    descAnfitrioes: 'Plano PRO completo por R$297/mês — R$100 a menos que o regular. Preço congelado por 24 meses + selo exclusivo de parceiro. Hóspedes e mensagens ilimitados.',
    cta: 'Garantir Vaga de Parceiro',
    ctaStyle: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-400 hover:to-amber-500 shadow-lg shadow-amber-500/30',
    popular: false,
    idealPara: '1–5 imóveis',
    features: [
      { text: 'Plano PRO completo — R$297/mês', included: true },
      { text: 'Preço congelado por 24 meses', included: true },
      { text: 'Selo exclusivo de Parceiro Zélla', included: true },
      { text: 'Hóspedes ilimitados', included: true },
      { text: 'Mensagens ilimitadas (sem recargas)', included: true },
      { text: 'WhatsApp IA com tom 100% personalizado', included: true },
      { text: 'Checkout PIX e Cartão integrados', included: true },
      { text: 'Dashboard completo com campanhas', included: true },
      { text: 'Sugestões de preços inteligentes', included: true },
      { text: 'Análise de sentimento', included: true },
      { text: 'Suporte prioritário', included: true },
      { text: 'Economia de R$100/mês vs. PRO regular', included: true },
    ],
  },
];

const easeOut: [number, number, number, number] = [0.2, 0.8, 0.2, 1];

export function PricingSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('pix');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const router = useRouter();
  const { niche, isAnfitrioes, isParceiro } = useNiche();
  const content = getNicheContent(niche);

  const handleSubscribe = async (planId: string, forcedPaymentMethod?: string) => {
    setLoadingPlan(planId);

    try {
      // Get user info from a simple prompt (in production, this would be a modal form)
      const email = prompt('Digite seu e-mail para continuar:');
      const name = prompt('Digite seu nome completo:');

      if (!email || !name) {
        alert('Por favor, preencha todos os campos.');
        setLoadingPlan(null);
        return;
      }

      const response = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          planType: planId,
          paymentMethod: forcedPaymentMethod || paymentMode,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.redirectUrl) {
          router.push(data.redirectUrl);
        } else if (data.checkoutUrl) {
          router.push(data.checkoutUrl);
        }
      } else {
        alert('Erro ao criar checkout: ' + (data.error || 'Unknown error'));
        setLoadingPlan(null);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Erro ao processar sua solicitação. Tente novamente.');
      setLoadingPlan(null);
    }
  };

  return (
    <section ref={ref} id="precos" className="parallax-section parallax-dark py-28 sm:py-36 lg:py-44">
      <div className="relative z-10 max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
            <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400 text-xs font-medium">Planos & Preços</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-6">
            Escolha o plano ideal
            <br />
            <span className="text-emerald-400 font-bold">
              {niche === 'pousadas' ? 'para sua pousada' : niche === 'anfitrioes' ? 'para seus imóveis' : 'para seus ganhos'}
            </span>
          </h2>
          <p className="text-neutral-400 text-lg max-w-xl mx-auto mb-4">
            Comece grátis por 7 dias. Sem cartão de crédito, sem compromisso. Cancele quando quiser.
          </p>

          {/* Pricing Focus */}
          <AnimatePresence mode="wait">
            <motion.p
              key={niche}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: easeOut }}
              className="text-emerald-400/80 text-sm max-w-lg mx-auto mb-10 flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                Foco em <strong className="text-emerald-400">{content.pricing.focusLabel}</strong> — {content.pricing.focusDesc}
              </span>
            </motion.p>
          </AnimatePresence>

          {/* Payment Toggle */}
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <button
              onClick={() => setPaymentMode('pix')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${
                paymentMode === 'pix'
                  ? 'toggle-pix-active shadow-lg shadow-emerald-500/20'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <QrCode className="w-4 h-4" />
              PIX
              <span className="text-[10px] opacity-70">Economize</span>
            </button>
            <button
              onClick={() => setPaymentMode('cartao')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${
                paymentMode === 'cartao'
                  ? 'toggle-card-active shadow-lg'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Cartão
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards Grid */}
        <div className={`pricing-grid grid gap-6 mb-20 ${isParceiro ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3 max-w-5xl mx-auto' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4'}`}>
          {plans.filter(p => isParceiro ? p.id === 'parceiro' || p.id === 'lite' || p.id === 'pro' : p.id !== 'parceiro').map((plan, i) => {
            const activePaymentMethod = plan.onlyCard ? 'cartao' : paymentMode;
            const price = activePaymentMethod === 'pix' ? plan.pricePix : plan.priceCartao;
            const savings = plan.priceCartao > 0 && !plan.onlyCard ? plan.priceCartao - plan.pricePix : 0;
            const Icon = plan.icon;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className={`relative rounded-2xl p-[1px] transition-all duration-300 ${
                  plan.popular
                    ? 'pricing-glow-emerald'
                    : plan.id === 'max'
                    ? 'pricing-glow-amber'
                    : ''
                }`}
                style={{
                  background: plan.popular
                    ? 'linear-gradient(135deg, #10B981, #8B5CF6, #10B981)'
                    : plan.id === 'max'
                    ? 'linear-gradient(135deg, #F59E0B, #EF4444, #F59E0B)'
                    : plan.id === 'parceiro'
                    ? 'linear-gradient(135deg, #F59E0B, #D97706, #F59E0B)'
                    : 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
                }}
              >
                <div className="relative rounded-2xl bg-[#0a0a0a] p-7 h-full flex flex-col">
                  {/* Popular badge */}
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-500/30">
                      Mais Popular
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${plan.iconBg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${plan.iconColor}`} />
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${plan.badgeColor}`}>
                      {plan.badge}
                    </span>
                  </div>

                  {/* Plan Details */}
                  <h3 className="text-white font-bold text-xl mb-2">{plan.name}</h3>
                  <p className="text-neutral-400 text-xs mb-2 leading-relaxed">
                    {isAnfitrioes ? plan.descAnfitrioes : plan.desc}
                  </p>

                  {/* Ideal para badge (Anfitriões only) */}
                  {isAnfitrioes && (
                    <div className="flex items-center gap-1.5 mb-4">
                      <Building2 className="w-3 h-3 text-blue-400" />
                      <span className="text-[10px] font-semibold text-blue-300 bg-blue-500/15 border border-blue-500/25 px-2 py-0.5 rounded-full">
                        Ideal para {plan.idealPara}
                      </span>
                    </div>
                  )}

                  {/* Price */}
                  <div className={isAnfitrioes ? 'mb-4' : 'mb-6'}>
                    {price === 0 ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold text-white">Grátis</span>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm text-neutral-400">R$</span>
                          <span className="text-4xl font-extrabold text-white">{price}</span>
                          <span className="text-neutral-500 text-sm">/mês</span>
                        </div>
                        {(plan as Record<string, unknown>).isParceiro && (
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-amber-400 text-xs font-semibold">
                              Congelado por 24 meses • Selo de Parceiro
                            </span>
                          </div>
                        )}
                        {!(plan as Record<string, unknown>).isParceiro && activePaymentMethod === 'pix' && savings > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-neutral-600 text-xs line-through">R${plan.priceCartao}/mês</span>
                            <span className="text-emerald-400 text-xs font-medium">
                              Economia de R${savings}/mês
                            </span>
                          </div>
                        )}
                        {plan.onlyCard && (
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-amber-400/80 text-[9px] font-semibold uppercase tracking-wider bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                              Exclusivo no Cartão
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => handleSubscribe(plan.id, activePaymentMethod)}
                    disabled={loadingPlan === plan.id}
                    className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 ${plan.ctaStyle} ${loadingPlan === plan.id ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {loadingPlan === plan.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processando...
                      </>
                    ) : price === 0 ? (
                      'Começar Trial Grátis'
                    ) : (
                      `Assinar ${plan.nameShort} via ${activePaymentMethod === 'pix' ? 'PIX' : 'Cartão'}`
                    )}
                  </button>

                  {/* Divider */}
                  <div className="h-px bg-white/[0.06] my-6" />

                  {/* Features */}
                  <div className="flex-1 space-y-3">
                    {plan.features.map((feature) => (
                      <div key={feature.text} className="flex items-start gap-2">
                        {feature.included ? (
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-4 h-4 text-neutral-700 shrink-0 mt-0.5" />
                        )}
                        <span
                          className={`text-xs leading-relaxed ${
                            feature.included ? 'text-neutral-300' : 'text-neutral-600'
                          }`}
                        >
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Payment methods info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex flex-wrap items-center justify-center gap-6 text-neutral-500 text-xs"
        >
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500/50" />
            <span>Gateway: Mercado Pago (PIX 0,99%)</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-neutral-600" />
            <span>Stripe para cartões internacionais (fallback)</span>
          </div>
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-amber-500/50" />
            <span>Cancele quando quiser — sem multa</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
