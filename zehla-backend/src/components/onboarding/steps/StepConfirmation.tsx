'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Check,
  Building2,
  BedDouble,
  Sparkles,
  CreditCard,
  Zap,
  MessageCircle } from
'lucide-react';
import type { WelcomeData } from './StepWelcome';
import type { PropertyData } from './StepProperty';
import type { RoomData } from './StepRooms';
import type { ServicesData } from './StepServices';
import type { PaymentData } from './StepPayment';

interface StepConfirmationProps {
  welcome: WelcomeData;
  property: PropertyData;
  rooms: RoomData[];
  services: ServicesData;
  payment: PaymentData;
}

const serviceLabels: Record<string, string> = {
  wifi: 'WiFi Grátis',
  estacionamento: 'Estacionamento',
  cafe: 'Café da Manhã',
  piscina: 'Piscina',
  'ar-condicionado': 'Ar-condicionado',
  tv: 'TV',
  'mini-cozinha': 'Mini-cozinha',
  restaurante: 'Restaurante',
  spa: 'Spa / Bem-estar',
  lavanderia: 'Lavanderia',
  transfer: 'Transfer / Shuttle'
};

const paymentLabels: Record<string, string> = {
  pix: 'PIX',
  cartao: 'Cartão de Crédito',
  dinheiro: 'Dinheiro',
  transferencia: 'Transferência Bancária'
};

const tipoLabels: Record<string, string> = {
  standard: 'Standard',
  luxo: 'Luxo',
  suite: 'Suíte',
  chale: 'Chalé'
};

export function StepConfirmation({
  welcome,
  property,
  rooms,
  services,
  payment
}: StepConfirmationProps) {
  const isDifferentNumber = welcome.whatsappProprietario !== welcome.whatsappAtendimento;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto">
      
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6 text-sm text-[#FF5500]">
          <Check className="w-4 h-4" />
          <span>Quase pronto!</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#fafafa] mb-3">
          Resumo da sua{' '}
          <span className="gradient-text">configuração</span>
        </h2>
        <p className="text-[#898989] text-sm sm:text-base">
          Verifique os dados abaixo e ative o cérebro ZEHLA para sua propriedade.
        </p>
      </div>

      <div className="space-y-4">
        {/* Account */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#FF5500]/10 flex items-center justify-center">
              <Brain className="w-4 h-4 text-[#FF5500]" />
            </div>
            <h3 className="text-sm font-semibold text-[#efefef]">Conta</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-[#363636]">Nome:</span>{' '}
              <span className="text-[#b4b4b4]">{welcome.nome || '—'}</span>
            </div>
            <div>
              <span className="text-[#363636]">E-mail:</span>{' '}
              <span className="text-[#b4b4b4]">{welcome.email || '—'}</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-3.5 h-3.5 text-[#FF5500] shrink-0" />
              <span className="text-[#363636]">WhatsApp Proprietário:</span>{' '}
              <span className="text-[#b4b4b4]">{welcome.whatsappProprietario || '—'}</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="text-[#363636]">WhatsApp Atendimento:</span>{' '}
              <span className="text-[#b4b4b4]">{welcome.whatsappAtendimento || '—'}</span>
              {isDifferentNumber &&
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/20">
                  Número separado
                </span>
              }
            </div>
          </div>
        </div>

        {/* Property */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#FF5500]/10 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-[#FF5500]" />
            </div>
            <h3 className="text-sm font-semibold text-[#efefef]">Propriedade</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-[#363636]">Nome:</span>{' '}
              <span className="text-[#b4b4b4]">{property.nome || '—'}</span>
            </div>
            <div>
              <span className="text-[#363636]">Tipo:</span>{' '}
              <span className="text-[#b4b4b4] capitalize">{tipoLabels[property.tipo] || '—'}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-[#363636]">Endereço:</span>{' '}
              <span className="text-[#b4b4b4]">
                {useMemo(() => [property.rua, property.numero, property.bairro, property.cidade, property.estado, property.cep].
                filter(Boolean).
                join(', '), [Boolean]) || '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Rooms */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#FF5500]/10 flex items-center justify-center">
              <BedDouble className="w-4 h-4 text-[#FF5500]" />
            </div>
            <h3 className="text-sm font-semibold text-[#efefef]">Acomodações ({rooms.length})</h3>
          </div>
          <div className="space-y-2">
            {rooms.map((room, i) =>
            <div key={room.id} className="flex items-center justify-between py-2 border-b border-[#2e2e2e] last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#363636] font-mono w-6">#{i + 1}</span>
                  <span className="text-sm text-[#b4b4b4]">{room.nome || '—'}</span>
                  <span className="text-xs text-[#4d4d4d] px-2 py-0.5 bg-[#242424] rounded-md">
                    {tipoLabels[room.tipo] || 'Standard'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-[#4d4d4d]">
                  <span>👥 {room.capacidade}</span>
                  <span className="text-[#FF5500] font-semibold">R$ {room.preco}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Services */}
        {services.selected.length > 0 &&
        <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#FF5500]/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#FF5500]" />
              </div>
              <h3 className="text-sm font-semibold text-[#efefef]">
                Serviços ({services.selected.length})
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {services.selected.map((id) =>
            <span
              key={id}
              className="px-3 py-1.5 bg-[#FF5500]/10 border border-orange-500/20 rounded-lg text-xs text-[#FF5500]">
              
                  {serviceLabels[id] || id}
                </span>
            )}
            </div>
          </div>
        }

        {/* Payment */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-teal-400" />
            </div>
            <h3 className="text-sm font-semibold text-[#efefef]">Pagamentos</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {payment.methods.map((id) =>
            <span
              key={id}
              className="px-3 py-1.5 bg-[#FF5500]/10 border border-purple-500/20 rounded-lg text-xs text-[#FF5500]">
              
                {paymentLabels[id] || id}
              </span>
            )}
          </div>
          {payment.methods.includes('pix') && payment.pixKey &&
          <p className="text-xs text-[#363636] mt-3">
              Chave PIX: <span className="text-[#898989]">{payment.pixKey}</span>
            </p>
          }
        </div>
      </div>
    </motion.div>);

}