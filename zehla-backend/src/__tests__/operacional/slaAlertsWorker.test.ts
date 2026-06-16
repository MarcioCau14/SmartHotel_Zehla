import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getBasePrisma } from '../../lib/prisma'
import { sendWhatsAppAlert } from '../../lib/notifications'
import { redisWorker } from '../../lib/redis'

// Mock de notificações e redis para evitar efeitos colaterais
vi.mock('../../lib/notifications', () => ({
  sendWhatsAppAlert: vi.fn().mockResolvedValue(true),
}))

vi.mock('../../lib/redis', () => ({
  redisWorker: {
    get: vi.fn().mockResolvedValue(null),
    setex: vi.fn().mockResolvedValue('OK'),
  },
}))

// Mock do prisma
vi.mock('../../lib/prisma', () => {
  const mockPrisma = {
    property: {
      findMany: vi.fn(),
    },
    systemLog: {
      create: vi.fn().mockResolvedValue({}),
    },
  }
  return {
    getBasePrisma: () => mockPrisma,
  }
})

// Mocks dos repositórios
const mockListarTarefas = vi.fn()
const mockListarAtivosSlas = vi.fn()

vi.mock('../../infrastructure/persistence/operacional/PrismaTarefaRepository', () => {
  return {
    PrismaTarefaRepository: class {
      constructor() {}
      listarTarefasPorPropriedade = mockListarTarefas
    }
  }
})

vi.mock('../../infrastructure/persistence/operacional/PrismaSlaRepository', () => {
  return {
    PrismaSlaRepository: class {
      constructor() {}
      listarAtivos = mockListarAtivosSlas
    }
  }
})

describe('slaAlertsWorker — Maintenance SLA Alarms', () => {
  const prismaMock = getBasePrisma() as any

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should process active properties, detect overdue tasks, and send WhatsApp alerts', async () => {
    // 1. Configura mocks
    prismaMock.property.findMany.mockResolvedValue([
      { id: 'prop_active', name: 'Pousada Active', status: 'ACTIVE' },
    ])

    // Mock Tarefa atrasada (criada há 5 horas, prazo de 2 horas)
    const dataCriacaoAtrasada = new Date()
    dataCriacaoAtrasada.setHours(dataCriacaoAtrasada.getHours() - 5)

    const dataLimiteAtrasada = new Date(dataCriacaoAtrasada.getTime() + 2 * 60 * 60 * 1000)

    const mockTarefaAtrasada = {
      id: 'task_overdue_1',
      tipo: 'manutencao',
      titulo: 'Vazamento Pia Quarto 102',
      prioridade: { value: 'media' },
      status: 'pendente',
      dataCriacao: dataCriacaoAtrasada,
      dataLimite: dataLimiteAtrasada,
    }

    mockListarTarefas.mockResolvedValue({
      isOk: true,
      value: [mockTarefaAtrasada],
    })

    mockListarAtivosSlas.mockResolvedValue({
      isOk: true,
      value: [
        {
          tipoTarefa: 'manutencao',
          prioridade: { value: 'media' },
          prazoHoras: 2,
          limiteDeAlerta: 0.8 * 120, // 80% do tempo do SLA
          calcularDataLimite: (partida: Date) => new Date(partida.getTime() + 2 * 60 * 60 * 1000),
        },
      ],
    })

    // Importa dinamicamente para aplicar mocks
    const { processSlaAlertsJob } = await import('../../workers/slaAlertsWorker')

    // 2. Executa a função do Worker diretamente
    const processResult = await processSlaAlertsJob({
      name: 'CHECK_SLA',
      data: {},
    } as any)

    // 3. Asserções
    expect(processResult.success).toBe(true)
    expect(processResult.alertsSent).toBe(1)
    expect(sendWhatsAppAlert).toHaveBeenCalledWith(
      expect.stringContaining('⚠️ [ALERTA SLA - ATRASADA] A tarefa "Vazamento Pia Quarto 102"')
    )
    expect(prismaMock.systemLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          level: 'ERROR',
          component: 'ZE-OPS',
        }),
      })
    )
    expect(redisWorker.setex).toHaveBeenCalledWith(
      'sla_alert_sent:task_overdue_1:overdue',
      86400,
      'true'
    )
  })
})
