'use client';

import { Settings, Brain, ShieldCheck, Globe, Clock, Palette } from 'lucide-react';

const settingsSections = [
  {
    title: 'Inteligência Artificial',
    icon: Brain,
    items: [
      { label: 'Agente Principal', description: 'Controla o tom de voz e comportamento da IA' },
      { label: 'LLM Marketplace', description: 'Escolha entre modelos gratuitos ou pagos' },
      { label: 'Preços Inteligentes', description: 'Ativar ajuste automático de tarifas' },
    ],
  },
  {
    title: 'Propriedade',
    icon: Globe,
    items: [
      { label: 'Dados da Pousada', description: 'Nome, endereço, contato e documentos' },
      { label: 'Fuso Horário & Idioma', description: 'Configurações regionais do sistema' },
      { label: 'Horário de Check-in/out', description: 'Definir horários padrão da casa' },
    ],
  },
  {
    title: 'Financeiro',
    icon: ShieldCheck,
    items: [
      { label: 'Chave PIX', description: 'Configurar recebimento via PIX' },
      { label: 'Gateway de Pagamento', description: 'Conectar Stripe ou outro provedor' },
      { label: 'Módulo Fiscal', description: 'Emitir NF e configurar CPF na nota' },
    ],
  },
  {
    title: 'Personalização',
    icon: Palette,
    items: [
      { label: 'Cores da Marca', description: 'Personalizar identidade visual do sistema' },
      { label: 'Modelo de Mensagens', description: 'Editar templates de WhatsApp e e-mail' },
    ],
  },
];

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center gap-3">
        <Settings className="w-5 h-5 text-orange-400" />
        <h2 className="text-lg font-bold text-white">Configurações</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {settingsSections.map((section) => (
          <div key={section.title} className="glass-strong border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <section.icon className="w-5 h-5 text-orange-400" />
              </div>
              <h3 className="text-sm font-bold text-neutral-300">{section.title}</h3>
            </div>
            <div className="space-y-3">
              {section.items.map((item) => (
                <button
                  key={item.label}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 transition-all text-left group"
                >
                  <div>
                    <p className="text-sm font-medium text-neutral-300 group-hover:text-white transition-colors">{item.label}</p>
                    <p className="text-[10px] text-neutral-600">{item.description}</p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-neutral-700 group-hover:bg-orange-400 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
