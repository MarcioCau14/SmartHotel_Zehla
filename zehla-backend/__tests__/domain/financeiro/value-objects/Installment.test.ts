import { describe, it, expect } from 'vitest'
import { Installment } from '../../../../src/domain/financeiro/value-objects/Installment'
import { Money } from '../../../../src/domain/financeiro/value-objects/Money'

describe('Installment', () => {
  it('should create valid installment', () => {
    const result = Installment.create({
      quantity: 3,
      value: Money.create(100).value,
      interestRate: 2.5,
      dueDate: new Date('2026-04-01'),
    })
    expect(result.isOk).toBe(true)
    expect(result.value.quantity).toBe(3)
    expect(result.value.interestRate).toBe(2.5)
  })

  it('should fail with quantity less than 1', () => {
    const result = Installment.create({
      quantity: 0,
      value: Money.create(100).value,
      interestRate: 0,
      dueDate: new Date('2026-04-01'),
    })
    expect(result.isFail).toBe(true)
  })

  it('should fail with quantity greater than 12', () => {
    const result = Installment.create({
      quantity: 13,
      value: Money.create(100).value,
      interestRate: 0,
      dueDate: new Date('2026-04-01'),
    })
    expect(result.isFail).toBe(true)
  })

  it('should fail with negative interest rate', () => {
    const result = Installment.create({
      quantity: 3,
      value: Money.create(100).value,
      interestRate: -1,
      dueDate: new Date('2026-04-01'),
    })
    expect(result.isFail).toBe(true)
  })

  it('should fail with interest rate above 100', () => {
    const result = Installment.create({
      quantity: 3,
      value: Money.create(100).value,
      interestRate: 101,
      dueDate: new Date('2026-04-01'),
    })
    expect(result.isFail).toBe(true)
  })

  it('should fail with non-integer quantity', () => {
    const result = Installment.create({
      quantity: 2.5,
      value: Money.create(100).value,
      interestRate: 0,
      dueDate: new Date('2026-04-01'),
    })
    expect(result.isFail).toBe(true)
  })
})
