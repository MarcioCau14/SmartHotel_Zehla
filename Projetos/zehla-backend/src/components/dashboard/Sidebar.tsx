'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BedDouble,
  CalendarDays,
  Wallet,
  Tag,
  Settings,
  ArrowUpRight,
  Brain,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { key: 'painel', label: 'Painel', href: '/cliente/painel', icon: LayoutDashboard },
  { key: 'reservas', label: 'Reservas', href: '/cliente/reservas', icon: CalendarDays },
  { key: 'quartos', label: 'Quartos', href: '/cliente/quartos', icon: BedDouble },
  { key: 'financeiro', label: 'Financeiro', href: '/cliente/financeiro', icon: Wallet },
  { key: 'promocoes', label: 'Promoções', href: '/cliente/promocoes', icon: Tag },
  { key: 'configuracoes', label: 'Configurações', href: '/cliente/configuracoes', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentPath = pathname.replace(/^\/(dashboard|cliente)\//, '') || 'painel';

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[#FF5500] to-[#FF8800] shadow-lg shadow-[#FF5500]/30 hover:shadow-[#FF5500]/50 active:scale-95 flex items-center justify-center text-white transition-all duration-300"
      >
        <Menu className="w-6 h-6 animate-pulse" />
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 h-screen z-50 lg:z-auto',
          'flex flex-col bg-[#050505] border-r border-white/5 shadow-[2px_0_15px_rgba(0,0,0,0.6)]',
          'transition-transform duration-300 ease-in-out w-[260px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-5 border-b border-white/5 shrink-0">
          <Link href="/cliente/painel" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF5500] to-[#FF8800] flex items-center justify-center shadow-[0_0_12px_rgba(255,85,0,0.3)] group-hover:shadow-[0_0_18px_rgba(255,85,0,0.5)] transition-all duration-300">
              <Brain className="w-5 h-5 text-white group-hover:rotate-[10deg] transition-transform duration-300" />
            </div>
            <div>
              <span className="font-bold text-base text-neutral-100 leading-none tracking-wider group-hover:text-white transition-colors">ZEHLA</span>
              <span className="block text-[10px] text-neutral-600 leading-none mt-0.5 font-medium">SmartHotel</span>
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden ml-auto p-1.5 rounded-lg hover:bg-white/5 text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5">
          {navItems.map((item) => {
            const isActive = currentPath === item.key;
            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 border',
                  isActive
                    ? 'bg-[#FF5500]/10 text-[#FF5500] border-[#FF5500]/25 shadow-[0_0_15px_rgba(255,85,0,0.06)]'
                    : 'text-neutral-500 border-transparent hover:text-neutral-300 hover:bg-white/[0.03] hover:border-white/5'
                )}
              >
                <item.icon className={cn('w-4.5 h-4.5 shrink-0 transition-colors duration-300', isActive ? 'text-[#FF5500]' : 'text-neutral-500 group-hover:text-neutral-300')} />
                <span>{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FF5500] shadow-[0_0_8px_#FF5500] animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Upgrade CTA */}
        <div className="px-3 pb-4">
          <Link
            href="/cliente/upgrade"
            className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-gradient-to-r from-[#FF5500]/10 to-[#FF8800]/5 border border-[#FF5500]/25 hover:border-[#FF5500]/40 shadow-[0_0_15px_rgba(255,85,0,0.04)] hover:shadow-[0_0_20px_rgba(255,85,0,0.1)] transition-all duration-300 group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#FF5500]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-8 h-8 rounded-lg bg-[#FF5500]/20 flex items-center justify-center shadow-[0_0_10px_rgba(255,85,0,0.15)] group-hover:scale-105 transition-transform duration-300 shrink-0">
              <ArrowUpRight className="w-4 h-4 text-[#FF5500]" />
            </div>
            <div className="flex-1 min-w-0 z-10">
              <p className="text-xs font-bold text-[#FF5500] group-hover:text-white transition-colors duration-300">Fazer Upgrade</p>
              <p className="text-[10px] text-neutral-500 group-hover:text-neutral-400 transition-colors duration-300">Desbloqueie o cérebro ZEHLA</p>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}

