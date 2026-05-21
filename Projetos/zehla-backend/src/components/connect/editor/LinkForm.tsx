'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';
import type { ConnectLink } from './types';

interface Props {
  initial?: ConnectLink;
  onSave: (data: Partial<ConnectLink>) => void;
  onCancel: () => void;
}

export function LinkForm({ initial, onSave, onCancel }: Props) {
  const [label, setLabel] = useState(initial?.label || '');
  const [url, setUrl] = useState(initial?.url || '');
  const [icon, setIcon] = useState(initial?.icon || 'link');

  return (
    <div className="space-y-3 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-400">Label</Label>
          <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="WhatsApp" className="bg-slate-900 border-slate-700 text-white h-9" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-400">URL</Label>
          <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://wa.me/..." className="bg-slate-900 border-slate-700 text-white h-9" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="space-y-1.5 flex-1 max-w-[200px]">
          <Label className="text-xs text-slate-400">Ícone</Label>
          <select value={icon} onChange={(e) => setIcon(e.target.value)} className="w-full h-9 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm px-3">
            <option value="link">Link</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="instagram">Instagram</option>
            <option value="booking">Booking</option>
            <option value="airbnb">Airbnb</option>
            <option value="website">Website</option>
          </select>
        </div>
        <div className="flex gap-2 mt-5">
          <Button variant="ghost" size="sm" onClick={onCancel} className="text-slate-400">Cancelar</Button>
          <Button size="sm" onClick={() => onSave({ label, url, icon })} disabled={!label || !url} className="bg-orange-500 hover:bg-orange-400 text-white">
            <Save className="w-3.5 h-3.5 mr-1" />
            Salvar
          </Button>
        </div>
      </div>
    </div>
  );
}
