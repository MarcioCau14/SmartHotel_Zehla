'use client';

import { motion } from 'framer-motion';
import { LayoutDashboard, MessageCircle, Users, GraduationCap, Settings, Bell, Calendar, TrendingUp, Phone, MessageSquare, CreditCard, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuickActionsBarProps {
  onActionClick: (action: string) => void;
  activeAction?: string;
}

export function QuickActionsBar({ onActionClick, activeAction }: QuickActionsBarProps) {
  const actions = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'from-emerald-500 to-cyan-500' },
    { id: 'messages', label: 'Mensagens', icon: MessageCircle, color: 'from-blue-500 to-indigo-500', count: 12 },
    { id: 'guests', label: 'Hóspedes', icon: Users, color: 'from-violet-500 to-purple-500', count: 45 },
    { id: 'training', label: 'Treinamento', icon: GraduationCap, color: 'from-orange-500 to-red-500' },
    { id: 'bookings', label: 'Reservas', icon: Calendar, color: 'from-pink-500 to-rose-500', count: 3 },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, color: 'from-amber-500 to-orange-500' },
    { id: 'notifications', label: 'Notificações', icon: Bell, color: 'from-cyan-500 to-blue-500', count: 5 },
    { id: 'settings', label: 'Configurações', icon: Settings, color: 'from-slate-500 to-gray-500' }
  ];

  const quickActions = [
    { id: 'call', label: 'Ligar', icon: Phone, color: 'bg-emerald-500' },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, color: 'bg-green-500' },
    { id: 'payment', label: 'Pagamento', icon: CreditCard, color: 'bg-blue-500' },
    { id: 'boost', label: 'Boost IA', icon: Zap, color: 'bg-amber-500' }
  ];

  return (
    <div className="space-y-4">
      {/* Main Navigation */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3">
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
          {actions.map((action, index) => {
            const Icon = action.icon;
            const isActive = activeAction === action.id;

            return (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onActionClick(action.id)}
                className={`relative p-3 rounded-xl border transition-all group ${
                  isActive
                    ? `bg-gradient-to-br ${action.color} border-white/20`
                    : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.10]'
                }`}
              >
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-8 h-8 rounded-lg ${isActive ? 'bg-white/20' : 'bg-white/[0.04] group-hover:bg-white/[0.08]'} flex items-center justify-center transition-all`}>
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-white/60 group-hover:text-white/80'}`} />
                  </div>
                  <span className={`text-[9px] font-medium ${isActive ? 'text-white' : 'text-white/60 group-hover:text-white/80'}`}>
                    {action.label}
                  </span>
                </div>

                {/* Badge for counts */}
                {action.count !== undefined && action.count > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
                  >
                    <span className="text-[9px] font-bold text-white">
                      {action.count > 9 ? '9+' : action.count}
                    </span>
                  </motion.div>
                )}

                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">
            Ações Rápidas
          </span>
        </div>
        <div className="flex gap-2">
          {quickActions.map((action, index) => {
            const Icon = action.icon;

            return (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onActionClick(action.id)}
                className="flex-1 flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.10] transition-all group"
              >
                <div className={`w-7 h-7 rounded-lg ${action.color} flex items-center justify-center`}>
                  <Icon className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-[10px] font-medium text-white/80 group-hover:text-white transition-colors">
                  {action.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}