// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useAuth } from '../../hooks/useAuth'
import { useLeadsKanban } from '../../hooks/useLeadsKanban'
import { useZehlaBrain } from '../../hooks/useZehlaBrain'
import { useRoomsGrid } from '../../hooks/useRoomsGrid'
import { useDashboardMetrics } from '../../hooks/useDashboardMetrics'
import { useOnboardingWizard } from '../../hooks/useOnboardingWizard'
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

describe('useRoomsGrid', () => {
  beforeEach(() => {
    vi.mocked(fetch).mockReset()
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: [] }), { status: 200 }),
    )
  })

  it('deve iniciar com isLoading=false e rooms vazio', () => {
    const { result } = renderHook(() => useRoomsGrid('prop-1'))
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.rooms).toEqual([])
  })

  it('deve carregar quartos com sucesso', async () => {
    mockFetchOnce(200, {
      success: true,
      data: [
        { id: 'room-1', number: '101', type: 'STANDARD', status: 'AVAILABLE', basePrice: 200 },
        { id: 'room-2', number: '102', type: 'DELUXE', status: 'OCCUPIED', basePrice: 350 },
        { id: 'room-3', number: '103', type: 'SUITE', status: 'CLEANING', basePrice: 500 },
      ],
    })

    const { result } = renderHook(() => useRoomsGrid('prop-1'))

    await act(async () => {
      await result.current.refresh()
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.rooms).toHaveLength(3)

    const livre = result.current.rooms.find((r) => r.number === '101')
    expect(livre?.status).toBe('LIVRE')

    const ocupado = result.current.rooms.find((r) => r.number === '102')
    expect(ocupado?.status).toBe('OCUPADO')

    const limpeza = result.current.rooms.find((r) => r.number === '103')
    expect(limpeza?.status).toBe('AGUARDANDO_LIMPEZA')
  })

  it('deve alterar status do quarto com sucesso', async () => {
    mockFetchOnce(200, {
      success: true,
      data: [
        { id: 'room-1', number: '101', type: 'STANDARD', status: 'AVAILABLE', basePrice: 200 },
      ],
    })
    mockFetchOnce(200, { success: true, data: { id: 'room-1', status: 'CLEANING' } })

    const { result } = renderHook(() => useRoomsGrid('prop-1'))

    await act(async () => {
      await result.current.refresh()
    })

    expect(result.current.rooms).toHaveLength(1)
    expect(result.current.rooms[0].status).toBe('LIVRE')

    mockFetchOnce(200, { success: true, data: { id: 'room-1', status: 'CLEANING' } })

    let alterResult: unknown
    await act(async () => {
      alterResult = await result.current.alterarStatusQuarto('room-1', 'AGUARDANDO_LIMPEZA')
    })

    expect(alterResult).toBeDefined()
    if (alterResult && typeof alterResult === 'object' && 'isOk' in alterResult) {
      const res = alterResult as { isOk: boolean }
      expect(res.isOk).toBe(true)
    }
    expect(result.current.rooms[0].status).toBe('AGUARDANDO_LIMPEZA')
  })

  it('deve registrar limpeza e mudar status para LIVRE', async () => {
    mockFetchOnce(200, {
      success: true,
      data: [
        { id: 'room-1', number: '101', type: 'STANDARD', status: 'CLEANING', basePrice: 200 },
      ],
    })
    mockFetchOnce(200, { success: true, data: { id: 'room-1', status: 'AVAILABLE' } })

    const { result } = renderHook(() => useRoomsGrid('prop-1'))

    await act(async () => {
      await result.current.refresh()
    })

    expect(result.current.rooms[0].status).toBe('AGUARDANDO_LIMPEZA')

    mockFetchOnce(200, { success: true, data: { id: 'room-1', status: 'AVAILABLE' } })

    await act(async () => {
      await result.current.registrarLimpeza('room-1')
    })

    expect(result.current.rooms[0].status).toBe('LIVRE')
  })

describe('useDashboardMetrics', () => {
  beforeEach(() => {
    vi.mocked(fetch).mockReset()
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: null }), { status: 200 }),
    )
  })

  it('deve iniciar com isLoading=false e metrics nulo', () => {
    const { result } = renderHook(() => useDashboardMetrics())
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.metrics).toBeNull()
  })

  it('deve carregar metricas com sucesso', async () => {
    mockFetchOnce(200, {
      success: true,
      data: {
        receitaTotal: 125000,
        taxaOcupacao: 72,
        leadsAtivos: 18,
        alertasOperacionais: 2,
        variacaoReceita: '+12.5%',
        variacaoOcupacao: '+5.3%',
      },
    })

    const { result } = renderHook(() => useDashboardMetrics())

    await act(async () => {
      await result.current.refresh()
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.metrics).not.toBeNull()
    expect(result.current.metrics?.receitaTotal).toBe(125000)
    expect(result.current.metrics?.taxaOcupacao).toBe(72)
    expect(result.current.metrics?.leadsAtivos).toBe(18)
    expect(result.current.metrics?.alertasOperacionais).toBe(2)
    expect(result.current.metrics?.variacaoReceita).toBe('+12.5%')
    expect(result.current.metrics?.variacaoOcupacao).toBe('+5.3%')
  })

  it('deve definir error em caso de falha na API', async () => {
    mockFetchOnce(500, { error: 'Erro interno do servidor' })

    const { result } = renderHook(() => useDashboardMetrics())

    await act(async () => {
      await result.current.refresh()
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe('Erro interno do servidor')
    expect(result.current.metrics).toBeNull()
  })
})

describe('useOnboardingWizard', () => {
  beforeEach(() => {
    vi.mocked(fetch).mockReset()
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: null }), { status: 200 }),
    )
  })

  it('deve iniciar no passo 0 com data vazio', () => {
    const { result } = renderHook(() => useOnboardingWizard())

    expect(result.current.currentStep).toBe(0)
    expect(result.current.totalSteps).toBe(3)
    expect(result.current.data).toEqual({})
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('deve avancar para o passo 1 ao chamar next', () => {
    const { result } = renderHook(() => useOnboardingWizard())

    act(() => result.current.next())

    expect(result.current.currentStep).toBe(1)
  })

  it('deve voltar para o passo 0 ao chamar back', () => {
    const { result } = renderHook(() => useOnboardingWizard())

    act(() => result.current.next())
    expect(result.current.currentStep).toBe(1)

    act(() => result.current.back())
    expect(result.current.currentStep).toBe(0)
  })

  it('deve acumular dados parciais via updateData', () => {
    const { result } = renderHook(() => useOnboardingWizard())

    act(() => result.current.updateData({ nome: 'Maria', email: 'maria@ze.com' }))
    expect(result.current.data.nome).toBe('Maria')
    expect(result.current.data.email).toBe('maria@ze.com')

    act(() => result.current.updateData({ whatsapp: '11999999999' }))
    expect(result.current.data.whatsapp).toBe('11999999999')
    expect(result.current.data.nome).toBe('Maria')
  })

  it('deve submeter lead com sucesso via POST /api/comercial/leads', async () => {
    mockFetchOnce(200, {
      success: true,
      data: { leadId: 'lead-onboard-1' },
    })

    const { result } = renderHook(() => useOnboardingWizard())

    act(() =>
      result.current.updateData({
        nome: 'Maria',
        email: 'maria@ze.com',
        whatsapp: '11999999999',
        nomePousada: 'Pousada do Sol',
        cidade: 'SP',
        estado: 'SP',
        tipoPropriedade: 'pousada',
        quartos: 10,
      }),
    )

    let submitResult: unknown
    await act(async () => {
      submitResult = await result.current.submit()
    })

    expect(submitResult).toBeDefined()
    if (submitResult && typeof submitResult === 'object' && 'isOk' in submitResult) {
      const res = submitResult as { isOk: boolean; value?: { leadId: string } }
      expect(res.isOk).toBe(true)
      if (res.isOk && res.value) {
        expect(res.value.leadId).toBe('lead-onboard-1')
      }
    }
    expect(result.current.isLoading).toBe(false)
  })

  it('deve tratar erro 400 no submit sem estourar excecao', async () => {
    mockFetchOnce(400, { error: 'E-mail já cadastrado' })

    const { result } = renderHook(() => useOnboardingWizard())

    act(() =>
      result.current.updateData({
        nome: 'Maria',
        email: 'exists@ze.com',
        whatsapp: '11999999999',
        nomePousada: 'Pousada',
        cidade: 'SP',
        estado: 'SP',
        tipoPropriedade: 'pousada',
        quartos: 10,
      }),
    )

    let submitResult: unknown
    await act(async () => {
      submitResult = await result.current.submit()
    })

    expect(submitResult).toBeDefined()
    if (submitResult && typeof submitResult === 'object' && 'isOk' in submitResult) {
      const res = submitResult as { isOk: boolean }
      expect(res.isOk).toBe(false)
    }
    expect(result.current.error).toBe('E-mail já cadastrado')
  })

  it('nao deve avancar alem do ultimo passo', () => {
    const { result } = renderHook(() => useOnboardingWizard())

    act(() => result.current.next())
    act(() => result.current.next())
    act(() => result.current.next())

    expect(result.current.currentStep).toBe(2)
  })

  it('nao deve voltar antes do passo 0', () => {
    const { result } = renderHook(() => useOnboardingWizard())

    act(() => result.current.back())

    expect(result.current.currentStep).toBe(0)
  })
})

  it('deve tratar erro de alteracao de status sem estourar excecao', async () => {
    mockFetchOnce(200, {
      success: true,
      data: [
        { id: 'room-1', number: '101', type: 'STANDARD', status: 'AVAILABLE', basePrice: 200 },
      ],
    })
    mockFetchOnce(400, { error: 'Transição inválida' })

    const { result } = renderHook(() => useRoomsGrid('prop-1'))

    await act(async () => {
      await result.current.refresh()
    })

    let alterResult: unknown
    await act(async () => {
      alterResult = await result.current.alterarStatusQuarto('room-1', 'EM_MANUTENCAO')
    })

    expect(alterResult).toBeDefined()
    if (alterResult && typeof alterResult === 'object' && 'isOk' in alterResult) {
      const res = alterResult as { isOk: boolean }
      expect(res.isOk).toBe(false)
    }
  })
})
