import { Brain, Zap, User, Mail, Phone, Lock, Eye, EyeOff, MessageCircle, CopyCheck, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';


'use client';



export interface WelcomeData {
  nome: string;
  email: string;
  whatsappProprietario: string;
  whatsappAtendimento: string;
  senha: string;
}

interface StepWelcomeProps {
  data: WelcomeData;
  onChange: (data: WelcomeData) => void;
}

export function StepWelcome(: void { data, onChange }: StepWelcomeProps) {
  try {
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof WelcomeData, string>>>({});
  const [sameNumber, setSameNumber] = useState(true);

  const validate = () => {
    const newErrors: Partial<Record<keyof WelcomeData, string>> = {};
    if (!data.nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (!data.email.trim()) newErrors.email = 'E-mail é obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) newErrors.email = 'E-mail inválido';
    if (!data.whatsappProprietario.trim()) newErrors.whatsappProprietario = 'WhatsApp do proprietário é obrigatório';
    if (!data.whatsappAtendimento.trim()) newErrors.whatsappAtendimento = 'WhatsApp de atendimento é obrigatório';
    if (!data.senha.trim()) newErrors.senha = 'Senha é obrigatória';
    else if (data.senha.length < 6) newErrors.senha = 'Mínimo 6 caracteres';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateField = (field: keyof WelcomeData, value: string) => {
    const updated = { ...data, [field]: value };
    // Auto-sync atendimento if checkbox is checked
    if (sameNumber && field === 'whatsappProprietario') {
      updated.whatsappAtendimento = value;
    }
    onChange(updated);
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const handleSameNumberToggle = (checked: boolean) => {
    setSameNumber(checked);
    if (checked) {
      onChange({ ...data, whatsappAtendimento: data.whatsappProprietario });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-lg mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6 text-sm text-[#FF5500]">
          <Brain className="w-4 h-4" />
          <span>ZEHLA SmartHotel</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#fafafa] mb-3">
          Iniciar Teste Grátis{' '}
          <span className="gradient-text">de 7 Dias</span>
        </h2>
        <p className="text-[#898989] text-sm sm:text-base">
          Crie sua conta e transforme sua pousada com o cérebro ZEHLA.
        </p>
      </div>

      {/* Form */}
      <div className="glass-card p-6 space-y-5">
        {/* Nome */}
        <div>
          <label className="block text-sm font-medium text-[#b4b4b4] mb-2">
            Nome Completo
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4d4d4d]" />
            <input
              type="text"
              value={data.nome}
              onChange={(e) => updateField('nome', e.target.value)}
              placeholder="Seu nome completo"
              className={`w-full pl-10 pr-4 py-3 bg-[#242424] border rounded-xl text-sm text-[#fafafa] placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all ${
                errors.nome ? 'border-red-500/50' : 'border-[#363636] focus:border-orange-500/50'
              }`}
            />
          </div>
          {errors.nome && <p className="text-xs text-red-400 mt-1">{errors.nome}</p>}
        </div>

        {/* E-mail */}
        <div>
          <label className="block text-sm font-medium text-[#b4b4b4] mb-2">
            E-mail
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4d4d4d]" />
            <input
              type="email"
              value={data.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="seu@email.com"
              className={`w-full pl-10 pr-4 py-3 bg-[#242424] border rounded-xl text-sm text-[#fafafa] placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all ${
                errors.email ? 'border-red-500/50' : 'border-[#363636] focus:border-orange-500/50'
              }`}
            />
          </div>
          {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
        </div>

        {/* WhatsApp do Proprietário */}
        <div>
          <label className="block text-sm font-medium text-[#b4b4b4] mb-2">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#FF5500]" />
              WhatsApp do Proprietário
            </span>
          </label>
          <div className="relative">
            <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500" />
            <input
              type="tel"
              value={data.whatsappProprietario}
              onChange={(e) => updateField('whatsappProprietario', e.target.value)}
              placeholder="(11) 99999-9999"
              className={`w-full pl-10 pr-4 py-3 bg-orange-500/5 border rounded-xl text-sm text-[#fafafa] placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all ${
                errors.whatsappProprietario ? 'border-red-500/50' : 'border-orange-500/20 focus:border-orange-500/50'
              }`}
            />
          </div>
          {errors.whatsappProprietario && <p className="text-xs text-red-400 mt-1">{errors.whatsappProprietario}</p>}
        </div>

        {/* WhatsApp de Atendimento */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-[#b4b4b4]">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-sky-400" />
                WhatsApp de Atendimento ao Hóspede
              </span>
            </label>
            
            {/* Same number toggle */}
            <button
              type="button"
              onClick={() => handleSameNumberToggle(!sameNumber)}
              className="flex items-center gap-1.5 group select-none outline-none"
            >
              <div className={`w-3.5 h-3.5 rounded border transition-all flex items-center justify-center ${
                sameNumber ? 'bg-orange-500 border-orange-500' : 'border-white/20 group-hover:border-white/40'
              }`}>
                {sameNumber && <Check className="w-2.5 h-2.5 text-white" />}
              </div>
              <span className={`text-[10px] transition-colors ${sameNumber ? 'text-[#FF5500]' : 'text-[#4d4d4d]'}`}>
                Mesmo número do proprietário
              </span>
            </button>
          </div>

          <div className="relative">
            <MessageCircle className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
              sameNumber ? 'text-orange-500/50' : 'text-sky-500'
            }`} />
            <input
              type="tel"
              value={data.whatsappAtendimento}
              onChange={(e) => {
                setSameNumber(false);
                updateField('whatsappAtendimento', e.target.value);
              }}
              placeholder="(11) 99999-9999"
              disabled={sameNumber}
              className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${
                sameNumber 
                  ? 'bg-white/[0.02] border-[#2e2e2e] text-[#4d4d4d] cursor-not-allowed' 
                  : 'bg-sky-500/5 border-sky-500/20 text-[#fafafa] focus:ring-sky-500/30 focus:border-sky-500/50'
              } ${errors.whatsappAtendimento && !sameNumber ? 'border-red-500/50' : ''}`}
            />
          </div>
          <p className="text-[10px] text-[#363636]">
            Este é o número que o agente ZEHLA vai usar para responder aos hóspedes.
          </p>
          {errors.whatsappAtendimento && !sameNumber && <p className="text-xs text-red-400 mt-1">{errors.whatsappAtendimento}</p>}
        </div>

        {/* Senha */}
        <div>
          <label className="block text-sm font-medium text-[#b4b4b4] mb-2">
            Senha
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4d4d4d]" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={data.senha}
              onChange={(e) => updateField('senha', e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className={`w-full pl-10 pr-10 py-3 bg-[#242424] border rounded-xl text-sm text-[#fafafa] placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all ${
                errors.senha ? 'border-red-500/50' : 'border-[#363636] focus:border-orange-500/50'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4d4d4d] hover:text-[#b4b4b4] transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.senha && <p className="text-xs text-red-400 mt-1">{errors.senha}</p>}
        </div>
      </div>

      {/* Footer note */}
      <p className="text-xs text-[#363636] text-center mt-4">
        <Zap className="w-3 h-3 inline text-orange-500" /> 7 dias grátis • Sem cartão de crédito • Cancele quando quiser
      </p>
    </motion.div>
  );
}

StepWelcome.validate = function (data: WelcomeData) {
  const newErrors: Partial<Record<keyof WelcomeData, string>> = {};
  if (!data.nome.trim()) newErrors.nome = 'Nome é obrigatório';
  if (!data.email.trim()) newErrors.email = 'E-mail é obrigatório';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) newErrors.email = 'E-mail inválido';
  if (!data.whatsappProprietario.trim()) newErrors.whatsappProprietario = 'WhatsApp do proprietário é obrigatório';
  if (!data.whatsappAtendimento.trim()) newErrors.whatsappAtendimento = 'WhatsApp de atendimento é obrigatório';
  if (!data.senha.trim()) newErrors.senha = 'Senha é obrigatória';
  else if (data.senha.length < 6) newErrors.senha = 'Mínimo 6 caracteres';
  return Object.keys(newErrors).length === 0;
};
