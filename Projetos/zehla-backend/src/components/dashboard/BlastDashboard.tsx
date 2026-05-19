import {
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useState, useEffect, useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';


'use client';

  Zap, Megaphone, Users, Smartphone, Plus, Search,
  Play, Pause, Trash2, CheckCircle2, Clock, MessageSquare,
  ExternalLink, QrCode, RefreshCw, Loader2, AlertCircle, TrendingUp } from
'lucide-react';

export function BlastPanel() : void {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [instances, setInstances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'campaigns' | 'instances' | 'contacts'>('campaigns');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [campRes, instRes] = await Promise.all([
      fetch('/api/blast/campaigns'),
      fetch('/api/blast/instances')]
      );
      const [campData, instData] = await Promise.all([campRes.json(), instRes.json()]);
      setCampaigns(campData || []);
      setInstances(instData || []);
    } catch (error) {
      console.error('Error fetching blast data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLaunch = async (id: string) => {
    try {
      const res = await fetch(`/api/blast/campaigns/${id}/launch`, { method: 'POST' });
      if (res.ok) {
        toast.success('Campanha disparada com sucesso!');
        fetchData();
      } else {
        const err = await res.json();
        toast.error(`Erro: ${err.error}`);
      }
    } catch (error) {
      toast.error('Erro de conexão');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#fafafa] flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-[#FF5500]" />
            ZEHLA Blast — Envio em Massa
          </h2>
          <p className="text-xs text-[#4d4d4d] font-medium">WhatsApp Marketing integrado ao ZEHLA Brain.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" className="bg-white/5 border-white/10 text-white text-xs h-9" onClick={fetchData}>
            <RefreshCw className={`w-3.5 h-3.5 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Sincronizar
          </Button>
          <Button size="sm" className="bg-[#FF5500] hover:bg-[#EA580C] text-white text-xs h-9">
            <Plus className="w-3.5 h-3.5 mr-2" />
            Nova Campanha
          </Button>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 p-1 bg-[#1a1a1a] rounded-xl w-fit border border-white/5">
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'campaigns' ? 'bg-[#FF5500] text-white shadow-lg' : 'text-[#4d4d4d] hover:text-[#b4b4b4]'}`}>
          
          Campanhas
        </button>
        <button
          onClick={() => setActiveTab('instances')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'instances' ? 'bg-[#FF5500] text-white shadow-lg' : 'text-[#4d4d4d] hover:text-[#b4b4b4]'}`}>
          
          Instâncias (WA)
        </button>
        <button
          onClick={() => setActiveTab('contacts')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'contacts' ? 'bg-[#FF5500] text-white shadow-lg' : 'text-[#4d4d4d] hover:text-[#b4b4b4]'}`}>
          
          Lista de Contatos
        </button>
      </div>

      {activeTab === 'campaigns' &&
      <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="glass-card p-4">
              <div className="text-[10px] text-[#4d4d4d] uppercase font-bold mb-1">Total Enviadas</div>
              <div className="text-2xl font-bold text-[#fafafa] font-mono">
                {useMemo(() => campaigns.reduce((acc, c) => acc + c.sentCount, 0), [])}
              </div>
            </div>
            <div className="glass-card p-4">
              <div className="text-[10px] text-[#4d4d4d] uppercase font-bold mb-1">Taxa de Resposta</div>
              <div className="text-2xl font-bold text-[#FF5500] font-mono">
                {campaigns.length > 0 ? (useMemo(() => campaigns.reduce((acc, c) => acc + c.repliedCount, 0), []) / useMemo(() => campaigns.reduce((acc, c) => acc + c.sentCount || 1, 0), []) * 100).toFixed(1) : 0}%
              </div>
            </div>
            <div className="glass-card p-4">
              <div className="text-[10px] text-[#4d4d4d] uppercase font-bold mb-1">Opt-Out (Automático)</div>
              <div className="text-2xl font-bold text-rose-500 font-mono">
                {useMemo(() => campaigns.reduce((acc, c) => acc + (c.optOutCount || 0), 0), [])}
              </div>
            </div>
            <div className="glass-card p-4">
              <div className="text-[10px] text-[#4d4d4d] uppercase font-bold mb-1">Ganhos de Score (Brain)</div>
              <div className="text-2xl font-bold text-green-400 font-mono">
                +{useMemo(() => campaigns.reduce((acc, c) => acc + c.repliedCount * 30 - useMemo(() => campaigns.reduce((acc, c) => acc + (c.optOutCount || 0), 0), []) * 50, 0), [])} pts
              </div>
            </div>
          </div>

          <div className="glass-card overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-[#2e2e2e] bg-white/[0.01]">
                  <th className="px-6 py-4 text-xs font-bold text-[#4d4d4d] uppercase tracking-wider">Campanha</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#4d4d4d] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#4d4d4d] uppercase tracking-wider">Progresso</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#4d4d4d] uppercase tracking-wider text-center">Engajamento</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#4d4d4d] uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {campaigns.map((camp) =>
              <tr key={camp.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-[#efefef]">{camp.name}</div>
                      <div className="text-[10px] text-[#4d4d4d] mt-0.5">{camp.contactGroup} • {new Date(camp.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={`text-[9px] uppercase font-bold ${
                  camp.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                  camp.status === 'draft' ? 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' :
                  'bg-[#FF5500]/10 text-[#FF5500] border-[#FF5500]/20'}`
                  }>
                        {camp.status === 'draft' ? 'Rascunho' : camp.status === 'active' ? 'Ativa' : camp.status === 'completed' ? 'Concluída' : camp.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-32 space-y-1.5">
                        <div className="flex justify-between text-[9px] font-mono text-[#4d4d4d]">
                          <span>{camp.sentCount} / {camp.totalContacts}</span>
                          <span>{Math.round(camp.sentCount / (camp.totalContacts || 1) * 100)}%</span>
                        </div>
                        <div className="h-1 bg-[#242424] rounded-full overflow-hidden">
                          <div
                        className="h-full bg-[#FF5500] transition-all duration-500"
                        style={{ width: `${camp.sentCount / (camp.totalContacts || 1) * 100}%` }} />
                      
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-4">
                        <div className="text-center">
                          <div className="text-[10px] text-[#4d4d4d] uppercase font-bold">Lido</div>
                          <div className="text-xs text-[#efefef] font-mono">{camp.readCount}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-[10px] text-[#4d4d4d] uppercase font-bold">Resp.</div>
                          <div className="text-xs text-[#FF5500] font-mono">{camp.repliedCount}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-[10px] text-rose-500/50 uppercase font-bold">Sair</div>
                          <div className="text-xs text-rose-500 font-mono">{camp.optOutCount || 0}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {camp.status === 'draft' ?
                  <Button
                    onClick={() => handleLaunch(camp.id)}
                    size="sm"
                    className="h-8 bg-[#FF5500] hover:bg-[#EA580C] text-white text-[10px] font-bold px-4">
                    
                          <Play className="w-3 h-3 mr-2" />
                          Lançar
                        </Button> :

                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 hover:bg-white/5 rounded-lg text-[#4d4d4d] hover:text-[#efefef] transition-colors">
                            <Pause className="w-4 h-4" />
                          </button>
                          <button className="p-2 hover:bg-white/5 rounded-lg text-[#4d4d4d] hover:text-red-400 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                  }
                    </td>
                  </tr>
              )}
                {campaigns.length === 0 && !loading &&
              <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <Megaphone className="w-12 h-12 text-[#1a1a1a] mx-auto mb-4" />
                      <p className="text-[#4d4d4d] text-sm">Nenhuma campanha criada ainda.</p>
                      <Button variant="link" className="text-[#FF5500] text-xs font-bold mt-2">
                        Clique aqui para criar sua primeira campanha.
                      </Button>
                    </td>
                  </tr>
              }
              </tbody>
            </table>
          </div>
        </div>
      }

      {activeTab === 'instances' &&
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {instances.map((inst) =>
        <div key={inst.id} className="glass-card p-6 flex flex-col gap-4 border-l-2 border-l-[#FF5500]/50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3">
                 <Badge variant="outline" className={`text-[9px] uppercase font-bold ${
            inst.status === 'connected' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`
            }>
                    {inst.status === 'connected' ? 'Conectado' : inst.status === 'disconnected' ? 'Desconectado' : inst.status === 'banned' ? 'Banido' : inst.status}
                 </Badge>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FF5500]/10 flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-[#FF5500]" />
                </div>
                <div>
                  <h4 className="font-bold text-[#efefef]">{inst.name}</h4>
                  <p className="text-xs text-[#4d4d4d]">+{inst.phone}</p>
                </div>
              </div>

              <div className="space-y-3 py-2 border-y border-white/5">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-[#4d4d4d]">Aquecimento (Warmup)</span>
                  <span className="text-[#efefef] font-bold">Fase {inst.warmupStage}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-[#4d4d4d]">Limite Diário</span>
                  <span className="text-[#efefef] font-bold">{inst.sentToday} / {inst.dailyLimit} msgs</span>
                </div>
              </div>

              <div className="flex gap-2 mt-2">
                {inst.status === 'disconnected' ?
            <Button className="flex-1 bg-[#FF5500] hover:bg-[#EA580C] text-white text-xs h-9 font-bold">
                    <QrCode className="w-3.5 h-3.5 mr-2" />
                    Gerar QR Code
                  </Button> :

            <Button variant="outline" className="flex-1 border-white/10 text-[#efefef] hover:bg-white/5 text-xs h-9 font-bold">
                    Configurações
                  </Button>
            }
              </div>
            </div>
        )}
          
          <button className="glass-card p-6 flex flex-col items-center justify-center gap-3 border-dashed hover:border-[#FF5500]/30 transition-all group min-h-[220px]">
             <div className="w-12 h-12 rounded-2xl bg-white/5 group-hover:bg-[#FF5500]/10 flex items-center justify-center transition-all">
                <Plus className="w-6 h-6 text-[#4d4d4d] group-hover:text-[#FF5500]" />
             </div>
             <div className="text-center">
                <div className="text-sm font-bold text-[#efefef]">Adicionar Instância</div>
                <p className="text-[10px] text-[#4d4d4d]">Conectar novo número WhatsApp</p>
             </div>
          </button>
        </div>
      }
    </div>);

}