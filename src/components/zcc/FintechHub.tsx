'use client';

import { QrCode, CreditCard, CheckCircle, TrendingUp, Shield, Link2, Users, PieChart, Layers, DollarSign, Sparkles, Key, Wallet, Star, Target } from 'lucide-react';

interface PaymentOption {
  name: string;
  type: 'pix' | 'gateway';
  status: 'active' | 'pending';
  icon: string;
  description: string;
}

const paymentOptions: PaymentOption[] = [
  { name: 'Mercado Pago', type: 'gateway', status: 'active', icon: '🛒', description: 'PIX QR Code + Cartão — Principal' },
  { name: 'PIX (Chaves)', type: 'pix', status: 'active', icon: '⚡', description: 'CPF, Telefone, E-mail, Aleatória' },
  { name: 'Stripe', type: 'gateway', status: 'pending', icon: '💳', description: 'Internacional — Fallback' },
  { name: 'PicPay', type: 'gateway', status: 'pending', icon: '🟢', description: 'Configuração pendente' },
];

const dailyVolume = [
  { day: 'Seg', pix: 4200, card: 1800 },
  { day: 'Ter', pix: 3800, card: 2100 },
  { day: 'Qua', pix: 5100, card: 1600 },
  { day: 'Qui', pix: 6300, card: 2400 },
  { day: 'Sex', pix: 7200, card: 3200 },
  { day: 'Sáb', pix: 8500, card: 2800 },
  { day: 'Dom', pix: 5900, card: 1500 },
];

// ── Programa Beta Parceiro ──────────────────────────────────────────────────
const BETA_PROGRAM = {
  totalSlots: 100,
  currentPartners: 10, // 8 Beta Testers + 2 Early Adopters
  betaTesters: 8,
  earlyAdopters: 2,
  priceAfterBeta: 247, // R$247/mês congelado por 24 meses
  betaEndFree: '01/08/2026',
  frozenMonths: 24,
};

// ── Produtos ZEHLA (MRR SaaS) ──────────────────────────────────────────────────
const zehlaProducts = [
  {
    id: 'saas-trial',
    name: 'Zélla IA TRIAL',
    icon: '🧪',
    price: 0,
    subscribers: 0,
    description: 'Teste gratuito 14 dias — 50 msgs + Link-in-Bio',
    badgeClass: 'zcc-badge-muted',
  },
  {
    id: 'saas-lite',
    name: 'Zélla IA LITE',
    icon: '🏠',
    price: 197,
    subscribers: 0,
    description: 'IA 24/7 + 500 msgs + Link-in-Bio',
    badgeClass: 'zcc-badge',
  },
  {
    id: 'saas-pro',
    name: 'Zélla IA PRO',
    icon: '🧠',
    price: 397,
    subscribers: 0,
    description: 'Msgs ilimitadas + CRM + Treinamento + Analytics',
    badgeClass: 'zcc-badge-patina',
  },
  {
    id: 'saas-max',
    name: 'Zélla IA MAX',
    icon: '👑',
    price: 797,
    subscribers: 0,
    description: 'Tudo do PRO + Zellador + Split + SLA 99.9%',
    badgeClass: 'zcc-badge-gold',
  },
  {
    id: 'linkinbio-standalone',
    name: 'Link-in-Bio Standalone',
    icon: '🔗',
    price: 47,
    subscribers: 0,
    description: 'Link-in-Bio profissional sem Zélla IA — R$47/mês',
    badgeClass: 'zcc-badge',
  },
  {
    id: 'saas-parceiro-zella',
    name: 'PARCEIRO ZÉLLA',
    icon: '🤝',
    price: 247,
    subscribers: 0,
    description: 'PRO completo R$247/mês × 24 meses + Selo parceiro Link-in-Bio + Instagram',
    badgeClass: 'zcc-badge-gold',
  },
];

const statusConfig = {
  active: { label: 'Ativo', badgeClass: 'zcc-badge-success' },
  pending: { label: 'Pendente', badgeClass: 'zcc-badge-muted' },
};

const typeLabels = {
  pix: 'PIX',
  gateway: 'Gateway',
};

export function FintechHub() {
  const saasMRR = zehlaProducts.reduce((sum, p) => sum + (p.price * p.subscribers), 0);
  const totalPixWeekly = dailyVolume.reduce((s, d) => s + d.pix, 0);
  const totalCardWeekly = dailyVolume.reduce((s, d) => s + d.card, 0);
  const totalWeekly = totalPixWeekly + totalCardWeekly;

  return (
    <div className="space-y-5">
      {/* ── Top Stats ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="zcc-panel p-4">
          <QrCode className="w-4 h-4 mb-2" style={{ color: 'var(--zcc-kinpaku)' }} />
          <div className="zcc-stat-value">R$ {totalPixWeekly.toLocaleString('pt-BR')}</div>
          <div className="zcc-eyebrow mt-1">PIX SEMANAL</div>
        </div>
        <div className="zcc-panel p-4">
          <CreditCard className="w-4 h-4 mb-2" style={{ color: 'var(--zcc-patina)' }} />
          <div className="zcc-stat-value">R$ {totalCardWeekly.toLocaleString('pt-BR')}</div>
          <div className="zcc-eyebrow mt-1">CARTÃO SEMANAL</div>
        </div>
        <div className="zcc-panel p-4">
          <CheckCircle className="w-4 h-4 mb-2" style={{ color: 'var(--zcc-kinpaku)' }} />
          <div className="zcc-stat-value">98.4%</div>
          <div className="zcc-eyebrow mt-1">SUCESSO PAGAMENTO</div>
        </div>
        <div className="zcc-panel p-4">
          <TrendingUp className="w-4 h-4 mb-2" style={{ color: 'var(--zcc-kinpaku)' }} />
          <div className="zcc-stat-value">R$ {saasMRR.toLocaleString('pt-BR')}</div>
          <div className="zcc-eyebrow mt-1">MRR SAAS ZEHLA</div>
        </div>
      </div>

      {/* ── Produtos & MRR Breakdown ───────────────────────────────────────── */}
      <div className="zcc-panel p-5">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--zcc-champagne)' }}>
          <Layers className="w-4 h-4" style={{ color: 'var(--zcc-patina)' }} />
          Catálogo de Produtos — MRR Breakdown
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {zehlaProducts.map((product) => {
            const mrr = product.price * product.subscribers;
            return (
              <div key={product.id} className="zcc-panel p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{product.icon}</span>
                    <div>
                      <div className="text-sm font-semibold" style={{ color: 'var(--zcc-champagne)' }}>{product.name}</div>
                      <div className="text-[10px] mt-0.5" style={{ color: 'var(--zcc-text-muted)' }}>{product.description}</div>
                    </div>
                  </div>
                  <span className={product.badgeClass}>
                    {product.price === 0 ? 'GRÁTIS' : `R$${product.price}/mês`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1" style={{ color: 'var(--zcc-text-secondary)' }}>
                    <Users className="w-3 h-3" />
                    {product.subscribers} assinante{product.subscribers !== 1 ? 's' : ''}
                  </span>
                  <span
                    className="font-mono font-semibold"
                    style={{ color: mrr > 0 ? 'var(--zcc-kinpaku)' : 'var(--zcc-text-muted)' }}
                  >
                    MRR: R${mrr.toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center justify-between px-1">
          <div className="text-xs flex items-center gap-1.5" style={{ color: 'var(--zcc-text-muted)' }}>
            <DollarSign className="w-3.5 h-3.5" />
            MRR total = Soma de todos os produtos ativos
          </div>
          <div className="text-sm font-bold font-mono" style={{ color: 'var(--zcc-kinpaku)' }}>
            MRR Total: R$ {saasMRR.toLocaleString('pt-BR')}/mês
          </div>
        </div>
      </div>

      {/* ── Regras de Pricing por Nicho ──────────────────────────────────────────── */}
      <div className="zcc-panel p-5" style={{ borderColor: 'var(--zcc-kinpaku)', borderWidth: 1 }}>
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--zcc-champagne)' }}>
          <Target className="w-4 h-4" style={{ color: 'var(--zcc-kinpaku)' }} />
          Regras de Pricing por Nicho — Landing Page
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Pousadas */}
          <div className="zcc-panel p-3 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--zcc-kinpaku)' }} />
              <span className="text-xs font-bold" style={{ color: 'var(--zcc-kinpaku)' }}>Pousadas</span>
            </div>
            <div className="text-[10px] space-y-1" style={{ color: 'var(--zcc-text-secondary)' }}>
              <div><strong style={{ color: 'var(--zcc-champagne)' }}>Exibe:</strong> TRIAL + LITE + PRO + MAX</div>
              <div><strong style={{ color: 'var(--zcc-champagne)' }}>Oculta:</strong> Parceiro Zélla</div>
              <div><strong style={{ color: 'var(--zcc-champagne)' }}>PIX:</strong> LITE R$197</div>
              <div><strong style={{ color: 'var(--zcc-champagne)' }}>Cartão:</strong> PRO R$397, MAX R$797</div>
            </div>
          </div>
          {/* Anfitriões */}
          <div className="zcc-panel p-3 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--zcc-patina)' }} />
              <span className="text-xs font-bold" style={{ color: 'var(--zcc-patina)' }}>Anfitriões Airbnb</span>
            </div>
            <div className="text-[10px] space-y-1" style={{ color: 'var(--zcc-text-secondary)' }}>
              <div><strong style={{ color: 'var(--zcc-champagne)' }}>Exibe:</strong> SOMENTE PRO + MAX</div>
              <div><strong style={{ color: 'var(--zcc-champagne)' }}>Oculta:</strong> TRIAL, LITE, Parceiro</div>
              <div><strong style={{ color: 'var(--zcc-champagne)' }}>Pagamento:</strong> Exclusivo Cartão</div>
              <div className="p-1.5 rounded mt-1" style={{ background: 'rgba(59,130,246,0.08)' }}>
                <span style={{ color: 'var(--zcc-patina)' }}>⚠ Não exibir Trial/Lite para este nicho</span>
              </div>
            </div>
          </div>
          {/* Parceiro Zélla */}
          <div className="zcc-panel p-3 space-y-2" style={{ borderColor: 'rgba(212,168,67,0.3)', borderWidth: 1 }}>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#d4a843' }} />
              <span className="text-xs font-bold" style={{ color: '#d4a843' }}>Parceiro Zélla</span>
            </div>
            <div className="text-[10px] space-y-1" style={{ color: 'var(--zcc-text-secondary)' }}>
              <div><strong style={{ color: 'var(--zcc-champagne)' }}>Exibe:</strong> SOMENTE Parceiro Zélla</div>
              <div><strong style={{ color: 'var(--zcc-champagne)' }}>Oculta:</strong> TRIAL, LITE, PRO, MAX</div>
              <div><strong style={{ color: '#d4a843' }}>Preço:</strong> R$247/mês × 24 meses</div>
              <div className="p-1.5 rounded mt-1" style={{ background: 'rgba(212,168,67,0.08)' }}>
                <span style={{ color: '#d4a843' }}>🤝 Selo parceiro no Link-in-Bio + fixar no Instagram</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Programa Beta Parceiro — Primeiros 100 ──────────────────────────── */}
      <div className="zcc-panel p-5" style={{ borderColor: 'var(--zcc-kinpaku)', borderWidth: 1 }}>
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--zcc-champagne)' }}>
          <Star className="w-4 h-4" style={{ color: 'var(--zcc-kinpaku)' }} />
          Programa Beta Parceiro — Primeiros 100
          <span className="zcc-badge-gold">{BETA_PROGRAM.currentPartners}/{BETA_PROGRAM.totalSlots} vagas</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          {/* Progresso */}
          <div className="zcc-panel p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="zcc-eyebrow">PROGRESSO</div>
              <div className="text-lg font-bold" style={{ color: 'var(--zcc-kinpaku)' }}>
                {BETA_PROGRAM.currentPartners}<span className="text-sm" style={{ color: 'var(--zcc-text-muted)' }}>/{BETA_PROGRAM.totalSlots}</span>
              </div>
            </div>
            <div className="zcc-progress-track">
              <div
                className="zcc-progress-fill"
                style={{ width: `${(BETA_PROGRAM.currentPartners / BETA_PROGRAM.totalSlots) * 100}%`, backgroundColor: 'var(--zcc-kinpaku)' }}
              />
            </div>
            <div className="text-[10px]" style={{ color: 'var(--zcc-text-muted)' }}>{BETA_PROGRAM.totalSlots - BETA_PROGRAM.currentPartners} vagas restantes</div>
          </div>

          {/* Breakdown */}
          <div className="zcc-panel p-4 space-y-3">
            <div className="zcc-eyebrow">COMPOSIÇÃO ATUAL</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5" style={{ color: 'var(--zcc-kinpaku)' }}>
                  <div className="w-2 h-2" style={{ backgroundColor: 'var(--zcc-kinpaku)', borderRadius: 2 }} /> Beta Testers
                </span>
                <span className="font-mono" style={{ color: 'var(--zcc-champagne)' }}>{BETA_PROGRAM.betaTesters} pousadas</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5" style={{ color: 'var(--zcc-patina)' }}>
                  <div className="w-2 h-2" style={{ backgroundColor: 'var(--zcc-patina)', borderRadius: 2 }} /> Early Adopters
                </span>
                <span className="font-mono" style={{ color: 'var(--zcc-champagne)' }}>{BETA_PROGRAM.earlyAdopters} pousadas</span>
              </div>
            </div>
            <div className="pt-2 flex items-center justify-between text-xs" style={{ borderTop: '1px solid var(--zcc-border, rgba(255,255,255,0.06))' }}>
              <span style={{ color: 'var(--zcc-text-secondary)' }}>Total de Pousadas no Programa</span>
              <span className="font-bold" style={{ color: 'var(--zcc-champagne)' }}>{BETA_PROGRAM.currentPartners}</span>
            </div>
          </div>

          {/* Regras */}
          <div className="zcc-panel p-4 space-y-2">
            <div className="zcc-eyebrow">REGRAS DO PROGRAMA</div>
            <ul className="text-[11px] space-y-1.5" style={{ color: 'var(--zcc-text-secondary)' }}>
              <li className="flex items-start gap-1.5"><span style={{ color: 'var(--zcc-kinpaku)' }} className="mt-0.5">{'\u2192'}</span> Grátis até {BETA_PROGRAM.betaEndFree}</li>
              <li className="flex items-start gap-1.5"><span style={{ color: 'var(--zcc-kinpaku)' }} className="mt-0.5">{'\u2192'}</span> Depois: R${BETA_PROGRAM.priceAfterBeta}/mês congelado por {BETA_PROGRAM.frozenMonths} meses</li>
              <li className="flex items-start gap-1.5"><span style={{ color: 'var(--zcc-kinpaku)' }} className="mt-0.5">{'\u2192'}</span> Recursos PRO completos (vs R$397/mês público)</li>
              <li className="flex items-start gap-1.5"><span style={{ color: 'var(--zcc-kinpaku)' }} className="mt-0.5">{'\u2192'}</span> Economia de R$150/mês durante 24 meses (R$3.600 total)</li>
            </ul>
          </div>
        </div>

        {/* MRR Projetado */}
        <div className="zcc-panel p-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            <Target className="w-3.5 h-3.5" style={{ color: 'var(--zcc-kinpaku)' }} />
            <span style={{ color: 'var(--zcc-text-secondary)' }}>MRR Beta (atual, grátis):</span>
            <span className="font-mono font-bold" style={{ color: 'var(--zcc-text-muted)' }}>R$ 0</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <TrendingUp className="w-3.5 h-3.5" style={{ color: 'var(--zcc-patina)' }} />
            <span style={{ color: 'var(--zcc-text-secondary)' }}>MRR após {BETA_PROGRAM.betaEndFree} ({BETA_PROGRAM.currentPartners} x R${BETA_PROGRAM.priceAfterBeta}):</span>
            <span className="font-mono font-bold" style={{ color: 'var(--zcc-patina)' }}>R$ {(BETA_PROGRAM.currentPartners * BETA_PROGRAM.priceAfterBeta).toLocaleString('pt-BR')}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Star className="w-3.5 h-3.5" style={{ color: 'var(--zcc-kinpaku)' }} />
            <span style={{ color: 'var(--zcc-text-secondary)' }}>MRR com 100 parceiros:</span>
            <span className="font-mono font-bold" style={{ color: 'var(--zcc-kinpaku)' }}>R$ {(BETA_PROGRAM.totalSlots * BETA_PROGRAM.priceAfterBeta).toLocaleString('pt-BR')}</span>
          </div>
        </div>
      </div>

      {/* ── Link-in-Bio R$47 — Produto Destaque ────────────────────────────── */}
      <div className="zcc-panel p-5" style={{ borderColor: 'var(--zcc-patina)', borderWidth: 1 }}>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--zcc-champagne)' }}>
          <Link2 className="w-4 h-4" style={{ color: 'var(--zcc-patina)' }} />
          Link-in-Bio Standalone — R$47,00/mês
          <span className="zcc-badge-patina">NOVO</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="zcc-panel p-3 space-y-2">
            <div className="zcc-eyebrow">PREÇO</div>
            <div className="text-2xl font-bold" style={{ color: 'var(--zcc-patina)' }}>R$ 47<span className="text-sm" style={{ color: 'var(--zcc-text-muted)' }}>,00/mês</span></div>
            <div className="text-[10px]" style={{ color: 'var(--zcc-text-muted)' }}>Sem fidelidade — cancele quando quiser</div>
          </div>
          <div className="zcc-panel p-3 space-y-2">
            <div className="zcc-eyebrow">O QUE INCLUI</div>
            <ul className="text-[11px] space-y-1" style={{ color: 'var(--zcc-text-secondary)' }}>
              <li className="flex items-center gap-1.5"><Sparkles className="w-3 h-3" style={{ color: 'var(--zcc-patina)' }} /> Página profissional seusella.com/{'{slug}'}</li>
              <li className="flex items-center gap-1.5"><Link2 className="w-3 h-3" style={{ color: 'var(--zcc-patina)' }} /> Links ilimitados (reservas, redes, WhatsApp)</li>
              <li className="flex items-center gap-1.5"><PieChart className="w-3 h-3" style={{ color: 'var(--zcc-patina)' }} /> Analytics de cliques e visitantes</li>
              <li className="flex items-center gap-1.5"><Layers className="w-3 h-3" style={{ color: 'var(--zcc-patina)' }} /> Personalização de cores e layout</li>
            </ul>
          </div>
          <div className="zcc-panel p-3 space-y-2">
            <div className="zcc-eyebrow">UPSELL PARA ZÉLLA IA</div>
            <div className="text-[11px] leading-relaxed" style={{ color: 'var(--zcc-text-secondary)' }}>
              Clientes no Link-in-Bio Standalone podem fazer upgrade a qualquer momento para LITE (R$197/mês) ou PRO (R$397/mês) e ganhar a IA completa + mensagens automatizadas no WhatsApp.
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="zcc-badge">LITE R$197</span>
              <span style={{ color: 'var(--zcc-text-muted)' }}>→</span>
              <span className="zcc-badge-patina">PRO R$397</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Gateways de Pagamento ──────────────────────────────────────────── */}
      <div className="zcc-panel p-5">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--zcc-champagne)' }}>
          <Wallet className="w-4 h-4" style={{ color: 'var(--zcc-patina)' }} />
          Gateways de Pagamento
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {paymentOptions.map((option) => {
            const cfg = statusConfig[option.status];
            return (
              <div key={option.name} className="zcc-panel p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{option.icon}</span>
                    <div>
                      <div className="text-sm font-medium" style={{ color: 'var(--zcc-champagne)' }}>{option.name}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px]" style={{ color: 'var(--zcc-text-secondary)' }}>{typeLabels[option.type]}</span>
                        <span className="text-[10px]" style={{ color: 'var(--zcc-text-muted)' }}>•</span>
                        <span className="text-[10px]" style={{ color: 'var(--zcc-text-muted)' }}>{option.description}</span>
                      </div>
                    </div>
                  </div>
                  <span className={cfg.badgeClass}>{cfg.label}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 text-[10px] flex items-center gap-1" style={{ color: 'var(--zcc-text-muted)' }}>
          <Shield className="w-3 h-3" />
          {paymentOptions.filter(o => o.status === 'active').length} de {paymentOptions.length} integrações ativas. Assinaturas SaaS via Mercado Pago. Link-in-Bio R$47/mês via PIX ou cartão.
        </div>
      </div>

      {/* ── Chaves PIX ─────────────────────────────────────────────────────── */}
      <div className="zcc-panel p-5">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--zcc-champagne)' }}>
          <Key className="w-4 h-4" style={{ color: 'var(--zcc-kinpaku)' }} />
          Chaves PIX Cadastradas
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { type: 'CPF', value: '***.***.***-**' },
            { type: 'Telefone', value: '(**) *****-****' },
            { type: 'E-mail', value: 'f***@zehla.com.br' },
            { type: 'Aleatória', value: 'a1b2c3d4-e5f6-...-****' },
          ].map((key, i) => (
            <div key={i} className="zcc-panel p-3">
              <div className="zcc-eyebrow mb-1">{key.type.toUpperCase()}</div>
              <div className="text-sm font-mono" style={{ color: 'var(--zcc-champagne)' }}>{key.value}</div>
              <div className="mt-1.5">
                <span className="zcc-badge-success">Ativa</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-[10px] flex items-center gap-1" style={{ color: 'var(--zcc-text-muted)' }}>
          <Shield className="w-3 h-3" />
          4 chaves PIX ativas. Recebimento instantâneo via Mercado Pago QR Code.
        </div>
      </div>

      {/* ── Split Rules ───────────────────────────────────────────────────── */}
      <div className="zcc-panel p-5">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--zcc-champagne)' }}>
          <PieChart className="w-4 h-4" style={{ color: 'var(--zcc-patina)' }} />
          Regras de Split — Transações de Hóspedes
        </h3>
        <div className="space-y-2">
          {[
            { recipient: 'Pousada', percent: 85, amount: 'R$ 12.070,00', color: 'var(--zcc-kinpaku)' },
            { recipient: 'ZEHLA SaaS', percent: 5, amount: 'R$ 710,00', color: 'var(--zcc-patina)' },
            { recipient: 'Mercado Pago Gateway', percent: 2.99, amount: 'R$ 424,60', color: '#06b6d4' },
            { recipient: 'IA Processing Fee', percent: 3.01, amount: 'R$ 427,04', color: 'var(--zcc-kinpaku)' },
            { recipient: 'Tributos ISS/PIS/COFINS', percent: 4.0, amount: 'R$ 568,00', color: '#ef4444' },
          ].map((rule, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-1.5 h-8" style={{ backgroundColor: rule.color, borderRadius: 2 }} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: 'var(--zcc-champagne)' }}>{rule.recipient}</span>
                  <span className="text-sm font-mono" style={{ color: 'var(--zcc-champagne)' }}>{rule.amount}</span>
                </div>
                <div className="zcc-progress-track mt-1" style={{ height: 4 }}>
                  <div
                    className="zcc-progress-fill"
                    style={{ width: `${rule.percent}%`, backgroundColor: rule.color }}
                  />
                </div>
              </div>
              <span className="text-xs font-mono w-12 text-right" style={{ color: 'var(--zcc-text-secondary)' }}>{rule.percent}%</span>
            </div>
          ))}
        </div>
        <div className="mt-3 text-[10px]" style={{ color: 'var(--zcc-text-muted)' }}>
          * Split aplicado sobre transações de reservas de hóspedes via Mercado Pago. Assinaturas SaaS (LITE R$197, PRO R$397, MAX R$797, Parceiro Zélla R$247/mês × 24 meses, Link-in-Bio R$47) são cobradas diretamente.
        </div>
      </div>

      {/* ── Weekly volume table ───────────────────────────────────────────── */}
      <div className="zcc-panel p-5">
        <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--zcc-champagne)' }}>Volume Semanal — Transações de Hóspedes</h3>
        <div className="overflow-x-auto zehla-scroll-x">
          <table className="zcc-table w-full text-sm">
            <thead>
              <tr>
                <th className="text-left px-3 py-2">Dia</th>
                <th className="text-right px-3 py-2">PIX</th>
                <th className="text-right px-3 py-2">Cartão</th>
                <th className="text-right px-3 py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {dailyVolume.map((d) => (
                <tr key={d.day}>
                  <td className="px-3 py-2" style={{ color: 'var(--zcc-champagne)' }}>{d.day}</td>
                  <td className="px-3 py-2 text-right font-mono" style={{ color: 'var(--zcc-kinpaku)' }}>R$ {d.pix.toLocaleString('pt-BR')}</td>
                  <td className="px-3 py-2 text-right font-mono" style={{ color: 'var(--zcc-patina)' }}>R$ {d.card.toLocaleString('pt-BR')}</td>
                  <td className="px-3 py-2 text-right font-mono font-semibold" style={{ color: 'var(--zcc-champagne)' }}>R$ {(d.pix + d.card).toLocaleString('pt-BR')}</td>
                </tr>
              ))}
              <tr style={{ borderTop: '1px solid var(--zcc-border, rgba(255,255,255,0.08))' }}>
                <td className="px-3 py-2 font-semibold" style={{ color: 'var(--zcc-champagne)' }}>Total</td>
                <td className="px-3 py-2 text-right font-mono font-semibold" style={{ color: 'var(--zcc-kinpaku)' }}>R$ {totalPixWeekly.toLocaleString('pt-BR')}</td>
                <td className="px-3 py-2 text-right font-mono font-semibold" style={{ color: 'var(--zcc-patina)' }}>R$ {totalCardWeekly.toLocaleString('pt-BR')}</td>
                <td className="px-3 py-2 text-right font-mono font-bold" style={{ color: 'var(--zcc-champagne)' }}>R$ {totalWeekly.toLocaleString('pt-BR')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}