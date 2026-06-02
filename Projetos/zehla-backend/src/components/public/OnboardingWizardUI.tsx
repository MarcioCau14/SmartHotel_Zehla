'use client'

import React from 'react'
import { Brain, ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react'
import type { OnboardingLeadData } from '../../hooks/useOnboardingWizard'

export interface OnboardingWizardUIProps {
  currentStep: number
  totalSteps: number
  data: Partial<OnboardingLeadData>
  isLoading: boolean
  error: string | null
  onUpdateData: (partial: Partial<OnboardingLeadData>) => void
  onNext: () => void
  onBack: () => void
  onSubmit: () => void
  onClearError: () => void
}

const STEP_LABELS = ['Dados Pessoais', 'Dados da Pousada', 'Confirmação']

function StepDadosPessoais({
  data,
  onChange,
}: {
  data: Partial<OnboardingLeadData>
  onChange: (d: Partial<OnboardingLeadData>) => void
}) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-2 font-mono">NOME</label>
        <input
          type="text"
          value={data.nome ?? ''}
          onChange={(e) => onChange({ nome: e.target.value })}
          placeholder="Seu nome completo"
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all font-mono"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-2 font-mono">E-MAIL</label>
        <input
          type="email"
          value={data.email ?? ''}
          onChange={(e) => onChange({ email: e.target.value })}
          placeholder="seu@email.com"
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all font-mono"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-2 font-mono">WHATSAPP</label>
        <input
          type="tel"
          value={data.whatsapp ?? ''}
          onChange={(e) => onChange({ whatsapp: e.target.value })}
          placeholder="(11) 99999-9999"
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all font-mono"
        />
      </div>
    </div>
  )
}

function StepDadosPousada({
  data,
  onChange,
}: {
  data: Partial<OnboardingLeadData>
  onChange: (d: Partial<OnboardingLeadData>) => void
}) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-2 font-mono">NOME DA POUSADA</label>
        <input
          type="text"
          value={data.nomePousada ?? ''}
          onChange={(e) => onChange({ nomePousada: e.target.value })}
          placeholder="Pousada do Sol"
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all font-mono"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2 font-mono">CIDADE</label>
          <input
            type="text"
            value={data.cidade ?? ''}
            onChange={(e) => onChange({ cidade: e.target.value })}
            placeholder="São Paulo"
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all font-mono"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2 font-mono">ESTADO</label>
          <input
            type="text"
            value={data.estado ?? ''}
            onChange={(e) => onChange({ estado: e.target.value })}
            placeholder="SP"
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all font-mono"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-2 font-mono">TIPO DE PROPRIEDADE</label>
        <select
          value={data.tipoPropriedade ?? ''}
          onChange={(e) => onChange({ tipoPropriedade: e.target.value as OnboardingLeadData['tipoPropriedade'] })}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all font-mono"
        >
          <option value="">Selecione</option>
          <option value="pousada">Pousada</option>
          <option value="hotel">Hotel</option>
          <option value="hostel">Hostel</option>
          <option value="outro">Outro</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-2 font-mono">QUANTIDADE DE QUARTOS</label>
        <input
          type="number"
          value={data.quartos ?? ''}
          onChange={(e) => onChange({ quartos: parseInt(e.target.value) || 0 })}
          placeholder="10"
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all font-mono"
        />
      </div>
    </div>
  )
}

function StepConfirmacao({ data }: { data: Partial<OnboardingLeadData> }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400 mb-6">
        Confirme os dados antes de enviar:
      </p>
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
        <InfoRow label="Nome" value={data.nome} />
        <InfoRow label="E-mail" value={data.email} />
        <InfoRow label="WhatsApp" value={data.whatsapp} />
        <InfoRow label="Pousada" value={data.nomePousada} />
        <InfoRow label="Cidade/Estado" value={`${data.cidade}/${data.estado}`} />
        <InfoRow label="Tipo" value={data.tipoPropriedade} />
        <InfoRow label="Quartos" value={String(data.quartos)} />
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-slate-500 font-mono">{label}</span>
      <span className="text-xs text-slate-200 font-mono">{value || '-'}</span>
    </div>
  )
}

export function OnboardingWizardUI({
  currentStep,
  totalSteps,
  data,
  isLoading,
  error,
  onUpdateData,
  onNext,
  onBack,
  onSubmit,
  onClearError,
}: OnboardingWizardUIProps) {
  const isLastStep = currentStep === totalSteps - 1

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col">
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-[#FF5500]" />
              <span className="font-bold text-sm text-white">ZEHLA</span>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Passo {currentStep + 1} de {totalSteps}
            </span>
          </div>

          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#FF5500] rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>

          <div className="flex items-center justify-between mt-2">
            {STEP_LABELS.map((label, i) => (
              <span
                key={i}
                className={`text-[10px] ${
                  i === currentStep
                    ? 'text-[#FF5500] font-semibold'
                    : i < currentStep
                    ? 'text-slate-400'
                    : 'text-slate-700'
                }`}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-8">
        <div className="max-w-lg mx-auto">
          {currentStep === 0 && (
            <StepDadosPessoais data={data} onChange={onUpdateData} />
          )}
          {currentStep === 1 && (
            <StepDadosPousada data={data} onChange={onUpdateData} />
          )}
          {currentStep === 2 && (
            <StepConfirmacao data={data} />
          )}
        </div>
      </main>

      <footer className="bg-slate-900 border-t border-slate-800 px-4 py-4 sticky bottom-0 z-50">
        <div className="max-w-lg mx-auto">
          {error && (
            <div className="mb-3 bg-red-950/40 border border-red-800/50 rounded-lg px-4 py-3 flex items-center gap-2">
              <span className="text-red-400 text-xs flex-1">{error}</span>
              <button onClick={onClearError} className="text-red-400/60 hover:text-red-400 text-xs">
                Fechar
              </button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              disabled={currentStep === 0 || isLoading}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-all ${
                currentStep === 0 || isLoading
                  ? 'text-slate-700 cursor-not-allowed'
                  : 'text-slate-400 hover:text-slate-200 border border-slate-700'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>

            {isLastStep ? (
              <button
                onClick={onSubmit}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#FF5500] hover:bg-[#ff6611] text-white text-sm font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Ativar meu ZEHLA
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={onNext}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#FF5500] hover:bg-[#ff6611] text-white text-sm font-bold rounded-lg transition-all disabled:opacity-50"
              >
                Próximo
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}
