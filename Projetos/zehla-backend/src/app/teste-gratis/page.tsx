'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';

function TesteGratisContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const utmData = {
    utm_source: searchParams.get('utm_source') || '',
    utm_medium: searchParams.get('utm_medium') || '',
    utm_campaign: searchParams.get('utm_campaign') || '',
    utm_term: searchParams.get('utm_term') || '',
    utm_content: searchParams.get('utm_content') || '',
    ref: searchParams.get('ref') || '',
  };

  const handleOnboardingComplete = () => {
    router.push('/dashboard');
  };

  return <OnboardingWizard onComplete={handleOnboardingComplete} utmData={utmData} />;
}

export default function TesteGratisPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]"><p className="text-[#4d4d4d]">Carregando...</p></div>}>
      <TesteGratisContent />
    </Suspense>
  );
}
