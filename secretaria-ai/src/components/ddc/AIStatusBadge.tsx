'use client';

import { motion } from 'framer-motion';
import { Brain, Wifi, WifiOff, AlertTriangle, Sparkles, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { AIStatus } from '@/types/ddc';

interface AIStatusBadgeProps {
  status: AIStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showPulse?: boolean;
}

export function AIStatusBadge({
  status,
  size = 'md',
  showIcon = true,
  showPulse = true
}: AIStatusBadgeProps) {
  const getStatusConfig = (status: AIStatus) => {
    switch (status) {
      case 'online':
        return {
          icon: Brain,
          label: 'IA Online',
          color: 'bg-emerald-500',
          textColor: 'text-emerald-400',
          glowColor: 'shadow-emerald-500/50',
          bgColor: 'bg-emerald-500/10',
          borderColor: 'border-emerald-500/30'
        };
      case 'processing':
        return {
          icon: Activity,
          label: 'Processando',
          color: 'bg-violet-500',
          textColor: 'text-violet-400',
          glowColor: 'shadow-violet-500/50',
          bgColor: 'bg-violet-500/10',
          borderColor: 'border-violet-500/30'
        };
      case 'error':
        return {
          icon: AlertTriangle,
          label: 'Erro',
          color: 'bg-red-500',
          textColor: 'text-red-400',
          glowColor: 'shadow-red-500/50',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30'
        };
      case 'offline':
      default:
        return {
          icon: WifiOff,
          label: 'Offline',
          color: 'bg-gray-500',
          textColor: 'text-gray-400',
          glowColor: 'shadow-gray-500/50',
          bgColor: 'bg-gray-500/10',
          borderColor: 'border-gray-500/30'
        };
    }
  };

  const config = getStatusConfig(status);
  const StatusIcon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-1 text-[9px] gap-1.5',
    md: 'px-3 py-1.5 text-xs gap-2',
    lg: 'px-4 py-2 text-sm gap-2.5'
  };

  const iconSize = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div
      className={`inline-flex items-center ${sizeClasses[size]} rounded-lg border ${config.bgColor} ${config.borderColor} ${config.textColor} font-medium transition-all`}
      style={{
        opacity: status === 'offline' ? 0.6 : 1
      }}
    >
      {showIcon && (
        <div className="relative">
          <StatusIcon className={iconSize[size]} />
          {showPulse && status !== 'offline' && (
            <motion.div
              className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 ${config.color} rounded-full`}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [1, 0.5, 1]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </div>
      )}
      <span>{config.label}</span>
      {status === 'processing' && (
        <motion.div
          className="flex gap-0.5"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <span className="w-0.5 h-0.5 bg-current rounded-full" />
          <span className="w-0.5 h-0.5 bg-current rounded-full" />
          <span className="w-0.5 h-0.5 bg-current rounded-full" />
        </motion.div>
      )}
    </div>
  );
}

// AI Status Dot Component (small indicator)
export function AIStatusDot({ status, size = 'sm' }: { status: AIStatus; size?: 'sm' | 'md' | 'lg' }) {
  const getColor = () => {
    switch (status) {
      case 'online':
        return 'bg-emerald-500';
      case 'processing':
        return 'bg-violet-500';
      case 'error':
        return 'bg-red-500';
      case 'offline':
      default:
        return 'bg-gray-500';
    }
  };

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const shadowSize = {
    sm: '0 0 8px',
    md: '0 0 12px',
    lg: '0 0 16px'
  };

  const shadowColor = {
    'online': 'rgba(16, 185, 129, 0.5)',
    'processing': 'rgba(139, 92, 246, 0.5)',
    'error': 'rgba(239, 68, 68, 0.5)',
    'offline': 'rgba(107, 114, 128, 0.5)'
  };

  return (
    <motion.div
      className={`rounded-full ${getColor()} ${sizeClasses[size]}`}
      style={{
        boxShadow: `${shadowSize[size]} ${shadowColor[status]}`
      }}
      animate={status !== 'offline' ? {
        scale: [1, 1.2, 1],
        opacity: [1, 0.7, 1]
      } : {}}
      transition={{ duration: 2, repeat: Infinity }}
    />
  );
}

// AI Status Card Component (larger display with details)
export function AIStatusCard({ status, details }: { status: AIStatus; details?: { activeConversations: number; averageResponseTime: number; uptime: number } }) {
  const config = {
    online: {
      color: 'emerald',
      label: 'IA Operacional',
      description: 'Sistema funcionando normalmente'
    },
    processing: {
      color: 'violet',
      label: 'IA Processando',
      description: 'Processando solicitações...'
    },
    error: {
      color: 'red',
      label: 'IA com Erro',
      description: 'Erro detectado - Verifique os logs'
    },
    offline: {
      color: 'gray',
      label: 'IA Offline',
      description: 'Sistema indisponível'
    }
  }[status];

  return (
    <motion.div
      className={`bg-${config.color}-500/10 border border-${config.color}-500/20 rounded-xl p-4`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3 mb-3">
        <AIStatusBadge status={status} size="lg" showPulse />
        <div>
          <h3 className={`text-sm font-bold text-${config.color}-400`}>
            {config.label}
          </h3>
          <p className="text-[10px] text-white/40">
            {config.description}
          </p>
        </div>
      </div>

      {details && (
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/[0.06]">
          <div>
            <div className="text-[9px] text-white/40 mb-1">Conversas Ativas</div>
            <div className="text-lg font-bold text-white">{details.activeConversations}</div>
          </div>
          <div>
            <div className="text-[9px] text-white/40 mb-1">Tempo Resposta</div>
            <div className="text-lg font-bold text-white">{details.averageResponseTime}s</div>
          </div>
          <div>
            <div className="text-[9px] text-white/40 mb-1">Uptime</div>
            <div className="text-lg font-bold text-white">{details.uptime}%</div>
          </div>
        </div>
      )}
    </motion.div>
  );
}