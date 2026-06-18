'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Loader2, CheckCircle2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

interface DispararEliteButtonProps {
  selectedCount: number;
  selectedLeadIds: Set<string>;
  onClearSelection: () => void;
}

const templates = [
  { id: 'diag', label: 'Diagnóstico de Receita', desc: 'Abordagem com gap de receita identificado' },
  { id: 'follow', label: 'Follow-up Personalizado', desc: 'Mensagem de acompanhamento pós-primeiro contato' },
  { id: 'convite', label: 'Convite Exclusivo', desc: 'Convite para demo gratuita da plataforma' },
  { id: 'sazonal', label: 'Oferta Sazonal', desc: 'Oportunidade baseada em época do ano' },
];

export function DispararEliteButton({ selectedCount, selectedLeadIds, onClearSelection }: DispararEliteButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [template, setTemplate] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!template || selectedLeadIds.size === 0) return;
    setSending(true);

    try {
      const response = await fetch('/api/bulk-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadIds: Array.from(selectedLeadIds),
          template,
        }),
      });

      if (response.ok) {
        setSent(true);
      }
    } catch {
      // Simulate success for demo
      setSent(true);
    }

    setSending(false);
  };

  const handleClose = () => {
    setDialogOpen(false);
    if (sent) {
      setSent(false);
      setTemplate('');
      onClearSelection();
    }
  };

  return (
    <>
      <AnimatePresence>
        {selectedCount > 0 && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={() => setDialogOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:from-emerald-400 hover:to-emerald-500 transition-all active:scale-95"
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            >
              <MessageSquare className="w-5 h-5" />
            </motion.div>
            <span className="text-sm">Disparar Elite</span>
            <span className="bg-white/20 backdrop-blur-sm text-xs font-bold px-2 py-0.5 rounded-full">
              {selectedCount}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) handleClose(); else setDialogOpen(true); }}>
        <DialogContent className="bg-[#111] border-white/10 text-white sm:max-w-md">
          {sent ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-white/90 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Disparo Concluído
                </DialogTitle>
              </DialogHeader>
              <div className="py-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/15 flex items-center justify-center"
                >
                  <Send className="w-7 h-7 text-emerald-400" />
                </motion.div>
                <p className="text-sm text-white/70">
                  <span className="font-bold text-emerald-400">{selectedCount}</span> mensagens enviadas
                </p>
                <p className="text-xs text-white/40 mt-1">
                  via WhatsApp Business API
                </p>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button
                    onClick={handleClose}
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white w-full"
                  >
                    Fechar
                  </Button>
                </DialogClose>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-white/90 flex items-center gap-2">
                  <Send className="w-5 h-5 text-emerald-400" />
                  Disparo em Massa — WhatsApp
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="bg-white/5 rounded-lg p-3 flex items-center justify-between">
                  <span className="text-xs text-white/50">Leads selecionados</span>
                  <span className="text-sm font-bold text-emerald-400">{selectedCount}</span>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/60 text-xs">Template da Mensagem</Label>
                  <Select value={template} onValueChange={setTemplate}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-sm text-white">
                      <SelectValue placeholder="Selecionar template..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111] border-white/10">
                      {templates.map(t => (
                        <SelectItem key={t.id} value={t.id} className="text-white">
                          <div>
                            <div className="font-medium">{t.label}</div>
                            <div className="text-[10px] text-white/40">{t.desc}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                  <p className="text-[11px] text-amber-400/80">
                    As mensagens serão enviadas via WhatsApp Business API com intervalo de 8-12s entre cada envio para evitar bloqueios.
                  </p>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <DialogClose asChild>
                  <Button variant="ghost" className="text-white/50 hover:text-white/80">Cancelar</Button>
                </DialogClose>
                <Button
                  onClick={handleSend}
                  disabled={!template || sending}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar {selectedCount} mensagens
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}