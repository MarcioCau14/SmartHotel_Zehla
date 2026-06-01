import { useState, useEffect, useCallback } from 'react'
import { Result } from '../shared/Result'
import { apiPost } from './apiClient'

export interface TenantSession {
  token: string
  userId: string
  pousadaId: string
  role: 'admin' | 'hoteleiro' | 'operador'
}

interface LoginResponse {
  token: string
  user: {
    id: string
    email: string
    role: 'admin' | 'hoteleiro' | 'operador'
  }
  pousadaId: string
}

export function useAuth() {
  const [session, setSession] = useState<TenantSession | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsLoading(false)
      return
    }
    const token = localStorage.getItem('zehla_session_token')
    const pousadaId = localStorage.getItem('zehla_pousada_id')
    const userId = localStorage.getItem('zehla_user_id')
    const role = localStorage.getItem('zehla_user_role') as TenantSession['role'] | null

    if (token && pousadaId) {
      setSession({ token, userId: userId ?? '', pousadaId, role: role ?? 'hoteleiro' })
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<Result<TenantSession, Error>> => {
    const result = await apiPost<LoginResponse>('/api/auth/login', { email, password })
    if (result.isFail) return Result.fail(result.error)

    const data = result.value
    const newSession: TenantSession = {
      token: data.token,
      userId: data.user.id,
      pousadaId: data.pousadaId,
      role: data.user.role,
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('zehla_session_token', newSession.token)
      localStorage.setItem('zehla_pousada_id', newSession.pousadaId)
      localStorage.setItem('zehla_user_id', newSession.userId)
      localStorage.setItem('zehla_user_role', newSession.role)
    }

    setSession(newSession)
    setIsAuthenticated(true)
    return Result.ok(newSession)
  }, [])

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('zehla_session_token')
      localStorage.removeItem('zehla_pousada_id')
      localStorage.removeItem('zehla_user_id')
      localStorage.removeItem('zehla_user_role')
    }
    setSession(null)
    setIsAuthenticated(false)
  }, [])

  const getToken = useCallback((): string | null => {
    return session?.token ?? null
  }, [session])

  return {
    session,
    isAuthenticated,
    isLoading,
    login,
    logout,
    getToken,
  }
}
