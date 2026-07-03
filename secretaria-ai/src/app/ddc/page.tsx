'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { DDCHeader } from '@/components/ddc/DDCHeader';
import { RevenueMetrics } from '@/components/ddc/RevenueMetrics';
import { AILiveFeed } from '@/components/ddc/AILiveFeed';
import { GuestCRMPipeline } from '@/components/ddc/GuestCRMPipeline';
import { TrainingCenter } from '@/components/ddc/TrainingCenter';
import { QuickActionsBar } from '@/components/ddc/QuickActionsBar';
import { useDDCMetrics } from '@/lib/ddc/use-ddc-metrics';
import { useAILiveFeed } from '@/lib/ddc/use-ai-live-feed';
import { useGuestPipeline } from '@/lib/ddc/use-guest-pipeline';
import { useDDCNotifications } from '@/lib/ddc/use-ddc-notifications';
import { mockRevenueMetrics, mockPropertySettings } from '@/lib/ddc/mock-data';
import { adaptRevenueMetrics } from '@/lib/ddc/ddc-mapper';
import type { AIStatus } from '@/types/ddc';
import { ZelladorChat } from '@/components/ddc/ZelladorChat';
import { Badge } from '@/components/ui/badge';
import { Toaster, toast } from 'sonner';
import {
  Settings,
  MessageSquare,
  Building2,
  Smartphone,
  CreditCard,
  Sliders,
  Sparkles,
  Lock,
  CheckCircle2,
  Activity,
  ChevronRight,
  ShieldCheck,
  Save,
  Loader2,
  Info
} from 'lucide-react';

export default function DDCDashboardPage() {
  // Custom hooks
  const { metrics, aiStatus, isLoading } = useDDCMetrics('today', true);
  const { conversations, selectedConversation, selectConversation, sendMessage, escalateConversation } = useAILiveFeed();
  const { pipeline, allGuests, updateGuestStatus, setFilters } = useGuestPipeline();
  const { notifications, unreadCount, markAsRead } = useDDCNotifications(true);

  // Local state
  const [activeTab, setActiveTab] = useState('overview');
  const [propertyName, setPropertyName] = useState('Minha Pousada');
  const [currentPlan, setCurrentPlan] = useState<string>('trial');
  const [subTab, setSubTab] = useState('geral');
  const [showRecargaMock, setShowRecargaMock] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Settings edit states
  const [editPropertyName, setEditPropertyName] = useState('');
  const [aiVoiceTone, setAiVoiceTone] = useState('friendly');

  const router = useRouter();

  useEffect(() => {
    fetch('/api/ddc/property-name')
      .then(r => r.json())
      .then(d => {
        const name = d.name || 'Minha Pousada';
        setPropertyName(name);
        setEditPropertyName(name);
        setCurrentPlan(d.plan || 'trial');
      })
      .catch(() => {
        setPropertyName('Minha Pousada');
        setEditPropertyName('Minha Pousada');
        setCurrentPlan('trial');
      });
  }, []);

  const aiStatusLocal: AIStatus = aiStatus?.status || 'online';

  const handleActionClick = (action: string) => {
    setActiveTab(action);
  };

  const handleNotificationClick = () => {
    console.log('Notifications clicked');
  };

  // Save Settings to database API
  async function handleSaveGeral(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await fetch('/api/ddc/property-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editPropertyName }),
      });
      if (response.ok) {
        setPropertyName(editPropertyName);
        toast.success('Configurações da pousada salvas com sucesso!');
      } else {
        toast.error('Erro ao salvar configurações.');
      }
    } catch {
      toast.error('Erro de conexão ao salvar configurações.');
    } finally {
      setIsSaving(false);
    }
  }

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5, ease: 'easeOut' as const }
    }
  } as const;

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Toaster position="top-center" richColors />

      {/* Header */}
      <DDCHeader
        propertyName={propertyName}
        aiStatus={aiStatusLocal}
        notificationCount={unreadCount}
        onOpenNotifications={handleNotificationClick}
      />

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 px-6 pt-4 max-w-[1920px] mx-auto mb-2 select-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
            activeTab !== 'zellador'
              ? 'bg-white/[0.06] text-white border-white/[0.08] shadow-sm'
              : 'text-zinc-500 border-transparent hover:text-zinc-300 hover:bg-white/[0.03]'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          Command Center
        </button>
        <button
          onClick={() => setActiveTab('zellador')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
            activeTab === 'zellador'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 shadow-sm'
              : 'text-zinc-500 border-transparent hover:text-zinc-300 hover:bg-white/[0.03]'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Zellador (Suporte IA)
          <Badge className="bg-emerald-500/20 text-emerald-400 text-[8px] px-1.5 py-0 border-0 ml-1.5">MAX</Badge>
        </button>
      </div>

      {/* Main Content */}
      {activeTab !== 'zellador' ? (
        <div className="p-6 max-w-[1920px] mx-auto space-y-6">
          
          {/* Quick Actions Bar */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            <QuickActionsBar onActionClick={handleActionClick} activeAction={activeTab} />
          </motion.div>

          {/* ONBOARDING CHECKLIST SECTION (Impeccable Onboard) */}
          {activeTab === 'overview' && (
            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              className="bg-[#121216] border border-white/[0.04] rounded-xl p-5"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-base font-extrabold text-white tracking-tight font-serif flex items-center gap-2">
                    <span>🚀</span> Primeiros passos com o Seu Zélla
                  </h3>
                  <p className="text-zinc-400 text-xs mt-1">
                    Conclua as etapas iniciais para colocar o assistente cognitivo da sua pousada para vender.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-36 h-2 bg-white/[0.04] rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-2/3" />
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">2/3 CONCLUÍDOS</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Step 1 */}
                <div className="bg-[#181820]/50 border border-white/[0.04] rounded-lg p-3.5 flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">1. Carga de FAQ</h4>
                    <p className="text-zinc-500 text-[10px] mt-0.5 leading-normal">
                      Regras de hospedagem e FAQs importadas com sucesso no banco de dados.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-[#181820]/50 border border-white/[0.04] rounded-lg p-3.5 flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">2. Conexão do Provedor</h4>
                    <p className="text-zinc-500 text-[10px] mt-0.5 leading-normal">
                      Configurações de IA prontas. Canal de WhatsApp mock/ativo conectado.
                    </p>
                  </div>
                </div>

                {/* Step 3 (Pending) */}
                <button
                  onClick={() => {
                    setActiveTab('settings');
                    setSubTab('linkinbio');
                  }}
                  className="bg-[#181820]/50 hover:bg-[#1a1a24] border border-dashed border-zinc-700/60 hover:border-emerald-500/30 rounded-lg p-3.5 flex items-start gap-3 text-left transition-all cursor-pointer group"
                >
                  <div className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 shrink-0 mt-0.5 group-hover:border-emerald-500/30 group-hover:text-emerald-400 transition-colors">
                    <Smartphone className="w-3 h-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">3. Link-in-Bio Profissional</h4>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-emerald-400 transition-colors" />
                    </div>
                    <p className="text-zinc-500 text-[10px] mt-0.5 leading-normal">
                      Configure os links e cores da sua página do Instagram para reservas.
                    </p>
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' ? (
            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              className="bg-[#121216] border border-white/[0.04] rounded-xl p-6 sm:p-8"
            >
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 font-serif">
                <Settings className="w-5 h-5 text-emerald-400" />
                Painel de Configurações da Pousada
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Sub-abas laterais */}
                <div className="md:col-span-1 flex flex-col gap-1.5 select-none">
                  <button 
                    onClick={() => setSubTab('geral')}
                    className={`px-4 py-2.5 rounded-lg text-left text-xs font-bold transition-all cursor-pointer flex items-center gap-2.5 border ${
                      subTab === 'geral' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-sm' 
                        : 'text-zinc-400 border-transparent hover:bg-white/[0.02] hover:text-zinc-200'
                    }`}
                  >
                    <Sliders className="w-4 h-4" />
                    Geral & IA
                  </button>
                  <button 
                    onClick={() => setSubTab('linkinbio')}
                    className={`px-4 py-2.5 rounded-lg text-left text-xs font-bold transition-all cursor-pointer flex items-center gap-2.5 border ${
                      subTab === 'linkinbio' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-sm' 
                        : 'text-zinc-400 border-transparent hover:bg-white/[0.02] hover:text-zinc-200'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    Link-in-Bio Profissional
                  </button>
                  <button 
                    onClick={() => setSubTab('faturamento')}
                    className={`px-4 py-2.5 rounded-lg text-left text-xs font-bold transition-all cursor-pointer flex items-center gap-2.5 border ${
                      subTab === 'faturamento' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-sm' 
                        : 'text-zinc-400 border-transparent hover:bg-white/[0.02] hover:text-zinc-200'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    Faturamento & Consumo
                  </button>
                </div>

                {/* Conteúdo da sub-aba */}
                <div className="md:col-span-3 bg-[#0a0a0f]/40 border border-white/[0.04] rounded-lg p-6">
                  
                  {subTab === 'geral' && (
                    <form onSubmit={handleSaveGeral} className="space-y-4">
                      <div>
                        <h3 className="text-sm font-extrabold text-white font-serif">Configurações Gerais</h3>
                        <p className="text-zinc-400 text-xs mt-1">Ajuste o tom de voz do seu assistente cognitivo e as informações básicas da sua pousada.</p>
                      </div>
                      
                      <div className="space-y-4 pt-2">
                        <div className="space-y-1.5">
                          <Label htmlFor="prop-name" className="text-zinc-300 text-xs font-semibold">Nome da Pousada</Label>
                          <Input 
                            id="prop-name"
                            type="text" 
                            value={editPropertyName} 
                            onChange={(e) => setEditPropertyName(e.target.value)} 
                            className="bg-[#121216] border-white/[0.08] rounded-lg text-xs text-white" 
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="ai-tone" className="text-zinc-300 text-xs font-semibold">Tom de Voz da IA</Label>
                          <select 
                            id="ai-tone"
                            value={aiVoiceTone}
                            onChange={(e) => setAiVoiceTone(e.target.value)}
                            className="w-full bg-[#121216] border border-white/[0.08] rounded-lg p-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                          >
                            <option value="friendly">Receptivo & Amigável (Padrão)</option>
                            <option value="sophisticated">Formal & Sofisticado</option>
                          </select>
                        </div>
                      </div>

                      <div className="pt-2">
                        <Button 
                          type="submit"
                          disabled={isSaving}
                          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold text-xs rounded-lg flex items-center gap-2 cursor-pointer transition-colors active:scale-[0.98]"
                        >
                          {isSaving ? (
                            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Salvando...</>
                          ) : (
                            <><Save className="w-3.5 h-3.5" /> Salvar Alterações</>
                          )}
                        </Button>
                      </div>
                    </form>
                  )}

                  {subTab === 'linkinbio' && (
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h3 className="text-sm font-extrabold text-white font-serif">Configuração do Link-in-Bio</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 w-fit">
                          Ativo (seuzella.com/pousada)
                        </span>
                      </div>
                      
                      {/* Lógica de Trava LITE: Sóbria, Premium e Minimalista (Impeccable Quieter) */}
                      {currentPlan === 'lite' ? (
                        <div className="bg-[#121216] border border-white/[0.04] rounded-lg p-6 space-y-5">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-white/[0.06] flex items-center justify-center text-zinc-400 shrink-0">
                              <Lock className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-bold text-white">Link-in-Bio Profissional</h4>
                                <Badge className="bg-emerald-500/20 text-emerald-400 text-[8px] font-bold border-0">PREMIUM</Badge>
                              </div>
                              <p className="text-zinc-400 text-[11px] leading-relaxed mt-1">
                                O Link-in-Bio profissional centraliza seus canais de atendimento, integra feeds dinâmicos e converte acessos do Instagram em reservas diretas sem comissão.
                              </p>
                            </div>
                          </div>

                          <div className="bg-[#0a0a0f] rounded-lg p-4 border border-white/[0.04]">
                            <p className="text-xs font-serif font-bold text-zinc-300 italic text-center">
                              &ldquo;Aumente a conversão da sua pousada com o Link-in-Bio premium do Seu Zélla.&rdquo;
                            </p>
                          </div>

                          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-white/[0.04]">
                            <p className="text-[10px] text-zinc-500 leading-normal max-w-sm">
                              Esta ferramenta não está liberada no seu pacote LITE. Faça upgrade para o plano PRO ou MAX.
                            </p>
                            <Button 
                              onClick={() => setSubTab('faturamento')}
                              className="w-full sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] transition-all"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              Fazer Upgrade
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // Plano PRO, MAX ou TRIAL ativo (primeiros 7 dias)
                        <div className="space-y-4">
                          <p className="text-zinc-400 text-xs">Customize os links, fotos e cores do seu perfil in-app do Instagram.</p>
                          <div className="space-y-3 pt-2">
                            <div className="space-y-1.5">
                              <label className="block text-xs font-semibold text-zinc-300">Título do Perfil</label>
                              <input type="text" defaultValue="Pousada Serenity" className="w-full bg-[#121216] border border-white/[0.08] rounded-lg p-2 text-xs text-white focus:outline-none" />
                            </div>
                            <div className="space-y-1.5">
                              <label className="block text-xs font-semibold text-zinc-300">Subtítulo / Descrição</label>
                              <input type="text" defaultValue="✨ Seu refúgio em meio à natureza" className="w-full bg-[#121216] border border-white/[0.08] rounded-lg p-2 text-xs text-white focus:outline-none" />
                            </div>
                            <div className="pt-2">
                              <button 
                                type="button"
                                onClick={() => toast.success('Configurações do Link-in-Bio salvas com sucesso!')}
                                className="px-4 py-2 bg-emerald-500 text-zinc-950 font-bold text-xs rounded-lg hover:bg-emerald-600 transition-colors cursor-pointer"
                              >
                                Salvar Alterações
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {subTab === 'faturamento' && (
                    <div className="space-y-5">
                      <div>
                        <h3 className="text-sm font-extrabold text-white font-serif">Faturamento & Consumo</h3>
                        <p className="text-zinc-400 text-xs mt-1">Gerencie a assinatura e acompanhe as cotas de mensagens mensais.</p>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-[#121216] border border-white/[0.06] rounded-lg p-4">
                          <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Plano Ativo</div>
                          <div className="text-base font-extrabold text-white mt-1.5 uppercase font-mono">{currentPlan}</div>
                        </div>
                        <div className="bg-[#121216] border border-white/[0.06] rounded-lg p-4">
                          <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Mensagens Consumidas</div>
                          <div className="text-base font-extrabold text-white mt-1.5 font-mono">
                            {currentPlan === 'lite' ? '512 / 500' : '924 / Ilimitado'}
                          </div>
                        </div>
                      </div>

                      {/* Alerta de cota excedida de mensagens para o plano LITE */}
                      {currentPlan === 'lite' && (
                        <div className="bg-[#1c1214] border border-red-500/10 rounded-lg p-4 space-y-3">
                          <div className="flex gap-3">
                            <div className="w-7 h-7 rounded bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                              <Info className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-white">Mensagens Excedidas</h4>
                              <p className="text-[10px] text-zinc-400 leading-relaxed mt-0.5">
                                Você atingiu 512 mensagens neste ciclo (limite de 500). Adquira créditos adicionais para que o assistente do Seu Zélla continue atendendo no WhatsApp.
                              </p>
                            </div>
                          </div>
                          <div className="pt-3 border-t border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="text-[11px] text-zinc-300">
                              Adicionar pacote de <strong>250 mensagens extras</strong> por <strong className="text-emerald-400">R$ 97,00</strong>
                            </div>
                            <button 
                              onClick={() => {
                                setShowRecargaMock(true);
                                toast.success('QR Code do PIX gerado com sucesso!');
                              }}
                              className="w-full sm:w-auto px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                            >
                              Comprar via PIX
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {showRecargaMock && (
                        <div className="bg-[#121216] border border-white/[0.04] rounded-lg p-4 text-center space-y-4 animate-fadeIn">
                          <p className="text-xs text-white font-bold">Pagamento da Recarga de Créditos (PIX)</p>
                          <div className="w-32 h-32 bg-white p-2 mx-auto rounded-lg flex items-center justify-center border border-white/[0.08]">
                            <span className="text-black font-mono text-[8px] break-all select-all font-bold">ZELLAPAY-RECARGA-PIX-MOCK-2026</span>
                          </div>
                          <p className="text-[9px] text-zinc-500 max-w-xs mx-auto leading-normal">
                            Copie a chave acima ou escaneie para efetuar a recarga mockada. Clique no botão de confirmação para validar.
                          </p>
                          <div className="flex gap-2 justify-center">
                            <button 
                              onClick={() => {
                                toast.success('Pagamento PIX confirmado! 250 mensagens adicionadas.');
                                setShowRecargaMock(false);
                              }}
                              className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 text-[10px] font-bold rounded-lg cursor-pointer transition-colors"
                            >
                              Confirmar Pagamento
                            </button>
                            <button 
                              onClick={() => setShowRecargaMock(false)}
                              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-[10px] font-bold rounded-lg cursor-pointer transition-colors"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Left Column - Revenue Metrics */}
              <motion.div
                variants={fadeIn}
                className="lg:col-span-2"
              >
                <RevenueMetrics
                  metrics={adaptRevenueMetrics(metrics) || mockRevenueMetrics}
                />
              </motion.div>

              {/* Right Column - Quick Stats */}
              <motion.div
                variants={fadeIn}
                className="space-y-6"
              >
                {/* AI Status Card */}
                <div className="bg-[#121216] border border-white/[0.04] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3.5">
                    <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">Status da IA</h3>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-zinc-400 font-bold capitalize">{aiStatusLocal}</span>
                      <div className={`w-2 h-2 rounded-full ${
                        aiStatusLocal === 'online' ? 'bg-emerald-500' :
                        aiStatusLocal === 'processing' ? 'bg-violet-500' :
                        aiStatusLocal === 'error' ? 'bg-red-500' :
                        'bg-gray-500'
                      } animate-pulse`} />
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between border-b border-white/[0.03] pb-2">
                      <span className="text-xs text-zinc-400">Conversas Ativas</span>
                      <span className="text-xs font-bold text-white font-mono">{aiStatus?.activeConversations || 12}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/[0.03] pb-2">
                      <span className="text-xs text-zinc-400">Atendimentos Hoje</span>
                      <span className="text-xs font-bold text-white font-mono">{metrics?.today?.aiAttended || 45}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-400">Tempo de Resposta</span>
                      <span className="text-xs font-bold text-white font-mono">{aiStatus?.averageResponseTime || 2.3}s</span>
                    </div>
                  </div>
                </div>

                {/* Notifications Preview */}
                <div className="bg-[#121216] border border-white/[0.04] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3.5">
                    <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">Notificações</h3>
                    {unreadCount > 0 && (
                      <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border border-[#121216]">
                        <span className="text-[9px] font-bold text-white">{unreadCount}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    {notifications.slice(0, 3).map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-2.5 rounded-lg border transition-all cursor-pointer hover:bg-white/[0.01] ${
                          notif.status === 'unread'
                            ? 'bg-emerald-500/5 border-emerald-500/10'
                            : 'bg-[#0a0a0f]/40 border-white/[0.04]'
                        }`}
                        onClick={() => {
                          markAsRead(notif.id);
                          toast.info(`Notificação: ${notif.title}`);
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white truncate">{notif.title}</div>
                            <div className="text-[10px] text-zinc-500 truncate mt-0.5">{notif.message}</div>
                          </div>
                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1 ${  
                            notif.priority === 'urgent' ? 'bg-red-500 animate-pulse' :  
                            notif.priority === 'high' ? 'bg-amber-500' :  
                            'bg-blue-500'  
                          }`} />  
                        </div>  
                      </div>  
                    ))}  
                  </div>  
                </div>  
              </motion.div>

              {/* CRM Pipeline & Live Feed Section */}
              <motion.div variants={fadeIn} className="lg:col-span-3">  
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">  
                  <AILiveFeed  
                    conversations={conversations}  
                    isConnected={true}  
                    onReply={(conversationId, message) => sendMessage(conversationId, message)}  
                    onEscalate={(conversationId) => escalateConversation(conversationId)}  
                    onViewDetails={(conversationId) => selectConversation(conversationId)}  
                  />  
                  <GuestCRMPipeline
                    pipeline={pipeline}
                    allGuests={allGuests}
                    onStatusChange={updateGuestStatus}
                    onFilterChange={setFilters}
                  />  
                </div>  
              </motion.div>

              {/* Training Center Section */}
              <motion.div variants={fadeIn} className="lg:col-span-3">  
                <TrainingCenter />  
              </motion.div>
            </motion.div>
          )}

          {/* Bottom Status Bar */}
          <motion.div  
            variants={fadeIn}  
            initial="hidden"  
            animate="visible"  
            className="bg-[#121216] border border-white/[0.04] rounded-xl p-3"  
          >  
            <div className="flex items-center justify-between">  
              <div className="flex items-center gap-4 flex-wrap">  
                <div className="flex items-center gap-2">  
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />  
                  <span className="text-[10px] text-zinc-500 font-mono">  
                    ZELLA COGNITIVE OS v2.4.1  
                  </span>  
                </div>  
                <div className="hidden sm:block h-4 w-px bg-white/[0.06]" />  
                <span className="text-[10px] text-zinc-500 font-mono">  
                  Property: {propertyName}  
                </span>  
                <div className="hidden sm:block h-4 w-px bg-white/[0.06]" />  
                <span className="text-[10px] text-zinc-500 font-mono">  
                  {allGuests.length} leads • {conversations.length} conversas ativas  
                </span>  
              </div>  
              <div className="flex items-center gap-2">  
                <span className="text-[9px] text-emerald-400 font-semibold font-mono uppercase tracking-wider">  
                  Sistemas Operacionais 100% online  
                </span>  
              </div>  
            </div>  
          </motion.div>  
        </div>  
      ) : (
        <div className="p-6 max-w-[1920px] mx-auto">
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            className="max-w-3xl mx-auto"
          >
            <ZelladorChat userPlan={currentPlan} />
          </motion.div>
        </div>
      )}
    </div>
  );
}
