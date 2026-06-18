'use client';

import { motion } from 'framer-motion';
import { Target, ChevronRight } from 'lucide-react';

interface TargetCompany {
  name: string;
  domain: string;
  status: 'active' | 'pending' | 'inactive';
}

const DEFAULT_TARGETS: TargetCompany[] = [
  { name: 'Osklen', domain: 'osklen.com.br', status: 'active' },
  { name: 'Renner', domain: 'lojasrenner.com.br', status: 'active' },
  { name: 'Farm', domain: 'farm.com.br', status: 'pending' },
  { name: 'Hering', domain: 'hering.com.br', status: 'active' },
  { name: 'Arezzo&Co', domain: 'arezzo.com.br', status: 'active' },
  { name: 'Track&Field', domain: 'trackandfield.com.br', status: 'pending' },
  { name: 'Reserva', domain: 'reserva.com.br', status: 'active' },
  { name: 'Calvin Klein', domain: 'calvinklein.com.br', status: 'inactive' },
];

const STATUS_COLOR: Record<TargetCompany['status'], string> = { active: '#10b981', pending: '#f59e0b', inactive: '#64748b' };
const STATUS_LABEL: Record<TargetCompany['status'], string> = { active: 'Ativo', pending: 'Pendente', inactive: 'Inativo' };

const ITEM_V = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

interface Props {
  targets?: TargetCompany[];
  onSelect: (name: string | null) => void;
  selectedName: string | null;
}

export function TargetsPanel({ targets: propTargets, onSelect, selectedName }: Props) {
  const targets = propTargets ?? DEFAULT_TARGETS;
  const activeCount = targets.filter((t) => t.status === 'active').length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.5 }}
      className="glass-card p-5 lg:p-6 flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#14b8a610] border border-[#14b8a620]">
            <Target size={18} className="text-[#14b8a6]" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-[#f1f5f9]">Empresas Alvo</h2>
            <p className="text-xs text-[#64748b]">{targets.length} empresas monitoradas</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
          style={{ color: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
          {activeCount} ativas
        </span>
      </div>

      <div className="flex-1 space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
        {targets.map((t, i) => (
          <motion.div key={t.domain} custom={i} initial="hidden" animate="visible" variants={ITEM_V}
            onClick={() => onSelect(selectedName === t.name ? null : t.name)}
            className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 cursor-pointer group border
              ${selectedName === t.name 
                ? 'bg-[rgba(65,105,225,0.1)] border-[rgba(65,105,225,0.3)] shadow-[0_0_15px_rgba(65,105,225,0.15)]' 
                : 'bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.08)]'}`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <span className="w-2 h-2 rounded-full block" style={{ backgroundColor: STATUS_COLOR[t.status] }} />
                {t.status === 'active' && (
                  <span className="absolute inset-0 w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: STATUS_COLOR[t.status], opacity: 0.4 }} />
                )}
              </div>
              <div className="min-w-0">
                <span className="text-sm font-semibold text-[#f1f5f9] block truncate">{t.name}</span>
                <span className="text-xs text-[#64748b] block truncate">{t.domain}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-md"
                style={{ color: STATUS_COLOR[t.status], backgroundColor: `${STATUS_COLOR[t.status]}10` }}>
                {STATUS_LABEL[t.status]}
              </span>
              <ChevronRight size={14} className="text-[#64748b] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
