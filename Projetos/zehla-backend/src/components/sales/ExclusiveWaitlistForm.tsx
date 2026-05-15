'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';

export function ExclusiveWaitlistForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    pousadaName: '',
    roomCount: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/exclusive/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-neutral-100 shadow-xl animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-neutral-900 mb-2">Entramos na Frequência!</h3>
        <p className="text-neutral-500">
          Você acaba de dar o primeiro passo para o <strong>ZEHLA Exclusive</strong>. 
          Nossa equipe entrará em contato em breve para um diagnóstico personalizado.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white rounded-3xl border border-neutral-100 shadow-2xl">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-orange-500" />
        <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Acesso Exclusivo</span>
      </div>
      
      <h3 className="text-2xl font-bold text-neutral-900 mb-6">Lista de Espera Exclusive</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Seu Nome</Label>
            <Input 
              id="name" 
              placeholder="Ex: Marciano Silva" 
              required 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pousada">Nome da Pousada</Label>
            <Input 
              id="pousada" 
              placeholder="Ex: Pousada do Sol" 
              required 
              value={formData.pousadaName}
              onChange={(e) => setFormData({...formData, pousadaName: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-mail Profissional</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="seu@email.com" 
            required 
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">WhatsApp</Label>
            <Input 
              id="phone" 
              placeholder="(00) 00000-0000" 
              required 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rooms">Quantidade de Quartos</Label>
            <Input 
              id="rooms" 
              type="number" 
              placeholder="Ex: 15" 
              required 
              value={formData.roomCount}
              onChange={(e) => setFormData({...formData, roomCount: e.target.value})}
            />
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={status === 'loading'}
          className="w-full bg-neutral-900 hover:bg-neutral-800 text-white py-6 rounded-xl font-bold text-lg shadow-lg shadow-neutral-200 transition-all active:scale-[0.98]"
        >
          {status === 'loading' ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Garantir minha vaga na lista'
          )}
        </Button>
        
        <p className="text-[10px] text-center text-neutral-400 mt-4">
          Ao entrar na lista, você aceita nossos termos de privacidade. Entraremos em contato via WhatsApp/E-mail.
        </p>
      </form>
    </div>
  );
}
