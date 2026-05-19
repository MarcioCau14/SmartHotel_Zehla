'use client';

import { useState, useEffect } from 'react';
import { 
  Upload, Sparkles, ChevronRight, FileDown, Search, 
  Percent, TrendingUp, AlertTriangle, CheckCircle, RefreshCw, Copy, ExternalLink 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Lead {
  id: string;
  name: string;
  email: string | null;
  whatsapp: string | null;
  city: string | null;
  state: string | null;
  region: string | null;
  score: number | null;
  roomsCount: number | null;
  instagramFollowers: number | null;
  otaCommissionLost: number | null;
  hasWebsite: boolean;
  otaDependenceLevel: string | null;
  buyingBehavior: string | null;
  conversionProbability: number | null;
  objectKeywords: string | null;
  recommendedPitch: string | null;
  leadTier: string;
}

export function FishDashboardView() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isEnriching, setIsEnriching] = useState<string | null>(null);
  const [enrichAllLoading, setEnrichAllLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'HOT' | 'WARM' | 'WARM_LOW' | 'COLD' | 'DEAD'>('ALL');

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      setLeads(data.leads || []);
    } catch (err) {
      console.error('Error fetching leads for ZEHLA FISH:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Drag & Drop / File Input parser
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        if (!text) return;

        const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
        if (lines.length < 2) return alert('Planilha vazia ou sem cabeçalhos!');

        const headers = lines[0].split(/[,;]/).map(h => h.trim().toLowerCase());
        const leadsArray: any[] = [];

        for (let i = 1; i < lines.length; i++) {
          const columns = lines[i].split(/[,;]/).map(c => c.trim());
          if (columns.length < headers.length) continue;

          const leadObj: any = {};
          headers.forEach((header, index) => {
            leadObj[header] = columns[index] || '';
          });
          leadsArray.push(leadObj);
        }

        const res = await fetch('/api/fish/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leads: leadsArray }),
        });

        const data = await res.json();
        if (data.success) {
          alert(data.message);
          fetchLeads();
        } else {
          alert('Erro no upload: ' + data.error);
        }
      };
      reader.readAsText(file);
    } catch (err: any) {
      alert('Erro ao ler arquivo: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleEnrichLead = async (leadId: string) => {
    setIsEnriching(leadId);
    try {
      const res = await fetch('/api/fish/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadIds: [leadId] }),
      });
      const data = await res.json();
      if (data.success && data.successCount > 0) {
        // Recarregar os dados do lead enriquecido
        fetchLeads().then(() => {
          if (selectedLead?.id === leadId) {
            // Atualizar modal
            const updated = leads.find(l => l.id === leadId);
            if (updated) setSelectedLead(updated);
          }
        });
      }
    } catch (err) {
      console.error('Error enriching lead:', err);
    } finally {
      setIsEnriching(null);
    }
  };

  const handleEnrichAll = async () => {
    const prospects = leads.filter(l => !l.otaCommissionLost || l.otaCommissionLost === 0);
    if (prospects.length === 0) return alert('Todos os leads já foram enriquecidos.');

    setEnrichAllLoading(true);
    try {
      const leadIds = prospects.map(p => p.id);
      const res = await fetch('/api/fish/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadIds }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`${data.successCount} leads enriquecidos com sucesso!`);
        fetchLeads();
      }
    } catch (err) {
      console.error('Batch enrich failed:', err);
    } finally {
      setEnrichAllLoading(false);
    }
  };

  const downloadPdfDossier = (leadId: string, leadName: string) => {
    window.open(`/api/fish/report?leadId=${leadId}`, '_blank');
  };

  const handleCopyPitch = (pitch: string) => {
    navigator.clipboard.writeText(pitch);
    alert('Pitch de vendas copiado para a área de transferência!');
  };

  // Filtragem local
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.city && lead.city.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (activeFilter === 'ALL') return matchesSearch;
    return matchesSearch && lead.leadTier === activeFilter;
  });

  // Cálculos consolidados da base
  const totalCommissionLost = leads.reduce((acc, curr) => acc + (curr.otaCommissionLost || 0), 0);
  const hotLeadsCount = leads.filter(l => l.leadTier === 'HOT').length;
  const avgConversionProb = leads.length > 0 
    ? Math.round((leads.reduce((acc, curr) => acc + (curr.conversionProbability || 0), 0) / leads.length) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* HUD de ROI e Estatísticas Preditivas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp className="w-full h-full text-[#FF5500]" />
          </div>
          <div className="text-[10px] text-[#4d4d4d] mb-1 font-bold uppercase tracking-wider">Perda Anual Acumulada de Comissões OTA</div>
          <div className="text-2xl font-bold text-red-500">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(totalCommissionLost)}
          </div>
          <p className="text-[9px] text-[#4d4d4d] mt-1">Estimativa de vazamento financeiro de 22% dos leads planilhados.</p>
        </div>

        <div className="glass-card p-5 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 opacity-5 group-hover:opacity-10 transition-opacity">
            <Sparkles className="w-full h-full text-green-500" />
          </div>
          <div className="text-[10px] text-[#4d4d4d] mb-1 font-bold uppercase tracking-wider">Super Leads (Tier: HOT)</div>
          <div className="text-2xl font-bold text-green-400">{hotLeadsCount} Pousadas</div>
          <p className="text-[9px] text-[#4d4d4d] mt-1">Altíssimo índice de dor e dependência de canais Booking/Airbnb.</p>
        </div>

        <div className="glass-card p-5 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 opacity-5 group-hover:opacity-10 transition-opacity">
            <Percent className="w-full h-full text-[#FF5500]" />
          </div>
          <div className="text-[10px] text-[#4d4d4d] mb-1 font-bold uppercase tracking-wider">Probabilidade de Conversão Média</div>
          <div className="text-2xl font-bold text-purple-400">{avgConversionProb}%</div>
          <p className="text-[9px] text-[#4d4d4d] mt-1">Média do Swarm MiroFish sob personas e objeções previstas.</p>
        </div>
      </div>

      {/* Upload e Ações de Lote */}
      <div className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#FF5500]/10 border border-[#FF5500]/20">
            <Upload className="w-6 h-6 text-[#FF5500]" />
          </div>
          <div>
            <h3 className="font-bold text-[#efefef] text-sm">Importar Planilha de Leads (CSV)</h3>
            <p className="text-xs text-[#4d4d4d]">Nome, E-mail, Telefone, Cidade, Estado, Quartos</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="cursor-pointer glass-card hover:border-[#FF5500]/30 text-[#efefef] text-xs font-bold px-5 py-3 rounded-xl transition-all flex items-center gap-2">
            {isUploading ? <RefreshCw className="w-4 h-4 animate-spin text-[#FF5500]" /> : <Upload className="w-4 h-4 text-[#FF5500]" />}
            Selecionar Arquivo
            <input type="file" accept=".csv" onChange={handleFileUpload} disabled={isUploading} className="hidden" />
          </label>

          <button
            onClick={handleEnrichAll}
            disabled={enrichAllLoading || leads.length === 0}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-[#363636] disabled:text-[#4d4d4d] text-white text-xs font-bold px-5 py-3 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-purple-600/10">
            {enrichAllLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Enriquecer Base Inteira (MiroFish Swarm)
          </button>
        </div>
      </div>

      {/* Grid de Controle e Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabela de Leads Enriquecidos */}
        <div className="glass-card lg:col-span-2 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#2e2e2e] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white/[0.01]">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4d4d4d]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filtrar pousada ou cidade..."
                className="w-full bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl pl-10 pr-4 py-2 text-xs text-[#efefef] focus:border-[#FF5500]/50 outline-none transition-all placeholder:text-[#3e3e3e]"
              />
            </div>
            
            <div className="flex gap-1.5 overflow-x-auto pb-1 md:pb-0">
              {(['ALL', 'HOT', 'WARM', 'WARM_LOW', 'COLD', 'DEAD'] as const).map(filter => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`text-[9px] font-bold px-2.5 py-1.5 rounded-lg border transition-all uppercase ${
                    activeFilter === filter
                      ? 'bg-[#FF5500]/10 border-[#FF5500]/30 text-[#FF5500]'
                      : 'bg-transparent border-[#2e2e2e] text-[#4d4d4d] hover:text-[#b4b4b4]'
                  }`}>
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto zehla-scroll flex-1">
            {filteredLeads.map((lead) => {
              const hasEnrichment = lead.roomsCount && lead.roomsCount > 0;
              const isSelected = selectedLead?.id === lead.id;

              return (
                <div
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className={`px-5 py-4 flex items-center justify-between hover:bg-white/[0.02] cursor-pointer transition-colors ${
                    isSelected ? 'bg-white/[0.02] border-l-2 border-l-[#FF5500]' : ''
                  }`}>
                  
                  <div className="space-y-1 max-w-[60%]">
                    <div className="text-xs font-bold text-[#efefef] truncate">{lead.name}</div>
                    <div className="text-[10px] text-[#4d4d4d] flex items-center gap-1.5">
                      <span>{lead.city}, {lead.state}</span>
                      {hasEnrichment && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-[#3d3d3d]" />
                          <span>{lead.roomsCount} quartos</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {hasEnrichment ? (
                      <div className="text-right">
                        <div className="text-xs font-bold text-[#efefef]">{lead.score} pts</div>
                        <div className="text-[9px] text-[#4d4d4d]">
                          {lead.conversionProbability ? `${Math.round(lead.conversionProbability * 100)}% prob.` : ''}
                        </div>
                      </div>
                    ) : (
                      <span className="text-[10px] text-[#4d4d4d] italic">Aguardando OSINT</span>
                    )}

                    <Badge
                      className={`text-[8px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        lead.leadTier === 'HOT' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                        lead.leadTier === 'WARM' ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' :
                        lead.leadTier === 'WARM_LOW' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                        'bg-red-500/10 text-red-400 border-red-500/30'
                      }`}>
                      {lead.leadTier}
                    </Badge>

                    <ChevronRight className="w-4 h-4 text-[#3d3d3d]" />
                  </div>
                </div>
              );
            })}

            {filteredLeads.length === 0 && (
              <div className="p-12 text-center text-xs text-[#4d4d4d]">
                Nenhum lead encontrado com o filtro ativo.
              </div>
            )}
          </div>
        </div>

        {/* Ficha Diagnóstica e MiroFish Objeções */}
        <div className="glass-card p-6 flex flex-col justify-between space-y-6">
          {selectedLead ? (
            <div className="space-y-6 flex-1">
              <div>
                <Badge className="text-[9px] bg-purple-500/10 text-purple-400 border-purple-500/20 mb-2 uppercase font-bold">
                  ZEHLA FISH Diagnostic
                </Badge>
                <h3 className="text-base font-bold text-[#fafafa]">{selectedLead.name}</h3>
                <p className="text-xs text-[#4d4d4d]">{selectedLead.city} - {selectedLead.state}</p>
              </div>

              {/* Status do Enriquecimento */}
              {(!selectedLead.roomsCount || selectedLead.roomsCount === 0) ? (
                <div className="p-6 text-center rounded-2xl bg-white/[0.01] border border-white/5 space-y-4">
                  <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                  <div>
                    <h4 className="text-xs font-bold text-[#efefef]">Ainda não Enriquecido</h4>
                    <p className="text-[10px] text-[#4d4d4d] mt-1">Este lead necessita de varredura Sherlocker e simulação preditiva MiroFish.</p>
                  </div>
                  <button
                    onClick={() => handleEnrichLead(selectedLead.id)}
                    disabled={isEnriching === selectedLead.id}
                    className="w-full bg-[#FF5500] hover:bg-[#EA580C] disabled:bg-[#363636] text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-[#FF5500]/15 flex items-center justify-center gap-2">
                    {isEnriching === selectedLead.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Enriquecer Agora (Custo Zero)
                  </button>
                </div>
              ) : (
                <div className="space-y-5 animate-in fade-in duration-300">
                  {/* Grid de Detalhes Sherlocker */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/[0.01] border border-white/5 p-3 rounded-xl">
                      <div className="text-[9px] text-[#4d4d4d] font-bold">TAMANHO DA POUSADA</div>
                      <div className="text-sm font-bold text-[#efefef] mt-0.5">{selectedLead.roomsCount} Quartos</div>
                    </div>
                    <div className="bg-white/[0.01] border border-white/5 p-3 rounded-xl">
                      <div className="text-[9px] text-[#4d4d4d] font-bold">SEG. INSTAGRAM</div>
                      <div className="text-sm font-bold text-[#efefef] mt-0.5">
                        {new Intl.NumberFormat('pt-BR').format(selectedLead.instagramFollowers || 0)}
                      </div>
                    </div>
                    <div className="bg-white/[0.01] border border-white/5 p-3 rounded-xl">
                      <div className="text-[9px] text-[#4d4d4d] font-bold">DEPENDÊNCIA OTA</div>
                      <div className="text-sm font-bold text-amber-500 mt-0.5">{selectedLead.otaDependenceLevel}</div>
                    </div>
                    <div className="bg-white/[0.01] border border-white/5 p-3 rounded-xl">
                      <div className="text-[9px] text-[#4d4d4d] font-bold">COMPORTAMENTO</div>
                      <div className="text-sm font-bold text-purple-400 mt-0.5">{selectedLead.buyingBehavior}</div>
                    </div>
                  </div>

                  {/* Vazamento Financeiro de Comissão */}
                  <div className="p-4 rounded-xl bg-red-950/10 border border-red-500/20">
                    <div className="text-[9px] text-red-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Vazamento de Comissão Booking/Airbnb
                    </div>
                    <div className="text-lg font-bold text-red-500 mt-1">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedLead.otaCommissionLost || 0)} <span className="text-[10px] text-red-400">/ ano</span>
                    </div>
                    <p className="text-[9px] text-red-400/80 mt-1">Estimativa direta baseada no ADR de R$ 350,00 e 60% de ocupação.</p>
                  </div>

                  {/* Objeções do Swarm MiroFish */}
                  <div className="space-y-2">
                    <div className="text-[10px] text-[#4d4d4d] font-bold uppercase">Matriz de Objeções Previstas (500 Agentes)</div>
                    <div className="space-y-1.5">
                      {(() => {
                        try {
                          const obj = JSON.parse(selectedLead.objectKeywords || '{}');
                          return Object.entries(obj).map(([key, val]: any) => {
                            const pct = Math.round((val / 500) * 100);
                            return (
                              <div key={key} className="space-y-1">
                                <div className="flex justify-between text-[9px]">
                                  <span className="text-[#b4b4b4]">{key}</span>
                                  <span className="text-[#efefef] font-bold">{val} votos ({pct}%)</span>
                                </div>
                                <div className="h-1 bg-[#1e1e1e] rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${key === 'Sem Objeções' ? 'bg-green-500' : 'bg-purple-600'}`} 
                                    style={{ width: `${pct}%` }} 
                                  />
                                </div>
                              </div>
                            );
                          });
                        } catch {
                          return null;
                        }
                      })()}
                    </div>
                  </div>

                  {/* Pitch Recomendado */}
                  {selectedLead.recommendedPitch && (
                    <div className="space-y-2 border-t border-[#2e2e2e] pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-[#4d4d4d] font-bold uppercase">Roteiro de Vendas Recomendado</span>
                        <button
                          onClick={() => handleCopyPitch(selectedLead.recommendedPitch || '')}
                          className="text-[9px] text-[#FF5500] hover:underline flex items-center gap-1">
                          <Copy className="w-3 h-3" /> Copiar Pitch
                        </button>
                      </div>
                      <div className="p-3 bg-[#FF5500]/5 border border-[#FF5500]/10 rounded-xl max-h-[150px] overflow-y-auto zehla-scroll">
                        <p className="text-[10px] text-[#b4b4b4] leading-relaxed whitespace-pre-line">{selectedLead.recommendedPitch}</p>
                      </div>
                    </div>
                  )}

                  {/* Ações Secundárias */}
                  <div className="flex gap-2.5 pt-4">
                    <button
                      onClick={() => handleEnrichLead(selectedLead.id)}
                      disabled={isEnriching === selectedLead.id}
                      className="flex-1 glass-card hover:border-[#FF5500]/30 hover:bg-[#FF5500]/5 text-[#efefef] text-[10px] font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                      {isEnriching === selectedLead.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                      Recalcular Swarm
                    </button>
                    
                    <button
                      onClick={() => downloadPdfDossier(selectedLead.id, selectedLead.name)}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-600/10">
                      <FileDown className="w-3 h-3" />
                      Baixar Dossier PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3">
              <Sparkles className="w-12 h-12 text-[#3d3d3d]" />
              <div>
                <h4 className="text-xs font-bold text-[#efefef]">Nenhum Lead Selecionado</h4>
                <p className="text-[10px] text-[#4d4d4d] mt-1 max-w-[200px]">Clique em um lead da planilha ZEHLA FISH para visualizar seu diagnóstico profundo.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
