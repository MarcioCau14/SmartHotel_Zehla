'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export interface NavItem {
  readonly href: string
  readonly label: string
}

export const NAV_ITEMS: readonly NavItem[] = [
  { href: '/crm', label: 'CRM' },
  { href: '/farmer', label: 'Farmer IA' },
  { href: '/reservas', label: 'Reservas' },
  { href: '/brain', label: 'Cognitive Terminal' },
  { href: '/social', label: 'Social Capture' },
  { href: '/revenue', label: 'Inteligência de Mercado' },
] as const

function NavLinks({ onNavigate }: { readonly onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <ul className="space-y-1 text-sm">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={isActive ? 'page' : undefined}
              className={`block rounded px-3 py-2 font-medium ${
                isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-accent'
              }`}
            >
              {item.label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

interface DashboardSidebarProps {
  readonly mobileOpen: boolean
  readonly onMobileClose: () => void
}

export function DashboardSidebar({ mobileOpen, onMobileClose }: DashboardSidebarProps) {
  return (
    <>
      {/* Sidebar fixa em desktop */}
      <nav
        aria-label="Navegação principal"
        className="hidden w-56 shrink-0 border-r bg-muted/30 p-4 lg:block"
      >
        <NavLinks />
      </nav>

      {/* Drawer em mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="Fechar menu"
            className="absolute inset-0 bg-black/50"
            onClick={onMobileClose}
          />
          <nav
            aria-label="Navegação principal"
            className="absolute inset-y-0 left-0 w-64 border-r bg-background p-4 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-lg font-bold tracking-tight">ZEHLA</span>
              <button
                type="button"
                aria-label="Fechar menu"
                className="rounded p-1 text-muted-foreground hover:bg-accent"
                onClick={onMobileClose}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <NavLinks onNavigate={onMobileClose} />
          </nav>
        </div>
      )}
    </>
  )
}
