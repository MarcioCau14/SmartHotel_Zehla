'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileSpreadsheet, 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal,
  ChevronRight,
  ExternalLink,
  Smartphone,
  Mail,
  Zap,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Lead {
  id: string;
  name: string;
  property: string;
  email: string | null;
  phone: string | null;
  region: string;
  state: string;
  conversionScore: number;
  validationScore: number;
  status: string;
}

export function RegionSpreadsheetView() {
  const [region, setRegion] = useState('Imbituba');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/zcc/leads?region=${region}`);
        const data = await res.json();
        setLeads(data.leads || []);
      } catch (error) {
        console.error('Error fetching regional leads:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, [region]);

  const filteredLeads = leads.filter(l => 
    l.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.property?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <FileSpreadsheet className="text-emerald-500" size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-300">Base Regional</h3>
            <p className="text-[10px] text-zinc-500">Visualizando leads de {region}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
            <input 
              type="text" 
              placeholder="Buscar na base..."
              className="bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none"
          >
            <option value="Imbituba">Imbituba</option>
            <option value="Garopaba">Garopaba</option>
            <option value="Florianópolis">Florianópolis</option>
            <option value="Bombinhas">Bombinhas</option>
          </select>
          <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors">
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* Spreadsheet Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4 text-zinc-500">
            <Loader2 className="animate-spin" size={32} />
            <p className="text-sm">Carregando dados reais...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-950/50 border-b border-zinc-800">
                  <th className="px-4 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Pousada / Hotel</th>
                  <th className="px-4 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Contato</th>
                  <th className="px-4 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Qualificação</th>
                  <th className="px-4 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center">Score</th>
                  <th className="px-4 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-4 py-4">
                      <div className="font-bold text-zinc-200 text-sm">{lead.property}</div>
                      <div className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
                        {lead.name} • {lead.city}, {lead.state}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        {lead.phone && (
                          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                            <Smartphone size={10} className="text-emerald-500/50" />
                            {lead.phone}
                          </div>
                        )}
                        {lead.email && (
                          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                            <Mail size={10} className="text-blue-500/50" />
                            {lead.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant="outline" className={`text-[9px] uppercase font-black tracking-tighter ${
                        lead.validationScore >= 90 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' :
                        lead.validationScore >= 70 ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' :
                        'bg-zinc-500/10 text-zinc-500 border-zinc-800'
                      }`}>
                        {lead.validationScore >= 90 ? 'High Intent' : lead.validationScore >= 70 ? 'Promising' : 'Cold'}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className={`text-sm font-black font-mono ${
                        lead.conversionScore >= 90 ? 'text-amber-500' :
                        lead.conversionScore >= 70 ? 'text-zinc-300' :
                        'text-zinc-600'
                      }`}>
                        {lead.conversionScore}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-600 hover:text-emerald-500 transition-all opacity-0 group-hover:opacity-100">
                        <Zap size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredLeads.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <AlertTriangle className="mx-auto mb-3 text-zinc-800" size={32} />
                      <p className="text-zinc-500 text-sm">Nenhum lead encontrado nesta região.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
