'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, 
  Calendar, 
  MessageSquare, 
  TrendingUp, 
  ArrowUpRight, 
  Loader2, 
  ChevronDown, 
  ChevronUp, 
  MessageCircle, 
  Copy, 
  Check, 
  X,
  CreditCard
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/ddc/ddc-utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface RevenueMetricsProps {
  metrics: {
    today: {
      generated: number;
      reservations: number;
      aiAttended: number;
      conversionRate: number;
    };
    week: {
      generated: number;
      reservations: number;
      growth: number;
    };
    month: {
      generated: number;
      reservations: number;
      growth: number;
      projected: number;
    };
  };
  isLoading?: boolean;
}

interface TransactionDetails {
  id: string;
  guestName: string;
  roomName: string;
  amount: number;
  time: string;
  txId: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  chatExcerpt: Array<{
    sender: 'guest' | 'ai' | 'human';
    content: string;
    time: string;
  }>;
}

interface DetailsResponse {
  transactions: TransactionDetails[];
  totalRevenueToday: number;
  totalBookingsToday: number;
}

export function RevenueMetrics({ metrics }: RevenueMetricsProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailsData, setDetailsData] = useState<DetailsResponse | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);
  const [copiedTxId, setCopiedTxId] = useState<string | null>(null);

  const mainCards = [
    {
      id: 'today-revenue',
      title: 'Receita Hoje (IA)',
      value: metrics.today.generated,
      change: `${metrics.today.reservations} reservas via Pix`,
      icon: DollarSign,
      trend: '+24.5% vs ontem',
      badge: '100% IA',
      trendPositive: true,
      clickable: true
    },
    {
      id: 'ai-attended',
      title: 'Atendimentos IA Hoje',
      value: metrics.today.aiAttended,
      change: `Conversão de ${metrics.today.conversionRate}%`,
      icon: MessageSquare,
      trend: '+18.2% vs ontem',
      badge: 'Eficiente',
      trendPositive: true,
      clickable: false
    },
    {
      id: 'week-revenue',
      title: 'Receita Semanal',
      value: metrics.week.generated,
      change: `${metrics.week.reservations} reservas concluídas`,
      icon: Calendar,
      trend: `+${metrics.week.growth}% vs anterior`,
      badge: 'Semanal',
      trendPositive: true,
      clickable: false
    },
    {
      id: 'month-projection',
      title: 'Projeção Mensal',
      value: metrics.month.projected,
      change: `Meta de ${metrics.month.reservations} reservas`,
      icon: TrendingUp,
      trend: '+24.2% vs projetado',
      badge: 'Meta',
      trendPositive: true,
      clickable: false
    }
  ];

  const handleCardClick = async (cardId: string) => {
    if (cardId !== 'today-revenue') return;
    
    setIsDetailsOpen(true);
    setIsLoadingDetails(true);
    setExpandedTxId(null);
    try {
      const res = await fetch('/api/ddc/revenue-details');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setDetailsData(json.data);
        } else {
          toast.error('Erro ao carregar detalhes de receita.');
        }
      } else {
        toast.error('Erro na resposta da rede.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Erro ao conectar com o servidor.');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTxId(id);
    toast.success('Chave da transação copiada!');
    setTimeout(() => setCopiedTxId(null), 2000);
  };

  const toggleExpandTx = (id: string) => {
    setExpandedTxId(expandedTxId === id ? null : id);
  };

  return (
    <div className="space-y-4">
      {/* Grid de Métricas Principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {mainCards.map((card, index) => {
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <Card 
                onClick={() => handleCardClick(card.id)}
                className={`bg-[#121216] border border-white/[0.04] rounded-xl overflow-hidden transition-all duration-200 ${
                  card.clickable 
                    ? 'cursor-pointer hover:border-emerald-500/30 hover:bg-emerald-500/[0.01] active:scale-[0.99]' 
                    : 'hover:border-zinc-800'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                      {card.title}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border transition-colors ${
                      card.clickable 
                        ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' 
                        : 'border-white/[0.06] bg-white/[0.02] text-zinc-400'
                    }`}>
                      {card.badge}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-extrabold text-white tracking-tight font-sans">
                      {card.id === 'ai-attended' ? card.value : formatCurrency(card.value)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-1 min-w-0">
                    <p className="text-[10px] text-zinc-400 truncate flex-1 pr-1">
                      {card.change}
                    </p>
                    {card.clickable && (
                      <span className="text-[9px] text-emerald-400 font-bold shrink-0 hover:underline">
                        Ver detalhes
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 mt-2.5 pt-2 border-t border-white/[0.03]">
                    <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                    <span className="text-[9px] text-emerald-400 font-semibold font-mono">
                      {card.trend}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Métricas Secundárias em Linha Sutil */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Taxa de Resposta IA', value: '2.3s', sub: 'Média geral' },
          { label: 'Satisfação Hóspedes', value: '4.9/5', sub: '98.5% positivas' },
          { label: 'Taxa de Ocupação', value: '87%', sub: '+5% esta semana' },
          { label: 'Autonomia IA', value: '94%', sub: 'Sem intervenção' }
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
            className="bg-[#121216]/50 border border-white/[0.03] rounded-lg p-2.5"
          >
            <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
              {stat.label}
            </div>
            <div className="text-sm font-bold text-white mt-0.5 font-mono">{stat.value}</div>
            <div className="text-[8px] text-zinc-500 mt-0.5">{stat.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* MODAL DE DETALHES DA RECEITA HOJE */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="bg-[#0a0a0f] border border-white/[0.08] text-white max-w-xl p-6 rounded-xl shadow-2xl">
          <DialogHeader className="border-b border-white/[0.04] pb-4">
            <DialogTitle className="text-base font-extrabold text-white flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <DollarSign className="w-4 h-4" />
              </span>
              Receitas via Pix Confirmadas (Hoje)
            </DialogTitle>
            <DialogDescription className="text-zinc-500 text-xs">
              Lista de transações e fechamentos de reservas fechados de forma 100% autônoma pelo Zélla AI nas últimas 24 horas.
            </DialogDescription>
          </DialogHeader>

          {isLoadingDetails ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              <span className="text-xs text-zinc-500">Buscando transações no banco de dados...</span>
            </div>
          ) : (
            <div className="space-y-4 pt-4">
              {/* Summary Widgets */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#121216] border border-white/[0.04] rounded-lg p-3">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Faturamento IA</span>
                  <span className="text-lg font-mono font-extrabold text-emerald-400 mt-0.5 block">
                    {formatCurrency(detailsData?.totalRevenueToday ?? 0)}
                  </span>
                </div>
                <div className="bg-[#121216] border border-white/[0.04] rounded-lg p-3">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Total de Reservas</span>
                  <span className="text-lg font-mono font-extrabold text-white mt-0.5 block">
                    {detailsData?.totalBookingsToday ?? 0} reservas
                  </span>
                </div>
              </div>

              {/* Transactions List */}
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Histórico de Transações</span>
              <ScrollArea className="max-h-[300px] pr-1.5">
                <div className="space-y-2">
                  {detailsData?.transactions && detailsData.transactions.length > 0 ? (
                    detailsData.transactions.map((tx) => {
                      const isExpanded = expandedTxId === tx.id;
                      return (
                        <div 
                          key={tx.id} 
                          className="bg-[#121216] border border-white/[0.03] hover:border-white/[0.07] rounded-lg transition-all overflow-hidden"
                        >
                          {/* Transaction Header Info */}
                          <div 
                            onClick={() => toggleExpandTx(tx.id)}
                            className="p-3 flex items-center justify-between gap-4 cursor-pointer select-none"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white truncate">{tx.guestName}</span>
                                <span className="text-[9px] font-bold text-zinc-500 font-mono shrink-0">{tx.time}</span>
                              </div>
                              <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                                {tx.roomName} • {tx.nights} noites ({tx.checkIn} a {tx.checkOut})
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs font-mono font-extrabold text-emerald-400">
                                + {formatCurrency(tx.amount)}
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5 text-zinc-500" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                              )}
                            </div>
                          </div>

                          {/* Expansion Panel (Transcripts + Details) */}
                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="border-t border-white/[0.03] bg-[#0c0c10]"
                              >
                                <div className="p-3.5 space-y-3">
                                  {/* Pix E2E Key */}
                                  <div className="flex items-center justify-between gap-2 bg-[#0a0a0f] px-2 py-1.5 rounded border border-white/[0.03]">
                                    <div className="min-w-0 flex-1">
                                      <span className="text-[8px] text-zinc-500 font-mono block uppercase">ID Transação Pix</span>
                                      <span className="text-[9px] text-zinc-400 font-mono truncate block mt-0.5">{tx.txId}</span>
                                    </div>
                                    <button 
                                      onClick={() => copyToClipboard(tx.txId, tx.id)}
                                      className="p-1 rounded hover:bg-white/[0.04] text-zinc-500 hover:text-zinc-300 transition-colors shrink-0"
                                      title="Copiar ID da Transação"
                                    >
                                      {copiedTxId === tx.id ? (
                                        <Check className="w-3 h-3 text-emerald-400" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                    </button>
                                  </div>

                                  {/* Chat Excerpt Container */}
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-1.5">
                                      <MessageCircle className="w-3 h-3 text-emerald-400" />
                                      <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Fechamento pelo Zélla (WhatsApp)</span>
                                    </div>
                                    
                                    <div className="bg-[#0a0a0f]/60 rounded-lg p-3 border border-white/[0.02] space-y-3">
                                      {tx.chatExcerpt.map((msg, index) => {
                                        const isGuest = msg.sender === 'guest';
                                        return (
                                          <div 
                                            key={index} 
                                            className={`flex flex-col ${isGuest ? 'items-start' : 'items-end'}`}
                                          >
                                            <div className={`rounded-xl p-2.5 max-w-[85%] text-xs leading-relaxed ${
                                              isGuest 
                                                ? 'bg-[#18181f] text-zinc-200 rounded-tl-none' 
                                                : 'bg-emerald-500/10 text-emerald-100 border border-emerald-500/15 rounded-tr-none'
                                            }`}>
                                              <p className="whitespace-pre-line">{msg.content}</p>
                                              <span className="text-[8px] text-zinc-500 block text-right mt-1.5 font-mono">{msg.time}</span>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-zinc-600 text-xs">
                      Nenhum Pix recebido hoje.
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              <div className="pt-2 border-t border-white/[0.04] flex justify-end">
                <button
                  onClick={() => setIsDetailsOpen(false)}
                  className="px-4 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}