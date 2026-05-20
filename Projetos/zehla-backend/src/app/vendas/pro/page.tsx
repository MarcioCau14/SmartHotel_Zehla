import { Suspense } from 'react';
import { 
  Check, 
  Zap, 
  Sparkles, 
  TrendingUp, 
  ArrowRight, 
  ShieldCheck, 
  Brain,
  Target,
  BarChart,
  Globe
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PremiumUpsell } from '@/components/sales/PremiumUpsell';
import { LandingTracker } from '@/components/sales/LandingTracker';
import { MainFooter } from '@/components/landing/MainFooter';

export const metadata = {
  title: 'Zehla PRO | Escala e Lucro Invisível para sua Pousada',
  description: 'O Diretor de Estratégia Digital da sua pousada. Performance 100/100, Inteligência Artificial de Preços e Recuperação Automática de Vendas.',
  openGraph: {
    title: 'Zehla PRO - Inteligência na Hospitalidade',
    description: 'Transforme sua pousada em uma máquina de lucro com o ZEHLA.',
    images: ['/og-pro.jpg'],
  },
};

export default function VendasProPage() {
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
        <div className="flex items-center gap-4">
          <span className="text-xs text-orange-500 font-bold uppercase tracking-widest bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">Plano Mais Escolhido</span>
          <Link href="/login">
            <Button variant="ghost" className="text-neutral-400 hover:text-white text-xs">Entrar</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 px-4 overflow-hidden text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] bg-orange-500/10 blur-[150px] -z-10" />
        
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 text-[10px] font-black tracking-[0.2em] text-orange-400 uppercase mb-8 shadow-2xl shadow-orange-500/20 animate-in fade-in zoom-in duration-1000">
            <Sparkles className="w-4 h-4" /> PERFORMANCE E INTELIGÊNCIA
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tighter animate-in fade-in slide-in-from-bottom-4 duration-700">
            Escala e <span className="text-orange-500">Lucro Invisível.</span>
          </h1>
          
          <p className="text-neutral-400 text-lg md:text-xl mb-12 max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
            O Plano PRO não é apenas um sistema, é o seu <span className="text-white font-bold">Diretor de Estratégia Digital.</span> Nossa IA sabe exatamente quando subir seus preços para maximizar sua margem e busca clientes que não fecharam de forma incansável.
          </p>

          <div className="glass-strong border border-white/10 rounded-[3rem] p-1 md:p-2 max-w-3xl mx-auto relative group animate-in fade-in zoom-in duration-1000 delay-300">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 rounded-[3rem] opacity-20 blur-xl group-hover:opacity-40 transition-opacity" />
            
            <div className="bg-neutral-950 rounded-[2.8rem] p-8 md:p-12 relative border border-white/5">
              <div className="flex flex-col items-center mb-10">
                <span className="text-neutral-500 text-xs mb-2 font-bold tracking-widest uppercase">Investimento Pro</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl text-neutral-500">R$</span>
                  <span className="text-7xl font-black text-white">448</span>
                  <span className="text-xl text-neutral-500">/mês</span>
                </div>
                <div className="mt-4 px-6 py-2 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-500 font-bold text-lg">
                  + 2% por reserva
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
                  'Tudo do Plano Lite incluso'
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
      </section>

      {/* Intelligence Grid */}
      <section className="py-24 px-4 bg-neutral-900/20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 text-center md:text-left">
            <h2 className="text-4xl font-bold leading-tight">
               Onde o PRO faz sua pousada <span className="text-orange-500">lucrar mais</span>
            </h2>
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4 p-6 rounded-3xl glass-strong border border-white/5">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center flex-shrink-0 mx-auto md:mx-0">
                  <Target className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Recuperação de Vendas</h4>
                  <p className="text-neutral-500 text-sm">O ZEHLA identifica quem parou de responder e faz o contato na hora certa para garantir que a reserva seja sua, não do vizinho.</p>
                </div>
              </div>
              <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto md:mx-0">
                <Target className="w-6 h-6 text-orange-500" />
              </div>
              <h4 className="font-bold text-lg mb-1 uppercase tracking-tighter text-orange-500 underline decoration-orange-500/30">O Algoritmo de Lucro</h4>
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
                     {[...Array(5)].map((_, i) => <div key={i} className="w-1.5 h-8 bg-orange-500/40 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />)}
                   </div>
                   <span className="text-[10px] text-neutral-600 font-mono tracking-widest uppercase">Inteligência Analisando Demanda...</span>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upsell to MAX */}
      <PremiumUpsell 
        currentPlan="PRO"
        targetPlan="MAX"
        title="Quer crescer sem pagar taxas por reserva?"
        description="O Plano MAX é para pousadas que já vendem muito e querem previsibilidade total. Você para de pagar os 2% por reserva e ganha suporte de elite para toda sua rede."
        benefits={[
          'TAXA ZERO por reserva',
          'Gestão de várias pousadas',
          'Prioridade Total de Suporte',
          'Relatórios Profissionais'
        ]}
      />

      {/* Footer */}
      <MainFooter />
    </div>
  );
}
