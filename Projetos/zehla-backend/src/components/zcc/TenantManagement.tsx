import { Building2, Clock, CheckCircle, XCircle, AlertTriangle, Search, Phone, Star, Users, DollarSign, TrendingUp, MapPin, MessageCircle } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

import type { Property } from '@/lib/store';

'use client';


const statusColors: Record<string, string> = {
  active: 'bg-[#FF5500]/10 text-[#FF5500]',
  trial: 'bg-[#FF5500]/10 text-[#FF5500]',
  suspended: 'bg-red-500/20 text-red-400'
};

const statusLabels: Record<string, string> = {
  active: 'Ativo',
  trial: 'Trial',
  suspended: 'Suspenso'
};

interface PropertyMetrics {
  occupancy: number;
  revenue: number;
  activeGuests: number;
}

interface PropertyActivity {
  id: string;
  text: string;
  time: string;
  type: 'info' | 'warning' | 'success';
}

interface PropertyFull extends Property {
  contact?: string;
  whatsapp?: string;
  metrics: PropertyMetrics;
  activities: PropertyActivity[];
}

const mockProperties: PropertyFull[] = [
{
  id: 'prop-1', name: 'Pousada Maravilha', city: 'Fernando de Noronha', state: 'PE', rooms: 14, status: 'active', trialDaysLeft: 0, googleRating: 4.8,
  contact: '(81) 99999-1234', whatsapp: '5581999991234',
  metrics: { occupancy: 92, revenue: 24780, activeGuests: 12 },
  activities: [
  { id: 'a1', text: 'Novo check-in: Ana Carolina Silva', time: '14:30', type: 'success' },
  { id: 'a2', text: 'Reserva confirmada: Isabela R. Lima', time: '12:15', type: 'info' },
  { id: 'a3', text: 'Review 5⭐ no Google', time: '09:40', type: 'success' }]

},
{
  id: 'prop-2', name: 'Pousada Vila Floripa', city: 'Florianópolis', state: 'SC', rooms: 8, status: 'active', trialDaysLeft: 0, googleRating: 4.6,
  contact: '(48) 98888-5678', whatsapp: '5548988885678',
  metrics: { occupancy: 87, revenue: 18450, activeGuests: 6 },
  activities: [
  { id: 'a4', text: 'Check-out: Gabriela S. Mendes', time: '11:00', type: 'info' },
  { id: 'a5', text: 'Manutenção concluída: Quarto 203', time: '10:30', type: 'success' },
  { id: 'a6', text: 'Upgrade de plano solicitado', time: '08:00', type: 'warning' }]

},
{
  id: 'prop-3', name: 'Pousada do Ouro', city: 'Paraty', state: 'RJ', rooms: 12, status: 'active', trialDaysLeft: 0, googleRating: 4.9,
  contact: '(24) 97777-9012', whatsapp: '5524977779012',
  metrics: { occupancy: 95, revenue: 31200, activeGuests: 10 },
  activities: [
  { id: 'a7', text: 'Taxa de ocupação atingiu 95%', time: '16:00', type: 'success' },
  { id: 'a8', text: 'Restaurante lotado — redirecionando hóspedes', time: '13:00', type: 'warning' },
  { id: 'a9', text: '3 novas reservas via Booking.com', time: '09:15', type: 'info' }]

},
{
  id: 'prop-4', name: 'Pousada Chapada dos Veadeiros', city: 'Alto Paraíso', state: 'GO', rooms: 6, status: 'trial', trialDaysLeft: 4, googleRating: 4.5,
  contact: '(62) 96666-3456', whatsapp: '5562966663456',
  metrics: { occupancy: 68, revenue: 8900, activeGuests: 3 },
  activities: [
  { id: 'a10', text: '⚠️ Trial expira em 4 dias', time: 'Hoje', type: 'warning' },
  { id: 'a11', text: 'Primeira reserva via ZEHLA', time: 'Ontem', type: 'success' },
  { id: 'a12', text: 'Setup em progresso: 75% concluído', time: 'Ontem', type: 'info' }]

},
{
  id: 'prop-5', name: 'Pousada Bela Jeri', city: 'Jericoacoara', state: 'CE', rooms: 10, status: 'active', trialDaysLeft: 0, googleRating: 4.7,
  contact: '(88) 95555-7890', whatsapp: '5588955557890',
  metrics: { occupancy: 88, revenue: 21500, activeGuests: 8 },
  activities: [
  { id: 'a13', text: 'Tour sunset agendado: 5 hóspedes', time: '15:00', type: 'info' },
  { id: 'a14', text: 'Review 5⭐ no Google', time: '10:20', type: 'success' },
  { id: 'a15', text: 'Pagamento PIX recebido: R$ 2.400', time: '08:45', type: 'success' }]

},
{
  id: 'prop-6', name: 'Pousada Serrana', city: 'Gramado', state: 'RS', rooms: 9, status: 'trial', trialDaysLeft: 6, googleRating: 4.4,
  contact: '(54) 94444-1234', whatsapp: '5554944441234',
  metrics: { occupancy: 72, revenue: 6200, activeGuests: 4 },
  activities: [
  { id: 'a16', text: 'Onboarding em progresso', time: 'Hoje', type: 'info' },
  { id: 'a17', text: 'Quartos cadastrados: 9/9', time: 'Hoje', type: 'success' },
  { id: 'a18', text: '⚠️ Trial expira em 6 dias', time: 'Hoje', type: 'warning' }]

}];


export function TenantManagement() : void {
  try {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetch('/api/zcc/properties').
    then((res) => res.json()).
    then((data) => {
      setProperties(Array.isArray(data) ? data : []);
      setLoading(false);
    }).
    catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => properties.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.city.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    return true;
  }), []);

  const activityTypeColors = {
    info: 'bg-blue-500/20 text-blue-400',
    warning: 'bg-[#FF5500]/10 text-[#FF5500]',
    success: 'bg-[#FF5500]/10 text-[#FF5500]'
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>);

  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-[#FF5500]">{useMemo(() => properties.filter((p) => p.status === 'ACTIVE'), []).length}</div>
          <div className="text-xs text-[#4d4d4d]">Ativos</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-[#FF5500]">{useMemo(() => properties.filter((p) => p.status === 'TRIAL' || p.isTrial), []).length}</div>
          <div className="text-xs text-[#4d4d4d]">Trial</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-[#b4b4b4]">{properties.length}</div>
          <div className="text-xs text-[#4d4d4d]">Total</div>
        </div>
      </div>

      {/* Search / Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4d4d4d]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou cidade..."
            className="bg-[#242424] border-[#363636] text-sm pl-9" />
          
        </div>
        <div className="flex gap-2">
          {['all', 'active', 'trial', 'suspended'].map((s) =>
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`text-[10px] px-3 py-2 rounded-lg border whitespace-nowrap font-medium transition-all ${
            filterStatus === s ?
            s === 'active' ? 'bg-[#FF5500]/10 text-[#FF5500] border-[#FF5500]/30' :
            s === 'trial' ? 'bg-[#FF5500]/10 text-[#FF5500] border-[#FF5500]/30' :
            s === 'suspended' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
            'bg-[#2e2e2e] text-[#b4b4b4] border-[#363636]' :
            'bg-transparent text-[#363636] border-[#2e2e2e] hover:border-white/20 hover:text-[#898989]'}`
            }>
            
              {s === 'all' ? 'Todos' : statusLabels[s]}
            </button>
          )}
        </div>
      </div>

      {/* Property Cards — CRM Style */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((prop) =>
        <div key={prop.id} className="glass-card p-5 hover:bg-white/[0.03] transition-all space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#242424]">
                  <Building2 className="w-4 h-4 text-[#898989]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-[#efefef] text-sm">{prop.name}</h3>
                    <span className="text-[8px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-500 font-mono">
                      {prop.registrationNumber || '0000/OFF/SC'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-[#4d4d4d] mt-0.5">
                    <MapPin className="w-3 h-3" />
                    {prop.city}, {prop.state}
                  </div>
                </div>
              </div>
              <Badge className={`${statusColors[prop.status]} border-0 text-[10px]`}>
                {statusLabels[prop.status]}
              </Badge>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/[0.02] rounded-lg p-2 text-center">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <Star className="w-3 h-3 text-[#FF5500]" />
                  <span className="text-xs font-bold text-[#efefef]">{prop.googleRating}</span>
                </div>
                <div className="text-[10px] text-[#363636]">Google</div>
              </div>
              <div className="bg-white/[0.02] rounded-lg p-2 text-center">
                <div className="text-xs font-bold text-[#efefef]">{prop.rooms}</div>
                <div className="text-[10px] text-[#363636]">Quartos</div>
              </div>
              <div className="bg-white/[0.02] rounded-lg p-2 text-center">
                {prop.status === 'trial' ?
              <>
                    <div className="text-xs font-bold text-[#FF5500] flex items-center justify-center gap-0.5">
                      <Clock className="w-3 h-3" />
                      {prop.trialDaysLeft}d
                    </div>
                    <div className="text-[10px] text-[#363636]">Trial</div>
                  </> :

              <>
                    <div className="text-xs font-bold text-[#FF5500] flex items-center justify-center gap-0.5">
                      <CheckCircle className="w-3 h-3" />
                      Sim
                    </div>
                    <div className="text-[10px] text-[#363636]">Ativo</div>
                  </>
              }
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/[0.02] rounded-lg p-2">
                <div className="flex items-center gap-1 text-[10px] text-[#4d4d4d] mb-0.5">
                  <TrendingUp className="w-3 h-3" />
                  Ocupação
                </div>
                <div className={`text-sm font-bold text-[#FF5500]`}>
                  {Math.floor(Math.random() * 20 + 70)}%
                </div>
              </div>
              <div className="bg-white/[0.02] rounded-lg p-2">
                <div className="flex items-center gap-1 text-[10px] text-[#4d4d4d] mb-0.5">
                  <DollarSign className="w-3 h-3" />
                  Reservas
                </div>
                <div className="text-sm font-bold text-[#efefef]">
                  {prop._count?.reservations || 0}
                </div>
              </div>
              <div className="bg-white/[0.02] rounded-lg p-2">
                <div className="flex items-center gap-1 text-[10px] text-[#4d4d4d] mb-0.5">
                  <Users className="w-3 h-3" />
                  Quartos
                </div>
                <div className="text-sm font-bold text-[#efefef]">{prop._count?.rooms || 0}</div>
              </div>
            </div>

            {/* Contact */}
            <div className="flex items-center gap-2 text-[10px] text-[#4d4d4d]">
              <Phone className="w-3 h-3" />
              <span>{prop.phone || 'Sem contato'}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
              size="sm"
              className="flex-1 bg-[#FF5500]/10 hover:bg-[#FF5500]/10 text-[#FF5500] border border-orange-500/20 text-[10px] h-8"
              onClick={() => {
                if (prop.whatsapp) {
                  window.open(`https://wa.me/${prop.whatsapp}`, '_blank');
                }
              }}>
              
                <MessageCircle className="w-3 h-3 mr-1" />
                Contactar
              </Button>
              <Button
              size="sm"
              variant="ghost"
              className="flex-1 text-[10px] text-[#898989] hover:text-[#efefef] hover:bg-[#242424] h-8">
              
                Ver Detalhes
              </Button>
            </div>

            {/* Recent Activity */}
            <div>
              <div className="text-[10px] text-[#363636] mb-2 font-medium">Atividade Recente</div>
              <div className="space-y-1.5">
                {(prop.activities || []).map((activity: unknown) =>
              <div key={activity.id} className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                activity.type === 'success' ? 'bg-[#FF5500]' :
                activity.type === 'warning' ? 'bg-amber-400' :
                'bg-blue-400'}`
                } />
                    <span className="text-[10px] text-[#898989] flex-1 truncate">{activity.text}</span>
                    <span className="text-[10px] text-[#363636] whitespace-nowrap">{activity.time}</span>
                  </div>
              )}
              </div>
            </div>
          </div>
        )}
      </div>

      {filtered.length === 0 &&
      <div className="text-center py-12 text-[#4d4d4d]">
          <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Nenhuma propriedade encontrada</p>
        </div>
      }

      {/* Tenant Activity Alerts */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-[#b4b4b4] mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#FF5500]" />
          Alertas de Tenant
        </h3>
        <div className="space-y-2">
          {[
          { msg: 'Pousada Chapada — Trial expira em 4 dias. Nenhum pagamento registrado.', severity: 'warning' },
          { msg: 'Pousada Serrana — Trial expira em 6 dias. Setup em progresso.', severity: 'warning' },
          { msg: 'Pousada Maravilha — Upgrade de plano solicitado: Básico → Premium.', severity: 'info' }].
          map((alert, i) =>
          <div key={i} className="p-3 rounded-lg bg-white/[0.02] flex items-start gap-2">
              <span className={`status-dot mt-1.5 ${alert.severity === 'warning' ? 'bg-amber-400' : 'bg-blue-400'}`} />
              <span className="text-xs text-[#898989]">{alert.msg}</span>
            </div>
          )}
        </div>
      </div>
    </div>);

}