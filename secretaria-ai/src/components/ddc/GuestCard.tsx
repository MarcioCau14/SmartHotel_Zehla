'use client';

import { motion } from 'framer-motion';
import { Flame, CheckCircle2, XCircle, Phone, MessageCircle, MoreVertical, Star, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import type { Guest } from '@/types/ddc';
import { formatCurrency, getGuestStatusColor } from '@/lib/ddc/ddc-utils';

interface GuestCardProps {
  guest: Guest;
  onClick: () => void;
  onCall?: () => void;
  onWhatsApp?: () => void;
  onMoveToStage?: (stage: string) => void;
}

export function GuestCard({
  guest,
  onClick,
  onCall,
  onWhatsApp,
  onMoveToStage
}: GuestCardProps) {
  const slideIn = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: 'easeOut' as any }
    }
  };

  const stages = [
    { id: 'hot', label: 'Quente 🔥', color: 'from-orange-500 to-red-500' },
    { id: 'warm', label: 'Morno', color: 'from-yellow-500 to-orange-500' },
    { id: 'cold', label: 'Frio', color: 'from-blue-500 to-cyan-500' },
    { id: 'closed', label: 'Fechado', color: 'from-emerald-500 to-green-500' },
    { id: 'lost', label: 'Perdido', color: 'from-gray-500 to-slate-500' }
  ];

  return (
    <motion.div
      variants={slideIn}
      initial="hidden"
      animate="visible"
      onClick={onClick}
    >
      <Card className="bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.10] transition-all cursor-pointer hover:bg-white/[0.04]">
        <CardContent className="p-3">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className={`bg-gradient-to-br ${
                  guest.status === 'hot' ? 'from-orange-500 to-red-500' :
                  guest.status === 'warm' ? 'from-yellow-500 to-orange-500' :
                  guest.status === 'closed' ? 'from-emerald-500 to-green-500' :
                  'from-gray-500 to-slate-500'
                } text-white text-xs font-bold`}>
                  {guest.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-sm font-semibold text-white line-clamp-1">
                    {guest.name}
                  </span>
                  {guest.status === 'hot' && (
                    <Flame className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                  )}
                  {guest.status === 'closed' && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  )}
                  {guest.status === 'lost' && (
                    <XCircle className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-white/50">
                  <span>{guest.phoneNumber}</span>
                  {guest.email && <span>•</span>}
                  {guest.email && <span className="line-clamp-1">{guest.email}</span>}
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <MoreVertical className="w-3.5 h-3.5 text-white/40" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#0a0a0f] border-white/[0.06]">
                {onCall && (
                  <DropdownMenuItem
                    className="text-white/70 hover:text-white cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); onCall(); }}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Ligar
                  </DropdownMenuItem>
                )}
                {onWhatsApp && (
                  <DropdownMenuItem
                    className="text-white/70 hover:text-white cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); onWhatsApp(); }}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-white/[0.06]" />
                {stages.map(stage => (
                  <DropdownMenuItem
                    key={stage.id}
                    className="text-white/70 hover:text-white cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveToStage?.(stage.id);
                    }}
                    disabled={guest.status === stage.id}
                  >
                    Mover para <span className={`ml-1 font-medium bg-gradient-to-r ${stage.color} bg-clip-text text-transparent`}>{stage.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Status & Score */}
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className={`text-[8px] h-4 ${getGuestStatusColor(guest.status)}`}>
              {guest.status === 'hot' ? 'Quente' :
               guest.status === 'warm' ? 'Morno' :
               guest.status === 'cold' ? 'Frio' :
               guest.status === 'closed' ? 'Fechado' :
               guest.status === 'lost' ? 'Perdido' : 'Novo'}
            </Badge>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-400" />
              <span className={`text-[9px] font-medium ${
                (guest.score ?? 0) >= 80 ? 'text-emerald-400' :
                (guest.score ?? 0) >= 60 ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                Score: {guest.score ?? 0}%
              </span>
            </div>
            <TrendingUp className="w-3 h-3 text-emerald-400" />
          </div>

          {/* Value */}
          {guest.value > 0 && (
            <div className="mb-2">
              <span className="text-lg font-bold text-white">
                {formatCurrency(guest.value)}
              </span>
            </div>
          )}

          {/* AI Insight */}
          {guest.lastMessage && (
            <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-2">
              <div className="flex items-start gap-1.5">
                <Star className="w-3 h-3 text-violet-400 mt-0.5 flex-shrink-0" />
                <p className="text-[9px] text-white/60 line-clamp-2">
                  {guest.lastMessage}
                </p>
              </div>
            </div>
          )}

          {/* Score Progress Bar */}
          <div className="mt-2 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${
                (guest.score ?? 0) >= 80 ? 'bg-gradient-to-r from-emerald-500 to-green-500' :
                (guest.score ?? 0) >= 60 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                'bg-gradient-to-r from-red-500 to-pink-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${guest.score ?? 0}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}