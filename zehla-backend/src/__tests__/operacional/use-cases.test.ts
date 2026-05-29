import { describe, it, expect, beforeEach } from 'vitest'
import { Result } from '../../../src/shared/Result'
import { Prioridade } from '../../../src/domain/operacional/value-objects/Prioridade'
import { Gravidade } from '../../../src/domain/operacional/value-objects/Gravidade'
import { TarefaInMemoryRepository } from '../../../src/infrastructure/persistence/operacional/TarefaInMemoryRepository'
import { ManutencaoInMemoryRepository } from '../../../src/infrastructure/persistence/operacional/ManutencaoInMemoryRepository'
import { StaffInMemoryRepository } from '../../../src/infrastructure/persistence/operacional/StaffInMemoryRepository'
import { FornecedorInMemoryRepository } from '../../../src/infrastructure/persistence/operacional/FornecedorInMemoryRepository'
import { ChecklistInMemoryRepository } from '../../../src/infrastructure/persistence/operacional/ChecklistInMemoryRepository'
import { SlaInMemoryRepository } from '../../../src/infrastructure/persistence/operacional/SlaInMemoryRepository'
import { CriarTarefaUseCase } from '../../../src/application/operacional/use-cases/CriarTarefaUseCase'
import { IniciarTarefaUseCase } from '../../../src/application/operacional/use-cases/IniciarTarefaUseCase'
import { ConcluirTarefaUseCase } from '../../../src/application/operacional/use-cases/ConcluirTarefaUseCase'
import { AbrirManutencaoUseCase } from '../../../src/application/operacional/use-cases/AbrirManutencaoUseCase'
import { ProcessarWebhookFornecedorUseCase } from '../../../src/application/operacional/use-cases/ProcessarWebhookFornecedorUseCase'
import { CalcularMetricasSlaUseCase } from '../../../src/application/operacional/use-cases/CalcularMetricasSlaUseCase'
import { ProcessarTarefasAtrasadasUseCase } from '../../../src/application/operacional/use-cases/ProcessarTarefasAtrasadasUseCase'
import { ExecutarChecklistUseCase } from '../../../src/application/operacional/use-cases/ExecutarChecklistUseCase'
import * as crypto from 'crypto'

describe('AbrirManutencaoUseCase — Circuit Breaker', () => {
  let tarefaRepo: TarefaInMemoryRepository
  let manutencaoRepo: ManutencaoInMemoryRepository
  let staffRepo: StaffInMemoryRepository
  let fornecedorRepo: FornecedorInMemoryRepository
  let slaRepo: SlaInMemoryRepository
  let useCase: AbrirManutencaoUseCase

  beforeEach(async () => {
    tarefaRepo = new TarefaInMemoryRepository()
    manutencaoRepo = new ManutencaoInMemoryRepository()
    staffRepo = new StaffInMemoryRepository()
    fornecedorRepo = new FornecedorInMemoryRepository()
    slaRepo = new SlaInMemoryRepository()

    useCase = new AbrirManutencaoUseCase(
      tarefaRepo, manutencaoRepo, fornecedorRepo, staffRepo, slaRepo,
    )
  })

  it('should create manutencao without interdicao if gravidade is media', async () => {
    const result = await useCase.execute({
      propriedadeId: 'prop_seed',
      tipo: 'corretiva',
      gravidade: 'media',
      categoria: 'hidraulica',
      descricaoProblema: 'Torneira pingando',
    })
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.manutencao.interditaQuarto).toBe(false)
      expect(result.value.requerAprovacaoHumana).toBe(false)
    }
  })

  it('should interditar quarto on first severa', async () => {
    const result = await useCase.execute({
      propriedadeId: 'prop_seed',
      tipo: 'corretiva',
      gravidade: 'severa',
      categoria: 'hidraulica',
      ativoId: 'quarto_101',
      tipoAtivo: 'quarto',
      descricaoProblema: 'Vazamento severo no banheiro',
    })
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.manutencao.interditaQuarto).toBe(true)
      expect(result.value.requerAprovacaoHumana).toBe(false)
    }
  })

  it('should block 3rd interdicao with HUMAN_OVERWATCH_REQUIRED', async () => {
    await useCase.execute({
      propriedadeId: 'prop_seed', tipo: 'corretiva', gravidade: 'severa',
      categoria: 'hidraulica', ativoId: 'quarto_101', tipoAtivo: 'quarto',
      descricaoProblema: 'Vazamento severo 1',
    })

    await useCase.execute({
      propriedadeId: 'prop_seed', tipo: 'corretiva', gravidade: 'severa',
      categoria: 'eletrica', ativoId: 'quarto_102', tipoAtivo: 'quarto',
      descricaoProblema: 'Curto circuito severo',
    })

    const result = await useCase.execute({
      propriedadeId: 'prop_seed', tipo: 'corretiva', gravidade: 'severa',
      categoria: 'estrutura', ativoId: 'quarto_103', tipoAtivo: 'quarto',
      descricaoProblema: 'Infiltração severa',
    })
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.manutencao.interditaQuarto).toBe(true)
      expect(result.value.requerAprovacaoHumana).toBe(true)
    }
  })

  it('should reject manutencao with fornecedor suspenso', async () => {
    const forn = await fornecedorRepo.criarFornecedor({
      razaoSocial: 'Teste', cnpj: '11222333000181',
      nomeContato: 'Teste', emailContato: 'teste@test.com',
      telefoneContato: '11999999999',
    })
    expect(forn.isOk).toBe(true)
    if (forn.isOk) await fornecedorRepo.suspenderFornecedor(forn.value.id)

    const result = await useCase.execute({
      propriedadeId: 'prop_seed', tipo: 'corretiva', gravidade: 'media',
      categoria: 'hidraulica', descricaoProblema: 'Teste',
      fornecedorId: forn.value!.id,
    })
    expect(result.isFail).toBe(true)
  })
})

describe('ProcessarWebhookFornecedorUseCase — HMAC Security', () => {
  let tarefaRepo: TarefaInMemoryRepository
  let manutencaoRepo: ManutencaoInMemoryRepository
  let fornecedorRepo: FornecedorInMemoryRepository
  let useCase: ProcessarWebhookFornecedorUseCase

  beforeEach(async () => {
    tarefaRepo = new TarefaInMemoryRepository()
    manutencaoRepo = new ManutencaoInMemoryRepository()
    fornecedorRepo = new FornecedorInMemoryRepository()
    useCase = new ProcessarWebhookFornecedorUseCase(fornecedorRepo, manutencaoRepo)
  })

  it('should reject webhook without HMAC signature', async () => {
    const result = await useCase.execute({
      fornecedorId: 'forn_001',
      manutencaoId: 'manut_001',
      propriedadeId: 'prop_seed',
      acao: 'concluido',
      payload: {},
    })
    expect(result.isFail).toBe(true)
  })

  it('should process valid webhook with correct HMAC', async () => {
    const forn = await fornecedorRepo.criarFornecedor({
      razaoSocial: 'Hidro Tech', cnpj: '11222333000181',
      nomeContato: 'Teste', emailContato: 'test@test.com',
      telefoneContato: '11999999999',
      webhookUrl: 'https://hook.test.com',
      webhookSecret: 'segredo_hmac_123',
    })
    expect(forn.isOk).toBe(true)
    const fornId = forn.value!.id

    const tarefa = await tarefaRepo.criarTarefa({
      tipo: 'manutencao', propriedadeId: 'prop_seed',
      titulo: 'Manutenção Teste', prioridade: Prioridade.media(),
    })
    const manutencaoCreate = ManutencaoInMemoryRepository.prototype
    const gravidade = Gravidade.media()
    const manutencao = await manutencaoRepo.criarManutencao({
      tarefaId: tarefa.value!.id, propriedadeId: 'prop_seed',
      tipo: 'corretiva', gravidade, categoria: 'hidraulica',
      descricaoProblema: 'Teste',
    })
    expect(manutencao.isOk).toBe(true)
    const manutId = manutencao.value!.id

    const payload = { manutencaoId: manutId, acao: 'concluido' }
    const signature = crypto.createHmac('sha256', 'segredo_hmac_123')
      .update(JSON.stringify(payload))
      .digest('hex')

    const result = await useCase.execute({
      fornecedorId: fornId,
      manutencaoId: manutId,
      propriedadeId: 'prop_seed',
      acao: 'concluido',
      payload,
      signature,
    })
    expect(result.isOk).toBe(true)
    expect(result.value).toBe(true)
  })

  it('should reject webhook with invalid HMAC signature', async () => {
    const forn = await fornecedorRepo.criarFornecedor({
      razaoSocial: 'Hidro Tech', cnpj: '11222333000181',
      nomeContato: 'Teste', emailContato: 'test@test.com',
      telefoneContato: '11999999999',
      webhookUrl: 'https://hook.test.com',
      webhookSecret: 'segredo_hmac_123',
    })
    const fornId = forn.value!.id

    const tarefa = await tarefaRepo.criarTarefa({
      tipo: 'manutencao', propriedadeId: 'prop_seed',
      titulo: 'Manutenção Teste', prioridade: Prioridade.media(),
    })
    const gravidade = Gravidade.media()
    const manutencao = await manutencaoRepo.criarManutencao({
      tarefaId: tarefa.value!.id, propriedadeId: 'prop_seed',
      tipo: 'corretiva', gravidade, categoria: 'hidraulica',
      descricaoProblema: 'Teste',
    })
    const manutId = manutencao.value!.id

    const payload = { manutencaoId: manutId, acao: 'concluido' }
    const signature = crypto.createHmac('sha256', 'WRONG_secret')
      .update(JSON.stringify(payload))
      .digest('hex')

    const result = await useCase.execute({
      fornecedorId: fornId,
      manutencaoId: manutId,
      propriedadeId: 'prop_seed',
      acao: 'concluido',
      payload,
      signature,
    })
    expect(result.isFail).toBe(true)
  })
})

describe('ExecutarChecklistUseCase', () => {
  let checklistRepo: ChecklistInMemoryRepository
  let useCase: ExecutarChecklistUseCase

  beforeEach(async () => {
    checklistRepo = new ChecklistInMemoryRepository()
    useCase = new ExecutarChecklistUseCase(checklistRepo)
  })

  it('should execute complete checklist flow', async () => {
    const criado = await checklistRepo.criarChecklist({
      propriedadeId: 'prop_seed',
      nome: 'Checkout 101',
      tipoTrigger: 'checkout',
      ativoId: 'quarto_101',
      itens: [
        { itemId: 'i1', descricao: 'Limpar', obrigatorio: true, concluido: false },
      ],
    })
    expect(criado.isOk).toBe(true)
    const clId = criado.value!.id

    const iniciado = await useCase.execute({
      checklistId: clId, propriedadeId: 'prop_seed', acao: 'iniciar',
    })
    expect(iniciado.isOk).toBe(true)
    if (iniciado.isOk) expect(iniciado.value.status).toBe('em_andamento')

    const itemOk = await useCase.execute({
      checklistId: clId, propriedadeId: 'prop_seed', acao: 'concluir_item', itemId: 'i1',
    })
    expect(itemOk.isOk).toBe(true)

    const concluido = await useCase.execute({
      checklistId: clId, propriedadeId: 'prop_seed', acao: 'concluir',
    })
    expect(concluido.isOk).toBe(true)
    if (concluido.isOk) expect(concluido.value.status).toBe('concluido')
  })
})

describe('CriarTarefaUseCase', () => {
  let tarefaRepo: TarefaInMemoryRepository
  let staffRepo: StaffInMemoryRepository
  let slaRepo: SlaInMemoryRepository
  let useCase: CriarTarefaUseCase

  beforeEach(async () => {
    tarefaRepo = new TarefaInMemoryRepository()
    staffRepo = new StaffInMemoryRepository()
    slaRepo = new SlaInMemoryRepository()
    useCase = new CriarTarefaUseCase(tarefaRepo, staffRepo, slaRepo)
  })

  it('should create tarefa with SLA deadline', async () => {
    await slaRepo.criarSla({
      tipoTarefa: 'limpeza', prioridade: Prioridade.media(), prazoHoras: 4,
    })

    const result = await useCase.execute({
      tipo: 'limpeza', propriedadeId: 'prop_seed',
      titulo: 'Limpeza quarto 101',
    })
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.titulo).toBe('Limpeza quarto 101')
      expect(result.value.dataLimite).toBeDefined()
    }
  })

  it('should reject tarefa with staff at max tasks', async () => {
    const staff = await staffRepo.criarStaff({
      propriedadeId: 'prop_seed', nome: 'Staff Teste',
      cargo: 'camareira', turno: 'matutino',
    })
    const staffId = staff.value!.id

    await staffRepo.atualizarStaff(staffId, 'prop_seed', { tarefasEmAndamento: 3 })

    const result = await useCase.execute({
      tipo: 'limpeza', propriedadeId: 'prop_seed',
      titulo: 'Limpeza quarto 102',
      responsavelId: staffId, tipoResponsavel: 'staff',
    })
    expect(result.isFail).toBe(true)
  })
})

describe('CalcularMetricasSlaUseCase', () => {
  let tarefaRepo: TarefaInMemoryRepository
  let slaRepo: SlaInMemoryRepository
  let useCase: CalcularMetricasSlaUseCase

  beforeEach(async () => {
    tarefaRepo = new TarefaInMemoryRepository()
    slaRepo = new SlaInMemoryRepository()
    useCase = new CalcularMetricasSlaUseCase(tarefaRepo, slaRepo)
  })

  it('should calculate SLA metrics for period', async () => {
    await slaRepo.criarSla({
      tipoTarefa: 'limpeza', prioridade: Prioridade.media(), prazoHoras: 24,
    })

    const tarefa = await tarefaRepo.criarTarefa({
      tipo: 'limpeza', propriedadeId: 'prop_seed',
      titulo: 'Limpeza', prioridade: Prioridade.media(),
    })
    if (tarefa.isOk && tarefa.value) {
      await tarefaRepo.atualizarTarefa(tarefa.value.id, 'prop_seed', {
        status: 'concluida', dataConclusao: new Date(),
      })
    }

    const metrics = await useCase.execute({
      propriedadeId: 'prop_seed',
      dataInicio: new Date(Date.now() - 86400000),
      dataFim: new Date(Date.now() + 86400000),
    })
    expect(metrics.isOk).toBe(true)
    if (metrics.isOk) {
      expect(metrics.value.total).toBe(1)
      expect(metrics.value.taxaCumprimento).toBeGreaterThanOrEqual(0)
    }
  })
})

describe('ProcessarTarefasAtrasadasUseCase', () => {
  let tarefaRepo: TarefaInMemoryRepository
  let useCase: ProcessarTarefasAtrasadasUseCase

  beforeEach(() => {
    tarefaRepo = new TarefaInMemoryRepository()
    useCase = new ProcessarTarefasAtrasadasUseCase(tarefaRepo)
  })

  it('should find atrasada tarefa', async () => {
    const doisDiasAtras = new Date(Date.now() - 2 * 86400000)
    const ontem = new Date(Date.now() - 86400000)
    await tarefaRepo.criarTarefa({
      tipo: 'limpeza', propriedadeId: 'prop_seed',
      titulo: 'Tarefa atrasada', prioridade: Prioridade.media(),
      dataLimite: ontem, dataCriacao: doisDiasAtras,
    })

    const result = await useCase.execute('prop_seed')
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.length).toBe(1)
      expect(result.value[0].estaAtrasada).toBe(true)
    }
  })

  it('should return empty for no atrasadas', async () => {
    const result = await useCase.execute('prop_seed')
    expect(result.isOk).toBe(true)
    if (result.isOk) expect(result.value.length).toBe(0)
  })
})
