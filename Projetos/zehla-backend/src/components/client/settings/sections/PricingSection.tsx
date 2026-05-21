'use client';

import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { BarChart3 } from 'lucide-react';
import { darkInput, type PricingRule, type AccommodationType } from '../types';

interface Props {
  rules: PricingRule[];
  types: AccommodationType[];
  competitorPricing: boolean;
  onRulesChange: (rules: PricingRule[]) => void;
  onCompetitorChange: (v: boolean) => void;
  getTypeName: (typeId: string) => string;
}

export function PricingSection({ rules, types, competitorPricing, onRulesChange, onCompetitorChange, getTypeName }: Props) {
  const updateRule = (id: string, field: keyof PricingRule, value: number) => {
    onRulesChange(rules.map((r) => r.id === id ? { ...r, [field]: value } : r));
  };

  return (
    <div className="mt-2 space-y-4">
      <div className="flex items-center justify-between bg-white/[0.03] border border-[#2e2e2e] rounded-xl p-4">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-4 h-4 text-[#FF5500]" />
          <div>
            <div className="text-sm font-medium text-[#efefef]">Precificação baseada em concorrentes</div>
            <div className="text-xs text-[#4d4d4d]">Ajuste automático de preços com base no mercado</div>
          </div>
        </div>
        <Switch checked={competitorPricing} onCheckedChange={onCompetitorChange} />
      </div>

      {rules.map((rule) => (
        <div key={rule.id} className="bg-white/[0.03] border border-[#2e2e2e] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[#fafafa]">{getTypeName(rule.typeId)}</span>
            <span className="text-xs text-[#4d4d4d]">
              Base: R$ {types.find((t) => t.id === rule.typeId)?.basePrice.toLocaleString('pt-BR')},00
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] text-[#4d4d4d] mb-1 block">Alta Temporada (%)</label>
              <div className="flex items-center gap-1">
                <span className="text-xs text-[#FF5500]">+</span>
                <Input type="number" value={rule.altaPercent} onChange={(e) => updateRule(rule.id, 'altaPercent', Number(e.target.value))} className={darkInput} />
                <span className="text-xs text-[#4d4d4d]">%</span>
              </div>
            </div>
            <div>
              <label className="text-[10px] text-[#4d4d4d] mb-1 block">Baixa Temporada (%)</label>
              <div className="flex items-center gap-1">
                <span className="text-xs text-blue-400">−</span>
                <Input type="number" value={rule.baixaPercent} onChange={(e) => updateRule(rule.id, 'baixaPercent', Number(e.target.value))} className={darkInput} />
                <span className="text-xs text-[#4d4d4d]">%</span>
              </div>
            </div>
            <div>
              <label className="text-[10px] text-[#4d4d4d] mb-1 block">Feriados (%)</label>
              <div className="flex items-center gap-1">
                <span className="text-xs text-[#FF5500]">+</span>
                <Input type="number" value={rule.feriadoPercent} onChange={(e) => updateRule(rule.id, 'feriadoPercent', Number(e.target.value))} className={darkInput} />
                <span className="text-xs text-[#4d4d4d]">%</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#2e2e2e]">
            <div>
              <label className="text-[10px] text-[#4d4d4d] mb-1 block">Preço Mínimo (R$)</label>
              <Input type="number" value={rule.minPrice} onChange={(e) => updateRule(rule.id, 'minPrice', Number(e.target.value))} className={darkInput} />
            </div>
            <div>
              <label className="text-[10px] text-[#4d4d4d] mb-1 block">Preço Máximo (R$)</label>
              <Input type="number" value={rule.maxPrice} onChange={(e) => updateRule(rule.id, 'maxPrice', Number(e.target.value))} className={darkInput} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
