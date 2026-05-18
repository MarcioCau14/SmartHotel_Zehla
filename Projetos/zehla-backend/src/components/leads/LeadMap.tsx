'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import {
  Zap,
  Search,
  Filter,
  Map as MapIcon,
  BarChart3,
  List,
  X,
  MessageCircle,
  Mail,
  Instagram,
  Activity,
  Target } from
'lucide-react';

// --- ICONS & STYLES ---
const createCustomIcon = (color: string, iconChar: string, isHot: boolean) => {
  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center">
        ${isHot ? `<div class="absolute inset-0 bg-${color}-500/40 rounded-full animate-ping scale-150"></div>` : ''}
        <svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.268 21.732 0 14 0z" fill="${color}" stroke="#0f172a" stroke-width="1.5"/>
          <circle cx="14" cy="13" r="6" fill="white" opacity="0.9"/>
          <text x="14" y="16" text-anchor="middle" font-size="10" font-weight="bold" fill="#0f172a">${iconChar}</text>
        </svg>
      </div>
    `,
    className: 'custom-lead-marker',
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -36]
  });
};

const icons = {
  default: createCustomIcon('#f59e0b', '★', false),
  hot: createCustomIcon('#ef4444', '🔥', true),
  converted: createCustomIcon('#10b981', '✓', false)
};

function MapController({ center }: {center: [number, number] | null;}) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 13, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

// --- MAIN COMPONENT ---
export default function LeadMap() {
  const [leads, setLeads] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [view, setView] = useState<'map' | 'analytics'>('map');
  const [filters, setFilters] = useState({
    region: 'all',
    search: '',
    minScore: 0
  });

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.region !== 'all') params.set('region', filters.region);
      if (filters.search) params.set('search', filters.search);
      if (filters.minScore > 0) params.set('minScore', filters.minScore.toString());

      const res = await fetch(`/api/leads?${params.toString()}`);
      const data = await res.json();
      setLeads(data.leads || []);
      setStats(data.stats || null);
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  return (
    <div className="flex h-full w-full bg-[#0a0e1a] rounded-3xl overflow-hidden border border-white/5 relative">
      {/* Sidebar de Controle (HUD) */}
      <div className="w-80 h-full flex flex-col bg-black/60 backdrop-blur-xl border-r border-white/5 z-[1001]">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF5500] to-[#FF8800] flex items-center justify-center">
              <Target className="text-white w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-widest uppercase">Mapeamento Leads</h2>
              <p className="text-[10px] text-zinc-500 font-mono">ZEHLA LIS MODULE v4.0</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Buscar por cidade ou nome..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-[#FF5500]/50"
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))} />
              
            </div>

            <div className="flex gap-2">
              <select
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] text-zinc-400 focus:outline-none"
                value={filters.region}
                onChange={(e) => setFilters((f) => ({ ...f, region: e.target.value }))}>
                
                <option value="all">Todas Regiões</option>
                <option value="Sul">Sul</option>
                <option value="Sudeste">Sudeste</option>
                <option value="Nordeste">Nordeste</option>
              </select>
              <button className="bg-white/5 border border-white/10 rounded-xl p-2 text-zinc-400">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-6">
          {stats &&
          <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <p className="text-[10px] text-zinc-500 uppercase mb-1">Total</p>
                <p className="text-xl font-light text-white">{stats.total}</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <p className="text-[10px] text-zinc-500 uppercase mb-1">Score Méd.</p>
                <p className="text-xl font-light text-[#FF5500]">{stats.avgScore}%</p>
              </div>
            </div>
          }

          <div className="space-y-3">
            <h3 className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Distribuição Regional</h3>
            {stats?.byRegion?.map((r: any) =>
            <div key={r.name} className="space-y-1">
                <div className="flex justify-between text-[10px] text-zinc-400">
                  <span>{r.name}</span>
                  <span>{r.count}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                  className="h-full bg-gradient-to-r from-[#FF5500] to-[#FF8800]"
                  style={{ width: `${r.count / stats.total * 100}%` }} />
                
                </div>
              </div>
            )}
          </div>

          <div className="pt-4">
            <button
              onClick={() => setView(view === 'map' ? 'analytics' : 'map')}
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 text-[10px] font-bold uppercase tracking-widest transition-all">
              
              {view === 'map' ? 'Ver Analytics Detalhado' : 'Voltar ao Mapa'}
            </button>
          </div>
        </div>

        <div className="p-6 border-t border-white/5 bg-black/40">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-tighter">Telemetria Realtime Ativa</span>
          </div>
        </div>
      </div>

      {/* Area do Mapa */}
      <div className="flex-1 relative z-0">
        <MapContainer
          center={[-14.235, -51.9253]}
          zoom={5}
          className="h-full w-full"
          zoomControl={false}
          style={{ background: '#0a0e1a' }}>
          
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          
          <MapController center={selectedLead ? [selectedLead.latitude, selectedLead.longitude] : null} />
          
          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={50}
            polygonOptions={{ fillColor: '#FF5500', color: '#FF5500', weight: 1, opacity: 0.1, fillOpacity: 0.05 }}>
            
            {leads.map((lead) =>
            <Marker
              key={lead.id}
              position={[lead.latitude, lead.longitude]}
              icon={lead.status === 'CONVERTED' ? icons.converted : lead.score >= 90 ? icons.hot : icons.default}
              eventHandlers={{
                click: () => setSelectedLead(lead)
              }}>
              
                <Popup className="zehla-custom-popup">
                  <div className="p-3 min-w-[240px] bg-[#0d1117] text-white">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-sm font-bold leading-tight pr-4">{lead.name}</h4>
                      <div className="px-1.5 py-0.5 rounded-full bg-[#FF5500]/20 border border-[#FF5500]/30 text-[#FF5500] text-[9px] font-bold">
                        {lead.score}%
                      </div>
                    </div>
                    <p className="text-[10px] text-zinc-500 mb-3">{lead.city} / {lead.state}</p>
                    
                    {lead.intentSignals &&
                  <div className="bg-white/5 rounded-lg p-2 mb-3 border border-white/5">
                        <p className="text-[9px] text-zinc-500 uppercase mb-1">Sinais de Intenção</p>
                        <p className="text-[10px] text-zinc-300 italic">"{lead.intentSignals}"</p>
                      </div>
                  }

                    <div className="flex gap-2">
                      <a href={`https://wa.me/${lead.whatsapp}`} target="_blank" className="flex-1 flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#128C7E] text-white py-1.5 rounded-lg transition-colors">
                        <MessageCircle className="w-3 h-3" />
                        <span className="text-[10px] font-bold uppercase">WhatsApp</span>
                      </a>
                      <button className="bg-white/5 border border-white/10 p-1.5 rounded-lg text-zinc-400 hover:text-white transition-colors">
                        <Instagram className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}
          </MarkerClusterGroup>
        </MapContainer>

        {/* HUD de Lead Selecionado */}
        {selectedLead &&
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-lg z-[1002] px-6">
            <div className="bg-black/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#FF5500]" />
              <button
              onClick={() => setSelectedLead(null)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white">
              
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-start gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-light text-white">{selectedLead.name}</h3>
                    {selectedLead.score >= 90 && <Zap className="w-4 h-4 text-[#FF5500] fill-[#FF5500]" />}
                  </div>
                  <p className="text-xs text-zinc-500 mb-4">{selectedLead.city}, {selectedLead.state} — {selectedLead.location}</p>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-center">
                      <p className="text-[9px] text-zinc-500 uppercase mb-1">Qualificação</p>
                      <p className="text-sm text-zinc-300 truncate">{selectedLead.qualification || 'N/A'}</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-center">
                      <p className="text-[9px] text-zinc-500 uppercase mb-1">Score Valid.</p>
                      <p className="text-sm text-[#FF5500] font-mono">{selectedLead.validationScore}%</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-center">
                      <p className="text-[9px] text-zinc-500 uppercase mb-1">Status</p>
                      <p className="text-[10px] text-zinc-300 font-bold uppercase">{selectedLead.status}</p>
                    </div>
                  </div>
                </div>

                <div className="w-px h-24 bg-white/5" />

                <div className="flex flex-col gap-2 justify-center">
                  <button className="flex items-center gap-2 bg-[#FF5500] hover:bg-[#FF7700] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all">
                    <Activity className="w-4 h-4" />
                    ACABAR COM A COMISSÃO
                  </button>
                  <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all">
                    <Mail className="w-4 h-4" />
                    ENVIAR PROPOSTA
                  </button>
                </div>
              </div>
            </div>
          </div>
        }

        {/* Mini Radar Overlay (Zehla Style) */}
        <div className="absolute top-6 right-6 flex flex-col gap-2 z-[1000]">
          <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-500 uppercase">Filtro Ativo</span>
              <span className="text-xs text-white font-mono">{filters.region === 'all' ? 'NACIONAL' : filters.region.toUpperCase()}</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-500 uppercase">Hot Leads</span>
              <span className="text-xs text-[#FF5500] font-mono">{useMemo(() => leads.filter((l) => l.score >= 90), []).length}</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .zehla-custom-popup .leaflet-popup-content-wrapper {
          background: #0d1117;
          color: white;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.1);
          padding: 0;
          overflow: hidden;
        }
        .zehla-custom-popup .leaflet-popup-content {
          margin: 0;
          width: auto !important;
        }
        .zehla-custom-popup .leaflet-popup-tip {
          background: #0d1117;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .marker-cluster-small, .marker-cluster-medium, .marker-cluster-large {
          background-color: rgba(255, 85, 0, 0.2) !important;
          border: 1px solid rgba(255, 85, 0, 0.5);
        }
        .marker-cluster-small div, .marker-cluster-medium div, .marker-cluster-large div {
          background-color: rgba(255, 85, 0, 0.8) !important;
          color: white !important;
          font-weight: bold;
          font-family: 'Inter', sans-serif;
        }
      `}</style>
    </div>);

}