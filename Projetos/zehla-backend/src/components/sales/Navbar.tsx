'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Brain, Menu, X } from 'lucide-react';

interface NavbarProps {
  currentPlan: 'free' | 'lite' | 'pro' | 'max';
}

const planLinks: Record<string, { label: string; href: string }[]> = {
  free: [
    { label: 'Lite', href: '/vendas/lite' },
    { label: 'PRO', href: '/vendas/pro' },
    { label: 'MAX', href: '/vendas/max' },
  ],
  lite: [
    { label: 'Grátis', href: '/vendas/free' },
    { label: 'PRO', href: '/vendas/pro' },
    { label: 'MAX', href: '/vendas/max' },
  ],
  pro: [
    { label: 'Grátis', href: '/vendas/free' },
    { label: 'Lite', href: '/vendas/lite' },
    { label: 'MAX', href: '/vendas/max' },
  ],
  max: [
    { label: 'Grátis', href: '/vendas/free' },
    { label: 'Lite', href: '/vendas/lite' },
    { label: 'PRO', href: '/vendas/pro' },
  ],
};

export function Navbar({ currentPlan }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = planLinks[currentPlan];

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-black/80 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
            <Brain className="w-5 h-5 text-orange-500" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-neutral-100 leading-none">ZEHLA</span>
            <span className="text-[10px] text-neutral-500 leading-none">SmartHotel</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs text-neutral-400 hover:text-white font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="text-xs text-neutral-400 hover:text-white font-medium transition-colors ml-4 px-4 py-2 rounded-full border border-white/10 hover:border-white/20"
          >
            Entrar
          </Link>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-neutral-400 hover:text-white"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-white/5 bg-black/95 backdrop-blur-xl">
          <div className="px-6 py-4 space-y-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block text-sm text-neutral-400 hover:text-white font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="block text-sm text-neutral-400 hover:text-white font-medium transition-colors pt-3 border-t border-white/5"
            >
              Entrar
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
