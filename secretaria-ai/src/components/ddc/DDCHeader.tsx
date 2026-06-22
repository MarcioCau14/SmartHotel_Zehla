'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Activity,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle2,
  MoreVertical,
  Bell,
  Search,
  Settings,
  HelpCircle,
  User,
  LogOut,
  ArrowLeft,
  Zap,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

type AIStatus = 'online' | 'offline' | 'learning' | 'error' | 'processing' | string;

interface DDCHeaderProps {
  propertyName: string;
  aiStatus: AIStatus;
  notificationCount: number;
  onOpenNotifications?: () => void;
  onNotificationClick?: () => void;
  onUserMenuClick?: () => void;
}

export function DDCHeader({
  propertyName,
  aiStatus,
  notificationCount,
  onOpenNotifications
}: DDCHeaderProps) {
  const mountedRef = useRef(true);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [pulseActive, setPulseActive] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Pulse animation for AI status
  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setPulseActive(prev => !prev);
    }, 2000);
    return () => clearInterval(pulseInterval);
  }, []);

  const getAIStatusConfig = (status: AIStatus) => {
    switch (status) {
      case 'online':
        return {
          icon: Brain,
          label: 'IA Online',
          color: 'bg-emerald-500',
          textColor: 'text-emerald-400',
          glowColor: 'shadow-emerald-500/50',
          bgColor: 'bg-emerald-500/10'
        };
      case 'learning':
        return {
          icon: Sparkles,
          label: 'IA Aprendendo',
          color: 'bg-purple-500',
          textColor: 'text-purple-400',
          glowColor: 'shadow-purple-500/50',
          bgColor: 'bg-purple-500/10'
        };
      case 'error':
        return {
          icon: AlertTriangle,
          label: 'IA Erro',
          color: 'bg-red-500',
          textColor: 'text-red-400',
          glowColor: 'shadow-red-500/50',
          bgColor: 'bg-red-500/10'
        };
      case 'offline':
      default:
        return {
          icon: WifiOff,
          label: 'IA Offline',
          color: 'bg-gray-500',
          textColor: 'text-gray-400',
          glowColor: 'shadow-gray-500/50',
          bgColor: 'bg-gray-500/10'
        };
    }
  };

  const statusConfig = getAIStatusConfig(aiStatus);
  const StatusIcon = statusConfig.icon;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short'
    });
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-white/[0.06]">
      {/* Animated top gradient line */}
      <div className="h-[2px] w-full overflow-hidden">
        <motion.div
          className={`h-full w-1/2 ${statusConfig.color}`}
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear'
          }}
          style={{ opacity: pulseActive ? 1 : 0.5 }}
        />
      </div>

      <div className="flex items-center justify-between px-4 py-3 max-w-[1920px] mx-auto">
        {/* Left Section: Back + Logo + Property */}
        <div className="flex items-center gap-4">
          {/* Back Button */}
          <Link
            href="/"
            className="text-white/30 hover:text-white/70 transition-all duration-200 p-2 rounded-lg hover:bg-white/[0.04]"
            aria-label="Voltar ao início"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          {/* Logo */}
          <div className="flex items-center gap-3">
            <motion.div
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-emerald-500/20"
              animate={{
                boxShadow: pulseActive
                  ? '0 0 30px rgba(16, 185, 129, 0.3)'
                  : '0 0 10px rgba(16, 185, 129, 0.1)'
              }}
              transition={{ duration: 1 }}
            >
              <Brain className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">
                ZEHLA <span className="text-emerald-400">COMMAND</span>
              </h1>
              <div className="flex items-center gap-2">
                <p className="text-[10px] text-white/40 font-mono uppercase tracking-wider">
                  {propertyName}
                </p>
                <Badge
                  variant="outline"
                  className="text-[9px] px-1.5 py-0 h-4 border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                >
                  PRO
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Center Section: Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <Input
              placeholder="Buscar hóspedes, reservas, conversas..."
              className="w-full bg-white/[0.03] border-white/[0.06] rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-white/20 font-mono px-1.5 py-0.5 rounded bg-white/[0.04]">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right Section: AI Status + Notifications + User */}
        <div className="flex items-center gap-3">
          {/* AI Status Indicator */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${statusConfig.bgColor} border ${statusConfig.textColor}/20`}
          >
            <div className="relative">
              <StatusIcon className={`w-4 h-4 ${statusConfig.textColor}`} />
              <motion.div
                className={`absolute -top-0.5 -right-0.5 w-2 h-2 ${statusConfig.color} rounded-full`}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [1, 0.6, 1]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
            <span className={`text-xs font-medium ${statusConfig.textColor}`}>
              {statusConfig.label}
            </span>
          </div>

          {/* Quick Stats - Desktop */}
          <div className="hidden lg:flex items-center gap-4 px-4 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] text-white/50">Atendimentos Hoje:</span>
              <span className="text-xs font-bold text-white">45</span>
            </div>
            <div className="w-px h-4 bg-white/[0.06]" />
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] text-white/50">Conversão:</span>
              <span className="text-xs font-bold text-white">26.7%</span>
            </div>
          </div>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="relative p-2 rounded-lg hover:bg-white/[0.04] transition-all"
                onClick={onOpenNotifications}
              >
                <Bell className="w-5 h-5 text-white/60 hover:text-white/90" />
                {notificationCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
                  />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-80 bg-[#0a0a0f] border-white/[0.06]"
            >
              <DropdownMenuLabel className="text-white/90">
                Notificações
                <Badge
                  variant="secondary"
                  className="ml-2 bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                >
                  {notificationCount} novas
                </Badge>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/[0.06]" />
              <DropdownMenuItem className="text-white/70 hover:text-white hover:bg-white/[0.04]">
                Nova reserva confirmada! 🎉
              </DropdownMenuItem>
              <DropdownMenuItem className="text-white/70 hover:text-white hover:bg-white/[0.04]">
                ⚠️ Atenção necessária - Roberto Almeida
              </DropdownMenuItem>
              <DropdownMenuItem className="text-white/70 hover:text-white hover:bg-white/[0.04]">
                🏆 Recorde de conversão hoje!
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/[0.06]" />
              <DropdownMenuItem className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10">
                Ver todas as notificações
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/[0.04] transition-all"
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-cyan-500 text-white text-xs font-bold">
                    AM
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="w-4 h-4 text-white/40" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 bg-[#0a0a0f] border-white/[0.06]"
            >
              <DropdownMenuLabel className="text-white/90">
                Ana Maria
                <div className="text-[10px] text-white/40 font-normal">
                  ana@serenity.com
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/[0.06]" />
              <DropdownMenuItem className="text-white/70 hover:text-white hover:bg-white/[0.04]">
                <User className="w-4 h-4 mr-2" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem className="text-white/70 hover:text-white hover:bg-white/[0.04]">
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </DropdownMenuItem>
              <DropdownMenuItem className="text-white/70 hover:text-white hover:bg-white/[0.04]">
                <HelpCircle className="w-4 h-4 mr-2" />
                Suporte
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/[0.06]" />
              <DropdownMenuItem className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Time & Date Bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-black/20 border-t border-white/[0.03]">
        <div className="flex items-center gap-2">
          <Activity className="w-3 h-3 text-emerald-400" />
          <span className="text-[9px] text-white/40 font-mono">
            SISTEMA OPERACIONAL • V2.4.1
          </span>
        </div>
        <div className="flex items-center gap-4">
          {currentTime ? (
            <>
              <span className="text-[10px] text-white/50 font-mono">
                {formatDate(currentTime)}
              </span>
              <span className={`text-[10px] font-mono font-bold ${statusConfig.textColor}`}>
                {formatTime(currentTime)}
              </span>
            </>
          ) : (
            <span className="text-[10px] text-white/20 font-mono">--:--:--</span>
          )}
        </div>
      </div>
    </header>
  );
}

// Import ChevronDown
function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}