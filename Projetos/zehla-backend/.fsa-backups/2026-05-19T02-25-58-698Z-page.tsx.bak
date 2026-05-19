'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Command,
  Brain,
  Terminal,
  Bot,
  Building2,
  Megaphone,
  CreditCard,
  MessageSquare,
  Plug,
  Shield,
  Eye,
  Cpu,
  BarChart3,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Zap,
  Hash,
  Gauge,
  Wifi,
  Database,
  Server,
  Lock,
  FileCheck,
  Users,
  LockKeyhole,
  Sparkles,
  RefreshCw,
  Menu,
  ChevronRight,
  LogOut,
  Plus,
  User,
  Edit3,
  Trash2,
} from 'lucide-react';

// Dashboard components to reuse
import { TerminalPanel } from '@/components/dashboard/TerminalPanel';
import { CognitivePanel } from '@/components/dashboard/CognitivePanel';
import { MarketingLeads } from '@/components/dashboard/MarketingLeads';
import { WhatsAppPanel } from '@/components/dashboard/WhatsAppPanel';
import { APIStatus } from '@/components/dashboard/APIStatus';
import { PaymentPanel } from '@/components/dashboard/PaymentPanel';
import { SystemStatusBar } from '@/components/dashboard/SystemStatusBar';
import { VisibilityDashboard } from '@/components/dashboard/VisibilityDashboard';

// ZCC components to reuse
import { SwarmOverview } from '@/components/zcc/SwarmOverview';
import { ZccAutoHealer } from '@/components/zcc/ZccAutoHealer';
import { TenantManagement } from '@/components/zcc/TenantManagement';
import { FintechHub } from '@/components/zcc/FintechHub';
import { CognitiveObservability } from '@/components/zcc/CognitiveObservability';
import { ScaleMetrics } from '@/components/zcc/ScaleMetrics';
import { ApiKeysPanel } from '@/components/zcc/ApiKeysPanel';

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

import type { AIAgent } from '@/lib/store';

// ===== TAB CONFIGURATION =====

type ZCCTab =
  | 'overview'
  | 'cognitivo'
  | 'terminal'
  | 'agentes'
  | 'propriedades'
  | 'marketing'
  | 'visibilidade'
  | 'financeiro'
  | 'whatsapp'
  | 'apis'
  | 'equipe'
  | 'seguranca';

interface TabConfig {
  id: ZCCTab;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement> & { className?: string }>;
  permission?: string;
}

const tabs: TabConfig[] = [
  { id: 'overview', label: 'Overview', shortLabel: 'Overview', icon: Eye },
  { id: 'cognitivo', label: 'Cognitivo', shortLabel: 'Cognitivo', icon: Brain, permission: 'view_cognitivo' },
  { id: 'terminal', label: 'Terminal', shortLabel: 'Terminal', icon: Terminal, permission: 'view_terminal' },
  { id: 'agentes', label: 'Agentes', shortLabel: 'Agentes', icon: Bot, permission: 'view_agents' },
  { id: 'propriedades', label: 'Propriedades', shortLabel: 'Props', icon: Building2, permission: 'view_properties' },
  { id: 'marketing', label: 'Marketing', shortLabel: 'Marketing', icon: Megaphone, permission: 'view_marketing' },
  { id: 'visibilidade', label: 'Visibilidade', shortLabel: 'Visibilidade', icon: Eye, permission: 'view_marketing' },
  { id: 'financeiro', label: 'Financeiro', shortLabel: 'Financeiro', icon: CreditCard, permission: 'view_financial' },
  { id: 'whatsapp', label: 'WhatsApp', shortLabel: 'WhatsApp', icon: MessageSquare, permission: 'view_whatsapp' },
  { id: 'apis', label: 'APIs', shortLabel: 'APIs', icon: Plug, permission: 'view_apis' },
  { id: 'equipe', label: 'Equipe', shortLabel: 'Equipe', icon: Users, permission: 'manage_team' },
  { id: 'seguranca', label: 'Segurança', shortLabel: 'Segurança', icon: Shield, permission: 'view_security' },
];

import { AgentManagementPanel } from '@/components/zcc/AgentManagementPanel';
import { SecurityPanel } from '@/components/zcc/SecurityPanel';
import { TeamManagementTab } from '@/components/zcc/TeamManagementTab';

// ===== MAIN PAGE COMPONENT =====

export default function ZCCPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [userSession, setUserSession] = useState<{ role: string; permissions: string[] } | null>(null);
  const [activeTab, setActiveTab] = useState<ZCCTab>('overview');
  const [brainHealth, setBrainHealth] = useState<Record<string, unknown> | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Admin login gate
  useEffect(() => {
    // DEVELOPER BYPASS: Automatic login in dev mode for Marcio
    if (process.env.NODE_ENV === 'development') {
      setIsAdmin(true);
      setUserSession({
        role: 'admin',
        permissions: tabs.map(t => t.permission).filter(Boolean) as string[]
      });
      return;
    }

    try {
      const adminToken = localStorage.getItem('zehla-admin-token');
      if (adminToken) {
        const payload = JSON.parse(atob(adminToken));
        if ((payload.role === 'admin' || payload.role === 'team') && payload.exp > Date.now()) {
          setIsAdmin(true);
          setUserSession({
            role: payload.role,
            permissions: payload.permissions || []
          });
        } else {
          localStorage.removeItem('zehla-admin-token');
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    } catch {
      setIsAdmin(false);
    }
  }, []);

  // Redirect to admin login if not authenticated
  useEffect(() => {
    if (isAdmin === false) {
      router.push('/zcc-login');
    }
  }, [isAdmin, router]);

  // Load brain health (must be BEFORE any early return to respect Rules of Hooks)
  useEffect(() => {
    if (isAdmin !== true) return;
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/api/brain/health');
        const data = await res.json();
        if (!cancelled) setBrainHealth(data);
      } catch {
        // silent
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  // Loading state while checking admin session
  if (isAdmin === null || isAdmin === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#F97316]/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-[#4d4d4d]">Verificando acesso administrativo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#171717] text-[#b4b4b4] font-sans overflow-hidden">
      
      {/* ===== SIDEBAR ===== */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[#0f0f0f] border-r border-[#2e2e2e] transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'w-64' : 'w-0 -translate-x-full md:w-20 md:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-center md:justify-start px-4 border-b border-[#2e2e2e]">
          <Command className="w-6 h-6 text-[#F97316] flex-shrink-0" />
          <div className={`ml-3 whitespace-nowrap transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>
            <h1 className="font-bold text-sm text-[#fafafa] tracking-tight">ZEHLA Control</h1>
            <p className="text-[10px] text-[#4d4d4d] font-mono">v2.1.0-admin</p>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 zehla-scroll-y">
          {tabs.filter(tab => {
            if (userSession?.role === 'admin') return true;
            // @ts-ignore
            if (tab.permission && !userSession?.permissions.includes(tab.permission)) return false;
            return true;
          }).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (typeof window !== 'undefined' && window.innerWidth < 768) setSidebarOpen(false); // Auto close on mobile
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                  isActive
                    ? 'text-[#F97316] bg-[#F97316]/10'
                    : 'text-[#898989] hover:text-[#efefef] hover:bg-[#242424]'
                }`}
                title={!sidebarOpen ? tab.label : ''}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#F97316] rounded-r-full shadow-[0_0_10px_rgba(255,85,0,0.5)]" />
                )}
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-[#F97316]' : 'text-[#4d4d4d] group-hover:text-[#b4b4b4]'}`} />
                <span className={`whitespace-nowrap transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#2e2e2e]">
          <button
            onClick={() => { localStorage.removeItem('zehla-admin-token'); router.push('/zcc-login'); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#898989] hover:text-rose-400 hover:bg-rose-400/10 transition-all ${!sidebarOpen && 'justify-center md:justify-start'}`}
            title={!sidebarOpen ? 'Sair do ZCC' : ''}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className={`whitespace-nowrap transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>
              Sair do ZCC
            </span>
          </button>
        </div>
      </aside>

      {/* ===== MAIN CONTENT WRAPPER ===== */}
      <div className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
        
        {/* Top Header */}
        <header className="h-16 flex-shrink-0 bg-[#0f0f0f]/80 backdrop-blur-md border-b border-[#2e2e2e] flex items-center justify-between px-4 sm:px-6 z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-[#898989] hover:text-[#efefef] hover:bg-[#242424] rounded-lg transition-colors"
              aria-label="Toggle Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="text-[#4d4d4d] font-mono tracking-tight">ZCC</span>
              <ChevronRight className="w-4 h-4 text-[#363636]" />
              <span className="text-[#efefef] font-medium">
                {tabs.find(t => t.id === activeTab)?.label}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-[#F97316]/30 text-[#F97316] bg-[#F97316]/10 text-[10px] uppercase font-mono tracking-wider">
              {userSession?.role === 'admin' ? 'Super Admin' : 'Team'}
            </Badge>
          </div>
        </header>

        {/* Dynamic Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 zehla-scroll-y bg-[#171717]">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
            {/* Tab 1: Overview */}
            {activeTab === 'overview' && (
              <ZccAutoHealer fallbackName="Visão Global (SwarmOverview)">
                {brainHealth ? (
                  <SwarmOverview brainHealth={brainHealth} />
                ) : (
                  <div className="space-y-4">
                    <Skeleton className="h-48 w-full rounded-xl" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton key={i} className="h-40 rounded-xl" />
                      ))}
                    </div>
                  </div>
                )}
              </ZccAutoHealer>
            )}

            {/* Tab 2: Cognitivo */}
            {activeTab === 'cognitivo' && <ZccAutoHealer fallbackName="Painel Cognitivo"><CognitivePanel /></ZccAutoHealer>}

            {/* Tab 3: Terminal */}
            {activeTab === 'terminal' && <ZccAutoHealer fallbackName="Terminal Principal"><TerminalPanel /></ZccAutoHealer>}

            {/* Tab 4: Agentes */}
            {activeTab === 'agentes' && <ZccAutoHealer fallbackName="Gestão de Agentes"><AgentManagementPanel /></ZccAutoHealer>}

            {/* Tab 5: Propriedades */}
            {activeTab === 'propriedades' && <ZccAutoHealer fallbackName="Gestão de Propriedades"><TenantManagement /></ZccAutoHealer>}

            {/* Tab 6: Marketing */}
            {activeTab === 'marketing' && <ZccAutoHealer fallbackName="Marketing Leads"><MarketingLeads /></ZccAutoHealer>}

            {/* Tab 6.5: Visibilidade */}
            {activeTab === 'visibilidade' && <ZccAutoHealer fallbackName="Visibilidade SEO"><VisibilityDashboard /></ZccAutoHealer>}

            {/* Tab 7: Financeiro */}
            {activeTab === 'financeiro' && <ZccAutoHealer fallbackName="Fintech Hub"><FintechHub /></ZccAutoHealer>}

            {/* Tab 8: WhatsApp */}
            {activeTab === 'whatsapp' && <ZccAutoHealer fallbackName="Painel WhatsApp"><WhatsAppPanel /></ZccAutoHealer>}

            {/* Tab 9: APIs */}
            {activeTab === 'apis' && (
              <ZccAutoHealer fallbackName="Gestão de APIs">
                <ApiKeysPanel />
                <div className="mt-6" />
                <APIStatus />
              </ZccAutoHealer>
            )}



            {/* Tab 11: Equipe */}
            {activeTab === 'equipe' && <ZccAutoHealer fallbackName="Equipe Operacional"><TeamManagementTab /></ZccAutoHealer>}

            {/* Tab 12: Segurança */}
            {activeTab === 'seguranca' && <ZccAutoHealer fallbackName="Painel de Segurança"><SecurityPanel /></ZccAutoHealer>}
          </motion.div>
        </AnimatePresence>
        </div>
      </main>

      {/* ===== BOTTOM STATUS BAR ===== */}
      <div className="z-40 relative">
        <SystemStatusBar />
      </div>
    </div>
    </div>
  );
}
