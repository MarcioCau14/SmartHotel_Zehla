'use client';

import { useState } from 'react';
import { Settings, Building2, MessageSquare, Bell, Shield, Palette, Save, Link2 } from 'lucide-react';
import { ConnectEditor } from '@/components/connect/ConnectEditor';

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState('property');

  const tabs = [
    { id: 'property', label: 'Propriedade', icon: Building2 },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
    { id: 'connect', label: 'ZEHLA Connect', icon: Link2 },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'security', label: 'Segurança', icon: Shield },
    { id: 'appearance', label: 'Aparência', icon: Palette },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="dash-page-title">Configurações</h1>
        <p className="dash-page-subtitle">Gerencie sua propriedade e integrações</p>
      </div>

      {/* Tabs */}
      <div className="dash-section p-0 overflow-hidden">
        <div className="flex border-b border-[#E9EDEF] overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-[#25D366] text-[#25D366]'
                    : 'border-transparent text-[#667781] hover:text-[#111B21]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'property' && (
        <div className="dash-section">
          <h3 className="dash-section-title">Dados da Propriedade</h3>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#667781' }}>Nome da Propriedade</label>
                <input className="dash-input" defaultValue="ZEHLA SmartHotel" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#667781' }}>CNPJ</label>
                <input className="dash-input" defaultValue="12.345.678/0001-90" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#667781' }}>Telefone</label>
                <input className="dash-input" defaultValue="(11) 99999-9999" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#667781' }}>Email</label>
                <input className="dash-input" defaultValue="contato@zehla.com.br" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#667781' }}>Endereço</label>
              <input className="dash-input" defaultValue="Rua Exemplo, 123 - São Paulo, SP" />
            </div>
            <div className="flex justify-end pt-4">
              <button className="dash-btn-primary">
                <Save className="w-4 h-4" />
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'whatsapp' && (
        <div className="dash-section">
          <h3 className="dash-section-title">Integração WhatsApp</h3>
          <div className="space-y-4 mt-4">
            <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: 'rgba(37, 211, 102, 0.05)' }}>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#25D366]" />
                <div>
                  <p className="text-sm font-medium" style={{ color: '#111B21' }}>WhatsApp Conectado</p>
                  <p className="text-xs" style={{ color: '#667781' }}>+55 11 98765-4321</p>
                </div>
              </div>
              <span className="dash-status dash-status-green">Ativo</span>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#667781' }}>Mensagem de Boas-vindas</label>
              <textarea className="dash-input min-h-[100px]" defaultValue="Olá! Bem-vindo ao ZEHLA SmartHotel. Como posso ajudar?" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#667781' }}>Horário de Atendimento</label>
              <div className="grid grid-cols-2 gap-4">
                <input className="dash-input" type="time" defaultValue="08:00" />
                <input className="dash-input" type="time" defaultValue="22:00" />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button className="dash-btn-primary">
                <Save className="w-4 h-4" />
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'connect' && (
        <div>
          <div className="dash-section mb-6">
            <h3 className="dash-section-title">ZEHLA Connect — Seu Link-in-Bio</h3>
            <p className="text-sm mt-2" style={{ color: '#667781' }}>
              Crie sua página personalizada para compartilhar no Instagram e redes sociais. Seus hóspedes acessam reservas, contato e informações com um clique.
            </p>
          </div>
          <ConnectEditor />
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="dash-section">
          <h3 className="dash-section-title">Preferências de Notificação</h3>
          <div className="space-y-4 mt-4">
            {['Novas reservas', 'Check-in/Check-out', 'Pagamentos recebidos', 'Mensagens do WhatsApp', 'Alertas de manutenção'].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-[#E9EDEF] last:border-0">
                <span className="text-sm" style={{ color: '#111B21' }}>{item}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked={i < 3} className="sr-only peer" />
                  <div className="w-11 h-6 bg-[#E9EDEF] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#25D366]"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="dash-section">
          <h3 className="dash-section-title">Segurança</h3>
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#667781' }}>Senha Atual</label>
              <input className="dash-input" type="password" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#667781' }}>Nova Senha</label>
                <input className="dash-input" type="password" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#667781' }}>Confirmar Nova Senha</label>
                <input className="dash-input" type="password" />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button className="dash-btn-primary">
                <Shield className="w-4 h-4" />
                Atualizar Senha
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'appearance' && (
        <div className="dash-section">
          <h3 className="dash-section-title">Personalização Visual</h3>
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#667781' }}>Cor Primária</label>
              <div className="flex items-center gap-3">
                <input type="color" defaultValue="#25D366" className="w-10 h-10 rounded-lg border-0 cursor-pointer" />
                <input className="dash-input flex-1" defaultValue="#25D366" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#667781' }}>Logo da Propriedade</label>
              <div className="border-2 border-dashed rounded-xl p-8 text-center" style={{ borderColor: '#E9EDEF' }}>
                <Palette className="w-8 h-8 mx-auto mb-2" style={{ color: '#8696A0' }} />
                <p className="text-sm" style={{ color: '#667781' }}>Arraste uma imagem ou clique para selecionar</p>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button className="dash-btn-primary">
                <Save className="w-4 h-4" />
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
