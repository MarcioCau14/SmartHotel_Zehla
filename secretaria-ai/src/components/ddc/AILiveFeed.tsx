'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Bot, User, Phone, Clock, MoreHorizontal, Send, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { mockConversationLogs, formatTimeAgo } from '@/lib/ddc/mock-data';

export function AILiveFeed({ conversations, isConnected, onReply, onEscalate, onViewDetails }: any = {}) {
  const [selectedConversation, setSelectedConversation] = useState(mockConversationLogs[0]);
  const [isTyping, setIsTyping] = useState(false);
  const [liveActivities, setLiveActivities] = useState(mockConversationLogs);

  // Simulate live typing indicator
  useEffect(() => {
    const typingInterval = setInterval(() => {
      if (selectedConversation && Math.random() > 0.7) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2000);
      }
    }, 5000);

    return () => clearInterval(typingInterval);
  }, [selectedConversation]);

  const slideIn = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: 'easeOut' as any }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'resolved':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'escalated':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <Card className="bg-white/[0.02] border border-white/[0.06] h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-white/[0.06]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                Live Feed WhatsApp
                <motion.div
                  className="w-2 h-2 bg-emerald-500 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [1, 0.5, 1]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity
                  }}
                />
              </CardTitle>
              <p className="text-[10px] text-white/40 font-mono">
                {liveActivities.length} conversas ativas
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="w-4 h-4 text-white/60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#0a0a0f] border-white/[0.06]">
              <DropdownMenuItem className="text-white/70 hover:text-white">
                Ver todas as conversas
              </DropdownMenuItem>
              <DropdownMenuItem className="text-white/70 hover:text-white">
                Exportar logs
              </DropdownMenuItem>
              <DropdownMenuItem className="text-white/70 hover:text-white">
                Configurar filtros
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <div className="flex flex-1 overflow-hidden">
        {/* Conversations List */}
        <div className="w-72 border-r border-white/[0.06] flex flex-col">
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-2">
              {liveActivities.map((conversation) => (
                <motion.button
                  key={conversation.id}
                  variants={slideIn}
                  initial="hidden"
                  animate="visible"
                  onClick={() => setSelectedConversation(conversation)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedConversation?.id === conversation.id
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-transparent border-white/[0.04] hover:bg-white/[0.02] hover:border-white/[0.08]'
                  }`}
                >
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
                          {conversation.guestPhone}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className={`text-[8px] h-5 ${getStatusColor(conversation.status)}`}>
                      {conversation.status === 'active' ? 'Ativa' :
                       conversation.status === 'resolved' ? 'Resolvida' :
                       conversation.status === 'escalated' ? 'Escalonada' : 'Abandonada'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="w-3 h-3 text-emerald-400" />
                    <span className="text-[10px] text-white/50 line-clamp-1">
                      {conversation.messages[conversation.messages.length - 1]?.content}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-white/30" />
                      <span className="text-[9px] text-white/30">
                        {formatTimeAgo(conversation.lastUpdate)}
                      </span>
                    </div>
                    <div className={`text-[9px] font-medium ${
                      conversation.aiConfidence >= 80 ? 'text-emerald-400' :
                      conversation.aiConfidence >= 60 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {conversation.aiConfidence}% conf.
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Conversation Messages */}
        <div className="flex-1 flex flex-col">
          {/* Conversation Header */}
          {selectedConversation && (
            <div className="p-3 border-b border-white/[0.06] bg-white/[0.02]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {selectedConversation.guestName.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {selectedConversation.guestName}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-[8px] h-4 ${getStatusColor(selectedConversation.status)}`}>
                        {selectedConversation.status === 'active' ? 'Conversando' :
                         selectedConversation.status === 'resolved' ? 'Resolvido' :
                         selectedConversation.status === 'escalated' ? '⚠️ Escalonado' : 'Abandonado'}
                      </Badge>
                      {selectedConversation.status === 'escalated' && (
                        <AlertTriangle className="w-3 h-3 text-red-400" />
                      )}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-8">
                  <Phone className="w-3.5 h-3.5 mr-1.5" />
                  <span className="text-xs">Ligar</span>
                </Button>
              </div>
            </div>
          )}

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {selectedConversation?.messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex ${message.from === 'guest' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                      message.from === 'guest'
                        ? 'bg-white/[0.08] text-white rounded-tl-none'
                        : message.from === 'ai'
                        ? 'bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 text-white border border-emerald-500/20 rounded-tr-none'
                        : 'bg-violet-500/20 text-white border border-violet-500/20 rounded-tr-none'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {message.from === 'guest' && <User className="w-3 h-3 text-white/60" />}
                      {message.from === 'ai' && <Bot className="w-3 h-3 text-emerald-400" />}
                      {message.from === 'human' && <span className="text-[9px] text-violet-400">Você</span>}
                      <span className="text-[9px] text-white/40">
                        {new Date(message.timestamp).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed">{message.content}</p>
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              <AnimatePresence>
                {isTyping && selectedConversation?.status === 'active' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex justify-end"
                  >
                    <div className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 text-white border border-emerald-500/20 rounded-2xl rounded-tr-none px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Bot className="w-3 h-3 text-emerald-400" />
                        <div className="flex gap-1">
                          <motion.div
                            className="w-1.5 h-1.5 bg-emerald-400 rounded-full"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
                          />
                          <motion.div
                            className="w-1.5 h-1.5 bg-emerald-400 rounded-full"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                          />
                          <motion.div
                            className="w-1.5 h-1.5 bg-emerald-400 rounded-full"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>

          {/* Quick Reply Input */}
          <div className="p-3 border-t border-white/[0.06] bg-white/[0.02]">
            <div className="flex gap-2">
              <Input
                placeholder="Digite uma mensagem rápida..."
                className="flex-1 bg-white/[0.04] border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30"
              />
              <Button size="sm" className="px-4">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}