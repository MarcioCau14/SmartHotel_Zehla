'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useOnboardingWizard } from '../../hooks/useOnboardingWizard'
import { OnboardingWizardUI } from '../../components/public/OnboardingWizardUI'

export default function TesteGratisPage() {
  const router = useRouter()
  const {
    currentStep,
    totalSteps,
    data,
    updateData,
    next,
    back,
    submit,
    isLoading,
    error,
    clearError,
  } = useOnboardingWizard()

  const handleSubmit = async () => {
    const result = await submit()
    if (result.isOk) {
      router.push('/zcc')
    }
  }

  return (
    <OnboardingWizardUI
      currentStep={currentStep}
      totalSteps={totalSteps}
      data={data}
      isLoading={isLoading}
      error={error}
      onUpdateData={updateData}
      onNext={next}
      onBack={back}
      onSubmit={handleSubmit}
      onClearError={clearError}
    />
  )
}
