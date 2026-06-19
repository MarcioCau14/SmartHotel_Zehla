'use client';

import { motion } from 'framer-motion';
import { Bot, User, Clock, MoreVertical, ArrowRight, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ConversationLog } from '@/types/ddc';
import { formatTimeAgo } from '@/lib/ddc/mock-data';

interface ConversationCardProps {
  conversation: ConversationLog;
  isActive?: boolean;
  onClick: () => void;
  onReply: () => void;
  onEscalate: () => void;
}

export function ConversationCard({
  conversation,
  isActive = false,
  onClick,
  onReply,
  onEscalate
}: ConversationCardProps) {
  const lastMessage = conversation.messages[conversation.messages.length - 1];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'escalated':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'closed':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const slideIn = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: 'easeOut' as any }
    }
  };

  return (
    <motion.div
      variants={slideIn}
      initial="hidden"
      animate="visible"
      onClick={onClick}
    >
      <Card
        className={`cursor-pointer transition-all ${
          isActive
            ? 'bg-emerald-500/10 border-emerald-500/30'
            : 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08]'
        }`}
      >
        <CardContent className="p-3">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <span className="text-xs font-bold text-white">
                  {conversation.guestName.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <div className="text-xs font-semibold text-white">
                  {conversation.guestName}
                </div>
                <div className="text-[9px] text-white/40">
                  {conversation.phoneNumber}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`text-[8px] h-5 ${getStatusColor(conversation.status)}`}>
                {conversation.status === 'in_progress' ? 'Ativa' :
                 conversation.status === 'escalated' ? 'Escalonada' :
                 conversation.status === 'closed' ? 'Fechada' : 'Abandonada'}
              </Badge>
              {conversation.needsEscalation && (
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreVertical className="w-3 h-3 text-white/40" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#0a0a0f] border-white/[0.06]">
                  <DropdownMenuItem
                    className="text-white/70 hover:text-white cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); onReply(); }}
                  >
                    Responder
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-400 hover:text-red-300 cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); onEscalate(); }}
                  >
                    Escalonar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Last Message */}
          <div className="flex items-start gap-2 mb-2">
            {lastMessage?.role === 'assistant' ? (
              <Bot className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
            ) : lastMessage?.role === 'user' ? (
              <User className="w-3 h-3 text-white/60 mt-0.5 flex-shrink-0" />
            ) : (
              <Bot className="w-3 h-3 text-violet-400 mt-0.5 flex-shrink-0" />
            )}
            <p className="text-[10px] text-white/60 line-clamp-2 flex-1">
              {lastMessage?.content || 'Sem mensagens'}
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-white/30" />
              <span className="text-[9px] text-white/30">
                {formatTimeAgo(conversation.updatedAt || new Date())}
              </span>
            </div>
            <div className={`text-[9px] font-medium ${
              (conversation.aiScore ?? 0) >= 80 ? 'text-emerald-400' :
              (conversation.aiScore ?? 0) >= 60 ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              {conversation.aiScore ?? 0}% conf.
            </div>
          </div>

          {/* AI Score Progress Bar */}
          <div className="mt-2 h-1 bg-white/[0.05] rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${
                (conversation.aiScore ?? 0) >= 80 ? 'bg-emerald-500' :
                (conversation.aiScore ?? 0) >= 60 ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${conversation.aiScore ?? 0}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}