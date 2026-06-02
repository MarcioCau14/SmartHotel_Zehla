// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { OnboardingWizardUI } from '../../components/public/OnboardingWizardUI'
import type { OnboardingLeadData } from '../../hooks/useOnboardingWizard'

describe('OnboardingWizardUI - Step Navigation', () => {
  const baseProps = {
    currentStep: 0,
    totalSteps: 3,
    data: {} as Partial<OnboardingLeadData>,
    isLoading: false,
    error: null as string | null,
    onUpdateData: vi.fn(),
    onNext: vi.fn(),
    onBack: vi.fn(),
    onSubmit: vi.fn(),
    onClearError: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve renderizar passo 1 (Dados Pessoais) com campos de nome, email e whatsapp', () => {
    render(<OnboardingWizardUI {...baseProps} currentStep={0} />)

    expect(screen.getByText('Dados Pessoais')).toBeDefined()
    expect(screen.getByPlaceholderText('Seu nome completo')).toBeDefined()
    expect(screen.getByPlaceholderText('seu@email.com')).toBeDefined()
    expect(screen.getByPlaceholderText('(11) 99999-9999')).toBeDefined()
    expect(screen.getByText('Próximo')).toBeDefined()
  })

  it('deve chamar onNext ao clicar em Próximo', () => {
    render(<OnboardingWizardUI {...baseProps} currentStep={0} />)

    fireEvent.click(screen.getByText('Próximo'))
    expect(baseProps.onNext).toHaveBeenCalledTimes(1)
  })

  it('deve renderizar passo 2 (Dados da Pousada) com campos de pousada', () => {
    render(<OnboardingWizardUI {...baseProps} currentStep={1} />)

    expect(screen.getByText('Dados da Pousada')).toBeDefined()
    expect(screen.getByPlaceholderText('Pousada do Sol')).toBeDefined()
    expect(screen.getByPlaceholderText('São Paulo')).toBeDefined()
  })

  it('deve renderizar passo 3 (Confirmacao) com dados do lead', () => {
    render(
      <OnboardingWizardUI
        {...baseProps}
        currentStep={2}
        data={{
          nome: 'Maria',
          email: 'maria@pousada.com',
          whatsapp: '11999999999',
          nomePousada: 'Pousada do Sol',
          cidade: 'São Paulo',
          estado: 'SP',
          tipoPropriedade: 'pousada',
          quartos: 10,
        }}
      />,
    )

    expect(screen.getByText('Confirmação')).toBeDefined()
    expect(screen.getByText('Maria')).toBeDefined()
    expect(screen.getByText('maria@pousada.com')).toBeDefined()
    expect(screen.getByText('Pousada do Sol')).toBeDefined()
    expect(screen.getByText('São Paulo/SP')).toBeDefined()
    expect(screen.getByText('pousada')).toBeDefined()
    expect(screen.getByText('10')).toBeDefined()
    expect(screen.getByText('Ativar meu ZEHLA')).toBeDefined()
  })

  it('deve exibir botao Voltar desabilitado no passo 1', () => {
    render(<OnboardingWizardUI {...baseProps} currentStep={0} />)

    const backBtn = screen.getByText('Voltar').closest('button')
    expect(backBtn).toBeDisabled()
  })

  it('deve chamar onBack ao clicar em Voltar no passo 2', () => {
    render(<OnboardingWizardUI {...baseProps} currentStep={1} />)

    fireEvent.click(screen.getByText('Voltar'))
    expect(baseProps.onBack).toHaveBeenCalledTimes(1)
  })

  it('deve chamar onSubmit ao clicar em Ativar meu ZEHLA no passo final', () => {
    render(<OnboardingWizardUI {...baseProps} currentStep={2} />)

    fireEvent.click(screen.getByText('Ativar meu ZEHLA'))
    expect(baseProps.onSubmit).toHaveBeenCalledTimes(1)
  })

  it('deve exibir mensagem de erro quando error nao for nulo', () => {
    render(
      <OnboardingWizardUI
        {...baseProps}
        currentStep={0}
        error="E-mail já cadastrado"
      />,
    )

    expect(screen.getByText('E-mail já cadastrado')).toBeDefined()
  })

  it('deve chamar onClearError ao clicar em Fechar no erro', () => {
    render(
      <OnboardingWizardUI
        {...baseProps}
        currentStep={0}
        error="E-mail já cadastrado"
      />,
    )

    fireEvent.click(screen.getByText('Fechar'))
    expect(baseProps.onClearError).toHaveBeenCalledTimes(1)
  })

  it('deve desabilitar botoes quando isLoading=true', () => {
    render(<OnboardingWizardUI {...baseProps} currentStep={1} isLoading={true} />)

    expect(screen.getByText('Próximo').closest('button')).toBeDisabled()
    expect(screen.getByText('Voltar').closest('button')).toBeDisabled()
  })

  it('deve mostrar "Enviando..." no botao quando isLoading no passo final', () => {
    render(<OnboardingWizardUI {...baseProps} currentStep={2} isLoading={true} />)

    expect(screen.getByText('Enviando...')).toBeDefined()
  })
})
