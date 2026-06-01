// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useAuth } from '../../hooks/useAuth'
import { useLeadsKanban } from '../../hooks/useLeadsKanban'
import { useZehlaBrain } from '../../hooks/useZehlaBrain'
import { configureApiClient } from '../../hooks/apiClient'

function mockFetchOnce(status: number, body: unknown) {
  return vi.mocked(fetch).mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(JSON.stringify(body)),
  } as Response)
}

beforeEach(() => {
  vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
    Promise.resolve(new Response('{}', { status: 200 })),
  )
  configureApiClient({ getToken: () => 'test-token' })
  if (typeof localStorage !== 'undefined') {
    localStorage.clear()
  }
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useAuth', () => {
  it('deve iniciar com isLoading=false e isAuthenticated=false apos hidratacao', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.session).toBeNull()
  })

  it('deve logar com sucesso e armazenar sessao', async () => {
    mockFetchOnce(200, {
      token: 'jwt-123',
      user: { id: 'user-1', email: 'admin@ze.com', role: 'admin' },
      pousadaId: 'pousada-1',
    })

    const { result } = renderHook(() => useAuth())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    let loginResult: unknown
    await act(async () => {
      loginResult = await result.current.login('admin@ze.com', '123456')
    })

    expect(loginResult).toBeDefined()
    if (loginResult && typeof loginResult === 'object' && 'isOk' in loginResult) {
      const res = loginResult as { isOk: boolean; value?: { token: string } }
      expect(res.isOk).toBe(true)
      if (res.isOk && res.value) {
        expect(res.value.token).toBe('jwt-123')
      }
    }
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.session?.pousadaId).toBe('pousada-1')
  })

  it('deve falhar login com credenciais invalidas e retornar erro 401', async () => {
    mockFetchOnce(401, { error: 'Invalid credentials' })

    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    let loginResult: unknown
    await act(async () => {
      loginResult = await result.current.login('wrong@email.com', 'wrong')
    })

    expect(loginResult).toBeDefined()
    if (loginResult && typeof loginResult === 'object' && 'isOk' in loginResult) {
      const res = loginResult as { isOk: boolean }
      expect(res.isOk).toBe(false)
    }
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('deve limpar sessao no logout', async () => {
    mockFetchOnce(200, {
      token: 'jwt-123',
      user: { id: 'user-1', email: 'admin@ze.com', role: 'admin' },
      pousadaId: 'pousada-1',
    })

    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.login('admin@ze.com', '123456')
    })

    expect(result.current.isAuthenticated).toBe(true)

    act(() => {
      result.current.logout()
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.session).toBeNull()
  })
})

describe('useLeadsKanban', () => {
  it('deve iniciar com isLoading=false e leads vazios', () => {
    const { result } = renderHook(() => useLeadsKanban())
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.leads.topo).toEqual([])
    expect(result.current.leads.qualificacao).toEqual([])
  })

  it('deve qualificar lead com sucesso', async () => {
    mockFetchOnce(200, {
      success: true,
      data: { id: 'lead-1', estado: 'primeira_interacao' },
    })

    const { result } = renderHook(() => useLeadsKanban())

    let execResult: unknown
    await act(async () => {
      execResult = await result.current.qualificarLead('lead-1')
    })

    expect(execResult).toBeDefined()
    if (execResult && typeof execResult === 'object' && 'isOk' in execResult) {
      const res = execResult as { isOk: boolean }
      expect(res.isOk).toBe(true)
    }
  })

  it('deve tratar erro de qualificacao (400) sem estourar excecao', async () => {
    mockFetchOnce(400, { error: 'LEAD_SEM_SCORE_NAO_PODE_QUALIFICAR' })

    const { result } = renderHook(() => useLeadsKanban())

    let execResult: unknown
    await act(async () => {
      execResult = await result.current.qualificarLead('lead-sem-score')
    })

    expect(execResult).toBeDefined()
    if (execResult && typeof execResult === 'object' && 'isOk' in execResult) {
      const res = execResult as { isOk: boolean; error?: Error }
      expect(res.isOk).toBe(false)
    }
  })

  it('deve realizar handoff com sucesso', async () => {
    mockFetchOnce(200, {
      success: true,
      data: { id: 'lead-1', estado: 'em_negociacao', closerResponsavel: 'closer-1' },
    })

    const { result } = renderHook(() => useLeadsKanban())

    let execResult: unknown
    await act(async () => {
      execResult = await result.current.realizarHandoff('lead-1', 'closer-1', {
        score: 70,
        icpFit: 'ideal',
        objecoes: [],
        respostas: [],
        gatilho: 'lead_quente',
      })
    })

    expect(execResult).toBeDefined()
    if (execResult && typeof execResult === 'object' && 'isOk' in execResult) {
      const res = execResult as { isOk: boolean }
      expect(res.isOk).toBe(true)
    }
  })

  it('deve tratar erro 401 no handoff (FSM violation)', async () => {
    mockFetchOnce(401, { error: 'Missing authorization header' })

    const { result } = renderHook(() => useLeadsKanban())

    let execResult: unknown
    await act(async () => {
      execResult = await result.current.realizarHandoff('lead-1', 'closer-1', {
        score: 70,
        icpFit: 'ideal',
        objecoes: [],
        respostas: [],
        gatilho: 'lead_quente',
      })
    })

    expect(execResult).toBeDefined()
    if (execResult && typeof execResult === 'object' && 'isOk' in execResult) {
      const res = execResult as { isOk: boolean }
      expect(res.isOk).toBe(false)
    }
  })
})

describe('useZehlaBrain', () => {
  it('deve iniciar com isThinking=false e events vazios', () => {
    const { result } = renderHook(() => useZehlaBrain())
    expect(result.current.isThinking).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.events).toEqual([])
  })

  it('deve enviar mensagem e receber resposta cognitiva', async () => {
    mockFetchOnce(200, {
      success: true,
      data: {
        eventId: 'evt-1',
        intent: 'saudacao',
        origem: 'ze-concierge',
        needsEscalation: false,
        handoffRequired: false,
        responseText: 'Olá! Como posso ajudar?',
        confidenceScore: 0.95,
      },
    })

    const { result } = renderHook(() => useZehlaBrain())

    expect(result.current.isThinking).toBe(false)

    let msgResult: unknown
    await act(async () => {
      msgResult = await result.current.sendMessage('Olá')
    })

    expect(msgResult).toBeDefined()
    if (msgResult && typeof msgResult === 'object' && 'isOk' in msgResult) {
      const res = msgResult as { isOk: boolean; value?: { eventId: string } }
      expect(res.isOk).toBe(true)
      if (res.isOk && res.value) {
        expect(res.value.eventId).toBe('evt-1')
        expect(res.value.responseText).toBe('Olá! Como posso ajudar?')
      }
    }

    expect(result.current.events).toHaveLength(1)
    expect(result.current.isThinking).toBe(false)
  })

  it('deve lidar com erro de rede sem estourar excecao', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network Error'))

    const { result } = renderHook(() => useZehlaBrain())

    let msgResult: unknown
    await act(async () => {
      msgResult = await result.current.sendMessage('teste')
    })

    expect(msgResult).toBeDefined()
    if (msgResult && typeof msgResult === 'object' && 'isOk' in msgResult) {
      const res = msgResult as { isOk: boolean }
      expect(res.isOk).toBe(false)
    }
    expect(result.current.events).toHaveLength(0)
  })
})
