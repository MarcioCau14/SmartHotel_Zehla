'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Plus, MapPin, Globe, Crosshair, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockTargets, type Target, type TargetStatus } from '@/lib/zcc-mock-data';

interface TargetsPanelProps {
  selectedTargetId: string | null;
  onSelectTarget: (targetId: string | null) => void;
}

const statusConfig: Record<TargetStatus, { label: string; className: string }> = {
  active: { label: 'Ativo', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
  pending: { label: 'Pendente', className: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
  inactive: { label: 'Inativo', className: 'bg-white/10 text-white/40 border-white/10' },
};

function PriorityStars({ priority }: { priority: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${i < priority ? 'text-amber-400 fill-amber-400' : 'text-white/15'}`}
        />
      ))}
    </div>
  );
}

export function TargetsPanel({ selectedTargetId, onSelectTarget }: TargetsPanelProps) {
  const [targets, setTargets] = useState<Target[]>(mockTargets);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTarget, setNewTarget] = useState({
    name: '',
    domain: '',
    city: '',
    state: '',
    priority: 3,
    status: 'pending' as TargetStatus,
  });

  const handleAddTarget = () => {
    if (!newTarget.name.trim() || !newTarget.city.trim()) return;
    const t: Target = {
      id: `T${String(targets.length + 1).padStart(2, '0')}`,
      ...newTarget,
      leadCount: 0,
    };
    setTargets(prev => [t, ...prev]);
    setNewTarget({ name: '', domain: '', city: '', state: '', priority: 3, status: 'pending' });
    setDialogOpen(false);
  };

  return (
    <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl overflow-hidden flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-semibold text-white/90">Alvos</span>
          <span className="text-[10px] font-mono text-white/30 bg-white/5 px-1.5 py-0.5 rounded">
            {targets.length}
          </span>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Adicionar
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#111] border-white/10 text-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white/90">Adicionar Novo Alvo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label className="text-white/60 text-xs">Nome do Alvo</Label>
                <Input
                  value={newTarget.name}
                  onChange={e => setNewTarget(p => ({ ...p, name: e.target.value }))}
                  placeholder="Ex: Rede Costeira Premium"
                  className="bg-white/5 border-white/10 text-sm text-white placeholder:text-white/25"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/60 text-xs">Domínio</Label>
                <Input
                  value={newTarget.domain}
                  onChange={e => setNewTarget(p => ({ ...p, domain: e.target.value }))}
                  placeholder="Ex: costeirapremium.com.br"
                  className="bg-white/5 border-white/10 text-sm text-white placeholder:text-white/25"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-white/60 text-xs">Cidade</Label>
                  <Input
                    value={newTarget.city}
                    onChange={e => setNewTarget(p => ({ ...p, city: e.target.value }))}
                    placeholder="Cidade"
                    className="bg-white/5 border-white/10 text-sm text-white placeholder:text-white/25"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/60 text-xs">Estado</Label>
                  <Select
                    value={newTarget.state}
                    onValueChange={v => setNewTarget(p => ({ ...p, state: v }))}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-sm text-white">
                      <SelectValue placeholder="UF" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111] border-white/10">
                      {['RJ','SP','MG','BA','PE','CE','PR','SC','RS','GO','MT','AM','PA','MA','RN','PB','AL','SE','ES','DF','AC','AP','RO','RR','TO'].map(uf => (
                        <SelectItem key={uf} value={uf} className="text-white">{uf}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white/60 text-xs">Prioridade</Label>
                <div className="flex gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setNewTarget(p => ({ ...p, priority: i + 1 }))}
                      className="p-1"
                    >
                      <Star
                        className={`w-5 h-5 transition-colors ${
                          i < newTarget.priority
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-white/15 hover:text-white/30'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <DialogClose asChild>
                <Button variant="ghost" className="text-white/50 hover:text-white/80">Cancelar</Button>
              </DialogClose>
              <Button
                onClick={handleAddTarget}
                disabled={!newTarget.name.trim() || !newTarget.city.trim()}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white"
              >
                Adicionar Alvo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 overflow-y-auto max-h-80 zehla-scroll p-2 space-y-1">
        <button
          onClick={() => onSelectTarget(null)}
          className={`w-full text-left px-3 py-2.5 rounded-lg transition-all text-xs ${
            selectedTargetId === null
              ? 'bg-emerald-500/10 border border-emerald-500/20'
              : 'hover:bg-white/5 border border-transparent'
          }`}
        >
          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-white/30" />
            <span className="font-medium text-white/70">Todos os Alvos</span>
          </div>
          <div className="text-[10px] text-white/30 mt-0.5 ml-5.5">
            {mockTargets.reduce((sum, t) => sum + t.leadCount, 0)} leads totais
          </div>
        </button>

        <AnimatePresence>
          {targets.map((target, idx) => {
            const status = statusConfig[target.status];
            const isSelected = selectedTargetId === target.id;

            return (
              <motion.button
                key={target.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => onSelectTarget(isSelected ? null : target.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-all text-xs group ${
                  isSelected
                    ? 'bg-emerald-500/10 border border-emerald-500/20'
                    : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white/90 truncate flex-1 mr-2">{target.name}</span>
                  <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 border ${status.className}`}>
                    {status.label}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 mt-1.5 ml-0.5 text-white/35">
                  <span className="truncate flex items-center gap-1">
                    <MapPin className="w-3 h-3 shrink-0" />
                    {target.city}/{target.state}
                  </span>
                  <span className="shrink-0">{target.leadCount} leads</span>
                </div>
                <div className="mt-1.5 ml-0.5">
                  <PriorityStars priority={target.priority} />
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}