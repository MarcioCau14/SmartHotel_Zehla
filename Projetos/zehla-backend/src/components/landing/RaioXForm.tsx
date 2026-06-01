'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle, AlertCircle } from 'lucide-react';

export function RaioXForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gbpUrl: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/visibility/raiox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao enviar.');
      }

      setStatus('success');
      setFormData({ name: '', email: '', phone: '', gbpUrl: '' });
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Erro de conexão.');
    }
  };

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-xl mx-auto text-center z-10" id="raio-x">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#FF5500]/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-10"
      >
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
          Solicite um <span className="text-[#FF5500]">Raio-X Gratuito</span>
        </h2>
        <p className="text-[#898989] text-base leading-relaxed">
          Analisamos o perfil do Google da sua pousada e mostramos onde você está perdendo dinheiro diariamente.
        </p>
      </motion.div>

      <div className="bg-[#090909]/40 border border-white/5 backdrop-blur-xl p-6 sm:p-8 rounded-3xl text-left shadow-[0_0_50px_rgba(255,85,0,0.02)]">
        {status === 'success' ? (
          <div className="text-center py-8 space-y-4">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto" />
            <h3 className="text-xl font-bold text-white">Solicitação Enviada!</h3>
            <p className="text-[#898989] text-sm leading-relaxed">
              Nosso time especializado está analisando seu perfil. Entraremos em contato via WhatsApp em até 24 horas.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-[#fafafa] uppercase tracking-wider mb-1.5">Seu Nome</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-[#121212] border border-white/5 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-[#FF5500]/50 transition-colors text-sm"
                placeholder="Ex: João Silva"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#fafafa] uppercase tracking-wider mb-1.5">E-mail Corporativo</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-[#121212] border border-white/5 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-[#FF5500]/50 transition-colors text-sm"
                placeholder="Ex: joao@pousada.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#fafafa] uppercase tracking-wider mb-1.5">WhatsApp para Contato</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 bg-[#121212] border border-white/5 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-[#FF5500]/50 transition-colors text-sm"
                placeholder="Ex: (48) 99999-9999"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#fafafa] uppercase tracking-wider mb-1.5">Link do Google Meu Negócio</label>
              <input
                type="url"
                required
                value={formData.gbpUrl}
                onChange={(e) => setFormData({ ...formData, gbpUrl: e.target.value })}
                className="w-full px-4 py-3 bg-[#121212] border border-white/5 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-[#FF5500]/50 transition-colors text-sm"
                placeholder="Ex: https://g.page/suapousada"
              />
            </div>

            {status === 'error' && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2.5 text-rose-400 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-4 bg-[#FF5500] hover:bg-[#ff6a1a] disabled:bg-[#FF5500]/50 text-white font-bold rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#FF5500]/20 hover:shadow-[#FF5500]/30"
            >
              {status === 'loading' ? (
                <span className="animate-pulse">Analisando Perfil...</span>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Solicitar Raio-X Gratuito
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
