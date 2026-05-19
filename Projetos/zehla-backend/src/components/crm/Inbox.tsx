'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Phone,
  MessageSquare,
  Mail,
  MoreHorizontal,
  Loader2,
  Send,
  User,
  Paperclip,
  Check,
  CheckCheck,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface Conversation {
  id: string;
  contactName: string;
  contactPhone: string;
  lastMessage: string;
  lastMessageAt: string;
  unread: boolean;
  type: 'whatsapp' | 'email' | 'sms';
}

interface Message {
  id: string;
  content: string;
  direction: 'incoming' | 'outgoing';
  type: string;
  status: string;
  createdAt: string;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) {
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
  if (d.toDateString() === yesterday.toDateString()) {
    return 'Ontem';
  }
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function formatMessageTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

const TYPE_ICONS = {
  whatsapp: MessageSquare,
  email: Mail,
  sms: Phone,
};

const TYPE_COLORS = {
  whatsapp: 'text-emerald-400',
  email: 'text-purple-400',
  sms: 'text-blue-400',
};

export function Inbox() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [search, setSearch] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  const loadConversations = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('q', search);
      const res = await fetch(`/api/crm/conversations?${params}`);
      if (res.ok) setConversations(await res.json());
    } catch {
      // silent
    } finally {
      setLoadingConversations(false);
    }
  }, [search]);

  const loadMessages = useCallback(async (conversationId: string) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/crm/conversations/${conversationId}/messages`);
      if (res.ok) setMessages(await res.json());
    } catch {
      // silent
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation);
    }
  }, [activeConversation, loadMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;
    setSending(true);
    const optimistic: Message = {
      id: `opt-${Date.now()}`,
      content: newMessage,
      direction: 'outgoing',
      type: 'TEXT',
      status: 'SENT',
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setNewMessage('');

    try {
      const res = await fetch(`/api/crm/conversations/${activeConversation}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage }),
      });
      if (res.ok) {
        const saved = await res.json();
        setMessages((prev) => prev.map((m) => (m.id === optimistic.id ? saved : m)));
      }
    } catch {
      // silent
    } finally {
      setSending(false);
    }
  };

  const activeConv = conversations.find((c) => c.id === activeConversation);

  return (
    <div className="flex h-[calc(100vh-280px)] min-h-[500px] rounded-xl border border-slate-700/50 overflow-hidden bg-slate-900/30">
      {/* Left Panel — Conversations */}
      <div className="w-80 flex-shrink-0 border-r border-slate-700/50 flex flex-col">
        <div className="p-3 border-b border-slate-700/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar conversas..."
              className="bg-slate-900 border-slate-700 text-white pl-9 h-9 text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto zehla-scroll-y">
          {loadingConversations ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
            </div>
          ) : (
            conversations.map((conv) => {
              const Icon = TYPE_ICONS[conv.type];
              const iconColor = TYPE_COLORS[conv.type];
              const isActive = conv.id === activeConversation;

              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConversation(conv.id)}
                  className={cn(
                    'w-full text-left p-3 border-b border-slate-700/30 transition-colors hover:bg-slate-800/30',
                    isActive && 'bg-slate-800/50',
                    conv.unread && 'bg-slate-800/20',
                  )}
                >
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-white truncate">
                          {conv.contactName}
                        </span>
                        <span className="text-[10px] text-slate-500 shrink-0">
                          {formatDate(conv.lastMessageAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Icon className={cn('w-3 h-3', iconColor)} />
                        <span
                          className={cn(
                            'text-xs truncate',
                            conv.unread ? 'text-slate-200 font-medium' : 'text-slate-500',
                          )}
                        >
                          {conv.lastMessage}
                        </span>
                      </div>
                    </div>
                    {conv.unread && (
                      <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0 mt-1.5" />
                    )}
                  </div>
                </button>
              );
            })
          )}
          {!loadingConversations && conversations.length === 0 && (
            <div className="text-center text-slate-500 py-12 text-sm">
              Nenhuma conversa encontrada.
            </div>
          )}
        </div>
      </div>

      {/* Right Panel — Messages */}
      <div className="flex-1 flex flex-col">
        {activeConv ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 bg-slate-800/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center">
                  <User className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{activeConv.contactName}</p>
                  <p className="text-xs text-slate-500">{activeConv.contactPhone}</p>
                </div>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  'text-[10px] border-slate-600',
                  TYPE_COLORS[activeConv.type],
                )}
              >
                {activeConv.type === 'whatsapp' ? 'WhatsApp' : activeConv.type === 'email' ? 'Email' : 'SMS'}
              </Badge>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 zehla-scroll-y">
              {loadingMessages ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
                </div>
              ) : (
                messages.map((msg) => {
                  const isIncoming = msg.direction === 'incoming';
                  return (
                    <div
                      key={msg.id}
                      className={cn('flex', isIncoming ? 'justify-start' : 'justify-end')}
                    >
                      <div
                        className={cn(
                          'max-w-[75%] p-3 rounded-2xl text-sm',
                          isIncoming
                            ? 'bg-slate-800/60 border border-slate-700/50 text-slate-200 rounded-tl-md'
                            : 'bg-orange-500/20 border border-orange-500/30 text-white rounded-tr-md',
                        )}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        <div
                          className={cn(
                            'flex items-center gap-1 mt-1.5',
                            isIncoming ? 'justify-start' : 'justify-end',
                          )}
                        >
                          <span className="text-[10px] text-slate-500">
                            {formatMessageTime(msg.createdAt)}
                          </span>
                          {!isIncoming && (
                            msg.status === 'READ' ? (
                              <CheckCheck className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Check className="w-3 h-3 text-slate-500" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              {!loadingMessages && messages.length === 0 && (
                <div className="text-center text-slate-500 py-12 text-sm">
                  Nenhuma mensagem nesta conversa.
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-700/50 bg-slate-800/20">
              <div className="flex gap-2">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="bg-slate-900 border-slate-700 text-white min-h-[40px] max-h-[100px] text-sm flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  className="bg-orange-500 hover:bg-orange-400 text-white h-auto self-end"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <p className="text-sm text-slate-500">Selecione uma conversa</p>
              <p className="text-xs text-slate-600 mt-1">
                Escolha um contato à esquerda para visualizar as mensagens.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
