'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { darkInput, darkSelectTrigger, type TeamMember } from '../types';

interface Props {
  team: TeamMember[];
  onChange: (team: TeamMember[]) => void;
}

const roleColors: Record<string, string> = {
  Gerente: 'bg-purple-500/15 text-[#FF5500] border-[#FF5500]/30',
  Recepcionista: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  Camareira: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
  Manutenção: 'bg-amber-500/15 text-[#FF5500] border-[#FF5500]/30'
};

export function TeamSection({ team, onChange }: Props) {
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('Recepcionista');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const add = () => {
    if (!name.trim() || !email.trim()) return;
    const member: TeamMember = {
      id: `tm-${Date.now()}`,
      name: name.trim(),
      role,
      phone: phone.trim(),
      email: email.trim()
    };
    onChange([...team, member]);
    setName('');
    setRole('Recepcionista');
    setPhone('');
    setEmail('');
    setShowAdd(false);
    toast({ title: 'Membro adicionado', description: `${member.name} entrou para a equipe.` });
  };

  const remove = (id: string) => {
    onChange(team.filter((m) => m.id !== id));
  };

  return (
    <div className="mt-2 space-y-3">
      {team.map((member) => (
        <motion.div
          key={member.id}
          layout
          className="bg-white/[0.03] border border-[#2e2e2e] rounded-xl p-4 group flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-full bg-[#242424] border border-[#363636] flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-[#898989]">
                {member.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-medium text-[#fafafa] truncate">{member.name}</span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium border ${roleColors[member.role] || 'bg-[#242424] text-[#898989] border-[#363636]'}`}>
                  {member.role}
                </span>
              </div>
              <div className="text-[11px] text-[#4d4d4d] truncate">
                {member.email} · {member.phone}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-[#363636] hover:text-red-400 hover:bg-red-500/10 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => remove(member.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </motion.div>
      ))}

      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="bg-white/[0.02] border border-dashed border-[#FF5500]/30 rounded-xl p-4 space-y-3"
          >
            <div className="text-xs font-semibold text-[#FF5500]">Novo Membro</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input placeholder="Nome completo" value={name} onChange={(e) => setName(e.target.value)} className={darkInput} />
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className={darkSelectTrigger}>
                  <SelectValue placeholder="Cargo" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-900 border-[#363636]">
                  <SelectItem value="Gerente">Gerente</SelectItem>
                  <SelectItem value="Recepcionista">Recepcionista</SelectItem>
                  <SelectItem value="Camareira">Camareira</SelectItem>
                  <SelectItem value="Manutenção">Manutenção</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Telefone" value={phone} onChange={(e) => setPhone(e.target.value)} className={darkInput} />
              <Input placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} className={darkInput} />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={add} className="bg-orange-500 hover:bg-orange-600 text-white">Adicionar</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowAdd(false)} className="text-[#898989]">Cancelar</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showAdd && (
        <Button
          variant="outline"
          className="w-full border-dashed border-[#363636] text-[#4d4d4d] hover:text-[#FF5500] hover:border-[#FF5500]/30 hover:bg-orange-500/5"
          onClick={() => setShowAdd(true)}
        >
          <Plus className="w-4 h-4" />
          Adicionar Membro
        </Button>
      )}
    </div>
  );
}
