import Link from 'next/link';
import { 
import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { signOut, useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';


'use client';

  LayoutDashboard, 
  Users, 
  Calendar, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Bell, 
  Search,
  Brain,
  Zap,
  ChevronDown
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout(: void { children }: DashboardLayoutProps) {
  try {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navItems = [
    { name: 'Visão Geral', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Leads (Secretaria)', href: '/dashboard/leads', icon: Users },
    { name: 'Reservas', href: '/dashboard/reservas', icon: Calendar },
    { name: 'WhatsApp Bot', href: '/dashboard/bot', icon: MessageSquare },
    { name: 'Configurações', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#fafafa] flex flex-col">
      {/* TOP NAV */}
      <header className="h-16 border-b border-[#1f1f1f] bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-50 px-6">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight">ZEHLA</span>
            </Link>

            {/* Main Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                      isActive 
                        ? 'bg-[#1f1f1f] text-orange-500' 
                        : 'text-[#898989] hover:text-[#fafafa] hover:bg-[#1f1f1f]/50'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="hidden sm:flex relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4d4d4d]" />
              <input 
                type="text" 
                placeholder="Buscar lead ou reserva..." 
                className="bg-[#141414] border border-[#1f1f1f] rounded-full pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:border-orange-500/50 transition-all w-48 lg:w-64"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-full hover:bg-[#1f1f1f] transition-colors group">
              <Bell className="w-5 h-5 text-[#898989] group-hover:text-[#fafafa]" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-[#0a0a0a]"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="flex items-center gap-3 pl-4 border-l border-[#1f1f1f]">
              <div className="text-right hidden lg:block">
                <p className="text-sm font-medium text-[#fafafa] leading-none mb-1">
                  {session?.user?.name || 'Proprietário'}
                </p>
                <p className="text-[10px] text-[#FF5500] font-bold uppercase tracking-widest flex items-center justify-end gap-1">
                  <Zap className="w-2.5 h-2.5" />
                  Plano Max
                </p>
              </div>
              <button className="flex items-center gap-2 p-1 rounded-xl hover:bg-[#1f1f1f] transition-colors">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#242424] to-[#141414] border border-[#363636] flex items-center justify-center font-bold text-orange-500">
                  {session?.user?.name?.[0] || 'P'}
                </div>
                <ChevronDown className="w-4 h-4 text-[#4d4d4d]" />
              </button>
              
              <button 
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="p-2 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                title="Sair"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>

      {/* FOOTER NOTE */}
      <footer className="py-6 border-t border-[#1f1f1f] text-center">
        <p className="text-xs text-[#363636]">
          ZEHLA Brain v3.0 &copy; 2026 • Operando em modo de isolamento militarizado
        </p>
      </footer>
    </div>
  );
}
