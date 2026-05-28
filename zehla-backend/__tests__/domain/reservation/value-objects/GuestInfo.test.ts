import { describe, it, expect } from 'vitest'
import { GuestInfo } from '../../../../src/domain/reservation/value-objects/GuestInfo'

describe('GuestInfo', () => {
  it('should create valid guest info', () => {
    const info = GuestInfo.create({
      name: 'João Silva',
      phone: '5511999999999',
      email: 'joao@test.com',
    })
    expect(info.isOk).toBe(true)
    expect(info.value.name).toBe('João Silva')
    expect(info.value.phone).toBe('5511999999999')
  })

  it('should fail with short name', () => {
    const info = GuestInfo.create({ name: 'A', phone: '5511999999999' })
    expect(info.isFail).toBe(true)
  })

  it('should fail with short phone', () => {
    const info = GuestInfo.create({ name: 'João', phone: '123' })
    expect(info.isFail).toBe(true)
  })

  it('should fail with invalid email', () => {
    const info = GuestInfo.create({
      name: 'João',
      phone: '5511999999999',
      email: 'invalido',
    })
    expect(info.isFail).toBe(true)
  })

  it('should strip CPF formatting', () => {
    const info = GuestInfo.create({
      name: 'João',
      phone: '5511999999999',
      cpf: '123.456.789-09',
    })
    expect(info.isOk).toBe(true)
    expect(info.value.cpf).toBe('12345678909')
  })

  it('should fail with invalid CPF length', () => {
    const info = GuestInfo.create({
      name: 'João',
      phone: '5511999999999',
      cpf: '123',
    })
    expect(info.isFail).toBe(true)
  })
})
