import { describe, it, expect } from 'vitest'
import { GuideSection } from '../../../../src/domain/guidebook/value-objects/GuideSection'

describe('GuideSection', () => {
  const validProps = {
    id: 'sec-1',
    sectionType: 'wifi' as const,
    icon: 'wifi-icon',
    order: 0,
    content: [{ title: 'Wi-Fi', content: 'Senha: 1234', language: 'pt-BR' }],
  }

  it('should create valid section', () => {
    const result = GuideSection.create(validProps)
    expect(result.isOk).toBe(true)
    expect(result.value.id).toBe('sec-1')
    expect(result.value.sectionType).toBe('wifi')
    expect(result.value.order).toBe(0)
  })

  it('should fail with empty id', () => {
    const result = GuideSection.create({ ...validProps, id: '' })
    expect(result.isFail).toBe(true)
    expect(result.error.message).toContain('ID')
  })

  it('should fail with negative order', () => {
    const result = GuideSection.create({ ...validProps, order: -1 })
    expect(result.isFail).toBe(true)
  })

  it('should fail with no localized content', () => {
    const result = GuideSection.create({ ...validProps, content: [] })
    expect(result.isFail).toBe(true)
  })

  it('should fail with empty title in content', () => {
    const result = GuideSection.create({
      ...validProps,
      content: [{ title: '', content: 'texto', language: 'pt-BR' }],
    })
    expect(result.isFail).toBe(true)
  })

  it('should fail with empty language', () => {
    const result = GuideSection.create({
      ...validProps,
      content: [{ title: 'Wi-Fi', content: 'senha', language: '' }],
    })
    expect(result.isFail).toBe(true)
  })

  it('should get content for language', () => {
    const section = GuideSection.create(validProps).value
    const content = section.getContentForLanguage('pt-BR')
    expect(content).toBeDefined()
    expect(content!.title).toBe('Wi-Fi')
  })

  it('should return undefined for missing language', () => {
    const section = GuideSection.create(validProps).value
    expect(section.getContentForLanguage('en')).toBeUndefined()
  })

  it('should translate section to new language', () => {
    const section = GuideSection.create(validProps).value
    const translated = section.translate('en', 'Wi-Fi', 'Password: 1234')
    expect(translated.isOk).toBe(true)
    const enContent = translated.value.getContentForLanguage('en')
    expect(enContent).toBeDefined()
    expect(enContent!.content).toBe('Password: 1234')
  })

  it('should replace existing translation on retranslate', () => {
    const section = GuideSection.create(validProps).value
    const t1 = section.translate('pt-BR', 'Wi-Fi Alterado', 'Nova senha')
    expect(t1.isOk).toBe(true)
    const ptContent = t1.value.getContentForLanguage('pt-BR')
    expect(ptContent!.title).toBe('Wi-Fi Alterado')
  })

  it('should restore without validation', () => {
    const section = GuideSection.restore(validProps)
    expect(section.id).toBe('sec-1')
  })

  it('should test equality by id', () => {
    const a = GuideSection.create(validProps).value
    const b = GuideSection.create({ ...validProps, order: 5 }).value
    expect(a.equals(b)).toBe(true)
  })

  it('should default icon to null', () => {
    const result = GuideSection.create({ ...validProps, icon: undefined })
    expect(result.isOk).toBe(true)
    expect(result.value.icon).toBeNull()
  })
})
