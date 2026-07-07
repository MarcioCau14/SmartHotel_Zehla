'use client'

import { useState, type ReactNode } from 'react'
import { DashboardHeader } from './DashboardHeader'
import { DashboardSidebar } from './DashboardSidebar'

export function DashboardShell({ children }: { readonly children: ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader onToggleMobileNav={() => setMobileNavOpen((open) => !open)} />
      <div className="flex flex-1">
        <DashboardSidebar
          mobileOpen={mobileNavOpen}
          onMobileClose={() => setMobileNavOpen(false)}
        />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
