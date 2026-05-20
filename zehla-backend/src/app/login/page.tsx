'use client';

import { useRouter } from 'next/navigation';
import { LoginPage } from '@/components/auth/LoginPage';

export default function LoginPageRoute() {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/dashboard');
  };

  const handleGoToRegister = () => {
    router.push('/teste-gratis');
  };

  const handleBack = () => {
    router.push('/');
  };

  return (
    <LoginPage
      onBack={handleBack}
      onLogin={handleLogin}
      onGoToRegister={handleGoToRegister}
    />
  );
}
