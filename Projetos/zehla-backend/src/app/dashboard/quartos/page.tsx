'use client';

import { useEffect, useState } from 'react';
import { BedDouble, Plus, Filter, Search } from 'lucide-react';

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  AVAILABLE: { label: 'Disponível', color: '#25D366', bg: 'rgba(37, 211, 102, 0.1)' },
  OCCUPIED: { label: 'Ocupado', color: '#EA4335', bg: 'rgba(234, 67, 53, 0.1)' },
  CLEANING: { label: 'Limpeza', color: '#FFB74D', bg: 'rgba(255, 183, 77, 0.15)' },
  MAINTENANCE: { label: 'Manutenção', color: '#8696A0', bg: 'rgba(0,0,0,0.06)' },
  BLOCKED: { label: 'Bloqueado', color: '#8696A0', bg: 'rgba(0,0,0,0.06)' },
};

export default function QuartosPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/rooms')
      .then(res => res.json())
      .then(data => {
        if (data.rooms) setRooms(data.rooms);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = rooms.filter(r =>
    r.number?.toLowerCase().includes(search.toLowerCase()) ||
    r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.type?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: rooms.length,
    available: rooms.filter(r => r.status === 'AVAILABLE').length,
    occupied: rooms.filter(r => r.status === 'OCCUPIED').length,
    cleaning: rooms.filter(r => r.status === 'CLEANING').length,
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
          <h1 className="dash-page-title">Mapa de Quartos</h1>
          <p className="dash-page-subtitle">{stats.available} disponíveis de {stats.total} quartos</p>
        </div>
        <button className="dash-btn-primary">
          <Plus className="w-4 h-4" />
          Novo Quarto
        </button>
      </div>

      {/* Stats row */}
      <div className="dash-grid-4">
        {Object.entries(statusConfig).map(([key, cfg]) => {
          const count = rooms.filter(r => r.status === key).length;
          return (
            <div key={key} className="dash-kpi flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: cfg.bg }}>
                <BedDouble className="w-5 h-5" style={{ color: cfg.color }} />
              </div>
              <div>
                <p className="text-xl font-bold" style={{ color: '#111B21' }}>{count}</p>
                <p className="text-xs" style={{ color: '#667781' }}>{cfg.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search + filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#8696A0' }} />
          <input
            type="text"
            placeholder="Buscar quarto..."
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

      {/* Room grid */}
      <div className="dash-grid-4">
        {filtered.map((room) => {
          const status = statusConfig[room.status] || statusConfig.AVAILABLE;
          return (
            <div key={room.id} className="dash-card p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-lg font-bold" style={{ color: '#111B21' }}>
                    {room.number} {room.name ? `— ${room.name}` : ''}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#8696A0' }}>
                    {room.type} • {room.capacity} pessoas
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="dash-status" style={{ backgroundColor: status.bg, color: status.color }}>
                  {status.label}
                </span>
                <span className="text-sm font-semibold" style={{ color: '#25D366' }}>
                  R$ {room.basePrice}
                </span>
              </div>
              {room.amenities?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {room.amenities.slice(0, 3).map((a: string, i: number) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: '#F0F2F5', color: '#667781' }}>
                      {a}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="dash-section text-center py-12">
          <BedDouble className="w-12 h-12 mx-auto mb-3" style={{ color: '#8696A0' }} />
          <p className="text-sm font-medium" style={{ color: '#667781' }}>Nenhum quarto encontrado</p>
        </div>
      )}
    </div>
  );
}
