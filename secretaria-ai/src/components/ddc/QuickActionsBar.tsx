'use client';

import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  MessageCircle, 
  Users, 
  GraduationCap, 
  Settings, 
  Bell, 
  Calendar, 
  TrendingUp, 
  Phone, 
  MessageSquare, 
  CreditCard, 
  Zap,
  ArrowRight
} from 'lucide-react';

interface QuickActionsBarProps {
  onActionClick: (action: string) => void;
  activeAction?: string;
}

export function QuickActionsBar({ onActionClick, activeAction }: QuickActionsBarProps) {
  const actions = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'messages', label: 'Mensagens', icon: MessageCircle, count: 12 },
    { id: 'guests', label: 'Hóspedes', icon: Users, count: 45 },
    { id: 'training', label: 'Treinamento', icon: GraduationCap },
    { id: 'bookings', label: 'Reservas', icon: Calendar, count: 3 },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'notifications', label: 'Notificações', icon: Bell, count: 5 },
    { id: 'settings', label: 'Configurações', icon: Settings }
  ];

  const quickActions = [
    { id: 'call', label: 'Ligar', icon: Phone, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/15' },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, color: 'text-green-400 bg-green-500/10 border-green-500/15' },
    { id: 'payment', label: 'Pagamento', icon: CreditCard, color: 'text-blue-400 bg-blue-500/10 border-blue-500/15' },
    { id: 'boost', label: 'Boost IA', icon: Zap, color: 'text-amber-400 bg-amber-500/10 border-amber-500/15' }
  ];

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#121216]/60 border border-white/[0.04] p-2.5 rounded-xl">
      {/* Segmented Tabs Navigation */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none select-none">
        {actions.map((action) => {
          const Icon = action.icon;
          const isActive = activeAction === action.id || (action.id === 'dashboard' && activeAction === 'overview');

          return (
            <button
              key={action.id}
              onClick={() => onActionClick(action.id === 'dashboard' ? 'overview' : action.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all border cursor-pointer shrink-0 relative ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-sm'
                  : 'text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-white/[0.02]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{action.label}</span>

              {action.count !== undefined && action.count > 0 && (
                <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border leading-none ${
                  isActive 
                    ? 'bg-emerald-500/20 border-emerald-500/25 text-emerald-300' 
                    : 'bg-zinc-800 border-zinc-700/60 text-zinc-400'
                }`}>
                  {action.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Inline Quick Action Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto select-none">
        <div className="hidden xl:flex items-center gap-1 text-[10px] text-zinc-500 font-bold uppercase tracking-wider mr-2 shrink-0">
          <span>Ações</span>
          <ArrowRight className="w-3 h-3" />
        </div>
        {quickActions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.id}
              onClick={() => onActionClick(action.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer hover:brightness-110 active:scale-[0.98] shrink-0 ${action.color}`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}