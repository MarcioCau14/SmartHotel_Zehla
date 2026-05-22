'use client';

import { Settings, Brain, ShieldCheck, Globe, Palette } from 'lucide-react';
import { motion } from 'framer-motion';

const settingsSections = [
  {
    title: 'Inteligência Artificial',
    icon: Brain,
    accent: '#FF5500',
    glow: 'hover:border-[#FF5500]/30 hover:shadow-[0_0_20px_rgba(255,85,0,0.05)]',
    items: [
      { label: 'Agente Principal', description: 'Controla o tom de voz e comportamento da IA' },
      { label: 'LLM Marketplace', description: 'Escolha entre modelos gratuitos ou pagos' },
      { label: 'Preços Inteligentes', description: 'Ativar ajuste automático de tarifas' },
    ],
  },
  {
    title: 'Propriedade',
    icon: Globe,
    accent: '#00CCFF',
    glow: 'hover:border-[#00CCFF]/30 hover:shadow-[0_0_20px_rgba(0,204,255,0.05)]',
    items: [
      { label: 'Dados da Pousada', description: 'Nome, endereço, contato e documentos' },
      { label: 'Fuso Horário & Idioma', description: 'Configurações regionais do sistema' },
      { label: 'Horário de Check-in/out', description: 'Definir horários padrão da casa' },
    ],
  },
  {
    title: 'Financeiro',
    icon: ShieldCheck,
    accent: '#00FF88',
    glow: 'hover:border-[#00FF88]/30 hover:shadow-[0_0_20px_rgba(0,255,136,0.05)]',
    items: [
      { label: 'Chave PIX', description: 'Configurar recebimento via PIX' },
      { label: 'Gateway de Pagamento', description: 'Conectar Stripe ou outro provedor' },
      { label: 'Módulo Fiscal', description: 'Emitir NF e configurar CPF na nota' },
    ],
  },
  {
    title: 'Personalização',
    icon: Palette,
    accent: '#FF3366',
    glow: 'hover:border-[#FF3366]/30 hover:shadow-[0_0_20px_rgba(255,51,102,0.05)]',
    items: [
      { label: 'Cores da Marca', description: 'Personalizar identidade visual do sistema' },
      { label: 'Modelo de Mensagens', description: 'Editar templates de WhatsApp e e-mail' },
    ],
  },
];

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-3"
      >
        <div className="w-8 h-8 rounded-lg bg-[#FF5500]/10 flex items-center justify-center border border-[#FF5500]/25">
          <Settings className="w-4 h-4 text-[#FF5500]" />
        </div>
        <h2 className="text-xl font-black text-white tracking-tight uppercase">Configurações</h2>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-5">
        {settingsSections.map((section, idx) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
            className={`bg-[#0a0a0c]/60 border border-white/5 rounded-2xl p-6 backdrop-blur-md transition-all duration-300 ${section.glow}`}
          >
            <div className="flex items-center gap-3 mb-5">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg border"
                style={{ 
                  backgroundColor: `${section.accent}15`, 
                  borderColor: `${section.accent}30` 
                }}
              >
                <section.icon className="w-5 h-5" style={{ color: section.accent }} />
              </div>
              <h3 className="text-sm font-black text-white tracking-wide uppercase">{section.title}</h3>
            </div>
            <div className="space-y-3">
              {section.items.map((item) => (
                <button
                  key={item.label}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all duration-300 text-left group"
                >
                  <div>
                    <p className="text-sm font-bold text-neutral-300 group-hover:text-white transition-colors duration-300">
                      {item.label}
                    </p>
                    <p className="text-[10px] text-neutral-500 font-medium tracking-wide mt-0.5">
                      {item.description}
                    </p>
                  </div>
                  {/* Styled indicator light */}
                  <div className="w-2 h-2 rounded-full bg-neutral-850 border border-neutral-800 group-hover:bg-[var(--glow-color)] group-hover:border-[var(--glow-color)] group-hover:shadow-[0_0_8px_var(--glow-color)] transition-all duration-300"
                    style={{
                      // Set custom properties dynamically
                      // @ts-ignore
                      '--glow-color': section.accent
                    }}
                  />
                </button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

