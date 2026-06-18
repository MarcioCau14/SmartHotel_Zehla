'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QueryProvider } from '@/components/providers/query-provider';
import { useReadinessEvaluation, ReadinessAnswers, RoiInput } from '@/hooks/useReadinessEvaluation';
import { 
  Building2, 
  HelpCircle, 
  ShieldCheck, 
  TrendingUp, 
  Briefcase, 
  Users, 
  CheckSquare, 
  Sparkles, 
  Download, 
  Check, 
  AlertTriangle,
  ArrowRight,
  Gauge
} from 'lucide-react';
import { toast } from 'sonner';

function DashboardContent() {
  const { 
    playbookStatus, 
    evaluate, 
    isEvaluating, 
    isRefetchingStatus 
  } = useReadinessEvaluation();

  // Local state for answers (instant check response)
  const [answers, setAnswers] = useState<ReadinessAnswers>({
    hasPMS: false,
    hasChannelManager: false,
    hasBookingEngine: false,
    hasWhatsAppAutomation: false,
    hasReviewAutomation: false,
    hasConsolidatedDatabase: false,
    hasHistoricalData: false,
    teamOpenToAI: false,
    teamTrained: false,
    hasLgpdConsent: false,
    hasLgpdDeletionProcess: false,
    hasSecureDataStorage: false,
    propertyName: '',
    notes: ''
  });

  // Local state for ROI inputs (instant slider response)
  const [roomsCount, setRoomsCount] = useState<number>(20);
  const [adr, setAdr] = useState<number>(300);
  const [occupancy, setOccupancy] = useState<number>(50);
  const [staffHourlyRate, setStaffHourlyRate] = useState<number>(25);

  // Debounced/lazy state to prevent excessive recalculations in react
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Real-time calculations matching domain logic for premium, interactive UX
  const localStats = useMemo(() => {
    let scorePoints = 0;
    if (answers.hasPMS) scorePoints += 15;
    if (answers.hasChannelManager) scorePoints += 15;
    if (answers.hasBookingEngine) scorePoints += 10;
    if (answers.hasWhatsAppAutomation) scorePoints += 15;
    if (answers.hasReviewAutomation) scorePoints += 10;
    if (answers.hasConsolidatedDatabase) scorePoints += 10;
    if (answers.hasHistoricalData) scorePoints += 10;
    if (answers.teamOpenToAI) scorePoints += 10;
    if (answers.teamTrained) scorePoints += 5;

    const score = Math.min(scorePoints, 100);

    let category: 'Co-Pilots' | 'Brains' | 'Autonomous Agents' = 'Co-Pilots';
    if (score >= 40 && score <= 75) {
      category = 'Brains';
    } else if (score > 75) {
      category = 'Autonomous Agents';
    }

    let securePoints = 0;
    if (answers.hasLgpdConsent) securePoints++;
    if (answers.hasLgpdDeletionProcess) securePoints++;
    if (answers.hasSecureDataStorage) securePoints++;

    let lgpdRisk: 'LOW' | 'MEDIUM' | 'HIGH' = 'HIGH';
    if (securePoints === 3) lgpdRisk = 'LOW';
    else if (securePoints === 2) lgpdRisk = 'MEDIUM';

    // ROI
    const occupancyDecimal = occupancy / 100;
    let occupancyBoostPercent = 8.0;
    if (occupancyDecimal < 0.4) {
      occupancyBoostPercent = 12.0;
    } else if (occupancyDecimal > 0.8) {
      occupancyBoostPercent = 4.0;
    }

    const totalRoomsAvailable = roomsCount * 30;
    const currentMonthlyRevenue = totalRoomsAvailable * occupancyDecimal * adr;
    const occupancyRevenueGain = totalRoomsAvailable * (occupancyBoostPercent / 100) * adr;
    const otaCommissionSavings = currentMonthlyRevenue * 0.5 * 0.15 * 0.15;
    const dailyTimeSavedMinutes = (roomsCount / 5) * 30;
    const staffTimeSavedHours = parseFloat(((dailyTimeSavedMinutes * 30) / 60).toFixed(1));
    const staffCostSavings = staffTimeSavedHours * staffHourlyRate;
    const totalMonthlyGain = Math.round(occupancyRevenueGain + otaCommissionSavings + staffCostSavings);

    return {
      score,
      category,
      lgpdRisk,
      occupancyBoostPercent,
      occupancyRevenueGain: Math.round(occupancyRevenueGain),
      otaCommissionSavings: Math.round(otaCommissionSavings),
      staffTimeSavedHours,
      staffCostSavings: Math.round(staffCostSavings),
      totalMonthlyGain,
      totalYearlyGain: totalMonthlyGain * 12
    };
  }, [answers, roomsCount, adr, occupancy, staffHourlyRate]);

  const handleEvaluate = async () => {
    try {
      const roiInput: RoiInput = {
        roomsCount,
        averageDailyRate: adr,
        currentOccupancy: occupancy,
        staffAverageHourlyRate: staffHourlyRate
      };

      toast.promise(evaluate({ answers, roiInput }), {
        loading: 'Enviando avaliação para o cérebro ZEHLA...',
        success: () => {
          setHasSubmitted(true);
          return 'Cálculo inicial concluído! Playbook está sendo gerado...';
        },
        error: 'Erro ao processar sua avaliação.'
      });
    } catch (e: any) {
      console.error(e);
    }
  };

  const isPlaybookGenerating = hasSubmitted && !playbookStatus?.playbookUrl;

  return (
    <div className="min-h-screen bg-[#060814] text-[#e2e8f0] font-sans selection:bg-[#4169e1]/30 selection:text-white">
      {/* Ambient backgrounds */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[5%] w-[45vw] h-[45vw] rounded-full blur-[140px] opacity-[0.08]"
          style={{ background: 'radial-gradient(circle, #4169E1, transparent)' }} />
        <div className="absolute bottom-[-10%] right-[5%] w-[40vw] h-[40vw] rounded-full blur-[140px] opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #14b8a6, transparent)' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-[rgba(255,255,255,0.06)] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[rgba(65,105,225,0.15)] text-[#4169e1] border border-[rgba(65,105,225,0.2)]">
                ZRT Module
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#14b8a6] animate-pulse" />
              <span className="text-[10px] uppercase tracking-wider text-[#64748b] font-mono">v4.0.0</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-[#cbd5e1] to-[#64748b] bg-clip-text text-transparent">
              Maturidade AI & Transformação Digital
            </h1>
            <p className="text-sm text-[#94a3b8] mt-1 max-w-2xl">
              Avalie o nível de prontidão da sua pousada para agentes de IA autônomos, simule o ROI financeiro de automação e gere seu Playbook de Rollout.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <a href="/" className="inline-flex items-center gap-2 text-xs font-medium text-[#94a3b8] hover:text-white transition-colors bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] px-4 py-2.5 rounded-xl">
              Voltar ao OS principal
            </a>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT PANEL: Inputs (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Property details */}
            <div className="bg-[rgba(10,14,26,0.5)] backdrop-blur-xl border border-[rgba(255,255,255,0.05)] rounded-2xl p-5 shadow-2xl relative overflow-hidden">
              <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#4169e1]" /> Identificação da Propriedade
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#94a3b8] uppercase mb-1">Nome da Pousada / Hotel</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Pousada Recanto do Sol"
                    value={answers.propertyName}
                    onChange={(e) => setAnswers({ ...answers, propertyName: e.target.value })}
                    className="w-full bg-[#060814]/80 border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#4169e1] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#94a3b8] uppercase mb-1">Observações do Negócio</label>
                  <textarea 
                    rows={2}
                    placeholder="Quais seus maiores gargalos? Ex: Muito tempo respondendo WhatsApp de cotação..."
                    value={answers.notes}
                    onChange={(e) => setAnswers({ ...answers, notes: e.target.value })}
                    className="w-full bg-[#060814]/80 border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#4169e1] transition-colors resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Sliders (ROI Parameters) */}
            <div className="bg-[rgba(10,14,26,0.5)] backdrop-blur-xl border border-[rgba(255,255,255,0.05)] rounded-2xl p-5 shadow-2xl relative overflow-hidden">
              <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#14b8a6]" /> Parâmetros e Operação
              </h2>
              
              <div className="space-y-5">
                {/* Rooms Count */}
                <div>
                  <div className="flex justify-between items-center text-xs font-semibold uppercase mb-1.5">
                    <span className="text-[#94a3b8]">Quantidade de Quartos</span>
                    <span className="text-white font-mono">{roomsCount}</span>
                  </div>
                  <input 
                    type="range" 
                    min="5" 
                    max="150" 
                    value={roomsCount}
                    onChange={(e) => setRoomsCount(Number(e.target.value))}
                    className="w-full h-1.5 bg-[rgba(255,255,255,0.08)] rounded-lg appearance-none cursor-pointer accent-[#14b8a6]"
                  />
                </div>

                {/* Average Daily Rate */}
                <div>
                  <div className="flex justify-between items-center text-xs font-semibold uppercase mb-1.5">
                    <span className="text-[#94a3b8]">Diária Média (ADR)</span>
                    <span className="text-white font-mono">R$ {adr}</span>
                  </div>
                  <input 
                    type="range" 
                    min="100" 
                    max="2000" 
                    step="50"
                    value={adr}
                    onChange={(e) => setAdr(Number(e.target.value))}
                    className="w-full h-1.5 bg-[rgba(255,255,255,0.08)] rounded-lg appearance-none cursor-pointer accent-[#14b8a6]"
                  />
                </div>

                {/* Occupancy Rate */}
                <div>
                  <div className="flex justify-between items-center text-xs font-semibold uppercase mb-1.5">
                    <span className="text-[#94a3b8]">Ocupação Média</span>
                    <span className="text-white font-mono">{occupancy}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="95" 
                    step="5"
                    value={occupancy}
                    onChange={(e) => setOccupancy(Number(e.target.value))}
                    className="w-full h-1.5 bg-[rgba(255,255,255,0.08)] rounded-lg appearance-none cursor-pointer accent-[#14b8a6]"
                  />
                </div>

                {/* Staff Hourly Rate */}
                <div>
                  <div className="flex justify-between items-center text-xs font-semibold uppercase mb-1.5">
                    <span className="text-[#94a3b8]">Custo Médio de Hora de Staff</span>
                    <span className="text-white font-mono">R$ {staffHourlyRate}/h</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    value={staffHourlyRate}
                    onChange={(e) => setStaffHourlyRate(Number(e.target.value))}
                    className="w-full h-1.5 bg-[rgba(255,255,255,0.08)] rounded-lg appearance-none cursor-pointer accent-[#14b8a6]"
                  />
                </div>
              </div>
            </div>

            {/* Checklist of maturity options */}
            <div className="bg-[rgba(10,14,26,0.5)] backdrop-blur-xl border border-[rgba(255,255,255,0.05)] rounded-2xl p-5 shadow-2xl relative overflow-hidden">
              <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-[#a855f7]" /> Stack & Compliance (LGPD)
              </h2>

              <div className="space-y-4">
                {/* Tech checks */}
                <div className="space-y-2.5">
                  <div className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Maturidade Tecnológica</div>
                  {[
                    { key: 'hasPMS', label: 'Possui PMS (Sistema de Gestão)' },
                    { key: 'hasChannelManager', label: 'Possui Channel Manager' },
                    { key: 'hasBookingEngine', label: 'Possui Motor de Reservas Direto' },
                    { key: 'hasWhatsAppAutomation', label: 'Automação / Chatbot de WhatsApp' },
                    { key: 'hasReviewAutomation', label: 'Garante automação de reviews pós-check-out' },
                    { key: 'hasConsolidatedDatabase', label: 'Banco de Dados centralizado de Clientes' },
                    { key: 'hasHistoricalData', label: 'Dados Históricos disponíveis (> 1 ano)' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-start gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={!!(answers as any)[item.key]}
                        onChange={(e) => setAnswers({ ...answers, [item.key]: e.target.checked })}
                        className="mt-0.5 rounded border-[rgba(255,255,255,0.15)] bg-[#060814]/80 text-[#a855f7] focus:ring-[#a855f7]/30 focus:ring-offset-0 focus:ring-1"
                      />
                      <span className="text-xs text-[#cbd5e1] group-hover:text-white transition-colors">{item.label}</span>
                    </label>
                  ))}
                </div>

                {/* Cultural/Compliance checks */}
                <div className="space-y-2.5 pt-2 border-t border-[rgba(255,255,255,0.05)]">
                  <div className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Processos & Compliance</div>
                  {[
                    { key: 'teamOpenToAI', label: 'Equipe aberta a ferramentas de IA' },
                    { key: 'teamTrained', label: 'Equipe treinada em ferramentas digitais' },
                    { key: 'hasLgpdConsent', label: 'Possui Termo de Consentimento LGPD' },
                    { key: 'hasLgpdDeletionProcess', label: 'Processo estruturado de Exclusão de Dados' },
                    { key: 'hasSecureDataStorage', label: 'Armazenamento seguro (dados criptografados)' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-start gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={!!(answers as any)[item.key]}
                        onChange={(e) => setAnswers({ ...answers, [item.key]: e.target.checked })}
                        className="mt-0.5 rounded border-[rgba(255,255,255,0.15)] bg-[#060814]/80 text-[#a855f7] focus:ring-[#a855f7]/30 focus:ring-offset-0 focus:ring-1"
                      />
                      <span className="text-xs text-[#cbd5e1] group-hover:text-white transition-colors">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Evaluate Trigger Button */}
            <button 
              onClick={handleEvaluate}
              disabled={isEvaluating}
              className="w-full bg-gradient-to-r from-[#4169e1] to-[#14b8a6] hover:from-[#3256cd] hover:to-[#0f9a88] text-white font-semibold py-3 px-4 rounded-2xl shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:scale-[1.01]"
            >
              {isEvaluating ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Calculando Maturidade...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Calcular e Gerar Playbook
                </>
              )}
            </button>

          </div>

          {/* RIGHT PANEL: Results (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Score & Category HUD */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-[rgba(10,14,26,0.4)] backdrop-blur-xl border border-[rgba(255,255,255,0.05)] rounded-3xl p-6 shadow-2xl relative overflow-hidden">
              
              {/* Circular Gauge Score (5 Cols) */}
              <div className="md:col-span-5 flex flex-col items-center justify-center">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background track */}
                    <circle 
                      cx="50" cy="50" r="42" 
                      className="stroke-[rgba(255,255,255,0.04)] fill-none" 
                      strokeWidth="8"
                    />
                    {/* Colored score track */}
                    <circle 
                      cx="50" cy="50" r="42" 
                      className="fill-none transition-all duration-1000 ease-out" 
                      strokeWidth="8"
                      strokeDasharray="263.89"
                      strokeDashoffset={263.89 - (263.89 * localStats.score) / 100}
                      strokeLinecap="round"
                      stroke={
                        localStats.score < 40 
                          ? '#ef4444' 
                          : localStats.score <= 75 
                          ? '#f59e0b' 
                          : '#10b981'
                      }
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-extrabold text-white tracking-tighter">
                      {localStats.score}
                    </span>
                    <span className="text-[9px] text-[#64748b] uppercase tracking-wider font-semibold">
                      Maturidade Score
                    </span>
                  </div>
                </div>
              </div>

              {/* Status and explanation (7 Cols) */}
              <div className="md:col-span-7 flex flex-col justify-center space-y-4">
                <div>
                  <div className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider mb-1">
                    Classificação ZRT
                  </div>
                  <div className="text-xl font-extrabold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" 
                      style={{ 
                        backgroundColor: 
                          localStats.score < 40 
                            ? '#ef4444' 
                            : localStats.score <= 75 
                            ? '#f59e0b' 
                            : '#10b981'
                      }} 
                    />
                    {localStats.category}
                  </div>
                </div>

                <p className="text-xs text-[#cbd5e1] leading-relaxed">
                  {localStats.category === 'Co-Pilots' 
                    ? 'Maturidade Inicial. O hotel foca em centralização manual e uso de assistentes de IA de apoio (Co-pilotos). Ideal para ganhar velocidade em templates e respostas simples de WhatsApp.'
                    : localStats.category === 'Brains'
                    ? 'Maturidade Intermediária. Processos conectados. Recomendado integrar motores preditivos de tarifas (Revenue AI) e campanhas ativas automatizadas com base no banco de dados.'
                    : 'Maturidade Altamente Avançada. Operação focada em automação ponta-a-ponta e tomadas de decisão autônomas no WhatsApp, CRM e cancelamentos.'}
                </p>

                <div className="flex items-center gap-4 pt-2 border-t border-[rgba(255,255,255,0.05)]">
                  <div>
                    <div className="text-[9px] text-[#64748b] uppercase font-semibold">LGPD Risco</div>
                    <span className={`text-xs font-bold ${
                      localStats.lgpdRisk === 'LOW' 
                        ? 'text-[#10b981]' 
                        : localStats.lgpdRisk === 'MEDIUM' 
                        ? 'text-[#f59e0b]' 
                        : 'text-[#ef4444]'
                    }`}>
                      {localStats.lgpdRisk}
                    </span>
                  </div>
                  <div>
                    <div className="text-[9px] text-[#64748b] uppercase font-semibold">Boost Ocupação</div>
                    <span className="text-xs font-bold text-[#14b8a6]">+{localStats.occupancyBoostPercent}%</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Financial ROI Predictions */}
            <div className="bg-[rgba(10,14,26,0.4)] backdrop-blur-xl border border-[rgba(255,255,255,0.05)] rounded-3xl p-6 shadow-2xl relative overflow-hidden">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#14b8a6]" /> Projeções Estimadas de ROI
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                
                <div className="bg-[#060814]/40 border border-[rgba(255,255,255,0.03)] rounded-2xl p-4">
                  <div className="text-[10px] text-[#64748b] uppercase font-semibold">Boost de Ocupação</div>
                  <div className="text-lg font-bold text-white mt-1">
                    R$ {localStats.occupancyRevenueGain.toLocaleString('pt-BR')}
                  </div>
                  <div className="text-[10px] text-[#94a3b8] mt-0.5">médio por mês</div>
                </div>

                <div className="bg-[#060814]/40 border border-[rgba(255,255,255,0.03)] rounded-2xl p-4">
                  <div className="text-[10px] text-[#64748b] uppercase font-semibold">Recuperação de OTAs</div>
                  <div className="text-lg font-bold text-white mt-1">
                    R$ {localStats.otaCommissionSavings.toLocaleString('pt-BR')}
                  </div>
                  <div className="text-[10px] text-[#94a3b8] mt-0.5">com reservas diretas</div>
                </div>

                <div className="bg-[#060814]/40 border border-[rgba(255,255,255,0.03)] rounded-2xl p-4">
                  <div className="text-[10px] text-[#64748b] uppercase font-semibold">Economia de Staff</div>
                  <div className="text-lg font-bold text-white mt-1">
                    R$ {localStats.staffCostSavings.toLocaleString('pt-BR')}
                  </div>
                  <div className="text-[10px] text-[#94a3b8] mt-0.5">{localStats.staffTimeSavedHours}h poupadas/mês</div>
                </div>

              </div>

              {/* Total Summary */}
              <div className="bg-gradient-to-r from-[rgba(65,105,225,0.08)] to-[rgba(20,184,166,0.08)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] text-[#94a3b8] uppercase tracking-wider font-bold">Ganho Total Mensal Estimado</div>
                  <div className="text-2xl font-black text-white mt-1">
                    R$ {localStats.totalMonthlyGain.toLocaleString('pt-BR')}
                  </div>
                </div>
                <div className="text-left md:text-right">
                  <div className="text-[10px] text-[#94a3b8] uppercase tracking-wider font-bold">Retorno Estimado Anual</div>
                  <div className="text-xl font-bold bg-gradient-to-r from-[#14b8a6] to-[#4169e1] bg-clip-text text-transparent mt-1">
                    R$ {localStats.totalYearlyGain.toLocaleString('pt-BR')}
                  </div>
                </div>
              </div>
            </div>

            {/* Playbook Generation & Download Portal */}
            <div className="bg-[rgba(10,14,26,0.4)] backdrop-blur-xl border border-[rgba(255,255,255,0.05)] rounded-3xl p-6 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-[#a855f7]" /> Playbook de Rollout Executivo
                  </h3>
                  <p className="text-xs text-[#cbd5e1] max-w-md">
                    Documento executivo estruturado com o roadmap de prioridade de rollout, análise LGPD detalhada e estratégias comerciais customizadas para o seu hotel.
                  </p>
                </div>

                <div className="w-full md:w-auto">
                  <AnimatePresence mode="wait">
                    {isPlaybookGenerating ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] px-5 py-3 rounded-2xl flex items-center gap-3 text-xs text-[#cbd5e1]"
                      >
                        <span className="w-4 h-4 border-2 border-white/20 border-t-[#a855f7] rounded-full animate-spin" />
                        Gerando playbook na fila BullMQ...
                      </motion.div>
                    ) : playbookStatus?.playbookUrl ? (
                      <motion.a 
                        href={playbookStatus.playbookUrl}
                        download
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-[#a855f7] hover:bg-[#8e3ec8] text-white px-5 py-3 rounded-2xl font-bold shadow-lg transition-all duration-300 hover:scale-[1.02]"
                      >
                        <Download className="w-4 h-4" /> Baixar Playbook (Markdown)
                      </motion.a>
                    ) : (
                      <button 
                        disabled
                        className="w-full md:w-auto bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] text-[#64748b] px-5 py-3 rounded-2xl text-xs font-semibold cursor-not-allowed"
                      >
                        Aguardando Avaliação...
                      </button>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Status information if fetching */}
              {isRefetchingStatus && (
                <div className="absolute top-2 right-2 text-[8px] uppercase font-mono text-[#64748b] animate-pulse">
                  Verificando fila...
                </div>
              )}
            </div>

            {/* Recommended Agents Preview */}
            <div className="bg-[rgba(10,14,26,0.4)] backdrop-blur-xl border border-[rgba(255,255,255,0.05)] rounded-3xl p-6 shadow-2xl relative overflow-hidden">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#4169e1]" /> Rollout sugerido de Agentes ZEHLA
              </h3>

              <div className="space-y-3">
                {/* Agent 1 */}
                <div className="bg-[#060814]/40 border border-[rgba(255,255,255,0.03)] rounded-2xl p-4 flex gap-4 items-start">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    answers.hasWhatsAppAutomation ? 'bg-[rgba(255,255,255,0.04)] text-[#64748b]' : 'bg-[rgba(239,68,68,0.1)] text-[#ef4444]'
                  }`}>
                    {answers.hasWhatsAppAutomation ? 'OK' : '1'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">Recepcionista Virtual (WhatsApp AI)</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        answers.hasWhatsAppAutomation ? 'bg-[rgba(255,255,255,0.05)] text-[#64748b]' : 'bg-[#ef4444]/15 text-[#ef4444]'
                      }`}>
                        {answers.hasWhatsAppAutomation ? 'IMPLANTADO' : 'MUITO CRÍTICO'}
                      </span>
                    </div>
                    <p className="text-xs text-[#cbd5e1] mt-1">
                      {answers.hasWhatsAppAutomation 
                        ? 'Você já possui atendimento básico de WhatsApp. Próximo passo: integrar com dados do PMS para check-in autônomo.' 
                        : 'Atendimento atual manual. A implantação no Dia-1 reduz o tempo de resposta médio de 2h para 15 segundos.'}
                    </p>
                  </div>
                </div>

                {/* Agent 2 */}
                <div className="bg-[#060814]/40 border border-[rgba(255,255,255,0.03)] rounded-2xl p-4 flex gap-4 items-start">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    answers.hasPMS ? 'bg-[rgba(168,85,247,0.1)] text-[#a855f7]' : 'bg-[rgba(255,255,255,0.04)] text-[#64748b]'
                  }`}>
                    {!answers.hasPMS ? 'BLOQ' : '2'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">Gestor de Ocupação & Tarifas (Revenue AI)</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        !answers.hasPMS ? 'bg-[rgba(255,255,255,0.05)] text-[#64748b]' : 'bg-[#a855f7]/15 text-[#a855f7]'
                      }`}>
                        {!answers.hasPMS ? 'REQUISITO PMS' : 'ALTA PRIORIDADE'}
                      </span>
                    </div>
                    <p className="text-xs text-[#cbd5e1] mt-1">
                      {!answers.hasPMS 
                        ? 'Para utilizar pricing autônomo de alta complexidade com IA, é necessário primeiro implantar um PMS (Ex: Totvs, Hospedin).' 
                        : 'A IA gerenciará tarifas dinâmicas ajustando conforme demanda, eventos e concorrência para otimizar o RevPAR.'}
                    </p>
                  </div>
                </div>

                {/* Agent 3 */}
                <div className="bg-[#060814]/40 border border-[rgba(255,255,255,0.03)] rounded-2xl p-4 flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-xl bg-[rgba(20,184,166,0.1)] text-[#14b8a6] flex items-center justify-center font-bold text-xs shrink-0">
                    3
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">Social Seller AI (Instagram Auto-responder)</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#14b8a6]/15 text-[#14b8a6]">
                        ALTO IMPACTO
                      </span>
                    </div>
                    <p className="text-xs text-[#cbd5e1] mt-1">
                      Captação direta de leads a partir de comentários e DMs do Instagram, vinculando diretamente ao fluxo de cotações automáticas.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default function ReadinessDashboardPage() {
  return (
    <QueryProvider>
      <DashboardContent />
    </QueryProvider>
  );
}
