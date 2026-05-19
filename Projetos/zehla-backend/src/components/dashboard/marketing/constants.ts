import { Building2, Brain } from 'lucide-react';


export const statusColors: Record<string, string> = {
  new: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  contacted: 'bg-[#FF5500]/10 text-[#FF5500] border-[#FF5500]/30',
  interested: 'bg-[#FF5500]/10 text-[#FF5500] border-[#FF5500]/30',
  converted: 'bg-purple-500/20 text-[#FF5500] border-[#FF5500]/30',
  lost: 'bg-red-500/20 text-red-400 border-red-500/30'
};

export const statusLabels: Record<string, string> = {
  new: 'Novo',
  contacted: 'Contactado',
  interested: 'Interessado',
  converted: 'Convertido',
  lost: 'Perdido'
};

export const categoryIcons: Record<string, string> = {
  pousada: '🏡',
  hotel: '🏨',
  hostel: '🛏️'
};

export const SOURCE_INFO = {
  junta: { label: 'Junta Comercial', color: 'text-blue-400', icon: Building2 },
  secretaria: { label: 'Secretaria-IA', color: 'text-[#FF5500]', icon: Brain, detail: 'Google Business & Reclame Aqui' }
};
