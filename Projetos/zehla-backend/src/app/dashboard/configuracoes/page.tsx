'use client';

import { useState, useEffect } from 'react';
import { Settings, Building2, MessageSquare, Bell, Shield, Palette, Save, Link2, CreditCard, TrendingUp, ExternalLink, Check, X, Key, Webhook, Copy, Trash2, Plus, AlertTriangle, Clock, Activity, Globe, DollarSign, MapPin } from 'lucide-react';
import { ConnectEditor } from '@/components/connect/ConnectEditor';
import { SUPPORTED_LOCALES, SUPPORTED_CURRENCIES } from '@/i18n';

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState('property');
  const [billing, setBilling] = useState<any>(null);
  const [usage, setUsage] = useState<any>(null);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [showNewWebhookModal, setShowNewWebhookModal] = useState(false);
  const [newKey, setNewKey] = useState<any>(null);
  const [newWebhookSecret, setNewWebhookSecret] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'billing') {
      Promise.all([
        fetch('/api/billing/subscription').then(r => r.json()),
        fetch('/api/billing/usage').then(r => r.json()),
      ]).then(([billingData, usageData]) => {
        setBilling(billingData);
        setUsage(usageData);
      }).catch(() => {});
    }
    if (activeTab === 'integrations') {
      Promise.all([
        fetch('/api/marketplace/api-keys').then(r => r.json()),
        fetch('/api/marketplace/subscriptions').then(r => r.json()),
      ]).then(([keysData, subsData]) => {
        setApiKeys(keysData.keys || []);
        setSubscriptions(subsData.subscriptions || []);
        setRecentLogs(subsData.recentLogs || []);
      }).catch(() => {});
    }
  }, [activeTab]);

  const tabs = [
    { id: 'property', label: 'Propriedade', icon: Building2 },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
    { id: 'connect', label: 'ZEHLA Connect', icon: Link2 },
    { id: 'billing', label: 'Plano & Cobrança', icon: CreditCard },
    { id: 'integrations', label: 'Integrações', icon: Webhook },
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

            {/* Internacionalização */}
            <div className="mt-6 pt-6 border-t border-[#E9EDEF]">
              <h4 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: '#111B21' }}>
                <Globe className="w-4 h-4" style={{ color: '#25D366' }} />
                Internacionalização
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5" style={{ color: '#667781' }}>
                    <Globe className="w-3.5 h-3.5" />
                    Idioma
                  </label>
                  <select className="dash-input">
                    {SUPPORTED_LOCALES.map(l => (
                      <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5" style={{ color: '#667781' }}>
                    <DollarSign className="w-3.5 h-3.5" />
                    Moeda
                  </label>
                  <select className="dash-input">
                    {SUPPORTED_CURRENCIES.map(c => (
                      <option key={c.code} value={c.code}>{c.symbol} {c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5" style={{ color: '#667781' }}>
                    <MapPin className="w-3.5 h-3.5" />
                    Fuso Horário
                  </label>
                  <select className="dash-input">
                    <option value="America/Sao_Paulo">🇧🇷 São Paulo (GMT-3)</option>
                    <option value="America/Manaus">🇧🇷 Manaus (GMT-4)</option>
                    <option value="Europe/Lisbon">🇵🇹 Lisboa (GMT+0/+1)</option>
                    <option value="Europe/Madrid">🇪🇸 Madrid (GMT+1/+2)</option>
                    <option value="America/Buenos_Aires">🇦🇷 Buenos Aires (GMT-3)</option>
                    <option value="America/Mexico_City">🇲🇽 Cidade do México (GMT-6)</option>
                    <option value="America/Bogota">🇨🇴 Bogotá (GMT-5)</option>
                    <option value="America/Santiago">🇨🇱 Santiago (GMT-4/-3)</option>
                    <option value="America/New_York">🇺🇸 Nova York (GMT-5/-4)</option>
                  </select>
                </div>
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

      {activeTab === 'billing' && (
        <div className="space-y-6">
          <div>
            <h1 className="dash-page-title">Plano & Cobrança</h1>
            <p className="dash-page-subtitle">Gerencie sua assinatura e uso da plataforma</p>
          </div>

          {/* Current plan */}
          {billing?.property && (
            <div className="dash-section p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm" style={{ color: '#667781' }}>Plano Atual</p>
                  <div className="flex items-center gap-3 mt-1">
                    <h3 className="text-2xl font-bold" style={{ color: '#111B21' }}>
                      {billing.property.plan}
                    </h3>
                    {billing.property.isTrial && (
                      <span className="dash-status dash-status-yellow">Trial</span>
                    )}
                    {billing.property.cancelAtPeriodEnd && (
                      <span className="dash-status" style={{ backgroundColor: 'rgba(234, 67, 53, 0.1)', color: '#EA4335' }}>
                        Cancelando
                      </span>
                    )}
                  </div>
                  {billing.property.trialEndsAt && (
                    <p className="text-xs mt-1" style={{ color: '#8696A0' }}>
                      Trial até {new Date(billing.property.trialEndsAt).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                  {billing.property.currentPeriodEnd && (
                    <p className="text-xs mt-1" style={{ color: '#8696A0' }}>
                      Renova em {new Date(billing.property.currentPeriodEnd).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  {billing.property.stripeCustomerId && (
                    <button
                      className="dash-btn-secondary"
                      onClick={() => fetch('/api/billing/subscription', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'create_portal' }) }).then(r => r.json()).then(d => { if (d.url) window.open(d.url, '_blank'); })}
                    >
                      <ExternalLink className="w-4 h-4" />
                      Portal do Cliente
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Usage */}
          {usage?.summary && (
            <div className="dash-grid-3">
              <div className="dash-kpi">
                <p className="text-2xl font-bold" style={{ color: '#111B21' }}>
                  R$ {usage.summary.currentCost.toFixed(2)}
                </p>
                <p className="text-sm" style={{ color: '#667781' }}>
                  Custo Atual / R$ {usage.summary.budgetLimit.toFixed(2)}
                </p>
                <div className="mt-2 h-2 rounded-full bg-[#F0F2F5] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${usage.summary.usagePercent}%`,
                      backgroundColor: usage.summary.usagePercent > 80 ? '#EA4335' : '#25D366',
                    }}
                  />
                </div>
              </div>
              <div className="dash-kpi">
                <p className="text-2xl font-bold" style={{ color: '#111B21' }}>{usage.summary.aiTokenCount}</p>
                <p className="text-sm" style={{ color: '#667781' }}>Mensagens IA</p>
              </div>
              <div className="dash-kpi">
                <p className="text-2xl font-bold" style={{ color: '#111B21' }}>{usage.summary.apiCallCount}</p>
                <p className="text-sm" style={{ color: '#667781' }}>Chamadas API</p>
              </div>
            </div>
          )}

          {/* Plan cards */}
          <div className="dash-grid-3">
            {billing?.plans?.map((plan: any) => {
              const isCurrent = billing?.property?.plan === plan.key;
              return (
                <div key={plan.key} className={`dash-card p-6 ${isCurrent ? 'ring-2 ring-[#25D366]' : ''}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold" style={{ color: '#111B21' }}>{plan.name}</h3>
                    {isCurrent && <Check className="w-5 h-5 text-[#25D366]" />}
                  </div>
                  <p className="text-3xl font-bold mb-1" style={{ color: '#111B21' }}>
                    R$ {plan.price.toFixed(2)}
                    <span className="text-sm font-normal" style={{ color: '#8696A0' }}>/mês</span>
                  </p>
                  <ul className="mt-4 space-y-2">
                    {plan.features.map((feature: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#667781' }}>
                        <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#25D366]" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {!isCurrent && (
                    <button
                      className="dash-btn-primary w-full mt-6"
                      onClick={() => fetch('/api/billing/subscription', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'create_checkout', planKey: plan.key }) }).then(r => r.json()).then(d => { if (d.url) window.location.href = d.url; })}
                    >
                      Assinar {plan.name}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'integrations' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="dash-section-title">API Pública & Webhooks</h3>
              <p className="text-sm mt-1" style={{ color: '#667781' }}>
                Gerencie chaves de API e webhooks para integrações com sistemas externos.
              </p>
            </div>
          </div>

          {/* API Keys Section */}
          <div className="dash-section">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5" style={{ color: '#25D366' }} />
                <h4 className="font-semibold" style={{ color: '#111B21' }}>Chaves de API</h4>
              </div>
              <button
                className="dash-btn-primary text-sm"
                onClick={() => { setNewKey(null); setShowNewKeyModal(true); }}
              >
                <Plus className="w-4 h-4" />
                Nova Chave
              </button>
            </div>

            {apiKeys.length === 0 ? (
              <div className="text-center py-8" style={{ color: '#8696A0' }}>
                <Key className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Nenhuma chave de API criada</p>
                <p className="text-xs mt-1">Crie uma chave para integrar sistemas externos ao ZEHLA</p>
              </div>
            ) : (
              <div className="space-y-3">
                {apiKeys.map((key) => (
                  <div key={key.id} className="flex items-center justify-between p-4 rounded-xl border border-[#E9EDEF]">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate" style={{ color: '#111B21' }}>{key.name}</p>
                        {!key.isActive && (
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(234, 67, 53, 0.1)', color: '#EA4335' }}>
                            Revogada
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-mono mt-1" style={{ color: '#8696A0' }}>{key.keyPrefix}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: '#8696A0' }}>
                        <span>Permissões: {key.permissions.join(', ')}</span>
                        <span>Escopos: {key.scopes.join(', ')}</span>
                        <span>Rate: {key.rateLimit}/min</span>
                        {key.lastUsedAt && <span>Último uso: {new Date(key.lastUsedAt).toLocaleDateString('pt-BR')}</span>}
                      </div>
                    </div>
                    <button
                      className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                      style={{ color: '#EA4335' }}
                      onClick={async () => {
                        if (confirm(`Revogar chave "${key.name}"?`)) {
                          await fetch(`/api/marketplace/api-keys?id=${key.id}`, { method: 'DELETE' });
                          setApiKeys(prev => prev.map(k => k.id === key.id ? { ...k, isActive: false, revokedAt: new Date() } : k));
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Webhook Subscriptions Section */}
          <div className="dash-section">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Webhook className="w-5 h-5" style={{ color: '#25D366' }} />
                <h4 className="font-semibold" style={{ color: '#111B21' }}>Webhooks</h4>
              </div>
              <button
                className="dash-btn-primary text-sm"
                onClick={() => { setNewWebhookSecret(null); setShowNewWebhookModal(true); }}
              >
                <Plus className="w-4 h-4" />
                Nova Assinatura
              </button>
            </div>

            {subscriptions.length === 0 ? (
              <div className="text-center py-8" style={{ color: '#8696A0' }}>
                <Webhook className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Nenhum webhook configurado</p>
                <p className="text-xs mt-1">Cadencie URLs para receber notificações em tempo real</p>
              </div>
            ) : (
              <div className="space-y-3">
                {subscriptions.map((sub) => (
                  <div key={sub.id} className="p-4 rounded-xl border border-[#E9EDEF]">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium" style={{ color: '#111B21' }}>{sub.name}</p>
                          {!sub.isActive && (
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(234, 67, 53, 0.1)', color: '#EA4335' }}>
                              Desabilitado
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-mono mt-1" style={{ color: '#8696A0' }}>{sub.endpointUrl}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {sub.events.map((event: string) => (
                            <span key={event} className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(37, 211, 102, 0.1)', color: '#128C7E' }}>
                              {event}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {sub.failureCount > 0 && (
                          <span className="text-xs flex items-center gap-1" style={{ color: '#EA4335' }}>
                            <AlertTriangle className="w-3 h-3" />
                            {sub.failureCount} falhas
                          </span>
                        )}
                        <button
                          className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                          style={{ color: '#EA4335' }}
                          onClick={async () => {
                            if (confirm(`Remover webhook "${sub.name}"?`)) {
                              await fetch(`/api/marketplace/subscriptions?id=${sub.id}`, { method: 'DELETE' });
                              setSubscriptions(prev => prev.filter(s => s.id !== sub.id));
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Delivery Logs */}
          {recentLogs.length > 0 && (
            <div className="dash-section">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5" style={{ color: '#25D366' }} />
                <h4 className="font-semibold" style={{ color: '#111B21' }}>Entregas Recentes</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E9EDEF]">
                      <th className="text-left py-2 px-3" style={{ color: '#667781' }}>Evento</th>
                      <th className="text-left py-2 px-3" style={{ color: '#667781' }}>Endpoint</th>
                      <th className="text-left py-2 px-3" style={{ color: '#667781' }}>Status</th>
                      <th className="text-left py-2 px-3" style={{ color: '#667781' }}>Tempo</th>
                      <th className="text-left py-2 px-3" style={{ color: '#667781' }}>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLogs.map((log) => (
                      <tr key={log.id} className="border-b border-[#F0F2F5]">
                        <td className="py-2 px-3 font-mono text-xs" style={{ color: '#111B21' }}>{log.eventType}</td>
                        <td className="py-2 px-3 font-mono text-xs truncate max-w-[200px]" style={{ color: '#667781' }}>{log.endpointUrl}</td>
                        <td className="py-2 px-3">
                          {log.status === 'entregue' ? (
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(37, 211, 102, 0.1)', color: '#128C7E' }}>
                              {log.responseStatus}
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(234, 67, 53, 0.1)', color: '#EA4335' }}>
                              {log.responseStatus || 'erro'}
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-xs" style={{ color: '#8696A0' }}>{log.responseTime ? `${log.responseTime}ms` : '-'}</td>
                        <td className="py-2 px-3 text-xs" style={{ color: '#8696A0' }}>{new Date(log.createdAt).toLocaleString('pt-BR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
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

      {/* New API Key Modal */}
      {showNewKeyModal && (
        <NewKeyModal
          onClose={() => setShowNewKeyModal(false)}
          onSuccess={(keyData) => {
            setNewKey(keyData);
            setApiKeys(prev => [keyData.key, ...prev]);
          }}
        />
      )}

      {/* New Webhook Modal */}
      {showNewWebhookModal && (
        <NewWebhookModal
          onClose={() => setShowNewWebhookModal(false)}
          onSuccess={(subData) => {
            setNewWebhookSecret(subData.secretKey);
            setSubscriptions(prev => [subData.subscription, ...prev]);
          }}
        />
      )}

      {/* Display New Key */}
      {newKey && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-2 mb-4">
              <Key className="w-5 h-5" style={{ color: '#25D366' }} />
              <h3 className="text-lg font-bold" style={{ color: '#111B21' }}>Chave Criada com Sucesso!</h3>
            </div>
            <div className="p-4 rounded-xl mb-4" style={{ backgroundColor: '#F0F2F5' }}>
              <p className="text-xs mb-2" style={{ color: '#667781' }}>Guarde esta chave! Ela não será exibida novamente.</p>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono break-all flex-1" style={{ color: '#111B21' }}>{newKey.plainKey}</code>
                <button
                  className="p-1.5 rounded-lg hover:bg-white transition-colors"
                  onClick={() => navigator.clipboard.writeText(newKey.plainKey)}
                >
                  <Copy className="w-4 h-4" style={{ color: '#25D366' }} />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4" style={{ color: '#F59E0B' }} />
              <p className="text-xs" style={{ color: '#667781' }}>Armazene em um local seguro (variável de ambiente, vault, etc.)</p>
            </div>
            <button
              className="dash-btn-primary w-full"
              onClick={() => setNewKey(null)}
            >
              Entendi, fechar
            </button>
          </div>
        </div>
      )}

      {/* Display New Webhook Secret */}
      {newWebhookSecret && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-2 mb-4">
              <Webhook className="w-5 h-5" style={{ color: '#25D366' }} />
              <h3 className="text-lg font-bold" style={{ color: '#111B21' }}>SecretKey do Webhook</h3>
            </div>
            <div className="p-4 rounded-xl mb-4" style={{ backgroundColor: '#F0F2F5' }}>
              <p className="text-xs mb-2" style={{ color: '#667781' }}>Guarde este secretKey! Ele será usado para verificar a assinatura HMAC.</p>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono break-all flex-1" style={{ color: '#111B21' }}>{newWebhookSecret}</code>
                <button
                  className="p-1.5 rounded-lg hover:bg-white transition-colors"
                  onClick={() => navigator.clipboard.writeText(newWebhookSecret)}
                >
                  <Copy className="w-4 h-4" style={{ color: '#25D366' }} />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4" style={{ color: '#F59E0B' }} />
              <p className="text-xs" style={{ color: '#667781' }}>Use este secretKey para validar o header Zehla-Signature nos webhooks recebidos.</p>
            </div>
            <button
              className="dash-btn-primary w-full"
              onClick={() => setNewWebhookSecret(null)}
            >
              Entendi, fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function NewKeyModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (data: any) => void }) {
  const [name, setName] = useState('');
  const [permissions, setPermissions] = useState<string[]>(['read']);
  const [scopes, setScopes] = useState<string[]>(['reservations', 'rooms']);
  const [rateLimit, setRateLimit] = useState(100);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name) return;
    setLoading(true);
    try {
      const res = await fetch('/api/marketplace/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, permissions, scopes, rateLimit }),
      });
      const data = await res.json();
      if (data.key) {
        onSuccess(data);
        onClose();
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <h3 className="text-lg font-bold mb-4" style={{ color: '#111B21' }}>Nova Chave de API</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#667781' }}>Nome</label>
            <input
              className="dash-input"
              placeholder="Ex: Fechadura Bluetooth"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#667781' }}>Permissões</label>
            <div className="flex gap-2">
              {['read', 'write', 'admin'].map(p => (
                <button
                  key={p}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                    permissions.includes(p)
                      ? 'border-[#25D366] text-[#25D366] bg-green-50'
                      : 'border-[#E9EDEF] text-[#667781]'
                  }`}
                  onClick={() => setPermissions(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#667781' }}>Escopos</label>
            <div className="flex flex-wrap gap-2">
              {['reservations', 'rooms', 'payments', 'guests'].map(s => (
                <button
                  key={s}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                    scopes.includes(s)
                      ? 'border-[#25D366] text-[#25D366] bg-green-50'
                      : 'border-[#E9EDEF] text-[#667781]'
                  }`}
                  onClick={() => setScopes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#667781' }}>Rate Limit (req/min)</label>
            <input
              className="dash-input"
              type="number"
              value={rateLimit}
              onChange={e => setRateLimit(parseInt(e.target.value) || 100)}
            />
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <button className="dash-btn-secondary flex-1" onClick={onClose}>Cancelar</button>
          <button className="dash-btn-primary flex-1" onClick={handleSubmit} disabled={loading || !name}>
            {loading ? 'Criando...' : 'Criar Chave'}
          </button>
        </div>
      </div>
    </div>
  );
}

function NewWebhookModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (data: any) => void }) {
  const [name, setName] = useState('');
  const [endpointUrl, setEndpointUrl] = useState('');
  const [events, setEvents] = useState<string[]>(['reservation.created']);
  const [loading, setLoading] = useState(false);

  const availableEvents = [
    'reservation.created',
    'reservation.cancelled',
    'reservation.checked_in',
    'reservation.checked_out',
    'payment.confirmed',
    'payment.refunded',
    'invoice.emitted',
    'invoice.cancelled',
  ];

  const handleSubmit = async () => {
    if (!name || !endpointUrl || events.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch('/api/marketplace/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, endpointUrl, events }),
      });
      const data = await res.json();
      if (data.subscription) {
        onSuccess(data);
        onClose();
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <h3 className="text-lg font-bold mb-4" style={{ color: '#111B21' }}>Nova Assinatura de Webhook</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#667781' }}>Nome</label>
            <input
              className="dash-input"
              placeholder="Ex: Fechadura Eletrônica"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#667781' }}>URL do Endpoint</label>
            <input
              className="dash-input"
              placeholder="https://seu-sistema.com/webhooks/zehla"
              value={endpointUrl}
              onChange={e => setEndpointUrl(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#667781' }}>Eventos</label>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
              {availableEvents.map(event => (
                <button
                  key={event}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                    events.includes(event)
                      ? 'border-[#25D366] text-[#25D366] bg-green-50'
                      : 'border-[#E9EDEF] text-[#667781]'
                  }`}
                  onClick={() => setEvents(prev => prev.includes(event) ? prev.filter(x => x !== event) : [...prev, event])}
                >
                  {event}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <button className="dash-btn-secondary flex-1" onClick={onClose}>Cancelar</button>
          <button className="dash-btn-primary flex-1" onClick={handleSubmit} disabled={loading || !name || !endpointUrl}>
            {loading ? 'Criando...' : 'Criar Assinatura'}
          </button>
        </div>
      </div>
    </div>
  );
}
