'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp, Mail, MousePointerClick, AlertTriangle, Users, Zap,
  Loader2, ArrowUpRight, ArrowDownRight, Filter, RefreshCw
} from 'lucide-react';

interface FunnelAnalytics {
  overview: {
    totalEvents: number;
    totalLeads: number;
    openRate: number;
    clickRate: number;
    bounceRate: number;
  };
  clusters: {
    HOT: number;
    WARM: number;
    COLD: number;
    NEUTRAL: number;
  };
  funnelStages: Record<string, number>;
  eventBreakdown: Array<{ type: string; count: number }>;
  topLeads: Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
    whatsapp: string;
    property: string;
    city: string;
    state: string;
    cluster: string;
    funnelStage: string;
    conversionScore: number;
    lastInteractionAt: string;
    createdAt: string;
  }>;
  recentEvents: Array<{
    id: string;
    type: string;
    email: string;
    leadName: string;
    leadCluster: string;
    campaignName: string;
    scoreDelta: number;
    createdAt: string;
  }>;
}

export function FunnelAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<FunnelAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [filterCluster, setFilterCluster] = useState<string>('all');

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        days: days.toString(),
        ...(filterCluster !== 'all' && { cluster: filterCluster }),
      });
      const res = await fetch(`/api/funnel/analytics?${params}`);
      const data = await res.json();
      setAnalytics(data);
    } catch (err) {
      console.error('Erro ao carregar analytics:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAnalytics();
  }, [days, filterCluster]);

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#F97316] animate-spin" />
        <span className="ml-3 text-sm text-[#4d4d4d]">Carregando analytics...</span>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-20">
        <p className="text-[#4d4d4d]">Nenhum dado disponível</p>
      </div>
    );
  }

  const clusterColors: Record<string, string> = {
    HOT: 'text-red-400 bg-red-400/10 border-red-400/20',
    WARM: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    COLD: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    NEUTRAL: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
  };

  const eventTypeIcons: Record<string, React.ReactNode> = {
    email_opened: <Mail className="w-4 h-4" />,
    email_clicked: <MousePointerClick className="w-4 h-4" />,
    email_bounced: <AlertTriangle className="w-4 h-4" />,
    email_delivered: <Mail className="w-4 h-4" />,
    email_unsubscribed: <ArrowDownRight className="w-4 h-4" />,
    lead_activated_hot: <Zap className="w-4 h-4" />,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#fafafa]">Inteligência de Funil</h2>
          <p className="text-sm text-[#4d4d4d]">Campanhas, clusters e comportamento de leads</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="bg-[#242424] border border-[#2e2e2e] rounded-lg px-3 py-2 text-sm text-[#b4b4b4]"
          >
            <option value={7}>Últimos 7 dias</option>
            <option value={30}>Últimos 30 dias</option>
            <option value={90}>Últimos 90 dias</option>
          </select>
          <select
            value={filterCluster}
            onChange={(e) => setFilterCluster(e.target.value)}
            className="bg-[#242424] border border-[#2e2e2e] rounded-lg px-3 py-2 text-sm text-[#b4b4b4]"
          >
            <option value="all">Todos os clusters</option>
            <option value="HOT">HOT</option>
            <option value="WARM">WARM</option>
            <option value="COLD">COLD</option>
          </select>
          <button
            onClick={fetchAnalytics}
            className="p-2 rounded-lg bg-[#242424] border border-[#2e2e2e] text-[#898989] hover:text-[#efefef] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KPICard
          label="Open Rate"
          value={`${analytics.overview.openRate}%`}
          icon={<Mail className="w-5 h-5" />}
          color="text-[#F97316]"
          bgColor="bg-[#F97316]/10"
        />
        <KPICard
          label="Click Rate"
          value={`${analytics.overview.clickRate}%`}
          icon={<MousePointerClick className="w-5 h-5" />}
          color="text-green-400"
          bgColor="bg-green-400/10"
        />
        <KPICard
          label="Bounce Rate"
          value={`${analytics.overview.bounceRate}%`}
          icon={<AlertTriangle className="w-5 h-5" />}
          color={analytics.overview.bounceRate > 2 ? 'text-red-400' : 'text-yellow-400'}
          bgColor={analytics.overview.bounceRate > 2 ? 'bg-red-400/10' : 'bg-yellow-400/10'}
        />
        <KPICard
          label="Total Leads"
          value={analytics.overview.totalLeads.toString()}
          icon={<Users className="w-5 h-5" />}
          color="text-blue-400"
          bgColor="bg-blue-400/10"
        />
        <KPICard
          label="Total Eventos"
          value={analytics.overview.totalEvents.toString()}
          icon={<TrendingUp className="w-5 h-5" />}
          color="text-purple-400"
          bgColor="bg-purple-400/10"
        />
      </div>

      {/* Clusters + Events Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cluster Distribution */}
        <div className="bg-[#0f0f0f]/60 border border-[#2e2e2e] rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-[#efefef] mb-4">Distribuição de Clusters</h3>
          <div className="space-y-3">
            {Object.entries(analytics.clusters).map(([cluster, count]) => {
              const total = Object.values(analytics.clusters).reduce((s, v) => s + v, 0);
              const percent = total > 0 ? Math.round((count / total) * 100) : 0;
              const colors = clusterColors[cluster] || clusterColors.NEUTRAL;
              return (
                <div key={cluster} className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded-md border ${colors}`}>
                    {cluster}
                  </span>
                  <div className="flex-1 h-2 bg-[#242424] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        cluster === 'HOT' ? 'bg-red-400' :
                        cluster === 'WARM' ? 'bg-amber-400' :
                        cluster === 'COLD' ? 'bg-blue-400' : 'bg-gray-400'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="text-xs text-[#898989] w-12 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Event Breakdown */}
        <div className="bg-[#0f0f0f]/60 border border-[#2e2e2e] rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-[#efefef] mb-4">Eventos por Tipo</h3>
          <div className="space-y-2">
            {analytics.eventBreakdown.map((event) => (
              <div key={event.type} className="flex items-center justify-between py-2 border-b border-[#2e2e2e] last:border-0">
                <div className="flex items-center gap-2">
                  {eventTypeIcons[event.type] || <Mail className="w-4 h-4" />}
                  <span className="text-xs text-[#b4b4b4]">{event.type.replace(/_/g, ' ')}</span>
                </div>
                <span className="text-xs font-mono text-[#898989]">{event.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Leads */}
      <div className="bg-[#0f0f0f]/60 border border-[#2e2e2e] rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-[#efefef] mb-4">Top Leads (WARM+)</h3>
        {analytics.topLeads.length === 0 ? (
          <p className="text-sm text-[#4d4d4d] text-center py-8">Nenhum lead WARM ou HOT encontrado</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2e2e2e]">
                  <th className="text-left py-2 px-3 text-[10px] uppercase text-[#4d4d4d] font-bold">Lead</th>
                  <th className="text-left py-2 px-3 text-[10px] uppercase text-[#4d4d4d] font-bold">Contato</th>
                  <th className="text-left py-2 px-3 text-[10px] uppercase text-[#4d4d4d] font-bold">Cluster</th>
                  <th className="text-left py-2 px-3 text-[10px] uppercase text-[#4d4d4d] font-bold">Score</th>
                  <th className="text-left py-2 px-3 text-[10px] uppercase text-[#4d4d4d] font-bold">Stage</th>
                  <th className="text-left py-2 px-3 text-[10px] uppercase text-[#4d4d4d] font-bold">Última Interação</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-[#1a1a1a] hover:bg-[#242424]/50 transition-colors">
                    <td className="py-2.5 px-3">
                      <div>
                        <p className="font-medium text-[#efefef]">{lead.name}</p>
                        <p className="text-xs text-[#4d4d4d]">{lead.property || lead.city || '-'}</p>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <p className="text-xs text-[#898989]">{lead.email || '-'}</p>
                      <p className="text-xs text-[#4d4d4d]">{lead.whatsapp || lead.phone || '-'}</p>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${clusterColors[lead.cluster] || clusterColors.COLD}`}>
                        {lead.cluster}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-xs font-mono text-[#efefef]">{lead.conversionScore}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-xs text-[#898989]">{lead.funnelStage}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-xs text-[#4d4d4d]">
                        {lead.lastInteractionAt ? new Date(lead.lastInteractionAt).toLocaleDateString('pt-BR') : '-'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Events */}
      <div className="bg-[#0f0f0f]/60 border border-[#2e2e2e] rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-[#efefef] mb-4">Eventos Recentes</h3>
        <div className="space-y-2 max-h-80 overflow-y-auto zehla-scroll-y">
          {analytics.recentEvents.map((event) => (
            <div key={event.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-[#1a1a1a]/50 hover:bg-[#242424]/50 transition-colors">
              <div className="flex items-center gap-3">
                {eventTypeIcons[event.type] || <Mail className="w-4 h-4 text-[#898989]" />}
                <div>
                  <p className="text-xs text-[#b4b4b4]">
                    <span className="font-medium">{event.leadName || event.email}</span>
                    {event.campaignName && <span className="text-[#4d4d4d]"> — {event.campaignName}</span>}
                  </p>
                  <p className="text-[10px] text-[#4d4d4d]">{event.type.replace(/_/g, ' ')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {event.scoreDelta !== 0 && (
                  <span className={`text-xs font-mono ${event.scoreDelta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {event.scoreDelta > 0 ? '+' : ''}{event.scoreDelta}
                  </span>
                )}
                <span className="text-[10px] text-[#4d4d4d]">
                  {new Date(event.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KPICard({ label, value, icon, color, bgColor }: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="bg-[#0f0f0f]/60 border border-[#2e2e2e] rounded-2xl p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-xl ${bgColor}`}>
          <span className={color}>{icon}</span>
        </div>
      </div>
      <p className="text-2xl font-bold text-[#fafafa]">{value}</p>
      <p className="text-xs text-[#4d4d4d] mt-1">{label}</p>
    </div>
  );
}
