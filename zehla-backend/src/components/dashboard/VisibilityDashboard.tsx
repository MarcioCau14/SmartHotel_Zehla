'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Image as ImageIcon, Calendar, AlertTriangle, CheckCircle, Award } from 'lucide-react';

export function VisibilityDashboard() {
  const [photoCount, setPhotoCount] = useState(34);
  const [daysSinceLastPost, setDaysSinceLastPost] = useState(5);
  const [napScore, setNapScore] = useState(85);

  // Lógica de Gamificação das Fotos (Baseado no Guia Google)
  const getPhotoLevel = (count: number) => {
    if (count < 20) return { name: 'Invisível 👻', color: 'text-red-400', bg: 'bg-red-500/10' };
    if (count < 50) return { name: 'Aparecendo 👀', color: 'text-yellow-400', bg: 'bg-yellow-500/10' };
    if (count < 100) return { name: 'Destacando 🚀', color: 'text-blue-400', bg: 'bg-blue-500/10' };
    return { name: 'Dominando 👑', color: 'text-green-400', bg: 'bg-green-500/10' };
  };

  const photoLevel = getPhotoLevel(photoCount);
  const visibilityScore = Math.round((photoCount / 100 * 50) + (napScore / 100 * 50));

  return (
    <div className="glass-card p-6 border border-[#2e2e2e] bg-[#111111]/50 backdrop-blur-xl rounded-2xl space-y-6">
      <div className="flex items-center justify-between border-b border-[#2e2e2e] pb-4">
        <div className="flex items-center gap-3">
          <Eye className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-bold text-[#fafafa]">Visibilidade (Agente 09)</h3>
        </div>
        <span className="text-2xl font-extrabold text-orange-500">{visibilityScore}%</span>
      </div>

      {/* Gamificação das Fotos */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-[#898989] flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-orange-400" />
            Regra das 100 Fotos
          </span>
          <span className={`font-bold ${photoLevel.color} px-2 py-0.5 rounded-md ${photoLevel.bg}`}>
            {photoLevel.name}
          </span>
        </div>
        <div className="w-full h-2 bg-[#2e2e2e] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, photoCount)}%` }}
            className="h-full bg-gradient-to-r from-orange-500 to-orange-400"
          />
        </div>
        <span className="text-xs text-[#666666] block">
          {photoCount}/100 fotos horizontais publicadas.
        </span>
      </div>

      {/* Alerta de Posts (Regra dos 7 dias) */}
      <div className="p-4 rounded-xl border border-[#2e2e2e] bg-[#1a1a1a]/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-orange-400" />
          <div>
            <span className="text-sm font-medium text-[#fafafa]">Frequência de Posts</span>
            <span className="text-xs text-[#898989] block">Último post há {daysSinceLastPost} dias.</span>
          </div>
        </div>
        {daysSinceLastPost >= 7 ? (
          <div className="flex items-center gap-1 text-red-400 text-xs font-bold bg-red-500/10 px-2 py-1 rounded-md">
            <AlertTriangle className="w-3 h-3" />
            EXPIRADO
          </div>
        ) : (
          <div className="flex items-center gap-1 text-green-400 text-xs font-bold bg-green-500/10 px-2 py-1 rounded-md">
            <CheckCircle className="w-3 h-3" />
            ATIVO
          </div>
        )}
      </div>

      {/* NAP Consistency */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-[#898989] flex items-center gap-2">
            <Award className="w-4 h-4 text-orange-400" />
            Consistência NAP (Nome, Endereço, Tel)
          </span>
          <span className="text-[#fafafa] font-bold">{napScore}%</span>
        </div>
        <div className="w-full h-2 bg-[#2e2e2e] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${napScore}%` }}
            className="h-full bg-gradient-to-r from-orange-500 to-orange-400"
          />
        </div>
      </div>
    </div>
  );
}
