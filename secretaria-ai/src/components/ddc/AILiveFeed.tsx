'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { formatTimeAgo } from '@/lib/ddc/ddc-utils';

import type { ConversationLog, ConversationMessage } from '@/types/ddc';

interface AILiveFeedProps {
  conversations?: ConversationLog[];
  isConnected?: boolean;
  onReply?: (conversationId: string, message: string) => void;
  onEscalate?: (conversationId: string) => void;
  onViewDetails?: (conversationId: string) => void;
}

export function AILiveFeed({
  conversations = [],
  isConnected = true,
  onReply,
  onEscalate,
  onViewDetails,
}: AILiveFeedProps) {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [votedMessages, setVotedMessages] = useState<Record<string, 'up' | 'down'>>({});

  const handleVote = async (messageId: string, rating: number) => {
    if (!selectedConversation) return;
    const voteType = rating === 5 ? 'up' : 'down';
    setVotedMessages(prev => ({ ...prev, [messageId]: voteType }));

    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          messageId,
          rating,
          source: 'ddc'
        })
      });
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  // Default select first conversation if none selected
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversationId) {
       
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  // Find the selected conversation object
  const selectedConversation = conversations.find(c => c.id === selectedConversationId) || conversations[0] || null;

  // Notify parent of selected details
  useEffect(() => {
    if (selectedConversationId) {
      onViewDetails?.(selectedConversationId);
    }
  }, [selectedConversationId, onViewDetails]);

  // Simulate live typing indicator
  useEffect(() => {
    const typingInterval = setInterval(() => {
      if (selectedConversation && selectedConversation.status === 'active' && Math.random() > 0.7) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2000);
      }
    }, 5000);

    return () => clearInterval(typingInterval);
  }, [selectedConversation]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedConversation) return;
    onReply?.(selectedConversation.id, replyText);
    setReplyText('');
  };

  const slideIn = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: 'easeOut' as const }
    }
  } as const;

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
                {isConnected && (
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
                )}
              </CardTitle>
              <p className="text-[10px] text-white/40 font-mono">
                {conversations.length} conversas ativas
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <div className="flex flex-1 overflow-hidden">
        {/* Conversations List */}
        <div className="w-72 border-r border-white/[0.06] flex flex-col">
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-2">
              {conversations.length === 0 ? (
                <div className="text-center py-12 text-xs text-white/30">
                  Nenhuma conversa encontrada
                </div>
              ) : (
                conversations.map((conversation) => (
                  <motion.button
                    key={conversation.id}
                    variants={slideIn}
                    initial="hidden"
                    animate="visible"
                    onClick={() => setSelectedConversationId(conversation.id)}
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
                            {(conversation.guestName || 'G').split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-white truncate w-[110px]">
                            {conversation.guestName || 'Hóspede'}
                          </div>
                          <div className="text-[9px] text-white/40 font-mono">
                            {conversation.phoneNumber || ''}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className={`text-[8px] h-5 ${getStatusColor(conversation.status)}`}>
                        {conversation.status === 'active' ? 'Ativa' :
                         conversation.status === 'resolved' ? 'Resolvida' :
                         conversation.status === 'escalated' ? 'Escalonada' : conversation.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Bot className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                      <span className="text-[10px] text-white/50 line-clamp-1 min-w-0">
                        {conversation.messages && conversation.messages.length > 0
                          ? conversation.messages[conversation.messages.length - 1].content
                          : 'Sem mensagens'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-white/30" />
                        <span className="text-[9px] text-white/30">
                          {formatTimeAgo(conversation.updatedAt || conversation.createdAt || new Date())}
                        </span>
                      </div>
                      <div className={`text-[9px] font-medium ${
                        (conversation.aiScore || 0) >= 80 ? 'text-emerald-400' :
                        (conversation.aiScore || 0) >= 60 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {conversation.aiScore || 0}% conf.
                      </div>
                    </div>
                  </motion.button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Conversation Messages */}
        <div className="flex-1 flex flex-col">
          {/* Conversation Header */}
          {selectedConversation ? (
            <>
              <div className="p-3 border-b border-white/[0.06] bg-white/[0.02]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {(selectedConversation.guestName || 'G').split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {selectedConversation.guestName || 'Hóspede'}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-[8px] h-4 ${getStatusColor(selectedConversation.status)}`}>
                          {selectedConversation.status === 'active' ? 'Conversando' :
                           selectedConversation.status === 'resolved' ? 'Resolvido' :
                           selectedConversation.status === 'escalated' ? '⚠️ Escalonado' : selectedConversation.status}
                        </Badge>
                        {selectedConversation.status === 'escalated' && (
                          <AlertTriangle className="w-3 h-3 text-red-400" />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedConversation.status !== 'escalated' && (
                      <Button
                        onClick={() => onEscalate?.(selectedConversation.id)}
                        variant="outline"
                        size="sm"
                        className="h-8 border-red-500/30 hover:bg-red-500/10 text-red-400"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                        <span className="text-xs">Escalar</span>
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="h-8">
                      <Phone className="w-3.5 h-3.5 mr-1.5" />
                      <span className="text-xs font-mono">{selectedConversation.phoneNumber || ''}</span>
                    </Button>
                  </div>
                </div>
              </div>
 
              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {selectedConversation.messages && selectedConversation.messages.length > 0 ? (
                    selectedConversation.messages.map((message, index) => {
                      const msgFrom = message.from || (message.role === 'user' ? 'guest' : message.role === 'assistant' ? 'ai' : 'human');
                      const msgTime = message.timestamp || message.createdAt || new Date();
                      return (
                        <motion.div
                          key={message.id || index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`flex ${msgFrom === 'guest' ? 'justify-start' : 'justify-end'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                              msgFrom === 'guest'
                                ? 'bg-white/[0.08] text-white rounded-tl-none'
                                : msgFrom === 'ai'
                                ? 'bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 text-white border border-emerald-500/20 rounded-tr-none'
                                : 'bg-violet-500/20 text-white border border-violet-500/20 rounded-tr-none'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              {msgFrom === 'guest' && <User className="w-3 h-3 text-white/60" />}
                              {msgFrom === 'ai' && <Bot className="w-3 h-3 text-emerald-400" />}
                              {msgFrom === 'human' && <span className="text-[9px] text-violet-400">Você</span>}
                              <span className="text-[9px] text-white/40">
                                {new Date(msgTime).toLocaleTimeString('pt-BR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <p className="text-xs leading-relaxed">{message.content}</p>
                            {msgFrom === 'ai' && message.id && (
                              <div className="flex justify-end gap-1.5 mt-2 pt-1 border-t border-white/[0.04]">
                                <button
                                  type="button"
                                  onClick={() => handleVote(message.id, 5)}
                                  disabled={!!votedMessages[message.id]}
                                  className={`p-1 rounded text-[10px] transition ${
                                    votedMessages[message.id] === 'up'
                                      ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30'
                                      : 'hover:bg-white/10 text-white/40'
                                  }`}
                                  title="Feedback Positivo"
                                >
                                  👍
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleVote(message.id, 1)}
                                  disabled={!!votedMessages[message.id]}
                                  className={`p-1 rounded text-[10px] transition ${
                                    votedMessages[message.id] === 'down'
                                      ? 'bg-red-500/20 text-red-400 font-bold border border-red-500/30'
                                      : 'hover:bg-white/10 text-white/40'
                                  }`}
                                  title="Feedback Negativo"
                                >
                                  👎
                                </button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 text-xs text-white/30">
                      Nenhuma mensagem trocada ainda
                    </div>
                  )}

                  {/* Typing Indicator */}
                  <AnimatePresence>
                    {isTyping && selectedConversation.status === 'active' && (
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
              <form onSubmit={handleSendMessage} className="p-3 border-t border-white/[0.06] bg-white/[0.02]">
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite uma mensagem para responder..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 bg-white/[0.04] border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30"
                  />
                  <Button type="submit" size="sm" className="px-4">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-white/30">
              Selecione uma conversa para começar
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}