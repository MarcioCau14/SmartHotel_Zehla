'use client';

import { Brain, ChevronDown, User, Bell, Settings, Menu, X, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

interface TenantInfo {
  nome: string;
  email: string;
  whatsappProprietario: string;
  whatsappAtendimento: string;
  property?: {
    nome: string;
    tipo?: string;
  };
  trialDaysLeft: number;
  isExpired: boolean;
  isWarning: boolean;
}

interface ClientTopNavProps {
  tenantData: TenantInfo | null;
}

export function ClientTopNav({ tenantData }: ClientTopNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const propertyName = tenantData?.property?.nome || 'Minha Propriedade';
  const trialDaysLeft = tenantData?.trialDaysLeft ?? 0;
  const isExpired = tenantData?.isExpired ?? false;
  const isWarning = tenantData?.isWarning ?? false;
  const userName = tenantData?.nome || 'Proprietário';

  return (
    <header className="glass-strong border-b border-[#2e2e2e] px-4 py-3 flex items-center justify-between gap-4 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <Brain className="w-7 h-7 text-[#FF5500]" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#FF5500] rounded-full animate-zehla-ping" />
          </div>
          <span className="font-bold text-lg gradient-text hidden sm:inline">ZEHLA</span>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-[#2e2e2e] hidden sm:block" />

        {/* Property name (static display since single tenant) */}
        <div className="hidden sm:flex items-center gap-2 bg-[#242424] border border-[#363636] rounded-lg px-3 py-1.5">
          <span className="text-xs text-[#b4b4b4] font-medium max-w-[200px] md:max-w-[300px] truncate">
            {propertyName}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-[#4d4d4d]" />
        </div>

        {/* Trial badge */}
        {isExpired ? (
          <span className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold">
            <AlertTriangle className="w-3 h-3" />
            EXPIRADO
          </span>
        ) : isWarning ? (
          <span className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold animate-zehla-pulse">
            <AlertTriangle className="w-3 h-3" />
            {trialDaysLeft === 1 ? 'Trial expira amanhã!' : `Trial expira em ${trialDaysLeft} dias!`}
          </span>
        ) : trialDaysLeft > 0 ? (
          <span className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FF5500]/10 border border-amber-500/20 text-[#FF5500] text-[10px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-zehla-pulse" />
            Trial: {trialDaysLeft} {trialDaysLeft === 1 ? 'dia restante' : 'dias restantes'}
          </span>
        ) : null}
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-1">
        {/* Notification bell */}
        <button className="relative p-2 rounded-lg hover:bg-[#242424] transition-colors text-[#898989] hover:text-[#efefef]">
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Settings */}
        <button className="p-2 rounded-lg hover:bg-[#242424] transition-colors text-[#898989] hover:text-[#efefef] hidden sm:flex">
          <Settings className="w-4.5 h-4.5" />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-[#2e2e2e] hidden sm:block" />

        {/* User avatar */}
        <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#242424] transition-colors">
          <div className="w-8 h-8 rounded-full bg-[#FF5500]/10 border border-[#FF5500]/30 flex items-center justify-center">
            <User className="w-4 h-4 text-[#FF5500]" />
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-medium text-[#efefef]">{userName}</div>
            <div className="text-[10px] text-[#4d4d4d]">{isExpired ? 'Trial Expirado' : 'Conta Ativa'}</div>
          </div>
        </button>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="sm:hidden p-2 rounded-lg hover:bg-[#242424] transition-colors text-[#898989]"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
}
