import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import { getBasePrisma } from '../../../../src/lib/prisma'
import { PrismaTarefaRepository } from '../../../../src/infrastructure/persistence/operacional/PrismaTarefaRepository'
import { PrismaManutencaoRepository } from '../../../../src/infrastructure/persistence/operacional/PrismaManutencaoRepository'
import { PrismaStaffRepository } from '../../../../src/infrastructure/persistence/operacional/PrismaStaffRepository'
import { PrismaFornecedorRepository } from '../../../../src/infrastructure/persistence/operacional/PrismaFornecedorRepository'
import { PrismaChecklistRepository } from '../../../../src/infrastructure/persistence/operacional/PrismaChecklistRepository'
import { PrismaSlaRepository } from '../../../../src/infrastructure/persistence/operacional/PrismaSlaRepository'
import { Prioridade } from '../../../../src/domain/operacional/value-objects/Prioridade'
import { Gravidade } from '../../../../src/domain/operacional/value-objects/Gravidade'

describe('Operacional Bounded Context — Persistência Real & RLS & Fail-Fast (Prisma)', () => {
  const prisma = getBasePrisma()

  const tarefaRepo = new PrismaTarefaRepository(prisma)
  const manutencaoRepo = new PrismaManutencaoRepository(prisma)
  const staffRepo = new PrismaStaffRepository(prisma)
  const fornecedorRepo = new PrismaFornecedorRepository(prisma)
  const checklistRepo = new PrismaChecklistRepository(prisma)
  const slaRepo = new PrismaSlaRepository(prisma)

  const propriedadeId = 'pousada_canasvieiras_op'
  const propriedadeOutro = 'pousada_outra_op_999'

  beforeAll(async () => {
    await prisma.$connect()
  })

  beforeEach(async () => {
    await prisma.operacionalManutencao.deleteMany()
    await prisma.operacionalTarefa.deleteMany()
    await prisma.operacionalChecklist.deleteMany()
    await prisma.operacionalStaff.deleteMany()
    await prisma.operacionalFornecedor.deleteMany()
    await prisma.operacionalSla.deleteMany()
  })

  describe('1. PrismaTarefaRepository (Data Mapper, RLS, Fail-Fast)', () => {
    it('deve criar e hidratar uma Tarefa com 100% de integridade dos VOs', async () => {
      const prioridade = Prioridade.alta()
      const criarResult = await tarefaRepo.criarTarefa({
        tipo: 'limpeza',
        propriedadeId,
        titulo: 'Limpar Suite Master 101',
        descricao: 'Limpeza profunda após check-out',
        prioridade,
        ativoId: 'quarto_101',
        tipoAtivo: 'quarto',
      })
      expect(criarResult.isOk).toBe(true)
      const tarefa = criarResult.value
      expect(tarefa.id).toBeDefined()
      expect(tarefa.tipo).toBe('limpeza')
      expect(tarefa.titulo).toBe('Limpar Suite Master 101')
      expect(tarefa.prioridade.value).toBe('alta')
      expect(tarefa.status).toBe('pendente')
      expect(tarefa.ativoId).toBe('quarto_101')
      expect(tarefa.estaAtrasada).toBe(false)

      const buscarResult = await tarefaRepo.buscarTarefaPorId(tarefa.id, propriedadeId)
      expect(buscarResult.isOk).toBe(true)
      expect(buscarResult.value!.id).toBe(tarefa.id)
    })

    it('deve iniciar e concluir tarefa com transição de estados persistida', async () => {
      const criarResult = await tarefaRepo.criarTarefa({
        tipo: 'vistoria',
        propriedadeId,
        titulo: 'Vistoria quarto 202',
      })
      expect(criarResult.isOk).toBe(true)
      const tarefa = criarResult.value

      const iniciarResult = await tarefaRepo.atualizarTarefa(tarefa.id, propriedadeId, {
        status: 'em_andamento',
        responsavelId: 'staff_joao',
        tipoResponsavel: 'staff',
      })
      expect(iniciarResult.isOk).toBe(true)
      expect(iniciarResult.value.status).toBe('em_andamento')
      expect(iniciarResult.value.responsavelId).toBe('staff_joao')

      const concluirResult = await tarefaRepo.atualizarTarefa(tarefa.id, propriedadeId, {
        status: 'concluida',
        observacoes: 'Quarto em perfeito estado',
      })
      expect(concluirResult.isOk).toBe(true)
      expect(concluirResult.value.status).toBe('concluida')
      expect(concluirResult.value.dataConclusao).toBeDefined()
    })

    it('deve aplicar RLS: buscar tarefa de outro tenant retorna null', async () => {
      const criarResult = await tarefaRepo.criarTarefa({
        tipo: 'entrega',
        propriedadeId,
        titulo: 'Entregar toalhas',
      })
      expect(criarResult.isOk).toBe(true)
      const id = criarResult.value.id

      const buscarOutro = await tarefaRepo.buscarTarefaPorId(id, propriedadeOutro)
      expect(buscarOutro.isOk).toBe(true)
      expect(buscarOutro.value).toBeNull()
    })

    it('deve falhar rápido ao hidratar dados corrompidos (prioridade inválida)', async () => {
      const id = `tarefa_corrompida_${Date.now()}`
      await prisma.operacionalTarefa.create({
        data: {
          id,
          propriedadeId,
          dataCriacao: new Date(),
          tipo: 'limpeza',
          titulo: 'Corrompida',
          prioridade: 'inexistente',
          status: 'pendente',
        },
      })
      const buscarResult = await tarefaRepo.buscarTarefaPorId(id, propriedadeId)
      expect(buscarResult.isFail).toBe(true)
      expect(buscarResult.error.message).toContain('Prioridade inválida')
    })
  })

  describe('2. PrismaManutencaoRepository (Interdição, Gravidade, Circuit Breaker)', () => {
    it('deve criar manutenção severa com interditaQuarto=true e hidratar corretamente', async () => {
      const tarefaResult = await tarefaRepo.criarTarefa({
        tipo: 'manutencao',
        propriedadeId,
        titulo: 'Vazamento severo',
      })
      expect(tarefaResult.isOk).toBe(true)

      const gravidade = Gravidade.severa()
      const criarResult = await manutencaoRepo.criarManutencao({
        tarefaId: tarefaResult.value.id,
        propriedadeId,
        tipo: 'corretiva',
        gravidade,
        categoria: 'hidraulica',
        descricaoProblema: 'Vazamento no encanamento do quarto 301',
        ativoId: 'quarto_301',
        tipoAtivo: 'quarto',
      })
      expect(criarResult.isOk).toBe(true)
      const manutencao = criarResult.value
      expect(manutencao.interditaQuarto).toBe(true)
      expect(manutencao.gravidade.value).toBe('severa')

      const buscarResult = await manutencaoRepo.buscarManutencaoPorId(manutencao.id, propriedadeId)
      expect(buscarResult.isOk).toBe(true)
      expect(buscarResult.value!.interditaQuarto).toBe(true)
    })

    it('deve contar interdições severas nas últimas 24h (suporte ao Circuit Breaker)', async () => {
      const t1 = await tarefaRepo.criarTarefa({ tipo: 'manutencao', propriedadeId, titulo: 'M1' })
      const t2 = await tarefaRepo.criarTarefa({ tipo: 'manutencao', propriedadeId, titulo: 'M2' })
      const t3 = await tarefaRepo.criarTarefa({ tipo: 'manutencao', propriedadeId, titulo: 'M3' })

      await manutencaoRepo.criarManutencao({
        tarefaId: t1.value.id, propriedadeId, tipo: 'corretiva',
        gravidade: Gravidade.severa(), categoria: 'eletrica',
        descricaoProblema: 'Curto circuito',
      })
      await manutencaoRepo.criarManutencao({
        tarefaId: t2.value.id, propriedadeId, tipo: 'corretiva',
        gravidade: Gravidade.severa(), categoria: 'hidraulica',
        descricaoProblema: 'Vazamento',
      })
      await manutencaoRepo.criarManutencao({
        tarefaId: t3.value.id, propriedadeId, tipo: 'corretiva',
        gravidade: Gravidade.severa(), categoria: 'estrutura',
        descricaoProblema: 'Rachadura parede',
      })

      const countResult = await manutencaoRepo.countInterdicoes24h(propriedadeId)
      expect(countResult.isOk).toBe(true)
      expect(countResult.value).toBe(3)
    })

    it('deve rejeitar manutenção preventiva com gravidade severa via Fail-Fast', async () => {
      const t = await tarefaRepo.criarTarefa({ tipo: 'manutencao', propriedadeId, titulo: 'Prev' })
      const criarResult = await manutencaoRepo.criarManutencao({
        tarefaId: t.value.id, propriedadeId, tipo: 'preventiva',
        gravidade: Gravidade.severa(), categoria: 'equipamento',
        descricaoProblema: 'Preventiva severa',
      })
      expect(criarResult.isFail).toBe(true)
      expect(criarResult.error.message).toContain('não pode ter gravidade severa')
    })
  })

  describe('3. PrismaStaffRepository (Técnicos, Habilidades, Disponibilidade)', () => {
    it('deve criar staff técnico com habilidade obrigatória e listar por cargo', async () => {
      const criarResult = await staffRepo.criarStaff({
        propriedadeId,
        nome: 'João Técnico',
        cargo: 'tecnico',
        turno: 'matutino',
        habilidades: ['hidraulica', 'eletrica'],
      })
      expect(criarResult.isOk).toBe(true)
      expect(criarResult.value.cargo).toBe('tecnico')
      expect(criarResult.value.habilidades).toContain('hidraulica')

      const listarCargo = await staffRepo.listarPorCargo('tecnico', propriedadeId)
      expect(listarCargo.isOk).toBe(true)
      expect(listarCargo.value.length).toBe(1)
    })

    it('deve listar apenas staff disponível (ativo e <3 tarefas)', async () => {
      await staffRepo.criarStaff({
        propriedadeId, nome: 'Maria', cargo: 'camareira', turno: 'matutino',
      })
      await staffRepo.criarStaff({
        propriedadeId, nome: 'Pedro', cargo: 'camareira', turno: 'vespertino',
      })
      const disponiveis = await staffRepo.listarDisponiveis(propriedadeId)
      expect(disponiveis.isOk).toBe(true)
      expect(disponiveis.value.length).toBe(2)

      const matutinos = await staffRepo.listarDisponiveis(propriedadeId, 'matutino')
      expect(matutinos.isOk).toBe(true)
      expect(matutinos.value.length).toBe(1)
    })
  })

  describe('4. PrismaFornecedorRepository (Webhook Secrets, Avaliação)', () => {
    it('deve criar fornecedor com webhook e recuperar secret', async () => {
      const criarResult = await fornecedorRepo.criarFornecedor({
        razaoSocial: 'HidraTech Soluções Ltda',
        cnpj: '11222333000181',
        nomeContato: 'Carlos Hidra',
        emailContato: 'carlos@hidratech.com',
        telefoneContato: '+5548999997777',
        especialidades: ['hidraulica', 'dedetizacao'],
        webhookUrl: 'https://hooks.hidratech.com/zehla',
        webhookSecret: 'segredo_super_seguro_123',
      })
      expect(criarResult.isOk).toBe(true)
      expect(criarResult.value.especialidades).toContain('hidraulica')

      const secretResult = await fornecedorRepo.obterWebhookSecret(criarResult.value.id)
      expect(secretResult.isOk).toBe(true)
      expect(secretResult.value).toBe('segredo_super_seguro_123')
    })

    it('deve suspender e reativar fornecedor', async () => {
      const criarResult = await fornecedorRepo.criarFornecedor({
        razaoSocial: 'Elétrica BO Ltda', cnpj: '99888777000155',
        nomeContato: 'Ana Elétrica', emailContato: 'ana@eletrica.com',
        telefoneContato: '+554899996666',
        especialidades: ['eletrica'],
      })
      expect(criarResult.isOk).toBe(true)
      const id = criarResult.value.id

      const suspenderResult = await fornecedorRepo.suspenderFornecedor(id)
      expect(suspenderResult.isOk).toBe(true)
      expect(suspenderResult.value.status).toBe('suspenso')

      const reativarResult = await fornecedorRepo.reativarFornecedor(id)
      expect(reativarResult.isOk).toBe(true)
      expect(reativarResult.value.status).toBe('ativo')
    })
  })

  describe('5. PrismaChecklistRepository (Itens JSON, Trigger, Conclusão)', () => {
    it('deve criar checklist com itens JSON complexos e concluir com todos obrigatórios', async () => {
      const criarResult = await checklistRepo.criarChecklist({
        propriedadeId,
        nome: 'Checklist Checkout Suite',
        tipoTrigger: 'checkout',
        ativoId: 'quarto_101',
        itens: [
          { itemId: 'i1', descricao: 'Trocar lençóis', obrigatorio: true, concluido: false },
          { itemId: 'i2', descricao: 'Limpar banheiro', obrigatorio: true, concluido: false },
          { itemId: 'i3', descricao: 'Repor amenities', obrigatorio: false, concluido: false },
        ],
        responsavelId: 'staff_maria',
      })
      expect(criarResult.isOk).toBe(true)
      expect(criarResult.value.itens.length).toBe(3)

      const buscarResult = await checklistRepo.buscarChecklistPorId(criarResult.value.id, propriedadeId)
      expect(buscarResult.isOk).toBe(true)
      expect(buscarResult.value!.itens[0].descricao).toBe('Trocar lençóis')
      expect(buscarResult.value!.itens[0].obrigatorio).toBe(true)
    })

    it('deve listar checklists pendentes por ativo', async () => {
      await checklistRepo.criarChecklist({
        propriedadeId, nome: 'Check-in 101', tipoTrigger: 'checkin',
        ativoId: 'quarto_101',
        itens: [{ itemId: 'i1', descricao: 'Verificar ar', obrigatorio: true, concluido: false }],
      })
      await checklistRepo.criarChecklist({
        propriedadeId, nome: 'Checkout 101', tipoTrigger: 'checkout',
        ativoId: 'quarto_101',
        itens: [{ itemId: 'i2', descricao: 'Limpar', obrigatorio: true, concluido: false }],
      })

      const pendentes = await checklistRepo.listarPendentesPorAtivo('quarto_101', propriedadeId)
      expect(pendentes.isOk).toBe(true)
      expect(pendentes.value.length).toBe(2)
    })
  })

  describe('6. PrismaSlaRepository (Prazo por Prioridade, Alerta)', () => {
    it('deve criar SLA para urgente (prazo ≤ 2h) e buscar por tipo+prioridade', async () => {
      const prioridade = Prioridade.urgente()
      const criarResult = await slaRepo.criarSla({
        tipoTarefa: 'manutencao',
        prioridade,
        prazoMinutos: 120,
        notificarEm: 0.8,
      })
      expect(criarResult.isOk).toBe(true)
      expect(criarResult.value.prazoMinutos).toBe(120)

      const buscarResult = await slaRepo.buscarSla('manutencao', prioridade)
      expect(buscarResult.isOk).toBe(true)
      expect(buscarResult.value).not.toBeNull()
      expect(buscarResult.value!.prazoEmMinutos).toBe(120)
    })

    it('deve rejeitar SLA urgente com prazo superior a 120min', async () => {
      const criarResult = await slaRepo.criarSla({
        tipoTarefa: 'limpeza',
        prioridade: Prioridade.urgente(),
        prazoMinutos: 180,
      })
      expect(criarResult.isFail).toBe(true)
      expect(criarResult.error.message).toContain('deve ter prazoMinutos')
    })
  })
})
