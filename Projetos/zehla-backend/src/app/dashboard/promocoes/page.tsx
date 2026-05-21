'use client';

import { useState } from 'react';
import { Tag, Plus, Megaphone, CalendarDays, Users, DollarSign } from 'lucide-react';

export default function PromocoesPage() {
  const [promos] = useState([
    { id: 1, name: 'Pacote Réveillon 2026', discount: 20, type: 'percentage', startDate: '2026-12-28', endDate: '2027-01-02', status: 'active', bookings: 12, revenue: 15840 },
    { id: 2, name: 'Desconto Última Hora', discount: 15, type: 'percentage', startDate: '2026-05-01', endDate: '2026-06-30', status: 'active', bookings: 8, revenue: 4320 },
    { id: 3, name: 'Feriado Tiradentes', discount: 10, type: 'percentage', startDate: '2026-04-17', endDate: '2026-04-21', status: 'ended', bookings: 15, revenue: 8550 },
    { id: 4, name: 'Stay 4 Pay 3', discount: 25, type: 'percentage', startDate: '2026-07-01', endDate: '2026-08-31', status: 'scheduled', bookings: 0, revenue: 0 },
  ]);

  const totalBookings = promos.reduce((s, p) => s + p.bookings, 0);
  const totalRevenue = promos.reduce((s, p) => s + p.revenue, 0);

  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    active: { label: 'Ativa', color: '#25D366', bg: 'rgba(37, 211, 102, 0.1)' },
    ended: { label: 'Encerrada', color: '#8696A0', bg: 'rgba(0,0,0,0.06)' },
    scheduled: { label: 'Agendada', color: '#FFB74D', bg: 'rgba(255, 183, 77, 0.15)' },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="dash-page-title">Promoções</h1>
          <p className="dash-page-subtitle">{totalBookings} reservas via promoções · R$ {totalRevenue.toLocaleString('pt-BR')} em receita</p>
        </div>
        <button className="dash-btn-primary">
          <Plus className="w-4 h-4" />
          Nova Promoção
        </button>
      </div>

      {/* Stats */}
      <div className="dash-grid-3">
        <div className="dash-kpi">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(37, 211, 102, 0.1)' }}>
              <Tag className="w-5 h-5" style={{ color: '#25D366' }} />
            </div>
          </div>
          <p className="text-2xl font-bold" style={{ color: '#111B21' }}>{promos.filter(p => p.status === 'active').length}</p>
          <p className="text-sm" style={{ color: '#667781' }}>Promoções Ativas</p>
        </div>
        <div className="dash-kpi">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(18, 140, 126, 0.1)' }}>
              <CalendarDays className="w-5 h-5" style={{ color: '#128C7E' }} />
            </div>
          </div>
          <p className="text-2xl font-bold" style={{ color: '#111B21' }}>{totalBookings}</p>
          <p className="text-sm" style={{ color: '#667781' }}>Reservas Geradas</p>
        </div>
        <div className="dash-kpi">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(7, 94, 84, 0.1)' }}>
              <DollarSign className="w-5 h-5" style={{ color: '#075E54' }} />
            </div>
          </div>
          <p className="text-2xl font-bold" style={{ color: '#111B21' }}>R$ {totalRevenue.toLocaleString('pt-BR')}</p>
          <p className="text-sm" style={{ color: '#667781' }}>Receita Total</p>
        </div>
      </div>

      {/* Promo cards */}
      <div className="space-y-4">
        {promos.map((promo) => {
          const status = statusConfig[promo.status] || statusConfig.ended;
          return (
            <div key={promo.id} className="dash-card p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(37, 211, 102, 0.1)' }}>
                    <Megaphone className="w-6 h-6" style={{ color: '#25D366' }} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold" style={{ color: '#111B21' }}>{promo.name}</h3>
                    <p className="text-sm mt-1" style={{ color: '#667781' }}>
                      {promo.discount}% de desconto · {new Date(promo.startDate).toLocaleDateString('pt-BR')} — {new Date(promo.endDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="dash-status" style={{ backgroundColor: status.bg, color: status.color }}>
                    {status.label}
                  </span>
                  <span className="text-sm font-medium" style={{ color: '#111B21' }}>
                    {promo.bookings} reservas
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
