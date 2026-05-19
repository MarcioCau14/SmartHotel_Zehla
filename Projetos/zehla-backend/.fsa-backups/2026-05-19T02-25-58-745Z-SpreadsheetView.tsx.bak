"use client";
import { useState } from 'react';
import { 
  FileSpreadsheet, 
  BedDouble, 
  CalendarDays, 
  DollarSign, 
  Table 
} from 'lucide-react';

interface TenantData {
  rooms: any[];
  // ... outros campos se necessário
}

export function SpreadsheetView({ tenantData }: { tenantData: TenantData | null }) {
  const [activeSheet, setActiveSheet] = useState<'quartos' | 'reservas' | 'financeiro'>('quartos');

  const sheets = [
    { key: 'quartos' as const, label: 'Quartos', icon: BedDouble },
    { key: 'reservas' as const, label: 'Reservas', icon: CalendarDays },
    { key: 'financeiro' as const, label: 'Financeiro', icon: DollarSign },
  ];

  const tipoLabels: Record<string, string> = {
    STANDARD: 'Standard',
    LUXO: 'Luxo',
    SUITE: 'Suíte',
    CHALE: 'Chalé',
  };

  const statusLabels: Record<string, { label: string; className: string }> = {
    disponivel: { label: 'Disponível', className: 'bg-orange-500/15 text-orange-400 border-orange-500/20' },
    ocupado: { label: 'Ocupado', className: 'bg-red-500/15 text-red-400 border-red-500/20' },
    sujo: { label: 'Sujo', className: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
    manutencao: { label: 'Manutenção', className: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
  };

  const roomHeaders = ['Quarto', 'Tipo', 'Capacidade', 'Preço/Noite', 'Status'];
  const reservationHeaders = ['Hóspede', 'Quarto', 'Check-in', 'Check-out', 'Valor', 'Status'];
  const financialHeaders = ['Data', 'Descrição', 'Tipo', 'Valor', 'Status'];

  const roomsData = tenantData?.rooms || [];

  return (
    <div className="space-y-4">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-orange-400" />
            Planilhas
          </h1>
          <p className="text-sm text-neutral-500 mt-1">Controle organizado de quartos, reservas e financeiro</p>
        </div>
        <span className="text-[10px] text-neutral-600 bg-white/5 px-2 py-1 rounded border border-white/10">
          {roomsData.length} quartos cadastrados
        </span>
      </div>

      {/* Sheet tabs */}
      <div className="flex items-center gap-2">
        {sheets.map(sheet => {
          const Icon = sheet.icon;
          const isActive = activeSheet === sheet.key;
          return (
            <button
              key={sheet.key}
              onClick={() => setActiveSheet(sheet.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                  : 'bg-white/5 text-neutral-400 hover:text-neutral-200 border border-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              {sheet.label}
            </button>
          );
        })}
      </div>

      {/* Spreadsheet table */}
      <div className="glass-card overflow-hidden">
        {activeSheet === 'quartos' && (
          <>
            {roomsData.length > 0 ? (
              <div className="overflow-x-auto zehla-scroll-x">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10">
                      {roomHeaders.map(h => (
                        <th
                          key={h}
                          className="px-4 py-3 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {roomsData.map((room: any, i: number) => (
                      <tr
                        key={room.id}
                        className={`border-b border-white/5 last:border-b-0 ${
                          i % 2 === 0 ? 'bg-white/[0.02]' : 'bg-transparent'
                        } hover:bg-white/[0.04] transition-colors`}
                      >
                        <td className="px-4 py-3 text-sm font-medium text-neutral-200 font-mono whitespace-nowrap">
                          {room.number || room.name}
                        </td>
                        <td className="px-4 py-3 text-xs text-neutral-400 font-mono whitespace-nowrap">
                          {tipoLabels[room.type] || room.type}
                        </td>
                        <td className="px-4 py-3 text-xs text-neutral-400 font-mono whitespace-nowrap">
                          👥 {room.capacity} {room.capacity === 1 ? 'pessoa' : 'pessoas'}
                        </td>
                        <td className="px-4 py-3 text-xs font-mono whitespace-nowrap">
                          <span className="text-orange-400 font-semibold">
                            R$ {(room.basePrice || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                              statusLabels.disponivel.className
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mr-1.5" />
                            {room.status || 'Disponível'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptySpreadsheet />
            )}
          </>
        )}

        {activeSheet === 'reservas' && (
          <div className="overflow-x-auto zehla-scroll-x">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  {reservationHeaders.map(h => (
                    <th
                      key={h}
                      className="px-4 py-3 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={6}>
                    <EmptySpreadsheet />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeSheet === 'financeiro' && (
          <div className="overflow-x-auto zehla-scroll-x">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  {financialHeaders.map(h => (
                    <th
                      key={h}
                      className="px-4 py-3 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={5}>
                    <EmptySpreadsheet />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptySpreadsheet() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
        <Table className="w-7 h-7 text-neutral-700" />
      </div>
      <h3 className="text-sm font-semibold text-neutral-400 mb-1">Nenhum dado ainda</h3>
      <p className="text-xs text-neutral-600 max-w-sm">
        Os dados aparecerão aqui conforme sua pousada operar.
      </p>
    </div>
  );
}
