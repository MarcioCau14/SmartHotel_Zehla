// src/components/zcc/SwipeSuggestionPanel.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  Copy, 
  MessageSquare, 
  Zap, 
  ChevronRight, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface Swipe {
  id: string;
  title: string;
  content: string;
  matchScore: number;
}

interface TierRecommendation {
  tier: string;
  confidence: number;
  reasons: string[];
}

interface SwipeSuggestionPanelProps {
  leadId: string;
}

export const SwipeSuggestionPanel: React.FC<SwipeSuggestionPanelProps> = ({ leadId }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedSwipe, setExpandedSwipe] = useState<string | null>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/swipes/match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leadId }),
        });
        
        if (!res.ok) throw new Error('Falha ao buscar sugestões');
        
        const result = await res.json();
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (leadId) fetchSuggestions();
  }, [leadId]);

  const handleUse = async (swipeId: string) => {
    try {
      await fetch('/api/swipes/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'use', swipeId, leadId }),
      });
      // Adicionar feedback visual aqui
    } catch (e) {
      console.error(e);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // TODO: Show toast
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
        <div className="h-6 w-1/2 bg-zinc-800 rounded"></div>
        <div className="h-20 w-full bg-zinc-800 rounded"></div>
        <div className="h-20 w-full bg-zinc-800 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-950/20 border border-red-900/50 rounded-xl text-red-400 flex items-center gap-3">
        <AlertCircle size={20} />
        <span>{error}</span>
      </div>
    );
  }

  const { tierRecommendation, matches, aiJustification } = data;

  return (
    <div className="space-y-6">
      {/* TIER RECOMMENDATION CARD */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl"
      >
        <div className="p-4 bg-gradient-to-r from-zinc-900 to-zinc-950 flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Zap className="text-amber-500" size={18} />
            <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-widest">Recomendação de Plano</h3>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-black tracking-tighter border ${
            tierRecommendation.tier === 'max' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' :
            tierRecommendation.tier === 'pro' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' :
            'bg-blue-500/10 text-blue-500 border-blue-500/30'
          }`}>
            {tierRecommendation.tier.toUpperCase()} {(tierRecommendation.confidence * 100).toFixed(0)}%
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800/50 italic text-zinc-400 text-sm leading-relaxed">
            " {aiJustification} "
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {tierRecommendation.reasons.map((reason: string, idx: number) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-zinc-500 bg-zinc-900/50 p-2 rounded-lg">
                <CheckCircle size={14} className="text-emerald-500/50" />
                {reason}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* SWIPE SUGGESTIONS */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-2">Top 3 Sugestões de Resposta</h3>
        {matches.map((match: any, idx: number) => (
          <motion.div
            key={match.swipe.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`group bg-zinc-900 border transition-all duration-300 rounded-xl overflow-hidden ${
              expandedSwipe === match.swipe.id ? 'border-zinc-700 shadow-xl' : 'border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <div 
              className="p-4 flex items-center justify-between cursor-pointer"
              onClick={() => setExpandedSwipe(expandedSwipe === match.swipe.id ? null : match.swipe.id)}
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500">
                  #{idx + 1}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-200">{match.swipe.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 uppercase tracking-tighter">
                      Match: {match.matchScore}%
                    </span>
                    {match.swipe.provenByConversion && (
                      <span className="text-[10px] text-emerald-500/80 flex items-center gap-1 font-bold">
                        <ShieldCheck size={10} /> PROVEN
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <ChevronRight 
                size={16} 
                className={`text-zinc-600 transition-transform ${expandedSwipe === match.swipe.id ? 'rotate-90' : ''}`} 
              />
            </div>

            <AnimatePresence>
              {expandedSwipe === match.swipe.id && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-4">
                    <div className="p-4 bg-zinc-950 rounded-lg border border-zinc-800 text-sm text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed">
                      {match.swipe.content}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(match.swipe.content)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-lg transition-colors"
                      >
                        <Copy size={14} /> Copiar
                      </button>
                      <button
                        onClick={() => handleUse(match.swipe.id)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-emerald-900/20"
                      >
                        <MessageSquare size={14} /> Enviar Agora
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
