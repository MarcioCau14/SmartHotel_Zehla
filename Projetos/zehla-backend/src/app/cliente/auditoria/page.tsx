'use client';

import { useEffect, useState } from 'react';
import { Shield, Download, Trash2, Eye, Filter, Search, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const severityConfig: Record<string, { label: string; color: string; bg: string; shadow: string }> = {
  INFO: { 
    label: 'Info', 
    color: '#00FF88', 
    bg: 'rgba(0, 255, 136, 0.08)',
    shadow: 'shadow-[0_0_8px_rgba(0,255,136,0.15)]'
  },
  WARN: { 
    label: 'Aviso', 
    color: '#00CCFF', 
    bg: 'rgba(0, 204, 255, 0.08)',
    shadow: 'shadow-[0_0_8px_rgba(0,204,255,0.15)]'
  },
  ALERT: { 
    label: 'Alerta', 
    color: '#FF5500', 
    bg: 'rgba(255, 85, 0, 0.08)',
    shadow: 'shadow-[0_0_8px_rgba(255,85,0,0.15)]'
  },
  CRITICAL: { 
    label: 'Crítico', 
    color: '#FF3366', 
    bg: 'rgba(255, 51, 102, 0.08)',
    shadow: 'shadow-[0_0_8px_rgba(255,51,102,0.15)]'
  },
};

const actionIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  PII_ACCESS: Eye,
  PII_UPDATE: Shield,
  PII_DELETE: Trash2,
  DATA_EXPORT: Download,
  PII_ANONYMIZE: Shield,
  DATA_DELETION: Trash2,
};

export default function AuditoriaPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    fetch('/api/audit-logs')
      .then(res => res.json())
      .then(data => {
        if (data.logs) setLogs(data.logs);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = logs.filter(log => {
    const matchSearch = !search ||
      log.resource?.toLowerCase().includes(search.toLowerCase()) ||
      log.userId?.toLowerCase().includes(search.toLowerCase()) ||
      log.action?.toLowerCase().includes(search.toLowerCase());
    const matchAction = !filterAction || log.action === filterAction;
    const matchSeverity = !filterSeverity || log.severity === filterSeverity;
    return matchSearch && matchAction && matchSeverity;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const stats = {
    total: logs.length,
    critical: logs.filter(l => l.severity === 'CRITICAL').length,
    exports: logs.filter(l => l.action === 'DATA_EXPORT' || l.action === 'PII_ANONYMIZE' || l.action === 'DATA_DELETION').length,
    today: logs.filter(l => {
      const logDate = new Date(l.createdAt).toDateString();
      const today = new Date().toDateString();
      return logDate === today;
    }).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 rounded-xl border-2 border-[#FF5500]/20 border-t-[#FF5500] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-black text-white tracking-tight uppercase flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#FF5500]/10 flex items-center justify-center border border-[#FF5500]/25">
            <Shield className="w-4 h-4 text-[#FF5500]" />
          </div>
          Auditoria LGPD
        </h1>
        <p className="text-neutral-500 text-xs font-bold uppercase tracking-wider mt-1.5">Rastreamento de acesso e modificação de dados pessoais</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total de Eventos', value: stats.total, color: '#00CCFF' },
          { label: 'Críticos', value: stats.critical, color: '#FF3366' },
          { label: 'Exportações / Exclusões', value: stats.exports, color: '#FF5500' },
          { label: 'Registros Hoje', value: stats.today, color: '#00FF88' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.04 }}
            className="bg-[#0a0a0c]/60 border border-white/5 rounded-2xl p-5 backdrop-blur-md hover:border-white/10 transition-all duration-300"
          >
            <p className="text-[26px] font-black text-white tracking-tight" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
          <input
            type="text"
            placeholder="Buscar registros..."
            className="w-full bg-[#050505]/40 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-neutral-300 placeholder-neutral-700 outline-none focus:border-[#FF5500]/30 transition-all duration-300"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="bg-[#050505]/40 border border-white/5 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#FF5500]/30 transition-all text-neutral-300 font-bold uppercase tracking-wider"
          value={filterAction}
          onChange={e => { setFilterAction(e.target.value); setPage(1); }}
        >
          <option className="bg-[#0a0a0c]" value="">Todas as Ações</option>
          <option className="bg-[#0a0a0c]" value="PII_ACCESS">Acesso PII</option>
          <option className="bg-[#0a0a0c]" value="PII_UPDATE">Atualização PII</option>
          <option className="bg-[#0a0a0c]" value="PII_DELETE">Deleção PII</option>
          <option className="bg-[#0a0a0c]" value="DATA_EXPORT">Exportação</option>
          <option className="bg-[#0a0a0c]" value="PII_ANONYMIZE">Anonimização</option>
          <option className="bg-[#0a0a0c]" value="DATA_DELETION">Exclusão</option>
        </select>
        <select
          className="bg-[#050505]/40 border border-white/5 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#FF5500]/30 transition-all text-neutral-300 font-bold uppercase tracking-wider"
          value={filterSeverity}
          onChange={e => { setFilterSeverity(e.target.value); setPage(1); }}
        >
          <option className="bg-[#0a0a0c]" value="">Todas as Severidades</option>
          <option className="bg-[#0a0a0c]" value="INFO">Info</option>
          <option className="bg-[#0a0a0c]" value="WARN">Aviso</option>
          <option className="bg-[#0a0a0c]" value="ALERT">Alerta</option>
          <option className="bg-[#0a0a0c]" value="CRITICAL">Crítico</option>
        </select>
      </div>

      {/* Audit log table */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-[#0a0a0c]/60 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-md"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#050505]/20 text-neutral-500 text-[9px] uppercase tracking-widest font-black border-b border-white/5">
                <th className="px-6 py-4">Ação</th>
                <th className="px-6 py-4">Recurso</th>
                <th className="px-6 py-4">Usuário</th>
                <th className="px-6 py-4">Campos PII</th>
                <th className="px-6 py-4">Severidade</th>
                <th className="px-6 py-4">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginated.map((log) => {
                const severity = severityConfig[log.severity] || severityConfig.INFO;
                const ActionIcon = actionIcons[log.action] || Shield;
                return (
                  <tr key={log.id} className="hover:bg-white/[0.01] transition-colors duration-300 group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg border bg-white/[0.01]" style={{ color: severity.color, borderColor: `${severity.color}20` }}>
                          <ActionIcon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-white group-hover:text-[#FF5500] transition-colors duration-300">{log.action}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-xs text-neutral-300">{log.resource}</p>
                      {log.resourceId && (
                        <p className="text-[10px] font-mono text-neutral-600 mt-0.5">{log.resourceId.slice(0, 12)}...</p>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-xs font-mono text-neutral-500">{log.userId?.slice(0, 8) || '—'}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-1">
                        {log.piiFields?.slice(0, 3).map((field: string, i: number) => (
                          <span key={i} className="text-[9px] px-2 py-0.5 rounded bg-white/[0.02] border border-white/5 text-neutral-500 font-bold uppercase tracking-wider">
                            {field}
                          </span>
                        ))}
                        {log.piiFields?.length > 3 && (
                          <span className="text-[9px] px-2 py-0.5 rounded bg-white/[0.02] border border-white/5 text-[#FF5500] font-bold">
                            +{log.piiFields.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${severity.shadow}`} style={{ backgroundColor: severity.bg, color: severity.color }}>
                        {severity.label}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-xs text-neutral-400 font-bold">
                        {new Date(log.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-[10px] text-neutral-600 font-medium mt-0.5">
                        {new Date(log.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {paginated.length === 0 && (
          <div className="text-center py-16 border-t border-white/5">
            <Shield className="w-10 h-10 mx-auto mb-3 text-neutral-600" />
            <p className="text-xs text-neutral-600 font-bold uppercase tracking-wider">Nenhum registro de auditoria encontrado</p>
          </div>
        )}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
            Mostrando {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} de {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              className="p-2 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 rounded-xl transition-all duration-300 text-neutral-500 disabled:opacity-30 disabled:pointer-events-none"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  className={`w-8 h-8 rounded-lg text-xs font-black transition-colors ${
                    page === pageNum
                      ? 'bg-[#FF5500] text-white shadow-[0_0_12px_rgba(255,85,0,0.2)]'
                      : 'bg-white/[0.01] border border-white/5 text-neutral-500 hover:text-neutral-300'
                  }`}
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              className="p-2 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 rounded-xl transition-all duration-300 text-neutral-500 disabled:opacity-30 disabled:pointer-events-none"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
