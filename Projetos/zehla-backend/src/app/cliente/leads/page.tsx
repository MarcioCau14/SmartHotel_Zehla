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
  Mail,
  Phone,
  Tag,
  Zap,
  MoreVertical,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

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
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl font-black text-white tracking-tight uppercase flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FF5500]/10 flex items-center justify-center border border-[#FF5500]/25">
              <Users className="w-4 h-4 text-[#FF5500]" />
            </div>
            Secretaria-IA: Leads
          </h1>
          <p className="text-neutral-500 text-xs font-bold uppercase tracking-wider mt-1.5">
            Mapeamento geográfico e comportamental de 10.000+ pousadas (Sinergia Brain)
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3"
        >
          <button className="px-4 py-2 bg-[#FF5500]/10 border border-[#FF5500]/25 text-[#FF5500] rounded-xl text-xs font-black uppercase tracking-wider hover:bg-[#FF5500]/20 hover:shadow-[0_0_15px_rgba(255,85,0,0.1)] transition-all duration-300 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5" />
            Nova Extração
          </button>
          <button className="px-4 py-2 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 text-neutral-300 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300">
            Exportar CSV
          </button>
        </motion.div>
      </div>

      {/* MÉTRICAS RÁPIDAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Extraído', value: '10.452', sub: '+12% este mês', icon: Users, color: '#00CCFF', glow: 'rgba(0,204,255,0.05)' },
          { label: 'Qualificados (Brain)', value: '1.240', sub: 'Score > 80', icon: TrendingUp, color: '#00FF88', glow: 'rgba(0,255,136,0.05)' },
          { label: 'Dores Críticas', value: '342', sub: 'Foco: Booking/Comissão', icon: AlertCircle, color: '#FF5500', glow: 'rgba(255,85,0,0.05)' },
          { label: 'Ativos no Funil', value: '56', sub: 'Em trial grátis', icon: Activity, color: '#FF3366', glow: 'rgba(255,51,102,0.05)' },
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.05 }}
            className="bg-[#0a0a0c]/60 border border-white/5 rounded-2xl p-5 backdrop-blur-md transition-all duration-300 hover:border-white/10 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div 
                className="w-9 h-9 rounded-xl flex items-center justify-center border shadow-md group-hover:scale-105 transition-transform duration-300"
                style={{ 
                  backgroundColor: `${stat.color}15`, 
                  borderColor: `${stat.color}25`,
                  color: stat.color
                }}
              >
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-neutral-500 text-[10px] uppercase tracking-wider font-black mb-1">{stat.label}</p>
            <h3 className="text-2xl font-black text-white tracking-tight">{stat.value}</h3>
            <p className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest mt-2">{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* TABELA DE LEADS */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-[#0a0a0c]/60 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-md"
      >
        {/* Filtros e Busca */}
        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
            <input 
              type="text" 
              placeholder="Buscar por nome, cidade ou dor..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#050505]/40 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-neutral-300 placeholder-neutral-700 outline-none focus:border-[#FF5500]/30 transition-all duration-300"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2.5 bg-[#050505]/40 border border-white/5 rounded-xl hover:bg-white/[0.02] transition-all duration-300 text-neutral-500">
              <Filter className="w-4 h-4" />
            </button>
            <select className="bg-[#050505]/40 border border-white/5 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#FF5500]/30 transition-all text-neutral-300 font-bold uppercase tracking-wider">
              <option className="bg-[#0a0a0c]">Todas as Dores</option>
              <option className="bg-[#0a0a0c]">Escravo da Booking</option>
              <option className="bg-[#0a0a0c]">Operação Caótica</option>
              <option className="bg-[#0a0a0c]">Tradicional/Resistente</option>
            </select>
          </div>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#050505]/20 text-neutral-500 text-[9px] uppercase tracking-widest font-black border-b border-white/5">
                <th className="px-6 py-4">Pousada / Localização</th>
                <th className="px-6 py-4">Métricas Brain</th>
                <th className="px-6 py-4">Classificação de Dor</th>
                <th className="px-6 py-4">Status / Atividade</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {mockLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-white/[0.01] transition-colors duration-300 group">
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-white font-bold text-sm group-hover:text-[#FF5500] transition-colors duration-300">
                        {lead.name}
                      </span>
                      <span className="text-neutral-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 mt-1.5">
                        <MapPin className="w-3 h-3 text-neutral-600" />
                        {lead.city}, {lead.state} • {lead.rooms} quartos
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#050505]/60 border border-white/5 flex items-center justify-center relative">
                        <span className={`text-xs font-black ${lead.score > 80 ? 'text-[#00FF88]' : 'text-[#FF5500]'}`}>
                          {lead.score}
                        </span>
                        <div className="absolute inset-0 rounded-xl border border-[#FF5500]/10 border-t-[#FF5500]/40 animate-spin-slow"></div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-neutral-500 font-black uppercase tracking-wider">Intenção</span>
                        <span className={`text-xs font-black tracking-wide ${lead.intent === 'CRÍTICA' ? 'text-[#FF3366]' : 'text-[#FF5500]'}`}>
                          {lead.intent}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-2">
                      <span className="px-2.5 py-1 rounded-md bg-[#FF5500]/10 border border-[#FF5500]/25 text-[#FF5500] text-[9px] font-black uppercase tracking-wider w-fit">
                        {lead.pain}
                      </span>
                      <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Tag className="w-3 h-3 text-neutral-600" />
                        Perfil: {lead.behavior}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className={`text-[9px] font-black uppercase tracking-widest ${lead.status === 'QUALIFIED' ? 'text-[#00FF88]' : 'text-neutral-500'}`}>
                        {lead.status}
                      </span>
                      <span className="text-neutral-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 mt-1.5">
                        <Clock className="w-3 h-3 text-neutral-600" />
                        {lead.lastInteraction}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 rounded-lg bg-white/[0.01] hover:bg-[#FF5500]/10 hover:text-[#FF5500] border border-white/5 hover:border-[#FF5500]/20 transition-all duration-300 text-neutral-500">
                        <Mail className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-2 rounded-lg bg-white/[0.01] hover:bg-[#00FF88]/10 hover:text-[#00FF88] border border-white/5 hover:border-[#00FF88]/20 transition-all duration-300 text-neutral-500">
                        <Phone className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-2 rounded-lg bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 transition-all duration-300 text-neutral-500">
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginação Fake */}
        <div className="p-6 border-t border-white/5 flex items-center justify-between">
          <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Mostrando 3 de 10.452 pousadas mapeadas</p>
          <div className="flex items-center gap-2">
            <button className="p-1.5 bg-white/[0.01] border border-white/5 rounded-lg text-xs text-neutral-600 disabled:opacity-30 disabled:pointer-events-none transition-all" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="px-3 py-1 bg-[#FF5500]/10 border border-[#FF5500]/25 rounded-lg text-xs font-black text-[#FF5500]">1</button>
            <button className="px-3 py-1 bg-white/[0.01] border border-white/5 rounded-lg text-xs text-neutral-500 font-bold hover:bg-white/[0.03] transition-all">2</button>
            <button className="p-1.5 bg-white/[0.01] border border-white/5 rounded-lg text-xs text-neutral-500 hover:bg-white/[0.03] transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
