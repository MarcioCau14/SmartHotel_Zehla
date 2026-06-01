import { describe, it, expect } from 'vitest'
import { Percentual } from '../../../domain/revenue/value-objects/Percentual'
import { BreakEvenPoint } from '../../../domain/revenue/value-objects/BreakEvenPoint'
import { ElasticidadePreco } from '../../../domain/revenue/value-objects/ElasticidadePreco'
import { Money } from '../../../domain/comercial/value-objects/Money'

function money(reais: number) {
  const r = Money.deReais(reais)
  if (r.isFail) throw new Error(`Failed to create money: ${r.error.message}`)
  return r.value
}

describe('Percentual', () => {
  it('should create valid percentual', () => {
    const p = Percentual.criar(75)
    expect(p.isOk).toBe(true)
    if (p.isOk) expect(p.value.valor).toBe(75)
  })

  it('should reject percentual below 0', () => {
    const p = Percentual.criar(-5)
    expect(p.isFail).toBe(true)
  })

  it('should reject percentual above 100', () => {
    const p = Percentual.criar(150)
    expect(p.isFail).toBe(true)
  })

  it('should apply percentage to money', () => {
    const p = Percentual.criar(20)
    expect(p.isOk).toBe(true)
    if (p.isOk) {
      const result = p.value.aplicar(money(200))
      expect(result.isOk).toBe(true)
      if (result.isOk) expect(result.value.centavos).toBe(4000)
    }
  })
})

describe('BreakEvenPoint', () => {
  it('should create valid break-even', () => {
    const be = BreakEvenPoint.criar(money(100), 'operacional')
    expect(be.isOk).toBe(true)
  })

  it('should reject zero break-even', () => {
    const be = BreakEvenPoint.criar(Money.zero(), 'operacional')
    expect(be.isFail).toBe(true)
  })

  it('should reject invalid tipoCusto', () => {
    const be = BreakEvenPoint.criar(money(100), 'invalido')
    expect(be.isFail).toBe(true)
  })

  it('should detect when diaria covers break-even', () => {
    const be = BreakEvenPoint.criar(money(100), 'operacional')
    expect(be.isOk).toBe(true)
    if (be.isOk) {
      expect(be.value.estaCobertoPor(money(150))).toBe(true)
      expect(be.value.estaCobertoPor(money(50))).toBe(false)
      expect(be.value.estaCobertoPor(money(100))).toBe(true)
    }
  })

  it('should calculate margin over break-even', () => {
    const be = BreakEvenPoint.criar(money(100), 'operacional')
    expect(be.isOk).toBe(true)
    if (be.isOk) {
      const margem = be.value.margemSobre(money(120))
      expect(margem.isOk).toBe(true)
      if (margem.isOk) expect(margem.value.valor).toBe(20)
    }
  })

  it('should fail margin when below break-even', () => {
    const be = BreakEvenPoint.criar(money(100), 'operacional')
    expect(be.isOk).toBe(true)
    if (be.isOk) {
      const margem = be.value.margemSobre(money(80))
      expect(margem.isFail).toBe(true)
    }
  })
})

describe('ElasticidadePreco', () => {
  it('should create valid elasticidade', () => {
    const e = ElasticidadePreco.criar(-1.5)
    expect(e.isOk).toBe(true)
    if (e.isOk) expect(e.value.valor).toBe(-1.5)
  })

  it('should create elasticidade of zero', () => {
    const e = ElasticidadePreco.criar(0)
    expect(e.isOk).toBe(true)
  })

  it('should reject positive elasticidade', () => {
    const e = ElasticidadePreco.criar(1.5)
    expect(e.isFail).toBe(true)
  })

  it('should calculate demand variation', () => {
    const e = ElasticidadePreco.criar(-1.5)
    expect(e.isOk).toBe(true)
    if (e.isOk) {
      const p10 = Percentual.criar(10)
      expect(p10.isOk).toBe(true)
      if (p10.isOk) {
        const variacao = e.value.calcularVariacaoDemanda(p10.value)
        expect(variacao.isOk).toBe(true)
        if (variacao.isOk) expect(variacao.value.valor).toBe(15)
      }
    }
  })
})
