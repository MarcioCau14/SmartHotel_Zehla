'use client'

import React from 'react'
import Link from 'next/link'
import { useAuth } from '../../hooks/useAuth'
import { redirect } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/zcc', label: 'Dashboard', icone: '\u2302' },
  { href: '/zcc/leads', label: 'Leads', icone: '\u2691' },
  { href: '/zcc/operacional', label: 'Operacional', icone: '\u2630' },
]

export default function ZCCLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, session } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
          <span className="text-xs text-slate-500 font-mono">Verificando credenciais...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    redirect('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-50 font-sans flex">
      <aside className="w-56 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
            <span className="text-sm font-bold tracking-tight font-display">ZCC</span>
          </div>
          {session && (
            <p className="text-[10px] text-slate-500 font-mono mt-2 truncate">
              ID: {session.userId.slice(0, 8)}...
            </p>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 text-xs text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors font-mono"
            >
              <span className="text-sm">{item.icone}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <span className="text-[9px] text-slate-600 font-mono">
            ZEHLA v2.0
          </span>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
