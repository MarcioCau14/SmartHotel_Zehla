'use client';

import { useState, useEffect, useCallback } from 'react';
  Search,
  Phone,
  Mail,
  Tags,
  User,
  Clock,
  Loader2,
  MoreHorizontal,
} from 'lucide-react';
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

interface ContactListProps {
  onSelectContact: (contact: Contact) => void;
}

export function ContactList({ onSelectContact }: ContactListProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  const loadContacts = useCallback(async () => {
  const params = new URLSearchParams();
      if (search) params.set('q', search);
      if (sourceFilter !== 'all') params.set('source', sourceFilter);
      const res = await fetch(`/api/crm/contacts?${params}`);
      if (res.ok) setContacts(await res.json());
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [search, sourceFilter]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const sources = Array.from(new Set(contacts.map((c) => c.source)));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar contatos..."
            className="bg-slate-900 border-slate-700 text-white pl-9 h-9"
          />
        </div>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="bg-slate-900 border-slate-700 text-white h-9 w-40">
            <SelectValue placeholder="Fonte" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-700 text-white">
            <SelectItem value="all">Todas as fontes</SelectItem>
            {sources.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-slate-700/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700/50 hover:bg-transparent">
              <TableHead className="text-slate-400 text-xs font-medium">Nome</TableHead>
              <TableHead className="text-slate-400 text-xs font-medium">Telefone</TableHead>
              <TableHead className="text-slate-400 text-xs font-medium">Email</TableHead>
              <TableHead className="text-slate-400 text-xs font-medium">Tags</TableHead>
              <TableHead className="text-slate-400 text-xs font-medium">Fonte</TableHead>
              <TableHead className="text-slate-400 text-xs font-medium">Último Contato</TableHead>
              <TableHead className="text-slate-400 text-xs font-medium">Responsável</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((contact) => (
              <TableRow
                key={contact.id}
                className="border-slate-700/50 cursor-pointer hover:bg-slate-800/30 transition-colors"
                onClick={() => onSelectContact(contact)}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-700/50 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <span className="text-sm text-white font-medium">{contact.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-sm text-slate-300">
                    <Phone className="w-3 h-3 text-slate-500" />
                    {contact.phone}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-sm text-slate-300">
                    <Mail className="w-3 h-3 text-slate-500" />
                    <span className="truncate max-w-[160px]">{contact.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {contact.tags.slice(0, 2).map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="border-slate-600 text-slate-300 text-[10px]"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {contact.tags.length > 2 && (
                      <span className="text-[10px] text-slate-500">+{contact.tags.length - 2}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[10px] border-slate-600',
                      contact.source === 'WHATSAPP'
                        ? 'text-emerald-400 border-emerald-500/30'
                        : 'text-slate-300',
                    )}
                  >
                    {contact.source}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-sm text-slate-400">
                    <Clock className="w-3 h-3" />
                    {formatDate(contact.lastContact)}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-slate-300">{contact.owner}</span>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="w-7 h-7 text-slate-500 hover:text-white">
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {contacts.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-slate-500 py-12">
                  Nenhum contato encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
