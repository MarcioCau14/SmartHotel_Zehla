'use client';

import { useState, useMemo } from 'react';
import { Tag, Percent, Calendar, Clock, Plus, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Promo {
  id: string;
  name: string;
  discount: string;
  validUntil: string;
  status: 'active' | 'scheduled' | 'expired';
  bookings: number;
  revenue: number;
  channel: string;
}

const initialPromos: Promo[] = [
{ id: '1', name: 'Páscoa em Família', discount: '20%', validUntil: '2025-04-20', status: 'active', bookings: 34, revenue: 28560, channel: 'WhatsApp + Booking' },
{ id: '2', name: 'Feriado Tiradentes', discount: '15%', validUntil: '2025-04-21', status: 'active', bookings: 22, revenue: 18700, channel: 'Instagram' },
{ id: '3', name: 'Low Season Special', discount: '30%', validUntil: '2025-05-31', status: 'active', bookings: 18, revenue: 12600, channel: 'Direct + Google' },
{ id: '4', name: 'Inverno Gaúcho', discount: '25%', validUntil: '2025-07-31', status: 'scheduled', bookings: 0, revenue: 0, channel: 'Email Marketing' },
{ id: '5', name: 'Black Friday Early', discount: '35%', validUntil: '2025-11-30', status: 'scheduled', bookings: 0, revenue: 0, channel: 'Todos os canais' },
{ id: '6', name: 'Réveillon 2024', discount: '10%', validUntil: '2025-01-02', status: 'expired', bookings: 45, revenue: 67500, channel: 'WhatsApp' },
{ id: '7', name: 'Carnaval 2025', discount: '5%', validUntil: '2025-03-05', status: 'expired', bookings: 52, revenue: 52000, channel: 'Booking.com' }];


const statusColors: Record<string, string> = {
  active: 'bg-[#FF5500]/10 text-[#FF5500]',
  scheduled: 'bg-blue-500/20 text-blue-400',
  expired: 'bg-neutral-500/20 text-[#898989]'
};

const statusLabels: Record<string, string> = {
  active: 'Ativa',
  scheduled: 'Agendada',
  expired: 'Expirada'
};

export function Promotions() {
  const [promos] = useState<Promo[]>(initialPromos);

  return (
    <div className="space-y-6">
      {/* Create promo */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-[#FF5500]/10">
            <Plus className="w-5 h-5 text-[#FF5500]" />
          </div>
          <div>
            <h3 className="font-semibold text-[#efefef]">Nova Promoção</h3>
            <p className="text-xs text-[#4d4d4d]">Crie e distribua promoções automaticamente</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <Input placeholder="Nome da promoção" className="bg-[#242424] border-[#363636] text-sm" />
          <Input placeholder="Desconto (ex: 20%)" className="bg-[#242424] border-[#363636] text-sm" />
          <Input type="date" className="bg-[#242424] border-[#363636] text-sm" />
          <Button className="bg-orange-500 hover:bg-orange-600 text-white">
            Criar Promoção
          </Button>
        </div>
      </div>

      {/* Promo stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 text-center">
          <Tag className="w-5 h-5 text-[#FF5500] mx-auto mb-2" />
          <div className="text-xl font-bold text-[#efefef]">{useMemo(() => promos.filter((p) => p.status === 'active'), []).length}</div>
          <div className="text-xs text-[#4d4d4d]">Ativas</div>
        </div>
        <div className="glass-card p-4 text-center">
          <Percent className="w-5 h-5 text-[#FF5500] mx-auto mb-2" />
          <div className="text-xl font-bold text-[#efefef]">R$ {useMemo(() => promos.reduce((s, p) => s + p.revenue, 0), []).toLocaleString('pt-BR')}</div>
          <div className="text-xs text-[#4d4d4d]">Receita Total</div>
        </div>
        <div className="glass-card p-4 text-center">
          <Users className="w-5 h-5 text-[#FF5500] mx-auto mb-2" />
          <div className="text-xl font-bold text-[#efefef]">{useMemo(() => promos.reduce((s, p) => s + p.bookings, 0), [])}</div>
          <div className="text-xs text-[#4d4d4d]">Reservas</div>
        </div>
        <div className="glass-card p-4 text-center">
          <TrendingUp className="w-5 h-5 text-[#FF5500] mx-auto mb-2" />
          <div className="text-xl font-bold text-[#efefef]">23%</div>
          <div className="text-xs text-[#4d4d4d]">Upsell Rate</div>
        </div>
      </div>

      {/* Promo list */}
      <div className="space-y-3">
        {promos.map((promo) =>
        <div key={promo.id} className="glass-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#242424]">
                <Calendar className="w-4 h-4 text-[#898989]" />
              </div>
              <div>
                <div className="font-medium text-[#efefef]">{promo.name}</div>
                <div className="flex items-center gap-2 text-xs text-[#4d4d4d]">
                  <span>{promo.discount} desconto</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Até {promo.validUntil}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {promo.status !== 'scheduled' &&
            <>
                  <div className="text-right hidden sm:block">
                    <div className="text-xs text-[#4d4d4d]">Reservas</div>
                    <div className="text-sm font-semibold text-[#b4b4b4]">{promo.bookings}</div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="text-xs text-[#4d4d4d]">Receita</div>
                    <div className="text-sm font-semibold text-[#FF5500]">R$ {promo.revenue.toLocaleString('pt-BR')}</div>
                  </div>
                </>
            }
              <Badge className={`${statusColors[promo.status]} border-0`}>
                {statusLabels[promo.status]}
              </Badge>
            </div>
          </div>
        )}
      </div>
    </div>);

}