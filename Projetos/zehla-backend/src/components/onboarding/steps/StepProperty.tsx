'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Globe, QrCode, CreditCard } from 'lucide-react';

export interface PropertyData {
  nome: string;
  documento: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  tipo: string;
  site: string;
  instagram: string;
  descricao: string;
}

interface StepPropertyProps {
  data: PropertyData;
  onChange: (data: PropertyData) => void;
}

const estadosBR = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

const tiposPropriedade = [
  { value: 'pousada', label: 'Pousada' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'hostel', label: 'Hostel' },
  { value: 'chale', label: 'Chalé' },
];

const paymentMethods = [
  { id: 'pix', label: 'PIX', icon: QrCode, description: 'Pagamento instantâneo' },
  { id: 'cartao', label: 'Cartão de Crédito', icon: CreditCard, description: 'Visa, Master, Elo' },
];

export function StepProperty({ data, onChange }: StepPropertyProps) {
  const [errors, setErrors] = useState<Partial<Record<keyof PropertyData, string>>>({});

  const updateField = (field: keyof PropertyData, value: string) => {
    onChange({ ...data, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof PropertyData, string>> = {};
    if (!data.nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (!data.rua.trim()) newErrors.rua = 'Rua é obrigatória';
    if (!data.cidade.trim()) newErrors.cidade = 'Cidade é obrigatória';
    if (!data.estado.trim()) newErrors.estado = 'Estado é obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // eslint-disable-next-line react-hooks/immutability -- static validate pattern
  StepProperty.validate = validate;

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
          <Building2 className="w-4 h-4" />
          <span>Dados da Propriedade</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#fafafa] mb-3">
          Sobre a sua{' '}
          <span className="gradient-text">propriedade</span>
        </h2>
        <p className="text-[#898989] text-sm sm:text-base">
          Conte-nos sobre sua pousada ou hotel para personalizar o cérebro ZEHLA.
        </p>
      </div>

      {/* Form */}
      <div className="glass-card p-6 space-y-5">
        {/* Nome da Propriedade */}
        <div>
          <label className="block text-sm font-medium text-[#b4b4b4] mb-2">
            Nome da Pousada / Hotel
          </label>
          <input
            type="text"
            value={data.nome}
            onChange={(e) => updateField('nome', e.target.value)}
            placeholder="Ex: Pousada Maravilha"
            className={`w-full px-4 py-3 bg-[#242424] border rounded-xl text-sm text-[#fafafa] placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all ${
              errors.nome ? 'border-red-500/50' : 'border-[#363636] focus:border-orange-500/50'
            }`}
          />
          {errors.nome && <p className="text-xs text-red-400 mt-1">{errors.nome}</p>}
        </div>

        {/* CNPJ/CPF + Tipo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#b4b4b4] mb-2">
              CNPJ ou CPF <span className="text-[#363636]">(opcional)</span>
            </label>
            <input
              type="text"
              value={data.documento}
              onChange={(e) => updateField('documento', e.target.value)}
              placeholder="000.000.000-00"
              className="w-full px-4 py-3 bg-[#242424] border border-[#363636] rounded-xl text-sm text-[#fafafa] placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#b4b4b4] mb-2">
              Tipo de Propriedade
            </label>
            <select
              value={data.tipo}
              onChange={(e) => updateField('tipo', e.target.value)}
              className="w-full px-4 py-3 bg-[#242424] border border-[#363636] rounded-xl text-sm text-[#fafafa] focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all appearance-none cursor-pointer"
            >
              <option value="" className="bg-neutral-900">Selecione...</option>
              {tiposPropriedade.map((t) => (
                <option key={t.value} value={t.value} className="bg-neutral-900">
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Endereço */}
        <div>
          <label className="block text-sm font-medium text-[#b4b4b4] mb-2">
            Endereço
          </label>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <input
                type="text"
                value={data.rua}
                onChange={(e) => updateField('rua', e.target.value)}
                placeholder="Rua"
                className={`w-full px-4 py-3 bg-[#242424] border rounded-xl text-sm text-[#fafafa] placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all ${
                  errors.rua ? 'border-red-500/50' : 'border-[#363636] focus:border-orange-500/50'
                }`}
              />
              {errors.rua && <p className="text-xs text-red-400 mt-1">{errors.rua}</p>}
            </div>
            <input
              type="text"
              value={data.numero}
              onChange={(e) => updateField('numero', e.target.value)}
              placeholder="Nº"
              className="w-full px-4 py-3 bg-[#242424] border border-[#363636] rounded-xl text-sm text-[#fafafa] placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all"
            />
          </div>
        </div>

        <div>
          <input
            type="text"
            value={data.bairro}
            onChange={(e) => updateField('bairro', e.target.value)}
            placeholder="Bairro"
            className="w-full px-4 py-3 bg-[#242424] border border-[#363636] rounded-xl text-sm text-[#fafafa] placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-1">
            <input
              type="text"
              value={data.cidade}
              onChange={(e) => updateField('cidade', e.target.value)}
              placeholder="Cidade"
              className={`w-full px-4 py-3 bg-[#242424] border rounded-xl text-sm text-[#fafafa] placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all ${
                errors.cidade ? 'border-red-500/50' : 'border-[#363636] focus:border-orange-500/50'
              }`}
            />
            {errors.cidade && <p className="text-xs text-red-400 mt-1">{errors.cidade}</p>}
          </div>
          <div className="sm:col-span-1">
            <select
              value={data.estado}
              onChange={(e) => updateField('estado', e.target.value)}
              className={`w-full px-4 py-3 bg-[#242424] border rounded-xl text-sm text-[#fafafa] focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all appearance-none cursor-pointer ${
                errors.estado ? 'border-red-500/50' : 'border-[#363636] focus:border-orange-500/50'
              }`}
            >
              <option value="" className="bg-neutral-900">UF</option>
              {estadosBR.map((uf) => (
                <option key={uf} value={uf} className="bg-neutral-900">{uf}</option>
              ))}
            </select>
            {errors.estado && <p className="text-xs text-red-400 mt-1">{errors.estado}</p>}
          </div>
          <div className="sm:col-span-1">
            <input
              type="text"
              value={data.cep}
              onChange={(e) => updateField('cep', e.target.value)}
              placeholder="CEP"
              className="w-full px-4 py-3 bg-[#242424] border border-[#363636] rounded-xl text-sm text-[#fafafa] placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all"
            />
          </div>
        </div>

        {/* Site e Redes Sociais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#b4b4b4] mb-2">
              <Globe className="w-4 h-4 inline mr-1" />
              Site <span className="text-[#363636]">(opcional)</span>
            </label>
            <input
              type="url"
              value={data.site}
              onChange={(e) => updateField('site', e.target.value)}
              placeholder="https://www.suapousada.com.br"
              className="w-full px-4 py-3 bg-[#242424] border border-[#363636] rounded-xl text-sm text-[#fafafa] placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#b4b4b4] mb-2">
              Instagram <span className="text-[#363636]">(opcional)</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-[#4d4d4d]">instagram.com/</span>
              <input
                type="text"
                value={data.instagram}
                onChange={(e) => updateField('instagram', e.target.value.replace('instagram.com/', ''))}
                placeholder="sua_pousada"
                className="w-full pl-28 pr-4 py-3 bg-[#242424] border border-[#363636] rounded-xl text-sm text-[#fafafa] placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#b4b4b4] mb-2">
            Descrição Curta <span className="text-[#363636]">(opcional)</span>
          </label>
          <textarea
            value={data.descricao}
            onChange={(e) => updateField('descricao', e.target.value)}
            placeholder="Descreva brevemente sua propriedade..."
            rows={3}
            className="w-full px-4 py-3 bg-[#242424] border border-[#363636] rounded-xl text-sm text-[#fafafa] placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all resize-none"
          />
        </div>
      </div>
    </motion.div>
  );
}

StepProperty.validate = function (data: PropertyData) {
  const newErrors: Partial<Record<keyof PropertyData, string>> = {};
  if (!data.nome.trim()) newErrors.nome = 'Nome é obrigatório';
  if (!data.rua.trim()) newErrors.rua = 'Rua é obrigatória';
  if (!data.cidade.trim()) newErrors.cidade = 'Cidade é obrigatória';
  if (!data.estado.trim()) newErrors.estado = 'Estado é obrigatório';
  return Object.keys(newErrors).length === 0;
};
