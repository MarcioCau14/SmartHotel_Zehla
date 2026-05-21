'use client';

import 'leaflet/dist/leaflet.css';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

type Classification = 'hot' | 'warm' | 'warm_baixo' | 'cold' | 'dead';

interface MapLead {
  id: string;
  pousada: string;
  email: string;
  whatsapp: string;
  qtdQuartos: number | null;
  localPraia: string | null;
  cidade: string;
  uf: string;
  valoresEstimados: string | null;
  qualificacao: string | null;
  validacao: string;
  comportamentoCompra: string | null;
  sinaisIntencao: string | null;
  redesSociais: string | null;
  site: string | null;
  telefone: string | null;
  scoreQual: number;
  scoreValid: number;
  latitude: number;
  longitude: number;
  regiao: string;
  status: string;
  ultimoContato: string | null;
  observacoes: string | null;
}

interface Stats {
  total: number;
  porUf: { uf: string; count: number }[];
  porStatus: { status: string; count: number }[];
  porRegiao: { regiao: string; count: number }[];
  avgScoreQual: number;
  avgScoreValid: number;
}

interface ClusterGroup {
  leads: MapLead[];
  center: [number, number];
  count: number;
}

function classify(scoreQual: number, scoreValid: number): Classification {
  const avg = (scoreQual + scoreValid) / 2;
  if (avg >= 80) return 'hot';
  if (avg >= 60) return 'warm';
  if (avg >= 40) return 'warm_baixo';
  if (avg >= 20) return 'cold';
  return 'dead';
}

const CLASS_CONFIG: Record<Classification, { label: string; color: string; bg: string; border: string; icon: string }> = {
  hot: { label: 'HOT', color: '#ef4444', bg: 'rgba(239,68,68,0.2)', border: 'rgba(239,68,68,0.4)', icon: '🔥' },
  warm: { label: 'WARM', color: '#f59e0b', bg: 'rgba(245,158,11,0.2)', border: 'rgba(245,158,11,0.4)', icon: '⚡' },
  warm_baixo: { label: 'WARM_BAIXO', color: '#eab308', bg: 'rgba(234,179,8,0.15)', border: 'rgba(234,179,8,0.35)', icon: '⭐' },
  cold: { label: 'COLD', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.35)', icon: '❄️' },
  dead: { label: 'DEAD', color: '#6b7280', bg: 'rgba(107,114,128,0.15)', border: 'rgba(107,114,128,0.35)', icon: '💀' },
};

const CLASS_ORDER: Classification[] = ['hot', 'warm', 'warm_baixo', 'cold', 'dead'];

function getScoreColor(score: number) {
  if (score >= 85) return 'text-green-400';
  if (score >= 70) return 'text-amber-400';
  if (score >= 50) return 'text-orange-400';
  return 'text-red-400';
}

function getStatusBadge(status: string) {
  const badges: Record<string, { label: string; className: string }> = {
    novo: { label: 'Novo', className: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
    contatado: { label: 'Contatado', className: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    respondido: { label: 'Respondido', className: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
    convertido: { label: 'Convertido', className: 'bg-green-500/20 text-green-300 border-green-500/30' },
    perdido: { label: 'Perdido', className: 'bg-red-500/20 text-red-300 border-red-500/30' },
  };
  return badges[status] || badges.novo;
}

const REGIONS = ['Sul', 'Sudeste', 'Nordeste', 'Norte', 'Centro-Oeste'] as const;

function classifyScore(score: number) {
  if (score >= 80) return 'hot' as Classification;
  if (score >= 60) return 'warm' as Classification;
  if (score >= 40) return 'warm_baixo' as Classification;
  if (score >= 20) return 'cold' as Classification;
  return 'dead' as Classification;
}

function gridCluster(leads: MapLead[], zoom: number): ClusterGroup[] {
  const size = Math.max(0.1, 5 / Math.pow(2, zoom - 3));
  const buckets = new Map<string, MapLead[]>();
  for (const lead of leads) {
    if (!lead.latitude || !lead.longitude) continue;
    const gx = Math.round(lead.latitude / size);
    const gy = Math.round(lead.longitude / size);
    const key = `${gx}:${gy}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(lead);
  }
  const groups: ClusterGroup[] = [];
  for (const [, bucket] of buckets) {
    if (bucket.length === 0) continue;
    const lat = bucket.reduce((s, l) => s + l.latitude, 0) / bucket.length;
    const lng = bucket.reduce((s, l) => s + l.longitude, 0) / bucket.length;
    groups.push({ leads: bucket, center: [lat, lng], count: bucket.length });
  }
  return groups;
}

function ClusterMarker({ group, onSelect }: { group: ClusterGroup; onSelect: (lead: MapLead) => void }) {
  const classCounts: Record<string, number> = {};
  for (const l of group.leads) {
    const c = classifyScore(l.scoreQual);
    classCounts[c] = (classCounts[c] || 0) + 1;
  }
  const dominant = Object.entries(classCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'cold';
  const cfg = CLASS_CONFIG[dominant as Classification] || CLASS_CONFIG.cold;

  const icon = L.divIcon({
    html: `<div style="display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:50%;background:${cfg.color};color:white;font-size:13px;font-weight:700;border:3px solid rgba(255,255,255,0.4);box-shadow:0 2px 8px rgba(0,0,0,0.4)">${group.count}</div>`,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });

  const topLeads = group.leads.slice(0, 5);
  const remaining = group.count - 5;

  return (
    <Marker position={group.center} icon={icon}>
      <Popup>
        <div className="min-w-[220px] font-sans bg-[#0d1117]">
          <div className="text-[11px] font-bold text-white mb-1.5 flex items-center gap-1.5">
            <span style={{ color: cfg.color }}>●</span>
            {group.count} leads nesta área
          </div>
          <div className="space-y-1 mb-1.5">
            {CLASS_ORDER.filter(c => classCounts[c]).map(c => {
              const cc = CLASS_CONFIG[c];
              return (
                <div key={c} className="flex items-center gap-1.5 text-[10px]">
                  <span>{cc.icon}</span>
                  <span style={{ color: cc.color }} className="font-medium">{cc.label}</span>
                  <span className="text-slate-500 ml-auto">{classCounts[c]}</span>
                </div>
              );
            })}
          </div>
          <div className="border-t border-slate-700/50 pt-1.5 space-y-1">
            {topLeads.map(l => (
              <button key={l.id} onClick={() => onSelect(l)}
                className="w-full text-left text-[10px] text-slate-300 hover:text-white bg-slate-800/30 hover:bg-slate-800/50 rounded px-1.5 py-1 transition-colors truncate">
                {l.pousada} - {l.cidade}/{l.uf} <span className="text-slate-500">({l.scoreQual})</span>
              </button>
            ))}
            {remaining > 0 && (
              <div className="text-[10px] text-slate-500 text-center pt-0.5">+{remaining} mais</div>
            )}
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

function MapController({ selectedLead }: { selectedLead: MapLead | null }) {
  const map = useMap();
  useEffect(() => {
    if (selectedLead && selectedLead.latitude && selectedLead.longitude) {
      map.flyTo([selectedLead.latitude, selectedLead.longitude], 12, { duration: 1.5 });
    }
  }, [selectedLead, map]);
  return null;
}

function ZoomReader({ onZoom }: { onZoom: (z: number) => void }) {
  const map = useMap();
  useEffect(() => {
    onZoom(map.getZoom());
    const handler = () => onZoom(map.getZoom());
    map.on('zoomend', handler);
    return () => { map.off('zoomend', handler); };
  }, [map, onZoom]);
  return null;
}

export default function LeadMapView() {
  const [leads, setLeads] = useState<MapLead[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<MapLead | null>(null);
  const [detailLead, setDetailLead] = useState<MapLead | null>(null);
  const [viewTab, setViewTab] = useState<'map' | 'list' | 'analytics'>('map');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [zoom, setZoom] = useState(4.5);
  const [filters, setFilters] = useState({ regiao: 'todas', status: 'todos', classificacao: 'todas' as Classification | 'todas', search: '' });

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.regiao !== 'todas') params.set('regiao', filters.regiao);
      if (filters.status !== 'todos') params.set('status', filters.status);
      if (filters.search) params.set('search', filters.search);
      const res = await fetch(`/api/marketing/leads/map?${params}`);
      const data = await res.json();
      setLeads(data.leads || []);
      setStats(data.stats || null);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const filteredLeads = useMemo(() => {
    if (filters.classificacao === 'todas') return leads;
    return leads.filter(l => classifyScore(l.scoreQual) === filters.classificacao);
  }, [leads, filters.classificacao]);

  const activeClassCounts = useMemo(() => {
    const counts: Record<string, number> = { total: filteredLeads.length };
    for (const c of CLASS_ORDER) counts[c] = 0;
    for (const l of filteredLeads) {
      const c = classifyScore(l.scoreQual);
      counts[c] = (counts[c] || 0) + 1;
    }
    return counts;
  }, [filteredLeads]);

  const clusterGroups = useMemo(() => gridCluster(filteredLeads, zoom), [filteredLeads, zoom]);

  const handleSelectLead = useCallback((lead: MapLead) => {
    setSelectedLead(lead);
    setDetailLead(lead);
  }, []);

  return (
    <div className="flex min-h-[600px] bg-[#0a0e1a] rounded-2xl overflow-hidden border border-[#1e293b]/50">
      <div className={`${sidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 overflow-hidden flex-shrink-0 border-r border-[#1e293b]/50`}>
        <div className="w-72 h-full flex flex-col bg-[#0d1117]">
          <div className="p-3 border-b border-[#1e293b]/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-[10px] font-bold">Z</div>
              <div>
                <h1 className="text-xs font-bold text-white">ZEHLA LIS</h1>
                <p className="text-[9px] text-slate-500">Lead Intelligence System</p>
              </div>
            </div>
            <div className="flex gap-1 bg-slate-900/50 rounded-lg p-0.5">
              {(['map', 'list', 'analytics'] as const).map(tab => (
                <button key={tab} onClick={() => setViewTab(tab)}
                  className={`flex-1 text-[10px] py-1.5 rounded-md font-medium transition-colors ${viewTab === tab ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                  {tab === 'map' ? 'Mapa' : tab === 'list' ? 'Lista' : 'Stats'}
                </button>
              ))}
            </div>
          </div>

          {/* Classification filter chips */}
          <div className="px-3 pt-2 border-b border-[#1e293b]/50">
            <div className="flex flex-wrap gap-1 mb-2">
              <button onClick={() => setFilters(f => ({ ...f, classificacao: 'todas' }))}
                className={`text-[9px] px-2 py-1 rounded-full border transition-all ${filters.classificacao === 'todas' ? 'bg-slate-600/40 border-slate-500/50 text-white' : 'border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-500/50'}`}>
                Todas <span className="text-slate-500 ml-0.5">({leads.length})</span>
              </button>
              {CLASS_ORDER.map(c => {
                const cfg = CLASS_CONFIG[c];
                const count = activeClassCounts[c] || 0;
                return (
                  <button key={c} onClick={() => setFilters(f => ({ ...f, classificacao: f.classificacao === c ? 'todas' : c }))}
                    className={`text-[9px] px-2 py-1 rounded-full border transition-all ${filters.classificacao === c ? 'text-white border-transparent' : 'border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-500/50'}`}
                    style={filters.classificacao === c ? { background: cfg.color, borderColor: cfg.color } : {}}>
                    {cfg.icon} {cfg.label} <span className="opacity-70">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-3 border-b border-[#1e293b]/50 space-y-1.5">
            <input type="text" placeholder="Buscar pousada, cidade..."
              value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50" />
            <select value={filters.regiao} onChange={e => setFilters(f => ({ ...f, regiao: e.target.value }))}
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50">
              <option value="todas">Todas as Regiões</option>
              {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50">
              <option value="todos">Todos os Status</option>
              <option value="novo">Novo</option>
              <option value="contatado">Contatado</option>
              <option value="respondido">Respondido</option>
              <option value="convertido">Convertido</option>
              <option value="perdido">Perdido</option>
            </select>
          </div>

          <div className="flex-1 overflow-y-auto zehla-scroll">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : viewTab === 'map' ? (
              <div className="p-3 space-y-1.5">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 px-1">
                  Leads no Mapa ({filteredLeads.length})
                </div>
                {filteredLeads.map(lead => {
                  const cl = classifyScore(lead.scoreQual);
                  const cc = CLASS_CONFIG[cl];
                  return (
                    <button key={lead.id} onClick={() => handleSelectLead(lead)}
                      className={`w-full text-left p-2 rounded-lg border transition-all text-[11px] ${selectedLead?.id === lead.id ? 'bg-amber-600/10 border-amber-500/30' : 'bg-slate-900/30 border-slate-800/50 hover:border-amber-500/30'}`}>
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-medium text-slate-200 truncate">{lead.pousada}</span>
                        <span style={{ color: cc.color, borderColor: cc.border }} className={`text-[9px] px-1.5 py-0.5 rounded-full border whitespace-nowrap`}>
                          {cc.icon} {cc.label}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{lead.cidade}/{lead.uf}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-medium ${getScoreColor(lead.scoreQual)}`}>
                          {lead.scoreQual >= 85 ? '🔥' : '★'} {lead.scoreQual}
                        </span>
                        {lead.sinaisIntencao && <span className="text-[10px] text-amber-500 truncate">⚡ {lead.sinaisIntencao}</span>}
                      </div>
                    </button>
                  );
                })}
                {filteredLeads.length === 0 && (
                  <div className="text-center py-8 text-xs text-slate-500">Nenhum lead encontrado</div>
                )}
              </div>
            ) : viewTab === 'list' ? (
              <div className="p-3 space-y-1">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 px-1">
                  Todos ({filteredLeads.length})
                </div>
                {filteredLeads.map(lead => {
                  const cl = classifyScore(lead.scoreQual);
                  const cc = CLASS_CONFIG[cl];
                  return (
                    <div key={lead.id} className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/30 border border-slate-800/50 text-[11px]">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cc.color }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-slate-200 font-medium truncate">{lead.pousada}</div>
                        <div className="text-slate-500">{lead.cidade}/{lead.uf}</div>
                      </div>
                      <span className="text-slate-400">{lead.scoreQual}</span>
                    </div>
                  );
                })}
              </div>
            ) : stats && (
              <div className="p-3 space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800/50">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Total</div>
                    <div className="text-lg font-bold text-white">{stats.total}</div>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800/50">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Score Médio</div>
                    <div className={`text-lg font-bold ${getScoreColor(stats.avgScoreQual)}`}>{stats.avgScoreQual}</div>
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Por Região</h4>
                  <div className="space-y-1">
                    {stats.porRegiao.map(r => (
                      <div key={r.regiao} className="flex items-center justify-between text-xs">
                        <span className="text-slate-300">{r.regiao}</span>
                        <span className="text-slate-400">{r.count}</span>
                      </div>
                    ))}
                    {stats.porRegiao.length === 0 && <span className="text-[10px] text-slate-600">Nenhum dado</span>}
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Por Status</h4>
                  <div className="space-y-1">
                    {stats.porStatus.map(s => (
                      <div key={s.status} className="flex items-center justify-between text-xs">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${getStatusBadge(s.status).className}`}>{getStatusBadge(s.status).label}</span>
                        <span className="text-slate-300 font-medium">{s.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Top UFs</h4>
                  <div className="space-y-1.5">
                    {stats.porUf.slice(0, 8).map(u => (
                      <div key={u.uf} className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 w-6 font-mono">{u.uf}</span>
                        <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-amber-600 to-orange-500 rounded-full" style={{ width: `${stats.total ? (u.count / stats.total) * 100 : 0}%` }} />
                        </div>
                        <span className="text-xs text-slate-400 w-5 text-right">{u.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {stats && (
            <div className="p-2.5 border-t border-[#1e293b]/50 bg-slate-900/30">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-500">Exibindo: <span className="text-slate-300">{filteredLeads.length}</span> de {stats.total}</span>
                <span className="text-slate-500">Score: <span className={`font-medium ${getScoreColor(stats.avgScoreQual)}`}>{stats.avgScoreQual}</span></span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-[500px] relative">
        {/* KPI Strip */}
        {stats && (
          <div className="absolute top-0 left-0 right-0 z-[1000] p-2 pb-0 pointer-events-none">
            <div className="flex items-center gap-1.5 flex-wrap pointer-events-auto">
              <button onClick={() => setSidebarOpen(!sidebarOpen)}
                className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-lg p-2 hover:bg-slate-800/80 transition-colors">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>
              </button>
              <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-lg px-2.5 py-1.5">
                <span className="text-[10px] text-slate-300"><span className="text-amber-400 font-bold">{filteredLeads.length}</span> leads</span>
              </div>
              {CLASS_ORDER.map(c => {
                const cc = CLASS_CONFIG[c];
                const count = activeClassCounts[c] || 0;
                return (
                  <button key={c} onClick={() => setFilters(f => ({ ...f, classificacao: f.classificacao === c ? 'todas' : c }))}
                    className={`flex items-center gap-1 bg-slate-900/80 backdrop-blur-md border rounded-lg px-2 py-1 transition-all ${filters.classificacao === c ? 'border-opacity-100' : 'border-slate-700/50 hover:border-slate-500/50'}`}
                    style={{ borderColor: filters.classificacao === c ? cc.color : undefined }}>
                    <span className="text-[10px]">{cc.icon}</span>
                    <span className="text-[10px] font-medium text-slate-200">{count}</span>
                    <span className="text-[8px] text-slate-500 hidden sm:inline">{cc.label}</span>
                  </button>
                );
              })}
              <div className="flex items-center gap-1 bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-lg px-2 py-1">
                <span className="text-[10px] text-slate-400">{filteredLeads.filter(l => l.latitude && l.longitude).length}📍</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-1 pointer-events-auto">
              <div className="flex items-center gap-1 bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-lg px-2 py-1">
                <span className="text-[10px] text-slate-500">Score médio:</span>
                <span className={`text-[10px] font-bold ${getScoreColor(stats.avgScoreQual)}`}>{stats.avgScoreQual}</span>
              </div>
              <div className="hidden md:flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-lg px-2 py-1">
                {['Sul', 'Sudeste', 'Nordeste', 'Norte', 'CO'].map(r => (
                  <button key={r} onClick={() => setFilters(f => ({ ...f, regiao: f.regiao === r ? 'todas' : r }))}
                    className={`text-[10px] px-1.5 py-0.5 rounded-md transition-all ${filters.regiao === r ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'}`}>{r}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {viewTab === 'map' ? (
          <MapContainer center={[-14.235, -51.9253]} zoom={4.5} className="h-full w-full" zoomControl={false} style={{ background: '#0a0e1a' }}>
            <TileLayer attribution='&copy; <a href="https://carto.com/">CARTO</a>' url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            <ZoomReader onZoom={setZoom} />
            <MapController selectedLead={selectedLead} />
            {clusterGroups.map((group, i) => {
              if (group.count === 1) {
                const lead = group.leads[0];
                return (
                  <Marker key={lead.id} position={[lead.latitude, lead.longitude]}
                    icon={L.divIcon({
                      html: `<div style="display:flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:50%;background:${CLASS_CONFIG[classifyScore(lead.scoreQual)].color};color:white;font-size:10px;font-weight:700;border:2px solid rgba(255,255,255,0.3)">${CLASS_CONFIG[classifyScore(lead.scoreQual)].icon}</div>`,
                      className: '', iconSize: [24, 24], iconAnchor: [12, 12],
                    })}
                    eventHandlers={{ click: () => handleSelectLead(lead) }}>
                    <Popup><LeadPopupContent lead={lead} onSelect={handleSelectLead} /></Popup>
                  </Marker>
                );
              }
              return <ClusterMarker key={`cluster-${i}`} group={group} onSelect={handleSelectLead} />;
            })}
          </MapContainer>
        ) : viewTab === 'list' ? (
          <div className="h-full overflow-y-auto p-4">
            <div className="max-w-5xl mx-auto">
              <h3 className="text-sm font-bold text-white mb-3">Lista Completa de Leads</h3>
              <div className="bg-[#0d1117] rounded-xl border border-slate-800/50 overflow-hidden">
                <table className="w-full text-xs">
                  <thead><tr className="border-b border-slate-800/50">
                    <th className="text-left p-3 text-slate-500 font-medium">Pousada</th>
                    <th className="text-left p-3 text-slate-500 font-medium">Cidade</th>
                    <th className="text-left p-3 text-slate-500 font-medium">UF</th>
                    <th className="text-left p-3 text-slate-500 font-medium">Score</th>
                    <th className="text-left p-3 text-slate-500 font-medium">Class.</th>
                    <th className="text-left p-3 text-slate-500 font-medium">Ações</th>
                  </tr></thead>
                  <tbody>{filteredLeads.map(lead => {
                    const cl = classifyScore(lead.scoreQual);
                    const cc = CLASS_CONFIG[cl];
                    return (
                      <tr key={lead.id} className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors">
                        <td className="p-3 text-slate-200 font-medium">{lead.pousada}</td>
                        <td className="p-3 text-slate-400">{lead.cidade}</td>
                        <td className="p-3 text-slate-400">{lead.uf}</td>
                        <td className="p-3"><span className={`font-bold ${getScoreColor(lead.scoreQual)}`}>{lead.scoreQual}</span></td>
                        <td className="p-3"><span style={{ color: cc.color }} className="text-[10px] font-medium">{cc.icon} {cc.label}</span></td>
                        <td className="p-3"><div className="flex gap-1">
                          {lead.whatsapp && <a href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded bg-green-600/20 text-green-400 hover:bg-green-600/30"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg></a>}
                          {lead.email && <a href={`mailto:${lead.email}`} className="p-1.5 rounded bg-blue-600/20 text-blue-400 hover:bg-blue-600/30"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg></a>}
                        </div></td>
                      </tr>
                    );
                  })}</tbody>
                </table>
              </div>
            </div>
          </div>
        ) : stats && (
          <div className="h-full overflow-y-auto p-4">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-sm font-bold text-white mb-4">Analytics de Leads</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#0d1117] rounded-xl border border-slate-800/50 p-4">
                  <h4 className="text-[10px] text-slate-500 uppercase tracking-wider mb-3">Distribuição por Região</h4>
                  <div className="space-y-2">{stats.porRegiao.map(r => (
                    <div key={r.regiao}><div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">{r.regiao}</span>
                      <span className="text-slate-500">{r.count} ({stats.total ? Math.round((r.count / stats.total) * 100) : 0}%)</span>
                    </div><div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-600 to-orange-500 rounded-full" style={{ width: `${stats.total ? (r.count / stats.total) * 100 : 0}%` }} />
                    </div></div>
                  ))}</div>
                </div>
                <div className="bg-[#0d1117] rounded-xl border border-slate-800/50 p-4">
                  <h4 className="text-[10px] text-slate-500 uppercase tracking-wider mb-3">Funil de Conversão</h4>
                  <div className="space-y-2">{stats.porStatus.map((s, i) => {
                    const colors = ['bg-slate-500', 'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-red-500'];
                    return (<div key={s.status}><div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">{getStatusBadge(s.status).label}</span>
                      <span className="text-slate-500">{s.count}</span>
                    </div><div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${colors[i]} rounded-full`} style={{ width: `${Math.max(stats.total ? (s.count / stats.total) * 100 : 0, 2)}%` }} />
                    </div></div>);
                  })}</div>
                </div>
                <div className="bg-[#0d1117] rounded-xl border border-slate-800/50 p-4 md:col-span-2">
                  <h4 className="text-[10px] text-slate-500 uppercase tracking-wider mb-3">Top 10 UFs por Volume</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{stats.porUf.slice(0, 10).map((u, i) => (
                    <div key={u.uf} className="flex items-center gap-3 p-2 rounded-lg bg-slate-900/30">
                      <span className="text-xs font-bold text-amber-400 w-4">#{i + 1}</span>
                      <span className="text-xs font-mono text-slate-300 w-6">{u.uf}</span>
                      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full" style={{ width: `${stats.total ? (u.count / stats.total) * 100 : 0}%` }} />
                      </div>
                      <span className="text-xs text-slate-400 w-5 text-right">{u.count}</span>
                    </div>
                  ))}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {detailLead && (
          <div className="absolute bottom-3 left-3 right-3 md:left-auto md:right-3 md:w-[360px] z-[1000]">
            <div className="bg-[#0d1117]/95 backdrop-blur-md border border-slate-700/50 rounded-xl p-3 shadow-2xl">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-xs font-bold text-white">{detailLead.pousada}</h4>
                  <p className="text-[10px] text-slate-400">{detailLead.cidade}/{detailLead.uf} {detailLead.localPraia ? `- ${detailLead.localPraia}` : ''}</p>
                </div>
                <button onClick={() => setDetailLead(null)} className="text-slate-500 hover:text-white transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
              <div className="flex items-center gap-1.5 mb-2">
                {(() => { const cl = classifyScore(detailLead.scoreQual); const cc = CLASS_CONFIG[cl]; return (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: cc.bg, color: cc.color, borderColor: cc.border, borderWidth: 1 }}>{cc.icon} {cc.label}</span>
                ); })()}
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getStatusBadge(detailLead.status).className}`}>{getStatusBadge(detailLead.status).label}</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 mb-2">
                <div className="bg-slate-900/50 rounded-lg p-1.5 text-center">
                  <div className="text-[9px] text-slate-500 uppercase">Score Qual.</div>
                  <div className={`text-sm font-bold ${getScoreColor(detailLead.scoreQual)}`}>{detailLead.scoreQual}</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-1.5 text-center">
                  <div className="text-[9px] text-slate-500 uppercase">Score Valid.</div>
                  <div className={`text-sm font-bold ${getScoreColor(detailLead.scoreValid)}`}>{detailLead.scoreValid}</div>
                </div>
              </div>

              {detailLead.qualificacao && (
                <p className="text-[10px] text-slate-400 mb-1.5 leading-relaxed">{detailLead.qualificacao}</p>
              )}
              {detailLead.sinaisIntencao && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-1.5 mb-2">
                  <div className="text-[9px] text-amber-400 font-medium mb-0.5">Sinais de Intenção</div>
                  <p className="text-[10px] text-amber-200/80">{detailLead.sinaisIntencao}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-1.5 mb-2 text-[10px]">
                {detailLead.email && <div className="text-slate-400 truncate"><span className="text-slate-500">Email: </span><span className="text-slate-300">{detailLead.email}</span></div>}
                {detailLead.telefone && <div className="text-slate-400"><span className="text-slate-500">Tel: </span><span className="text-slate-300">{detailLead.telefone}</span></div>}
                {detailLead.qtdQuartos && <div className="text-slate-400"><span className="text-slate-500">Quartos: </span><span className="text-slate-300">{detailLead.qtdQuartos}</span></div>}
                {detailLead.valoresEstimados && <div className="text-slate-400"><span className="text-slate-500">Valores: </span><span className="text-slate-300">{detailLead.valoresEstimados}</span></div>}
                {detailLead.comportamentoCompra && <div className="text-slate-400"><span className="text-slate-500">Perfil: </span><span className="text-slate-300">{detailLead.comportamentoCompra}</span></div>}
                {detailLead.validacao && <div className="text-slate-400"><span className="text-slate-500">Validação: </span><span className={detailLead.validacao === 'validado' ? 'text-green-400' : 'text-orange-400'}>{detailLead.validacao}</span></div>}
              </div>

              <div className="flex gap-1.5">
                {detailLead.whatsapp && (
                  <a href={`https://wa.me/${detailLead.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1 bg-green-600 hover:bg-green-500 text-white text-[10px] font-medium rounded-lg px-2.5 py-2 transition-colors">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>WhatsApp
                  </a>
                )}
                {detailLead.email && (
                  <a href={`mailto:${detailLead.email}`} className="flex-1 flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-medium rounded-lg px-2.5 py-2 transition-colors">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>Email
                  </a>
                )}
                {detailLead.redesSociais && (
                  <a href={`https://instagram.com/${detailLead.redesSociais.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-[10px] font-medium rounded-lg px-2.5 py-2 transition-colors">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>IG
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LeadPopupContent({ lead, onSelect }: { lead: MapLead; onSelect: (lead: MapLead) => void }) {
  const cl = classifyScore(lead.scoreQual);
  const cc = CLASS_CONFIG[cl];
  return (
    <div className="min-w-[240px] max-w-[280px] font-sans bg-[#0d1117]">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-xs font-bold text-slate-100 leading-tight">{lead.pousada}</h3>
        <span className={`text-[9px] px-1.5 py-0.5 rounded-full border whitespace-nowrap`} style={{ color: cc.color, borderColor: cc.border, background: cc.bg }}>
          {cc.icon} {cc.label}
        </span>
      </div>
      <div className="text-[10px] text-slate-400 mb-2">{lead.cidade}/{lead.uf}{lead.localPraia ? ` - ${lead.localPraia}` : ''}</div>
      <div className="grid grid-cols-2 gap-1.5 mb-2">
        <div className="bg-slate-800/50 rounded p-1.5 text-center">
          <div className="text-[9px] text-slate-500 uppercase">Score</div>
          <div className={`text-sm font-bold ${getScoreColor(lead.scoreQual)}`}>{lead.scoreQual}</div>
        </div>
        <div className="bg-slate-800/50 rounded p-1.5 text-center">
          <div className="text-[9px] text-slate-500 uppercase">Valid.</div>
          <div className={`text-sm font-bold ${getScoreColor(lead.scoreValid)}`}>{lead.scoreValid}</div>
        </div>
      </div>
      {lead.sinaisIntencao && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded p-1.5 mb-2">
          <div className="text-[9px] text-amber-400 font-medium mb-0.5">Sinais</div>
          <p className="text-[10px] text-amber-200/80">{lead.sinaisIntencao}</p>
        </div>
      )}
      <div className="flex gap-1.5">
        <button onClick={() => onSelect(lead)} className="flex-1 bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-medium rounded px-2 py-1.5 transition-colors">Detalhes</button>
        <a href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1 bg-green-600 hover:bg-green-500 text-white text-[10px] font-medium rounded px-2 py-1.5">WhatsApp</a>
      </div>
    </div>
  );
}
