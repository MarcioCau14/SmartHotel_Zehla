import { describe, it, expect } from 'vitest'
import { Money } from '../../domain/comercial/value-objects/Money'
import { Email } from '../../domain/comercial/value-objects/Email'
import { Documento } from '../../domain/comercial/value-objects/Documento'
import { Score } from '../../domain/comercial/value-objects/Score'
import { Canal } from '../../domain/comercial/value-objects/Canal'
import { RegraPrecificacao } from '../../domain/comercial/value-objects/RegraPrecificacao'
import { Result } from '../../shared/Result'

function obterValor<T, E extends Error>(result: Result<T, E>): T {
  if (result.isFail) {
    throw result.error
  }
  return result.value
}

describe('Money Value Object', () => {
  it('should create valid money object', () => {
    const moneyResult = Money.criar(1000)
    expect(moneyResult.isOk).toBe(true)
    if (moneyResult.isOk) {
      const money = moneyResult.value
      expect(money.centavos).toBe(1000)
      expect(money.valor).toBe(10)
    }
  })

  it('should reject negative centavos', () => {
    const moneyResult = Money.criar(-100)
    expect(moneyResult.isFail).toBe(true)
  })

  it('should allow zero centavos', () => {
    const moneyResult = Money.criar(0)
    expect(moneyResult.isOk).toBe(true)
    if (moneyResult.isOk) {
      expect(moneyResult.value.centavos).toBe(0)
      expect(moneyResult.value.isZero()).toBe(true)
    }
  })

  it('should add money correctly', () => {
    const money1 = obterValor(Money.criar(1000))
    const money2 = obterValor(Money.criar(500))
    const result = money1.add(money2)
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.centavos).toBe(1500)
    }
  })

  it('should subtract money correctly', () => {
    const money1 = obterValor(Money.criar(1000))
    const money2 = obterValor(Money.criar(300))
    const result = money1.subtract(money2)
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.centavos).toBe(700)
    }
  })

  it('should reject subtraction that would result in negative value', () => {
    const money1 = obterValor(Money.criar(300))
    const money2 = obterValor(Money.criar(1000))
    const result = money1.subtract(money2)
    expect(result.isFail).toBe(true)
  })

  it('should calculate percentage correctly', () => {
    const money = obterValor(Money.criar(1000))
    const result = money.percentage(10)
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.centavos).toBe(100)
    }
  })

  it('should compare money correctly', () => {
    const money1 = obterValor(Money.criar(1000))
    const money2 = obterValor(Money.criar(1000))
    const money3 = obterValor(Money.criar(500))
    
    expect(money1.equals(money2)).toBe(true)
    expect(money1.equals(money3)).toBe(false)
  })
})

describe('Email Value Object', () => {
  it('should create valid email object', () => {
    const emailResult = Email.criar('test@example.com')
    expect(emailResult.isOk).toBe(true)
    if (emailResult.isOk) {
      expect(emailResult.value.valor).toBe('test@example.com')
    }
  })

  it('should reject invalid email format', () => {
    const emailResult = Email.criar('invalid-email')
    expect(emailResult.isFail).toBe(true)
  })

  it('should reject empty email', () => {
    const emailResult = Email.criar('')
    expect(emailResult.isFail).toBe(true)
  })
})

describe('Documento Value Object', () => {
  it('should create valid CPF', () => {
    const docResult = Documento.criar('123.456.789-09', 'CPF')
    expect(docResult.isOk).toBe(true)
    if (docResult.isOk) {
      expect(docResult.value.valor).toBe('12345678909')
      expect(docResult.value.formato).toBe('123.456.789-09')
    }
  })

  it('should create valid CNPJ', () => {
    const docResult = Documento.criar('00.000.000/0001-91', 'CNPJ')
    expect(docResult.isOk).toBe(true)
    if (docResult.isOk) {
      expect(docResult.value.valor).toBe('00000000000191')
      expect(docResult.value.formato).toBe('00.000.000/0001-91')
    }
  })

  it('should reject invalid document', () => {
    const docResult = Documento.criar('123', 'CPF')
    expect(docResult.isFail).toBe(true)
  })

  it('should reject empty document', () => {
    const docResult = Documento.criar('', 'CPF')
    expect(docResult.isFail).toBe(true)
  })
})

describe('Score Value Object', () => {
  it('should create valid score (0-100)', () => {
    const scoreResult = Score.criar(50)
    expect(scoreResult.isOk).toBe(true)
    if (scoreResult.isOk) {
      expect(scoreResult.value.value).toBe(50)
    }
  })

  it('should reject score below 0', () => {
    const scoreResult = Score.criar(-1)
    expect(scoreResult.isFail).toBe(true)
  })

  it('should reject score above 100', () => {
    const scoreResult = Score.criar(101)
    expect(scoreResult.isFail).toBe(true)
  })

  it('should determine if lead is qualified (>= 30)', () => {
    const score20 = obterValor(Score.criar(20))
    const score30 = obterValor(Score.criar(30))
    const score50 = obterValor(Score.criar(50))
    
    expect(score20.isQualificado()).toBe(false)
    expect(score30.isQualificado()).toBe(true)
    expect(score50.isQualificado()).toBe(true)
  })
})

describe('Canal Value Object', () => {
  it('should create valid canal', () => {
    const canalResult = Canal.criar('site')
    expect(canalResult.isOk).toBe(true)
    if (canalResult.isOk) {
      expect(canalResult.value.valor).toBe('site')
    }
  })

  it('should reject empty canal', () => {
    const canalResult = Canal.criar('')
    expect(canalResult.isFail).toBe(true)
  })

  it('should reject canal with only spaces', () => {
    const canalResult = Canal.criar('   ')
    expect(canalResult.isFail).toBe(true)
  })

  it('should reject invalid canal name', () => {
    const canalResult = Canal.criar('website')
    expect(canalResult.isFail).toBe(true)
  })
})

describe('RegraPrecificacao Value Object', () => {
  it('should create valid pricing rule', () => {
    const regraResult = RegraPrecificacao.criar({
      tipo: 'por_noite',
      valorBase: obterValor(Money.criar(10000)), // R$ 100,00
      valorPorNoite: obterValor(Money.criar(15000)), // R$ 150,00
      descontoEstanciaLonga: 10,
      noitesParaDesconto: 5
    })
    expect(regraResult.isOk).toBe(true)
    if (regraResult.isOk) {
      expect(regraResult.value.tipo).toBe('por_noite')
      expect(regraResult.value.valorBase.centavos).toBe(10000)
    }
  })

  it('should reject invalid pricing rule with zero base value', () => {
    const regraResult = RegraPrecificacao.criar({
      tipo: 'por_noite',
      valorBase: Money.zero(),
      valorPorNoite: obterValor(Money.criar(15000))
    })
    expect(regraResult.isFail).toBe(true)
  })

  it('should calculate total value correctly', () => {
    const regra = obterValor(RegraPrecificacao.criar({
      tipo: 'por_noite',
      valorBase: obterValor(Money.criar(100)), // R$ 1,00
      valorPorNoite: obterValor(Money.criar(10000)), // R$ 100,00
      descontoEstanciaLonga: 5,
      noitesParaDesconto: 2
    }))
    
    // Mock pacote object
    const pacoteMock = {
      capacidadeMaxima: 4,
      servicosInclusos: ['cafe da manha']
    }
    
    // Test 1 diária para 1 pessoa (sem desconto, pois noites <= noitesParaDesconto)
    let result = regra.calcularValorTotal(pacoteMock, 1, 1)
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.centavos).toBe(10000) // 100.00 * 1 = 10000 centavos
    }
    
    // Test 3 diárias para 2 pessoas (com desconto de 5%, pois noites 3 > noitesParaDesconto 2)
    result = regra.calcularValorTotal(pacoteMock, 2, 3)
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      // Base: 100.00 * 3 = 30000 centavos
      // Desconto: 5% de 30000 = 1500 centavos
      // Total: 28500 centavos
      expect(result.value.centavos).toBe(28500)
    }
  })
})