'use client';

import { useState, useEffect } from 'react';
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
import type { AIStatus } from '@/types/ddc';

export default function DDCDashboardPage() {
  // Custom hooks
  const { metrics, aiStatus, isLoading } = useDDCMetrics('today', true);
  const { conversations, selectedConversation, selectConversation, sendMessage, escalateConversation } = useAILiveFeed();
  const { pipeline, allGuests, updateGuestStatus, setFilters } = useGuestPipeline();
  const { notifications, unreadCount, markAsRead } = useDDCNotifications(true);

  // Local state
  const [activeTab, setActiveTab] = useState('overview');
  const [propertyName, setPropertyName] = useState('Pousada Serenity');
  const aiStatusLocal: AIStatus = aiStatus?.status || 'online';

  const handleActionClick = (action: string) => {
    console.log('Action clicked:', action);
    // Handle navigation or action
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
      transition: { duration: 0.5, ease: 'easeOut' as any }
    }
  };

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

      {/* Main Content */}
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

        {/* Bento Grid Layout */}
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
              metrics={(metrics || mockRevenueMetrics) as any}
              isLoading={isLoading}
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
                  <span className="text-sm font-bold text-white">{metrics?.attendedToday || 45}</span>
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
   </div>  
 );  
}  

