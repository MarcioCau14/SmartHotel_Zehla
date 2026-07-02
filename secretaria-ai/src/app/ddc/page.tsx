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
import { Settings, MessageSquare } from 'lucide-react';

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
  const router = useRouter();

  useEffect(() => {
    fetch('/api/ddc/property-name')
      .then(r => r.json())
      .then(d => {
        setPropertyName(d.name || 'Minha Pousada');
        setCurrentPlan(d.plan || 'trial');
      })
      .catch(() => {
        setPropertyName('Minha Pousada');
        setCurrentPlan('trial');
      });
  }, []);
  const aiStatusLocal: AIStatus = aiStatus?.status || 'online';

  const handleActionClick = (action: string) => {
    setActiveTab(action);
  };

  const handleNotificationClick = () => {
    // Open notifications panel
    console.log('Notifications clicked');
  };

  const handleUserMenuClick = () => {
    // Open user menu
    console.log('User menu clicked');
  };

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
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <DDCHeader
        propertyName={propertyName}
        aiStatus={aiStatusLocal}
        notificationCount={unreadCount}
        onOpenNotifications={handleNotificationClick}
      />

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 px-4 pt-4 max-w-[1920px] mx-auto mb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTab !== 'zellador'
              ? 'bg-white/[0.08] text-white border border-white/[0.1]'
              : 'text-white/50 hover:text-white/70 hover:bg-white/[0.03]'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          Command Center
        </button>
        <button
          onClick={() => setActiveTab('zellador')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'zellador'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'text-white/50 hover:text-white/70 hover:bg-white/[0.03]'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Zellador (Suporte IA)
          <Badge className="bg-emerald-500/20 text-emerald-400 text-[8px] px-1.5 py-0 border-0 ml-1">MAX</Badge>
        </button>
      </div>

      {/* Main Content */}
      {activeTab !== 'zellador' ? (
        <div className="p-4 max-w-[1920px] mx-auto">
          {/* Quick Actions Bar */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            className="mb-4"
          >
            <QuickActionsBar onActionClick={handleActionClick} activeAction={activeTab} />
          </motion.div>

        {activeTab === 'settings' ? (
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 sm:p-8"
          >
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              ⚙️ Painel de Configurações da Pousada
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Sub-abas laterais */}
              <div className="md:col-span-1 flex flex-col gap-2">
                <button 
                  onClick={() => setSubTab('geral')}
                  className={`px-4 py-2.5 rounded-lg text-left text-xs font-semibold transition-colors cursor-pointer ${subTab === 'geral' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-white/60 hover:bg-white/[0.03]'}`}
                >
                  🏨 Geral & IA
                </button>
                <button 
                  onClick={() => setSubTab('linkinbio')}
                  className={`px-4 py-2.5 rounded-lg text-left text-xs font-semibold transition-colors cursor-pointer ${subTab === 'linkinbio' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-white/60 hover:bg-white/[0.03]'}`}
                >
                  📱 Link-in-Bio Profissional
                </button>
                <button 
                  onClick={() => setSubTab('faturamento')}
                  className={`px-4 py-2.5 rounded-lg text-left text-xs font-semibold transition-colors cursor-pointer ${subTab === 'faturamento' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-white/60 hover:bg-white/[0.03]'}`}
                >
                  💳 Faturamento & Recargas
                </button>
              </div>

              {/* Conteúdo da sub-aba */}
              <div className="md:col-span-3 bg-white/[0.01] border border-white/[0.04] rounded-xl p-6">
                {subTab === 'geral' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-white">Configurações Gerais</h3>
                    <p className="text-xs text-white/60">Ajuste o tom de voz do ZÉLLA e as informações básicas da sua pousada.</p>
                    {/* Form Simulador */}
                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="block text-[10px] text-white/40 mb-1">Nome da Pousada</label>
                        <input type="text" value={propertyName} disabled className="w-full bg-white/[0.03] border border-white/[0.08] rounded p-2 text-xs text-white/50" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-white/40 mb-1">Tom de Voz da IA</label>
                        <select disabled className="w-full bg-white/[0.03] border border-white/[0.08] rounded p-2 text-xs text-white/50">
                          <option>Receptivo & Amigável (Padrão)</option>
                          <option>Formal & Sofisticado</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {subTab === 'linkinbio' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white">Configuração do Link-in-Bio</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        Ativo (seuzella.com/pousadaserenity)
                      </span>
                    </div>
                    
                    {/* Lógica de Trava/Bloqueio: se for plano LITE, exibe o banner persuasivo */}
                    {currentPlan === 'lite' ? (
                      <div className="bg-gradient-to-r from-red-500/10 to-purple-500/10 border border-red-500/20 rounded-xl p-6 text-center space-y-4">
                        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto text-red-400 text-xl">
                          🔒
                        </div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">Acesso Bloqueado</h4>
                        <p className="text-xs text-white/70 max-w-md mx-auto leading-relaxed">
                          O seu período de teste grátis expirou. O Link-in-Bio profissional não é liberado no pacote LITE após o trial.
                        </p>
                        {/* Frase persuasiva solicitada pelo usuário em degradê */}
                        <div className="py-2.5 px-4 bg-black/40 rounded-lg border border-white/[0.06]">
                          <p className="text-xs font-extrabold uppercase tracking-tight bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            CONVERTA MAIS HÓSPEDES COM O &quot;Link-in-bio profissional&quot; FAÇA SEU UPGRADE.
                          </p>
                        </div>
                        <button 
                          onClick={() => setActiveTab('billing')}
                          className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-xs font-bold rounded-lg shadow-lg hover:scale-105 transition-transform"
                        >
                          Fazer Upgrade para o plano PRO
                        </button>
                      </div>
                    ) : (
                      // Plano PRO, MAX ou TRIAL ativo (primeiros 7 dias)
                      <div className="space-y-4">
                        <p className="text-xs text-white/60">Customize os links, fotos e cores do seu perfil in-app do Instagram.</p>
                        <div className="space-y-3 pt-2">
                          <div>
                            <label className="block text-[10px] text-white/40 mb-1">Título do Perfil</label>
                            <input type="text" defaultValue="Pousada Serenity" className="w-full bg-white/[0.03] border border-white/[0.08] rounded p-2 text-xs text-white" />
                          </div>
                          <div>
                            <label className="block text-[10px] text-white/40 mb-1">Subtítulo / Descrição</label>
                            <input type="text" defaultValue="✨ Seu refúgio em meio à natureza" className="w-full bg-white/[0.03] border border-white/[0.08] rounded p-2 text-xs text-white" />
                          </div>
                          <div className="pt-2">
                            <button className="px-4 py-2 bg-emerald-500 text-white text-xs font-semibold rounded hover:bg-emerald-600 transition-colors">
                              Salvar Alterações
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {subTab === 'faturamento' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-white">Faturamento & Consumo</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-3">
                        <div className="text-[10px] text-white/40">Plano Ativo</div>
                        <div className="text-base font-bold text-white mt-1 uppercase">{currentPlan}</div>
                      </div>
                      <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-3">
                        <div className="text-[10px] text-white/40">Mensagens Consumidas</div>
                        <div className="text-base font-bold text-white mt-1">
                          {currentPlan === 'lite' ? '512 / 500' : '924 / Ilimitado'}
                        </div>
                      </div>
                    </div>

                    {/* Alerta de cota excedida de mensagens para o plano LITE */}
                    {currentPlan === 'lite' && (
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 space-y-3 mt-4">
                        <div className="flex gap-2">
                          <span className="text-lg">⚠️</span>
                          <div>
                            <h4 className="text-xs font-bold text-white">Limite de mensagens excedido!</h4>
                            <p className="text-[10px] text-white/70 leading-relaxed mt-0.5">
                              Você atingiu 512 mensagens neste ciclo (limite de 500). Adquira créditos adicionais para que a IA ZÉLLA continue atendendo seus hóspedes.
                            </p>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                          <div className="text-xs text-white">
                            <strong>250 mensagens extras</strong> por <strong className="text-emerald-400">R$97,00</strong>
                          </div>
                          <button 
                            onClick={() => setShowRecargaMock(true)}
                            className="px-3 py-1.5 bg-emerald-500 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-600 transition-colors cursor-pointer"
                          >
                            Comprar via PIX
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {showRecargaMock && (
                      <div className="bg-black/60 border border-white/[0.08] rounded-xl p-4 text-center space-y-3 mt-2">
                        <p className="text-xs text-white font-bold">Pagamento da Recarga de Créditos (PIX)</p>
                        <div className="w-32 h-32 bg-white p-2 mx-auto rounded-lg flex items-center justify-center">
                          <span className="text-black font-mono text-[9px] break-all select-all">ZELLAPAY-RECARGA-PIX-MOCK-2026</span>
                        </div>
                        <p className="text-[9px] text-white/50">Copie o código acima ou escaneie o QR Code para ativar os créditos na hora.</p>
                        <button 
                          onClick={() => {
                            alert('Recarga simulada ativada!');
                            setShowRecargaMock(false);
                          }}
                          className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold rounded"
                        >
                          Concluído
                        </button>
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
            className="grid grid-cols-1 lg:grid-cols-3 gap-4"
          >
            {/* Left Column - Revenue Metrics (Full width on mobile, 2/3 on desktop) */}
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
              className="space-y-4"
            >
              {/* AI Status Card */}
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-white">Status da IA</h3>
                  <div className={`w-2 h-2 rounded-full ${
                    aiStatusLocal === 'online' ? 'bg-emerald-500' :
                    aiStatusLocal === 'processing' ? 'bg-violet-500' :
                    aiStatusLocal === 'error' ? 'bg-red-500' :
                    'bg-gray-500'
                  } animate-pulse`} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-white/50">Conversas Ativas</span>
                    <span className="text-sm font-bold text-white">{aiStatus?.activeConversations || 12}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-white/50">Atendimentos Hoje</span>
                    <span className="text-sm font-bold text-white">{metrics?.today?.aiAttended || 45}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-white/50">Tempo Resposta</span>
                    <span className="text-sm font-bold text-white">{aiStatus?.averageResponseTime || 2.3}s</span>
                  </div>
                </div>
              </div>

              {/* Notifications Preview */}
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-white">Notificações</h3>
                  {unreadCount > 0 && (
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-[9px] font-bold text-white">{unreadCount}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  {notifications.slice(0, 3).map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-2 rounded-lg border ${
                        notif.status === 'unread'
                          ? 'bg-emerald-500/10 border-emerald-500/20'
                          : 'bg-white/[0.02] border-white/[0.04]'
                      }`}
                      onClick={() => markAsRead(notif.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-xs font-semibold text-white">{notif.title}</div>
                          <div className="text-[10px] text-white/60 line-clamp-1">{notif.message}</div>
                        </div>
                       <div className={`w-1.5 h-1.5 rounded-full ${  
                         notif.priority === 'urgent' ? 'bg-red-500' :  
                         notif.priority === 'high' ? 'bg-amber-500' :  
                         'bg-blue-500'  
                       }`} />  
                     </div>  
                   </div>  
                 ))}  
               </div>  
             </div>  
           </motion.div>

           <motion.div variants={fadeIn} className="lg:col-span-3">  
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">  
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
         className="mt-6 bg-white/[0.02] border border-white/[0.06] rounded-xl p-3"  
       >  
         <div className="flex items-center justify-between">  
           <div className="flex items-center gap-4">  
             <div className="flex items-center gap-2">  
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />  
               <span className="text-[10px] text-white/40 font-mono">  
                 ZELLA COGNITIVE OS v2.4.1  
               </span>  
             </div>  
             <div className="h-4 w-px bg-white/[0.06]" />  
             <span className="text-[10px] text-white/40 font-mono">  
               Property: {mockPropertySettings.name}  
             </span>  
             <div className="h-4 w-px bg-white/[0.06]" />  
             <span className="text-[10px] text-white/40 font-mono">  
               {allGuests.length} leads • {conversations.length} conversas ativas  
             </span>  
           </div>  
           <div className="flex items-center gap-2">  
             <span className="text-[9px] text-emerald-400">  
               Todos os sistemas operacionais               
             </span>  
            </div>  
          </div>
        </motion.div>  
      </div>  
      ) : (
        <div className="p-4 max-w-[1920px] mx-auto">
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
