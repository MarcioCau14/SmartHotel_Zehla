'use client';

import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ThemeTab() {
  return (
    <div className="mt-6">
      <Card className="bg-slate-800/30 border-slate-700/50 p-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm text-slate-300">Layout</Label>
              <select className="w-full h-10 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm px-3">
                <option value="centered">Centralizado</option>
                <option value="compact">Compacto</option>
                <option value="cards">Cards</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-slate-300">Fonte</Label>
              <select className="w-full h-10 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm px-3">
                <option value="inter">Inter</option>
                <option value="geist">Geist</option>
                <option value="serif">Serif</option>
                <option value="mono">Mono</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-slate-300">Botões</Label>
              <select className="w-full h-10 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm px-3">
                <option value="rounded">Arredondado</option>
                <option value="pill">Pill</option>
                <option value="square">Quadrado</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm text-slate-300">Cores</Label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {['primary', 'secondary', 'accent', 'background', 'text'].map((color) => {
                const defaults: Record<string, string> = { primary: '#10B981', secondary: '#0F172A', accent: '#F59E0B', background: '#FFFFFF', text: '#1F2937' };
                return (
                  <div key={color} className="space-y-1.5">
                    <Label className="text-[10px] uppercase tracking-wider text-slate-500">{color}</Label>
                    <div className="flex items-center gap-2">
                      <input type="color" className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0" defaultValue={defaults[color]} />
                      <Input className="bg-slate-900 border-slate-700 text-white font-mono text-xs h-8" defaultValue={defaults[color]} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Button className="bg-orange-500 hover:bg-orange-400 text-white">
            <Save className="w-4 h-4 mr-1.5" />
            Salvar Tema
          </Button>
        </div>
      </Card>
    </div>
  );
}
