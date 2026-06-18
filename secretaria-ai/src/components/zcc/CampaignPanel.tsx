'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Megaphone,
  Plus,
  Play,
  Pause,
  CheckCircle2,
  Send,
  Mail,
  Radio,
  Eye,
  MessageCircle,
} from 'lucide-react';
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
import { mockCampaigns, type Campaign, type CampaignStatus, type CampaignType } from '@/lib/zcc-mock-data';

interface CampaignPanelProps {
  campaigns?: Campaign[];
}

const statusConfig: Record<CampaignStatus, { label: string; className: string; icon: typeof Play }> = {
  active: { label: 'Ativa', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20', icon: Play },
  paused: { label: 'Pausada', className: 'bg-amber-500/15 text-amber-400 border-amber-500/20', icon: Pause },
  completed: { label: 'Concluída', className: 'bg-violet-500/15 text-violet-400 border-violet-500/20', icon: CheckCircle2 },
  draft: { label: 'Rascunho', className: 'bg-white/10 text-white/40 border-white/10', icon: Pause },
};

const typeIcons: Record<CampaignType, typeof Send> = {
  whatsapp: Send,
  email: Mail,
  ads: Radio,
};

const typeLabels: Record<CampaignType, string> = {
  whatsapp: 'WhatsApp',
  email: 'E-mail',
  ads: 'Anúncios',
};

const templates = [
  'Diagnóstico de Receita',
  'Follow-up Personalizado',
  'Convite Exclusivo',
  'Landing Page Otimizada',
  'Oferta Sazonal',
  'Reengajamento Premium',
];

function CampaignProgressBar({ sent, total, delivered, read, replied }: Campaign) {
  const pctDelivered = total > 0 ? (delivered / total) * 100 : 0;
  const pctRead = total > 0 ? (read / total) * 100 : 0;
  const pctReplied = total > 0 ? (replied / total) * 100 : 0;

  return (
    <div className="space-y-1.5">
      <div className="h-2 bg-white/5 rounded-full overflow-hidden flex">
        {pctDelivered > 0 && (
          <div
            className="h-full bg-emerald-500/70 transition-all duration-500"
            style={{ width: `${pctDelivered}%` }}
          />
        )}
        {pctRead > pctDelivered && (
          <div
            className="h-full bg-cyan-500/70 transition-all duration-500"
            style={{ width: `${pctRead - pctDelivered}%` }}
          />
        )}
        {pctReplied > pctRead && (
          <div
            className="h-full bg-violet-500/70 transition-all duration-500"
            style={{ width: `${pctReplied - pctRead}%` }}
          />
        )}
      </div>
      <div className="flex items-center gap-3 text-[10px] text-white/35">
        <span className="flex items-center gap-1">
          <Send className="w-2.5 h-2.5" /> {sent}/{total}
        </span>
        <span className="flex items-center gap-1">
          <Eye className="w-2.5 h-2.5 text-emerald-400" /> {delivered}
        </span>
        <span className="flex items-center gap-1">
          <Eye className="w-2.5 h-2.5 text-cyan-400" /> {read}
        </span>
        <span className="flex items-center gap-1">
          <MessageCircle className="w-2.5 h-2.5 text-violet-400" /> {replied}
        </span>
      </div>
    </div>
  );
}

export function CampaignPanel({ campaigns: initialCampaigns }: CampaignPanelProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns ?? mockCampaigns);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    type: 'whatsapp' as CampaignType,
    template: '',
    total: 100,
  });

  const handleCreate = () => {
    if (!newCampaign.name.trim() || !newCampaign.template) return;
    const c: Campaign = {
      id: `C${String(campaigns.length + 1).padStart(3, '0')}`,
      name: newCampaign.name,
      type: newCampaign.type,
      status: 'draft',
      sent: 0,
      delivered: 0,
      read: 0,
      replied: 0,
      total: newCampaign.total,
      createdAt: new Date().toISOString().split('T')[0],
      template: newCampaign.template,
    };
    setCampaigns(prev => [c, ...prev]);
    setNewCampaign({ name: '', type: 'whatsapp', template: '', total: 100 });
    setDialogOpen(false);
  };

  const updateStatus = (id: string, status: CampaignStatus) => {
    setCampaigns(prev =>
      prev.map(c => (c.id === id ? { ...c, status } : c))
    );
  };

  return (
    <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl overflow-hidden flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-semibold text-white/90">Campanhas</span>
          <span className="text-[10px] font-mono text-white/30 bg-white/5 px-1.5 py-0.5 rounded">
            {campaigns.filter(c => c.status === 'active').length} ativas
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
              Nova
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#111] border-white/10 text-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white/90">Nova Campanha</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label className="text-white/60 text-xs">Nome da Campanha</Label>
                <Input
                  value={newCampaign.name}
                  onChange={e => setNewCampaign(p => ({ ...p, name: e.target.value }))}
                  placeholder="Ex: Campanha Verão 2025"
                  className="bg-white/5 border-white/10 text-sm text-white placeholder:text-white/25"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/60 text-xs">Tipo</Label>
                <Select
                  value={newCampaign.type}
                  onValueChange={v => setNewCampaign(p => ({ ...p, type: v as CampaignType }))}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-sm text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111] border-white/10">
                    <SelectItem value="whatsapp" className="text-white">WhatsApp</SelectItem>
                    <SelectItem value="email" className="text-white">E-mail</SelectItem>
                    <SelectItem value="ads" className="text-white">Anúncios</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-white/60 text-xs">Template</Label>
                <Select
                  value={newCampaign.template}
                  onValueChange={v => setNewCampaign(p => ({ ...p, template: v }))}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-sm text-white">
                    <SelectValue placeholder="Selecionar template" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111] border-white/10">
                    {templates.map(t => (
                      <SelectItem key={t} value={t} className="text-white">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-white/60 text-xs">Total de Destinatários</Label>
                <Input
                  type="number"
                  min={1}
                  value={newCampaign.total}
                  onChange={e => setNewCampaign(p => ({ ...p, total: parseInt(e.target.value) || 1 }))}
                  className="bg-white/5 border-white/10 text-sm text-white"
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <DialogClose asChild>
                <Button variant="ghost" className="text-white/50 hover:text-white/80">Cancelar</Button>
              </DialogClose>
              <Button
                onClick={handleCreate}
                disabled={!newCampaign.name.trim() || !newCampaign.template}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white"
              >
                Criar Campanha
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 overflow-y-auto max-h-80 zehla-scroll p-2 space-y-2">
        <AnimatePresence>
          {campaigns.map((campaign, idx) => {
            const status = statusConfig[campaign.status];
            const TypeIcon = typeIcons[campaign.type];

            return (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white/[0.03] border border-white/5 rounded-lg p-3 hover:bg-white/[0.06] transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <TypeIcon className="w-3.5 h-3.5 text-white/40 shrink-0" />
                    <span className="text-xs font-medium text-white/90 truncate">{campaign.name}</span>
                  </div>
                  <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 border shrink-0 ${status.className}`}>
                    {status.label}
                  </Badge>
                </div>

                <div className="text-[10px] text-white/30 mb-2">
                  {typeLabels[campaign.type]} · {campaign.template} · {campaign.createdAt}
                </div>

                {campaign.status !== 'draft' && (
                  <CampaignProgressBar {...campaign} />
                )}

                {campaign.status === 'draft' && (
                  <div className="text-[10px] text-white/25 italic">Rascunho — pronto para iniciar</div>
                )}

                <div className="flex items-center gap-1.5 mt-2.5">
                  {campaign.status === 'draft' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateStatus(campaign.id, 'active')}
                      className="h-6 px-2 text-[10px] text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10"
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Iniciar
                    </Button>
                  )}
                  {campaign.status === 'active' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateStatus(campaign.id, 'paused')}
                      className="h-6 px-2 text-[10px] text-amber-400 hover:text-amber-300 hover:bg-amber-400/10"
                    >
                      <Pause className="w-3 h-3 mr-1" />
                      Pausar
                    </Button>
                  )}
                  {campaign.status === 'paused' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateStatus(campaign.id, 'active')}
                      className="h-6 px-2 text-[10px] text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10"
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Retomar
                    </Button>
                  )}
                  {(campaign.status === 'active' || campaign.status === 'paused') && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateStatus(campaign.id, 'completed')}
                      className="h-6 px-2 text-[10px] text-violet-400 hover:text-violet-300 hover:bg-violet-400/10"
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Concluir
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}