'use client';

import { useState, useEffect } from 'react';
import { 
  Search, Star, MapPin, Building2, Phone, Mail, TrendingUp, 
  Sparkles, Loader2, RefreshCw, Brain, Megaphone, CheckCircle, 
  Zap, ChevronDown, ChevronRight, Upload, FolderOpen, List, Plus
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

  const stats = [
    { label: 'Total Leads (SC)', value: statsData?.total || 0, icon: Building2, color: 'blue' },
    { label: 'Qualificados', value: statsData?.qualified || 0, icon: CheckCircle, color: 'orange' },
    { label: 'Em Campanha', value: statsData?.inCampaign || 0, icon: Megaphone, color: 'purple' },
    { label: 'Convertidos', value: statsData?.converted || 0, icon: Zap, color: 'amber' },
  ];

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
            </div>
            <div className="divide-y divide-white/5 max-h-[300px] overflow-y-auto zehla-scroll">
              {leads.filter(l => l.source === 'WHATSAPP_EXTRACT').map(lead => (
                <div key={lead.id} className="px-5 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                  <div>
                    <div className="text-xs font-bold text-[#efefef]">{lead.name}</div>
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
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
            activeSubTab === 'dashboard'
              ? 'text-[#FF5500] bg-[#FF5500]/10 font-bold'
              : 'text-[#898989] hover:text-[#efefef] hover:bg-[#242424]'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Dashboard de Leads</span>
        </button>

        <div className="space-y-1">
          <button
            onClick={() => setLeadsMenuExpanded(!leadsMenuExpanded)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-[#898989] hover:text-[#efefef] hover:bg-[#242424] transition-all"
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
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${
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
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
            activeSubTab === 'secretaria'
              ? 'text-[#FF5500] bg-[#FF5500]/10 font-bold'
              : 'text-[#898989] hover:text-[#efefef] hover:bg-[#242424]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
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
                  <p className="text-xs text-[#4d4d4d]">Descreva seu objetivo de marketing e a IA criará um plano personalizado</p>
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
