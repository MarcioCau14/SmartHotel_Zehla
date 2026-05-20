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
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-xl mx-auto text-center" id="raio-x">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-10"
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-[#fafafa] mb-4">
          Solicite um <span className="text-orange-500">Raio-X Gratuito</span>
        </h2>
        <p className="text-[#898989] text-lg">
          Analisamos seu perfil no Google e mostramos onde você está perdendo dinheiro.
        </p>
      </motion.div>

      <div className="glass-card p-6 sm:p-8 border border-[#2e2e2e] bg-[#111111]/50 backdrop-blur-xl rounded-2xl text-left">
        {status === 'success' ? (
          <div className="text-center py-8 space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h3 className="text-xl font-bold text-[#fafafa]">Solicitação Enviada!</h3>
            <p className="text-[#898989]">
              Nosso time (e o Agente 09) está analisando seu perfil. Entraremos em contato via WhatsApp em até 24h.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#fafafa] mb-1">Seu Nome</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl text-white focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="Ex: João Silva"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#fafafa] mb-1">E-mail</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl text-white focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="Ex: joao@pousada.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#fafafa] mb-1">WhatsApp</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl text-white focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="Ex: (48) 99999-9999"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#fafafa] mb-1">URL do Perfil no Google (ou Website)</label>
              <input
                type="url"
                required
                value={formData.gbpUrl}
                onChange={(e) => setFormData({ ...formData, gbpUrl: e.target.value })}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl text-white focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="Ex: https://g.co/kgs/..."
              />
            </div>

            {status === 'error' && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white font-bold rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
            >
              {status === 'loading' ? (
                <span className="animate-pulse">Analisando...</span>
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
