'use client';

import { useState, useEffect, useCallback } from 'react';
  X,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  Tag,
  Plus,
  Loader2,
  Send,
  FileText,
  DollarSign,
  User,
  Clock,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  tags: string[];
  source: string;
  lastContact: string;
  owner: string;
  customFields?: Record<string, string>;
}

interface Interaction {
  id: string;
  type: 'note' | 'call' | 'whatsapp' | 'email';
  content: string;
  createdAt: string;
  author: string;
}

interface LinkedDeal {
  id: string;
  title: string;
  value: number;
  stage: string;
  probability: number;
}

interface ContactDetailProps {
  contact: Contact;
  onClose: () => void;
  onUpdate: () => void;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

const INTERACTION_ICONS = {
  note: FileText,
  call: Phone,
  whatsapp: MessageSquare,
  email: Mail,
};

const INTERACTION_COLORS = {
  note: 'text-slate-400',
  call: 'text-blue-400',
  whatsapp: 'text-emerald-400',
  email: 'text-purple-400',
};

export function ContactDetail({ contact, onClose, onUpdate }: ContactDetailProps) {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [deals, setDeals] = useState<LinkedDeal[]>([]);
  const [editingTags, setEditingTags] = useState(false);
  const [tagsInput, setTagsInput] = useState(contact.tags.join(', '));
  const [newInteractionType, setNewInteractionType] = useState<'note' | 'call' | 'whatsapp' | 'email'>('note');
  const [newInteractionContent, setNewInteractionContent] = useState('');
  const [sendingInteraction, setSendingInteraction] = useState(false);
  const [savingTags, setSavingTags] = useState(false);

  const loadInteractions = useCallback(async () => {
  const res = await fetch(`/api/crm/contacts/${contact.id}/interactions`);
      if (res.ok) setInteractions(await res.json());
    } catch {
      // silent
    }
  }, [contact.id]);

  const loadDeals = useCallback(async () => {
  const res = await fetch(`/api/crm/contacts/${contact.id}/deals`);
      if (res.ok) setDeals(await res.json());
    } catch {
      // silent
    }
  }, [contact.id]);

  useEffect(() => {
    loadInteractions();
    loadDeals();
  }, [loadInteractions, loadDeals]);

  const handleSaveTags = async () => {
    setSavingTags(true);
  const newTags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
      await fetch(`/api/crm/contacts/${contact.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags: newTags }),
      });
      setEditingTags(false);
      onUpdate();
    } catch {
      // silent
    } finally {
      setSavingTags(false);
    }
  };

  const handleAddInteraction = async () => {
    if (!newInteractionContent.trim()) return;
    setSendingInteraction(true);
  await fetch(`/api/crm/contacts/${contact.id}/interactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: newInteractionType,
          content: newInteractionContent,
        }),
      });
      setNewInteractionContent('');
      await loadInteractions();
    } catch {
      // silent
    } finally {
      setSendingInteraction(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900/80 border-l border-slate-700/50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
        <h3 className="text-sm font-semibold text-white">Detalhes do Contato</h3>
        <Button variant="ghost" size="icon" className="w-7 h-7 text-slate-400 hover:text-white" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto zehla-scroll-y">
        {/* Profile */}
        <div className="p-4 border-b border-slate-700/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-slate-700/50 flex items-center justify-center">
              <User className="w-6 h-6 text-slate-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">{contact.name}</h2>
              <p className="text-xs text-slate-400">{contact.source}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Phone className="w-4 h-4 text-slate-500" />
              {contact.phone}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Mail className="w-4 h-4 text-slate-500" />
              {contact.email}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Clock className="w-4 h-4 text-slate-500" />
              Último contato: {formatDate(contact.lastContact)}
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="p-4 border-b border-slate-700/50">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tags</h4>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs text-slate-400 hover:text-white"
              onClick={() => setEditingTags(!editingTags)}
            >
              <Tag className="w-3 h-3 mr-1" />
              {editingTags ? 'Fechar' : 'Editar'}
            </Button>
          </div>
          {editingTags ? (
            <div className="flex gap-2">
              <Input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="tag1, tag2, tag3"
                className="bg-slate-800 border-slate-600 text-white h-8 text-sm flex-1"
              />
              <Button
                size="sm"
                className="h-8 bg-orange-500 hover:bg-orange-400 text-white"
                onClick={handleSaveTags}
                disabled={savingTags}
              >
                {savingTags ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Salvar'}
              </Button>
            </div>
          ) : (
            <div className="flex gap-1.5 flex-wrap">
              {contact.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="border-slate-600 text-slate-300 text-xs"
                >
                  {tag}
                </Badge>
              ))}
              {contact.tags.length === 0 && (
                <span className="text-xs text-slate-600">Nenhuma tag</span>
              )}
            </div>
          )}
        </div>

        {/* Linked Deals */}
        <div className="p-4 border-b border-slate-700/50">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Negócios Vinculados
          </h4>
          {deals.length === 0 ? (
            <p className="text-xs text-slate-600">Nenhum negócio vinculado.</p>
          ) : (
            <div className="space-y-2">
              {deals.map((deal) => (
                <div
                  key={deal.id}
                  className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/50"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white">{deal.title}</span>
                    <Badge
                      className={cn(
                        'text-[10px]',
                        deal.probability >= 80
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : deal.probability >= 50
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          : 'bg-slate-500/20 text-slate-400 border-slate-500/30',
                      )}
                      variant="outline"
                    >
                      {deal.probability}%
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <DollarSign className="w-3 h-3" />
                    {formatBRL(deal.value)}
                    <span className="text-slate-600">•</span>
                    {deal.stage}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Interactions Timeline */}
        <div className="p-4">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Linha do Tempo
          </h4>

          {/* Add Interaction */}
          <div className="mb-4 p-3 rounded-xl bg-slate-800/30 border border-slate-700/50 space-y-2">
            <div className="flex gap-2">
              <Select value={newInteractionType} onValueChange={(v: 'note' | 'call' | 'whatsapp' | 'email') => setNewInteractionType(v)}>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-white h-8 text-xs w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700 text-white">
                  <SelectItem value="note">Nota</SelectItem>
                  <SelectItem value="call">Ligação</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Textarea
              value={newInteractionContent}
              onChange={(e) => setNewInteractionContent(e.target.value)}
              placeholder="Adicionar nota ou registrar interação..."
              className="bg-slate-900 border-slate-700 text-white min-h-[60px] text-sm"
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                className="bg-orange-500 hover:bg-orange-400 text-white h-8"
                onClick={handleAddInteraction}
                disabled={!newInteractionContent.trim() || sendingInteraction}
              >
                {sendingInteraction ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5 mr-1" />
                )}
                Registrar
              </Button>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-2">
            {interactions.map((interaction) => {
              const Icon = INTERACTION_ICONS[interaction.type];
              const color = INTERACTION_COLORS[interaction.type];
              return (
                <div
                  key={interaction.id}
                  className="p-3 rounded-xl bg-slate-800/20 border border-slate-700/30"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon className={cn('w-3.5 h-3.5', color)} />
                    <span className="text-xs font-medium text-slate-300 capitalize">
                      {interaction.type === 'note' ? 'Nota' : interaction.type === 'call' ? 'Ligação' : interaction.type === 'whatsapp' ? 'WhatsApp' : 'Email'}
                    </span>
                    <span className="text-[10px] text-slate-500 ml-auto">
                      {formatDate(interaction.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 whitespace-pre-wrap">
                    {interaction.content}
                  </p>
                  <p className="text-[10px] text-slate-600 mt-1">
                    por {interaction.author}
                  </p>
                </div>
              );
            })}
            {interactions.length === 0 && (
              <p className="text-xs text-slate-600 text-center py-6">
                Nenhuma interação registrada.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
