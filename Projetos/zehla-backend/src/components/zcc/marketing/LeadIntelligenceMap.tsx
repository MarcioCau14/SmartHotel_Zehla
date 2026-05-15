'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { 
  Zap, 
  Search, 
  Filter, 
  Map as MapIcon, 
  X, 
  MessageCircle, 
  Instagram,
  Activity,
  Target,
  Mail,
  ChevronRight,
  Plus,
  Minus
} from 'lucide-react';

// Carregamento dinâmico para evitar erros de SSR com Leaflet
const LeadMapInner = dynamic(() => import('./LeadMapInner'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-[700px] bg-black rounded-3xl flex items-center justify-center border border-white/5">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-[#FF5500] border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Inicializando Radar Neural...</p>
      </div>
    </div>
  )
});

export function LeadIntelligenceMap() {
  const [leads, setLeads] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [filters, setFilters] = useState({
    region: 'all',
    search: '',
    minScore: 0
  });
  const [isProspecting, setIsProspecting] = useState(false);
  const [prospectQuery, setProspectQuery] = useState('');

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

  const triggerProspecting = async () => {
    if (!prospectQuery) return;
    setIsProspecting(true);
    try {
      const res = await fetch('/api/zcc/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'ENRICH_PROSPECTING', 
          query: prospectQuery,
          region: filters.region === 'all' ? 'Sul' : filters.region 
        })
      });
      
      if (res.ok) {
        await fetchLeads();
        setProspectQuery('');
      }
    } catch (err) {
      console.error('Prospecting failed:', err);
    } finally {
      setIsProspecting(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  return (
    <div className="relative w-full h-full bg-[#0a0a0a] overflow-hidden select-none">
      {/* HUD Flutuante (Analytics & Filters) */}
      <div className="absolute top-0 left-0 w-80 h-full flex flex-col bg-black/40 backdrop-blur-3xl border-r border-white/10 z-20 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-left-4 duration-1000">
        <div className="p-6 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-2 h-2 rounded-full bg-[#FF5500] shadow-[0_0_8px_rgba(255,85,0,0.8)] animate-pulse" />
            <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400">Zehla Intelligence Map</h3>
          </div>
          
          <div className="space-y-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 group-focus-within:text-[#FF5500] transition-colors" />
              <input 
                type="text" 
                placeholder="Filtrar cidade/nome..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-[10px] text-zinc-300 focus:outline-none focus:border-[#FF5500]/30 transition-all placeholder:text-zinc-600"
                value={filters.search}
                onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
              />
            </div>
            
            <div className="flex gap-2">
              <select 
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] text-zinc-400 focus:outline-none focus:border-[#FF5500]/30 transition-all appearance-none cursor-pointer"
                value={filters.region}
                onChange={(e) => setFilters(f => ({ ...f, region: e.target.value }))}
              >
                <option value="all">Brasil (Full)</option>
                <option value="Sudeste">Sudeste</option>
                <option value="Nordeste">Nordeste</option>
                <option value="Sul">Sul</option>
                <option value="Norte">Norte</option>
              </select>
            </div>

            <div className="pt-2 mt-4 border-t border-white/5">
              <h4 className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold mb-3">Busca Ativa (Secretária-IA)</h4>
              <div className="flex flex-col gap-2">
                <input 
                  type="text" 
                  placeholder="Ex: Pousadas em Imbituba..."
                  className="w-full bg-[#FF5500]/5 border border-[#FF5500]/20 rounded-xl px-3 py-2.5 text-[10px] text-zinc-300 focus:outline-none focus:border-[#FF5500]/50 transition-all placeholder:text-zinc-700"
                  value={prospectQuery}
                  onChange={(e) => setProspectQuery(e.target.value)}
                  disabled={isProspecting}
                />
                <button 
                  onClick={triggerProspecting}
                  disabled={isProspecting || !prospectQuery}
                  className="w-full bg-[#FF5500] hover:bg-[#FF7700] disabled:bg-zinc-800 disabled:text-zinc-500 text-white px-4 py-2.5 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-2"
                >
                  {isProspecting ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      PROCESSANDO...
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5" />
                      DISPARAR PROSPECÇÃO
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 zehla-scroll">
          {stats && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/5">
                  <p className="text-[9px] text-zinc-500 uppercase mb-1 font-bold tracking-tighter">Leads Ativos</p>
                  <p className="text-2xl font-bold text-white font-mono tracking-tight">{stats.total}</p>
                </div>
                <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/5">
                  <p className="text-[9px] text-zinc-500 uppercase mb-1 font-bold tracking-tighter">Score Médio</p>
                  <p className="text-2xl font-bold text-[#FF5500] font-mono tracking-tight">{stats.avgScore}%</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Densidade Regional</h4>
                <div className="space-y-3">
                  {stats.byRegion.map((r: any) => (
                    <div key={r.name} className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-medium text-zinc-400">
                        <span className="tracking-tight">{r.name}</span>
                        <span className="text-zinc-500">{r.count}</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#FF5500]/50 to-[#FF5500]" 
                          style={{ width: `${(r.count / stats.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="space-y-4">
             <h4 className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Monitoramento Hot Leads</h4>
             <div className="space-y-2">
               {leads.filter(l => l.score >= 95).slice(0, 5).map(lead => (
                 <button 
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className="w-full flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/5 transition-all text-left group"
                 >
                   <div className="flex flex-col">
                     <span className="text-[11px] text-zinc-200 font-bold truncate w-32 group-hover:text-white">{lead.name}</span>
                     <span className="text-[10px] text-zinc-500 truncate">{lead.city}</span>
                   </div>
                   <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-[#FF5500] group-hover:translate-x-0.5 transition-all" />
                 </button>
               ))}
             </div>
          </div>
        </div>

        <div className="p-4 bg-black/40 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FF5500] shadow-[0_0_6px_rgba(255,85,0,0.6)] animate-pulse" />
            <span className="text-[9px] text-zinc-500 font-mono tracking-tight uppercase">Radar Neural Live</span>
          </div>
          <span className="text-[9px] text-zinc-700 font-mono uppercase">v4.5.1-field</span>
        </div>
      </div>


      {/* Area do Mapa (Full Background) */}
      <div className="absolute inset-0 z-10 bg-black">
        <LeadMapInner 
          leads={leads} 
          selectedLead={selectedLead} 
          onSelectLead={setSelectedLead} 
        />

        {/* HUD de Detalhes Flutuante */}
        {selectedLead && (
          <div className="absolute bottom-0 left-80 right-0 z-30 pointer-events-none p-6">
            <div className="max-w-3xl mx-auto bg-black/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl pointer-events-auto flex items-center gap-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-xl font-light text-white">{selectedLead.name}</h4>
                  {selectedLead.score >= 90 && <Zap className="w-4 h-4 text-[#FF5500] fill-[#FF5500]" />}
                </div>
                <p className="text-xs text-zinc-500 uppercase tracking-widest">{selectedLead.city}, {selectedLead.state}</p>
                
                <div className="flex gap-4 mt-4">
                  <div className="text-center">
                    <p className="text-[9px] text-zinc-600 uppercase mb-0.5">Score Qual.</p>
                    <p className="text-sm text-white font-mono">{selectedLead.score}%</p>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="text-center">
                    <p className="text-[9px] text-zinc-600 uppercase mb-0.5">Score Valid.</p>
                    <p className="text-sm text-zinc-400 font-mono">{selectedLead.validationScore}%</p>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="text-center">
                    <p className="text-[9px] text-zinc-600 uppercase mb-0.5">Status</p>
                    <p className="text-[10px] text-[#FF5500] font-bold uppercase">{selectedLead.status}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <a 
                  href={`https://wa.me/${selectedLead.whatsapp}`} 
                  target="_blank"
                  className="flex items-center gap-2 bg-[#FF5500] hover:bg-[#FF7700] text-white px-5 py-2.5 rounded-xl text-[10px] font-bold transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  PROSPECTAR AGORA
                </a>
                <button 
                  onClick={() => setSelectedLead(null)}
                  className="text-[9px] text-zinc-500 hover:text-white uppercase font-bold text-center"
                >
                  Fechar Radar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
