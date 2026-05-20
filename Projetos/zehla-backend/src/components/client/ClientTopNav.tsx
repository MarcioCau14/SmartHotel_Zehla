"use client";
import { Brain, ChevronDown, User, Bell, Settings, Menu, X, AlertTriangle, BedDouble, CalendarDays, TicketCheck, LifeBuoy, LayoutDashboard } from 'lucide-react';
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
  activeTab: string;
  setActiveTab: (tab: any) => void;
  onOpenZCC?: () => void;
}

export function ClientTopNav({ tenantData, activeTab, setActiveTab, onOpenZCC }: ClientTopNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'painel', label: 'Painel', icon: LayoutDashboard },
    { id: 'quartos', label: 'Mapa de Quartos', icon: BedDouble },
    { id: 'reservas', label: 'Reservas', icon: CalendarDays },
    { id: 'check-in', label: 'FNRH Digital', icon: TicketCheck },
  ];

  const propertyName = tenantData?.property?.nome || 'Minha Propriedade';
  const trialDaysLeft = tenantData?.trialDaysLeft ?? 0;
  const isExpired = tenantData?.isExpired ?? false;
  const isWarning = tenantData?.isWarning ?? false;
  const userName = tenantData?.nome || 'Proprietário';

  return (
    <header className="glass-strong border-b border-[#2e2e2e] px-4 py-0 flex items-center justify-between gap-4 sticky top-0 z-50 h-16">
      <div className="flex items-center h-full gap-8">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <Brain className="w-7 h-7 text-[#FF5500]" />
          </div>
          <span className="font-bold text-lg gradient-text hidden sm:inline">ZEHLA</span>
        </div>

        {/* Menu Horizontal (A Bancada de Inox) */}
        <nav className="hidden md:flex items-center h-full gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-4 h-full border-b-2 transition-all text-sm font-medium ${
                activeTab === item.id 
                  ? 'border-orange-500 text-orange-500 bg-orange-500/5' 
                  : 'border-transparent text-[#898989] hover:text-[#efefef] hover:bg-white/[0.02]'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
          
          {/* ZCC Bridge (Suporte) */}
          <button 
            className="flex items-center gap-2 px-4 h-full border-b-2 border-transparent text-[#4d4d4d] hover:text-blue-400 hover:bg-blue-400/5 transition-all text-sm font-medium group"
          >
            <LifeBuoy className="w-4 h-4 group-hover:animate-spin-slow" />
            ZCC-Bridge
          </button>
        </nav>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-1">
        {/* Trial / Status Badge */}
        <div className="hidden lg:flex items-center mr-4">
          {isExpired ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold">
              <AlertTriangle className="w-3 h-3" />
              EXPIRADO
            </span>
          ) : isWarning ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold animate-zehla-pulse">
              <AlertTriangle className="w-3 h-3" />
              TRIAL EXPIRANDO
            </span>
          ) : null}
        </div>

        {/* User avatar */}
        <button 
          onClick={() => setActiveTab('configuracoes')}
          className={`flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#242424] transition-colors ${activeTab === 'configuracoes' ? 'bg-[#242424] ring-1 ring-orange-500/30' : ''}`}
        >
          <div className="w-8 h-8 rounded-lg bg-[#242424] border border-[#363636] flex items-center justify-center overflow-hidden">
            <User className="w-4 h-4 text-[#FF5500]" />
          </div>
          <div className="hidden md:block text-left">
            <div className="text-[10px] font-bold text-[#fafafa] uppercase tracking-wider">{userName}</div>
            <div className="text-[9px] text-[#4d4d4d]">{propertyName}</div>
          </div>
          <ChevronDown className="w-3 h-3 text-[#363636]" />
        </button>
      </div>
    </header>
  );
}
