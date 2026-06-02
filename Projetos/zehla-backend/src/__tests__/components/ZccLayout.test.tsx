// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { KpiCard } from '../../components/zcc/KpiCard'
import ZCCLayout from '../../app/zcc/layout'

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  useRouter: () => ({ push: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/zcc',
}))

vi.mock('next/link', () => ({
  default: ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) =>
    <a href={href} className={className}>{children}</a>,
}))

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

import { useAuth } from '../../hooks/useAuth'
import { redirect } from 'next/navigation'

describe('ZCCLayout - Auth Guard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve renderizar spinner enquanto isLoading=true', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      session: null,
      login: vi.fn(),
      logout: vi.fn(),
      getToken: vi.fn(),
    })

    render(<ZCCLayout><div>Conteúdo</div></ZCCLayout>)

    expect(screen.getByText('Verificando credenciais...')).toBeDefined()
    expect(screen.queryByText('Conteúdo')).toBeNull()
  })

  it('deve chamar redirect quando isAuthenticated=false', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      session: null,
      login: vi.fn(),
      logout: vi.fn(),
      getToken: vi.fn(),
    })

    render(<ZCCLayout><div>Conteúdo</div></ZCCLayout>)

    expect(redirect).toHaveBeenCalledWith('/login')
  })

  it('deve renderizar sidebar e children quando isAuthenticated=true', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      session: {
        token: 'jwt-123',
        userId: 'user-1',
        pousadaId: 'pousada-1',
        role: 'admin',
      },
      login: vi.fn(),
      logout: vi.fn(),
      getToken: vi.fn(),
    })

    render(<ZCCLayout><div>Conteúdo Protegido</div></ZCCLayout>)

    expect(screen.getByText('ZCC')).toBeDefined()
    expect(screen.getByText('Dashboard')).toBeDefined()
    expect(screen.getByText('Leads')).toBeDefined()
    expect(screen.getByText('Operacional')).toBeDefined()
    expect(screen.getByText('Conteúdo Protegido')).toBeDefined()
  })

  it('deve exibir ID do usuario na sidebar quando autenticado', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      session: {
        token: 'jwt-123',
        userId: 'user-abc-12345',
        pousadaId: 'pousada-1',
        role: 'hoteleiro',
      },
      login: vi.fn(),
      logout: vi.fn(),
      getToken: vi.fn(),
    })

    render(<ZCCLayout><div>Conteúdo</div></ZCCLayout>)

    expect(screen.getByText(/ID: user-abc/)).toBeDefined()
  })
})

describe('KpiCard - Dumb Component', () => {
  it('deve renderizar titulo e valor', () => {
    render(<KpiCard titulo="Receita Total" valor="R$ 125.000,00" icone="R$" />)

    expect(screen.getByText('Receita Total')).toBeDefined()
    expect(screen.getByText('R$ 125.000,00')).toBeDefined()
  })

  it('deve renderizar trend com cor verde quando trendPositiva=true', () => {
    render(
      <KpiCard
        titulo="Ocupação"
        valor="72%"
        trend="+12.5%"
        trendPositiva={true}
        icone="%"
      />,
    )

    const trendEl = screen.getByText('▲ +12.5%')
    expect(trendEl).toBeDefined()
    expect(trendEl.className).toContain('text-emerald-400')
  })

  it('deve renderizar trend com cor vermelha quando trendPositiva=false', () => {
    render(
      <KpiCard
        titulo="Alertas"
        valor="3"
        trend="-2"
        trendPositiva={false}
        icone="!"
      />,
    )

    const trendEl = screen.getByText('▼ -2')
    expect(trendEl).toBeDefined()
    expect(trendEl.className).toContain('text-red-400')
  })

  it('deve renderizar icone', () => {
    render(<KpiCard titulo="Leads" valor="18" icone="L" />)
    expect(screen.getByText('L')).toBeDefined()
  })

  it('deve ocultar trend quando nao fornecido', () => {
    render(<KpiCard titulo="Leads" valor="18" icone="L" />)
    expect(screen.queryByText('▲')).toBeNull()
    expect(screen.queryByText('▼')).toBeNull()
  })
})
