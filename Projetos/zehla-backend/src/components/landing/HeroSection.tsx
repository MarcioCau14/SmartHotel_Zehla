'use client';

import { motion } from 'framer-motion';
import { Brain, ChevronRight, ChevronDown } from 'lucide-react';

interface HeroSectionProps {
  onNavigate?: () => void;
  headline?: string;
  highlight?: string;
  subtitle?: string;
}

export function HeroSection({ onNavigate, headline, highlight, subtitle }: HeroSectionProps) {
  const h1 = headline || 'Sua pousada no';
  const h1Highlight = highlight || 'piloto automático';
  const sub = subtitle || 'Automatize <span style="color: \'#DCF8C6\', fontWeight: 600">reservas</span>, <span style="color: \'#DCF8C6\', fontWeight: 600">WhatsApp</span>, <span style="color: \'#DCF8C6\', fontWeight: 600">precificação</span> e <span style="color: \'#DCF8C6\', fontWeight: 600">financeiro</span> — tudo em um só lugar. Sem planilhas, sem estresse.';

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #25D366 0%, #128C7E 50%, #075E54 100%)', minHeight: '680px' }}
    >
      {/* Decorative circles */}
      <div className="vzap-deco-circle" style={{ width: '500px', height: '500px', top: '-150px', right: '-100px', opacity: 0.3 }} />
      <div className="vzap-deco-circle" style={{ width: '300px', height: '300px', bottom: '-50px', left: '-50px', opacity: 0.2 }} />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10" style={{ paddingTop: '160px', paddingBottom: '80px' }}>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            {/* Badge */}
            <div className="vzap-badge vzap-badge-white mb-8">
              <Brain className="w-4 h-4" />
              <span>O Cérebro ZEHLA</span>
            </div>

            {/* H1 */}
            <h1
              className="text-white mb-6"
              style={{
                fontSize: 'clamp(32px, 5.5vw, 56px)',
                fontWeight: 700,
                lineHeight: 1.15,
                fontFamily: "'Rubik', sans-serif",
              }}
            >
              {h1}<br />
              <span style={{ color: '#DCF8C6' }}>{h1Highlight}</span>
            </h1>

            {/* Subtitle */}
            <p
              className="mb-10 max-w-lg"
              style={{
                color: 'rgba(255,255,255,0.9)',
                fontSize: '17px',
                lineHeight: 1.7,
                fontFamily: "'Rubik', sans-serif",
              }}
              dangerouslySetInnerHTML={{ __html: sub }}
            />

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
              <button
                type="button"
                onClick={onNavigate}
                className="vzap-btn-white"
                style={{ minWidth: '220px' }}
              >
                Começar Teste Grátis
                <ChevronRight className="w-4 h-4" />
              </button>

              <a href="#funcionalidades" className="vzap-btn-outline">
                Ver como funciona
                <ChevronDown className="w-4 h-4" />
              </a>
            </div>

            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
              7 dias grátis · Sem cartão de crédito · Setup em 10 minutos
            </p>
          </motion.div>

          {/* Right: Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 30, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="hidden lg:block"
          >
            <div className="dashboard-preview">
              {/* Browser topbar */}
              <div className="dashboard-topbar">
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f57' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#28ca41' }} />
                <span style={{ marginLeft: '12px', color: 'rgba(255,255,255,0.8)', fontSize: '12px', fontFamily: "'Rubik', sans-serif" }}>
                  app.zehla.com.br/dashboard
                </span>
              </div>

              {/* Dashboard content */}
              <div className="dashboard-body">
                {/* KPI row */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {[
                    { label: 'RevPAR', value: 'R$ 187', change: '+12%' },
                    { label: 'Ocupação', value: '78%', change: '+3%' },
                    { label: 'Receita', value: 'R$ 4.2k', change: '+18%' },
                    { label: 'WhatsApp', value: '247', change: '+34%' },
                  ].map((kpi, i) => (
                    <div key={i} className="kpi-card">
                      <div style={{ fontSize: '11px', color: '#667781', marginBottom: '4px' }}>{kpi.label}</div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#111B21' }}>{kpi.value}</div>
                      <div style={{ fontSize: '11px', color: '#25D366', fontWeight: 500 }}>{kpi.change}</div>
                    </div>
                  ))}
                </div>

                {/* Bar chart */}
                <div className="kpi-card">
                  <div style={{ fontSize: '13px', fontWeight: 500, color: '#111B21', marginBottom: '12px' }}>Receita — Últimos 7 dias</div>
                  <div style={{ display: 'flex', alignItems: 'end', gap: '6px', height: '72px' }}>
                    {[45, 62, 38, 75, 55, 88, 70].map((h, i) => (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '100%', height: `${h}%`, borderRadius: '4px 4px 0 0', background: i === 5 ? 'linear-gradient(180deg, #25D366, #128C7E)' : '#E9EDEF', minHeight: '6px' }} />
                        <span style={{ fontSize: '9px', color: '#667781' }}>{['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'][i]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Wave separator */}
      <div className="absolute bottom-0 left-0 right-0" style={{ lineHeight: 0 }}>
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" style={{ display: 'block' }}>
          <path d="M0 40L60 35C120 30 240 20 360 25C480 30 600 50 720 55C840 60 960 50 1080 42C1200 34 1320 28 1380 25L1440 22V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0V40Z" fill="#F0F2F5" />
        </svg>
      </div>
    </section>
  );
}
