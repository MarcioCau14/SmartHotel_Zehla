'use client';

import { useState, useEffect } from 'react';
import { Search, Star, MapPin, Building2, Phone, Mail, TrendingUp, Sparkles, Loader2 } from 'lucide-react';
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

export function MarketingLeads() {
  const [leads, setLeads] = useState<B2BLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterState, setFilterState] = useState<string>('');

  // AI Strategy state
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

  return (
    <div className="space-y-6">
      {/* AI Strategy Generator */}
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
            placeholder="Ex: Quero atrair mais hóspedes durante a baixa temporada em Jericoacoara. Tenho 10 quartos e quero focar em casais..."
            className="bg-[#242424] border-[#363636] text-sm min-h-[80px] resize-none placeholder:text-[#363636] overflow-y-auto zehla-scroll"
          />
          <div className="flex items-center gap-3">
            <Button
              onClick={generateStrategy}
              disabled={isGenerating || !strategyPrompt.trim()}
              size="sm"
              className="bg-purple-500/20 hover:bg-purple-500/30 text-[#FF5500] border border-[#FF5500]/30 text-xs"
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

      {/* Search and filters */}
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

      {/* Lead cards */}
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

              {/* Pain points */}
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
  );
}
