import { useState, useCallback } from 'react'
import { Result } from '../shared/Result'
import { apiPost } from './apiClient'

export interface OnboardingLeadData {
  nome: string
  email: string
  whatsapp: string
  nomePousada: string
  cidade: string
  estado: string
  tipoPropriedade: 'pousada' | 'hotel' | 'hostel' | 'outro'
  quartos: number
}

const TOTAL_STEPS = 3

export function useOnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [data, setData] = useState<Partial<OnboardingLeadData>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateData = useCallback((partial: Partial<OnboardingLeadData>) => {
    setData((prev) => ({ ...prev, ...partial }))
  }, [])

  const next = useCallback(() => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep((s) => s + 1)
    }
  }, [currentStep])

  const back = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1)
    }
  }, [currentStep])

  const submit = useCallback(async (): Promise<Result<{ leadId: string }, Error>> => {
    setIsLoading(true)
    setError(null)

    const payload = data as OnboardingLeadData
    const result = await apiPost<{ success: boolean; data: { leadId: string } }>(
      '/api/comercial/leads',
      payload,
    )

    if (result.isFail) {
      setError(result.error.message)
      setIsLoading(false)
      return Result.fail(result.error)
    }

    setIsLoading(false)
    return Result.ok({ leadId: result.value.data.leadId })
  }, [data])

  return {
    currentStep,
    totalSteps: TOTAL_STEPS,
    data,
    updateData,
    next,
    back,
    submit,
    isLoading,
    error,
    clearError: () => setError(null),
  }
}
