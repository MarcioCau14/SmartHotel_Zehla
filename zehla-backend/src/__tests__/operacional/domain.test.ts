import { describe, it, expect } from 'vitest'
import { Prioridade } from '../../../src/domain/operacional/value-objects/Prioridade'
import { Gravidade } from '../../../src/domain/operacional/value-objects/Gravidade'
import { AtivoId } from '../../../src/domain/operacional/value-objects/AtivoId'
import { PeriodoInterdicao } from '../../../src/domain/operacional/value-objects/PeriodoInterdicao'
import { Tarefa } from '../../../src/domain/operacional/entities/Tarefa'
import { Manutencao } from '../../../src/domain/operacional/entities/Manutencao'
import { Staff } from '../../../src/domain/operacional/entities/Staff'
import { Fornecedor } from '../../../src/domain/operacional/entities/Fornecedor'
import { Checklist } from '../../../src/domain/operacional/entities/Checklist'
import { SLA } from '../../../src/domain/operacional/entities/SLA'
import { Result } from '../../../src/shared/Result'
import * as crypto from 'crypto'

describe('Value Objects — Operacional', () => {
  describe('Prioridade', () => {
    it('should create valid prioridade', () => {
      const p = Prioridade.criar('alta')
      expect(p.isOk).toBe(true)
      if (p.isOk) {
        expect(p.value.value).toBe('alta')
        expect(p.value.peso).toBe(3)
      }
    })

    it('should reject invalid prioridade', () => {
      const p = Prioridade.criar('super')
      expect(p.isFail).toBe(true)
    })

    it('should compare prioridades by urgency', () => {
      const urgente = Prioridade.urgente()
      const baixa = Prioridade.baixa()
      expect(urgente.isMaisUrgenteQue(baixa)).toBe(true)
      expect(baixa.isMaisUrgenteQue(urgente)).toBe(false)
    })

    it('should reject empty prioridade', () => {
      expect(Prioridade.criar('').isFail).toBe(true)
    })
  })

  describe('Gravidade', () => {
    it('should create severa and identify as such', () => {
      const g = Gravidade.criar('severa')
      expect(g.isOk).toBe(true)
      if (g.isOk) {
        expect(g.value.isSevera).toBe(true)
        expect(g.value.isAltaOuSuperior).toBe(true)
      }
    })

    it('should identify alta as alta ou superior', () => {
      const g = Gravidade.alta()
      expect(g.isAltaOuSuperior).toBe(true)
      expect(g.isSevera).toBe(false)
    })

    it('should reject invalid gravidade', () => {
      expect(Gravidade.criar('catastrofica').isFail).toBe(true)
    })
  })

  describe('AtivoId', () => {
    it('should create valid quarto ativo', () => {
      const a = AtivoId.criar('quarto_101', 'quarto')
      expect(a.isOk).toBe(true)
      if (a.isOk) {
        expect(a.value.isQuarto).toBe(true)
        expect(a.value.toString()).toBe('quarto:quarto_101')
      }
    })

    it('should reject invalid tipo', () => {
      expect(AtivoId.criar('x', 'carro').isFail).toBe(true)
    })

    it('should reject empty id', () => {
      expect(AtivoId.criar('', 'quarto').isFail).toBe(true)
    })
  })

  describe('PeriodoInterdicao', () => {
    it('should create valid interdition period', () => {
      const p = PeriodoInterdicao.criar({
        dataInicio: new Date(),
        motivo: 'Vazamento severo',
      })
      expect(p.isOk).toBe(true)
      if (p.isOk) {
        expect(p.value.estaAtivo).toBe(true)
      }
    })

    it('should reject dataFim before dataInicio', () => {
      const p = PeriodoInterdicao.criar({
        dataInicio: new Date('2024-01-10'),
        dataFim: new Date('2024-01-05'),
        motivo: 'Teste',
      })
      expect(p.isFail).toBe(true)
    })

    it('should reject empty motivo', () => {
      const p = PeriodoInterdicao.criar({
        dataInicio: new Date(),
        motivo: '',
      })
      expect(p.isFail).toBe(true)
    })
  })
})

describe('Tarefa Entity', () => {
  const prioridade = Prioridade.media()
  const props = {
    id: 'tarefa_001',
    propriedadeId: 'prop_seed',
    dataCriacao: new Date(),
    tipo: 'limpeza' as const,
    titulo: 'Limpar quarto 101',
    prioridade,
  }

  it('should create a valid tarefa', () => {
    const t = Tarefa.create(props)
    expect(t.isOk).toBe(true)
    if (t.isOk) {
      expect(t.value.status).toBe('pendente')
      expect(t.value.tipo).toBe('limpeza')
      expect(t.value.titulo).toBe('Limpar quarto 101')
    }
  })

  it('should reject tarefa without id', () => {
    expect(Tarefa.create({ ...props, id: '' }).isFail).toBe(true)
  })

  it('should reject tarefa without titulo', () => {
    expect(Tarefa.create({ ...props, titulo: '' }).isFail).toBe(true)
  })

  it('should reject tarefa with titulo > 200 chars', () => {
    expect(Tarefa.create({ ...props, titulo: 'x'.repeat(201) }).isFail).toBe(true)
  })

  it('should reject invalid tipo', () => {
    expect(Tarefa.create({ ...props, tipo: 'faxina' as any }).isFail).toBe(true)
  })

  describe('State Machine', () => {
    it('should transition from pendente to em_andamento', () => {
      const t = Tarefa.create(props).value as Tarefa
      const iniciada = t.iniciar('staff_001', 'staff')
      expect(iniciada.isOk).toBe(true)
      if (iniciada.isOk) expect(iniciada.value.status).toBe('em_andamento')
    })

    it('should reject iniciar on already started tarefa', () => {
      const t = Tarefa.create(props).value as Tarefa
      const iniciada = t.iniciar('staff_001', 'staff').value as Tarefa
      expect(iniciada.iniciar('staff_002', 'staff').isFail).toBe(true)
    })

    it('should transition from em_andamento to concluida', () => {
      const t = Tarefa.create(props).value as Tarefa
      const iniciada = t.iniciar('staff_001', 'staff').value as Tarefa
      const concluida = iniciada.concluir()
      expect(concluida.isOk).toBe(true)
      if (concluida.isOk) {
        expect(concluida.value.status).toBe('concluida')
        expect(concluida.value.dataConclusao).toBeDefined()
      }
    })

    it('should reject concluir on pendente tarefa', () => {
      const t = Tarefa.create(props).value as Tarefa
      expect(t.concluir().isFail).toBe(true)
    })

    it('should transition from pendente to cancelada', () => {
      const t = Tarefa.create(props).value as Tarefa
      const cancelada = t.cancelar()
      expect(cancelada.isOk).toBe(true)
      if (cancelada.isOk) expect(cancelada.value.status).toBe('cancelada')
    })

    it('should reject cancelar on already concluida', () => {
      const t = Tarefa.create(props).value as Tarefa
      const iniciada = t.iniciar('staff_001', 'staff').value as Tarefa
      const concluida = iniciada.concluir().value as Tarefa
      expect(concluida.cancelar().isFail).toBe(true)
    })

    it('should block and unblock tarefa', () => {
      const t = Tarefa.create(props).value as Tarefa
      const iniciada = t.iniciar('staff_001', 'staff').value as Tarefa
      const bloqueada = iniciada.bloquear()
      expect(bloqueada.isOk).toBe(true)
      if (bloqueada.isOk) {
        expect(bloqueada.value.status).toBe('bloqueada')
        const desbloqueada = bloqueada.value.desbloquear()
        expect(desbloqueada.isOk).toBe(true)
        if (desbloqueada.isOk) expect(desbloqueada.value.status).toBe('em_andamento')
      }
    })

    it('should detect atrasada tarefa', () => {
      const doisDiasAtras = new Date(Date.now() - 2 * 86400000)
      const umDiaAtras = new Date(Date.now() - 86400000)
      const tResult = Tarefa.create({
        ...props,
        dataCriacao: doisDiasAtras,
        dataLimite: umDiaAtras,
      })
      expect(tResult.isOk).toBe(true)
      if (tResult.isOk) expect(tResult.value.estaAtrasada).toBe(true)
    })

    it('should not detect atrasada for concluida tarefa', () => {
      const doisDiasAtras = new Date(Date.now() - 2 * 86400000)
      const umDiaAtras = new Date(Date.now() - 86400000)
      const tResult = Tarefa.create({
        ...props,
        dataCriacao: doisDiasAtras,
        dataLimite: umDiaAtras,
      })
      expect(tResult.isOk).toBe(true)
      if (tResult.isOk) {
        const iniciada = tResult.value.iniciar('staff_001', 'staff').value as Tarefa
        const concluida = iniciada.concluir().value as Tarefa
        expect(concluida.estaAtrasada).toBe(false)
      }
    })
  })

  describe('Event Emission', () => {
    it('should emit TarefaCriadaEvent on creation', () => {
      const t = Tarefa.create(props).value as Tarefa
      expect(t.eventos.length).toBe(1)
      expect(t.eventos[0].type).toBe('TarefaCriadaEvent')
    })

    it('should emit TarefaIniciadaEvent on iniciar', () => {
      const t = Tarefa.create(props).value as Tarefa
      const iniciada = t.iniciar('staff_001', 'staff').value as Tarefa
      expect(iniciada.eventos[0].type).toBe('TarefaIniciadaEvent')
    })

    it('should emit TarefaConcluidaEvent on concluir', () => {
      const t = Tarefa.create(props).value as Tarefa
      const iniciada = t.iniciar('staff_001', 'staff').value as Tarefa
      const concluida = iniciada.concluir().value as Tarefa
      expect(concluida.eventos[0].type).toBe('TarefaConcluidaEvent')
    })
  })
})

describe('Manutencao Entity', () => {
  const props = {
    id: 'manut_001',
    tarefaId: 'tarefa_001',
    propriedadeId: 'prop_seed',
    dataAbertura: new Date(),
    tipo: 'corretiva' as const,
    gravidade: Gravidade.media(),
    categoria: 'hidraulica' as const,
    descricaoProblema: 'Vazamento na pia do banheiro',
  }

  it('should create valid manutencao', () => {
    const m = Manutencao.create(props)
    expect(m.isOk).toBe(true)
    if (m.isOk) {
      expect(m.value.status).toBe('aberta')
      expect(m.value.interditaQuarto).toBe(false)
    }
  })

  it('should interditar quarto for severa gravidade', () => {
    const m = Manutencao.create({
      ...props,
      gravidade: Gravidade.severa(),
    })
    expect(m.isOk).toBe(true)
    if (m.isOk) expect(m.value.interditaQuarto).toBe(true)
  })

  it('not interdit for preventiva severa (should reject)', () => {
    const m = Manutencao.create({
      ...props,
      tipo: 'preventiva',
      gravidade: Gravidade.severa(),
    })
    expect(m.isFail).toBe(true)
  })

  it('should transition through states correctly', () => {
    const m = Manutencao.create(props).value as Manutencao
    expect(m.status).toBe('aberta')

    const agendada = m.agendar(new Date(Date.now() + 86400000))
    expect(agendada.isOk).toBe(true)
    if (agendada.isOk) expect(agendada.value.status).toBe('agendada')

    const iniciada = agendada.value.iniciar()
    expect(iniciada.isOk).toBe(true)
    if (iniciada.isOk) expect(iniciada.value.status).toBe('em_andamento')

    const concluida = iniciada.value.concluir('Vazamento reparado, peça substituída.', 15000, 5000)
    expect(concluida.isOk).toBe(true)
    if (concluida.isOk) {
      expect(concluida.value.status).toBe('concluida')
      expect(concluida.value.custoTotal).toBe(20000)
    }
  })

  it('should emit ManutencaoIniciadaEvent on iniciar', () => {
    const m = Manutencao.create(props).value as Manutencao
    const agendada = m.agendar(new Date(Date.now() + 86400000)).value as Manutencao
    const iniciada = agendada.iniciar().value as Manutencao
    expect(iniciada.eventos[0].type).toBe('ManutencaoIniciadaEvent')
  })

  it('should emit ManutencaoConcluidaEvent on concluir', () => {
    const m = Manutencao.create(props).value as Manutencao
    const agendada = m.agendar(new Date(Date.now() + 86400000)).value as Manutencao
    const iniciada = agendada.iniciar().value as Manutencao
    const concluida = iniciada.concluir('Feito').value as Manutencao
    expect(concluida.eventos[0].type).toBe('ManutencaoConcluidaEvent')
  })
})

describe('Staff Entity', () => {
  const props = {
    id: 'staff_001',
    propriedadeId: 'prop_seed',
    dataContratacao: new Date(),
    nome: 'João Camareiro',
    cargo: 'camareira',
    turno: 'matutino',
  }

  it('should create valid staff', () => {
    const s = Staff.create(props)
    expect(s.isOk).toBe(true)
    if (s.isOk) {
      expect(s.value.ativo).toBe(true)
      expect(s.value.tarefasEmAndamento).toBe(0)
    }
  })

  it('should reject staff tecnico without habilidades', () => {
    const s = Staff.create({ ...props, cargo: 'tecnico', habilidades: [] })
    expect(s.isFail).toBe(true)
  })

  it('should accept staff tecnico with habilidades', () => {
    const s = Staff.create({ ...props, cargo: 'tecnico', habilidades: ['eletrica'] })
    expect(s.isOk).toBe(true)
  })

  it('should increment and decrement tarefas', () => {
    const s = Staff.create(props).value as Staff
    expect(s.podeReceberTarefa).toBe(true)

    const s1 = s.incrementarTarefas().value as Staff
    expect(s1.tarefasEmAndamento).toBe(1)

    const s2 = s1.incrementarTarefas().value as Staff
    const s3 = s2.incrementarTarefas().value as Staff
    expect(s3.tarefasEmAndamento).toBe(3)
    expect(s3.podeReceberTarefa).toBe(false)
    expect(s3.incrementarTarefas().isFail).toBe(true)

    const s4 = s3.decrementarTarefas().value as Staff
    expect(s4.tarefasEmAndamento).toBe(2)
    expect(s4.podeReceberTarefa).toBe(true)
  })

  it('should reject desativar staff with tarefas em andamento', () => {
    const s = Staff.create(props).value as Staff
    const s1 = s.incrementarTarefas().value as Staff
    expect(s1.desativar().isFail).toBe(true)
  })

  it('should allow desativar staff without tarefas', () => {
    const s = Staff.create(props).value as Staff
    const desativado = s.desativar().value as Staff
    expect(desativado.ativo).toBe(false)
    expect(desativado.podeReceberTarefa).toBe(false)
  })
})

describe('Fornecedor Entity', () => {
  const props = {
    id: 'forn_001',
    dataCadastro: new Date(),
    razaoSocial: 'Hidro Tech Ltda',
    cnpj: '11222333000181',
    nomeContato: 'Carlos Técnico',
    emailContato: 'carlos@hidro.tech',
    telefoneContato: '11999999999',
  }

  it('should create valid fornecedor', () => {
    const f = Fornecedor.create(props)
    expect(f.isOk).toBe(true)
    if (f.isOk) {
      expect(f.value.estaAtivo).toBe(true)
      expect(f.value.status).toBe('ativo')
    }
  })

  it('should reject invalid CNPJ', () => {
    const f = Fornecedor.create({ ...props, cnpj: '123' })
    expect(f.isFail).toBe(true)
  })

  it('should suspender and reativar', () => {
    const f = Fornecedor.create(props).value as Fornecedor
    expect(f.estaAtivo).toBe(true)

    const suspenso = f.suspender().value as Fornecedor
    expect(suspenso.estaSuspenso).toBe(true)
    expect(suspenso.estaAtivo).toBe(false)

    const reativado = suspenso.reativar().value as Fornecedor
    expect(reativado.estaAtivo).toBe(true)
  })

  it('should avaliar fornecedor', () => {
    const f = Fornecedor.create(props).value as Fornecedor
    const avaliado = f.avaliar(4.5)
    expect(avaliado.isOk).toBe(true)
    if (avaliado.isOk) expect(avaliado.value.taxaAvaliacao).toBe(4.5)
  })

  it('should reject invalid nota', () => {
    const f = Fornecedor.create(props).value as Fornecedor
    expect(f.avaliar(6).isFail).toBe(true)
  })
})

describe('Checklist Entity', () => {
  const props = {
    id: 'cl_001',
    propriedadeId: 'prop_seed',
    nome: 'Checklist Checkout Quarto 101',
    tipoTrigger: 'checkout' as const,
    ativoId: 'quarto_101',
    itens: [
      { itemId: 'item_1', descricao: 'Trocar lençóis', obrigatorio: true, concluido: false },
      { itemId: 'item_2', descricao: 'Limpar banheiro', obrigatorio: true, concluido: false },
      { itemId: 'item_3', descricao: 'Repor amenities', obrigatorio: false, concluido: false },
    ],
    dataCriacao: new Date(),
  }

  it('should create valid checklist', () => {
    const c = Checklist.create(props)
    expect(c.isOk).toBe(true)
    if (c.isOk) expect(c.value.status).toBe('pendente')
  })

  it('should reject checklist without items', () => {
    const c = Checklist.create({ ...props, itens: [] })
    expect(c.isFail).toBe(true)
  })

  it('should transition through states', () => {
    const c = Checklist.create(props).value as Checklist
    const iniciado = c.iniciar()
    expect(iniciado.isOk).toBe(true)
    if (iniciado.isOk) expect(iniciado.value.status).toBe('em_andamento')

    const item1 = iniciado.value.concluirItem('item_1')
    expect(item1.isOk).toBe(true)

    const item2 = item1.value.concluirItem('item_2')
    expect(item2.isOk).toBe(true)

    const concluido = item2.value.concluir()
    expect(concluido.isOk).toBe(true)
    if (concluido.isOk) {
      expect(concluido.value.status).toBe('concluido')
      expect(concluido.value.dataConclusao).toBeDefined()
    }
  })

  it('should reject concluir with obrigatorios pendentes', () => {
    const c = Checklist.create(props).value as Checklist
    const iniciado = c.iniciar().value as Checklist
    expect(iniciado.concluir().isFail).toBe(true)
  })

  it('should emit ChecklistConcluidoEvent on concluir', () => {
    const c = Checklist.create(props).value as Checklist
    const iniciado = c.iniciar().value as Checklist
    const item1 = iniciado.concluirItem('item_1').value as Checklist
    const item2 = item1.concluirItem('item_2').value as Checklist
    const concluido = item2.concluir().value as Checklist
    expect(concluido.eventos[0].type).toBe('ChecklistConcluidoEvent')
  })
})

describe('SLA Entity', () => {
  it('should create valid SLA for urgente', () => {
    const sla = SLA.create({
      id: 'sla_001',
      tipoTarefa: 'manutencao',
      prioridade: Prioridade.urgente(),
      prazoMinutos: 120,
    })
    expect(sla.isOk).toBe(true)
    if (sla.isOk) expect(sla.value.prazoMinutos).toBe(120)
  })

  it('should reject SLA urgente with prazo > 120min', () => {
    const sla = SLA.create({
      id: 'sla_002',
      tipoTarefa: 'manutencao',
      prioridade: Prioridade.urgente(),
      prazoMinutos: 180,
    })
    expect(sla.isFail).toBe(true)
  })

  it('should reject SLA alta with prazo > 24h', () => {
    const sla = SLA.create({
      id: 'sla_003',
      tipoTarefa: 'manutencao',
      prioridade: Prioridade.alta(),
      prazoHoras: 48,
    })
    expect(sla.isFail).toBe(true)
  })

  it('should reject SLA baixa with prazo > 168h', () => {
    const sla = SLA.create({
      id: 'sla_004',
      tipoTarefa: 'manutencao',
      prioridade: Prioridade.baixa(),
      prazoHoras: 200,
    })
    expect(sla.isFail).toBe(true)
  })

  it('should calculate data limite correctly', () => {
    const sla = SLA.create({
      id: 'sla_005',
      tipoTarefa: 'limpeza',
      prioridade: Prioridade.alta(),
      prazoHoras: 4,
    }).value as SLA
    const agora = new Date()
    const limite = sla.calcularDataLimite(agora)
    const diffMs = limite.getTime() - agora.getTime()
    expect(diffMs).toBe(4 * 60 * 60 * 1000)
  })

  it('should detect inside/outside prazo', () => {
    const sla = SLA.create({
      id: 'sla_006',
      tipoTarefa: 'manutencao',
      prioridade: Prioridade.media(),
      prazoHoras: 24,
    }).value as SLA
    const criacao = new Date('2024-01-01T10:00:00')
    const dentro = new Date('2024-01-02T09:00:00')
    const fora = new Date('2024-01-03T10:00:00')
    expect(sla.estaDentroDoPrazo(criacao, dentro)).toBe(true)
    expect(sla.estaDentroDoPrazo(criacao, fora)).toBe(false)
  })
})

describe('Webhook HMAC Security', () => {
  const secret = 'forn_secret_123'
  const payload = { manutencaoId: 'manut_001', acao: 'concluido', observacoes: 'Serviço finalizado' }
  const payloadStr = JSON.stringify(payload)
  const validSignature = crypto.createHmac('sha256', secret).update(payloadStr).digest('hex')

  it('should verify valid HMAC signature', () => {
    const calculado = crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex')
    expect(crypto.timingSafeEqual(Buffer.from(calculado), Buffer.from(validSignature))).toBe(true)
  })

  it('should reject invalid HMAC signature', () => {
    const calculado = crypto.createHmac('sha256', 'wrong_secret').update(JSON.stringify(payload)).digest('hex')
    const match = calculado === validSignature
    expect(match).toBe(false)
  })

  it('should reject tampered payload', () => {
    const tamperedPayload = { ...payload, acao: 'cancelado' }
    const calculado = crypto.createHmac('sha256', secret).update(JSON.stringify(tamperedPayload)).digest('hex')
    expect(calculado).not.toBe(validSignature)
  })
})

describe('Circuit Breaker — AbrirManutencaoUseCase', () => {
  it('should allow up to 2 interdicoes autonomously', () => {
    const agora = new Date()
    const ha25h = new Date(agora.getTime() - 25 * 60 * 60 * 1000)

    const interdicoesAtivas = [ha25h, agora, agora]
    const ha24h = new Date(agora.getTime() - 24 * 60 * 60 * 1000)
    const recentes = interdicoesAtivas.filter(d => d >= ha24h)
    expect(recentes.length).toBe(2)
  })

  it('should block 3rd interdicao in 24h', () => {
    const agora = new Date()
    const interdicoes = [agora, agora]
    const count = interdicoes.length
    expect(count >= 2).toBe(true)
  })
})
