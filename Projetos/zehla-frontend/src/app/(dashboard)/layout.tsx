import type { ReactNode } from 'react'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-card px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight">ZEHLA</span>
            <span className="hidden text-sm text-muted-foreground sm:inline">
              Control Center
            </span>
          </div>
        </div>
      </header>
      <div className="flex flex-1">
        <nav className="hidden w-56 shrink-0 border-r bg-muted/30 p-4 lg:block">
          <ul className="space-y-1 text-sm">
            <li><a href="/crm" className="block rounded px-3 py-2 font-medium hover:bg-accent">CRM</a></li>
            <li><a href="/farmer" className="block rounded px-3 py-2 font-medium hover:bg-accent">Farmer IA</a></li>
            <li><a href="/reservas" className="block rounded px-3 py-2 font-medium hover:bg-accent">Reservas</a></li>
            <li><a href="/brain" className="block rounded px-3 py-2 font-medium hover:bg-accent">Cognitive Terminal</a></li>
            <li><a href="/social" className="block rounded px-3 py-2 font-medium hover:bg-accent">Social Capture</a></li>
          </ul>
        </nav>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
