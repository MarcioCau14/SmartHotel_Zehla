'use client';

import { ReactNode, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import {
  LayoutDashboard,
  BedDouble,
  CalendarDays,
  Wallet,
  Tag,
  Settings,
  Brain,
  LogOut,
  Bell,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Zap,
  Shield,
} from 'lucide-react';

const navItems = [
  { key: 'painel', label: 'Painel', href: '/dashboard/painel', icon: LayoutDashboard },
  { key: 'quartos', label: 'Quartos', href: '/dashboard/quartos', icon: BedDouble },
  { key: 'reservas', label: 'Reservas', href: '/dashboard/reservas', icon: CalendarDays },
  { key: 'financeiro', label: 'Financeiro', href: '/dashboard/financeiro', icon: Wallet },
  { key: 'promocoes', label: 'Promoções', href: '/dashboard/promocoes', icon: Tag },
  { key: 'auditoria', label: 'Auditoria', href: '/dashboard/auditoria', icon: Shield },
  { key: 'configuracoes', label: 'Configurações', href: '/dashboard/configuracoes', icon: Settings },
];

export function DashboardLayoutClient({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentPath = pathname.replace('/dashboard/', '') || 'painel';

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#F0F2F5', fontFamily: "'Rubik', sans-serif" }}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen z-50 lg:z-auto flex flex-col bg-white border-r border-[#E9EDEF] transition-all duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${sidebarCollapsed ? 'w-[72px]' : 'w-[260px]'}`}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-[#E9EDEF] flex-shrink-0">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)' }}>
              <Brain className="w-5 h-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <span className="font-bold text-base leading-none" style={{ color: '#111B21', letterSpacing: '1px' }}>ZEHLA</span>
                <span className="block text-[10px] leading-none mt-0.5" style={{ color: '#8696A0' }}>SmartHotel</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1 rounded-lg hover:bg-[#F0F2F5]"
          >
            <X className="w-5 h-5" style={{ color: '#667781' }} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 dash-scroll">
          {navItems.map((item) => {
            const isActive = currentPath === item.key;
            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`dash-nav-item ${isActive ? 'active' : ''}`}
                style={sidebarCollapsed ? { justifyContent: 'center', padding: '10px' } : {}}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle (desktop only) */}
        <div className="hidden lg:block border-t border-[#E9EDEF] p-3">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="dash-nav-item"
            style={{ justifyContent: 'center' }}
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {!sidebarCollapsed && <span>Recolher</span>}
          </button>
        </div>

        {/* User section */}
        <div className="border-t border-[#E9EDEF] p-3">
          <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)', color: '#fff' }}
            >
              {session?.user?.name?.[0] || session?.user?.email?.[0] || 'U'}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: '#111B21' }}>
                  {session?.user?.name || 'Proprietário'}
                </p>
                <p className="text-[11px] truncate flex items-center gap-1" style={{ color: '#25D366' }}>
                  <Zap className="w-3 h-3" />
                  Plano Pro
                </p>
              </div>
            )}
            {!sidebarCollapsed && (
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                title="Sair"
              >
                <LogOut className="w-4 h-4" style={{ color: '#EA4335' }} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-[#E9EDEF] flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-[#F0F2F5]"
            >
              <Menu className="w-5 h-5" style={{ color: '#667781' }} />
            </button>
            <h2 className="text-lg font-semibold" style={{ color: '#111B21' }}>
              {navItems.find(n => currentPath === n.key)?.label || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-[#F0F2F5] transition-colors relative">
              <Bell className="w-5 h-5" style={{ color: '#667781' }} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#25D366]" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 dash-scroll">
          {children}
        </main>
      </div>
    </div>
  );
}
