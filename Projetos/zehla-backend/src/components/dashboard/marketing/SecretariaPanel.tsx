import { 
import { useState, useEffect, useMemo } from 'react';

import { Badge } from '@/components/ui/badge';

import { FishDashboardView } from './FishDashboardView';


'use client';

  Sparkles, RefreshCw, Megaphone, Building2, Eye, List, Zap, 
  Upload, FolderOpen, Loader2, MapPin, Search, Download 
} from 'lucide-react';

export function SecretariaPanel() : void {
  const [activeTab, setActiveTab] = useState<'WA' | 'FISH'>('WA');
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
      .then((res) => res.json())
      .then((data) => {
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
          propertyId: 'cm1...' 
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
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setFoundGroups([
        { title: `Proprietários Pousadas - ${searchLocation}`, url: 'https://chat.whatsapp.com/...' },
        { title: `Turismo ${searchLocation} Networking`, url: 'https://chat.whatsapp.com/...' }
      ]);
    } finally {
      setIsSearchingGroups(false);
    }
  };

  const waLeads = useMemo(() => leads.filter((l) => l.source === 'WHATSAPP_EXTRACT'), [leads]);

  const stats = [
    { label: 'Total Leads (SC)', value: statsData?.total || 0, icon: Building2, color: 'blue' },
    { label: 'Total Aberturas', value: statsData?.totalOpens || 0, icon: Eye, color: 'green' },
    { label: 'Extraídos (WA)', value: waLeads.length, icon: List, color: 'purple' },
    { label: 'Convertidos', value: statsData?.converted || 0, icon: Zap, color: 'amber' }
  ];

  const handleDownloadVCard = () => {
    if (waLeads.length === 0) return alert('Nenhum lead de WhatsApp para exportar.');

    const vCardContent = waLeads.map((l) => {
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2e2e2e] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[#fafafa] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FF5500]" />
            Módulo Secretaria-IA
          </h2>
          <p className="text-xs text-[#4d4d4d]">Acoplamento total com o banco de prospecção e funil de conversão.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-[#1e1e1e] p-1 rounded-xl border border-[#2e2e2e]">
            <button
              onClick={() => setActiveTab('WA')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all uppercase ${
                activeTab === 'WA' 
                  ? 'bg-[#FF5500]/10 border border-[#FF5500]/30 text-[#FF5500]' 
                  : 'text-[#4d4d4d] hover:text-[#efefef]'
              }`}>
              Extração WhatsApp
            </button>
            <button
              onClick={() => setActiveTab('FISH')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all uppercase flex items-center gap-1.5 ${
                activeTab === 'FISH' 
                  ? 'bg-[#FF5500]/10 border border-[#FF5500]/30 text-[#FF5500]' 
                  : 'text-[#4d4d4d] hover:text-[#efefef]'
              }`}>
              ZEHLA FISH 🐠
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="glass-card hover:border-[#FF5500]/30 text-[#efefef] text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 text-[#FF5500] ${isSyncing ? 'animate-spin' : ''}`} />
              Sincronizar
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'WA' ? (
        <div className="space-y-6 animate-in fade-in duration-300">
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
                    className="w-full bg-[#242424] border border-[#363636] rounded-xl px-4 py-2.5 text-xs text-[#efefef] focus:border-[#FF5500]/50 outline-none transition-all">
                    
                    <option value="">Selecione uma conta conectada...</option>
                    {instances.map((inst) => (
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
                      extractionType === 'CONTACTS' ?
                      'bg-[#FF5500]/10 border-[#FF5500]/30 text-[#FF5500]' :
                      'bg-[#242424] border-[#363636] text-[#4d4d4d] hover:text-[#b4b4b4]'}`
                    }>
                    <List className="w-5 h-5 mx-auto mb-1.5" />
                    <span className="text-[10px] font-bold uppercase">Todos Contatos</span>
                  </button>
                  <button
                    onClick={() => setExtractionType('GROUP')}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      extractionType === 'GROUP' ?
                      'bg-[#FF5500]/10 border-[#FF5500]/30 text-[#FF5500]' :
                      'bg-[#242424] border-[#363636] text-[#4d4d4d] hover:text-[#b4b4b4]'}`
                    }>
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
                      className="w-full bg-[#242424] border border-[#363636] rounded-xl px-4 py-2.5 text-xs text-[#efefef] focus:border-[#FF5500]/50 outline-none transition-all">
                      <option value="">Selecione o grupo...</option>
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>{g.subject} ({g.size} membros)</option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  onClick={handleStartExtraction}
                  disabled={isExtracting || !selectedInstance || (extractionType === 'GROUP' && !selectedGroup)}
                  className="w-full bg-[#FF5500] hover:bg-[#EA580C] disabled:bg-[#363636] disabled:text-[#4d4d4d] text-white text-xs font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-[#FF5500]/20 flex items-center justify-center gap-2 mt-4">
                  
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
                      className="w-full bg-[#1a1a1a] border border-[#363636] rounded-xl pl-9 pr-4 py-2 text-xs text-[#efefef] focus:border-[#FF5500]/50 outline-none transition-all placeholder:text-[#363636]" />
                  </div>

                  <button
                    onClick={handleSearchGroups}
                    disabled={isSearchingGroups || !searchLocation}
                    className="w-full border border-[#363636] hover:border-[#FF5500]/30 hover:bg-[#FF5500]/5 text-[#efefef] text-[10px] font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2">
                    
                    {isSearchingGroups ? <Loader2 className="w-3 h-3 animate-spin text-[#FF5500]" /> : <Search className="w-3 h-3" />}
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

            <div className="space-y-6">
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold text-[#b4b4b4] mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#FF5500]" />
                  Inteligência de Campanha
                </h3>
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-[#FF5500]/5 border border-[#FF5500]/10">
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
                    className="text-[10px] text-[#FF5500] hover:underline flex items-center gap-1">
                    <Download className="w-3 h-3" />
                    Baixar vCard
                  </button>
                </div>
                <div className="divide-y divide-white/5 max-h-[300px] overflow-y-auto zehla-scroll">
                  {waLeads.map((lead) => (
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
                  {waLeads.length === 0 && (
                    <div className="p-8 text-center text-[10px] text-[#4d4d4d]">
                      Nenhum lead extraído via WA hoje.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in duration-300">
          <FishDashboardView />
        </div>
      )}
    </div>
  );
}
