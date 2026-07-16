'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
import { signOut } from 'next-auth/react';

import type { AIStatus } from '@/types/ddc';
import type { PlanTier } from '@/lib/plan-features';
import { PLAN_DISPLAY } from '@/lib/plan-features';

interface DDCHeaderProps {
  propertyName: string;
  aiStatus: AIStatus;
  notificationCount: number;
  onOpenNotifications?: () => void;
  currentPlan?: PlanTier;
}

export function DDCHeader({
  propertyName,
  aiStatus,
  notificationCount,
  onOpenNotifications,
  currentPlan = 'trial'
}: DDCHeaderProps) {
  const router = useRouter();
  const planDisplay = PLAN_DISPLAY[currentPlan] || PLAN_DISPLAY.trial;
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [pulseActive, setPulseActive] = useState(true);

  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date());
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
      case 'processing':
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
            ease: 'linear' as const
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
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">
                Seu Zélla
              </h1>
              <div className="flex items-center gap-2">
                <p className="text-[10px] text-white/40 font-mono uppercase tracking-wider">
                  Central de controle
                </p>
                <Badge
                  variant="outline"
                  className={`text-[9px] px-1.5 py-0 h-4 font-mono uppercase ${planDisplay.badgeBorder} ${planDisplay.badgeText} ${planDisplay.badgeBg}`}
                >
                  {planDisplay.label}
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

        {/* Right Section: Notifications + User */}
        <div className="flex items-center gap-3">

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
              <DropdownMenuItem
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
                onClick={async () => {
                  try {
                    await signOut({ redirect: false });
                  } catch {
                    // signOut may fail if fetch is blocked — session cookie
                    // will still be cleared by the server on next request
                  }
                  // Hard navigate to /login — works even if signOut threw
                  window.location.href = '/login';
                }}
              >
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
          {mounted && currentTime ? (
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