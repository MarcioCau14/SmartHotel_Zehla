import { 
import { useState, useEffect, useMemo } from 'react';

import { Badge } from '@/components/ui/badge';


'use client';

  FolderOpen, Upload, List, Star, Loader2 
} from 'lucide-react';

interface RegionSpreadsheetViewProps {
  region: string;
}

export function RegionSpreadsheetView(: void { region }: RegionSpreadsheetViewProps) {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, [region]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/zcc/leads?region=${encodeURIComponent(region)}`);
      const data = await res.json();
      setLeads(data.leads || []);
    } catch (error) {
      console.error('Error fetching regional leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const mockLeads = [
      {
        nome: 'Pousada ' + region + ' Eco',
        categoria: 'pousada',
        cidade: 'Cidade Sol',
        estado: region,
        telefone: '(99) 99999-1111',
        email: `contato@${region.toLowerCase()}eco.com`,
        nota: 4.8,
        score: 92,
        status: 'QUALIFIED',
        dores: 'Dificuldade em gerir reservas via WhatsApp; Alta taxa de cancelamento no Booking.'
      }
    ];

    try {
      const res = await fetch('/api/zcc/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads: mockLeads, region })
      });

      if (res.ok) {
        fetchLeads();
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const qualifiedLeads = useMemo(() => leads.filter((l) => l.status === 'QUALIFIED'), [leads]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#fafafa] flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-[#FF5500]" />
            Leads — Região {region}
          </h2>
          <p className="text-xs text-[#4d4d4d]">Gerencie e visualize as planilhas de prospecção da região.</p>
        </div>
        
        <label className="bg-[#FF5500] hover:bg-[#EA580C] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-[#FF5500]/20">
          <Upload className="w-4 h-4" />
          Fazer Upload de Planilha
          <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleUpload} />
        </label>
      </div>

      <div className="glass-card p-4">
        <div className="text-xs font-semibold text-[#b4b4b4] mb-3 flex items-center gap-2">
          <List className="w-4 h-4 text-[#FF5500]" />
          Status da Região
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-[#4d4d4d] uppercase font-bold">Total de Leads</span>
            <span className="text-lg font-bold text-[#efefef] font-mono">{leads.length}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-[#4d4d4d] uppercase font-bold">Qualificados</span>
            <span className="text-lg font-bold text-[#FF5500] font-mono">
              {qualifiedLeads.length}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-[#2e2e2e] flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
            <span className="text-[10px] text-[#898989]">Dados base (Junta Comercial)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#FF5500]"></div>
            <span className="text-[10px] text-[#898989]">Enriquecimento (Google Business / Reclame Aqui)</span>
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto zehla-scroll-x">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-[#2e2e2e] bg-white/[0.01]">
                <th colSpan={6} className="text-[10px] uppercase tracking-wider text-blue-400/50 px-4 py-2 border-r border-[#2e2e2e] font-bold text-center bg-blue-500/[0.02]">
                  Dados Junta Comercial
                </th>
                <th colSpan={4} className="text-[10px] uppercase tracking-wider text-[#FF5500]/50 px-4 py-2 font-bold text-center bg-[#FF5500]/[0.02]">
                  Enriquecimento Secretaria-IA
                </th>
              </tr>
              <tr className="border-b border-[#2e2e2e] bg-white/[0.01]">
                <th className="text-xs text-[#4d4d4d] px-4 py-3 font-semibold border-r border-[#2e2e2e]">Nome/Empresa</th>
                <th className="text-xs text-[#4d4d4d] px-4 py-3 font-semibold border-r border-[#2e2e2e]">Categoria</th>
                <th className="text-xs text-[#4d4d4d] px-4 py-3 font-semibold border-r border-[#2e2e2e]">Cidade</th>
                <th className="text-xs text-[#4d4d4d] px-4 py-3 font-semibold border-r border-[#2e2e2e]">Estado</th>
                <th className="text-xs text-[#4d4d4d] px-4 py-3 font-semibold border-r border-[#2e2e2e]">Telefone</th>
                <th className="text-xs text-[#4d4d4d] px-4 py-3 font-semibold border-r border-[#2e2e2e]">E-mail</th>
                <th className="text-xs text-[#4d4d4d] px-4 py-3 font-semibold">Nota Google</th>
                <th className="text-xs text-[#4d4d4d] px-4 py-3 font-semibold">Score</th>
                <th className="text-xs text-[#4d4d4d] px-4 py-3 font-semibold">Status</th>
                <th className="text-xs text-[#4d4d4d] px-4 py-3 font-semibold">Pontos de Dor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {leads.map((row, i) => (
                <tr key={row.id || i} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-4 py-3 text-[#efefef] font-medium text-xs whitespace-nowrap border-r border-[#2e2e2e]">{row.name || row.nome}</td>
                  <td className="px-4 py-3 text-[#898989] text-xs capitalize border-r border-[#2e2e2e]">{row.category || row.categoria}</td>
                  <td className="px-4 py-3 text-[#898989] text-xs border-r border-[#2e2e2e]">{row.city || row.cidade}</td>
                  <td className="px-4 py-3 text-[#898989] text-xs border-r border-[#2e2e2e]">{row.state || row.estado}</td>
                  <td className="px-4 py-3 text-[#898989] text-xs whitespace-nowrap border-r border-[#2e2e2e]">{row.phone || row.telefone}</td>
                  <td className="px-4 py-3 text-[#898989] text-xs border-r border-[#2e2e2e]">{row.email}</td>
                  <td className="px-4 py-3 text-[#efefef] text-xs bg-[#FF5500]/[0.01]">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-[#FF5500] fill-current" />
                      {row.googleRating || row.nota}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#efefef] text-xs font-mono bg-[#FF5500]/[0.01]">{row.score}</td>
                  <td className="px-4 py-3 text-xs bg-[#FF5500]/[0.01]">
                    <Badge variant="outline" className={`text-[10px] bg-[#FF5500]/10 text-[#FF5500] border-[#FF5500]/30`}>
                      {row.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-[#898989] text-xs truncate max-w-[150px] bg-[#FF5500]/[0.01]">{row.painPoints || row.dores}</td>
                </tr>
              ))}
              {leads.length === 0 && !loading && (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-[#4d4d4d] text-xs">
                    <List className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    Nenhum dado encontrado para a região {region}. Faça upload de uma planilha para popular esta região.
                  </td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={10} className="text-center py-12">
                    <Loader2 className="w-8 h-8 mx-auto animate-spin text-[#FF5500]" />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
