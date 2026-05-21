'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QrCode } from 'lucide-react';
import { darkInput, darkSelectTrigger, type WhatsAppConfig } from '../types';

interface Props {
  whatsapp: WhatsAppConfig;
  onChange: (data: WhatsAppConfig) => void;
}

export function WhatsAppSection({ whatsapp, onChange }: Props) {
  return (
    <div className="mt-2 space-y-5">
      <div className="bg-white/[0.03] border border-[#2e2e2e] rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${whatsapp.connected ? 'bg-green-400 animate-zehla-pulse' : 'bg-red-400'}`} />
            <span className={`text-sm font-medium ${whatsapp.connected ? 'text-green-400' : 'text-red-400'}`}>
              {whatsapp.connected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
          <Button size="sm" variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500/10 text-xs">
            <QrCode className="w-3.5 h-3.5" />
            Escanear QR Code
          </Button>
        </div>
        <div className="w-full max-w-[200px] mx-auto aspect-square bg-[#242424] border border-dashed border-[#363636] rounded-xl flex flex-col items-center justify-center gap-2">
          <QrCode className="w-10 h-10 text-[#363636]" />
          <span className="text-[10px] text-[#363636]">QR Code aparecerá aqui</span>
        </div>
      </div>

      <div className="flex items-center justify-between bg-white/[0.03] border border-[#2e2e2e] rounded-xl p-4">
        <div>
          <div className="text-sm font-medium text-[#efefef]">Atendimento automático pelo ZEHLA</div>
          <div className="text-xs text-[#4d4d4d] mt-0.5">Respostas automáticas para hóspedes via WhatsApp</div>
        </div>
        <Switch checked={whatsapp.autoReply} onCheckedChange={(checked) => onChange({ ...whatsapp, autoReply: checked })} />
      </div>

      <div className="bg-white/[0.03] border border-[#2e2e2e] rounded-xl p-4 space-y-4">
        <div>
          <label className="text-xs text-[#4d4d4d] mb-1.5 block">Configuração de Canal</label>
          <Select value={whatsapp.whatsappType} onValueChange={(v) => onChange({ ...whatsapp, whatsappType: v as any })}>
            <SelectTrigger className={darkSelectTrigger}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-neutral-900 border-[#363636]">
              <SelectItem value="GUESTS_ONLY">Apenas Hóspedes (Recusar Fornecedores)</SelectItem>
              <SelectItem value="GUESTS_AND_SUPPLIERS">Hóspedes e Fornecedores (Misto)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-[10px] text-[#363636] mt-1.5">
            Se definido como "Apenas Hóspedes", o ZEHLA informará fornecedores que este canal é exclusivo para reservas.
          </p>
        </div>

        {whatsapp.whatsappType === 'GUESTS_ONLY' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3 pt-3 border-t border-[#2e2e2e]"
          >
            <div>
              <label className="text-xs text-[#4d4d4d] mb-1.5 block">Número Alternativo para Fornecedores</label>
              <Input
                placeholder="Ex: (81) 99999-9999"
                value={whatsapp.supplierContact}
                onChange={(e) => onChange({ ...whatsapp, supplierContact: e.target.value })}
                className={darkInput}
              />
            </div>
          </motion.div>
        )}
      </div>

      {whatsapp.autoReply && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-4"
        >
          {[
            { label: '👋 Mensagem de Boas-vindas', value: whatsapp.welcomeMessage, key: 'welcomeMessage' as const },
            { label: '🏨 Instruções de Check-in', value: whatsapp.checkinInstructions, key: 'checkinInstructions' as const },
            { label: '📶 Informações de Wi-Fi', value: whatsapp.wifiInfo, key: 'wifiInfo' as const },
            { label: '🏊 Horários (Piscina, Restaurante, etc.)', value: whatsapp.hoursInfo, key: 'hoursInfo' as const }
          ].map((field) => (
            <div key={field.key}>
              <label className="text-xs text-[#4d4d4d] mb-1.5 block">{field.label}</label>
              <textarea
                value={field.value}
                onChange={(e) => onChange({ ...whatsapp, [field.key]: e.target.value })}
                className={`${darkInput} min-h-[80px] resize-none`}
                rows={3}
              />
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
