'use client';

import { useState } from 'react';
import { Tag, Send, Users, MessageSquare } from 'lucide-react';

type Channel = 'whatsapp' | 'email';
type Audience = 'all' | 'recent' | 'inactive' | 'vip';

export default function PromocoesPage() {
  const [channel, setChannel] = useState<Channel>('whatsapp');
  const [audience, setAudience] = useState<Audience>('all');
  const [message, setMessage] = useState('');

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="glass-strong border border-white/5 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-neutral-400 mb-4 uppercase tracking-wider flex items-center gap-2">
          <Tag className="w-4 h-4 text-orange-400" />
          Nova Campanha
        </h3>

        <div className="space-y-5">
          {/* Canal */}
          <div>
            <label className="text-xs text-neutral-600 mb-2 block">Canal de Disparo</label>
            <div className="flex gap-3">
              {[
                { key: 'whatsapp' as const, label: 'WhatsApp', icon: MessageSquare },
                { key: 'email' as const, label: 'E-mail', icon: Send },
              ].map((c) => (
                <button
                  key={c.key}
                  onClick={() => setChannel(c.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    channel === c.key
                      ? 'bg-orange-500/10 border border-orange-500/20 text-orange-400'
                      : 'bg-white/[0.02] border border-white/5 text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  <c.icon className="w-4 h-4" />
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Público */}
          <div>
            <label className="text-xs text-neutral-600 mb-2 block">Público-Alvo</label>
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
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    audience === a.key
                      ? 'bg-orange-500/10 border border-orange-500/20 text-orange-400'
                      : 'bg-white/[0.02] border border-white/5 text-neutral-600 hover:text-neutral-400'
                  }`}
                >
                  <Users className="w-3 h-3 inline mr-1" />
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mensagem */}
          <div>
            <label className="text-xs text-neutral-600 mb-2 block">Mensagem</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua mensagem de campanha..."
              rows={5}
              className="w-full bg-white/[0.02] border border-white/10 rounded-xl p-4 text-sm text-neutral-300 placeholder-neutral-700 resize-none outline-none focus:border-orange-500/30 transition-colors"
            />
          </div>

          <button className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50" disabled={!message.trim()}>
            <Send className="w-4 h-4 inline mr-2" />
            Disparar Campanha
          </button>
        </div>
      </div>
    </div>
  );
}
