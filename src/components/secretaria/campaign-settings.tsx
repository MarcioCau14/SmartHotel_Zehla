'use client';

import { motion } from 'framer-motion';
import { Mail, FileText, FolderOpen, Send, ShieldAlert } from 'lucide-react';

export function CampaignSettings() {
  const config = {
    subject: 'PROPOSTA ALEX RIBEIRO',
    doc_id: '1zyN17jkVMe1GGZUyDwablyVfP_OFWV4CRYUq3Iuqqno',
    folder_id: '1Q3YnzlVyBp5wuGaNx85NLMfcbuj1tGi5',
    cc: 'alexribeiro89@hotmail.com'
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="glass-card p-5 lg:p-6 h-full"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-[#4169E110] border border-[#4169E120]">
          <ShieldAlert size={18} className="text-[#4169E1]" />
        </div>
        <div>
          <h2 className="text-lg font-bold tracking-tight text-[#f1f5f9]">Configuração de Disparo</h2>
          <p className="text-xs text-[#64748b]">Regras de personalização da Secretaria CAU</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Subject */}
        <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
          <Mail size={16} className="text-[#94a3b8] mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Assunto do E-mail</span>
            <span className="text-sm font-medium text-[#f1f5f9]">{config.subject}</span>
          </div>
        </div>

        {/* Template */}
        <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
          <FileText size={16} className="text-[#94a3b8] mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Corpo Personalizado (Google Doc)</span>
            <span className="text-[11px] font-mono text-[#4169E1] truncate w-full max-w-[200px]">{config.doc_id}</span>
            <span className="text-[10px] text-[#64748b]">Tags: [Nome], [Empresa]</span>
          </div>
        </div>

        {/* Attachments */}
        <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
          <FolderOpen size={16} className="text-[#94a3b8] mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Anexos (3 PDFs no Google Drive)</span>
            <span className="text-[11px] font-mono text-[#14b8a6] truncate w-full max-w-[200px]">{config.folder_id}</span>
            <span className="text-[10px] text-[#64748b]">Monitorando pasta oficial...</span>
          </div>
        </div>

        {/* CC */}
        <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
          <Send size={16} className="text-[#94a3b8] mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Cópia de Segurança (CC)</span>
            <span className="text-sm font-medium text-[#94a3b8]">{config.cc}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-[#4169E108] to-transparent border border-[#4169E115]">
        <p className="text-[11px] leading-relaxed text-[#94a3b8]">
          A <span className="text-[#4169E1] font-bold">Secretaria CAU</span> tratará o tratamento Sr./Sra. automaticamente e aplicará o <span className="text-white font-medium">Hook da LESSIE</span> em cada rascunho antes do disparo de elite.
        </p>
      </div>
    </motion.div>
  );
}
