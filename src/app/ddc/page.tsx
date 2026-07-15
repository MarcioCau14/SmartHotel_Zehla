'use client';

import dynamic from 'next/dynamic';

const DDCDashboardContent = dynamic(
  () => import('./DDCDashboardContent'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400 text-sm">Carregando DDC Dashboard...</p>
        </div>
      </div>
    ),
  }
);

export default function DDCPage() {
  return <DDCDashboardContent />;
}