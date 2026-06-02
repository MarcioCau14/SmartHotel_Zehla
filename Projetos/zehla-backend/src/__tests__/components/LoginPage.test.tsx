// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginPageRoute from '../../app/login/page'
import { useAuth } from '../../hooks/useAuth'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, prefetch: vi.fn() }),
  redirect: vi.fn(),
}))

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

describe('LoginPageRoute - Auth Orchestration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve renderizar titulo e formulario de login', () => {
    vi.mocked(useAuth).mockReturnValue({
      login: vi.fn(),
      isAuthenticated: false,
      isLoading: false,
      session: null,
      logout: vi.fn(),
      getToken: vi.fn(),
    })

    render(<LoginPageRoute />)

    expect(screen.getByText('Bem-vindo de volta')).toBeDefined()
    expect(screen.getByPlaceholderText('seu@email.com')).toBeDefined()
    expect(screen.getByPlaceholderText('Sua senha')).toBeDefined()
    expect(screen.getByText('Entrar no ZEHLA')).toBeDefined()
  })

  it('deve exibir mensagem de erro quando login retorna falha (401)', async () => {
    const mockLogin = vi.fn().mockResolvedValue({
      isOk: false,
      isFail: true,
      error: new Error('Credenciais inválidas'),
    })

    vi.mocked(useAuth).mockReturnValue({
      login: mockLogin,
      isAuthenticated: false,
      isLoading: false,
      session: null,
      logout: vi.fn(),
      getToken: vi.fn(),
    })

    render(<LoginPageRoute />)

    fireEvent.change(screen.getByPlaceholderText('seu@email.com'), {
      target: { value: 'wrong@email.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('Sua senha'), {
      target: { value: 'wrong' },
    })
    fireEvent.click(screen.getByText('Entrar no ZEHLA'))

    await waitFor(() => {
      expect(screen.getByText('Credenciais inválidas')).toBeDefined()
    })

    expect(mockPush).not.toHaveBeenCalled()
  })

  it('deve redirecionar para /zcc quando login retorna sucesso', async () => {
    const mockLogin = vi.fn().mockResolvedValue({
      isOk: true,
      isFail: false,
      value: {
        token: 'jwt-123',
        userId: 'user-1',
        pousadaId: 'pousada-1',
        role: 'admin',
      },
    })

    vi.mocked(useAuth).mockReturnValue({
      login: mockLogin,
      isAuthenticated: false,
      isLoading: false,
      session: null,
      logout: vi.fn(),
      getToken: vi.fn(),
    })

    render(<LoginPageRoute />)

    fireEvent.change(screen.getByPlaceholderText('seu@email.com'), {
      target: { value: 'admin@ze.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('Sua senha'), {
      target: { value: '123456' },
    })
    fireEvent.click(screen.getByText('Entrar no ZEHLA'))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/zcc')
    })
  })

  it('deve redirecionar para /zcc se ja estiver autenticado', () => {
    vi.mocked(useAuth).mockReturnValue({
      login: vi.fn(),
      isAuthenticated: true,
      isLoading: false,
      session: { token: 'jwt', userId: 'u1', pousadaId: 'p1', role: 'admin' },
      logout: vi.fn(),
      getToken: vi.fn(),
    })

    render(<LoginPageRoute />)

    expect(mockPush).toHaveBeenCalledWith('/zcc')
  })
})
