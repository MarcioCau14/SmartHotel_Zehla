'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { CognitiveTerminal } from '@/components/dashboard/CognitiveTerminal';
import { TrialBanner } from '@/components/dashboard/TrialBanner';

interface DashboardShellProps {
  children: React.ReactNode;
  propertyName: string;
  daysLeft: number;
  isTrialing: boolean;
}

export function DashboardShell({ children, propertyName, daysLeft, isTrialing }: DashboardShellProps) {
  const pathname = usePathname();
  const currentPath = pathname.replace(/^\/(dashboard|cliente)\//, '') || 'painel';
  const pageLabels: Record<string, string> = {
    painel: 'Painel',
    reservas: 'Reservas',
    quartos: 'Quartos',
    financeiro: 'Financeiro',
    promocoes: 'Promoções',
    configuracoes: 'Configurações',
    upgrade: 'Upgrade',
  };
  const pageLabel = pageLabels[currentPath] || 'Dashboard';

  return (
    <div className="flex h-screen bg-[#050505] text-[#b4b4b4] overflow-hidden relative">
      {/* Background ambient radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#FF5500]/[0.02] via-transparent to-transparent pointer-events-none z-0" />

      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 z-10 relative">
        {/* Trial Banner */}
        {isTrialing && <TrialBanner daysLeft={daysLeft} />}

        {/* Header */}
        <header className="sticky top-0 z-30 bg-[#050505]/75 backdrop-blur-md border-b border-white/5 shrink-0">
          <div className="flex items-center justify-between px-4 lg:px-6 h-16">
            <div>
              <h1 className="text-lg font-black tracking-wide text-white">{pageLabel}</h1>
              <p className="text-[10px] text-neutral-500 font-mono tracking-wider leading-none mt-1 uppercase">{propertyName}</p>
            </div>

            <div className="flex items-center gap-3">
              <CognitiveTerminal />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-transparent">
          {children}
        </main>
      </div>
    </div>
  );
}

