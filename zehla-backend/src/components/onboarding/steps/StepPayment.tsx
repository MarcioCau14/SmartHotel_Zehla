'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, QrCode, Banknote, Building, Check } from 'lucide-react';

export interface PaymentData {
  methods: string[];
  pixKey: string;
  pixKeyType: string;
  bankName: string;
  bankAgency: string;
  bankAccount: string;
  bankAccountType: string;
  bankCpf: string;
}

interface StepPaymentProps {
  data: PaymentData;
  onChange: (data: PaymentData) => void;
}

const paymentMethods = [
  { id: 'pix', label: 'PIX', icon: QrCode, description: 'Pagamento instantâneo' },
  { id: 'cartao', label: 'Cartão de Crédito', icon: CreditCard, description: 'Visa, Master, Elo' },
  { id: 'dinheiro', label: 'Dinheiro', icon: Banknote, description: 'Em espécie' },
  { id: 'transferencia', label: 'Transferência', icon: Building, description: 'TED / DOC' },
];

const pixKeyTypes = [
  { value: 'cpf', label: 'CPF' },
  { value: 'email', label: 'E-mail' },
  { value: 'telefone', label: 'Telefone' },
  { value: 'aleatoria', label: 'Chave Aleatória' },
];

export function StepPayment({ data, onChange }: StepPaymentProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleMethod = (id: string) => {
    const newMethods = data.methods.includes(id)
      ? data.methods.filter((m) => m !== id)
      : [...data.methods, id];
    onChange({ ...data, methods: newMethods });
  };

  const updateField = (field: keyof PaymentData, value: string) => {
    onChange({ ...data, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (data.methods.includes('pix') && !data.pixKey.trim()) {
      newErrors.pixKey = 'Chave PIX é obrigatória';
    }
    if (data.methods.includes('transferencia') && !data.bankName.trim()) {
      newErrors.bankName = 'Banco é obrigatório';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // eslint-disable-next-line react-hooks/immutability -- static validate pattern
  StepPayment.validate = validate;

  const hasPix = data.methods.includes('pix');
  const hasTransfer = data.methods.includes('transferencia');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6 text-sm text-teal-400">
          <CreditCard className="w-4 h-4" />
          <span>Configuração de Pagamentos</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#fafafa] mb-3">
          Como você quer{' '}
          <span className="gradient-text">receber?</span>
        </h2>
        <p className="text-[#898989] text-sm sm:text-base">
          Escolha os métodos de pagamento aceitos na sua propriedade.
        </p>
      </div>

      {/* Payment methods */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {paymentMethods.map((method) => {
          const isSelected = data.methods.includes(method.id);
          return (
            <motion.button
              key={method.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleMethod(method.id)}
              className={`p-4 rounded-xl border transition-all duration-200 text-left ${
                isSelected
                  ? 'bg-[#FF5500]/10 border-[#FF5500]/30 shadow-lg shadow-orange-500/5'
                  : 'glass-card border-[#2e2e2e] hover:border-[#363636]'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
              <div className={`inline-flex p-2.5 rounded-lg mb-3 ${
                isSelected ? 'bg-[#FF5500]/10 text-[#FF5500]' : 'bg-[#242424] text-[#4d4d4d]'
              }`}>
                <method.icon className="w-5 h-5" />
              </div>
              <div className={`text-sm font-medium ${isSelected ? 'text-orange-300' : 'text-[#b4b4b4]'}`}>
                {method.label}
              </div>
              <div className="text-xs text-[#363636] mt-0.5">{method.description}</div>
            </motion.button>
          );
        })}
      </div>

      {/* PIX details */}
      {hasPix && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="glass-card p-5 mb-4"
        >
          <h3 className="text-sm font-semibold text-[#efefef] mb-4 flex items-center gap-2">
            <QrCode className="w-4 h-4 text-[#FF5500]" />
            Dados do PIX
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#4d4d4d] mb-1">Tipo de Chave</label>
              <select
                value={data.pixKeyType}
                onChange={(e) => updateField('pixKeyType', e.target.value)}
                className="w-full px-3 py-2.5 bg-[#242424] border border-[#363636] rounded-lg text-sm text-[#fafafa] focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all appearance-none cursor-pointer"
              >
                {pixKeyTypes.map((t) => (
                  <option key={t.value} value={t.value} className="bg-neutral-900">
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#4d4d4d] mb-1">Chave PIX</label>
              <input
                type="text"
                value={data.pixKey}
                onChange={(e) => updateField('pixKey', e.target.value)}
                placeholder="Sua chave PIX"
                className={`w-full px-3 py-2.5 bg-[#242424] border rounded-lg text-sm text-[#fafafa] placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all ${
                  errors.pixKey ? 'border-red-500/50' : 'border-[#363636] focus:border-orange-500/50'
                }`}
              />
              {errors.pixKey && <p className="text-xs text-red-400 mt-1">{errors.pixKey}</p>}
            </div>
          </div>
        </motion.div>
      )}

      {/* Transfer details */}
      {hasTransfer && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="glass-card p-5"
        >
          <h3 className="text-sm font-semibold text-[#efefef] mb-4 flex items-center gap-2">
            <Building className="w-4 h-4 text-[#FF5500]" />
            Dados Bancários
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#4d4d4d] mb-1">Banco</label>
              <input
                type="text"
                value={data.bankName}
                onChange={(e) => updateField('bankName', e.target.value)}
                placeholder="Ex: Banco do Brasil"
                className={`w-full px-3 py-2.5 bg-[#242424] border rounded-lg text-sm text-[#fafafa] placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all ${
                  errors.bankName ? 'border-red-500/50' : 'border-[#363636] focus:border-orange-500/50'
                }`}
              />
              {errors.bankName && <p className="text-xs text-red-400 mt-1">{errors.bankName}</p>}
            </div>
            <div>
              <label className="block text-xs text-[#4d4d4d] mb-1">Agência</label>
              <input
                type="text"
                value={data.bankAgency}
                onChange={(e) => updateField('bankAgency', e.target.value)}
                placeholder="0001"
                className="w-full px-3 py-2.5 bg-[#242424] border border-[#363636] rounded-lg text-sm text-[#fafafa] placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs text-[#4d4d4d] mb-1">Conta</label>
              <input
                type="text"
                value={data.bankAccount}
                onChange={(e) => updateField('bankAccount', e.target.value)}
                placeholder="12345-6"
                className="w-full px-3 py-2.5 bg-[#242424] border border-[#363636] rounded-lg text-sm text-[#fafafa] placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs text-[#4d4d4d] mb-1">CPF do Titular</label>
              <input
                type="text"
                value={data.bankCpf}
                onChange={(e) => updateField('bankCpf', e.target.value)}
                placeholder="000.000.000-00"
                className="w-full px-3 py-2.5 bg-[#242424] border border-[#363636] rounded-lg text-sm text-[#fafafa] placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* No method selected */}
      {data.methods.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-[#363636]">
            Selecione ao menos um método de pagamento acima.
          </p>
        </div>
      )}
    </motion.div>
  );
}

StepPayment.validate = function (data: PaymentData) {
  const newErrors: Record<string, string> = {};
  if (data.methods.includes('pix') && !data.pixKey.trim()) {
    newErrors.pixKey = 'Chave PIX é obrigatória';
  }
  if (data.methods.includes('transferencia') && !data.bankName.trim()) {
    newErrors.bankName = 'Banco é obrigatório';
  }
  return Object.keys(newErrors).length === 0;
};
