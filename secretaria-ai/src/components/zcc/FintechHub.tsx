'use client';

import { QrCode, CreditCard, CheckCircle, ArrowDownUp, TrendingUp, Shield, Building } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PaymentOption {
  name: string;
  type: 'pix' | 'bank' | 'gateway';
  status: 'active' | 'pending';
  icon: string;
  description: string;
}

const paymentOptions: PaymentOption[] = [
  { name: 'PIX', type: 'pix', status: 'active', icon: '⚡', description: 'Qualquer banco — Instantâneo' },
  { name: 'Banco do Brasil', type: 'bank', status: 'active', icon: '🏦', description: 'Conta BB — PIX e TED' },
  { name: 'Itaú', type: 'bank', status: 'active', icon: '🏛️', description: 'Conta Itaú — PIX e TED' },
  { name: 'Bradesco', type: 'bank', status: 'pending', icon: '💳', description: 'Configuração pendente' },
  { name: 'Santander', type: 'bank', status: 'pending', icon: '🏦', description: 'Configuração pendente' },
  { name: 'Caixa Econômica', type: 'bank', status: 'pending', icon: '🏛️', description: 'Configuração pendente' },
  { name: 'Nubank', type: 'bank', status: 'active', icon: '💜', description: 'Conta Nu — PIX automático' },
  { name: 'Mercado Pago', type: 'gateway', status: 'pending', icon: '🛒', description: 'Configuração pendente' },
  { name: 'PagSeguro', type: 'gateway', status: 'pending', icon: '🔒', description: 'Configuração pendente' },
  { name: 'Pagar.me', type: 'gateway', status: 'active', icon: '💳', description: 'Gateway ativo — Split configurado' },
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

const statusConfig = {
  active: { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', label: 'Ativo' },
  pending: { color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', label: 'Pendente' },
};

const typeLabels = {
  pix: 'PIX Direto',
  bank: 'Banco',
  gateway: 'Gateway',
};

export function FintechHub() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <QrCode className="w-5 h-5 text-emerald-400 mb-2" />
          <div className="text-xl font-bold text-neutral-200">R$ 41.000</div>
          <div className="text-xs text-neutral-500">PIX Semanal</div>
        </div>
        <div className="glass-card p-4">
          <CreditCard className="w-5 h-5 text-purple-400 mb-2" />
          <div className="text-xl font-bold text-neutral-200">R$ 15.400</div>
          <div className="text-xs text-neutral-500">Cartão Semanal</div>
        </div>
        <div className="glass-card p-4">
          <CheckCircle className="w-5 h-5 text-cyan-400 mb-2" />
          <div className="text-xl font-bold text-neutral-200">98.4%</div>
          <div className="text-xs text-neutral-500">Sucesso Pagamento</div>
        </div>
        <div className="glass-card p-4">
          <TrendingUp className="w-5 h-5 text-amber-400 mb-2" />
          <div className="text-xl font-bold text-neutral-200">R$ 2.340</div>
          <div className="text-xs text-neutral-500">Receita Platforma (mês)</div>
        </div>
      </div>

      {/* Payment Options — All Banks */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-neutral-300 mb-4 flex items-center gap-2">
          <Building className="w-4 h-4 text-emerald-400" />
          Opções de Pagamento — Bancos & Gateways
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {paymentOptions.map((option) => {
            const cfg = statusConfig[option.status];
            return (
              <div key={option.name} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{option.icon}</span>
                  <div>
                    <div className="text-sm font-medium text-neutral-200">{option.name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-neutral-500">{typeLabels[option.type]}</span>
                      <span className="text-[10px] text-neutral-600">•</span>
                      <span className="text-[10px] text-neutral-600">{option.description}</span>
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className={`border-0 text-[10px] ${cfg.color}`}>
                  {cfg.label}
                </Badge>
              </div>
            );
          })}
        </div>
        <div className="mt-3 text-[10px] text-neutral-600 flex items-center gap-1">
          <Shield className="w-3 h-3" />
          {paymentOptions.filter(o => o.status === 'active').length} de {paymentOptions.length} integrações ativas. PIX via QR Code disponível para qualquer banco.
        </div>
      </div>

      {/* Pagar.me Status */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-neutral-300 mb-4 flex items-center gap-2">
          <ArrowDownUp className="w-4 h-4 text-emerald-400" />
          Gateway Pagar.me — Status
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {[
            { label: 'Status', value: 'Conectado', ok: true },
            { label: 'API Key', value: 'sk_live_***7f2d', ok: true },
            { label: 'Webhook', value: 'Ativo', ok: true },
            { label: 'Split Config', value: '4 regras', ok: true },
          ].map((item, i) => (
            <div key={i} className="bg-white/[0.02] rounded-lg p-3">
              <div className="text-[10px] text-neutral-500">{item.label}</div>
              <div className={`text-xs font-mono ${item.ok ? 'text-emerald-400' : 'text-red-400'}`}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Split Rules */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-neutral-300 mb-4">Regras de Split</h3>
        <div className="space-y-2">
          {[
            { recipient: 'Pousada', percent: 85, amount: 'R$ 12.070,00', color: 'bg-purple-500' },
            { recipient: 'ZEHLA SaaS', percent: 5, amount: 'R$ 710,00', color: 'bg-emerald-500' },
            { recipient: 'Pagar.me Gateway', percent: 2.99, amount: 'R$ 424,60', color: 'bg-cyan-500' },
            { recipient: 'IA Processing Fee', percent: 3.01, amount: 'R$ 427,04', color: 'bg-amber-500' },
            { recipient: 'Tributos ISS/PIS/COFINS', percent: 4.0, amount: 'R$ 568,00', color: 'bg-red-500' },
          ].map((rule, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-2 h-8 rounded-full ${rule.color}`} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-300">{rule.recipient}</span>
                  <span className="text-sm font-mono text-neutral-200">{rule.amount}</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1 mt-1">
                  <div className="h-1 rounded-full" style={{ width: `${rule.percent}%`, backgroundColor: rule.color.replace('bg-', '') }} />
                </div>
              </div>
              <span className="text-xs font-mono text-neutral-500 w-12 text-right">{rule.percent}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly volume table */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-neutral-300 mb-4">Volume Semanal</h3>
        <div className="overflow-x-auto zehla-scroll-x">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs text-neutral-500 px-3 py-2">Dia</th>
                <th className="text-right text-xs text-neutral-500 px-3 py-2">PIX</th>
                <th className="text-right text-xs text-neutral-500 px-3 py-2">Cartão</th>
                <th className="text-right text-xs text-neutral-500 px-3 py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {dailyVolume.map((d) => (
                <tr key={d.day} className="border-b border-white/[0.03]">
                  <td className="px-3 py-2 text-neutral-300">{d.day}</td>
                  <td className="px-3 py-2 text-right text-emerald-400 font-mono">R$ {d.pix.toLocaleString('pt-BR')}</td>
                  <td className="px-3 py-2 text-right text-purple-400 font-mono">R$ {d.card.toLocaleString('pt-BR')}</td>
                  <td className="px-3 py-2 text-right text-neutral-200 font-mono font-semibold">R$ {(d.pix + d.card).toLocaleString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
