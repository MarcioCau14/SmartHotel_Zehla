'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, Flame, CheckCircle2, XCircle, Filter, Search, Plus, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getGuestStatusColor, formatCurrency } from '@/lib/ddc/ddc-utils';
import type { Guest, GuestStatus } from '@/types/ddc';

interface GuestCRMPipelineProps {
  pipeline?: {
    hot: Guest[];
    warm: Guest[];
    cold: Guest[];
    closed: Guest[];
    lost: Guest[];
  };
  onStatusChange?: (guestId: string, newStatus: GuestStatus) => void;
  onFilterChange?: (filters: any) => void;
  allGuests?: Guest[];
}

export function GuestCRMPipeline({
  pipeline = { hot: [], warm: [], cold: [], closed: [], lost: [] },
  onStatusChange,
  onFilterChange,
  allGuests = []
}: GuestCRMPipelineProps) {
  const [filterStatus, setFilterStatus] = useState<GuestStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const pipelineStages: { status: GuestStatus; label: string; color: string; count: number }[] = [
    { status: 'cold', label: 'Novos / Frios', color: 'from-blue-500 to-cyan-500', count: pipeline.cold?.length || 0 },
    { status: 'warm', label: 'Mornos', color: 'from-yellow-500 to-orange-500', count: pipeline.warm?.length || 0 },
    { status: 'hot', label: 'Quentes 🔥', color: 'from-orange-500 to-red-500', count: pipeline.hot?.length || 0 },
    { status: 'closed', label: 'Reservados', color: 'from-emerald-500 to-green-500', count: pipeline.closed?.length || 0 },
    { status: 'lost', label: 'Perdidos', color: 'from-gray-500 to-slate-500', count: pipeline.lost?.length || 0 },
  ];

  // Resolve which list of guests to display
  const guestsToDisplay = useMemo(() => {
    if (filterStatus === 'all') {
      return allGuests;
    }
    return (pipeline as any)[filterStatus] || [];
  }, [filterStatus, pipeline, allGuests]);

  const filteredGuests = useMemo(() => {
    return (guestsToDisplay || []).filter((guest: Guest) => {
      const matchesSearch =
        guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (guest.phoneNumber || guest.phone || '').includes(searchQuery);
      return matchesSearch;
    });
  }, [guestsToDisplay, searchQuery]);

  const getStatusLabel = (status: Guest['status']) => {
    const labels: Record<string, string> = {
      cold: 'Frio',
      warm: 'Morno',
      hot: 'Quente',
      closed: 'Fechado',
      lost: 'Perdido'
    };
    return labels[status] || status;
  };

  const slideIn = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: 'easeOut' as const
      }
    })
  } as const;

  const totalGuestsCount = allGuests.length || 1; // avoid division by zero

  return (
    <Card className="bg-white/[0.02] border border-white/[0.06] h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-white/[0.06]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-white">Pipeline de Hóspedes</CardTitle>
              <p className="text-[10px] text-white/40 font-mono">
                {allGuests.length} leads na esteira • CRM Automático
              </p>
            </div>
          </div>
          <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600">
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            <span className="text-xs">Add Lead</span>
          </Button>
        </div>
      </CardHeader>

      <div className="flex-1 flex overflow-hidden">
        {/* Pipeline Stages Sidebar */}
        <div className="w-56 border-r border-white/[0.06] p-3 space-y-2">
          {pipelineStages.map((stage, index) => (
            <motion.button
              key={stage.status}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setFilterStatus(stage.status)}
              className={`w-full text-left p-3 rounded-lg border transition-all ${
                filterStatus === stage.status
                  ? `bg-gradient-to-r ${stage.color} border-white/20`
                  : 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-white">{stage.label}</span>
                <Badge variant="outline" className={`text-[9px] h-5 ${
                  filterStatus === stage.status ? 'bg-white/20 text-white border-white/30' : 'bg-white/10 text-white/70'
                }`}>
                  {stage.count}
                </Badge>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full bg-gradient-to-r ${stage.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${(stage.count / totalGuestsCount) * 100}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                />
              </div>
            </motion.button>
          ))}

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            onClick={() => setFilterStatus('all')}
            className={`w-full text-left p-3 rounded-lg border transition-all mt-4 ${
              filterStatus === 'all'
                ? 'bg-white/[0.08] border-white/20'
                : 'bg-transparent border-transparent hover:bg-white/[0.04]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-white/60" />
              <span className="text-xs text-white/70">Ver todos</span>
            </div>
          </motion.button>
        </div>

        {/* Guests List */}
        <div className="flex-1 flex flex-col">
          {/* Search & Filters */}
          <div className="p-3 border-b border-white/[0.06] bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  placeholder="Buscar hóspedes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/[0.04] border-white/[0.08] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/30"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9">
                    <Filter className="w-4 h-4 text-white/60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#0a0a0f] border-white/[0.06]">
                  <DropdownMenuItem className="text-white/70">Por origem</DropdownMenuItem>
                  <DropdownMenuItem className="text-white/70">Por valor</DropdownMenuItem>
                  <DropdownMenuItem className="text-white/70">Por score IA</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Guests Table */}
          <ScrollArea className="flex-1">
            <div className="p-2">
              {filteredGuests.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-white/20 mx-auto mb-3" />
                  <p className="text-sm text-white/40">Nenhum hóspede encontrado</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredGuests.map((guest: Guest, index: number) => (
                    <motion.div
                      key={guest.id}
                      custom={index}
                      variants={slideIn}
                      initial="hidden"
                      animate="visible"
                      className="bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.10] rounded-lg p-3 transition-all hover:bg-white/[0.04]"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {/* Avatar */}
                          <Avatar className="w-10 h-10 flex-shrink-0">
                            <AvatarFallback className={`bg-gradient-to-br ${guest.status === 'hot' ? 'from-orange-500 to-red-500' : guest.status === 'closed' ? 'from-emerald-500 to-green-500' : 'from-violet-500 to-purple-600'} text-white text-xs font-bold`}>
                              {guest.avatar || guest.name.split(' ').map((n: string) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>

                          {/* Guest Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold text-white truncate">
                                {guest.name}
                              </span>
                              {guest.status === 'hot' && <Flame className="w-3 h-3 text-orange-400 flex-shrink-0" />}
                              {(guest.status === 'closed') && <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />}
                              {guest.status === 'lost' && <XCircle className="w-3 h-3 text-gray-400 flex-shrink-0" />}
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-white/50 font-mono">
                              <span>{guest.phone || guest.phoneNumber}</span>
                              {guest.email && <span>•</span>}
                              {guest.email && <span className="truncate">{guest.email}</span>}
                            </div>
                            <div className="flex items-center gap-2 mt-1.5">
                              <Badge variant="outline" className={`text-[8px] h-4 ${getGuestStatusColor(guest.status)}`}>
                                {getStatusLabel(guest.status)}
                              </Badge>
                              <Badge variant="outline" className="text-[8px] h-4 bg-white/[0.04] text-white/60 border-white/[0.08]">
                                {guest.source || 'WhatsApp'}
                              </Badge>
                              <span className={`text-[9px] font-medium ${
                                (guest.aiScore || guest.score || 0) >= 80 ? 'text-emerald-400' :
                                (guest.aiScore || guest.score || 0) >= 60 ? 'text-yellow-400' :
                                'text-red-400'
                              }`}>
                                Score IA: {guest.aiScore || guest.score || 50}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Value & Actions */}
                        <div className="flex flex-col items-end gap-2 ml-4">
                          <div className="text-right">
                            <div className="text-sm font-bold text-white">
                              {guest.score && guest.score > 0 ? formatCurrency(guest.score) : '-'}
                            </div>
                            {guest.checkIn && guest.checkOut && (
                              <div className="text-[9px] text-white/40">
                                {new Date(guest.checkIn).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                                {' → '}
                                {new Date(guest.checkOut).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                              </div>
                            )}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                <MoreVertical className="w-3.5 h-3.5 text-white/40" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-[#0a0a0f] border-white/[0.06]">
                              <DropdownMenuLabel className="text-xs text-white/40 font-semibold px-2 py-1">
                                Mover Estágio
                              </DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => onStatusChange?.(guest.id, 'cold')}
                                className="text-xs text-white/70 hover:text-white"
                              >
                                Frio / Novo
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => onStatusChange?.(guest.id, 'warm')}
                                className="text-xs text-white/70 hover:text-white"
                              >
                                Morno
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => onStatusChange?.(guest.id, 'hot')}
                                className="text-xs text-white/70 hover:text-white"
                              >
                                Quente 🔥
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => onStatusChange?.(guest.id, 'closed')}
                                className="text-xs text-white/70 hover:text-white"
                              >
                                Ganho (Reservado)
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => onStatusChange?.(guest.id, 'lost')}
                                className="text-xs text-white/70 hover:text-white"
                              >
                                Perdido
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-white/[0.06]" />
                              <DropdownMenuItem className="text-xs text-emerald-400 hover:text-emerald-300">
                                Contatar agora
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Notes Preview */}
                      {(guest.notes || guest.lastMessage) && (
                        <div className="mt-2 pt-2 border-t border-white/[0.04]">
                          <p className="text-[10px] text-white/40 line-clamp-1">
                            📝 {guest.notes || guest.lastMessage}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </Card>
  );
}