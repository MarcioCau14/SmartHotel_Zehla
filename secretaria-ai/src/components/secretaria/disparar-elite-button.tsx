'use client';

import { motion } from 'framer-motion';
import { Rocket } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  selectedCount: number;
  selectedEmails: string[];
  onClear: () => void;
}

export function DispararEliteButton({ selectedCount, selectedEmails, onClear }: Props) {
  const enabled = selectedCount > 0;

  const handleClick = async () => {
    try {
      const response = await fetch('/api/bulk-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: selectedEmails }),
      });
      
      if (response.ok) {
        toast.success(`Iniciando envio para ${selectedCount} leads...`, {
          description: 'A Secretaria CAU está processando a personalização e os anexos PDF.',
          duration: 5000,
        });
        onClear();
      } else {
        throw new Error('Falha ao iniciar disparo.');
      }
    } catch (error) {
      toast.error('Erro ao conectar com a Secretaria CAU.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const }}
      className="fixed bottom-6 right-6 z-50"
    >
      <motion.button
        whileHover={enabled ? { scale: 1.05 } : {}}
        whileTap={enabled ? { scale: 0.95 } : {}}
        onClick={enabled ? handleClick : undefined}
        disabled={!enabled}
        className={`relative flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-semibold text-sm transition-all duration-300 select-none
          ${enabled ? 'text-white animate-pulse-glow' : 'text-[#64748b] cursor-not-allowed opacity-40'}`}
        style={enabled
          ? { background: 'linear-gradient(135deg, #4169E1 0%, #3b5bd4 50%, #14b8a6 100%)' }
          : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }
        }
      >
        {enabled && (
          <div className="absolute inset-0 rounded-2xl blur-xl -z-10 opacity-60"
            style={{ background: 'linear-gradient(135deg, #4169E1 0%, #14b8a6 100%)' }}
          />
        )}
        <Rocket size={18} />
        <div className="flex flex-col items-start leading-none">
          <span className="text-xs font-bold">Enviar Proposta Elite</span>
          <span className="text-[10px] opacity-70 font-medium">Disparo Controlado</span>
        </div>
        {enabled && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-white/20">
            {selectedCount}
          </motion.span>
        )}
      </motion.button>
    </motion.div>
  );
}
