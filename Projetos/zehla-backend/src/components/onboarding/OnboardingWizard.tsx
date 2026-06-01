'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ArrowLeft, ArrowRight, Check, Loader2, PartyPopper } from 'lucide-react';
import { StepWelcome, type WelcomeData } from './steps/StepWelcome';
import { StepProperty, type PropertyData } from './steps/StepProperty';
import { StepRooms, type RoomData } from './steps/StepRooms';
import { StepServices, type ServicesData } from './steps/StepServices';
import { StepPayment, type PaymentData } from './steps/StepPayment';
import { StepConfirmation } from './steps/StepConfirmation';

const TOTAL_STEPS = 6;

const stepLabels = [
  'Conta',
  'Propriedade',
  'Quartos',
  'Serviços',
  'Pagamentos',
  'Confirmação',
];

interface OnboardingData {
  welcome: WelcomeData;
  property: PropertyData;
  rooms: RoomData[];
  services: ServicesData;
  payment: PaymentData;
}

const defaultData: OnboardingData = {
  welcome: { nome: '', email: '', whatsappProprietario: '', whatsappAtendimento: '', senha: '' },
  property: {
    nome: '',
    documento: '',
    rua: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    tipo: '',
    site: '',
    instagram: '',
    descricao: '',
  },
  rooms: [
    { id: `room-init-${Date.now()}`, nome: '101', tipo: 'standard', pricingType: 'PER_ROOM', capacidade: 2, preco: 150 },
  ],
  services: { selected: [] },
  payment: {
    methods: ['pix'],
    pixKey: '',
    pixKeyType: 'cpf',
    bankName: '',
    bankAgency: '',
    bankAccount: '',
    bankAccountType: '',
    bankCpf: '',
  },
};

interface OnboardingWizardProps {
  onComplete: () => void;
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(defaultData);
  const [isActivating, setIsActivating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Persist data to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('zehla-onboarding-data', JSON.stringify(data));
      localStorage.setItem('zehla-onboarding-step', String(currentStep));
    } catch {
      // ignore
    }
  }, [data, currentStep]);

  // Load persisted data on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('zehla-onboarding-data');
      const savedStep = localStorage.getItem('zehla-onboarding-step');
      if (savedData) {
        const parsed = JSON.parse(savedData) as OnboardingData;
        // eslint-disable-next-line react-hooks/set-state-in-effect -- reading from localStorage on mount (SSR-safe)
        setData(parsed);
      }
      if (savedStep) {
        const step = parseInt(savedStep, 10);
        if (step >= 0 && step < TOTAL_STEPS) {
          setCurrentStep(step);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep((s) => s + 1);
    }
  }, [currentStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  }, [currentStep]);

  const validateCurrentStep = useCallback((): boolean => {
    switch (currentStep) {
      case 0:
        return StepWelcome.validate(data.welcome);
      case 1:
        return StepProperty.validate(data.property);
      case 2:
        return data.rooms.length > 0;
      case 3:
        return true; // Services are optional
      case 4:
        return data.payment.methods.length > 0 && StepPayment.validate(data.payment);
      default:
        return true;
    }
  }, [currentStep, data]);

  const [activationError, setActivationError] = useState<string | null>(null);

  const handleActivate = useCallback(async () => {
    setIsActivating(true);
    setActivationError(null);
    try {
      // Step 1: Register tenant (create account)
      const registerRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: data.welcome.nome,
          email: data.welcome.email,
          senha: data.welcome.senha,
          whatsappProprietario: data.welcome.whatsappProprietario,
          whatsappAtendimento: data.welcome.whatsappAtendimento,
        }),
      });

      const registerData = await registerRes.json();

      if (!registerRes.ok) {
        if (registerData.code === 'EMAIL_EXISTS') {
          setActivationError('Este e-mail já está cadastrado. Tente fazer login ou use outro e-mail.');
        } else {
          setActivationError(registerData.error || 'Erro ao criar conta.');
        }
        setIsActivating(false);
        return;
      }

      const tenantId = registerData.data.tenantId;
      const token = registerData.data.token;

      // Step 2: Complete onboarding (create property, rooms, API configs, agent configs)
      const onboardRes = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          property: data.property,
          rooms: data.rooms,
          services: data.services,
          payment: data.payment,
        }),
      });

      const onboardData = await onboardRes.json();
      if (!onboardRes.ok) {
        setActivationError('Erro ao configurar propriedade. Tente novamente.');
        setIsActivating(false);
        return;
      }

      // Step 3: Save session data to localStorage
      localStorage.setItem('zehla-trial-start', registerData.data.trialStart);
      localStorage.setItem('zehla-token', token);
      localStorage.setItem('zehla-tenant-data', JSON.stringify({
        tenantId,
        nome: data.welcome.nome,
        email: data.welcome.email,
        whatsappProprietario: data.welcome.whatsappProprietario,
        whatsappAtendimento: data.welcome.whatsappAtendimento,
        property: data.property,
        rooms: data.rooms,
        services: data.services,
        payment: data.payment,
        plan: 'trial',
        trialEnd: registerData.data.trialEnd,
      }));
      localStorage.setItem('zehla-onboarding-complete', 'true');
      localStorage.removeItem('zehla-onboarding-data');
      localStorage.removeItem('zehla-onboarding-step');
    } catch (err) {
      console.error('[ONBOARDING] Activation error:', err);
      setActivationError('Erro de conexão. Verifique sua internet e tente novamente.');
      setIsActivating(false);
      return;
    }
    setIsComplete(true);
    setTimeout(() => {
      onComplete();
    }, 1500);
  }, [onComplete, data]);

  // Success screen
  if (isComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 10, delay: 0.2 }}
            className="w-20 h-20 rounded-full bg-[#FF5500]/10 border-2 border-orange-500 flex items-center justify-center mx-auto mb-6"
          >
            <PartyPopper className="w-10 h-10 text-[#FF5500]" />
          </motion.div>
          <h2 className="text-3xl font-bold text-[#fafafa] mb-3">
            <span className="gradient-text">ZEHLA Ativado!</span>
          </h2>
          <p className="text-[#898989] text-lg">
            O cérebro ZEHLA está configurado e pronto para operar.
          </p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6"
          >
            <Loader2 className="w-5 h-5 text-[#FF5500] animate-spin mx-auto" />
            <p className="text-xs text-[#363636] mt-2">Preparando seu painel...</p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar with logo + progress */}
      <header className="glass-strong border-b border-[#2e2e2e] px-4 py-3 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#FF5500]/10 border border-orange-500/20 flex items-center justify-center">
                <Brain className="w-4 h-4 text-[#FF5500]" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-[#fafafa] leading-none">ZEHLA</span>
                <span className="text-[9px] text-[#4d4d4d] leading-none">SmartHotel</span>
              </div>
            </div>

            {/* Step counter */}
            <span className="text-xs text-[#4d4d4d] font-mono">
              Passo {currentStep + 1} de {TOTAL_STEPS}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-[#242424] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-orange-500 to-purple-500 rounded-full"
              initial={{ width: `${((currentStep) / TOTAL_STEPS) * 100}%` }}
              animate={{ width: `${((currentStep + 1) / TOTAL_STEPS) * 100}%` }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            />
          </div>

          {/* Step indicators */}
          <div className="flex items-center justify-between mt-2">
            {stepLabels.map((label, i) => (
              <button
                key={i}
                onClick={() => {
                  // Allow navigating to completed or current steps only
                  if (i < currentStep) setCurrentStep(i);
                }}
                className={`text-[10px] transition-colors ${
                  i === currentStep
                    ? 'text-[#FF5500] font-semibold'
                    : i < currentStep
                    ? 'text-[#898989] cursor-pointer hover:text-[#efefef]'
                    : 'text-neutral-700'
                }`}
              >
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{i + 1}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 py-8 sm:py-12 overflow-y-auto zehla-scroll">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <StepWelcome
                key="step-0"
                data={data.welcome}
                onChange={(d) => setData({ ...data, welcome: d })}
              />
            )}
            {currentStep === 1 && (
              <StepProperty
                key="step-1"
                data={data.property}
                onChange={(d) => setData({ ...data, property: d })}
              />
            )}
            {currentStep === 2 && (
              <StepRooms
                key="step-2"
                data={data.rooms}
                onChange={(d) => setData({ ...data, rooms: d })}
              />
            )}
            {currentStep === 3 && (
              <StepServices
                key="step-3"
                data={data.services}
                onChange={(d) => setData({ ...data, services: d })}
              />
            )}
            {currentStep === 4 && (
              <StepPayment
                key="step-4"
                data={data.payment}
                onChange={(d) => setData({ ...data, payment: d })}
              />
            )}
            {currentStep === 5 && (
              <StepConfirmation
                key="step-5"
                welcome={data.welcome}
                property={data.property}
                rooms={data.rooms}
                services={data.services}
                payment={data.payment}
              />
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer navigation */}
      <footer className="glass-strong border-t border-[#2e2e2e] px-4 py-4 sticky bottom-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              currentStep === 0
                ? 'text-neutral-700 cursor-not-allowed'
                : 'text-[#898989] hover:text-[#efefef] glass-card hover:border-[#363636]'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>

          {activationError && (
            <div className="absolute -top-12 left-0 right-0 px-4">
              <div className="max-w-4xl mx-auto">
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
                  <span className="text-red-400 text-xs flex-1">{activationError}</span>
                  <button onClick={() => setActivationError(null)} className="text-red-400/60 hover:text-red-400 text-xs">
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          )}
          {currentStep < TOTAL_STEPS - 1 ? (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                if (validateCurrentStep()) handleNext();
              }}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-orange-500/20"
            >
              Próximo
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleActivate}
              disabled={isActivating}
              className="inline-flex items-center gap-2 px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isActivating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Ativando...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Ativar meu ZEHLA
                </>
              )}
            </motion.button>
          )}
        </div>
      </footer>
    </div>
  );
}
