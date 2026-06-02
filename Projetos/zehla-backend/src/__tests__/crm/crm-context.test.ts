import { describe, it, expect, beforeEach } from 'vitest'
import { LeadProfile } from '../../domain/crm/models/LeadProfile'
import { InteractionRecord } from '../../domain/crm/models/InteractionRecord'
import { CRMPipelineStage, transitar } from '../../domain/crm/models/CRMPipelineStage'
import { InMemoryCRMAdapter } from '../../infrastructure/persistence/memory/InMemoryCRMAdapter'

function leadValido() {
  return {
    id: 'lead-1',
    nome: 'Maria Silva',
    telefone: '11999999999',
    email: 'maria@email.com',
    canalOrigem: 'website',
    ltvScore: 65,
    stage: CRMPipelineStage.ENTRADA,
    createdAt: new Date(),
    propriedadeId: 'prop-1',
  }
}

describe('CRM Context Engine — LeadProfile', () => {
  it('deve criar LeadProfile com dados validos', () => {
    const result = LeadProfile.create(leadValido())
    expect(result.isOk).toBe(true)
    expect(result.isFail).toBe(false)
    if (result.isOk) {
      expect(result.value.id).toBe('lead-1')
      expect(result.value.nome).toBe('Maria Silva')
      expect(result.value.ltvScore).toBe(65)
      expect(result.value.stage).toBe(CRMPipelineStage.ENTRADA)
    }
  })

  it('deve rejeitar LeadProfile com LTV score invalido (< 0)', () => {
    const result = LeadProfile.create({ ...leadValido(), ltvScore: -1 })
    expect(result.isFail).toBe(true)
    if (result.isFail) {
      expect(result.error.message).toContain('LTV score deve estar entre 0 e 100')
    }
  })

  it('deve rejeitar LeadProfile com LTV score invalido (> 100)', () => {
    const result = LeadProfile.create({ ...leadValido(), ltvScore: 101 })
    expect(result.isFail).toBe(true)
    if (result.isFail) {
      expect(result.error.message).toContain('LTV score deve estar entre 0 e 100')
    }
  })

  it('deve rejeitar LeadProfile com telefone vazio', () => {
    const result = LeadProfile.create({ ...leadValido(), telefone: '' })
    expect(result.isFail).toBe(true)
    if (result.isFail) {
      expect(result.error.message).toContain('Telefone do lead é obrigatório')
    }
  })

  it('deve rejeitar LeadProfile com nome vazio', () => {
    const result = LeadProfile.create({ ...leadValido(), nome: '' })
    expect(result.isFail).toBe(true)
  })

  it('deve rejeitar LeadProfile com ID vazio', () => {
    const result = LeadProfile.create({ ...leadValido(), id: '' })
    expect(result.isFail).toBe(true)
  })

  it('deve rejeitar LeadProfile com canalOrigem vazio', () => {
    const result = LeadProfile.create({ ...leadValido(), canalOrigem: '' })
    expect(result.isFail).toBe(true)
  })

  it('deve rejeitar LeadProfile com propriedadeId vazio', () => {
    const result = LeadProfile.create({ ...leadValido(), propriedadeId: '' })
    expect(result.isFail).toBe(true)
  })

  it('deve ser imutavel (Object.freeze)', () => {
    const result = LeadProfile.create(leadValido())
    if (result.isOk) {
      expect(Object.isFrozen(result.value)).toBe(true)
    }
  })

  it('deve criar novo perfil ao transitar de stage', () => {
    const result = LeadProfile.create(leadValido())
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      const perfil = result.value
      const transitado = perfil.withStage(CRMPipelineStage.QUALIFICACAO)
      expect(transitado.isOk).toBe(true)
      if (transitado.isOk) {
        expect(transitado.value.stage).toBe(CRMPipelineStage.QUALIFICACAO)
        expect(transitado.value.id).toBe('lead-1')
        expect(transitado.value.ltvScore).toBe(65)
      }
    }
  })
})

describe('CRM Context Engine — InteractionRecord', () => {
  function interactionValida() {
    return {
      id: 'int-1',
      leadId: 'lead-1',
      canal: 'whatsapp',
      timestamp: new Date(),
      sentimentScore: 0.5,
      tokenCost: 150,
      outcome: 'PENDING' as const,
      resumo: 'Cliente interessou por suite master',
    }
  }

  it('deve criar InteractionRecord com dados validos', () => {
    const result = InteractionRecord.create(interactionValida())
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.id).toBe('int-1')
      expect(result.value.canal).toBe('whatsapp')
      expect(result.value.sentimentScore).toBe(0.5)
    }
  })

  it('deve rejeitar sentimentScore abaixo de -1', () => {
    const result = InteractionRecord.create({ ...interactionValida(), sentimentScore: -1.5 })
    expect(result.isFail).toBe(true)
    if (result.isFail) {
      expect(result.error.message).toContain('Sentiment score deve estar entre -1 e 1')
    }
  })

  it('deve rejeitar sentimentScore acima de 1', () => {
    const result = InteractionRecord.create({ ...interactionValida(), sentimentScore: 1.5 })
    expect(result.isFail).toBe(true)
  })

  it('deve rejeitar tokenCost negativo', () => {
    const result = InteractionRecord.create({ ...interactionValida(), tokenCost: -10 })
    expect(result.isFail).toBe(true)
  })

  it('deve rejeitar outcome invalido', () => {
    const result = InteractionRecord.create({ ...interactionValida(), outcome: 'INVALIDO' as any })
    expect(result.isFail).toBe(true)
  })

  it('deve ser imutavel (Object.freeze)', () => {
    const result = InteractionRecord.create(interactionValida())
    if (result.isOk) {
      expect(Object.isFrozen(result.value)).toBe(true)
    }
  })
})

describe('CRM Context Engine — Pipeline Stages', () => {
  it('deve permitir transicao valida: ENTRADA -> QUALIFICACAO', () => {
    const result = transitar(CRMPipelineStage.ENTRADA, CRMPipelineStage.QUALIFICACAO)
    expect(result.isOk).toBe(true)
    if (result.isOk) expect(result.value).toBe(CRMPipelineStage.QUALIFICACAO)
  })

  it('deve permitir transicao valida: QUALIFICACAO -> PROPOSTA', () => {
    const result = transitar(CRMPipelineStage.QUALIFICACAO, CRMPipelineStage.PROPOSTA)
    expect(result.isOk).toBe(true)
  })

  it('deve permitir transicao valida: NEGOCIACAO -> FECHAMENTO', () => {
    const result = transitar(CRMPipelineStage.NEGOCIACAO, CRMPipelineStage.FECHAMENTO)
    expect(result.isOk).toBe(true)
  })

  it('deve permitir transicao valida: ENTRADA -> PERDA_TEMPORARIA', () => {
    const result = transitar(CRMPipelineStage.ENTRADA, CRMPipelineStage.PERDA_TEMPORARIA)
    expect(result.isOk).toBe(true)
  })

  it('deve permitir retorno de PERDA_TEMPORARIA -> QUALIFICACAO', () => {
    const result = transitar(CRMPipelineStage.PERDA_TEMPORARIA, CRMPipelineStage.QUALIFICACAO)
    expect(result.isOk).toBe(true)
  })

  it('deve permitir reentrada: FECHAMENTO -> ENTRADA (novo ciclo)', () => {
    const result = transitar(CRMPipelineStage.FECHAMENTO, CRMPipelineStage.ENTRADA)
    expect(result.isOk).toBe(true)
  })

  it('deve rejeitar transicao invalida: ENTRADA -> FECHAMENTO (pular etapas)', () => {
    const result = transitar(CRMPipelineStage.ENTRADA, CRMPipelineStage.FECHAMENTO)
    expect(result.isFail).toBe(true)
    if (result.isFail) {
      expect(result.error.message).toContain('Transicao invalida')
    }
  })

  it('deve rejeitar transicao invalida: ENTRADA -> NEGOCIACAO', () => {
    const result = transitar(CRMPipelineStage.ENTRADA, CRMPipelineStage.NEGOCIACAO)
    expect(result.isFail).toBe(true)
  })

  it('deve rejeitar transicao invalida: PROPOSTA -> ENTRADA (não pode retroceder dois estágios)', () => {
    const result = transitar(CRMPipelineStage.PROPOSTA, CRMPipelineStage.ENTRADA)
    expect(result.isFail).toBe(true)
  })
})

describe('CRM Context Engine — InMemoryCRMAdapter', () => {
  let repo: InMemoryCRMAdapter

  beforeEach(() => {
    repo = new InMemoryCRMAdapter()
  })

  it('deve salvar e recuperar LeadProfile', async () => {
    const leadResult = LeadProfile.create(leadValido())
    expect(leadResult.isOk).toBe(true)
    if (!leadResult.isOk) return
    await repo.salvarLead(leadResult.value)
    const buscou = await repo.buscarLeadPorId('lead-1')
    expect(buscou.isOk).toBe(true)
    if (buscou.isOk) {
      expect(buscou.value).not.toBeNull()
      expect(buscou.value!.nome).toBe('Maria Silva')
    }
  })

  it('deve listar leads por stage', async () => {
    const l1 = LeadProfile.create(leadValido())
    const l2 = LeadProfile.create({ ...leadValido(), id: 'lead-2', stage: CRMPipelineStage.QUALIFICACAO })
    const l3 = LeadProfile.create({ ...leadValido(), id: 'lead-3', stage: CRMPipelineStage.QUALIFICACAO })
    expect(l1.isOk && l2.isOk && l3.isOk).toBe(true)
    if (!l1.isOk || !l2.isOk || !l3.isOk) return
    await repo.salvarLead(l1.value)
    await repo.salvarLead(l2.value)
    await repo.salvarLead(l3.value)
    const entrada = await repo.listarLeadsPorStage(CRMPipelineStage.ENTRADA)
    const qualificados = await repo.listarLeadsPorStage(CRMPipelineStage.QUALIFICACAO)
    expect(entrada.isOk && qualificados.isOk).toBe(true)
    if (entrada.isOk) expect(entrada.value).toHaveLength(1)
    if (qualificados.isOk) expect(qualificados.value).toHaveLength(2)
  })

  it('deve registrar e listar interacoes por lead', async () => {
    const i1 = InteractionRecord.create({
      id: 'int-1', leadId: 'lead-1', canal: 'whatsapp',
      timestamp: new Date(), sentimentScore: 0, tokenCost: 50, outcome: 'PENDING',
    })
    const i2 = InteractionRecord.create({
      id: 'int-2', leadId: 'lead-1', canal: 'email',
      timestamp: new Date(), sentimentScore: 0.8, tokenCost: 100, outcome: 'PENDING',
    })
    expect(i1.isOk && i2.isOk).toBe(true)
    if (!i1.isOk || !i2.isOk) return
    await repo.registrarInteracao(i1.value)
    await repo.registrarInteracao(i2.value)
    const list = await repo.listarInteracoesPorLead('lead-1')
    expect(list.isOk).toBe(true)
    if (list.isOk) expect(list.value).toHaveLength(2)
  })

  it('deve atualizar stage do lead via repositorio', async () => {
    const leadResult = LeadProfile.create(leadValido())
    expect(leadResult.isOk).toBe(true)
    if (!leadResult.isOk) return
    await repo.salvarLead(leadResult.value)
    const atualizado = await repo.atualizarStage('lead-1', CRMPipelineStage.QUALIFICACAO)
    expect(atualizado.isOk).toBe(true)
    if (atualizado.isOk) {
      expect(atualizado.value.stage).toBe(CRMPipelineStage.QUALIFICACAO)
    }
  })

  it('deve retornar erro ao atualizar stage de lead inexistente', async () => {
    const result = await repo.atualizarStage('inexistente', CRMPipelineStage.QUALIFICACAO)
    expect(result.isFail).toBe(true)
  })
})
