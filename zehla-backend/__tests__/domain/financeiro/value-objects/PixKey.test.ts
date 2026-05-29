import { describe, it, expect } from 'vitest'
import { PixKey, PixKeyType } from '../../../../src/domain/financeiro/value-objects/PixKey'

describe('PixKey', () => {
  describe('CPF', () => {
    it('should create valid CPF', () => {
      const result = PixKey.create(PixKeyType.CPF, '529.982.247-25')
      expect(result.isOk).toBe(true)
      expect(result.value.type).toBe(PixKeyType.CPF)
      expect(result.value.value).toBe('52998224725')
    })

    it('should fail with invalid CPF check digits', () => {
      const result = PixKey.create(PixKeyType.CPF, '111.111.111-11')
      expect(result.isFail).toBe(true)
    })

    it('should fail with short CPF', () => {
      const result = PixKey.create(PixKeyType.CPF, '123')
      expect(result.isFail).toBe(true)
    })
  })

  describe('CNPJ', () => {
    it('should create valid CNPJ', () => {
      const result = PixKey.create(PixKeyType.CNPJ, '11.444.777/0001-61')
      expect(result.isOk).toBe(true)
      expect(result.value.value).toBe('11444777000161')
    })

    it('should fail with invalid CNPJ check digits', () => {
      const result = PixKey.create(PixKeyType.CNPJ, '11.111.111/1111-11')
      expect(result.isFail).toBe(true)
    })
  })

  describe('EMAIL', () => {
    it('should create valid email', () => {
      const result = PixKey.create(PixKeyType.EMAIL, 'Test@Example.COM')
      expect(result.isOk).toBe(true)
      expect(result.value.value).toBe('test@example.com')
    })

    it('should fail with invalid email', () => {
      const result = PixKey.create(PixKeyType.EMAIL, 'invalid-email')
      expect(result.isFail).toBe(true)
    })
  })

  describe('PHONE', () => {
    it('should create valid phone', () => {
      const result = PixKey.create(PixKeyType.PHONE, '+5511999998888')
      expect(result.isOk).toBe(true)
      expect(result.value.value).toBe('+5511999998888')
    })

    it('should fail with invalid phone (no +55)', () => {
      const result = PixKey.create(PixKeyType.PHONE, '11999998888')
      expect(result.isFail).toBe(true)
    })
  })

  describe('RANDOM', () => {
    it('should create valid random UUID', () => {
      const result = PixKey.create(PixKeyType.RANDOM, '123e4567-e89b-12d3-a456-426614174000')
      expect(result.isOk).toBe(true)
      expect(result.value.value).toBe('123e4567-e89b-12d3-a456-426614174000')
    })

    it('should fail with invalid UUID', () => {
      const result = PixKey.create(PixKeyType.RANDOM, 'not-a-uuid')
      expect(result.isFail).toBe(true)
    })
  })

  it('should fail with empty value', () => {
    const result = PixKey.create(PixKeyType.CPF, '')
    expect(result.isFail).toBe(true)
  })
})
