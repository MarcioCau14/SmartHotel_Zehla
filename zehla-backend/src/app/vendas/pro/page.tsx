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
    <div className="min-h-screen bg-[#050505] text-neutral-100 font-sans selection:bg-[#FF5500]/30 selection:text-white relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-[#FF5500]/10 via-[#FF5500]/3 to-transparent rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#FF5500]/2 rounded-full blur-[140px] pointer-events-none -z-10" />

      <Suspense fallback={null}>
        <LandingTracker />
      </Suspense>
      
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center relative z-20">
        <Link href="/" className="flex items-center gap-3 group transition-transform hover:scale-[1.02] duration-300">
          <div className="w-10 h-10 rounded-xl bg-[#FF5500]/10 border border-[#FF5500]/20 flex items-center justify-center group-hover:bg-[#FF5500]/20 group-hover:border-[#FF5500]/40 transition-all duration-300 shadow-[0_0_15px_rgba(255,85,0,0.1)]">
            <Brain className="w-5 h-5 text-[#FF5500] group-hover:rotate-6 transition-transform duration-300" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg text-neutral-100 leading-none tracking-tight">ZEHLA</span>
            <span className="text-[10px] text-neutral-500 leading-none mt-0.5 tracking-wider font-semibold">SmartHotel</span>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-[10px] text-[#FF5500] font-black uppercase tracking-[0.15em] bg-[#FF5500]/10 px-4 py-2 rounded-full border border-[#FF5500]/20 shadow-[0_0_15px_rgba(255,85,0,0.15)]">
            Plano Mais Escolhido
          </span>
          <Link href="/login">
            <Button variant="ghost" className="text-neutral-400 hover:text-white text-xs hover:bg-white/5 rounded-xl px-4 py-2 transition-all">
              Entrar
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-28 px-4 overflow-hidden text-center z-10">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2.5 px-4.5 py-2 rounded-full bg-gradient-to-r from-[#FF5500]/15 to-amber-500/5 border border-[#FF5500]/20 text-[10px] font-black tracking-[0.2em] text-[#FF5500] uppercase mb-10 shadow-[0_8px_30px_rgba(255,85,0,0.08)] hover:scale-105 transition-transform duration-300 select-none">
            <Sparkles className="w-4 h-4 animate-pulse text-[#FF5500]" /> PERFORMANCE E INTELIGÊNCIA
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black mb-8 leading-[1.08] tracking-tighter text-white">
            Escala e <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5500] to-amber-500 drop-shadow-[0_2px_20px_rgba(255,85,0,0.2)]">Lucro Invisível.</span>
          </h1>
          
          <p className="text-neutral-400 text-lg md:text-xl mb-16 max-w-3xl mx-auto leading-relaxed font-medium">
            O Plano PRO não é apenas um sistema, é o seu <span className="text-white font-bold">Diretor de Estratégia Digital.</span> Nossa IA sabe exatamente quando subir seus preços para maximizar sua margem e busca clientes que não fecharam de forma incansável.
          </p>

          {/* Pricing Card Block */}
          <div className="glass-strong border border-white/10 rounded-[3rem] p-1 md:p-2 max-w-3xl mx-auto relative group shadow-[0_30px_80px_rgba(0,0,0,0.7)] transition-all duration-500 hover:shadow-[0_30px_100px_rgba(255,85,0,0.15)] hover:border-[#FF5500]/30 hover:scale-[1.01]">
            {/* Glowing active outline */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FF5500] via-[#ff7733] to-amber-500 rounded-[3rem] opacity-25 blur-xl group-hover:opacity-40 transition-opacity duration-500" />
            
            <div className="bg-[#0b0b0d]/95 backdrop-blur-xl rounded-[2.8rem] p-8 md:p-14 relative border border-white/5 overflow-hidden">
              {/* Card ambient light */}
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-b from-[#FF5500]/5 to-transparent rounded-full blur-[80px] pointer-events-none" />
              
              <div className="flex flex-col items-center mb-12 relative z-10">
                <span className="text-neutral-500 text-xs mb-3 font-bold tracking-[0.2em] uppercase">Investimento Pro</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl text-neutral-500 font-medium">R$</span>
                  <span className="text-7xl md:text-8xl font-black text-white tracking-tight">448</span>
                  <span className="text-2xl text-neutral-500 font-medium">/mês</span>
                </div>
                
                {/* Active Fixed-Price Badge */}
                <div className="mt-6 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF5500]/12 to-amber-500/5 border border-[#FF5500]/30 text-[#FF5500] font-black text-sm uppercase tracking-[0.15em] shadow-[0_10px_30px_rgba(255,85,0,0.1)] flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF5500] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF5500]"></span>
                  </span>
                  Assinatura 100% Fixa — Sem Comissões
                </div>
              </div>

              {/* Feature Grid */}
              <div className="grid sm:grid-cols-2 gap-6 mb-12 text-left relative z-10 border-t border-b border-white/5 py-8">
                {[
                  'Preços Inteligentes (Venda mais na Alta)',
                  'Busca de Clientes que não fecharam',
                  'Relatórios Fáceis de Entender',
                  'Suporte VIP via WhatsApp',
                  'Gestão de Lucratividade',
                  'Promoções Automáticas por IA',
                  'Tudo do Plano Lite incluso'
                ].map((feat) => (
                  <div key={feat} className="flex items-start gap-4 text-neutral-300 hover:text-white transition-colors duration-300 group/item">
                    <div className="w-5.5 h-5.5 rounded-full bg-[#FF5500]/10 border border-[#FF5500]/25 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-[0_0_10px_rgba(255,85,0,0.15)] group-hover/item:border-[#FF5500]/50 transition-colors">
                       <Check className="w-3.5 h-3.5 text-[#FF5500]" />
                    </div>
                    <span className="text-sm font-semibold leading-snug">{feat}</span>
                  </div>
                ))}
              </div>

              {/* CTA Action */}
              <div className="relative z-10">
                <Link href="/teste-gratis?plan=pro" className="block w-full">
                  <button className="w-full h-20 rounded-[1.8rem] bg-gradient-to-r from-[#FF5500] via-[#ff7733] to-[#FF5500] text-white text-xl font-black shadow-[0_15px_40px_rgba(255,85,0,0.35)] hover:shadow-[0_20px_60px_rgba(255,85,0,0.5)] hover:from-[#ff6611] hover:to-[#ff8844] transition-all duration-300 active:scale-95 group flex items-center justify-center border border-white/10">
                    Ativar Plano PRO
                    <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                  </button>
                </Link>
                
                <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-[10px] text-neutral-500 font-bold uppercase tracking-widest">
                  <span className="hover:text-neutral-300 transition-colors">✓ 7 Dias Grátis</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-800" />
                  <span className="hover:text-neutral-300 transition-colors">✓ Sem Fidelidade</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-800" />
                  <span className="hover:text-neutral-300 transition-colors">✓ Setup Full</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Intelligence Grid */}
      <section className="py-28 px-4 bg-gradient-to-b from-[#08080a] to-[#050505] relative overflow-hidden border-t border-b border-white/5 z-10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-10 text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-black leading-tight text-white tracking-tight">
               Onde o PRO faz sua pousada <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5500] to-amber-500">lucrar mais.</span>
            </h2>
            <div className="space-y-6">
              {/* Card 1 */}
              <div className="flex flex-col md:flex-row gap-5 p-6 rounded-3xl glass-strong border border-white/5 hover:border-[#FF5500]/20 transition-all duration-300 group shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
                <div className="w-14 h-14 rounded-2xl bg-[#FF5500]/10 border border-[#FF5500]/20 flex items-center justify-center flex-shrink-0 mx-auto md:mx-0 shadow-[0_0_15px_rgba(255,85,0,0.15)] group-hover:bg-[#FF5500]/20 group-hover:border-[#FF5500]/40 transition-colors duration-300">
                  <Target className="w-6 h-6 text-[#FF5500]" />
                </div>
                <div>
                  <h4 className="font-extrabold text-lg mb-2 text-white">Recuperação de Vendas</h4>
                  <p className="text-neutral-400 text-sm leading-relaxed">O ZEHLA identifica quem parou de responder e faz o contato na hora certa para garantir que a reserva seja sua, não do vizinho.</p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="flex flex-col md:flex-row gap-5 p-6 rounded-3xl glass-strong border border-white/5 hover:border-[#FF5500]/20 transition-all duration-300 group shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
                <div className="w-14 h-14 rounded-2xl bg-[#FF5500]/10 border border-[#FF5500]/20 flex items-center justify-center flex-shrink-0 mx-auto md:mx-0 shadow-[0_0_15px_rgba(255,85,0,0.15)] group-hover:bg-[#FF5500]/20 group-hover:border-[#FF5500]/40 transition-colors duration-300">
                  <TrendingUp className="w-6 h-6 text-[#FF5500]" />
                </div>
                <div>
                  <h4 className="font-extrabold text-lg mb-2 text-white">O Algoritmo de Lucro</h4>
                  <p className="text-neutral-400 text-sm leading-relaxed">
                    Baseado no modelo G-Solis, o ZEHLA identifica picos de demanda na sua cidade e ajusta sua tarifa em milissegundos. <span className="text-white font-bold italic">Você fatura mais no mesmo quarto, sem esforço.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Futuristic Visual Block */}
          <div className="relative hidden md:block">
            <div className="absolute -inset-10 bg-[#FF5500]/5 blur-[100px] -z-10 animate-pulse" />
            <div className="glass-strong border border-white/5 rounded-[2.5rem] p-3 shadow-[0_30px_70px_rgba(0,0,0,0.8)] hover:border-[#FF5500]/25 transition-all duration-500 group">
               <div className="aspect-video bg-[#030303] rounded-[2rem] border border-white/5 flex items-center justify-center overflow-hidden relative">
                 {/* Dynamic grid scan line */}
                 <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,85,0,0.06),transparent_70%)]" />
                 <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#FF5500]/50 to-transparent top-0 animate-[scan_3.5s_linear_infinite]" />
                 
                 <div className="text-center relative z-10">
                   <div className="flex items-center justify-center gap-2 mb-6 h-12">
                     {[24, 48, 64, 32, 56, 40, 60, 28, 44].map((h, i) => (
                       <div 
                         key={i} 
                         className="w-2.5 bg-[#FF5500] rounded-full shadow-[0_0_15px_rgba(255,85,0,0.6)] animate-pulse" 
                         style={{ 
                           height: `${h}px`,
                           animationDuration: `${[1.3, 0.9, 1.6, 1.0, 1.2, 1.5, 0.8, 1.4, 1.1][i]}s`,
                           animationDelay: `${i * 0.06}s`
                         }} 
                       />
                     ))}
                   </div>
                   <span className="text-[10px] text-neutral-500 font-mono tracking-[0.3em] uppercase block hover:text-[#FF5500] transition-colors duration-300">
                     Inteligência Analisando Demanda...
                   </span>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upsell to MAX */}
      <div className="relative z-10">
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
      </div>

      {/* Footer */}
      <MainFooter />
      
      {/* Dynamic scan keyframes style tag for seamless execution without modifying CSS files */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan {
          0% {
            transform: translateY(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(220px);
            opacity: 0;
          }
        }
      `}} />
    </div>
  );
}
