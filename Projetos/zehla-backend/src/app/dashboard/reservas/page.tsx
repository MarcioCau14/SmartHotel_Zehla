'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, Plus, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  CONFIRMED: { label: 'Confirmada', color: '#25D366', bg: 'rgba(37, 211, 102, 0.1)' },
  CHECKED_IN: { label: 'Check-in', color: '#128C7E', bg: 'rgba(18, 140, 126, 0.1)' },
  CHECKED_OUT: { label: 'Check-out', color: '#8696A0', bg: 'rgba(0,0,0,0.06)' },
  CANCELLED: { label: 'Cancelada', color: '#EA4335', bg: 'rgba(234, 67, 53, 0.1)' },
  PENDING: { label: 'Pendente', color: '#FFB74D', bg: 'rgba(255, 183, 77, 0.15)' },
  NO_SHOW: { label: 'No Show', color: '#8696A0', bg: 'rgba(0,0,0,0.06)' },
};

export default function ReservasPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/reservations')
      .then(res => res.json())
      .then(data => {
        if (data.reservations) setReservations(data.reservations);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = reservations.filter(r =>
    r.guestName?.toLowerCase().includes(search.toLowerCase()) ||
    r.code?.toLowerCase().includes(search.toLowerCase()) ||
    r.guestPhone?.includes(search)
  );

  const stats = {
    total: reservations.length,
    confirmed: reservations.filter(r => r.status === 'CONFIRMED').length,
    checkedIn: reservations.filter(r => r.status === 'CHECKED_IN').length,
    totalRevenue: reservations.reduce((sum, r) => sum + (r.paidAmount || 0), 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 rounded-full border-2 border-[#25D366]/20 border-t-[#25D366] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="dash-page-title">Reservas</h1>
          <p className="dash-page-subtitle">{stats.confirmed} confirmadas · {stats.checkedIn} hospedando</p>
        </div>
        <button className="dash-btn-primary">
          <Plus className="w-4 h-4" />
          Nova Reserva
        </button>
      </div>

      {/* Stats */}
      <div className="dash-grid-3">
        <div className="dash-kpi">
          <p className="text-2xl font-bold" style={{ color: '#111B21' }}>{stats.total}</p>
          <p className="text-sm" style={{ color: '#667781' }}>Total de Reservas</p>
        </div>
        <div className="dash-kpi">
          <p className="text-2xl font-bold" style={{ color: '#25D366' }}>{stats.confirmed}</p>
          <p className="text-sm" style={{ color: '#667781' }}>Confirmadas</p>
        </div>
        <div className="dash-kpi">
          <p className="text-2xl font-bold" style={{ color: '#128C7E' }}>R$ {stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</p>
          <p className="text-sm" style={{ color: '#667781' }}>Receita Total</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#8696A0' }} />
          <input
            type="text"
            placeholder="Buscar por nome, código ou telefone..."
            className="dash-input pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="dash-btn-secondary">
          <Filter className="w-4 h-4" />
          Filtrar
        </button>
      </div>

      {/* Reservations table */}
      <div className="dash-section overflow-hidden p-0">
        <table className="dash-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Hóspede</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Valor</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((res) => {
              const status = statusConfig[res.status] || statusConfig.PENDING;
              return (
                <tr key={res.id}>
                  <td className="font-mono text-sm" style={{ color: '#667781' }}>{res.code}</td>
                  <td>
                    <p className="text-sm font-medium" style={{ color: '#111B21' }}>{res.guestName}</p>
                    <p className="text-xs" style={{ color: '#8696A0' }}>{res.guestPhone}</p>
                  </td>
                  <td className="text-sm">{new Date(res.checkIn).toLocaleDateString('pt-BR')}</td>
                  <td className="text-sm">{new Date(res.checkOut).toLocaleDateString('pt-BR')}</td>
                  <td className="text-sm font-medium" style={{ color: '#111B21' }}>R$ {res.totalAmount}</td>
                  <td>
                    <span className="dash-status" style={{ backgroundColor: status.bg, color: status.color }}>
                      {status.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <CalendarDays className="w-12 h-12 mx-auto mb-3" style={{ color: '#8696A0' }} />
            <p className="text-sm font-medium" style={{ color: '#667781' }}>Nenhuma reserva encontrada</p>
          </div>
        )}
      </div>
    </div>
  );
}
