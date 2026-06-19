'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Key,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Loader2,
  Save,
  Plus,
  Trash2,
  Shield,
  Cpu,
  Globe,
  Zap,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface ProviderConfig {
  id: string;
  provider: string;
  model: string;
  apiKey: string;
  apiSecret: string;
  baseUrl: string;
  isActive: boolean;
  hasKey: boolean;
  usageCurrent: number;
  notes: string;
}

const PROVIDER_INFO: Record<string, { name: string; icon: string; color: string; tier: string; url: string; docsUrl: string; defaultModel: string; notes?: string }> = {
  zai_sdk: {
    name: 'Z.ai Web SDK',
    icon: '⚡',
    color: 'emerald',
    tier: 'Gratuito (Z.ai)',
    url: 'https://z.ai',
    docsUrl: '#',
    defaultModel: 'default',
  },
  gemini: {
    name: 'Google Gemini',
    icon: '✨',
    color: 'blue',
    tier: 'Gratuito / Pago',
    url: 'https://ai.google.dev',
    docsUrl: 'https://ai.google.dev/tutorials/rest_quickstart',
    defaultModel: 'gemini-2.5-flash',
  },
  openai: {
    name: 'OpenAI',
    icon: '🤖',
    color: 'green',
    tier: 'Pago ($0.15/1M tokens)',
    url: 'https://platform.openai.com',
    docsUrl: 'https://platform.openai.com/api-keys',
    defaultModel: 'gpt-4o-mini',
  },
  groq: {
    name: 'Groq',
    icon: '🚀',
    color: 'orange',
    tier: 'Gratuito (rate-limited)',
    url: 'https://console.groq.com',
    docsUrl: 'https://console.groq.com/keys',
    defaultModel: 'llama-3.3-70b-versatile',
  },
  huggingface: {
    name: 'HuggingFace',
    icon: '🤗',
    color: 'yellow',
    tier: 'Gratuito / Pago',
    url: 'https://huggingface.co',
    docsUrl: 'https://huggingface.co/settings/tokens',
    defaultModel: 'mistral-small',
  },
  anthropic: {
    name: 'Anthropic Claude',
    icon: '🧠',
    color: 'purple',
    tier: 'Pago ($0.25/1M tokens)',
    url: 'https://console.anthropic.com',
    docsUrl: 'https://console.anthropic.com/settings/keys',
    defaultModel: 'claude-3-haiku-20240307',
  },
};

export function ApiKeysPanel() {
  const [configs, setConfigs] = useState<ProviderConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [editingKeys, setEditingKeys] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      const token = localStorage.getItem('zehla-token');
      const res = await fetch('/api/config/keys', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success) {
        setConfigs(data.data || []);
      } else {
        // Use defaults if no tenant yet
        setConfigs(
          Object.keys(PROVIDER_INFO).map((provider) => ({
            id: '',
            provider,
            model: PROVIDER_INFO[provider].defaultModel,
            apiKey: '',
            apiSecret: '',
            baseUrl: '',
            isActive: provider === 'zai_sdk',
            hasKey: false,
            usageCurrent: 0,
            notes: PROVIDER_INFO[provider].notes || '',
          }))
        );
      }
    } catch {
      setConfigs(
        Object.keys(PROVIDER_INFO).map((provider) => ({
          id: '',
          provider,
          model: PROVIDER_INFO[provider].defaultModel,
          apiKey: '',
          apiSecret: '',
          baseUrl: '',
          isActive: provider === 'zai_sdk',
          hasKey: false,
          usageCurrent: 0,
          notes: '',
        }))
      );
    }
    setLoading(false);
  };

  const toggleKeyVisibility = (provider: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      if (next.has(provider)) next.delete(provider);
      else next.add(provider);
      return next;
    });
  };

  const updateKey = (provider: string, value: string) => {
    setEditingKeys((prev) => ({ ...prev, [provider]: value }));
  };

  const toggleProvider = async (provider: string, isActive: boolean) => {
    setSaving(provider);
    try {
      setMessage(null);
      const token = localStorage.getItem('zehla-token');
      await fetch('/api/config/keys', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ provider, isActive: !isActive }),
      });
      setConfigs((prev) =>
        prev.map((c) => (c.provider === provider ? { ...c, isActive: !isActive } : c))
      );
      setMessage({ type: 'success', text: `${PROVIDER_INFO[provider].name} ${!isActive ? 'ativado' : 'desativado'}` });
    } catch {
      setMessage({ type: 'error', text: 'Erro ao atualizar provedor' });
    }
    setSaving(null);
  };

  const saveKey = async (provider: string) => {
    const key = editingKeys[provider];
    if (!key?.trim()) {
      setMessage({ type: 'error', text: 'Insira uma chave API válida' });
      return;
    }
    setSaving(provider);
    try {
      setMessage(null);
      const token = localStorage.getItem('zehla-token');
      await fetch('/api/config/keys', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ provider, apiKey: key.trim(), model: PROVIDER_INFO[provider].defaultModel }),
      });
      setConfigs((prev) =>
        prev.map((c) => (c.provider === provider ? { ...c, hasKey: true, apiKey: key.trim() } : c))
      );
      setEditingKeys((prev) => {
        const next = { ...prev };
        delete next[provider];
        return next;
      });
      setMessage({ type: 'success', text: `Chave salva com sucesso! (${PROVIDER_INFO[provider].name})` });
    } catch {
      setMessage({ type: 'error', text: 'Erro ao salvar chave' });
    }
    setSaving(null);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="glass-card p-5 animate-pulse">
            <div className="h-6 bg-white/5 rounded w-1/3 mb-4" />
            <div className="h-10 bg-white/5 rounded w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
          <Key className="w-5 h-5 text-emerald-400" />
          Configuração de API Keys
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Configure os provedores de IA. O ZEHLA absorve todos os custos de token — o hotel não paga nada a mais.
        </p>
      </div>

      {/* Cost Model Banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 border border-emerald-500/20 bg-emerald-500/5"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-200 mb-1">
              Modelo de Custos: ZEHLA Absorve Tudo
            </h3>
            <p className="text-xs text-neutral-400">
              A SMARTHOTEL/ZEHLA absorve 100% dos custos de token de IA. O custo médio por pousada é inferior a R$2/mês.
              As chaves ficam configuradas aqui e os custos são pagos pela plataforma, não pelo hotel.
              Provedores gratuitos (Z.ai SDK, Gemini Flash, Groq) são recomendados para manter custos zero.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`glass-card p-3 flex items-center gap-2 border ${
              message.type === 'success' ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span className={`text-xs flex-1 ${message.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
              {message.text}
            </span>
            <button onClick={() => setMessage(null)} className="text-neutral-500 hover:text-neutral-300">
              <XCircle className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Provider Cards */}
      <div className="space-y-3">
        {configs.map((config) => {
          const info = PROVIDER_INFO[config.provider];
          if (!info) return null;
          const isEditing = !!editingKeys[config.provider];
          const isVisible = visibleKeys.has(config.provider);

          return (
            <motion.div
              key={config.provider}
              layout
              className="glass-card overflow-hidden"
            >
              {/* Provider Header */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{info.icon}</span>
                    <div>
                      <div className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
                        {info.name}
                        {config.isActive && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
                            ATIVO
                          </span>
                        )}
                        {config.hasKey && !config.isActive && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/20">
                            CHAVE SALVA
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-neutral-500">
                        {info.tier} • Modelo: <span className="font-mono text-neutral-400">{config.model}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Toggle Active */}
                    <button
                      onClick={() => toggleProvider(config.provider, config.isActive)}
                      disabled={saving === config.provider}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        config.isActive ? 'bg-emerald-500' : 'bg-white/10'
                      } ${saving === config.provider ? 'opacity-50' : ''}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          config.isActive ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* API Key Input */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-600" />
                    <input
                      type={isVisible ? 'text' : 'password'}
                      value={isEditing ? editingKeys[config.provider] : config.apiKey ? '••••••••••••••••' : ''}
                      onChange={(e) => updateKey(config.provider, e.target.value)}
                      placeholder="Insira sua API Key aqui..."
                      className="w-full pl-9 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-lg text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/30 font-mono transition-all"
                    />
                    {config.apiKey && !isEditing && (
                      <button
                        onClick={() => toggleKeyVisibility(config.provider)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                      >
                        {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>

                  {/* Save Button */}
                  {isEditing ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => saveKey(config.provider)}
                      disabled={saving === config.provider}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-50"
                    >
                      {saving === config.provider ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      Salvar
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setEditingKeys((prev) => ({ ...prev, [config.provider]: '' }))}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 text-xs font-medium rounded-lg transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {config.hasKey ? 'Alterar' : 'Configurar'}
                    </motion.button>
                  )}
                </div>

                {/* Provider info links */}
                <div className="flex items-center gap-3 mt-3">
                  <a
                    href={info.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-emerald-400/70 hover:text-emerald-400 flex items-center gap-1 transition-colors"
                  >
                    <Info className="w-3 h-3" />
                    Obter API Key
                  </a>
                  <a
                    href={info.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-neutral-600 hover:text-neutral-400 flex items-center gap-1 transition-colors"
                  >
                    <Globe className="w-3 h-3" />
                    {info.url}
                  </a>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Info Note */}
      <div className="glass-card p-4 border border-white/5">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
          <div className="text-[10px] text-neutral-500 space-y-1">
            <p>
              <strong className="text-neutral-400">Segurança:</strong> As API keys são armazenadas com criptografia no servidor. 
              A ZEHLA recomenda usar provedores gratuitos (Z.ai SDK, Gemini Flash, Groq) para manter custos zero.
            </p>
            <p>
              <strong className="text-neutral-400">LGPD:</strong> Dados processados pela IA ficam no Brasil (Google Vertex AI - São Paulo). 
              Nenhum dado de hóspedes é usado para treinar modelos de terceiros.
            </p>
            <p>
              <strong className="text-neutral-400">Ativação:</strong> As chaves ficam prontas para ativação. O toggle acima ativa/desativa cada provedor sem risco.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
