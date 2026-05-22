'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, Star, MapPin, Building2, Phone, Mail, TrendingUp, 
  Sparkles, Loader2, RefreshCw, Brain, Megaphone, CheckCircle, 
  Zap, ChevronDown, ChevronRight, Upload, FolderOpen, List, Plus, Eye, Download,
  Maximize2, Minimize2, RotateCcw
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import type { B2BLead } from '@/lib/store';

const statusColors: Record<string, string> = {
  new: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  contacted: 'bg-[#FF5500]/10 text-[#FF5500] border-[#FF5500]/30',
  interested: 'bg-[#FF5500]/10 text-[#FF5500] border-[#FF5500]/30',
  converted: 'bg-purple-500/20 text-[#FF5500] border-[#FF5500]/30',
  lost: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const statusLabels: Record<string, string> = {
  new: 'Novo',
  contacted: 'Contactado',
  interested: 'Interessado',
  converted: 'Convertido',
  lost: 'Perdido',
};

const categoryIcons: Record<string, string> = {
  pousada: '🏡',
  hotel: '🏨',
  hostel: '🛏️',
};

// Data Source Metadata
const SOURCE_INFO = {
  junta: { label: 'Junta Comercial', color: 'text-blue-400', icon: Building2 },
  secretaria: { label: 'Secretaria-IA', color: 'text-[#FF5500]', icon: Brain, detail: 'Google Business & Reclame Aqui' },
};

// Sub-component: Region Spreadsheet View
interface RegionSpreadsheetViewProps {
  region: string;
}

function RegionSpreadsheetView({ region }: RegionSpreadsheetViewProps) {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, [region]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/zcc/leads?region=${encodeURIComponent(region)}`);
      const data = await res.json();
      setLeads(data.leads || []);
    } catch (error) {
      console.error('Error fetching regional leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    // Simulating file parsing and enrichment logic
    const mockLeads = [
      { 
        nome: 'Pousada ' + region + ' Eco', 
        categoria: 'pousada', 
        cidade: 'Cidade Sol', 
        estado: region, 
        telefone: '(99) 99999-1111', 
        email: `contato@${region.toLowerCase()}eco.com`, 
        nota: 4.8, 
        score: 92, 
        status: 'QUALIFIED', 
        dores: 'Dificuldade em gerir reservas via WhatsApp; Alta taxa de cancelamento no Booking.' 
      },
      { 
        nome: 'Hotel ' + region + ' Center', 
        categoria: 'hotel', 
        cidade: 'Metrópole', 
        estado: region, 
        telefone: '(99) 99999-2222', 
        email: `reservas@${region.toLowerCase()}center.com`, 
        nota: 3.9, 
        score: 65, 
        status: 'PROSPECT', 
        dores: 'Score baixo no Reclame Aqui por demora no atendimento.' 
      }
    ];

    try {
      const res = await fetch('/api/zcc/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads: mockLeads, region })
      });
      
      if (res.ok) {
        fetchLeads();
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#fafafa] flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-[#FF5500]" />
            Leads — Região {region}
          </h2>
          <p className="text-xs text-[#4d4d4d]">Gerencie e visualize as planilhas de prospecção da região.</p>
        </div>
        
        <label className="bg-[#FF5500] hover:bg-[#EA580C] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-[#FF5500]/20">
          <Upload className="w-4 h-4" />
          Fazer Upload de Planilha
          <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleUpload} />
        </label>
      </div>

      <div className="glass-card p-4">
        <div className="text-xs font-semibold text-[#b4b4b4] mb-3 flex items-center gap-2">
          <List className="w-4 h-4 text-[#FF5500]" />
          Status da Região
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-[#4d4d4d] uppercase font-bold">Total de Leads</span>
            <span className="text-lg font-bold text-[#efefef] font-mono">{leads.length}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-[#4d4d4d] uppercase font-bold">Qualificados</span>
            <span className="text-lg font-bold text-[#FF5500] font-mono">
              {leads.filter(l => l.status === 'QUALIFIED').length}
            </span>
          </div>
        </div>

        {/* Data Source Legend */}
        <div className="mt-4 pt-4 border-t border-[#2e2e2e] flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
            <span className="text-[10px] text-[#898989]">Dados base (Junta Comercial)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#FF5500]"></div>
            <span className="text-[10px] text-[#898989]">Enriquecimento (Google Business / Reclame Aqui)</span>
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto zehla-scroll-x">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-[#2e2e2e] bg-white/[0.01]">
                {/* Junta Comercial Group */}
                <th colSpan={6} className="text-[10px] uppercase tracking-wider text-blue-400/50 px-4 py-2 border-r border-[#2e2e2e] font-bold text-center bg-blue-500/[0.02]">
                  Dados Junta Comercial
                </th>
                {/* Secretaria-IA Group */}
                <th colSpan={4} className="text-[10px] uppercase tracking-wider text-[#FF5500]/50 px-4 py-2 font-bold text-center bg-[#FF5500]/[0.02]">
                  Enriquecimento Secretaria-IA
                </th>
              </tr>
              <tr className="border-b border-[#2e2e2e] bg-white/[0.01]">
                <th className="text-xs text-[#4d4d4d] px-4 py-3 font-semibold border-r border-[#2e2e2e]">Nome/Empresa</th>
                <th className="text-xs text-[#4d4d4d] px-4 py-3 font-semibold border-r border-[#2e2e2e]">Categoria</th>
                <th className="text-xs text-[#4d4d4d] px-4 py-3 font-semibold border-r border-[#2e2e2e]">Cidade</th>
                <th className="text-xs text-[#4d4d4d] px-4 py-3 font-semibold border-r border-[#2e2e2e]">Estado</th>
                <th className="text-xs text-[#4d4d4d] px-4 py-3 font-semibold border-r border-[#2e2e2e]">Telefone</th>
                <th className="text-xs text-[#4d4d4d] px-4 py-3 font-semibold border-r border-[#2e2e2e]">E-mail</th>
                <th className="text-xs text-[#4d4d4d] px-4 py-3 font-semibold">Nota Google</th>
                <th className="text-xs text-[#4d4d4d] px-4 py-3 font-semibold">Score</th>
                <th className="text-xs text-[#4d4d4d] px-4 py-3 font-semibold">Status</th>
                <th className="text-xs text-[#4d4d4d] px-4 py-3 font-semibold">Pontos de Dor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {leads.map((row, i) => (
                <tr key={row.id || i} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-4 py-3 text-[#efefef] font-medium text-xs whitespace-nowrap border-r border-[#2e2e2e]">{row.name || row.nome}</td>
                  <td className="px-4 py-3 text-[#898989] text-xs capitalize border-r border-[#2e2e2e]">{row.category || row.categoria}</td>
                  <td className="px-4 py-3 text-[#898989] text-xs border-r border-[#2e2e2e]">{row.city || row.cidade}</td>
                  <td className="px-4 py-3 text-[#898989] text-xs border-r border-[#2e2e2e]">{row.state || row.estado}</td>
                  <td className="px-4 py-3 text-[#898989] text-xs whitespace-nowrap border-r border-[#2e2e2e]">{row.phone || row.telefone}</td>
                  <td className="px-4 py-3 text-[#898989] text-xs border-r border-[#2e2e2e]">{row.email}</td>
                  <td className="px-4 py-3 text-[#efefef] text-xs bg-[#FF5500]/[0.01]">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-[#FF5500] fill-current" />
                      {row.googleRating || row.nota}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#efefef] text-xs font-mono bg-[#FF5500]/[0.01]">{row.score}</td>
                  <td className="px-4 py-3 text-xs bg-[#FF5500]/[0.01]">
                    <Badge variant="outline" className={`text-[10px] bg-[#FF5500]/10 text-[#FF5500] border-[#FF5500]/30`}>
                      {row.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-[#898989] text-xs truncate max-w-[150px] bg-[#FF5500]/[0.01]">{row.painPoints || row.dores}</td>
                </tr>
              ))}
              {leads.length === 0 && !loading && (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-[#4d4d4d] text-xs">
                    <List className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    Nenhum dado encontrado para a região {region}. Faça upload de uma planilha para popular esta região.
                  </td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={10} className="text-center py-12">
                    <Loader2 className="w-8 h-8 mx-auto animate-spin text-[#FF5500]" />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Sub-component: Secretaria-IA
function SecretariaPanel() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);
  const [statsData, setStatsData] = useState<any>(null);
  
  // WA Extraction State
  const [instances, setInstances] = useState<any[]>([]);
  const [selectedInstance, setSelectedInstance] = useState('');
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [extractionType, setExtractionType] = useState<'CONTACTS' | 'GROUP'>('CONTACTS');
  const [isSearchingGroups, setIsSearchingGroups] = useState(false);
  const [foundGroups, setFoundGroups] = useState<any[]>([]);
  const [searchLocation, setSearchLocation] = useState('Litoral de Santa Catarina');

  useEffect(() => {
    refreshData();
    fetchInstances();
  }, []);

  const refreshData = () => {
    fetch('/api/zcc/leads')
      .then(res => res.json())
      .then(data => {
        setLeads(data.leads || []);
        setStatsData(data.stats);
      })
      .catch(console.error);
  };

  const fetchInstances = async () => {
    try {
      const res = await fetch('/api/zcc/whatsapp/extract?action=listInstances');
      const data = await res.json();
      setInstances(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching WA instances:', err);
    }
  };

  const fetchGroups = async (instanceName: string) => {
    try {
      const res = await fetch(`/api/zcc/whatsapp/extract?action=listGroups&instanceName=${instanceName}`);
      const data = await res.json();
      setGroups(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching WA groups:', err);
    }
  };

  const handleStartExtraction = async () => {
    if (!selectedInstance) return alert('Selecione uma instância!');
    
    setIsExtracting(true);
    try {
      const res = await fetch('/api/zcc/whatsapp/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instanceName: selectedInstance,
          type: extractionType,
          groupJid: extractionType === 'GROUP' ? selectedGroup : undefined,
          propertyId: 'cm1...' // Mock ou pegar do contexto se houver
        })
      });
      
      const data = await res.json();
      if (data.success) {
        alert(`Extração concluída! ${data.savedCount} novos leads salvos.`);
        refreshData();
      }
    } catch (err) {
      console.error('Extraction failed:', err);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSearchGroups = async () => {
    setIsSearchingGroups(true);
    try {
      // Simulação de busca via IA / Scraper usando a localidade escolhida
      await new Promise(resolve => setTimeout(resolve, 2000));
      setFoundGroups([
        { title: `Proprietários Pousadas - ${searchLocation}`, url: 'https://chat.whatsapp.com/...' },
        { title: `Turismo ${searchLocation} Networking`, url: 'https://chat.whatsapp.com/...' }
      ]);
    } finally {
      setIsSearchingGroups(false);
    }
  };

  const stats = [
    { label: 'Total Leads (SC)', value: statsData?.total || 0, icon: Building2, color: 'blue' },
    { label: 'Total Aberturas', value: statsData?.totalOpens || 0, icon: Eye, color: 'green' },
    { label: 'Extraídos (WA)', value: leads.filter(l => l.source === 'WHATSAPP_EXTRACT').length, icon: List, color: 'purple' },
    { label: 'Convertidos', value: statsData?.converted || 0, icon: Zap, color: 'amber' },
  ];

  const handleDownloadVCard = () => {
    const waLeads = leads.filter(l => l.source === 'WHATSAPP_EXTRACT');
    if (waLeads.length === 0) return alert('Nenhum lead de WhatsApp para exportar.');

    const vCardContent = waLeads.map(l => {
      return [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${l.name}`,
        `TEL;TYPE=CELL;TYPE=VOICE;TYPE=pref:+${l.whatsapp || l.phone}`,
        `NOTE:Lead Extraído via Secretaria-IA - Score: ${l.score}`,
        'END:VCARD'
      ].join('\n');
    }).join('\n');

    const blob = new Blob([vCardContent], { type: 'text/vcard' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `leads_zehla_${new Date().toISOString().split('T')[0]}.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/zcc/leads');
      const data = await res.json();
      setLeads(data.leads || []);
      setStatsData(data.stats);
      setIsSyncing(false);
      alert(`Sincronização concluída! ${data.stats?.total || 0} leads processados.`);
    } catch {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#fafafa] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FF5500]" />
            Módulo Secretaria-IA
          </h2>
          <p className="text-xs text-[#4d4d4d]">Acoplamento total com o banco de prospecção.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="glass-card hover:border-[#FF5500]/30 text-[#efefef] text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 text-[#FF5500] ${isSyncing ? 'animate-spin' : ''}`} />
            Sincronizar Planilhas
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-2">
            <Megaphone className="w-4 h-4" />
            Nova Campanha
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card p-4 relative overflow-hidden group">
            <div className={`absolute -right-4 -top-4 w-16 h-16 opacity-5 group-hover:opacity-10 transition-opacity`}>
              <stat.icon className="w-full h-full text-[#FF5500]" />
            </div>
            <div className="text-[10px] text-[#4d4d4d] mb-1">{stat.label}</div>
            <div className="text-2xl font-bold text-[#fafafa]">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lado Esquerdo: Extração WA (Nova Feature) */}
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-[#FF5500]/10">
              <Upload className="w-5 h-5 text-[#FF5500]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#efefef]">Extração Inteligente (WA)</h3>
              <p className="text-xs text-[#4d4d4d]">Extraia leads diretamente de grupos ou contatos do WhatsApp.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-[#4d4d4d]">1. Selecionar Instância</label>
              <select 
                value={selectedInstance}
                onChange={(e) => {
                  setSelectedInstance(e.target.value);
                  if (e.target.value) fetchGroups(e.target.value);
                }}
                className="w-full bg-[#242424] border border-[#363636] rounded-xl px-4 py-2.5 text-xs text-[#efefef] focus:border-[#FF5500]/50 outline-none transition-all"
              >
                <option value="">Selecione uma conta conectada...</option>
                {instances.map(inst => (
                  <option key={inst.instance.instanceName} value={inst.instance.instanceName}>
                    {inst.instance.instanceName} ({inst.instance.status})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setExtractionType('CONTACTS')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  extractionType === 'CONTACTS' 
                    ? 'bg-[#FF5500]/10 border-[#FF5500]/30 text-[#FF5500]' 
                    : 'bg-[#242424] border-[#363636] text-[#4d4d4d] hover:text-[#b4b4b4]'
                }`}
              >
                <List className="w-5 h-5 mx-auto mb-1.5" />
                <span className="text-[10px] font-bold uppercase">Todos Contatos</span>
              </button>
              <button 
                onClick={() => setExtractionType('GROUP')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  extractionType === 'GROUP' 
                    ? 'bg-[#FF5500]/10 border-[#FF5500]/30 text-[#FF5500]' 
                    : 'bg-[#242424] border-[#363636] text-[#4d4d4d] hover:text-[#b4b4b4]'
                }`}
              >
                <FolderOpen className="w-5 h-5 mx-auto mb-1.5" />
                <span className="text-[10px] font-bold uppercase">De um Grupo</span>
              </button>
            </div>

            {extractionType === 'GROUP' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-[10px] uppercase font-bold text-[#4d4d4d]">2. Selecionar Grupo</label>
                <select 
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="w-full bg-[#242424] border border-[#363636] rounded-xl px-4 py-2.5 text-xs text-[#efefef] focus:border-[#FF5500]/50 outline-none transition-all"
                >
                  <option value="">Selecione o grupo...</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.subject} ({g.size} membros)</option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={handleStartExtraction}
              disabled={isExtracting || !selectedInstance || (extractionType === 'GROUP' && !selectedGroup)}
              className="w-full bg-[#FF5500] hover:bg-[#EA580C] disabled:bg-[#363636] disabled:text-[#4d4d4d] text-white text-xs font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-[#FF5500]/20 flex items-center justify-center gap-2 mt-4"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Extraindo Dados (Lendo window.Store)...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Iniciar Extração Inteligente
                </>
              )}
            </button>

            <div className="pt-4 border-t border-[#2e2e2e]">
              <p className="text-[10px] text-[#4d4d4d] mb-3 uppercase font-bold">Faltam grupos? Procure novos na rede:</p>
              
              <div className="relative mb-3">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4d4d4d]" />
                <input 
                  type="text"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  placeholder="Ex: Itacaré, BA ou Praia do Rosa"
                  className="w-full bg-[#1a1a1a] border border-[#363636] rounded-xl pl-9 pr-4 py-2 text-xs text-[#efefef] focus:border-[#FF5500]/50 outline-none transition-all placeholder:text-[#363636]"
                />
              </div>

              <button 
                onClick={handleSearchGroups}
                disabled={isSearchingGroups || !searchLocation}
                className="w-full border border-[#363636] hover:border-[#FF5500]/30 hover:bg-[#FF5500]/5 text-[#efefef] text-[10px] font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {isSearchingGroups ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Search className="w-3 h-3" />
                )}
                Buscar Grupos ({searchLocation})
              </button>
              
              {foundGroups.length > 0 && (
                <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-bottom-2">
                  {foundGroups.map((g, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between">
                      <span className="text-[10px] text-[#b4b4b4] truncate max-w-[150px]">{g.title}</span>
                      <a href={g.url} target="_blank" className="text-[9px] text-[#FF5500] font-bold">Entrar no Grupo</a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lado Direito: Inteligência e Insights */}
        <div className="space-y-6">
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-[#b4b4b4] mb-4 flex items-center gap-2">
              <Brain className="w-4 h-4 text-[#FF5500]" />
              Inteligência de Campanha
            </h3>
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
                <div className="text-[10px] text-[#FF5500] font-bold mb-1 uppercase tracking-wider">Sugestão da IA</div>
                <p className="text-xs text-[#b4b4b4] leading-relaxed">
                  Detectamos 42 pousadas na Praia do Rosa que ainda não usam motor de reservas. 
                  Recomendo iniciar campanha <span className="text-[#FF5500]">"Trauma da Comissão"</span> focando no alívio da dor das taxas da Booking.com.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px]">
                  <span className="text-[#4d4d4d]">Qualidade da Base (Extração WA)</span>
                  <span className="text-[#FF5500]">92%</span>
                </div>
                <div className="h-1 bg-[#242424] rounded-full overflow-hidden">
                  <div className="h-full bg-[#FF5500] w-[92%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="px-5 py-4 border-b border-[#2e2e2e] flex items-center justify-between bg-white/[0.01]">
              <h3 className="text-sm font-semibold text-[#b4b4b4]">Leads Extraídos Hoje</h3>
              <button 
                onClick={handleDownloadVCard}
                className="text-[10px] text-[#FF5500] hover:underline flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                Baixar vCard
              </button>
            </div>
            <div className="divide-y divide-white/5 max-h-[300px] overflow-y-auto zehla-scroll">
              {leads.filter(l => l.source === 'WHATSAPP_EXTRACT').map(lead => (
                <div key={lead.id} className="px-5 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                  <div>
                    <div className="text-xs font-bold text-[#efefef] flex items-center gap-2">
                      {lead.name}
                      {lead._count?.emailTracking > 0 && (
                        <span className="flex items-center gap-1 text-[9px] text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded-full">
                          <Eye className="w-2.5 h-2.5" />
                          {lead._count.emailTracking} aberturas
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-[#4d4d4d]">{lead.whatsapp || lead.phone}</div>
                  </div>
                  <Badge variant="outline" className="text-[9px] bg-[#FF5500]/10 text-[#FF5500] border-[#FF5500]/30">
                    {lead.status}
                  </Badge>
                </div>
              ))}
              {leads.filter(l => l.source === 'WHATSAPP_EXTRACT').length === 0 && (
                <div className="p-8 text-center text-[10px] text-[#4d4d4d]">
                  Nenhum lead extraído via WA hoje.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MapLead {
  n: string; // Pousada name
  c: string; // City
  s: string; // State
  la: number; // Latitude
  lo: number; // Longitude
  sc: number; // Score
}

function LeadsMap() {
  const [leads, setLeads] = useState<Record<string, MapLead[]>>({});
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'tier' | 'funnel'>('tier');
  
  // Active Filters
  const [selectedTiers, setSelectedTiers] = useState<Record<string, boolean>>({
    TIER_MAX: true,
    TIER_PRO: true,
    TIER_LITE: true,
  });

  const [selectedFunnels, setSelectedFunnels] = useState<Record<string, boolean>>({
    FUNNEL_HOT: true,
    FUNNEL_WARM: true,
    FUNNEL_WARM_LOW: true,
    FUNNEL_COLD: false,
  });

  // Pan and Zoom
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Hover Tooltip
  const [hoveredLead, setHoveredLead] = useState<MapLead | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load Leads Coordinates
  useEffect(() => {
    fetch('/pousadas.json')
      .then((res) => res.json())
      .then((data) => {
        setLeads(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load pousadas map coordinates:', err);
        setLoading(false);
      });
  }, []);

  // Compute Active Leads based on Filters
  const activeLeads = useMemo(() => {
    if (loading || !leads) return [];
    
    let list: MapLead[] = [];
    if (viewMode === 'tier') {
      if (selectedTiers.TIER_MAX && leads.TIER_MAX) list = list.concat(leads.TIER_MAX);
      if (selectedTiers.TIER_PRO && leads.TIER_PRO) list = list.concat(leads.TIER_PRO);
      if (selectedTiers.TIER_LITE && leads.TIER_LITE) list = list.concat(leads.TIER_LITE);
    } else {
      if (selectedFunnels.FUNNEL_HOT && leads.FUNNEL_HOT) list = list.concat(leads.FUNNEL_HOT);
      if (selectedFunnels.FUNNEL_WARM && leads.FUNNEL_WARM) list = list.concat(leads.FUNNEL_WARM);
      if (selectedFunnels.FUNNEL_WARM_LOW && leads.FUNNEL_WARM_LOW) list = list.concat(leads.FUNNEL_WARM_LOW);
      if (selectedFunnels.FUNNEL_COLD && leads.FUNNEL_COLD) list = list.concat(leads.FUNNEL_COLD);
    }
    return list;
  }, [leads, loading, viewMode, selectedTiers, selectedFunnels]);

  // Compute all leads coordinates once to draw the charcoal base map of Brazil
  const baseMapLeads = useMemo(() => {
    if (loading || !leads) return [];
    const list: MapLead[] = [];
    if (leads.TIER_MAX) list.push(...leads.TIER_MAX);
    if (leads.TIER_PRO) list.push(...leads.TIER_PRO);
    if (leads.TIER_LITE) list.push(...leads.TIER_LITE);
    return list;
  }, [leads, loading]);

  // Get color for a lead
  const getLeadColor = (lead: MapLead, opacity = 1.0) => {
    if (viewMode === 'tier') {
      if (leads.TIER_MAX?.some(l => l.n === lead.n && l.s === lead.s)) return `rgba(255, 85, 0, ${opacity})`; 
      if (leads.TIER_PRO?.some(l => l.n === lead.n && l.s === lead.s)) return `rgba(168, 85, 247, ${opacity})`; 
      if (leads.TIER_LITE?.some(l => l.n === lead.n && l.s === lead.s)) return `rgba(6, 182, 212, ${opacity})`; 
    } else {
      if (leads.FUNNEL_HOT?.some(l => l.n === lead.n && l.s === lead.s)) return `rgba(255, 85, 0, ${opacity})`; 
      if (leads.FUNNEL_WARM?.some(l => l.n === lead.n && l.s === lead.s)) return `rgba(168, 85, 247, ${opacity})`; 
      if (leads.FUNNEL_WARM_LOW?.some(l => l.n === lead.n && l.s === lead.s)) return `rgba(6, 182, 212, ${opacity})`; 
    }
    return `rgba(137, 137, 137, ${opacity})`; 
  };

  const getXY = (lat: number, lon: number, w: number, h: number) => {
    const x = ((lon - (-74.0)) / (34.0 - (-74.0))) * w;
    const y = (1 - (lat - (-34.0)) / (5.5 - (-34.0))) * h;
    return { x, y };
  };

  const stateLabels = useMemo(() => [
    { name: 'AM', lat: -3.4, lon: -62.2 },
    { name: 'PA', lat: -3.8, lon: -52.0 },
    { name: 'MT', lat: -12.6, lon: -56.0 },
    { name: 'GO', lat: -15.9, lon: -49.3 },
    { name: 'MS', lat: -20.5, lon: -54.6 },
    { name: 'MG', lat: -18.5, lon: -44.5 },
    { name: 'SP', lat: -22.2, lon: -48.5 },
    { name: 'RJ', lat: -22.3, lon: -42.8 },
    { name: 'BA', lat: -12.5, lon: -41.7 },
    { name: 'CE', lat: -5.2, lon: -39.3 },
    { name: 'PE', lat: -8.3, lon: -37.5 },
    { name: 'RS', lat: -30.0, lon: -53.5 },
    { name: 'PR', lat: -24.7, lon: -51.3 },
    { name: 'SC', lat: -27.2, lon: -50.5 },
    { name: 'MA', lat: -5.3, lon: -45.0 },
    { name: 'PI', lat: -7.5, lon: -42.5 },
    { name: 'RN', lat: -5.8, lon: -36.5 },
    { name: 'PB', lat: -7.2, lon: -36.8 },
    { name: 'AL', lat: -9.6, lon: -36.6 },
    { name: 'SE', lat: -10.6, lon: -37.4 },
    { name: 'ES', lat: -19.8, lon: -40.3 },
    { name: 'TO', lat: -10.2, lon: -48.3 },
    { name: 'DF', lat: -15.8, lon: -47.9 },
    { name: 'RO', lat: -10.9, lon: -62.8 },
    { name: 'AC', lat: -9.0, lon: -70.0 },
    { name: 'AP', lat: 1.4, lon: -51.5 },
    { name: 'RR', lat: 2.3, lon: -61.4 }
  ], []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    // Grid backdrop
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = -offset.x / scale; x < (canvas.width - offset.x) / scale; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, -offset.y / scale);
      ctx.lineTo(x, (canvas.height - offset.y) / scale);
      ctx.stroke();
    }
    for (let y = -offset.y / scale; y < (canvas.height - offset.y) / scale; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(-offset.x / scale, y);
      ctx.lineTo((canvas.width - offset.x) / scale, y);
      ctx.stroke();
    }

    // Faint base map
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    baseMapLeads.forEach((lead) => {
      const { x, y } = getXY(lead.la, lead.lo, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.arc(x, y, 1.2 / Math.sqrt(scale), 0, 2 * Math.PI);
      ctx.fill();
    });

    // State labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.font = `${Math.max(8, 11 / scale)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    stateLabels.forEach((lbl) => {
      const { x, y } = getXY(lbl.lat, lbl.lon, canvas.width, canvas.height);
      ctx.fillText(lbl.name, x, y);
    });

    // Active Highlights Layer
    activeLeads.forEach((lead) => {
      const { x, y } = getXY(lead.la, lead.lo, canvas.width, canvas.height);
      const color = getLeadColor(lead, 0.85);
      ctx.fillStyle = color;

      ctx.beginPath();
      ctx.arc(x, y, 2.2 / Math.sqrt(scale), 0, 2 * Math.PI);
      ctx.fill();
    });

    // Hover Ring
    if (hoveredLead) {
      const { x, y } = getXY(hoveredLead.la, hoveredLead.lo, canvas.width, canvas.height);
      const color = getLeadColor(hoveredLead, 1.0);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5 / scale;
      ctx.beginPath();
      ctx.arc(x, y, 7 / scale, 0, 2 * Math.PI);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.beginPath();
      ctx.arc(x, y, 7 / scale, 0, 2 * Math.PI);
      ctx.fill();
    }

    ctx.restore();
  }, [activeLeads, baseMapLeads, scale, offset, hoveredLead, viewMode, stateLabels]);

  const zoomIn = () => setScale((s) => Math.min(20, s * 1.3));
  const zoomOut = () => setScale((s) => Math.max(0.6, s / 1.3));
  const resetZoom = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
    setHoveredLead(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      });
    } else {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      let closestLead: MapLead | null = null;
      let minDistance = 12;

      for (const lead of activeLeads) {
        const { x, y } = getXY(lead.la, lead.lo, canvas.width, canvas.height);
        const px = x * scale + offset.x;
        const py = y * scale + offset.y;

        const dx = mouseX - px;
        const dy = mouseY - py;
        const realDist = Math.sqrt(dx * dx + dy * dy);
        if (realDist < minDistance) {
          minDistance = realDist;
          closestLead = lead;
        }
      }

      if (closestLead) {
        setHoveredLead(closestLead);
        setTooltipPos({ x: mouseX + 15, y: mouseY + 15 });
      } else {
        setHoveredLead(null);
      }
    }
  };

  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => {
    setIsDragging(false);
    setHoveredLead(null);
  };

  const activeCount = activeLeads.length;
  const mappedCount = baseMapLeads.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#fafafa] flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#FF5500]" />
            Mapa Temático de Leads
          </h2>
          <p className="text-xs text-[#4d4d4d]">Exibição geoespacial interativa de pousadas captadas em todo o território nacional.</p>
        </div>

        <div className="bg-[#141416] p-1 rounded-xl border border-[#2e2e32] flex gap-1 self-start sm:self-center">
          <button
            onClick={() => { setViewMode('tier'); resetZoom(); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'tier'
                ? 'bg-[#FF5500] text-white'
                : 'text-[#898989] hover:text-[#efefef]'
            }`}
          >
            Filtrar por Tiers
          </button>
          <button
            onClick={() => { setViewMode('funnel'); resetZoom(); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'funnel'
                ? 'bg-[#FF5500] text-white'
                : 'text-[#898989] hover:text-[#efefef]'
            }`}
          >
            Filtrar por Funil
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="space-y-6 lg:col-span-1">
          <div className="glass-card p-4 space-y-4">
            <div className="text-[10px] text-[#4d4d4d] uppercase font-bold tracking-wider">Métricas do Mapa</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/[0.01] border border-white/5 p-2.5 rounded-xl">
                <span className="text-[9px] text-[#4d4d4d] block font-medium">MAPEADAS (COORD)</span>
                <span className="text-sm font-bold text-[#efefef] font-mono">{mappedCount.toLocaleString('pt-BR')}</span>
              </div>
              <div className="bg-white/[0.01] border border-white/5 p-2.5 rounded-xl">
                <span className="text-[9px] text-[#4d4d4d] block font-medium">FILTRADAS NO MAPA</span>
                <span className="text-sm font-bold text-[#FF5500] font-mono">{activeCount.toLocaleString('pt-BR')}</span>
              </div>
            </div>
            <div className="text-[10px] text-[#4d4d4d] leading-relaxed pt-2 border-t border-[#222225]">
              * Mapeados: 9.627 pousadas com coordenadas. 548 leads sem coordenadas foram ocultados para evitar quebras.
            </div>
          </div>

          <div className="glass-card p-4 space-y-4">
            <div className="text-[10px] text-[#4d4d4d] uppercase font-bold tracking-wider">
              {viewMode === 'tier' ? 'Filtros por Tiers' : 'Filtros por Funil'}
            </div>

            {viewMode === 'tier' ? (
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.02] border border-transparent hover:border-white/5 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTiers.TIER_MAX}
                    onChange={(e) => setSelectedTiers({ ...selectedTiers, TIER_MAX: e.target.checked })}
                    className="w-4 h-4 rounded text-[#FF5500] bg-[#1a1a1c] border-[#3a3a3c] focus:ring-0"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#efefef] flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FF5500]" />
                      TIER MAX (HOT)
                    </span>
                    <span className="text-[9px] text-[#4d4d4d] block mt-0.5 font-mono">
                      {leads.TIER_MAX ? leads.TIER_MAX.length.toLocaleString('pt-BR') : 0} leads com coord
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.02] border border-transparent hover:border-white/5 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTiers.TIER_PRO}
                    onChange={(e) => setSelectedTiers({ ...selectedTiers, TIER_PRO: e.target.checked })}
                    className="w-4 h-4 rounded text-[#A855F7] bg-[#1a1a1c] border-[#3a3a3c] focus:ring-0"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#efefef] flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#A855F7]" />
                      TIER PRO (WARM)
                    </span>
                    <span className="text-[9px] text-[#4d4d4d] block mt-0.5 font-mono">
                      {leads.TIER_PRO ? leads.TIER_PRO.length.toLocaleString('pt-BR') : 0} leads com coord
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.02] border border-transparent hover:border-white/5 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTiers.TIER_LITE}
                    onChange={(e) => setSelectedTiers({ ...selectedTiers, TIER_LITE: e.target.checked })}
                    className="w-4 h-4 rounded text-[#06B6D4] bg-[#1a1a1c] border-[#3a3a3c] focus:ring-0"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#efefef] flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#06B6D4]" />
                      TIER LITE (WARM LOW)
                    </span>
                    <span className="text-[9px] text-[#4d4d4d] block mt-0.5 font-mono">
                      {leads.TIER_LITE ? leads.TIER_LITE.length.toLocaleString('pt-BR') : 0} leads com coord
                    </span>
                  </div>
                </label>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.02] border border-transparent hover:border-white/5 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedFunnels.FUNNEL_HOT}
                    onChange={(e) => setSelectedFunnels({ ...selectedFunnels, FUNNEL_HOT: e.target.checked })}
                    className="w-4 h-4 rounded text-[#FF5500] bg-[#1a1a1c] border-[#3a3a3c] focus:ring-0"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#efefef] flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FF5500]" />
                      FUNNEL HOT
                    </span>
                    <span className="text-[9px] text-[#4d4d4d] block mt-0.5 font-mono">
                      {leads.FUNNEL_HOT ? leads.FUNNEL_HOT.length.toLocaleString('pt-BR') : 0} leads com coord
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.02] border border-transparent hover:border-white/5 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedFunnels.FUNNEL_WARM}
                    onChange={(e) => setSelectedFunnels({ ...selectedFunnels, FUNNEL_WARM: e.target.checked })}
                    className="w-4 h-4 rounded text-[#A855F7] bg-[#1a1a1c] border-[#3a3a3c] focus:ring-0"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#efefef] flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#A855F7]" />
                      FUNNEL WARM
                    </span>
                    <span className="text-[9px] text-[#4d4d4d] block mt-0.5 font-mono">
                      {leads.FUNNEL_WARM ? leads.FUNNEL_WARM.length.toLocaleString('pt-BR') : 0} leads com coord
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.02] border border-transparent hover:border-white/5 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedFunnels.FUNNEL_WARM_LOW}
                    onChange={(e) => setSelectedFunnels({ ...selectedFunnels, FUNNEL_WARM_LOW: e.target.checked })}
                    className="w-4 h-4 rounded text-[#06B6D4] bg-[#1a1a1c] border-[#3a3a3c] focus:ring-0"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#efefef] flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#06B6D4]" />
                      FUNNEL WARM LOW
                    </span>
                    <span className="text-[9px] text-[#4d4d4d] block mt-0.5 font-mono">
                      {leads.FUNNEL_WARM_LOW ? leads.FUNNEL_WARM_LOW.length.toLocaleString('pt-BR') : 0} leads com coord
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.02] border border-transparent hover:border-white/5 opacity-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedFunnels.FUNNEL_COLD}
                    onChange={(e) => setSelectedFunnels({ ...selectedFunnels, FUNNEL_COLD: e.target.checked })}
                    className="w-4 h-4 rounded text-slate-500 bg-[#1a1a1c] border-[#3a3a3c] focus:ring-0"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#efefef] flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                      FUNNEL COLD
                    </span>
                    <span className="text-[9px] text-[#4d4d4d] block mt-0.5 font-mono">
                      0 leads com coord
                    </span>
                  </div>
                </label>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="glass-card relative overflow-hidden bg-[#0c0c0e]/80 border border-[#232328] p-2 flex flex-col h-[550px] group/map shadow-2xl">
            {loading ? (
              <div className="absolute inset-0 bg-[#0c0c0e]/95 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-30">
                <Loader2 className="w-8 h-8 animate-spin text-[#FF5500]" />
                <span className="text-xs font-mono text-[#898989]">Sincronizando 10.175 pousadas da planilha...</span>
              </div>
            ) : null}

            <div className="absolute top-4 left-4 z-20 flex gap-2">
              <div className="bg-[#141416]/90 backdrop-blur-md px-3 py-2 rounded-xl border border-[#2e2e32] flex items-center gap-2 text-[10px] font-mono font-bold text-[#b4b4b4] shadow-lg select-none">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                <span>RADAR GEOATIVO DA ZEHLA</span>
              </div>
            </div>

            <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5">
              <button
                onClick={zoomIn}
                title="Aumentar Zoom"
                className="w-8 h-8 rounded-lg bg-[#141416]/95 hover:bg-[#202024] border border-[#2e2e32] flex items-center justify-center text-[#efefef] hover:text-[#FF5500] transition-colors shadow-lg active:scale-95 cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={zoomOut}
                title="Diminuir Zoom"
                className="w-8 h-8 rounded-lg bg-[#141416]/95 hover:bg-[#202024] border border-[#2e2e32] flex items-center justify-center text-[#efefef] hover:text-[#FF5500] transition-colors shadow-lg active:scale-95 cursor-pointer"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={resetZoom}
                title="Resetar Visualização"
                className="w-8 h-8 rounded-lg bg-[#141416]/95 hover:bg-[#202024] border border-[#2e2e32] flex items-center justify-center text-[#efefef] hover:text-[#FF5500] transition-colors shadow-lg active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing overflow-hidden select-none">
              <canvas
                ref={canvasRef}
                width={700}
                height={520}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                className="w-full h-full block bg-transparent"
              />

              {hoveredLead && (
                <div
                  className="absolute bg-[#121214]/95 backdrop-blur-md border border-[#2e2e34] px-3.5 py-3 rounded-xl shadow-2xl z-40 max-w-[280px] pointer-events-none transition-opacity duration-200"
                  style={{
                    left: `${tooltipPos.x}px`,
                    top: `${tooltipPos.y}px`,
                  }}
                >
                  <div className="space-y-1.5">
                    <div className="text-[10px] uppercase font-bold tracking-wider font-mono text-[#898989] flex items-center justify-between gap-4">
                      <span>{hoveredLead.s} • {hoveredLead.c}</span>
                      <Badge className="border-0 bg-[#FF5500]/10 text-[#FF5500] text-[8px] font-mono h-4">
                        SCORE {hoveredLead.sc}
                      </Badge>
                    </div>
                    <div className="text-xs font-bold text-[#fafafa] leading-snug">{hoveredLead.n}</div>
                    <div className="flex items-center justify-between text-[9px] font-mono text-[#4d4d4d] border-t border-[#2e2e32] pt-1.5 mt-1.5">
                      <span>LAT: {hoveredLead.la.toFixed(4)}</span>
                      <span>LON: {hoveredLead.lo.toFixed(4)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-[#0f0f11]/90 border-t border-[#202024] p-3 rounded-b-xl flex items-center justify-between gap-4 flex-wrap text-[10px] text-[#4d4d4d] font-mono select-none">
              <div className="flex gap-4 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                  Grid Base (Outros Leads)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500]" />
                  MAX/HOT
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A855F7]" />
                  PRO/WARM
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4]" />
                  LITE/WARM LOW
                </span>
              </div>
              <div>
                <span>Use o mouse para arrastar e os botões para zoom</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// MAIN COMPONENT
export function MarketingLeads() {
  const [activeSubTab, setActiveSubTab] = useState<string>('dashboard');
  const [leadsMenuExpanded, setLeadsMenuExpanded] = useState(true);

  const [leads, setLeads] = useState<B2BLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterState, setFilterState] = useState<string>('');

  const [strategyPrompt, setStrategyPrompt] = useState('');
  const [strategyResult, setStrategyResult] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetch('/api/marketing/leads')
      .then(r => r.json())
      .then(d => { setLeads(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const generateStrategy = async () => {
    if (!strategyPrompt.trim()) return;
    setIsGenerating(true);
    setStrategyResult('');
    try {
      const res = await fetch('/api/marketing/ai-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: strategyPrompt }),
      });
      const data = await res.json();
      setStrategyResult(data.strategy || 'Erro ao gerar estratégia.');
    } catch {
      setStrategyResult('Erro de conexão.');
    }
    setIsGenerating(false);
  };

  const filtered = leads.filter(l => {
    if (search && !l.name.toLowerCase().includes(search.toLowerCase()) && !l.city.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus !== 'all' && l.status !== filterStatus) return false;
    if (filterState && l.state !== filterState) return false;
    return true;
  });

  const states = [...new Set(leads.map(l => l.state))].sort();
  const regions = ['Sul', 'Sudeste', 'Norte', 'Nordeste'];

  return (
    <div className="flex flex-col md:flex-row gap-6 min-h-[calc(100vh-120px)]">
      
      {/* Internal Sidebar */}
      <aside className="w-full md:w-64 flex-shrink-0 bg-[#0f0f0f]/40 backdrop-blur-md rounded-2xl p-4 border border-[#2e2e2e] flex flex-col gap-2">
        <div className="text-[10px] text-[#4d4d4d] font-bold uppercase tracking-wider px-2 mb-2">Marketing Hub</div>
        
        <button
          onClick={() => setActiveSubTab('dashboard')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            activeSubTab === 'dashboard'
              ? 'text-[#FF5500] bg-[#FF5500]/10 font-bold'
              : 'text-[#898989] hover:text-[#efefef] hover:bg-[#242424]'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Dashboard de Leads</span>
        </button>

        <button
          onClick={() => setActiveSubTab('mapa')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            activeSubTab === 'mapa'
              ? 'text-[#FF5500] bg-[#FF5500]/10 font-bold'
              : 'text-[#898989] hover:text-[#efefef] hover:bg-[#242424]'
          }`}
        >
          <MapPin className="w-4 h-4 text-[#FF5500]" />
          <span>Mapa de Leads</span>
        </button>

        <div className="space-y-1">
          <button
            onClick={() => setLeadsMenuExpanded(!leadsMenuExpanded)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-[#898989] hover:text-[#efefef] hover:bg-[#242424] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <List className="w-4 h-4" />
              <span>Lista de Leads</span>
            </div>
            {leadsMenuExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          {leadsMenuExpanded && (
            <div className="pl-6 flex flex-col gap-1">
              {regions.map(region => (
                <button
                  key={region}
                  onClick={() => setActiveSubTab(`leads-${region.toLowerCase()}`)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    activeSubTab === `leads-${region.toLowerCase()}`
                      ? 'text-[#FF5500] bg-[#FF5500]/5 font-semibold'
                      : 'text-[#4d4d4d] hover:text-[#b4b4b4]'
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => setActiveSubTab('secretaria')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            activeSubTab === 'secretaria'
              ? 'text-[#FF5500] bg-[#FF5500]/10 font-bold'
              : 'text-[#898989] hover:text-[#efefef] hover:bg-[#242424]'
          }`}
        >
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span>Secretaria-IA</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1">
        {activeSubTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-[#FF5500]/10">
                  <Sparkles className="w-5 h-5 text-[#FF5500]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#efefef]">Gerador de Estratégia IA</h3>
                  <p className="text-xs text-[#4d4d4d]">Descreva seu objetivo de marketing e a IA criará um plan personalizado</p>
                </div>
              </div>

              <div className="space-y-3">
                <Textarea
                  value={strategyPrompt}
                  onChange={(e) => setStrategyPrompt(e.target.value)}
                  placeholder="Ex: Quero atrair mais hóspedes durante a baixa temporada..."
                  className="bg-[#242424] border-[#363636] text-sm min-h-[80px] resize-none placeholder:text-[#363636] overflow-y-auto zehla-scroll"
                />
                <div className="flex items-center gap-3">
                  <Button
                    onClick={generateStrategy}
                    disabled={isGenerating || !strategyPrompt.trim()}
                    size="sm"
                    className="bg-[#FF5500]/20 hover:bg-[#FF5500]/30 text-[#FF5500] border border-[#FF5500]/30 text-xs"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                        Gerar Estratégia
                      </>
                    )}
                  </Button>
                  {strategyResult && (
                    <Button
                      onClick={() => { setStrategyResult(''); setStrategyPrompt(''); }}
                      variant="ghost"
                      size="sm"
                      className="text-[#4d4d4d] text-xs hover:text-[#b4b4b4]"
                    >
                      Limpar
                    </Button>
                  )}
                </div>

                {strategyResult && (
                  <div className="mt-3 p-4 rounded-xl bg-white/[0.02] border border-[#2e2e2e]">
                    <div className="text-[10px] text-[#4d4d4d] mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-[#FF5500]" />
                      Estratégia gerada pela IA
                    </div>
                    <div className="text-sm text-[#b4b4b4] leading-relaxed whitespace-pre-wrap">{strategyResult}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4d4d4d]" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nome ou cidade..."
                  className="bg-[#242424] border-[#363636] text-sm pl-9"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-[#242424] border border-[#363636] rounded-lg px-3 py-2 text-xs text-[#b4b4b4]"
                >
                  <option value="all">Todos Status</option>
                  <option value="new">Novo</option>
                  <option value="contacted">Contactado</option>
                  <option value="interested">Interessado</option>
                  <option value="converted">Convertido</option>
                  <option value="lost">Perdido</option>
                </select>
                <select
                  value={filterState}
                  onChange={(e) => setFilterState(e.target.value)}
                  className="bg-[#242424] border border-[#363636] rounded-lg px-3 py-2 text-xs text-[#b4b4b4]"
                >
                  <option value="">Todos Estados</option>
                  {states.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-48 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {filtered.map((lead) => (
                  <div key={lead.id} className="glass-card p-5 hover:bg-[#242424] transition-all duration-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{categoryIcons[lead.category]}</span>
                        <div>
                          <h3 className="font-semibold text-[#efefef]">{lead.name}</h3>
                          <div className="flex items-center gap-1 text-xs text-[#4d4d4d]">
                            <MapPin className="w-3 h-3" />
                            {lead.city}, {lead.state}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className={`text-[10px] ${statusColors[lead.status]}`}>
                        {statusLabels[lead.status]}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="flex items-center gap-2 text-xs text-[#898989]">
                        <Star className="w-3.5 h-3.5 text-[#FF5500]" />
                        <span>{lead.googleRating} Google</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#898989]">
                        <TrendingUp className="w-3.5 h-3.5 text-[#FF5500]" />
                        <span>Score: {lead.leadScore}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#898989]">
                        <Phone className="w-3.5 h-3.5" />
                        <span className="truncate">{lead.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#898989]">
                        <Building2 className="w-3.5 h-3.5" />
                        <span className="capitalize">{lead.category}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-[#4d4d4d]">
                        <Mail className="w-3 h-3" />
                        <span className="truncate">{lead.emails[0]}</span>
                      </div>
                      {lead.emails.length > 1 && (
                        <span className="text-[10px] text-[#363636]">+{lead.emails.length - 1} emails</span>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1">
                      {lead.painPoints.map((pp, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400/80">
                          {pp}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && filtered.length === 0 && (
              <div className="text-center py-12 text-[#4d4d4d]">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum lead encontrado</p>
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'mapa' && (
          <LeadsMap />
        )}

        {activeSubTab.startsWith('leads-') && (
          <RegionSpreadsheetView region={activeSubTab.replace('leads-', '').toUpperCase()} />
        )}

        {activeSubTab === 'secretaria' && (
          <SecretariaPanel />
        )}
      </div>
    </div>
  );
}
