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
  { key: 'painel', label: 'Painel', href: '/dashboard/painel', icon: LayoutDashboard },
  { key: 'reservas', label: 'Reservas', href: '/dashboard/reservas', icon: CalendarDays },
  { key: 'quartos', label: 'Quartos', href: '/dashboard/quartos', icon: BedDouble },
  { key: 'financeiro', label: 'Financeiro', href: '/dashboard/financeiro', icon: Wallet },
  { key: 'promocoes', label: 'Promoções', href: '/dashboard/promocoes', icon: Tag },
  { key: 'configuracoes', label: 'Configurações', href: '/dashboard/configuracoes', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentPath = pathname.replace('/dashboard/', '') || 'painel';

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-orange-500 shadow-xl shadow-orange-500/30 flex items-center justify-center text-white"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 h-screen z-50 lg:z-auto',
          'flex flex-col bg-black border-r border-white/5',
          'transition-transform duration-300 ease-in-out w-[260px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-5 border-b border-white/5 shrink-0">
          <Link href="/dashboard/painel" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-base text-neutral-100 leading-none">ZEHLA</span>
              <span className="block text-[10px] text-neutral-600 leading-none mt-0.5">SmartHotel</span>
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden ml-auto p-1.5 rounded-lg hover:bg-white/5"
          >
            <X className="w-4 h-4 text-neutral-500" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = currentPath === item.key;
            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  isActive
                    ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                    : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/5'
                )}
              >
                <item.icon className="w-4.5 h-4.5 shrink-0" />
                <span>{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Upgrade CTA */}
        <div className="px-3 pb-4">
          <Link
            href="/dashboard/upgrade"
            className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 hover:from-orange-500/20 hover:to-amber-500/20 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 text-orange-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-orange-400">Fazer Upgrade</p>
              <p className="text-[10px] text-neutral-600">Desbloqueie todos os recursos</p>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}
