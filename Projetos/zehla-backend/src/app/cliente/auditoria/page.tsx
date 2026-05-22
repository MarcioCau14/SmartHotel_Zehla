'use client';

import { useEffect, useState } from 'react';
import { Shield, Download, Trash2, Eye, Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react';

const severityConfig: Record<string, { label: string; color: string; bg: string }> = {
  INFO: { label: 'Info', color: '#25D366', bg: 'rgba(37, 211, 102, 0.1)' },
  WARN: { label: 'Aviso', color: '#FFB74D', bg: 'rgba(255, 183, 77, 0.15)' },
  ALERT: { label: 'Alerta', color: '#FF9800', bg: 'rgba(255, 152, 0, 0.1)' },
  CRITICAL: { label: 'Crítico', color: '#EA4335', bg: 'rgba(234, 67, 53, 0.1)' },
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
        <div className="w-10 h-10 rounded-full border-2 border-[#25D366]/20 border-t-[#25D366] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="dash-page-title">Auditoria LGPD</h1>
        <p className="dash-page-subtitle">Rastreamento de acesso e modificação de dados pessoais</p>
      </div>

      {/* Stats */}
      <div className="dash-grid-4">
        <div className="dash-kpi">
          <p className="text-2xl font-bold" style={{ color: '#111B21' }}>{stats.total}</p>
          <p className="text-sm" style={{ color: '#667781' }}>Total de Eventos</p>
        </div>
        <div className="dash-kpi">
          <p className="text-2xl font-bold" style={{ color: '#EA4335' }}>{stats.critical}</p>
          <p className="text-sm" style={{ color: '#667781' }}>Críticos</p>
        </div>
        <div className="dash-kpi">
          <p className="text-2xl font-bold" style={{ color: '#25D366' }}>{stats.exports}</p>
          <p className="text-sm" style={{ color: '#667781' }}>Exportações/Deleções</p>
        </div>
        <div className="dash-kpi">
          <p className="text-2xl font-bold" style={{ color: '#128C7E' }}>{stats.today}</p>
          <p className="text-sm" style={{ color: '#667781' }}>Hoje</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#8696A0' }} />
          <input
            type="text"
            placeholder="Buscar..."
            className="dash-input pl-9"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="dash-input w-auto"
          value={filterAction}
          onChange={e => { setFilterAction(e.target.value); setPage(1); }}
        >
          <option value="">Todas as Ações</option>
          <option value="PII_ACCESS">Acesso PII</option>
          <option value="PII_UPDATE">Atualização PII</option>
          <option value="PII_DELETE">Deleção PII</option>
          <option value="DATA_EXPORT">Exportação</option>
          <option value="PII_ANONYMIZE">Anonimização</option>
          <option value="DATA_DELETION">Exclusão</option>
        </select>
        <select
          className="dash-input w-auto"
          value={filterSeverity}
          onChange={e => { setFilterSeverity(e.target.value); setPage(1); }}
        >
          <option value="">Todas as Severidades</option>
          <option value="INFO">Info</option>
          <option value="WARN">Aviso</option>
          <option value="ALERT">Alerta</option>
          <option value="CRITICAL">Crítico</option>
        </select>
      </div>

      {/* Audit log table */}
      <div className="dash-section overflow-hidden p-0">
        <table className="dash-table">
          <thead>
            <tr>
              <th>Ação</th>
              <th>Recurso</th>
              <th>Usuário</th>
              <th>Campos PII</th>
              <th>Severidade</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((log) => {
              const severity = severityConfig[log.severity] || severityConfig.INFO;
              const ActionIcon = actionIcons[log.action] || Shield;
              return (
                <tr key={log.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <ActionIcon className="w-4 h-4" style={{ color: severity.color }} />
                      <span className="text-sm font-medium" style={{ color: '#111B21' }}>{log.action}</span>
                    </div>
                  </td>
                  <td>
                    <p className="text-sm" style={{ color: '#667781' }}>{log.resource}</p>
                    {log.resourceId && (
                      <p className="text-xs font-mono" style={{ color: '#8696A0' }}>{log.resourceId.slice(0, 12)}...</p>
                    )}
                  </td>
                  <td>
                    <p className="text-sm font-mono" style={{ color: '#667781' }}>{log.userId?.slice(0, 8) || '—'}</p>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {log.piiFields?.slice(0, 3).map((field: string, i: number) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: '#F0F2F5', color: '#667781' }}>
                          {field}
                        </span>
                      ))}
                      {log.piiFields?.length > 3 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: '#F0F2F5', color: '#8696A0' }}>
                          +{log.piiFields.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="dash-status" style={{ backgroundColor: severity.bg, color: severity.color }}>
                      {severity.label}
                    </span>
                  </td>
                  <td>
                    <p className="text-sm" style={{ color: '#667781' }}>
                      {new Date(log.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-xs" style={{ color: '#8696A0' }}>
                      {new Date(log.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {paginated.length === 0 && (
          <div className="text-center py-12">
            <Shield className="w-12 h-12 mx-auto mb-3" style={{ color: '#8696A0' }} />
            <p className="text-sm font-medium" style={{ color: '#667781' }}>Nenhum registro de auditoria encontrado</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm" style={{ color: '#667781' }}>
            Mostrando {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} de {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              className="dash-btn-secondary px-3 py-1.5"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    page === pageNum
                      ? 'bg-[#25D366] text-white'
                      : 'bg-[#F0F2F5] text-[#667781] hover:bg-[#E9EDEF]'
                  }`}
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              className="dash-btn-secondary px-3 py-1.5"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
