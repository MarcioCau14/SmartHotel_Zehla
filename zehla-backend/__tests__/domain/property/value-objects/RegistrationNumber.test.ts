import { describe, it, expect } from 'vitest'
import { RegistrationNumber } from '../../../../src/domain/property/value-objects/RegistrationNumber'
import { Plan } from '../../../../src/domain/property/enums'

describe('RegistrationNumber', () => {
  it('should create from valid format', () => {
    const result = RegistrationNumber.create('0001/LITE/SC')
    expect(result.isOk).toBe(true)
    expect(result.value.value).toBe('0001/LITE/SC')
  })

  it('should fail with invalid format', () => {
    const result = RegistrationNumber.create('abc')
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('NNNN/PLAN/UF')
  })

  it('should fail with invalid plan', () => {
    const result = RegistrationNumber.create('0001/INVALID/SC')
    expect(result.isFail).toBe(true)
  })

  it('should fail with invalid UF', () => {
    const result = RegistrationNumber.create('0001/LITE/XX')
    expect(result.isFail).toBe(true)
  })

  it('should generate sequential number', () => {
    const result = RegistrationNumber.generate(1, Plan.PRO, 'RJ')
    expect(result.isOk).toBe(true)
    expect(result.value.value).toBe('0001/PRO/RJ')
  })

  it('should pad sequential with zeros', () => {
    const result = RegistrationNumber.generate(42, Plan.MAX, 'SP')
    expect(result.value.value).toBe('0042/MAX/SP')
  })

  it('should pad sequential with zeros for 4 digits', () => {
    const result = RegistrationNumber.generate(9999, Plan.LITE, 'AM')
    expect(result.value.value).toBe('9999/LITE/AM')
  })

  it('should fail with sequential out of range', () => {
    const result = RegistrationNumber.generate(0, Plan.LITE, 'SP')
    expect(result.isFail).toBe(true)
  })

  it('should fail with sequential > 9999', () => {
    const result = RegistrationNumber.generate(10000, Plan.LITE, 'SP')
    expect(result.isFail).toBe(true)
  })

  it('should fail with invalid UF in generate', () => {
    const result = RegistrationNumber.generate(1, Plan.LITE, 'XX')
    expect(result.isFail).toBe(true)
  })

  it('should extract sequential number', () => {
    const rn = RegistrationNumber.create('0042/PRO/SC').value
    expect(rn.getSequential()).toBe(42)
  })

  it('should extract plan', () => {
    const rn = RegistrationNumber.create('0001/MAX/SP').value
    expect(rn.getPlan()).toBe('MAX')
  })

  it('should extract UF', () => {
    const rn = RegistrationNumber.create('0001/LITE/SC').value
    expect(rn.getUf()).toBe('SC')
  })

  it('should check equality', () => {
    const a = RegistrationNumber.create('0001/LITE/SC').value
    const b = RegistrationNumber.create('0001/LITE/SC').value
    const c = RegistrationNumber.create('0002/LITE/SC').value
    expect(a.equals(b)).toBe(true)
    expect(a.equals(c)).toBe(false)
  })
})
