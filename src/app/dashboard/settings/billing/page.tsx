'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Download, ArrowUpCircle, ArrowDownCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BillingPage() {
  const router = useRouter();
  const [currentPlan, setCurrentPlan] = useState('pro');
  const [tenantId, setTenantId] = useState('');
  const [loading, setLoading] = useState(false);
  const [upgradeModal, setUpgradeModal] = useState(false);
  const [downgradeModal, setDowngradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cartao');

  useEffect(() => {
    fetch('/api/ddc/property-name')
      .then(r => r.json())
      .then(d => {
        if (d.plan) setCurrentPlan(d.plan);
        if (d.tenantId) setTenantId(d.tenantId);
      })
      .catch(() => {});
  }, []);

  // Dados reais dos planos
  const planos = {
    gratuito: { name: 'TRIAL', price: 0 },
    lite: { name: 'LITE', price: 197 },
    pro: { name: 'PRO', price: 397 },
    max: { name: 'MAX', price: 797 }
  };

  const handleUpgrade = async () => {
    if (!selectedPlan) return;
    if (!tenantId) { alert('Erro: sessão expirada. Faça login novamente.'); return; }
    setLoading(true);
    try {
      const activeMethod = selectedPlan === 'lite' ? paymentMethod : 'cartao';
      const res = await fetch('/api/checkout/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tenantId,
          newPlanType: selectedPlan,
          paymentMethod: activeMethod
        })
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentPlan(selectedPlan);
        setUpgradeModal(false);
        alert('Upgrade efetuado com sucesso!');
        router.refresh();
      } else {
        alert(data.error || 'Erro ao realizar upgrade');
      }
    } catch (err) {
      alert('Erro na conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleDowngrade = async () => {
    if (!selectedPlan) return;
    if (!tenantId) { alert('Erro: sessão expirada. Faça login novamente.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/checkout/downgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tenantId,
          newPlanType: selectedPlan
        })
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentPlan(selectedPlan);
        setDowngradeModal(false);
        alert('Downgrade agendado com sucesso!');
        router.refresh();
      } else {
        alert(data.error || 'Erro ao agendar downgrade');
      }
    } catch (err) {
      alert('Erro na conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  // Cálculo de Pró-rata visual para o modal de Upgrade
  const precoAtual = planos[currentPlan as keyof typeof planos]?.price || 0;
  const precoNovo = planos[selectedPlan as keyof typeof planos]?.price || 0;
  const diferenca = Math.max(0, precoNovo - precoAtual);
  const prorataVisual = Math.floor(diferenca * 0.5); // Mock de 15 dias restantes

  return (
    <div className="p-8 max-w-5xl mx-auto text-foreground">
      <div className="flex items-center gap-3 mb-8">
        <CreditCard className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Faturamento e Assinatura</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Card Plano Atual */}
        <div className="col-span-2 bg-card border border-border rounded-xl p-8 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-sm uppercase tracking-wider text-muted-foreground font-semibold mb-2">Plano Atual</h2>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{currentPlan.toUpperCase()}</span>
                <span className="text-lg text-muted-foreground">/ R${planos[currentPlan as keyof typeof planos]?.price},00 mensais</span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="w-4 h-4" /> Ativo
            </span>
          </div>

          <div className="bg-muted/30 rounded-lg p-4 mb-8">
            <p className="text-sm text-muted-foreground">Próxima cobrança: <strong className="text-foreground">18/07/2026</strong> no valor de R${planos[currentPlan as keyof typeof planos]?.price},00</p>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => {
                 setSelectedPlan(
                   currentPlan === 'gratuito' || currentPlan === 'trial'
                     ? 'lite'
                     : currentPlan === 'lite'
                     ? 'pro'
                     : 'max'
                 );
                 setUpgradeModal(true);
              }}
              disabled={currentPlan === 'max'}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <ArrowUpCircle className="w-5 h-5" />
              Fazer Upgrade
            </button>
            <button 
              onClick={() => {
                setSelectedPlan(currentPlan === 'max' ? 'pro' : 'lite');
                setDowngradeModal(true);
              }}
              disabled={currentPlan === 'lite' || currentPlan === 'gratuito' || currentPlan === 'trial'}
              className="flex items-center gap-2 px-6 py-2.5 bg-transparent border border-border hover:bg-accent hover:text-accent-foreground font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <ArrowDownCircle className="w-5 h-5" />
              Alterar Plano (Downgrade)
            </button>
          </div>
        </div>

        {/* Métodos de Pagamento */}
        <div className="bg-card border border-border rounded-xl p-8 shadow-sm flex flex-col">
          <h3 className="font-semibold text-lg mb-6">Método de Pagamento</h3>
          
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-4 p-4 border border-primary/20 bg-primary/5 rounded-lg">
              <div className="w-12 h-8 bg-black/20 rounded flex items-center justify-center">
                <span className="font-bold text-xs">PIX</span>
              </div>
              <div>
                <p className="font-medium text-sm">Chave Aleatória</p>
                <p className="text-xs text-muted-foreground">Cadastrado em 18/06/2026</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 border border-border rounded-lg opacity-60">
              <div className="w-12 h-8 bg-muted rounded flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-sm">Cartão final ****4242</p>
                <p className="text-xs text-muted-foreground">Expira 12/29</p>
              </div>
            </div>
          </div>

          <button className="text-sm text-primary font-medium hover:underline mt-4 text-left">
            Adicionar novo método
          </button>
        </div>
      </div>

      {/* Histórico de Faturas */}
      <div className="mt-8 bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="px-8 py-5 border-b border-border">
          <h3 className="font-semibold text-lg">Histórico de Faturas</h3>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/20">
            <tr>
              <th className="px-8 py-4 font-medium">Data</th>
              <th className="px-8 py-4 font-medium">Plano</th>
              <th className="px-8 py-4 font-medium">Valor</th>
              <th className="px-8 py-4 font-medium">Status</th>
              <th className="px-8 py-4 font-medium text-right">Recibo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {[
              { date: '18/06/2026', plan: 'PRO', amount: 'R$ 397,00', status: 'Pago' },
              { date: '18/05/2026', plan: 'PRO', amount: 'R$ 397,00', status: 'Pago' },
              { date: '18/04/2026', plan: 'LITE', amount: 'R$ 197,00', status: 'Pago' },
            ].map((invoice, i) => (
              <tr key={i} className="hover:bg-muted/10 transition-colors">
                <td className="px-8 py-4">{invoice.date}</td>
                <td className="px-8 py-4 font-medium">{invoice.plan}</td>
                <td className="px-8 py-4">{invoice.amount}</td>
                <td className="px-8 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500">
                    <CheckCircle2 className="w-3 h-3" /> {invoice.status}
                  </span>
                </td>
                <td className="px-8 py-4 text-right">
                  <button className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-md hover:bg-muted">
                    <Download className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DE UPGRADE */}
      {upgradeModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border shadow-2xl rounded-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <ArrowUpCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Fazer Upgrade para {selectedPlan.toUpperCase()}</h3>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Mudança de plano</span>
                <span className="font-semibold">{currentPlan.toUpperCase()} &rarr; {selectedPlan.toUpperCase()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Diferença Mensal</span>
                <span className="font-semibold text-primary">+ R$ {diferenca},00</span>
              </div>
              
              <div className="bg-muted/30 border border-border rounded-lg p-4 mt-4 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Pró-rata (restam 15 dias)</span>
                  <span className="font-medium">R$ {prorataVisual},00</span>
                </div>
                <div className="pt-2 border-t border-border flex justify-between items-center">
                  <span className="font-semibold">Total cobrado hoje</span>
                  <span className="font-bold text-lg">R$ {prorataVisual},00</span>
                </div>
              </div>

              {/* Forma de Pagamento */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-semibold text-muted-foreground">Forma de Pagamento</label>
                {selectedPlan === 'lite' ? (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('pix')}
                      className={`py-2 px-3 text-xs font-semibold border rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${paymentMethod === 'pix' ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:bg-accent hover:text-accent-foreground'}`}
                    >
                      ⚡ PIX (R$197)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cartao')}
                      className={`py-2 px-3 text-xs font-semibold border rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${paymentMethod === 'cartao' ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:bg-accent hover:text-accent-foreground'}`}
                    >
                      💳 Cartão (R$247)
                    </button>
                  </div>
                ) : (
                  <div className="p-3 border border-amber-500/20 bg-amber-500/5 text-amber-500 rounded-lg text-xs font-semibold flex items-center gap-2">
                    <span>💳</span>
                    <span>Pagamento exclusivo via Cartão de Crédito para planos PRO/MAX</span>
                  </div>
                )}
              </div>

              <div className="flex items-start gap-3 mt-4 text-sm text-muted-foreground bg-primary/5 text-primary/80 p-3 rounded-lg">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>Sua próxima fatura no dia 18/07 será no valor cheio de R$ {precoNovo},00.</p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setUpgradeModal(false)}
                className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleUpgrade}
                disabled={loading}
                className="px-6 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg transition-colors hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? 'Processando...' : 'Confirmar Pagamento'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE DOWNGRADE */}
      {downgradeModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border shadow-2xl rounded-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground">
                <ArrowDownCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Alterar para {selectedPlan.toUpperCase()}</h3>
            </div>
            
            <div className="space-y-4 mb-6">
              <p className="text-sm text-muted-foreground">
                Você está reduzindo seu plano de <strong>{currentPlan.toUpperCase()}</strong> para <strong>{selectedPlan.toUpperCase()}</strong>.
              </p>
              
              <div className="flex items-start gap-3 mt-4 text-sm text-muted-foreground border border-border p-3 rounded-lg">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-orange-500" />
                <p>O downgrade só entrará em vigor no final do seu ciclo atual de faturamento (18/07). Você continuará com acesso aos recursos do {currentPlan.toUpperCase()} até lá.</p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setDowngradeModal(false)}
                className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleDowngrade}
                disabled={loading}
                className="px-6 py-2 border border-border hover:bg-accent hover:text-accent-foreground text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Processando...' : 'Agendar Downgrade'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
