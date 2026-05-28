import { describe, it, expect } from 'vitest'
import { LeadContactInfo } from '../../../../src/domain/lead/value-objects/LeadContactInfo'

describe('LeadContactInfo', () => {
  it('should create with name and phone', () => {
    const info = LeadContactInfo.create({ name: 'Pousada Sol', phone: '5511999999999' })
    expect(info.isOk).toBe(true)
    expect(info.value.name).toBe('Pousada Sol')
  })

  it('should create with name and email', () => {
    const info = LeadContactInfo.create({ name: 'Hotel Lua', email: 'contato@luahotel.com' })
    expect(info.isOk).toBe(true)
  })

  it('should create with name and whatsapp', () => {
    const info = LeadContactInfo.create({ name: 'Hostel Mar', whatsapp: '5511988888888' })
    expect(info.isOk).toBe(true)
  })

  it('should fail with short name', () => {
    const info = LeadContactInfo.create({ name: 'A', phone: '5511999999999' })
    expect(info.isFail).toBe(true)
    expect(info.error).toContain('Nome')
  })

  it('should fail with no contact info', () => {
    const info = LeadContactInfo.create({ name: 'Pousada Teste' })
    expect(info.isFail).toBe(true)
    expect(info.error).toContain('contato')
  })

  it('should fail with invalid email', () => {
    const info = LeadContactInfo.create({
      name: 'Pousada',
      email: 'invalido',
      phone: '5511999999999',
    })
    expect(info.isFail).toBe(true)
    expect(info.error).toContain('E-mail')
  })

  it('should fail with short phone', () => {
    const info = LeadContactInfo.create({ name: 'Pousada', phone: '123' })
    expect(info.isFail).toBe(true)
    expect(info.error).toContain('Telefone')
  })

  it('should strip non-digits from phone', () => {
    const info = LeadContactInfo.create({
      name: 'Pousada',
      phone: '(11) 99999-9999',
    })
    expect(info.isOk).toBe(true)
    expect(info.value.phone).toBe('11999999999')
  })

  it('should mask PII in JSON output', () => {
    const info = LeadContactInfo.create({
      name: 'Pousada',
      phone: '5511999999999',
      email: 'teste@pousada.com',
    }).value
    const json = info.toJSON()
    expect(json.phone).toBe('***')
    expect(json.email).toBe('***@***')
    expect(json.name).toBe('Pousada')
  })
})
