import { describe, it, expect } from 'vitest'
import { ContactInfo } from '../../../../src/domain/property/value-objects/ContactInfo'

describe('ContactInfo', () => {
  const validProps = {
    phone: '+5511999999999',
    whatsapp: '+5511999999999',
    email: 'contato@pousada.com',
  }

  it('should create valid contact info', () => {
    const result = ContactInfo.create(validProps)
    expect(result.isOk).toBe(true)
    expect(result.value.phone).toBe('+5511999999999')
    expect(result.value.email).toBe('contato@pousada.com')
  })

  it('should fail with invalid phone format', () => {
    const result = ContactInfo.create({ ...validProps, phone: '11999999999' })
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('Phone')
  })

  it('should fail with invalid whatsapp format', () => {
    const result = ContactInfo.create({ ...validProps, whatsapp: '55(11)99999-9999' })
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('WhatsApp')
  })

  it('should fail with invalid email', () => {
    const result = ContactInfo.create({ ...validProps, email: 'invalido' })
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('email')
  })

  it('should accept optional website', () => {
    const result = ContactInfo.create({ ...validProps, website: 'https://pousada.com' })
    expect(result.isOk).toBe(true)
    expect(result.value.website).toBe('https://pousada.com')
  })

  it('should fail with invalid website URL', () => {
    const result = ContactInfo.create({ ...validProps, website: 'not-a-url' })
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('URL')
  })

  it('should lowercase email', () => {
    const result = ContactInfo.create({ ...validProps, email: 'Contato@Pousada.COM' })
    expect(result.isOk).toBe(true)
    expect(result.value.email).toBe('contato@pousada.com')
  })

  it('should validate supplier contact length', () => {
    const result = ContactInfo.create({ ...validProps, supplierContact: 'ab' })
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('Supplier')
  })

  it('should accept valid supplier contact', () => {
    const result = ContactInfo.create({ ...validProps, supplierContact: 'João Fornecedor' })
    expect(result.isOk).toBe(true)
    expect(result.value.supplierContact).toBe('João Fornecedor')
  })

  it('should check equality', () => {
    const a = ContactInfo.create(validProps).value
    const b = ContactInfo.create(validProps).value
    expect(a.equals(b)).toBe(true)
  })
})
