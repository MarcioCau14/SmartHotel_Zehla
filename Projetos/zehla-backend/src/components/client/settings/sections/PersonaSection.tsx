'use client';

import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Zap } from 'lucide-react';
import { darkSelectTrigger, type PersonaConfig } from '../types';

interface Props {
  persona: PersonaConfig;
  onChange: (data: PersonaConfig) => void;
}

export function PersonaSection({ persona, onChange }: Props) {
  return (
    <div className="mt-2 space-y-6">
      <div className="flex items-center justify-between p-4 bg-orange-500/5 border border-orange-500/20 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-full">
            <Zap className="w-4 h-4 text-orange-500" />
          </div>
          <div>
            <div className="text-sm font-bold text-orange-400">Sincronizar com DNA da Marca</div>
            <div className="text-[10px] text-[#898989]">Usar aprendizado autônomo do Whatsapp Persona Learner</div>
          </div>
        </div>
        <Switch checked={persona.useBrandDNA} onCheckedChange={(checked) => onChange({ ...persona, useBrandDNA: checked })} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#fafafa] uppercase tracking-widest">Nível de Formalidade</label>
            <span className="text-[10px] font-mono text-orange-400">{persona.formality}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={persona.formality}
            onChange={(e) => onChange({ ...persona, formality: parseInt(e.target.value) })}
            className="w-full accent-orange-500 bg-neutral-800 h-1.5 rounded-full appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-[#4d4d4d] font-bold uppercase">
            <span>Casual (E aí!)</span>
            <span>Formal (Prezado)</span>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold text-[#fafafa] uppercase tracking-widest block">Agressividade Comercial</label>
          <Select value={persona.aggressiveness} onValueChange={(v: any) => onChange({ ...persona, aggressiveness: v })}>
            <SelectTrigger className={darkSelectTrigger}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-neutral-900 border-[#363636]">
              <SelectItem value="PASSIVE">Passivo (Apenas responde dúvidas)</SelectItem>
              <SelectItem value="CONSULTATIVE">Consultivo (Sugere e ajuda)</SelectItem>
              <SelectItem value="CLOSING">Fechador (Foca em fechar a reserva)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-[9px] text-[#4d4d4d]">Define o apetite da IA para usar gatilhos de escassez e urgência.</p>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold text-[#fafafa] uppercase tracking-widest block">Estilo de Linguagem</label>
          <Select value={persona.style} onValueChange={(v: any) => onChange({ ...persona, style: v })}>
            <SelectTrigger className={darkSelectTrigger}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-neutral-900 border-[#363636]">
              <SelectItem value="REGIONAL">Regional (Com gírias locais)</SelectItem>
              <SelectItem value="EXECUTIVE">Executivo (Polido e eficiente)</SelectItem>
              <SelectItem value="RUSTIC">Rústico (Acolhedor e simples)</SelectItem>
              <SelectItem value="MINIMALIST">Minimalista (Direto ao ponto)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-[#2e2e2e] rounded-xl">
          <div className="flex items-center gap-3">
            <span className="text-lg">✨</span>
            <div>
              <div className="text-xs font-bold text-[#efefef]">Uso de Emojis</div>
              <div className="text-[10px] text-[#4d4d4d]">Permitir iconografia nas mensagens</div>
            </div>
          </div>
          <Switch checked={persona.allowEmojis} onCheckedChange={(checked) => onChange({ ...persona, allowEmojis: checked })} />
        </div>
      </div>
    </div>
  );
}
