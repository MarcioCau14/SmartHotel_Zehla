'use client';

import { QrCode, ArrowDownUp, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const pixTransactions = [
  { id: '1', guest: 'Ana Carolina Silva', amount: 2140.00, method: 'pix', status: 'confirmed', time: '14:23', property: 'Pousada Maravilha' },
  { id: '2', guest: 'Pedro Henrique Santos', amount: 1680.00, method: 'pix', status: 'confirmed', time: '13:45', property: 'Pousada Vila Floripa' },
  { id: '3', guest: 'Maria F. Oliveira', amount: 3220.00, method: 'pix', status: 'pending', time: '13:12', property: 'Pousada do Ouro' },
  { id: '4', guest: 'Lucas G. Costa', amount: 980.00, method: 'credit_card', status: 'confirmed', time: '12:30', property: 'Pousada Chapada' },
  { id: '5', guest: 'Juliana B. Pereira', amount: 4500.00, method: 'pix', status: 'failed', time: '11:55', property: 'Pousada Bela Jeri' },
];

const splitConfig = [
  { label: 'ZEHLA Plataforma', percent: 5, color: 'text-[#FF5500]' },
  { label: 'Pousada', percent: 85, color: 'text-[#FF5500]' },
  { label: 'Gateway (Pagar.me)', percent: 2.99, color: 'text-[#FF5500]' },
  { label: 'IA Processing', percent: 3.01, color: 'text-[#FF5500]' },
];

export function PaymentPanel() {
  return (
    <div className="space-y-6">
      {/* Pagar.me Integration */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#FF5500]/10">
              <QrCode className="w-5 h-5 text-[#FF5500]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#efefef]">PIX & Pagamentos</h3>
              <p className="text-xs text-[#4d4d4d]">Integração Pagar.me</p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 text-xs text-[#FF5500]">
            <CheckCircle className="w-4 h-4" />
            Conectado
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="bg-white/[0.02] rounded-lg p-3">
            <div className="text-xs text-[#4d4d4d]">PIX Hoje</div>
            <div className="text-sm font-bold text-[#FF5500]">R$ 12.520</div>
          </div>
          <div className="bg-white/[0.02] rounded-lg p-3">
            <div className="text-xs text-[#4d4d4d]">Cartão Hoje</div>
            <div className="text-sm font-bold text-[#FF5500]">R$ 4.890</div>
          </div>
          <div className="bg-white/[0.02] rounded-lg p-3">
            <div className="text-xs text-[#4d4d4d]">Recebido Mês</div>
            <div className="text-sm font-bold text-[#b4b4b4]">R$ 68.900</div>
          </div>
          <div className="bg-white/[0.02] rounded-lg p-3">
            <div className="text-xs text-[#4d4d4d]">Chargeback</div>
            <div className="text-sm font-bold text-red-400">0.0%</div>
          </div>
        </div>

        {/* Split config */}
        <div className="text-xs font-medium text-[#898989] mb-2">Split de Pagamento</div>
        <div className="space-y-2">
          {splitConfig.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="text-[#4d4d4d]">{item.label}</span>
              <span className={`font-mono font-semibold ${item.color}`}>{item.percent}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-[#b4b4b4] mb-4 flex items-center gap-2">
          <ArrowDownUp className="w-4 h-4" />
          Transações Recentes
        </h3>
        <div className="space-y-2">
          {pixTransactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
              <div>
                <div className="text-sm text-[#efefef]">{tx.guest}</div>
                <div className="text-xs text-[#363636]">{tx.property} • {tx.time}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-[#efefef]">R$ {tx.amount.toFixed(2).replace('.', ',')}</div>
                <div className="flex items-center gap-1 justify-end">
                  {tx.status === 'confirmed' && <CheckCircle className="w-3 h-3 text-[#FF5500]" />}
                  {tx.status === 'pending' && <Clock className="w-3 h-3 text-[#FF5500]" />}
                  {tx.status === 'failed' && <AlertTriangle className="w-3 h-3 text-red-400" />}
                  <span className={`text-[10px] ${
                    tx.status === 'confirmed' ? 'text-[#FF5500]' :
                    tx.status === 'pending' ? 'text-[#FF5500]' : 'text-red-400'
                  }`}>
                    {tx.method === 'pix' ? 'PIX' : 'Cartão'} — {tx.status === 'confirmed' ? 'Confirmado' : tx.status === 'pending' ? 'Pendente' : 'Falhou'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
