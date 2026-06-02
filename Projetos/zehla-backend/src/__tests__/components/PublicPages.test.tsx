// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { HeroSection } from '../../components/public/HeroSection'
import { CTASection } from '../../components/public/CTASection'

describe('HeroSection', () => {
  it('deve renderizar titulo principal e subtitulo', () => {
    render(<HeroSection onNavigateToTrial={vi.fn()} />)

    expect(screen.getByText('O Cérebro Cognitivo')).toBeDefined()
    expect(screen.getByText('da Sua Pousada')).toBeDefined()
    expect(screen.getByText('ZEHLA SmartHotel')).toBeDefined()
  })

  it('deve renderizar botao de CTA e disparar callback', () => {
    const onNavigate = vi.fn()
    render(<HeroSection onNavigateToTrial={onNavigate} />)

    const cta = screen.getByText('Testar Grátis por 7 Dias')
    expect(cta).toBeDefined()

    fireEvent.click(cta)
    expect(onNavigate).toHaveBeenCalledTimes(1)
  })
})

describe('CTASection', () => {
  it('deve renderizar texto e botao de CTA', () => {
    render(<CTASection onNavigateToTrial={vi.fn()} />)

    expect(screen.getByText(/Pronto para deixar o ZEHLA/)).toBeDefined()
    expect(screen.getByText('Iniciar Teste Grátis')).toBeDefined()
  })

  it('deve disparar callback ao clicar no botao', () => {
    const onNavigate = vi.fn()
    render(<CTASection onNavigateToTrial={onNavigate} />)

    fireEvent.click(screen.getByText('Iniciar Teste Grátis'))
    expect(onNavigate).toHaveBeenCalledTimes(1)
  })
})
