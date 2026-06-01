'use client';

import { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  MapPin, 
  Activity, 
  TrendingUp, 
  AlertCircle,
  Clock,
  ExternalLink,
  Mail,
  Phone,
  Tag,
  Zap,
  MoreVertical
} from 'lucide-react';

// Dados fictícios baseados no "Seed" de 37 leads
const mockLeads = [
  {
    id: '1',
    name: 'Pousada Recanto do Sol',
    city: 'Imbituba',
    state: 'SC',
    rooms: 12,
    score: 85,
    pain: 'Escravo da Booking',
    intent: 'ALTA',
    behavior: 'Conservador',
    status: 'PROSPECT',
    lastInteraction: '2 horas atrás',
  },
  {
    id: '2',
    name: 'Eco Lodge Praia do Rosa',
    city: 'Imbituba',
    state: 'SC',
    rooms: 8,
    score: 92,
    pain: 'Operação Caótica',
    intent: 'CRÍTICA',
    behavior: 'Urgente',
    status: 'QUALIFIED',
    lastInteraction: '5 mins atrás',
  },
  {
    id: '3',
    name: 'Hotel Vila Bela',
    city: 'Garopaba',
    state: 'SC',
    rooms: 25,
    score: 64,
    pain: 'Tradicional/Resistente',
    intent: 'MÉDIA',
    behavior: 'Cético',
    status: 'PROSPECT',
    lastInteraction: '1 dia atrás',
  },
];

export default function LeadsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-8">
      {/* HEADER DA PÁGINA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#fafafa] flex items-center gap-3">
            <Users className="w-8 h-8 text-orange-500" />
            Secretaria-IA: Leads Qualificados
          </h1>
          <p className="text-[#898989] mt-2">
            Mapeamento geográfico e comportamental de 10.000+ pousadas (Sinergia Brain)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-orange-500/10 border border-orange-500/20 text-orange-500 rounded-xl text-sm font-medium hover:bg-orange-500/20 transition-all flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Nova Extração
          </button>
          <button className="px-4 py-2 bg-[#1f1f1f] text-[#fafafa] rounded-xl text-sm font-medium hover:bg-[#262626] transition-all flex items-center gap-2">
            Exportar CSV
          </button>
        </div>
      </div>

      {/* MÉTRICAS RÁPIDAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Extraído', value: '10.452', sub: '+12% este mês', icon: Users, color: 'text-blue-500' },
          { label: 'Qualificados (Brain)', value: '1.240', sub: 'Score > 80', icon: TrendingUp, color: 'text-green-500' },
          { label: 'Dores Críticas', value: '342', sub: 'Foco: Booking/Comissão', icon: AlertCircle, color: 'text-orange-500' },
          { label: 'Ativos no Funil', value: '56', sub: 'Em trial grátis', icon: Activity, color: 'text-purple-500' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg bg-[#141414] border border-[#1f1f1f] ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[#898989] text-xs uppercase tracking-wider font-bold mb-1">{stat.label}</p>
            <h3 className="text-2xl font-bold text-[#fafafa]">{stat.value}</h3>
            <p className="text-[10px] text-[#4d4d4d] mt-2 font-medium">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* TABELA DE LEADS */}
      <div className="glass-card overflow-hidden">
        {/* Filtros e Busca */}
        <div className="p-6 border-b border-[#1f1f1f] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4d4d4d]" />
            <input 
              type="text" 
              placeholder="Buscar por nome, cidade ou dor..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#141414] border border-[#1f1f1f] rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-orange-500/50 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2.5 bg-[#141414] border border-[#1f1f1f] rounded-xl hover:bg-[#1f1f1f] transition-all text-[#898989]">
              <Filter className="w-4 h-4" />
            </button>
            <select className="bg-[#141414] border border-[#1f1f1f] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500/50 transition-all text-[#fafafa]">
              <option>Todas as Dores</option>
              <option>Escravo da Booking</option>
              <option>Operação Caótica</option>
              <option>Tradicional/Resistente</option>
            </select>
          </div>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#0f0f0f] text-[#4d4d4d] text-[10px] uppercase tracking-widest font-bold">
                <th className="px-6 py-4">Pousada / Localização</th>
                <th className="px-6 py-4">Métricas Brain</th>
                <th className="px-6 py-4">Classificação de Dor</th>
                <th className="px-6 py-4">Status / Atividade</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f1f1f]">
              {mockLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-[#141414]/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-[#fafafa] font-semibold text-sm group-hover:text-orange-500 transition-colors">
                        {lead.name}
                      </span>
                      <span className="text-[#4d4d4d] text-xs flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {lead.city}, {lead.state} • {lead.rooms} quartos
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#141414] border border-[#1f1f1f] flex items-center justify-center relative">
                        <span className={`text-xs font-bold ${lead.score > 80 ? 'text-green-500' : 'text-orange-500'}`}>
                          {lead.score}
                        </span>
                        <div className="absolute inset-0 rounded-full border-2 border-orange-500/20 border-t-orange-500 animate-spin-slow"></div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-[#4d4d4d] uppercase font-bold">Intenção</span>
                        <span className={`text-xs font-bold ${lead.intent === 'CRÍTICA' ? 'text-red-500' : 'text-orange-500'}`}>
                          {lead.intent}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] font-bold w-fit">
                        {lead.pain}
                      </span>
                      <span className="text-[10px] text-[#4d4d4d] flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        Perfil: {lead.behavior}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${lead.status === 'QUALIFIED' ? 'text-green-500' : 'text-[#898989]'}`}>
                        {lead.status}
                      </span>
                      <span className="text-[#4d4d4d] text-xs flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        {lead.lastInteraction}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 rounded-lg bg-[#1f1f1f] hover:bg-orange-500/20 hover:text-orange-500 transition-all text-[#898989]">
                        <Mail className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg bg-[#1f1f1f] hover:bg-green-500/20 hover:text-green-500 transition-all text-[#898989]">
                        <Phone className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg bg-[#1f1f1f] hover:bg-[#262626] transition-all text-[#898989]">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginação Fake */}
        <div className="p-6 border-t border-[#1f1f1f] flex items-center justify-between">
          <p className="text-xs text-[#4d4d4d]">Mostrando 3 de 10.452 pousadas mapeadas</p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 bg-[#141414] border border-[#1f1f1f] rounded-lg text-xs text-[#898989] disabled:opacity-50" disabled>Anterior</button>
            <button className="px-3 py-1 bg-[#141414] border border-[#1f1f1f] rounded-lg text-xs text-orange-500 border-orange-500/50">1</button>
            <button className="px-3 py-1 bg-[#141414] border border-[#1f1f1f] rounded-lg text-xs text-[#898989] hover:bg-[#1f1f1f]">2</button>
            <button className="px-3 py-1 bg-[#141414] border border-[#1f1f1f] rounded-lg text-xs text-[#898989] hover:bg-[#1f1f1f]">Próxima</button>
          </div>
        </div>
      </div>
    </div>
  );
}
