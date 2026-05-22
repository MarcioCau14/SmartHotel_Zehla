'use client';

import { useState } from 'react';
import { Tag, Send, Users, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

type Channel = 'whatsapp' | 'email';
type Audience = 'all' | 'recent' | 'inactive' | 'vip';

export default function PromocoesPage() {
  const [channel, setChannel] = useState<Channel>('whatsapp');
  const [audience, setAudience] = useState<Audience>('all');
  const [message, setMessage] = useState('');

  return (
    <div className="space-y-6 max-w-3xl">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-3"
      >
        <div className="w-8 h-8 rounded-lg bg-[#FF5500]/10 flex items-center justify-center border border-[#FF5500]/25">
          <Tag className="w-4 h-4 text-[#FF5500]" />
        </div>
        <h2 className="text-xl font-black text-white tracking-tight uppercase">Disparos de Promoções</h2>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-[#0a0a0c]/60 border border-white/5 rounded-2xl p-6 md:p-8 backdrop-blur-md hover:border-white/10 transition-all duration-300"
      >
        <h3 className="text-xs font-black text-neutral-400 mb-6 uppercase tracking-wider flex items-center gap-2">
          Nova Campanha
        </h3>

        <div className="space-y-6">
          {/* Canal */}
          <div>
            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-wider mb-2.5 block">Canal de Disparo</label>
            <div className="flex gap-3">
              {[
                { key: 'whatsapp' as const, label: 'WhatsApp', icon: MessageSquare },
                { key: 'email' as const, label: 'E-mail', icon: Send },
              ].map((c) => (
                <button
                  key={c.key}
                  onClick={() => setChannel(c.key)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                    channel === c.key
                      ? 'bg-[#FF5500]/10 border border-[#FF5500]/25 text-[#FF5500] shadow-[0_0_15px_rgba(255,85,0,0.08)] font-black'
                      : 'bg-white/[0.01] border border-white/5 text-neutral-500 hover:text-neutral-350 hover:bg-white/[0.02]'
                  }`}
                >
                  <c.icon className="w-3.5 h-3.5" />
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Público */}
          <div>
            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-wider mb-2.5 block">Público-Alvo</label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all' as const, label: 'Todos os hóspedes' },
                { key: 'recent' as const, label: 'Hóspedes recentes' },
                { key: 'inactive' as const, label: 'Inativos (30d)' },
                { key: 'vip' as const, label: 'VIP' },
              ].map((a) => (
                <button
                  key={a.key}
                  onClick={() => setAudience(a.key)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
                    audience === a.key
                      ? 'bg-[#FF5500]/10 border border-[#FF5500]/25 text-[#FF5500] shadow-[0_0_15px_rgba(255,85,0,0.08)]'
                      : 'bg-white/[0.01] border border-white/5 text-neutral-500 hover:text-neutral-350 hover:bg-white/[0.02]'
                  }`}
                >
                  <Users className="w-3 h-3" />
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mensagem */}
          <div>
            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-wider mb-2.5 block">Mensagem</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua mensagem de campanha premium..."
              rows={5}
              className="w-full bg-[#050505]/40 border border-white/5 focus:border-[#FF5500]/30 rounded-xl p-4 text-xs text-neutral-300 placeholder-neutral-700 resize-none outline-none transition-colors duration-300"
            />
          </div>

          <button 
            className="w-full py-3.5 rounded-xl bg-[#FF5500] hover:bg-[#ff661a] text-white font-black text-xs uppercase tracking-wider transition-all duration-300 shadow-lg shadow-[#FF5500]/20 hover:shadow-[#FF5500]/30 hover:scale-[1.01] disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none flex items-center justify-center gap-2" 
            disabled={!message.trim()}
          >
            <Send className="w-3.5 h-3.5" />
            Disparar Campanha Premium
          </button>
        </div>
      </motion.div>
    </div>
  );
}
