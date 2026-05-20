'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Command,
  Brain,
  Terminal,
  Bot,
  Building2,
  Megaphone,
  CreditCard,
  MessageSquare,
  Plug,
  Shield,
  Eye,
  Cpu,
  BarChart3,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Zap,
  Hash,
  Gauge,
  Wifi,
  Database,
  Server,
  Lock,
  FileCheck,
  Users,
  LockKeyhole,
  Sparkles,
  RefreshCw,
  Menu,
  ChevronRight,
  LogOut,
  Plus,
  User,
  Edit3,
  Trash2,
} from 'lucide-react';

// Dashboard components to reuse
import { TerminalPanel } from '@/components/dashboard/TerminalPanel';
import { CognitivePanel } from '@/components/dashboard/CognitivePanel';
import { MarketingLeads } from '@/components/dashboard/MarketingLeads';
import { WhatsAppPanel } from '@/components/dashboard/WhatsAppPanel';
import { APIStatus } from '@/components/dashboard/APIStatus';
import { PaymentPanel } from '@/components/dashboard/PaymentPanel';
import { SystemStatusBar } from '@/components/dashboard/SystemStatusBar';
import { VisibilityDashboard } from '@/components/dashboard/VisibilityDashboard';

// ZCC components to reuse
import { SwarmOverview } from '@/components/zcc/SwarmOverview';
import { ZccAutoHealer } from '@/components/zcc/ZccAutoHealer';
import { TenantManagement } from '@/components/zcc/TenantManagement';
import { FintechHub } from '@/components/zcc/FintechHub';
import { CognitiveObservability } from '@/components/zcc/CognitiveObservability';
import { ScaleMetrics } from '@/components/zcc/ScaleMetrics';
import { ApiKeysPanel } from '@/components/zcc/ApiKeysPanel';

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

import type { AIAgent } from '@/lib/store';

// ===== TAB CONFIGURATION =====

type ZCCTab =
  | 'overview'
  | 'cognitivo'
  | 'terminal'
  | 'agentes'
  | 'propriedades'
  | 'marketing'
  | 'visibilidade'
  | 'financeiro'
  | 'whatsapp'
  | 'apis'
  | 'equipe'
  | 'seguranca';

interface TabConfig {
  id: ZCCTab;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement> & { className?: string }>;
  permission?: string;
}

const tabs: TabConfig[] = [
  { id: 'overview', label: 'Overview', shortLabel: 'Overview', icon: Eye },
  { id: 'cognitivo', label: 'Cognitivo', shortLabel: 'Cognitivo', icon: Brain, permission: 'view_cognitivo' },
  { id: 'terminal', label: 'Terminal', shortLabel: 'Terminal', icon: Terminal, permission: 'view_terminal' },
  { id: 'agentes', label: 'Agentes', shortLabel: 'Agentes', icon: Bot, permission: 'view_agents' },
  { id: 'propriedades', label: 'Propriedades', shortLabel: 'Props', icon: Building2, permission: 'view_properties' },
  { id: 'marketing', label: 'Marketing', shortLabel: 'Marketing', icon: Megaphone, permission: 'view_marketing' },
  { id: 'visibilidade', label: 'Visibilidade', shortLabel: 'Visibilidade', icon: Eye, permission: 'view_marketing' },
  { id: 'financeiro', label: 'Financeiro', shortLabel: 'Financeiro', icon: CreditCard, permission: 'view_financial' },
  { id: 'whatsapp', label: 'WhatsApp', shortLabel: 'WhatsApp', icon: MessageSquare, permission: 'view_whatsapp' },
  { id: 'apis', label: 'APIs', shortLabel: 'APIs', icon: Plug, permission: 'view_apis' },
  { id: 'equipe', label: 'Equipe', shortLabel: 'Equipe', icon: Users, permission: 'manage_team' },
  { id: 'seguranca', label: 'Segurança', shortLabel: 'Segurança', icon: Shield, permission: 'view_security' },
];

// ===== AGENT MANAGEMENT TAB (Inline Component) =====

// MAL Types for inline use
interface AgentLearningState {
  agentId: string;
  status: string;
  progress: number;
  activeTask: string | null;
}

interface KnowledgeDocument {
  id: string;
  title: string;
  source: string;
  chunks: number;
  embeddingModel: string;
  ingestedAt: string;
  retentionPolicy: string;
}

interface EvolutionEntry {
  date: string;
  type: string;
  description: string;
  impact: string;
  metric?: { before: number; after: number; unit: string };
}

interface TrainingProfile {
  agentId: string;
  domain: string;
  specializations: string[];
  primaryIntents: string[];
  knowledgeBase: KnowledgeDocument[];
  learningMetrics: {
    totalInteractions: number;
    learnedPatterns: number;
    accuracyTrend: number[];
    latencyTrend: number[];
    confidenceTrend: number[];
    successRateEvolution: { period: string; rate: number }[];
    intentCoverage: { intent: string; accuracy: number; samples: number }[];
    currentEpoch: number;
    totalEpochs: number;
    loss: number;
  };
  confidenceScore: number;
  trainingStatus: string;
  lastTrained: string;
  modelVersion: number;
  evolutionLog: EvolutionEntry[];
}

// Mini Sparkline SVG Component
function MiniSparkline({ data, color, width = 120, height = 32 }: { data: number[]; color: string; width?: number; height?: number }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={width} height={height} className="inline-block flex-shrink-0">
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
}

// Mini Bar Chart SVG Component
function MiniBarChart({ data, width = 280, height = 48 }: { data: { period: string; rate: number }[]; width?: number; height?: number }) {
  const barWidth = Math.max(4, (width / data.length) - 4);
  const maxRate = 100;
  return (
    <svg width={width} height={height} className="inline-block flex-shrink-0">
      {data.map((d, i) => {
        const barHeight = ((d.rate / maxRate) * (height - 14));
        const x = i * (barWidth + 4) + 2;
        const y = height - 10 - barHeight;
        const opacity = 0.4 + (i / data.length) * 0.6;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barWidth} height={barHeight} rx={2} fill={`rgba(16, 185, 129, ${opacity})`} />
            <text x={x + barWidth / 2} y={height - 1} textAnchor="middle" fill="rgba(163,163,163,0.6)" fontSize="7" fontFamily="monospace">{d.period}</text>
          </g>
        );
      })}
    </svg>
  );
}

function AgentManagementPanel() {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [profiles, setProfiles] = useState<TrainingProfile[]>([]);
  const [trainingStatuses, setTrainingStatuses] = useState<AgentLearningState[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    Promise.all([
      fetch('/api/agents').then((r) => r.json()).catch(() => []),
      fetch('/api/agents/learning').then((r) => r.json()).catch(() => []),
      fetch('/api/agents/training/status').then((r) => r.json()).catch(() => []),
    ]).then(([agentData, learningData, statusData]) => {
      setAgents(agentData);
      setProfiles(learningData);
      setTrainingStatuses(statusData);
      setLoading(false);
    });
  }, []);

  // Match agent icons from store to profiles
  const getAgentIcon = (agentId: string) => agents.find((a) => a.id === agentId)?.icon ?? '🤖';
  const getAgentName = (agentId: string) => agents.find((a) => a.id === agentId)?.name ?? agentId;
  const getAgentRole = (agentId: string) => agents.find((a) => a.id === agentId)?.role ?? '';
  const getStatusInfo = (agentId: string) => trainingStatuses.find((s) => s.agentId === agentId);

  // Fleet ML KPIs
  const totalAgents = profiles.length;
  const readyAgents = profiles.filter((p) => p.trainingStatus === 'ready').length;
  const trainingAgents = profiles.filter((p) => p.trainingStatus === 'training' || p.trainingStatus === 'learning').length;
  const totalPatterns = profiles.reduce((s, p) => s + p.learningMetrics.learnedPatterns, 0);
  const avgConfidence = profiles.length > 0 ? (profiles.reduce((s, p) => s + p.confidenceScore, 0) / profiles.length) : 0;
  const totalIntents = profiles.reduce((s, p) => s + p.learningMetrics.intentCoverage.length, 0);
  const totalDocs = profiles.reduce((s, p) => s + p.knowledgeBase.length, 0);
  const avgEpoch = profiles.length > 0 ? Math.round(profiles.reduce((s, p) => s + p.learningMetrics.currentEpoch, 0) / profiles.length) : 0;

  const statusColors: Record<string, string> = {
    ready: 'bg-[#F97316]/10 text-[#F97316]',
    training: 'bg-[#F97316]/10 text-[#F97316]',
    learning: 'bg-purple-500/20 text-[#F97316]',
    idle: 'bg-neutral-500/20 text-[#898989]',
    deploying: 'bg-cyan-500/20 text-[#F97316]',
  };

  const statusLabels: Record<string, string> = {
    ready: 'READY',
    training: 'TRAINING',
    learning: 'LEARNING',
    idle: 'IDLE',
    deploying: 'DEPLOYING',
  };

  const impactColors: Record<string, string> = {
    low: 'text-[#4d4d4d]',
    medium: 'text-[#F97316]',
    high: 'text-[#F97316]',
    critical: 'text-[#F97316]',
  };

  const sourceLabels: Record<string, string> = {
    pousada_docs: '📋 Docs Pousada',
    real_world: '🌍 Mundo Real',
    system_generated: '⚙️ Sistema',
    uploaded: '📤 Upload',
  };

  const evolutionIcons: Record<string, string> = {
    pattern_learned: '🧬',
    intent_refined: '🎯',
    model_updated: '🔄',
    knowledge_expanded: '📖',
    confidence_lock: '🔒',
    document_ingested: '📥',
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ===== Section A: Fleet ML Overview (KPIs) ===== */}
      <div className="glass-card p-5 border border-purple-500/10 bg-purple-500/[0.02]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[#b4b4b4] flex items-center gap-2">
            <Brain className="w-4 h-4 text-[#F97316]" />
            MAL — Malha de Aprendizado Agêntica
            <Badge variant="outline" className="border-[#F97316]/30 text-[#F97316] text-[10px]">Fleet ML</Badge>
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[#2e2e2e] text-[#efefef]' : 'text-[#4d4d4d] hover:text-[#b4b4b4]'}`}
              aria-label="Grid view"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="0.5" y="0.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1"/><rect x="8.5" y="0.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1"/><rect x="0.5" y="8.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1"/><rect x="8.5" y="8.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1"/></svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[#2e2e2e] text-[#efefef]' : 'text-[#4d4d4d] hover:text-[#b4b4b4]'}`}
              aria-label="List view"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="0.5" y="1" width="13" height="2.5" rx="1" stroke="currentColor" strokeWidth="1"/><rect x="0.5" y="5.75" width="13" height="2.5" rx="1" stroke="currentColor" strokeWidth="1"/><rect x="0.5" y="10.5" width="13" height="2.5" rx="1" stroke="currentColor" strokeWidth="1"/></svg>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { label: 'Total Agentes', value: totalAgents, color: 'text-[#F97316]' },
            { label: 'Agentes Ready', value: readyAgents, color: 'text-[#F97316]' },
            { label: 'Em Treinamento', value: trainingAgents, color: 'text-[#F97316]' },
            { label: 'Padrões Aprendidos', value: totalPatterns.toLocaleString('pt-BR'), color: 'text-[#F97316]' },
            { label: 'Confiança Média', value: `${(avgConfidence * 100).toFixed(1)}%`, color: 'text-[#F97316]' },
            { label: 'Intenções Cobertas', value: totalIntents, color: 'text-[#b4b4b4]' },
            { label: 'Base de Conhecimento', value: `${totalDocs} docs`, color: 'text-[#b4b4b4]' },
            { label: 'Epoch Atual', value: `${avgEpoch}/50`, color: 'text-[#F97316]' },
          ].map((item, i) => (
            <div key={i} className="bg-white/[0.02] rounded-lg p-3">
              <div className="text-lg font-bold font-mono {item.color}" style={{ color: 'inherit' }}>
                <span className={item.color}>{item.value}</span>
              </div>
              <div className="text-[10px] text-[#4d4d4d] mt-0.5">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== Section B: Agent Training Cards ===== */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-3'}>
        {profiles.map((profile) => {
          const icon = getAgentIcon(profile.agentId);
          const name = getAgentName(profile.agentId);
          const role = getAgentRole(profile.agentId);
          const status = getStatusInfo(profile.agentId);
          const isExpanded = expandedAgent === profile.agentId;
          const isLocked = profile.confidenceScore >= 0.90;
          const confidenceColor = profile.confidenceScore >= 0.90 ? '#10B981' : profile.confidenceScore >= 0.80 ? '#F59E0B' : '#EF4444';
          const lastAccuracy = profile.learningMetrics.accuracyTrend[profile.learningMetrics.accuracyTrend.length - 1] ?? 0;

          return (
            <motion.div
              key={profile.agentId}
              layout
              className={`glass-card overflow-hidden transition-all ${isExpanded ? 'border-purple-500/20' : ''}`}
            >
              {/* Card Header */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{icon}</span>
                    <div>
                      <div className="text-sm font-semibold text-[#efefef] flex items-center gap-2">
                        {name}
                        <Badge className={`border-0 text-[9px] ${statusColors[profile.trainingStatus] || statusColors.idle}`}>
                          {statusLabels[profile.trainingStatus] || profile.trainingStatus.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-[10px] text-[#4d4d4d]">{role}</div>
                      <div className="text-[9px] text-[#363636] font-mono mt-0.5">{profile.domain}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isLocked && (
                      <Badge className="border-0 text-[9px] bg-[#F97316]/10 text-[#F97316]">
                        <Lock className="w-2.5 h-2.5 mr-0.5" /> LOCKED
                      </Badge>
                    )}
                    <Badge variant="outline" className="border-[#363636] text-[#4d4d4d] text-[9px]">
                      v{profile.modelVersion}
                    </Badge>
                  </div>
                </div>

                {/* Confidence Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className="text-[#4d4d4d]">Confiança (KL Divergence)</span>
                    <span className="font-mono font-bold" style={{ color: confidenceColor }}>
                      {(profile.confidenceScore * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-[#242424] rounded-full h-2">
                    <motion.div
                      className="h-2 rounded-full"
                      style={{ backgroundColor: confidenceColor }}
                      initial={{ width: 0 }}
                      animate={{ width: `${profile.confidenceScore * 100}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                {/* Training Progress (if active) */}
                {(profile.trainingStatus === 'training' || profile.trainingStatus === 'learning') && status && status.progress < 100 && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="text-[#4d4d4d] flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        {status.activeTask}
                      </span>
                      <span className="font-mono text-[#F97316]">{status.progress}%</span>
                    </div>
                    <div className="w-full bg-[#242424] rounded-full h-1.5">
                      <motion.div
                        className="h-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${status.progress}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-white/[0.02] rounded-lg p-2 text-center">
                    <div className="text-xs font-bold text-[#F97316] font-mono">{profile.learningMetrics.learnedPatterns}</div>
                    <div className="text-[9px] text-[#363636]">Padrões</div>
                  </div>
                  <div className="bg-white/[0.02] rounded-lg p-2 text-center">
                    <div className="text-xs font-bold text-[#b4b4b4] font-mono">{profile.learningMetrics.totalInteractions.toLocaleString()}</div>
                    <div className="text-[9px] text-[#363636]">Interações</div>
                  </div>
                  <div className="bg-white/[0.02] rounded-lg p-2 text-center">
                    <div className="text-xs font-bold text-[#F97316] font-mono">{profile.knowledgeBase.length}</div>
                    <div className="text-[9px] text-[#363636]">Docs</div>
                  </div>
                </div>

                {/* Accuracy Sparkline */}
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[10px] text-[#4d4d4d]">Tendência de Acurácia (30d)</div>
                  <div className="text-[10px] font-mono text-[#F97316]">{(lastAccuracy * 100).toFixed(1)}%</div>
                </div>
                <div className="flex justify-center mb-3">
                  <MiniSparkline data={profile.learningMetrics.accuracyTrend} color="#10B981" width={240} height={36} />
                </div>

                {/* Top 5 Intents */}
                <div className="space-y-1 mb-3">
                  <div className="text-[10px] text-[#4d4d4d] mb-1">Coverage de Intenções (Top 5)</div>
                  {profile.learningMetrics.intentCoverage.slice(0, 5).map((intent) => (
                    <div key={intent.intent} className="flex items-center gap-2">
                      <span className="text-[10px] text-[#898989] font-mono w-[140px] truncate">{intent.intent}</span>
                      <div className="flex-1 bg-[#242424] rounded-full h-1">
                        <div
                          className="h-1 rounded-full bg-orange-500/70"
                          style={{ width: `${intent.accuracy}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-[#898989] w-[38px] text-right">{intent.accuracy.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>

                {/* Expand Button */}
                <button
                  onClick={() => setExpandedAgent(isExpanded ? null : profile.agentId)}
                  className="w-full text-center text-[10px] text-[#F97316] hover:text-purple-300 py-2 border-t border-[#2e2e2e] transition-colors"
                >
                  {isExpanded ? '▲ Recolher Detalhes' : '▼ Ver Detalhes de Treinamento'}
                </button>
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-[#2e2e2e] p-4 space-y-4 zehla-scroll-modal">
                      {/* Knowledge Base */}
                      <div>
                        <div className="text-[11px] font-semibold text-[#b4b4b4] mb-2 flex items-center gap-1.5">
                          <Database className="w-3.5 h-3.5 text-[#F97316]" />
                          Base de Conhecimento ({profile.knowledgeBase.length} documentos)
                        </div>
                        <div className="space-y-1.5">
                          {profile.knowledgeBase.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
                              <div className="flex-1 min-w-0">
                                <div className="text-[10px] text-[#b4b4b4] truncate">{doc.title}</div>
                                <div className="text-[9px] text-[#363636] flex items-center gap-2 mt-0.5">
                                  <span>{sourceLabels[doc.source] || doc.source}</span>
                                  <span>•</span>
                                  <span>{doc.chunks} chunks</span>
                                  <span>•</span>
                                  <span className="font-mono">{new Date(doc.ingestedAt).toLocaleDateString('pt-BR')}</span>
                                </div>
                              </div>
                              <Badge className={`border-0 text-[8px] flex-shrink-0 ml-2 ${
                                doc.retentionPolicy === 'zdr_anonymized' ? 'bg-purple-500/15 text-[#F97316]' :
                                doc.retentionPolicy === 'global_pattern' ? 'bg-cyan-500/15 text-[#F97316]' :
                                'bg-amber-500/15 text-[#F97316]'
                              }`}>
                                {doc.retentionPolicy}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Evolution Log */}
                      <div>
                        <div className="text-[11px] font-semibold text-[#b4b4b4] mb-2 flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5 text-[#F97316]" />
                          Log de Evolução
                        </div>
                        <div className="space-y-1.5">
                          {profile.evolutionLog.map((entry, idx) => (
                            <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.02]">
                              <span className="text-sm mt-0.5">{evolutionIcons[entry.type] || '📌'}</span>
                              <div className="flex-1 min-w-0">
                                <div className="text-[10px] text-[#b4b4b4]">{entry.description}</div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[9px] text-[#363636] font-mono">{new Date(entry.date).toLocaleDateString('pt-BR')}</span>
                                  <Badge className={`border-0 text-[8px] ${impactColors[entry.impact] || 'text-[#4d4d4d]'}`}>
                                    {entry.impact.toUpperCase()}
                                  </Badge>
                                  {entry.metric && (
                                    <span className="text-[9px] text-[#4d4d4d] font-mono">
                                      {entry.metric.before}{entry.metric.unit} → {entry.metric.after}{entry.metric.unit}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Success Rate Evolution Chart */}
                      <div>
                        <div className="text-[11px] font-semibold text-[#b4b4b4] mb-2 flex items-center gap-1.5">
                          <BarChart3 className="w-3.5 h-3.5 text-[#F97316]" />
                          Evolução da Taxa de Sucesso
                        </div>
                        <div className="flex justify-center p-2 bg-white/[0.02] rounded-lg">
                          <MiniBarChart data={profile.learningMetrics.successRateEvolution} width={300} height={56} />
                        </div>
                      </div>

                      {/* Training Metrics */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div className="bg-white/[0.02] rounded-lg p-2 text-center">
                          <div className="text-[10px] text-[#4d4d4d]">Epoch</div>
                          <div className="text-sm font-bold font-mono text-[#F97316]">{profile.learningMetrics.currentEpoch}/{profile.learningMetrics.totalEpochs}</div>
                        </div>
                        <div className="bg-white/[0.02] rounded-lg p-2 text-center">
                          <div className="text-[10px] text-[#4d4d4d]">Loss</div>
                          <div className="text-sm font-bold font-mono text-[#F97316]">{profile.learningMetrics.loss.toFixed(4)}</div>
                        </div>
                        <div className="bg-white/[0.02] rounded-lg p-2 text-center">
                          <div className="text-[10px] text-[#4d4d4d]">Intents Cobertos</div>
                          <div className="text-sm font-bold font-mono text-[#b4b4b4]">{profile.learningMetrics.intentCoverage.length}</div>
                        </div>
                        <div className="bg-white/[0.02] rounded-lg p-2 text-center">
                          <div className="text-[10px] text-[#4d4d4d]">Último Treino</div>
                          <div className="text-[10px] font-mono text-[#b4b4b4]">{new Date(profile.lastTrained).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* ===== Section C: Cross-Agent Learning (Aprendiz) ===== */}
      {profiles.length > 0 && (
        <div className="glass-card p-5 border border-purple-500/10 bg-purple-500/[0.02]">
          <h3 className="text-sm font-semibold text-[#b4b4b4] flex items-center gap-2 mb-4">
            <span className="text-lg">📚</span>
            Cross-Agent Learning — Aprendiz Meta-Agent
            <Badge className="border-0 text-[10px] bg-purple-500/20 text-[#F97316]">SÍNTESE</Badge>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Knowledge Flow Visualization */}
            <div className="bg-white/[0.02] rounded-lg p-4">
              <div className="text-[10px] text-[#4d4d4d] mb-3 font-medium">Fluxo de Conhecimento entre Agentes</div>
              <div className="flex items-center justify-center gap-1 flex-wrap">
                {profiles.filter((p) => p.agentId !== 'agent-8').map((p) => (
                  <div key={p.agentId} className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-lg bg-white/[0.04] flex items-center justify-center text-lg border border-[#2e2e2e]">
                      {getAgentIcon(p.agentId)}
                    </div>
                    <div className="text-[8px] text-[#363636] mt-1 font-mono">{p.agentId}</div>
                  </div>
                ))}
                <div className="mx-1 flex flex-col items-center">
                  <svg width="20" height="2" className="my-3"><line x1="0" y1="1" x2="20" y2="1" stroke="rgba(168,85,247,0.4)" strokeWidth="1" strokeDasharray="3,2"/></svg>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-lg bg-[#F97316]/10 flex items-center justify-center text-lg border border-purple-500/20 animate-zehla-glow">
                    📚
                  </div>
                  <div className="text-[8px] text-[#F97316] mt-1 font-mono">agent-8</div>
                </div>
              </div>
              <div className="mt-3 text-center">
                <div className="text-[10px] text-[#898989]">O Aprendiz sintetiza padrões de {profiles.length - 1} agentes e {profiles.reduce((s, p) => s + p.knowledgeBase.length, 0)} documentos</div>
              </div>
            </div>

            {/* Cross-Agent Insights */}
            <div className="bg-white/[0.02] rounded-lg p-4">
              <div className="text-[10px] text-[#4d4d4d] mb-3 font-medium">Insights Cross-Agent (Síntese em Tempo Real)</div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 rounded bg-white/[0.02]">
                  <span className="text-[#F97316] text-[10px]">✓</span>
                  <span className="text-[10px] text-[#b4b4b4]">Padrão horário pico idêntico em 4 propriedades (14h-16h)</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-white/[0.02]">
                  <span className="text-[#F97316] text-[10px]">✓</span>
                  <span className="text-[10px] text-[#b4b4b4]">12% overlap de intents entre Reservas e Recepcionista</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-white/[0.02]">
                  <span className="text-[#F97316] text-[10px]">⚡</span>
                  <span className="text-[10px] text-[#b4b4b4]">Marketing precisa de 23% mais dados sazonais (gap detectado)</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-white/[0.02]">
                  <span className="text-[#F97316] text-[10px]">✓</span>
                  <span className="text-[10px] text-[#b4b4b4]">Guardião + Financeiro: pipeline LGPD 99.7% compliance</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-white/[0.02]">
                  <span className="text-[#F97316] text-[10px]">🔄</span>
                  <span className="text-[10px] text-[#b4b4b4]">Otimização de latência: 5 agentes abaixo de 60ms</span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 bg-[#242424] rounded-full h-1.5">
                  <motion.div
                    className="h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-orange-500"
                    initial={{ width: 0 }}
                    animate={{ width: '82%' }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                  />
                </div>
                <span className="text-[10px] font-mono text-[#F97316]">82%</span>
              </div>
              <div className="text-[9px] text-[#363636] mt-1">Knowledge Synthesis Progress</div>
            </div>
          </div>
        </div>
      )}

      {/* ===== Section D: MAL Controls ===== */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-[#b4b4b4] flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-[#F97316]" />
          Controles MAL
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => fetch('/api/agents/learning', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'trigger_training', agentId: 'all' }) })}
            className="px-4 py-2 rounded-lg bg-[#F97316]/10 text-[#F97316] text-xs font-medium hover:bg-orange-500/30 transition-colors flex items-center gap-2"
          >
            <Zap className="w-3.5 h-3.5" />
            Disparar Treinamento Geral
          </button>
          <button
            onClick={() => fetch('/api/agents/learning', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'ingest_document', agentId: 'all', documentTitle: 'novo-documento.pdf' }) })}
            className="px-4 py-2 rounded-lg bg-cyan-500/20 text-[#F97316] text-xs font-medium hover:bg-cyan-500/30 transition-colors flex items-center gap-2"
          >
            <Database className="w-3.5 h-3.5" />
            Ingerir Documentos
          </button>
          <button
            onClick={() => { if (confirm('Tem certeza que deseja resetar o aprendizado de todos os agentes? Esta ação não pode ser desfeita.')) { fetch('/api/agents/learning', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'reset_agent', agentId: 'all' }) }); } }}
            className="px-4 py-2 rounded-lg bg-red-500/15 text-red-400 text-xs font-medium hover:bg-red-500/25 transition-colors flex items-center gap-2"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Resetar Aprendizado
          </button>
        </div>

        {/* Real-time Status Indicators */}
        <div className="mt-4 pt-4 border-t border-[#2e2e2e]">
          <div className="text-[10px] text-[#4d4d4d] mb-2 font-medium">Status de Treinamento em Tempo Real</div>
          <div className="flex flex-wrap gap-2">
            {trainingStatuses.map((ts) => (
              <div key={ts.agentId} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.02]">
                <span className="text-sm">{getAgentIcon(ts.agentId)}</span>
                <span className="text-[10px] text-[#898989] font-mono">{getAgentName(ts.agentId)}</span>
                <span className={`w-2 h-2 rounded-full ${
                  ts.status === 'ready' ? 'bg-[#F97316]' :
                  ts.status === 'training' ? 'bg-amber-400 animate-zehla-pulse' :
                  ts.status === 'learning' ? 'bg-purple-400 animate-zehla-pulse' :
                  'bg-neutral-500'
                }`} />
                {ts.status !== 'ready' && (
                  <span className="text-[10px] font-mono text-[#4d4d4d]">{ts.progress}%</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== SECURITY PANEL (Enhanced Inline Component) =====

function SecurityPanel() {
  const [security, setSecurity] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/security')
      .then((r) => r.json())
      .then((d) => {
        setSecurity(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const cb = security?.circuit_breaker as Record<string, unknown> | undefined;
  const services = (cb?.services as Array<Record<string, unknown>>) || [];
  const hitl = (security?.hitl_pending as Array<Record<string, unknown>>) || [];
  const verdicts = (security?.guardian_verdicts as Record<string, number>) || {};
  const guardian = security?.guardian_agent as Record<string, unknown> | undefined;
  const capabilities = (guardian?.capabilities as string[]) || [];

  return (
    <div className="space-y-6">
      {/* Guardian Anti-Hacker Agent */}
      {loading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : guardian && (
        <div className="glass-card p-6 border border-purple-500/20 bg-purple-500/[0.02]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#F97316]/10">
                <Shield className="w-6 h-6 text-[#F97316]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#efefef] flex items-center gap-2">
                  {String(guardian.name)}
                  <Badge variant="outline" className="border-[#F97316]/30 text-[#F97316] text-[10px]">
                    v{String(guardian.version)}
                  </Badge>
                </h3>
                <p className="text-xs text-[#4d4d4d] mt-0.5">Agente de segurança avançado — Proteção em tempo real</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full animate-zehla-pulse ${guardian.status === 'active' ? 'bg-[#F97316]' : 'bg-red-400'}`} />
              <Badge variant="outline" className={`border-0 text-[10px] ${guardian.status === 'active' ? 'bg-[#F97316]/10 text-[#F97316]' : 'bg-red-500/20 text-red-400'}`}>
                {guardian.status === 'active' ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="bg-white/[0.02] rounded-lg p-3">
              <div className="text-[10px] text-[#4d4d4d]">Ameaças Bloqueadas Hoje</div>
              <div className="text-lg font-bold text-red-400">{Number(guardian.threats_blocked_today || 0)}</div>
            </div>
            <div className="bg-white/[0.02] rounded-lg p-3">
              <div className="text-[10px] text-[#4d4d4d]">Ameaças Ativas</div>
              <div className="text-lg font-bold text-[#F97316]">{Number(guardian.active_threats || 0)}</div>
            </div>
            <div className="bg-white/[0.02] rounded-lg p-3">
              <div className="text-[10px] text-[#4d4d4d]">Último Scan</div>
              <div className="text-xs font-mono text-[#b4b4b4]">
                {guardian.last_scan
                  ? new Date(String(guardian.last_scan)).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                  : '—'}
              </div>
            </div>
            <div className="bg-white/[0.02] rounded-lg p-3">
              <div className="text-[10px] text-[#4d4d4d]">Capacidades</div>
              <div className="text-xs font-bold text-[#efefef]">{capabilities.length}</div>
            </div>
          </div>

          <div className="text-[10px] text-[#4d4d4d] mb-2 font-medium">Capacidades do Guardião</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {capabilities.map((cap, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02]">
                <Shield className="w-3 h-3 text-[#F97316] flex-shrink-0" />
                <span className="text-[10px] text-[#898989]">{cap}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ZDR Shield */}
      {loading ? (
        <Skeleton className="h-48 w-full rounded-xl" />
      ) : (
        <>
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-[#b4b4b4] mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#F97316]" />
              ZDR Shield Status
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  label: 'ZDR Status',
                  value: String(security?.zdr_status || 'unknown'),
                  ok: security?.zdr_status === 'active',
                },
                {
                  label: 'ZDR Uptime',
                  value: String((security?.zdr_uptime as string) || '—'),
                  ok: true,
                },
                {
                  label: 'LGPD Compliant',
                  value: security?.lgpd_compliant ? 'Sim' : 'Não',
                  ok: Boolean(security?.lgpd_compliant),
                },
                {
                  label: 'PCI DSS Compliant',
                  value: security?.pci_compliant ? 'Sim' : 'Não',
                  ok: Boolean(security?.pci_compliant),
                },
                {
                  label: 'Veredictos Safe',
                  value: String(verdicts.safe || 0),
                  ok: true,
                },
                {
                  label: 'Veredictos Review',
                  value: String(verdicts.review || 0),
                  ok: (verdicts.review || 0) < 50,
                },
                {
                  label: 'Veredictos Blocked',
                  value: String(verdicts.blocked || 0),
                  ok: (verdicts.blocked || 0) < 20,
                },
                {
                  label: 'Último Audit LGPD',
                  value: security?.lgpd_last_audit
                    ? new Date(String(security.lgpd_last_audit)).toLocaleDateString('pt-BR')
                    : '—',
                  ok: true,
                },
              ].map((item, i) => (
                <div key={i} className="bg-white/[0.02] rounded-lg p-3">
                  <div className="text-[10px] text-[#4d4d4d]">{item.label}</div>
                  <div className={`text-sm font-mono font-bold ${item.ok ? 'text-[#F97316]' : 'text-red-400'}`}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* HITL Pending Approvals */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-[#b4b4b4] mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#F97316]" />
              HITL — Aprovações Pendentes ({hitl.filter((h: Record<string, unknown>) => (h.status as string) === 'pending_review').length})
            </h3>
            <div className="space-y-2">
              {hitl.map((item: Record<string, unknown>, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        (item.status as string) === 'pending_review' ? 'bg-amber-400 animate-zehla-pulse' : 'bg-[#F97316]'
                      }`}
                    />
                    <div>
                      <div className="text-sm text-[#b4b4b4]">
                        {String(item.type).replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                      </div>
                      <div className="text-[10px] text-[#4d4d4d]">
                        {item.guest ? String(item.guest) : '—'}
                        {item.amount ? ` — ${String(item.amount)}` : ''}
                      </div>
                    </div>
                  </div>
                  <Badge
                    className={`border-0 text-[10px] ${
                      (item.status as string) === 'pending_review'
                        ? 'bg-[#F97316]/10 text-[#F97316]'
                        : 'bg-[#F97316]/10 text-[#F97316]'
                    }`}
                  >
                    {(item.status as string) === 'pending_review' ? 'Revisar' : 'Aprovado'}
                  </Badge>
                </div>
              ))}
              {hitl.length === 0 && (
                <div className="text-center py-8 text-[#363636] text-xs">Nenhuma aprovação pendente</div>
              )}
            </div>
          </div>

          {/* Circuit Breaker Status */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-[#b4b4b4] mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#F97316]" />
              Circuit Breaker
              <Badge className="border-0 text-[10px] bg-[#F97316]/10 text-[#F97316] ml-auto">
                {(cb?.status as string) || 'closed'}
              </Badge>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {services.map((svc: Record<string, unknown>, i: number) => (
                <div key={i} className="bg-white/[0.02] rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-[#4d4d4d] font-mono">{String(svc.name)}</span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        (svc.status as string) === 'healthy' ? 'bg-[#F97316]' : 'bg-amber-400'
                      }`}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#363636]">Latência</span>
                    <span
                      className={`text-xs font-mono ${
                        (svc.latency_ms as number) > 200 ? 'text-[#F97316]' : 'text-[#b4b4b4]'
                      }`}
                    >
                      {String(svc.latency_ms)}ms
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {!!cb?.last_trigger && (
              <div className="mt-3 text-[10px] text-[#363636] flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Último trigger:{' '}
                {new Date(String(cb.last_trigger)).toLocaleString('pt-BR')}
              </div>
            )}
          </div>

          {/* Security Events List */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-[#b4b4b4] mb-4 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-red-400" />
              Eventos de Segurança em Tempo Real
            </h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto zehla-scroll">
              {(security?.alerts as Array<any>)?.map((alert) => (
                <div key={alert.id} className="flex flex-col p-3 rounded-lg bg-white/[0.02] border border-[#2e2e2e] hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        alert.severity === 'CRITICAL' ? 'bg-red-500 animate-pulse' :
                        alert.severity === 'HIGH' ? 'bg-orange-500' :
                        'bg-amber-400'
                      }`} />
                      <span className="text-xs font-bold text-[#efefef]">{alert.type}</span>
                    </div>
                    <Badge variant="outline" className={`text-[9px] border-0 ${
                      alert.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                      'bg-neutral-500/20 text-[#898989]'
                    }`}>
                      {alert.severity}
                    </Badge>
                  </div>
                  <div className="text-[10px] text-[#4d4d4d] flex items-center gap-2 mb-2">
                    <span className="font-mono text-[#F97316]">Tenant: {alert.tenant}</span>
                    <span>•</span>
                    <span>{new Date(alert.timestamp).toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="bg-black/20 rounded p-2 text-[9px] font-mono text-[#898989] break-all">
                    {JSON.stringify(alert.details)}
                  </div>
                </div>
              ))}
              {(!security?.alerts || (security?.alerts as any[]).length === 0) && (
                <div className="text-center py-12 text-[#363636]">
                  <Shield className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-xs">Nenhuma ameaça detectada. Sistema nominal.</p>
                </div>
              )}
            </div>
          </div>

          {/* Compliance Badges */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-[#b4b4b4] mb-4 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-[#F97316]" />
              Compliance & Attestations
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'LGPD Compliance', value: 'PASS', details: '0 violações detectadas', ok: true },
                { label: 'PCI DSS Scan', value: 'PASS', details: 'Tokens de pagamento válidos', ok: true },
                { label: 'Sovereign Model Hash', value: 'PASS', details: 'SHA-256: 7f2d...a4b1', ok: true },
                { label: 'Data Encryption', value: 'PASS', details: 'AES-256 + TLS 1.3', ok: true },
                { label: 'Backup Status', value: 'PASS', details: 'Último: hoje 06:00', ok: true },
                { label: 'IP Whitelist', value: 'PASS', details: '3 IPs autorizadas', ok: true },
                { label: 'Rate Limiting', value: 'ACTIVE', details: '100 req/min por tenant', ok: true },
                { label: 'Audit Trail', value: 'ACTIVE', details: 'Logs últimos 90 dias', ok: true },
              ].map((item, i) => (
                <div key={i} className="bg-white/[0.02] rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-[#4d4d4d]">{item.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                        item.ok ? 'bg-[#F97316]/10 text-[#F97316]' : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {item.value}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#363636]">{item.details}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ===== SECRETARIA-IA INTEGRATION PANEL =====


// ===== TEAM MANAGEMENT TAB =====
function TeamManagementTab() {
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/zcc/team')
      .then(res => res.json())
      .then(data => setMembers(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  const [isAdding, setIsAdding] = useState(false);

  const availablePermissions = [
    { id: 'view_cognitivo', label: 'Cérebro Cognitivo' },
    { id: 'view_terminal', label: 'Terminal de Comando' },
    { id: 'view_agents', label: 'Gestão de Agentes' },
    { id: 'view_properties', label: 'Gestão de Pousadas' },
    { id: 'view_financial', label: 'Financeiro & Taxas' },
    { id: 'view_whatsapp', label: 'Fluxos de WhatsApp' },
    { id: 'view_apis', label: 'Configurações de API' },
    { id: 'view_security', label: 'Segurança & Auditoria' },
    { id: 'manage_team', label: 'Gerenciar Equipe' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#fafafa] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#F97316]" />
            Gestão de Equipe & Colaboradores
          </h2>
          <p className="text-xs text-[#4d4d4d]">Controle quem pode visualizar e operar cada módulo do ZCC.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Membro
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Members List */}
        <div className="lg:col-span-2 space-y-4">
          {members.map(member => (
            <div key={member.id} className="glass-card p-4 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#242424] border border-[#363636] flex items-center justify-center text-[#898989]">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#efefef]">{member.name}</div>
                  <div className="text-[10px] text-[#4d4d4d]">{member.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                    member.role === 'SUPER_ADMIN' ? 'bg-purple-500/20 text-[#F97316]' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {member.role}
                  </div>
                  <div className="text-[9px] text-[#363636] mt-1">{(member.permissions || []).length} permissões ativas</div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 hover:bg-[#242424] rounded-lg transition-colors">
                    <Edit3 className="w-4 h-4 text-[#898989]" />
                  </button>
                  <button className="p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4 text-red-400/60" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Permissions Inspector */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-[#b4b4b4] mb-4 flex items-center gap-2">
            <LockKeyhole className="w-4 h-4 text-[#F97316]" />
            Configuração de Acesso
          </h3>
          <div className="space-y-3">
            {availablePermissions.map(perm => (
              <label key={perm.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.02] cursor-pointer group">
                <span className="text-xs text-[#898989] group-hover:text-[#efefef] transition-colors">{perm.label}</span>
                <div className="w-8 h-4 rounded-full bg-[#2e2e2e] relative transition-colors">
                   <div className="absolute left-1 top-1 w-2 h-2 rounded-full bg-neutral-600" />
                </div>
              </label>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-[#2e2e2e]">
            <p className="text-[10px] text-[#4d4d4d] italic">
              * Membros com papel TEAM não podem alterar senhas ou configurações mestres de API sem autorização do SUPER_ADMIN.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== MAIN PAGE COMPONENT =====

export default function ZCCPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [userSession, setUserSession] = useState<{ role: string; permissions: string[] } | null>(null);
  const [activeTab, setActiveTab] = useState<ZCCTab>('overview');
  const [brainHealth, setBrainHealth] = useState<Record<string, unknown> | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Admin login gate
  useEffect(() => {
    // DEVELOPER BYPASS: Automatic login in dev mode for Marcio
    if (process.env.NODE_ENV === 'development') {
      setIsAdmin(true);
      setUserSession({
        role: 'admin',
        permissions: tabs.map(t => t.permission).filter(Boolean) as string[]
      });
      return;
    }

    try {
      const adminToken = localStorage.getItem('zehla-admin-token');
      if (adminToken) {
        const payload = JSON.parse(atob(adminToken));
        if ((payload.role === 'admin' || payload.role === 'team') && payload.exp > Date.now()) {
          setIsAdmin(true);
          setUserSession({
            role: payload.role,
            permissions: payload.permissions || []
          });
        } else {
          localStorage.removeItem('zehla-admin-token');
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    } catch {
      setIsAdmin(false);
    }
  }, []);

  // Redirect to admin login if not authenticated
  useEffect(() => {
    if (isAdmin === false) {
      router.push('/zcc-login');
    }
  }, [isAdmin, router]);

  // Load brain health (must be BEFORE any early return to respect Rules of Hooks)
  useEffect(() => {
    if (isAdmin !== true) return;
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/api/brain/health');
        const data = await res.json();
        if (!cancelled) setBrainHealth(data);
      } catch {
        // silent
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  // Loading state while checking admin session
  if (isAdmin === null || isAdmin === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#F97316]/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-[#4d4d4d]">Verificando acesso administrativo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#171717] text-[#b4b4b4] font-sans overflow-hidden">
      
      {/* ===== SIDEBAR ===== */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[#0f0f0f] border-r border-[#2e2e2e] transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'w-64' : 'w-0 -translate-x-full md:w-20 md:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-center md:justify-start px-4 border-b border-[#2e2e2e]">
          <Command className="w-6 h-6 text-[#F97316] flex-shrink-0" />
          <div className={`ml-3 whitespace-nowrap transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>
            <h1 className="font-bold text-sm text-[#fafafa] tracking-tight">ZEHLA Control</h1>
            <p className="text-[10px] text-[#4d4d4d] font-mono">v2.1.0-admin</p>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 zehla-scroll-y">
          {tabs.filter(tab => {
            if (userSession?.role === 'admin') return true;
            // @ts-ignore
            if (tab.permission && !userSession?.permissions.includes(tab.permission)) return false;
            return true;
          }).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (typeof window !== 'undefined' && window.innerWidth < 768) setSidebarOpen(false); // Auto close on mobile
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                  isActive
                    ? 'text-[#F97316] bg-[#F97316]/10'
                    : 'text-[#898989] hover:text-[#efefef] hover:bg-[#242424]'
                }`}
                title={!sidebarOpen ? tab.label : ''}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#F97316] rounded-r-full shadow-[0_0_10px_rgba(255,85,0,0.5)]" />
                )}
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-[#F97316]' : 'text-[#4d4d4d] group-hover:text-[#b4b4b4]'}`} />
                <span className={`whitespace-nowrap transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#2e2e2e]">
          <button
            onClick={() => { localStorage.removeItem('zehla-admin-token'); router.push('/zcc-login'); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#898989] hover:text-rose-400 hover:bg-rose-400/10 transition-all ${!sidebarOpen && 'justify-center md:justify-start'}`}
            title={!sidebarOpen ? 'Sair do ZCC' : ''}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className={`whitespace-nowrap transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>
              Sair do ZCC
            </span>
          </button>
        </div>
      </aside>

      {/* ===== MAIN CONTENT WRAPPER ===== */}
      <div className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
        
        {/* Top Header */}
        <header className="h-16 flex-shrink-0 bg-[#0f0f0f]/80 backdrop-blur-md border-b border-[#2e2e2e] flex items-center justify-between px-4 sm:px-6 z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-[#898989] hover:text-[#efefef] hover:bg-[#242424] rounded-lg transition-colors"
              aria-label="Toggle Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="text-[#4d4d4d] font-mono tracking-tight">ZCC</span>
              <ChevronRight className="w-4 h-4 text-[#363636]" />
              <span className="text-[#efefef] font-medium">
                {tabs.find(t => t.id === activeTab)?.label}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-[#F97316]/30 text-[#F97316] bg-[#F97316]/10 text-[10px] uppercase font-mono tracking-wider">
              {userSession?.role === 'admin' ? 'Super Admin' : 'Team'}
            </Badge>
          </div>
        </header>

        {/* Dynamic Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 zehla-scroll-y bg-[#171717]">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
            {/* Tab 1: Overview */}
            {activeTab === 'overview' && (
              <ZccAutoHealer fallbackName="Visão Global (SwarmOverview)">
                {brainHealth ? (
                  <SwarmOverview brainHealth={brainHealth} />
                ) : (
                  <div className="space-y-4">
                    <Skeleton className="h-48 w-full rounded-xl" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton key={i} className="h-40 rounded-xl" />
                      ))}
                    </div>
                  </div>
                )}
              </ZccAutoHealer>
            )}

            {/* Tab 2: Cognitivo */}
            {activeTab === 'cognitivo' && <ZccAutoHealer fallbackName="Painel Cognitivo"><CognitivePanel /></ZccAutoHealer>}

            {/* Tab 3: Terminal */}
            {activeTab === 'terminal' && <ZccAutoHealer fallbackName="Terminal Principal"><TerminalPanel /></ZccAutoHealer>}

            {/* Tab 4: Agentes */}
            {activeTab === 'agentes' && <ZccAutoHealer fallbackName="Gestão de Agentes"><AgentManagementPanel /></ZccAutoHealer>}

            {/* Tab 5: Propriedades */}
            {activeTab === 'propriedades' && <ZccAutoHealer fallbackName="Gestão de Propriedades"><TenantManagement /></ZccAutoHealer>}

            {/* Tab 6: Marketing */}
            {activeTab === 'marketing' && <ZccAutoHealer fallbackName="Marketing Leads"><MarketingLeads /></ZccAutoHealer>}

            {/* Tab 6.5: Visibilidade */}
            {activeTab === 'visibilidade' && <ZccAutoHealer fallbackName="Visibilidade SEO"><VisibilityDashboard /></ZccAutoHealer>}

            {/* Tab 7: Financeiro */}
            {activeTab === 'financeiro' && <ZccAutoHealer fallbackName="Fintech Hub"><FintechHub /></ZccAutoHealer>}

            {/* Tab 8: WhatsApp */}
            {activeTab === 'whatsapp' && <ZccAutoHealer fallbackName="Painel WhatsApp"><WhatsAppPanel /></ZccAutoHealer>}

            {/* Tab 9: APIs */}
            {activeTab === 'apis' && (
              <ZccAutoHealer fallbackName="Gestão de APIs">
                <ApiKeysPanel />
                <div className="mt-6" />
                <APIStatus />
              </ZccAutoHealer>
            )}



            {/* Tab 11: Equipe */}
            {activeTab === 'equipe' && <ZccAutoHealer fallbackName="Equipe Operacional"><TeamManagementTab /></ZccAutoHealer>}

            {/* Tab 12: Segurança */}
            {activeTab === 'seguranca' && <ZccAutoHealer fallbackName="Painel de Segurança"><SecurityPanel /></ZccAutoHealer>}
          </motion.div>
        </AnimatePresence>
        </div>
      </main>

      {/* ===== BOTTOM STATUS BAR ===== */}
      <div className="z-40 relative">
        <SystemStatusBar />
      </div>
    </div>
    </div>
  );
}
