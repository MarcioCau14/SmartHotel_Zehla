'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowUpDown, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { type Lead, type LeadStatus } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';

interface DisplayLead {
  id: string;
  empresa: string;
  decisor: string;
  cargo: string;
  email: string;
  whatsapp: string;
  porte: 'pequeno' | 'médio' | 'grande' | 'luxo';
  score: number;
  status: LeadStatus;
  targetId?: string;
  idpScore: number;
  receitaAtual: number;
  receitaPotencial: number;
  diariaMedia: number;
  ocupacaoMedia: number;
  gapPercent: number;
  auditText: string;
  whatsappScript: string;
}

interface LeadsTableProps {
  filterTargetId: string | null;
  selectedLeadIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  onDiagnoseLead: (lead: Lead) => void;
}

type StatusFilter = 'all' | LeadStatus;

const statusConfig: Record<LeadStatus, { label: string; className: string }> = {
  pending: { label: 'Pendente', className: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
  verified: { label: 'Verificado', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
  contacted: { label: 'Contatado', className: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20' },
  converted: { label: 'Convertido', className: 'bg-violet-500/15 text-violet-400 border-violet-500/20' },
  inactive: { label: 'Inativo', className: 'bg-white/10 text-white/40 border-white/10' },
};

const statusTabs: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendentes' },
  { value: 'verified', label: 'Verificados' },
  { value: 'contacted', label: 'Contatados' },
  { value: 'converted', label: 'Convertidos' },
];

const porteLabels: Record<Lead['porte'], string> = {
  pequeno: 'Pequeno',
  médio: 'Médio',
  grande: 'Grande',
  luxo: 'Luxo',
};

const porteColors: Record<Lead['porte'], string> = {
  pequeno: 'text-white/50',
  médio: 'text-emerald-400',
  grande: 'text-amber-400',
  luxo: 'text-violet-400',
};

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 85 ? 'from-emerald-500 to-emerald-400' :
    score >= 70 ? 'from-amber-500 to-amber-400' :
    score >= 50 ? 'from-orange-500 to-orange-400' :
    'from-red-500 to-red-400';

  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs font-mono text-white/60 w-8 text-right">{score}</span>
    </div>
  );
}

type SortField = 'score' | 'empresa' | 'decisor';
type SortDir = 'asc' | 'desc';

export function LeadsTable({ filterTargetId, selectedLeadIds, onSelectionChange, onDiagnoseLead }: LeadsTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [minScore, setMinScore] = useState(0);
  const [sortField, setSortField] = useState<SortField>('score');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // Fetch real leads from API
  const { data: rawLeads = [], isLoading } = useQuery({
    queryKey: ['zcc-leads', filterTargetId],
    queryFn: async () => {
      const url = filterTargetId
        ? `/api/leads?limit=100&targetId=${filterTargetId}`
        : `/api/leads?limit=100`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch leads');
      const json = await res.json();
      return json.data || [];
    }
  });

  // Map, filter, and sort leads in a single memo to avoid Next.js compiler memoization issues
  const filteredLeads: DisplayLead[] = useMemo(() => {
    // Step 1: Map database leads to component types safely
    const mapped = rawLeads.map((l: any): DisplayLead => {
      // Parse metadata if present
      let meta: any = {};
      try {
        if (l.metadata) {
          meta = typeof l.metadata === 'string' ? JSON.parse(l.metadata) : l.metadata;
        }
      } catch (e) {
        console.error('Error parsing lead metadata:', e);
      }

      const score = l.score || Math.round(l.validationScore) || 70;
      const porte = l.porte || 'pequeno';
      const rooms = l.roomsCount || meta.rooms || (porte === 'luxo' ? 15 : porte === 'grande' ? 30 : porte === 'médio' ? 18 : 8);
      const diariaMedia = meta.adr || (porte === 'luxo' ? 650 : porte === 'grande' ? 450 : porte === 'médio' ? 280 : 180);
      const ocupacaoMedia = Math.round(45 + (score % 20));

      const receitaAtual = l.receitaAtual || Math.round(rooms * diariaMedia * (ocupacaoMedia / 100) * 365);
      const receitaPotencial = l.receitaPotencial || Math.round(receitaAtual * (1 + (100 - score) / 150));
      const gapPercent = l.gapPercent || Math.round(((receitaPotencial - receitaAtual) / (receitaPotencial || 1)) * 100);

      return {
        id: l.id,
        empresa: l.empresa || l.name || 'Pousada Sem Nome',
        decisor: l.decisor || 'Responsável',
        cargo: l.cargo || 'Proprietário',
        email: l.email || '',
        whatsapp: l.whatsapp || l.phone || '',
        porte: porte as 'pequeno' | 'médio' | 'grande' | 'luxo',
        score,
        status: (l.status || 'pending') as LeadStatus,
        targetId: l.targetId,
        idpScore: score,
        receitaAtual,
        receitaPotencial,
        diariaMedia,
        ocupacaoMedia,
        gapPercent,
        auditText: l.observacoes || l.painPoints || `Estabelecimento com ${rooms} quartos em ${l.city || meta.city || 'SC'}. Apresenta dependência de OTAs tradicionais e oportunidades para otimização de canais diretos de reservas e pricing dinâmico.`,
        whatsappScript: l.hook || `Olá ${l.decisor || 'Responsável'}! Analisamos a presença digital da ${l.empresa || 'sua pousada'} e identificamos oportunidades de otimização de vendas diretas. Podemos agendar uma conversa de 5 minutos?`
      };
    });

    // Step 2: Apply filters
    let result = mapped;

    if (filterTargetId) {
      result = result.filter((l: DisplayLead) => l.targetId === filterTargetId);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((l: DisplayLead) =>
        l.empresa.toLowerCase().includes(q) ||
        l.decisor.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.whatsapp.includes(q)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((l: DisplayLead) => l.status === statusFilter);
    }

    if (minScore > 0) {
      result = result.filter((l: DisplayLead) => l.score >= minScore);
    }

    // Step 3: Sort
    result.sort((a: DisplayLead, b: DisplayLead) => {
      let cmp = 0;
      if (sortField === 'score') cmp = a.score - b.score;
      else if (sortField === 'empresa') cmp = a.empresa.localeCompare(b.empresa);
      else if (sortField === 'decisor') cmp = a.decisor.localeCompare(b.decisor);
      return sortDir === 'desc' ? -cmp : cmp;
    });

    return result;
  }, [rawLeads, filterTargetId, search, statusFilter, minScore, sortField, sortDir]);

  const allVisibleIds = useMemo(
    () => new Set(filteredLeads.map(l => l.id)),
    [filteredLeads]
  );

  const allSelected = filteredLeads.length > 0 && filteredLeads.every(l => selectedLeadIds.has(l.id));
  const someSelected = !allSelected && filteredLeads.some(l => selectedLeadIds.has(l.id));

  const toggleAll = () => {
    if (allSelected) {
      onSelectionChange(new Set([...selectedLeadIds].filter(id => !allVisibleIds.has(id))));
    } else {
      onSelectionChange(new Set([...selectedLeadIds, ...allVisibleIds]));
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selectedLeadIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange(next);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const renderSortIcon = (field: SortField) => (
    <ArrowUpDown className={`w-3 h-3 ml-1 inline ${sortField === field ? 'text-emerald-400' : 'text-white/20'}`} />
  );

  return (
    <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-semibold text-white/90">Leads</span>
          <span className="text-[10px] font-mono text-white/30 bg-white/5 px-1.5 py-0.5 rounded">
            {filteredLeads.length}
          </span>
        </div>

        <div className="flex-1" />
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar empresa, decisor, email..."
            className="pl-8 h-8 bg-white/5 border-white/10 text-xs text-white placeholder:text-white/25 focus:border-emerald-500/50"
          />
        </div>
      </div>

      <div className="px-4 py-2 border-b border-white/10 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex gap-1 overflow-x-auto zehla-scroll-x">
          {statusTabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 text-[11px] font-medium rounded-md whitespace-nowrap transition-all ${
                statusFilter === tab.value
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                  : 'text-white/40 hover:text-white/60 hover:bg-white/5 border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 ml-auto shrink-0">
          <span className="text-[10px] text-white/30 font-mono">Score mín: {minScore}</span>
          <Slider
            value={[minScore]}
            onValueChange={([v]) => setMinScore(v)}
            min={0}
            max={100}
            step={5}
            className="w-24"
          />
        </div>
      </div>

      <div className="overflow-x-auto zehla-scroll-x">
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="w-10 px-3">
                <Checkbox
                  checked={allSelected}
                  ref={el => {
                    if (el) {
                      (el as unknown as HTMLInputElement).indeterminate = someSelected;
                    }
                  }}
                  onCheckedChange={toggleAll}
                  className="border-white/20 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                />
              </TableHead>
              <TableHead className="text-[10px] uppercase text-white/40 font-semibold px-3 py-2.5">
                <button className="flex items-center gap-0.5" onClick={() => handleSort('empresa')}>
                  Empresa {renderSortIcon('empresa')}
                </button>
              </TableHead>
              <TableHead className="text-[10px] uppercase text-white/40 font-semibold px-3 py-2.5 hidden md:table-cell">
                <button className="flex items-center gap-0.5" onClick={() => handleSort('decisor')}>
                  Decisor {renderSortIcon('decisor')}
                </button>
              </TableHead>
              <TableHead className="text-[10px] uppercase text-white/40 font-semibold px-3 py-2.5 hidden lg:table-cell">Cargo</TableHead>
              <TableHead className="text-[10px] uppercase text-white/40 font-semibold px-3 py-2.5 hidden xl:table-cell">Email</TableHead>
              <TableHead className="text-[10px] uppercase text-white/40 font-semibold px-3 py-2.5 hidden xl:table-cell">WhatsApp</TableHead>
              <TableHead className="text-[10px] uppercase text-white/40 font-semibold px-3 py-2.5 hidden sm:table-cell">Porte</TableHead>
              <TableHead className="text-[10px] uppercase text-white/40 font-semibold px-3 py-2.5 min-w-[120px]">
                <button className="flex items-center gap-0.5" onClick={() => handleSort('score')}>
                  Score {renderSortIcon('score')}
                </button>
              </TableHead>
              <TableHead className="text-[10px] uppercase text-white/40 font-semibold px-3 py-2.5">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableCell colSpan={9} className="text-center py-10 text-white/30 text-sm">
                  Carregando leads do banco de dados...
                </TableCell>
              </TableRow>
            ) : filteredLeads.length === 0 ? (
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableCell colSpan={9} className="text-center py-10 text-white/30 text-sm">
                  Nenhum lead encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map((lead: DisplayLead, idx) => {

                const status = statusConfig[lead.status];
                return (
                  <motion.tr
                    key={lead.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                    onClick={() => onDiagnoseLead(lead as unknown as Lead)}
                  >
                    <TableCell className="px-3 py-2.5" onClick={e => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedLeadIds.has(lead.id)}
                        onCheckedChange={() => toggleOne(lead.id)}
                        className="border-white/20 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                      />
                    </TableCell>
                    <TableCell className="px-3 py-2.5">
                      <div className="text-xs font-medium text-white/90">{lead.empresa}</div>
                    </TableCell>
                    <TableCell className="px-3 py-2.5 hidden md:table-cell">
                      <span className="text-xs text-white/70">{lead.decisor}</span>
                    </TableCell>
                    <TableCell className="px-3 py-2.5 hidden lg:table-cell">
                      <span className="text-xs text-white/50">{lead.cargo}</span>
                    </TableCell>
                    <TableCell className="px-3 py-2.5 hidden xl:table-cell">
                      <span className="text-xs text-white/40 font-mono">{lead.email}</span>
                    </TableCell>
                    <TableCell className="px-3 py-2.5 hidden xl:table-cell">
                      <span className="text-xs text-white/40 font-mono">{lead.whatsapp}</span>
                    </TableCell>
                    <TableCell className="px-3 py-2.5 hidden sm:table-cell">
                      <span className={`text-xs font-medium ${porteColors[lead.porte]}`}>
                        {porteLabels[lead.porte]}
                      </span>
                    </TableCell>
                    <TableCell className="px-3 py-2.5">
                      <ScoreBar score={lead.score} />
                    </TableCell>
                    <TableCell className="px-3 py-2.5" onClick={e => e.stopPropagation()}>
                      <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 border ${status.className}`}>
                        {status.label}
                      </Badge>
                    </TableCell>
                  </motion.tr>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}