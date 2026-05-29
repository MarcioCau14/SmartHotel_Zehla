import { describe, it, expect } from 'vitest'
import { Sentimento } from '../../../domain/marketing/value-objects/Sentimento'
import { CanalDistribuicao } from '../../../domain/marketing/value-objects/CanalDistribuicao'
import { Review } from '../../../domain/marketing/entities/Review'
import { Campanha } from '../../../domain/marketing/entities/Campanha'
import { Conteudo } from '../../../domain/marketing/entities/Conteudo'
import { Post } from '../../../domain/marketing/entities/Post'
import { Metrica } from '../../../domain/marketing/entities/Metrica'

function s(nota: number) {
  const r = Sentimento.criar(nota)
  if (r.isFail) throw new Error(`Failed to create sentimento: ${r.error.message}`)
  return r.value
}

function canal(valor: string) {
  const r = CanalDistribuicao.criar(valor)
  if (r.isFail) throw new Error(`Failed to create canal: ${r.error.message}`)
  return r.value
}

function reviewProps(overrides: Record<string, unknown> = {}) {
  return {
    id: 'rev_1', propriedadeId: 'prop_1', hospedeNome: 'João',
    portal: canal('booking'), nota: 8, texto: 'Ótima estadia!',
    sentimento: s(8), dataEstadia: new Date('2026-07-15'),
    ...overrides,
  }
}

describe('Review', () => {
  it('should create review with eventos', () => {
    const r = Review.create(reviewProps())
    expect(r.isOk).toBe(true)
    expect(r.value!.eventos.length).toBeGreaterThanOrEqual(1)
    expect(r.value!.eventos[0].type).toBe('ReviewRecebidoEvent')
  })

  it('M1: should emit ReviewCriticoRegistradoEvent for nota 2', () => {
    const r = Review.create(reviewProps({ nota: 2, sentimento: s(2) }))
    expect(r.isOk).toBe(true)
    const criticoEvent = r.value!.eventos.find(e => e.type === 'ReviewCriticoRegistradoEvent')
    expect(criticoEvent).toBeDefined()
    expect(criticoEvent!.payload.problemaRelatado).toBe('Ótima estadia!')
  })

  it('should not emit critico event for nota 8', () => {
    const r = Review.create(reviewProps({ nota: 8, sentimento: s(8) }))
    expect(r.isOk).toBe(true)
    const criticoEvent = r.value!.eventos.find(e => e.type === 'ReviewCriticoRegistradoEvent')
    expect(criticoEvent).toBeUndefined()
  })

  it('should reject review without nome', () => {
    expect(Review.create(reviewProps({ hospedeNome: '' })).isFail).toBe(true)
  })

  it('should reject review without texto', () => {
    expect(Review.create(reviewProps({ texto: '' })).isFail).toBe(true)
  })

  it('should reject review with invalid nota', () => {
    expect(Review.create(reviewProps({ nota: 0 })).isFail).toBe(true)
    expect(Review.create(reviewProps({ nota: 11 })).isFail).toBe(true)
  })

  it('should respond to review', () => {
    const r = Review.create(reviewProps())
    expect(r.isOk).toBe(true)
    const responded = r.value!.responder('Obrigado pelo feedback! Voltaremos a melhorar cada vez mais para receber vocês.', 'profissional')
    expect(responded.isOk).toBe(true)
    expect(responded.value!.status).toBe('respondido')
    expect(responded.value!.resposta).toBe('Obrigado pelo feedback! Voltaremos a melhorar cada vez mais para receber vocês.')
  })

  it('M3: should reject re-response', () => {
    const r = Review.create(reviewProps())
    const responded = r.value!.responder('Obrigado pelo feedback! Voltaremos a melhorar cada vez mais para receber vocês.', 'profissional')
    const reResponse = responded.value!.responder('Outra resposta', 'profissional')
    expect(reResponse.isFail).toBe(true)
    expect(reResponse.error.message).toContain('já foi respondido')
  })

  it('should reject response with short text (M4)', () => {
    const r = Review.create(reviewProps())
    const responded = r.value!.responder('Obrigado', 'profissional')
    expect(responded.isFail).toBe(true)
    expect(responded.error.message).toContain('muito genérica')
  })

  it('should escalate to Z-Ops', () => {
    const r = Review.create(reviewProps({ nota: 2, sentimento: s(2) }))
    const analisado = r.value!.analisar()
    expect(analisado.isOk).toBe(true)
    const escalado = analisado.value!.escalarZops('task_123')
    expect(escalado.isOk).toBe(true)
    expect(escalado.value!.status).toBe('escalado_zops')
    expect(escalado.value!.eventos.some(e => e.type === 'ReviewEscaladoZopsEvent')).toBe(true)
  })

  it('should publish after response', () => {
    const r = Review.create(reviewProps())
    const responded = r.value!.responder('Obrigado pelo feedback! Voltaremos a melhorar cada vez mais para receber vocês.', 'profissional')
    const published = responded.value!.publicar()
    expect(published.isOk).toBe(true)
    expect(published.value!.status).toBe('publicado')
  })

  it('should not publish without response', () => {
    const r = Review.create(reviewProps())
    expect(r.value!.publicar().isFail).toBe(true)
  })
})

describe('Campanha', () => {
  it('should create campanha', () => {
    const c = Campanha.create({
      id: 'cmp_1', propriedadeId: 'prop_1', nome: 'Remarketing Verão',
      publicoAlvo: 'hospedes_satisfeitos', tipo: 'remarketing',
      dataInicio: new Date('2026-12-01'), dataFim: new Date('2027-02-28'),
    })
    expect(c.isOk).toBe(true)
    expect(c.value!.status).toBe('draft')
  })

  it('M5: should reject without publicoAlvo', () => {
    const c = Campanha.create({
      id: 'cmp_1', propriedadeId: 'prop_1', nome: 'Campanha',
      publicoAlvo: '', tipo: 'remarketing',
      dataInicio: new Date(), dataFim: new Date('2027-01-01'),
    })
    expect(c.isFail).toBe(true)
    expect(c.error.message).toContain('público-alvo')
  })

  it('M6: should reject promise financeira without validation', () => {
    const c = Campanha.create({
      id: 'cmp_1', propriedadeId: 'prop_1', nome: 'Campanha',
      publicoAlvo: 'todos', tipo: 'remarketing',
      dataInicio: new Date(), dataFim: new Date('2027-01-01'),
      possuiPromiseFinanceira: true, promiseFinanceiraValidada: false,
    })
    expect(c.isFail).toBe(true)
    expect(c.error.message).toContain('promise financeira')
  })

  it('M6: should allow promise financeira with validation', () => {
    const c = Campanha.create({
      id: 'cmp_1', propriedadeId: 'prop_1', nome: 'Campanha',
      publicoAlvo: 'todos', tipo: 'remarketing',
      dataInicio: new Date(), dataFim: new Date('2027-01-01'),
      possuiPromiseFinanceira: true, promiseFinanceiraValidada: true,
    })
    expect(c.isOk).toBe(true)
  })

  it('should transition through states', () => {
    const c = Campanha.create({
      id: 'cmp_1', propriedadeId: 'prop_1', nome: 'Campanha',
      publicoAlvo: 'todos', tipo: 'remarketing',
      dataInicio: new Date(), dataFim: new Date('2027-01-01'),
    })
    expect(c.value!.aprovar().value!.status).toBe('aprovada')
    expect(c.value!.aprovar().value!.agendar().value!.status).toBe('agendada')
    expect(c.value!.aprovar().value!.agendar().value!.executar().value!.status).toBe('em_execucao')
    expect(c.value!.aprovar().value!.agendar().value!.executar().value!.concluir().value!.status).toBe('concluida')
  })

  it('should cancel from any active state', () => {
    const c = Campanha.create({
      id: 'cmp_1', propriedadeId: 'prop_1', nome: 'Campanha',
      publicoAlvo: 'todos', tipo: 'remarketing',
      dataInicio: new Date(), dataFim: new Date('2027-01-01'),
    })
    expect(c.value!.aprovar().value!.cancelar().value!.status).toBe('cancelada')
  })

  it('should not cancel from concluida', () => {
    const c = Campanha.create({
      id: 'cmp_1', propriedadeId: 'prop_1', nome: 'Campanha',
      publicoAlvo: 'todos', tipo: 'remarketing',
      dataInicio: new Date(), dataFim: new Date('2027-01-01'),
    })
    const concluida = c.value!.aprovar().value!.agendar().value!.executar().value!.concluir().value
    expect(concluida.cancelar().isFail).toBe(true)
  })
})

describe('Conteudo', () => {
  it('should create conteudo with valid tom', () => {
    const c = Conteudo.create({ id: 'ctd_1', texto: 'Olá!', tom: 'acolhedor' })
    expect(c.isOk).toBe(true)
    expect(c.value!.versao).toBe(1)
  })

  it('M8: should reject invalid tom', () => {
    expect(Conteudo.create({ id: 'ctd_1', texto: 'Olá!', tom: 'agressivo' }).isFail).toBe(true)
  })

  it('should create with version', () => {
    const c = Conteudo.create({ id: 'ctd_1', texto: 'Olá!', tom: 'profissional', versao: 2 })
    expect(c.isOk).toBe(true)
    expect(c.value!.versao).toBe(2)
  })

  it('should reject empty texto', () => {
    expect(Conteudo.create({ id: 'ctd_1', texto: '', tom: 'neutro' }).isFail).toBe(true)
  })
})

describe('Post', () => {
  it('should create post', () => {
    const p = Post.create({
      id: 'pst_1', propriedadeId: 'prop_1',
      canal: canal('instagram'), tipo: 'institucional',
      conteudoId: 'ctd_1',
    })
    expect(p.isOk).toBe(true)
    expect(p.value!.status).toBe('draft')
  })

  it('M10: should reject non-social channel', () => {
    const p = Post.create({
      id: 'pst_1', propriedadeId: 'prop_1',
      canal: canal('booking'), tipo: 'institucional',
      conteudoId: 'ctd_1',
    })
    expect(p.isFail).toBe(true)
    expect(p.error.message).toContain('Canal de publicação não suportado')
  })

  it('M11: should require midia for promocional', () => {
    const p = Post.create({
      id: 'pst_1', propriedadeId: 'prop_1',
      canal: canal('instagram'), tipo: 'promocional',
      conteudoId: 'ctd_1',
    })
    expect(p.isFail).toBe(true)
    expect(p.error.message).toContain('exige ao menos uma mídia')
  })

  it('M11: should allow promocional with midia', () => {
    const p = Post.create({
      id: 'pst_1', propriedadeId: 'prop_1',
      canal: canal('instagram'), tipo: 'promocional',
      conteudoId: 'ctd_1', midias: ['img_1.jpg'],
    })
    expect(p.isOk).toBe(true)
  })

  it('should transition through states', () => {
    const p = Post.create({
      id: 'pst_1', propriedadeId: 'prop_1',
      canal: canal('instagram'), tipo: 'institucional',
      conteudoId: 'ctd_1',
    })
    expect(p.value!.agendar(new Date()).value!.status).toBe('agendado')
    expect(p.value!.agendar(new Date()).value!.publicar().value!.status).toBe('publicado')
  })

  it('should fail then retry', () => {
    const p = Post.create({
      id: 'pst_1', propriedadeId: 'prop_1',
      canal: canal('instagram'), tipo: 'institucional',
      conteudoId: 'ctd_1',
    })
    const agendado = p.value!.agendar(new Date()).value
    const falhou = agendado.falhar()
    expect(falhou.isOk).toBe(true)
    expect(falhou.value!.status).toBe('falhou')
    expect(falhou.value!.agendar(new Date()).isOk).toBe(true)
  })
})

describe('Metrica', () => {
  it('should create metrica snapshot', () => {
    const m = Metrica.create({
      id: 'met_1', propriedadeId: 'prop_1',
      dataInicio: new Date('2026-01-01'), dataFim: new Date('2026-01-31'),
      notaMedia: 8.5, taxaResposta: 90, sentimentoMedio: 85,
      totalReviews: 20, totalRespondidos: 18,
    })
    expect(m.isOk).toBe(true)
  })

  it('M12: should reject invalid period', () => {
    const m = Metrica.create({
      id: 'met_1', propriedadeId: 'prop_1',
      dataInicio: new Date('2026-02-01'), dataFim: new Date('2026-01-01'),
    })
    expect(m.isFail).toBe(true)
  })

  it('M14: should reject sentimentoMedio out of range', () => {
    expect(Metrica.create({
      id: 'met_1', propriedadeId: 'prop_1',
      dataInicio: new Date('2026-01-01'), dataFim: new Date('2026-01-31'),
      sentimentoMedio: 150,
    }).isFail).toBe(true)
  })

  it('should reject notaMedia out of range', () => {
    expect(Metrica.create({
      id: 'met_1', propriedadeId: 'prop_1',
      dataInicio: new Date('2026-01-01'), dataFim: new Date('2026-01-31'),
      notaMedia: 11,
    }).isFail).toBe(true)
  })

  it('should reject taxaResposta out of range', () => {
    expect(Metrica.create({
      id: 'met_1', propriedadeId: 'prop_1',
      dataInicio: new Date('2026-01-01'), dataFim: new Date('2026-01-31'),
      taxaResposta: 101,
    }).isFail).toBe(true)
  })

  it('should be immutable (snapshot)', () => {
    const m = Metrica.create({
      id: 'met_1', propriedadeId: 'prop_1',
      dataInicio: new Date('2026-01-01'), dataFim: new Date('2026-01-31'),
    })
    expect(m.isOk).toBe(true)
    expect(Object.isFrozen(m.value)).toBe(true)
  })
})
