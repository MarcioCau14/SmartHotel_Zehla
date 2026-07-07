'use client'

import { useEffect, useRef, useState } from 'react'

// Mesmo storage key usado em src/lib/api/api-client.ts
const AUTH_TOKEN_KEY = 'zcc_token'
const USER_NAME_KEY = 'zcc_user_name'

function getUserName(): string {
  if (typeof window === 'undefined') return 'Operador'
  return localStorage.getItem(USER_NAME_KEY) ?? 'Operador'
}

interface DashboardHeaderProps {
  readonly onToggleMobileNav: () => void
}

export function DashboardHeader({ onToggleMobileNav }: DashboardHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [userName, setUserName] = useState('Operador')
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setUserName(getUserName())
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  function handleLogout() {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(USER_NAME_KEY)
    window.location.href = '/zcc-login'
  }

  const initial = userName.trim().charAt(0).toUpperCase() || 'O'

  return (
    <header className="border-b bg-card px-4 py-3 sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Abrir menu"
            className="rounded p-1.5 hover:bg-accent lg:hidden"
            onClick={onToggleMobileNav}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
          <span className="text-lg font-bold tracking-tight">ZEHLA</span>
          <span className="hidden text-sm text-muted-foreground sm:inline">
            Control Center
          </span>
        </div>

        <div ref={menuRef} className="relative">
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-accent"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {initial}
            </span>
            <span className="hidden text-sm font-medium sm:inline">{userName}</span>
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full z-50 mt-2 w-44 rounded-md border bg-popover p-1 shadow-md"
            >
              <button
                type="button"
                role="menuitem"
                className="block w-full rounded px-3 py-2 text-left text-sm text-destructive hover:bg-accent"
                onClick={handleLogout}
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
