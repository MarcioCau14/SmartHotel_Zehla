'use client';

import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, CheckSquare, FileSpreadsheet, Download, Linkedin, Instagram, Twitter, ShieldCheck, Zap } from 'lucide-react';
import { toast } from 'sonner';
import type { Lead } from '@/lib/leads-types';
import { mockLeads } from '@/lib/mock-data';
import { RevenueReportElite } from './RevenueReportElite';

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  verified: { label: 'Verificado', color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
  pending: { label: 'Pendente', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
  invalid: { label: 'Inválido', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' },
};

const ROW_V = {
  hidden: { opacity: 0, x: 10 },
  visible: (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.05, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

/* ============================================
   COMPONENTE
   ============================================ */
interface LeadsTableProps {
  leads?: Lead[];
  selectedLeads: string[];
  onToggle: (email: string) => void;
  onSelectAll: (emails: string[]) => void;
  filterCompany: string | null;
  filterStatus: string | null;
  minScore: number;
}

export function LeadsTable({
  leads: rawLeads = mockLeads,
  selectedLeads,
  onToggle,
  onSelectAll,
  filterCompany,
  filterStatus,
  minScore,
}: LeadsTableProps) {
  const [selectedRMLead, setSelectedRMLead] = useState<Lead | null>(null);
  let leads = rawLeads;
  
  if (filterCompany) {
    leads = leads.filter(l => l.empresa.toLowerCase() === filterCompany.toLowerCase());
  }
  
  if (filterStatus) {
    leads = leads.filter(l => l.status === filterStatus);
  }
  
  if (minScore > 0) {
    leads = leads.filter(l => (l.validation_score || 0) >= minScore / 100);
  }

  const allEmails = leads.map((l) => l.email);
  const allSelected = allEmails.length > 0 && allEmails.every((e) => selectedLeads.includes(e));

  const handleExport = useCallback(async (format: 'xlsx' | 'csv') => {
    const toExport = selectedLeads.length > 0
      ? leads.filter((l) => selectedLeads.includes(l.email))
      : leads;
    if (toExport.length === 0) { toast.error('Nenhum lead para exportar'); return; }
    try {
      const res = await fetch('/api/export/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads: toExport, format }),
      });
      if (!res.ok) throw new Error('Erro ao gerar planilha');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `secretaria_leads_${new Date().toISOString().slice(0, 10)}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success(`Exportados ${toExport.length} lead${toExport.length > 1 ? 's' : ''}`, { duration: 4000 });
    } catch {
      toast.error('Falha ao exportar', { description: 'Tente novamente.' });
    }
  }, [selectedLeads, leads]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55, duration: 0.5 }}
      className="glass-card p-5 lg:p-6 flex flex-col"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#f59e0b10] border border-[#f59e0b20]">
            <Users size={18} className="text-[#f59e0b]" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-[#f1f5f9]">Leads Management</h2>
            <p className="text-xs text-[#64748b]">{leads.length} decisores rastreados</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5"
            style={{
              color: selectedLeads.length > 0 ? '#4169E1' : '#64748b',
              backgroundColor: selectedLeads.length > 0 ? 'rgba(65,105,225,0.1)' : 'rgba(100,116,139,0.1)',
              border: `1px solid ${selectedLeads.length > 0 ? 'rgba(65,105,225,0.2)' : 'rgba(100,116,139,0.15)'}`,
            }}
          >
            <CheckSquare size={10} />
            {selectedLeads.length} selecionados
          </span>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => handleExport('xlsx')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#14b8a6] bg-[rgba(20,184,166,0.08)] border border-[rgba(20,184,166,0.2)] hover:bg-[rgba(20,184,166,0.15)] transition-all duration-200"
          >
            <FileSpreadsheet size={14} /><span className="hidden sm:inline">Excel</span>
          </motion.button>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => handleExport('csv')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#94a3b8] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.08)] transition-all duration-200"
          >
            <Download size={14} /><span className="hidden sm:inline">CSV</span>
          </motion.button>
        </div>
      </div>

      {/* Column labels */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className="text-[10px] font-medium text-[#64748b] uppercase tracking-widest">Colunas:</span>
        <div className="flex flex-wrap gap-1">
          {['Empresa', 'Decisor', 'Cargo', 'E-mail', 'WhatsApp', 'Setor', 'Social_Media', 'Porte', 'Status', 'Hook'].map((col) => (
            <span key={col} className="text-[9px] px-1.5 py-0.5 rounded-md bg-[rgba(65,105,225,0.06)] text-[#4169E1] border border-[rgba(65,105,225,0.12)]">{col}</span>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto max-h-[420px] overflow-y-auto rounded-xl border border-[rgba(255,255,255,0.05)]">
        <Table className="table-dark">
          <TableHeader>
            <TableRow className="border-b-[rgba(255,255,255,0.08)] hover:bg-transparent">
              <TableHead className="w-10">
                <Checkbox checked={allSelected} onCheckedChange={() => onSelectAll(allEmails)} className="data-[state=checked]:bg-[#4169E1] data-[state=checked]:border-[#4169E1]" />
              </TableHead>
              <TableHead className="text-[#64748b] min-w-[140px]">Decisor</TableHead>
              <TableHead className="text-[#64748b] min-w-[110px]">Empresa</TableHead>
              <TableHead className="text-[#64748b] min-w-[160px]">Cargo</TableHead>
              <TableHead className="text-[#64748b] min-w-[180px]">E-mail</TableHead>
              <TableHead className="text-[#64748b] min-w-[130px]">WhatsApp</TableHead>
              <TableHead className="text-[#64748b] min-w-[100px]">OSINT Score</TableHead>
              <TableHead className="text-[#64748b] min-w-[100px]">Social</TableHead>
              <TableHead className="text-[#64748b] min-w-[80px]">Status</TableHead>
              <TableHead className="text-[#64748b]">Catalisador de Abordagem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead, idx) => {
              const cfg = STATUS_CFG[lead.status] || STATUS_CFG.pending;
              return (
                <motion.tr key={lead.email} custom={idx} initial="hidden" animate="visible" variants={ROW_V}
                  className="border-b-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.03)] transition-colors cursor-pointer group"
                >
                  <TableCell>
                    <Checkbox checked={selectedLeads.includes(lead.email)} onCheckedChange={() => onToggle(lead.email)} className="data-[state=checked]:bg-[#4169E1] data-[state=checked]:border-[#4169E1]" />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-[#f1f5f9]">{lead.decisor}</span>
                      <span className="text-[10px] text-[#64748b] group-hover:text-[#94a3b8] transition-colors">{lead.setor}</span>
                    </div>
                  </TableCell>
                  <TableCell><span className="text-sm text-[#94a3b8] font-medium">{lead.empresa}</span></TableCell>
                  <TableCell><span className="text-xs text-[#64748b]">{lead.cargo}</span></TableCell>
                  <TableCell><span className="text-xs font-mono text-[#64748b]">{lead.email}</span></TableCell>
                  <TableCell><span className="text-xs font-mono text-[#14b8a6]">{lead.whatsapp}</span></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <div className="w-12 h-1.5 rounded-full bg-[rgba(255,255,255,0.05)] overflow-hidden">
                        <div 
                          className="h-full bg-[#4169E1]" 
                          style={{ width: `${(lead.validation_score || 0) * 100}%` }} 
                        />
                      </div>
                      <span className="text-[10px] font-bold text-[#f1f5f9]">
                        {Math.round((lead.validation_score || 0) * 100)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {lead.social_footprint?.linkedin && (
                        <a href={lead.social_footprint.linkedin} target="_blank" rel="noreferrer">
                          <Linkedin size={14} className="text-[#64748b] hover:text-[#0077b5] transition-colors" />
                        </a>
                      )}
                      {lead.social_footprint?.instagram && (
                        <a href={lead.social_footprint.instagram} target="_blank" rel="noreferrer">
                          <Instagram size={14} className="text-[#64748b] hover:text-[#e4405f] transition-colors" />
                        </a>
                      )}
                      {lead.social_footprint?.x && (
                        <a href={lead.social_footprint.x} target="_blank" rel="noreferrer">
                          <Twitter size={14} className="text-[#64748b] hover:text-white transition-colors" />
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-md" style={{ color: cfg.color, backgroundColor: cfg.bg, border: `1px solid ${cfg.border}` }}>
                      {cfg.label}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-[250px]">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-col gap-1 flex-1">
                        <span className="text-[10px] font-bold text-[#4169E1] uppercase tracking-wider">Catalisador:</span>
                        <span className="text-xs text-[#94a3b8] leading-relaxed italic" title={lead.hook}>
                          "{lead.hook.length > 80 ? `${lead.hook.slice(0, 80)}...` : lead.hook}"
                        </span>
                      </div>
                      {lead.rm_data && (
                        <motion.button
                          whileHover={{ scale: 1.1, backgroundColor: 'rgba(43,148,183,0.1)' }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRMLead(lead);
                          }}
                          className="p-2 rounded-lg border border-[#2b94b7]/30 text-[#2b94b7] flex flex-col items-center gap-0.5"
                          title="Ver Diagnóstico Elite RM"
                        >
                          <Zap size={14} fill="#2b94b7" />
                          <span className="text-[8px] font-black uppercase">Raio-X</span>
                        </motion.button>
                      )}
                    </div>
                  </TableCell>
                </motion.tr>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <AnimatePresence>
        {selectedRMLead && selectedRMLead.rm_data && (
          <RevenueReportElite 
            isOpen={!!selectedRMLead}
            onClose={() => setSelectedRMLead(null)}
            lead={{
              pousada: selectedRMLead.empresa,
              idp: selectedRMLead.rm_data.idp,
              gap: selectedRMLead.rm_data.gap,
              diagnostico: selectedRMLead.rm_data.diagnostico,
              pitch: selectedRMLead.rm_data.pitch,
              preco: selectedRMLead.rm_data.preco_base || 'N/A'
            }}
          />
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="mt-3 px-1 flex items-center justify-between">
        <span className="text-[10px] text-[#475569]">
          {selectedLeads.length > 0 ? `${selectedLeads.length} lead${selectedLeads.length > 1 ? 's' : ''} selecionado${selectedLeads.length > 1 ? 's' : ''} para exportar` : 'Clique nos botões acima para exportar todos'}
        </span>
        <span className="text-[10px] text-[#475569]">Formato: .xlsx (Google Sheets compatible)</span>
      </div>
    </motion.div>
  );
}
