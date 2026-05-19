import { useRouter } from 'next/navigation';

import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';


'use client';


export default function TesteGratisPage() {
  const router = useRouter();

  const handleOnboardingComplete = () => {
    router.push('/dashboard');
  };

  return <OnboardingWizard onComplete={handleOnboardingComplete} />;
}
