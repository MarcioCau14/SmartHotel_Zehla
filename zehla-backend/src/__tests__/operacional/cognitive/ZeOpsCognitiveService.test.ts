import { describe, it, expect, beforeEach } from 'vitest'
import { createHmac } from 'crypto'
import { ZeOpsCognitiveService } from '../../../application/operacional/cognitive/ZeOpsCognitiveService'
import { ZeOpsInput } from '../../../application/operacional/cognitive/ZeOpsCognitiveTypes'
import { TarefaInMemoryRepository } from '../../../infrastructure/persistence/operacional/TarefaInMemoryRepository'
import { StaffInMemoryRepository } from '../../../infrastructure/persistence/operacional/StaffInMemoryRepository'
import { ManutencaoInMemoryRepository } from '../../../infrastructure/persistence/operacional/ManutencaoInMemoryRepository'
import { FornecedorInMemoryRepository } from '../../../infrastructure/persistence/operacional/FornecedorInMemoryRepository'
import { ChecklistInMemoryRepository } from '../../../infrastructure/persistence/operacional/ChecklistInMemoryRepository'
import { SlaInMemoryRepository } from '../../../infrastructure/persistence/operacional/SlaInMemoryRepository'
import { CriarTarefaUseCase } from '../../../application/operacional/use-cases/CriarTarefaUseCase'
import { IniciarTarefaUseCase } from '../../../application/operacional/use-cases/IniciarTarefaUseCase'
import { ConcluirTarefaUseCase } from '../../../application/operacional/use-cases/ConcluirTarefaUseCase'
import { AbrirManutencaoUseCase } from '../../../application/operacional/use-cases/AbrirManutencaoUseCase'
import { ProcessarWebhookFornecedorUseCase } from '../../../application/operacional/use-cases/ProcessarWebhookFornecedorUseCase'
import { CalcularMetricasSlaUseCase } from '../../../application/operacional/use-cases/CalcularMetricasSlaUseCase'
import { ProcessarTarefasAtrasadasUseCase } from '../../../application/operacional/use-cases/ProcessarTarefasAtrasadasUseCase'
import { ExecutarChecklistUseCase } from '../../../application/operacional/use-cases/ExecutarChecklistUseCase'
import { Prioridade } from '../../../domain/operacional/value-objects/Prioridade'

const ZCP_SECRET = 'zcp-test-secret-zehla-ops'
const WEBHOOK_SECRET = 'whsec_test_fornecedor_001'

describe('ZeOpsCognitiveService', () => {
  let tarefaRepo: TarefaInMemoryRepository
  let staffRepo: StaffInMemoryRepository
  let manutencaoRepo: ManutencaoInMemoryRepository
  let fornecedorRepo: FornecedorInMemoryRepository
  let checklistRepo: ChecklistInMemoryRepository
  let slaRepo: SlaInMemoryRepository
  let service: ZeOpsCognitiveService
  let staffId: string
  let fornecedorId: string

  function makeInput(intent: ZeOpsInput['intent'], overrides: Partial<ZeOpsInput> = {}): ZeOpsInput {
    return {
      intent,
      messageId: `msg-${Date.now()}-${Math.random()}`,
      propriedadeId: 'prop_seed',
      payload: {},
      ...overrides,
    }
  }

  beforeEach(async () => {
    tarefaRepo = new TarefaInMemoryRepository()
    staffRepo = new StaffInMemoryRepository()
    manutencaoRepo = new ManutencaoInMemoryRepository()
    fornecedorRepo = new FornecedorInMemoryRepository()
    checklistRepo = new ChecklistInMemoryRepository()
    slaRepo = new SlaInMemoryRepository()

    const staffResult = await staffRepo.criarStaff({
      propriedadeId: 'prop_seed', nome: 'Pedro Ops',
      cargo: 'camareira', turno: 'matutino',
    })
    if (staffResult.isFail) throw new Error('Failed to create staff')
    staffId = staffResult.value.id

    const fornResult = await fornecedorRepo.criarFornecedor({
      razaoSocial: 'Fornecedor Teste Ltda',
      cnpj: '11222333000181',
      nomeContato: 'Contato Teste',
      emailContato: 'contato@teste.com',
      telefoneContato: '11999999999',
      especialidades: ['hidraulica', 'eletrica'],
      webhookUrl: 'https://teste.com/webhook',
      webhookSecret: WEBHOOK_SECRET,
    })
    if (fornResult.isFail) throw new Error('Failed to create fornecedor')
    fornecedorId = fornResult.value.id

    const criarTarefaUC = new CriarTarefaUseCase(tarefaRepo, staffRepo, slaRepo)
    const iniciarTarefaUC = new IniciarTarefaUseCase(tarefaRepo, staffRepo, manutencaoRepo)
    const concluirTarefaUC = new ConcluirTarefaUseCase(tarefaRepo, staffRepo, manutencaoRepo, checklistRepo)
    const abrirManutencaoUC = new AbrirManutencaoUseCase(tarefaRepo, manutencaoRepo, fornecedorRepo, staffRepo, slaRepo)
    const processarWebhookUC = new ProcessarWebhookFornecedorUseCase(fornecedorRepo, manutencaoRepo)
    const calcularMetricasSlaUC = new CalcularMetricasSlaUseCase(tarefaRepo, slaRepo)
    const processarAtrasadasUC = new ProcessarTarefasAtrasadasUseCase(tarefaRepo)
    const executarChecklistUC = new ExecutarChecklistUseCase(checklistRepo)

    service = new ZeOpsCognitiveService(
      tarefaRepo, staffRepo, manutencaoRepo, fornecedorRepo, slaRepo, checklistRepo,
      criarTarefaUC, iniciarTarefaUC, concluirTarefaUC, abrirManutencaoUC,
      processarWebhookUC, calcularMetricasSlaUC, processarAtrasadasUC, executarChecklistUC,
      ZCP_SECRET,
    )
  })

  it('should create a new tarefa', async () => {
    const output = await service.processIntent(makeInput('CRIAR_TAREFA', {
      payload: {
        tipo: 'limpeza', titulo: 'Limpeza quarto 101',
        descricao: 'Limpeza completa',
      },
    }))
    expect(output.success).toBe(true)
    expect(output.data).toHaveProperty('tarefaId')
  })

  it('should reject tarefa with invalid tipo', async () => {
    const output = await service.processIntent(makeInput('CRIAR_TAREFA', {
      payload: { tipo: 'invalido', titulo: 'Teste' },
    }))
    expect(output.success).toBe(false)
  })

  it('should create and then iniciar a tarefa', async () => {
    const criada = await service.processIntent(makeInput('CRIAR_TAREFA', {
      payload: { tipo: 'limpeza', titulo: 'Limpeza quarto 102' },
    }))
    expect(criada.success).toBe(true)
    const tarefaId = (criada.data as any).tarefaId as string

    const output = await service.processIntent(makeInput('INICIAR_TAREFA', {
      payload: { tarefaId, responsavelId: staffId, tipoResponsavel: 'staff' },
    }))
    expect(output.success).toBe(true)
  })

  it('should create, iniciar and concluir a tarefa', async () => {
    const criada = await service.processIntent(makeInput('CRIAR_TAREFA', {
      payload: { tipo: 'limpeza', titulo: 'Limpeza quarto 103' },
    }))
    expect(criada.success).toBe(true)
    const tarefaId = (criada.data as any).tarefaId as string

    await service.processIntent(makeInput('INICIAR_TAREFA', {
      payload: { tarefaId, responsavelId: staffId, tipoResponsavel: 'staff' },
    }))

    const output = await service.processIntent(makeInput('CONCLUIR_TAREFA', {
      payload: { tarefaId, observacoes: 'Tudo limpo e organizado.' },
    }))
    expect(output.success).toBe(true)
  })

  it('should reject iniciar tarefa without tarefaId', async () => {
    const output = await service.processIntent(makeInput('INICIAR_TAREFA', {
      payload: { responsavelId: staffId, tipoResponsavel: 'staff' },
    }))
    expect(output.success).toBe(false)
  })

  it('should open a manutencao successfully', async () => {
    const output = await service.processIntent(makeInput('ABRIR_MANUTENCAO', {
      payload: {
        tipo: 'corretiva', gravidade: 'media', categoria: 'hidraulica',
        descricaoProblema: 'Torneira pingando',
      },
    }))
    expect(output.success).toBe(true)
    expect(output.data).toHaveProperty('tarefaId')
    expect(output.data).toHaveProperty('manutencaoId')
  })

  it('should trigger Circuit Breaker on 3rd severa interdiction', async () => {
    for (let i = 0; i < 2; i++) {
      const r = await service.processIntent(makeInput('ABRIR_MANUTENCAO', {
        payload: {
          tipo: 'corretiva', gravidade: 'severa', categoria: 'hidraulica',
          ativoId: `quarto_${100 + i}`, tipoAtivo: 'quarto',
          descricaoProblema: `Vazamento severo ${i + 1}`,
        },
      }))
      expect(r.success).toBe(true)
    }

    const output = await service.processIntent(makeInput('ABRIR_MANUTENCAO', {
      payload: {
        tipo: 'corretiva', gravidade: 'severa', categoria: 'eletrica',
        ativoId: 'quarto_201', tipoAtivo: 'quarto',
        descricaoProblema: 'Curto circuito severo',
      },
    }))
    expect(output.success).toBe(true)
    expect(output.needsEscalation).toBe(true)
    expect(output.handoffRequired).toBe(true)
    expect(output.handoffTo).toBe('ze-host')
    expect(output.data).toHaveProperty('handoff')
  })

  it('should reject manutencao without required fields', async () => {
    const output = await service.processIntent(makeInput('ABRIR_MANUTENCAO', {
      payload: { tipo: 'corretiva' },
    }))
    expect(output.success).toBe(false)
  })

  it('should process webhook with valid HMAC signature', async () => {
    const manOutput = await service.processIntent(makeInput('ABRIR_MANUTENCAO', {
      payload: {
        tipo: 'corretiva', gravidade: 'media', categoria: 'eletrica',
        fornecedorId,
        descricaoProblema: 'Tomada com defeito',
      },
    }))
    expect(manOutput.success).toBe(true)
    const manutencaoId = (manOutput.data as any).manutencaoId as string

    const payload = { status: 'a_caminho', timestamp: new Date().toISOString() }
    const payloadStr = JSON.stringify(payload)
    const signature = createHmac('sha256', WEBHOOK_SECRET).update(payloadStr).digest('hex')

    const output = await service.processIntent(makeInput('PROCESSAR_WEBHOOK', {
      payload: {
        fornecedorId, manutencaoId, acao: 'a_caminho',
        payload, signature,
      },
    }))
    expect(output.success).toBe(true)
  })

  it('should reject webhook without HMAC signature (ZCP Shield)', async () => {
    const manOutput = await service.processIntent(makeInput('ABRIR_MANUTENCAO', {
      payload: {
        tipo: 'corretiva', gravidade: 'media', categoria: 'eletrica',
        fornecedorId,
        descricaoProblema: 'Problema elétrico',
      },
    }))
    expect(manOutput.success).toBe(true)
    const manutencaoId = (manOutput.data as any).manutencaoId as string

    const output = await service.processIntent(makeInput('PROCESSAR_WEBHOOK', {
      payload: {
        fornecedorId, manutencaoId, acao: 'em_andamento',
        payload: {},
      },
    }))
    expect(output.success).toBe(false)
    expect(output.responseText).toContain('HMAC')
  })

  it('should reject webhook with invalid HMAC signature', async () => {
    const manOutput = await service.processIntent(makeInput('ABRIR_MANUTENCAO', {
      payload: {
        tipo: 'corretiva', gravidade: 'media', categoria: 'eletrica',
        fornecedorId,
        descricaoProblema: 'Problema elétrico 2',
      },
    }))
    expect(manOutput.success).toBe(true)
    const manutencaoId = (manOutput.data as any).manutencaoId as string

    const payload = { status: 'concluido' }
    const wrongSignature = createHmac('sha256', 'wrong-secret').update(JSON.stringify(payload)).digest('hex')

    const output = await service.processIntent(makeInput('PROCESSAR_WEBHOOK', {
      payload: {
        fornecedorId, manutencaoId, acao: 'concluido',
        payload, signature: wrongSignature,
      },
    }))
    expect(output.success).toBe(false)
    expect(output.responseText).toContain('HMAC')
  })

  it('should calculate SLA metrics', async () => {
    await slaRepo.criarSla({
      tipoTarefa: 'limpeza', prioridade: Prioridade.media(), prazoHoras: 24,
    })

    const tarefaCriada = await service.processIntent(makeInput('CRIAR_TAREFA', {
      payload: { tipo: 'limpeza', titulo: 'Limpeza SLA test' },
    }))
    expect(tarefaCriada.success).toBe(true)
    const tarefaId = (tarefaCriada.data as any).tarefaId as string

    await tarefaRepo.atualizarTarefa(tarefaId, 'prop_seed', {
      status: 'concluida', dataConclusao: new Date(),
    })

    const output = await service.processIntent(makeInput('CALCULAR_METRICAS_SLA', {
      payload: {
        dataInicio: new Date(Date.now() - 86400000).toISOString(),
        dataFim: new Date(Date.now() + 86400000).toISOString(),
      },
    }))
    expect(output.success).toBe(true)
    expect(output.data).toHaveProperty('taxaCumprimento')
  })

  it('should processar tarefas atrasadas', async () => {
    await service.processIntent(makeInput('CRIAR_TAREFA', {
      payload: { tipo: 'limpeza', titulo: 'Tarefa antiga' },
    }))

    const output = await service.processIntent(makeInput('PROCESSAR_TAREFAS_ATRASADAS'))
    expect(output.success).toBe(true)
    expect(output.data).toHaveProperty('tarefasAtrasadas')
  })

  it('should execute checklist actions', async () => {
    const checklistResult = await checklistRepo.criarChecklist({
      propriedadeId: 'prop_seed',
      nome: 'Checklist Teste',
      tipoTrigger: 'checkin',
      itens: [
        { itemId: 'item_1', descricao: 'Verificar ar condicionado', obrigatorio: true, concluido: false },
        { itemId: 'item_2', descricao: 'Verificar TV', obrigatorio: false, concluido: false },
      ],
    })
    expect(checklistResult.isOk).toBe(true)
    const checklistId = checklistResult.value.id

    const iniciar = await service.processIntent(makeInput('EXECUTAR_CHECKLIST', {
      payload: { checklistId, acao: 'iniciar' },
    }))
    expect(iniciar.success).toBe(true)

    const concluirItem = await service.processIntent(makeInput('EXECUTAR_CHECKLIST', {
      payload: { checklistId, acao: 'concluir_item', itemId: 'item_1' },
    }))
    expect(concluirItem.success).toBe(true)

    const concluir = await service.processIntent(makeInput('EXECUTAR_CHECKLIST', {
      payload: { checklistId, acao: 'concluir' },
    }))
    expect(concluir.success).toBe(true)
    expect(concluir.data).toHaveProperty('itens')
  })

  it('should reject unknown intent', async () => {
    const output = await service.processIntent({
      intent: 'UNKNOWN_INTENT' as any,
      messageId: 'msg-test',
      propriedadeId: 'prop_seed',
      payload: {},
    })
    expect(output.success).toBe(false)
  })

  it('should create a valid ZCP handoff to Ze-Host', () => {
    const handoff = service.requestHandoff({
      destino: 'ze-host',
      contexto: 'Manutenção requer aprovação humana.',
      motivo: 'Circuit Breaker ativado - 3ª interdição severa.',
      payload: { manutencaoId: 'man_001', tarefaId: 'tar_001' },
    })
    expect(handoff.packageId).toBeTruthy()
    expect(handoff.origem).toBe('ze-ops')
    expect(handoff.destino).toBe('ze-host')
    expect(handoff.zcpSignature).toBeTruthy()
  })
})
