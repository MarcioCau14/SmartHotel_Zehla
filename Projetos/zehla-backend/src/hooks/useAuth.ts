import { useState, useEffect } from 'react'
import { Result } from '../shared/Result'

export interface TenantSession {
  token: string
  userId: string
  pousadaId: string
  role: 'admin' | 'hoteleiro' | 'operador'
}

export interface LoginInput {
  email: string
  pousadaId: string
}

export function useAuth() {
  const [session, setSession] = useState<TenantSession | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('zehla_session_token')
      const storedPousadaId = localStorage.getItem('zehla_pousada_id')
      if (storedToken && storedPousadaId) {
        setSession({
          token: storedToken,
          userId: 'user-http-test',
          pousadaId: storedPousadaId,
          role: 'hoteleiro',
        })
        setIsAuthenticated(true)
      }
      setLoading(false)
    }
  }, [])

  const login = async (input: LoginInput): Promise<Result<TenantSession, Error>> => {
    try {
      // Gera um token simulado que o JwtGuard no backend aceitará se o segredo coincidir,
      // ou apenas simula com o pousadaId correspondente para os testes/UI.
      const mockToken = `fake-jwt-token-for-${input.pousadaId}`
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('zehla_session_token', mockToken)
        localStorage.setItem('zehla_pousada_id', input.pousadaId)
      }

      const newSession: TenantSession = {
        token: mockToken,
        userId: 'user-http-test',
        pousadaId: input.pousadaId,
        role: 'hoteleiro',
      }

      setSession(newSession)
      setIsAuthenticated(true)
      return Result.ok(newSession)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Login failed'))
    }
  }

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('zehla_session_token')
      localStorage.removeItem('zehla_pousada_id')
    }
    setSession(null)
    setIsAuthenticated(false)
  }

  return {
    session,
    isAuthenticated,
    loading,
    login,
    logout,
  }
}
