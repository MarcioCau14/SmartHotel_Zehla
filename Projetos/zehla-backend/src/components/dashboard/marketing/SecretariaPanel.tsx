'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, 
  Search, 
  Upload, 
  Zap, 
  Database,
  Globe,
  Plus,
  MessageSquare,
  CheckCircle2,
  RefreshCw,
  BarChart3,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export function SecretariaPanel() {
  const [activeMode, setActiveMode] = useState<'search' | 'import' | 'automate'>('search');
  const [isSearching, setIsSearching] = useState(false);

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    toast.loading('Analisando estrutura da planilha...', { id: 'upload' });
    
    // Simulação de processamento inteligente
    setTimeout(() => {
      toast.success('Estrutura detectada: 18 colunas (Padrão Secretaria)', { id: 'upload' });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Modes Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { id: 'search', label: 'Prospecção Neural', icon: Search, desc: 'Busca ativa em grupos e web' },
          { id: 'import', label: 'Importação Smart', icon: Upload, desc: 'Excel, CSV e JSON (Auto-map)' },
          { id: 'automate', label: 'Enriquecimento', icon: Zap, desc: 'Dados reais via Secretaria-IA' },
        ].map((mode) => (
          <button
            key={mode.id}
            onClick={() => setActiveMode(mode.id as any)}
            className={`p-4 rounded-2xl border transition-all text-left group ${
              activeMode === mode.id 
                ? 'bg-[#FF5500]/5 border-[#FF5500]/30 shadow-lg shadow-[#FF5500]/5' 
                : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <div className={`p-2 rounded-lg w-fit mb-3 transition-colors ${
              activeMode === mode.id ? 'bg-[#FF5500] text-white' : 'bg-zinc-800 text-zinc-500 group-hover:text-zinc-300'
            }`}>
              <mode.icon size={20} />
            </div>
            <h4 className={`text-sm font-bold ${activeMode === mode.id ? 'text-zinc-200' : 'text-zinc-400'}`}>
              {mode.label}
            </h4>
            <p className="text-[10px] text-zinc-500 mt-1">{mode.desc}</p>
          </button>
        ))}
      </div>

      {activeMode === 'search' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Globe className="text-blue-400" size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-widest">Radar de Oportunidades</h3>
              <p className="text-[10px] text-zinc-500">Mapeamento em tempo real de novos leads via Google Maps & Grupos</p>
            </div>
          </div>

          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Ex: Pousadas em Garopaba, Hotéis litoral SC..."
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
            />
            <button 
              onClick={() => {
                setIsSearching(true);
                setTimeout(() => setIsSearching(false), 3000);
              }}
              disabled={isSearching}
              className="bg-[#FF5500] hover:bg-[#EA580C] text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-lg shadow-[#FF5500]/20 flex items-center gap-2 disabled:opacity-50"
            >
              {isSearching ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />}
              {isSearching ? 'Buscando...' : 'Pesquisar'}
            </button>
          </div>

          {/* Search Simulation Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-zinc-500 uppercase">Filtros de Qualidade</span>
                <Badge className="bg-emerald-500/10 text-emerald-500 border-0 text-[9px]">ATIVO</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Verificar Cadastur</span>
                  <div className="w-8 h-4 bg-emerald-600 rounded-full relative"><div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div></div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Excluir duplicados (CRM)</span>
                  <div className="w-8 h-4 bg-emerald-600 rounded-full relative"><div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div></div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3">
              <span className="text-[10px] font-black text-zinc-500 uppercase">Capacidade da Secretaria</span>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                  <span>Tokens em uso</span>
                  <span>45%</span>
                </div>
                <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[45%]"></div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeMode === 'import' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Upload className="text-[#FF5500]" size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-widest">Importação Inteligente</h3>
              <p className="text-[10px] text-zinc-500">O ZEHLA identifica automaticamente colunas de Pousada, Telefone e E-mail</p>
            </div>
          </div>

          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-zinc-800 rounded-2xl cursor-pointer hover:bg-zinc-800/20 transition-all hover:border-[#FF5500]/50 group">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <div className="p-4 rounded-full bg-zinc-800 group-hover:bg-[#FF5500]/10 mb-4 transition-colors">
                <Database className="text-zinc-600 group-hover:text-[#FF5500]" size={24} />
              </div>
              <p className="mb-2 text-sm text-zinc-300">Clique para selecionar ou arraste o arquivo</p>
              <p className="text-[10px] text-zinc-500">XLSX, CSV ou JSON (Máx. 50MB)</p>
            </div>
            <input type="file" className="hidden" accept=".csv, .xlsx, .json" onChange={handleExcelUpload} />
          </label>
        </motion.div>
      )}

      {activeMode === 'automate' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
             <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <ShieldCheck className="text-emerald-500" size={16} />
                </div>
                <h4 className="text-xs font-black text-zinc-200 uppercase tracking-widest">Enriquecimento Cadastur</h4>
             </div>
             <p className="text-[10px] text-zinc-500">Verifica se a pousada possui registro ativo no Ministério do Turismo, aumentando a confiabilidade do lead.</p>
             <button className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-[10px] font-black text-zinc-300 transition-colors uppercase tracking-widest">
                Executar Scanner (v2.6)
             </button>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
             <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Zap className="text-amber-500" size={16} />
                </div>
                <h4 className="text-xs font-black text-zinc-200 uppercase tracking-widest">DNA Mapping (LITE)</h4>
             </div>
             <p className="text-[10px] text-zinc-500">Mapeia o perfil psicográfico do proprietário baseado em postagens e site oficial para personalizar o tom de voz.</p>
             <button className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-[10px] font-black text-zinc-300 transition-colors uppercase tracking-widest">
                Iniciar Mapeamento
             </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
