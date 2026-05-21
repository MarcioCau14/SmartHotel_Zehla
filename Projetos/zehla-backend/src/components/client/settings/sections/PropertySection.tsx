'use client';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { darkInput, darkSelectTrigger, type PropertyData } from '../types';

interface Props {
  property: PropertyData;
  onChange: (data: PropertyData) => void;
}

export function PropertySection({ property, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
      <div className="sm:col-span-2">
        <label className="text-xs text-[#4d4d4d] mb-1 block">Nome da Propriedade</label>
        <Input value={property.name} onChange={(e) => onChange({ ...property, name: e.target.value })} className={darkInput} />
      </div>
      <div>
        <label className="text-xs text-[#4d4d4d] mb-1 block">CNPJ</label>
        <Input value={property.cnpj} onChange={(e) => onChange({ ...property, cnpj: e.target.value })} className={darkInput} />
      </div>
      <div>
        <label className="text-xs text-[#4d4d4d] mb-1 block">Telefone</label>
        <Input value={property.phone} onChange={(e) => onChange({ ...property, phone: e.target.value })} className={darkInput} />
      </div>
      <div className="sm:col-span-2">
        <label className="text-xs text-[#4d4d4d] mb-1 block">Endereço</label>
        <Input value={property.address} onChange={(e) => onChange({ ...property, address: e.target.value })} className={darkInput} />
      </div>
      <div>
        <label className="text-xs text-[#4d4d4d] mb-1 block">Cidade</label>
        <Input value={property.city} onChange={(e) => onChange({ ...property, city: e.target.value })} className={darkInput} />
      </div>
      <div>
        <label className="text-xs text-[#4d4d4d] mb-1 block">Estado</label>
        <Input value={property.state} onChange={(e) => onChange({ ...property, state: e.target.value })} className={darkInput} />
      </div>
      <div>
        <label className="text-xs text-[#4d4d4d] mb-1 block">E-mail</label>
        <Input value={property.email} onChange={(e) => onChange({ ...property, email: e.target.value })} className={darkInput} />
      </div>
      <div>
        <label className="text-xs text-[#4d4d4d] mb-1 block">Tipo de Propriedade</label>
        <Select value={property.propertyType} onValueChange={(v) => onChange({ ...property, propertyType: v })}>
          <SelectTrigger className={darkSelectTrigger}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-neutral-900 border-[#363636]">
            <SelectItem value="pousada">Pousada</SelectItem>
            <SelectItem value="hotel">Hotel</SelectItem>
            <SelectItem value="hostel">Hostel</SelectItem>
            <SelectItem value="fazenda">Fazenda</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-xs text-[#4d4d4d] mb-1 block">Check-in</label>
        <Input type="time" value={property.checkinTime} onChange={(e) => onChange({ ...property, checkinTime: e.target.value })} className={darkInput} />
      </div>
      <div>
        <label className="text-xs text-[#4d4d4d] mb-1 block">Check-out</label>
        <Input type="time" value={property.checkoutTime} onChange={(e) => onChange({ ...property, checkoutTime: e.target.value })} className={darkInput} />
      </div>
      <div>
        <label className="text-xs text-[#4d4d4d] mb-1 block">Classificação (Estrelas)</label>
        <Select value={property.starRating} onValueChange={(v) => onChange({ ...property, starRating: v })}>
          <SelectTrigger className={darkSelectTrigger}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-neutral-900 border-[#363636]">
            <SelectItem value="3">⭐⭐⭐ (3 estrelas)</SelectItem>
            <SelectItem value="4">⭐⭐⭐⭐ (4 estrelas)</SelectItem>
            <SelectItem value="5">⭐⭐⭐⭐⭐ (5 estrelas)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
