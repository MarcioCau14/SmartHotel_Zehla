import { describe, it, expect } from 'vitest'
import { DigitalGuide } from '../../../../src/domain/guidebook/entities/DigitalGuide'
import { GuideSection } from '../../../../src/domain/guidebook/value-objects/GuideSection'

function makeSection(id: string, order: number, sectionType = 'wifi') {
  return GuideSection.create({
    id,
    sectionType: sectionType as any,
    order,
    content: [{ title: 'Seção', content: 'Conteúdo', language: 'pt-BR' }],
  }).value
}

function makeHorariosSection(id: string, order: number) {
  return GuideSection.create({
    id,
    sectionType: 'horarios' as any,
    order,
    content: [{ title: 'Horários', content: 'Check-in: 14h', language: 'pt-BR' }],
  }).value
}

const validSections = [makeSection('sec-1', 0), makeHorariosSection('sec-2', 1)]

describe('DigitalGuide', () => {
  const validProps = { id: 'guide-1', propertyId: 'prop-1', sections: validSections }

  it('should create valid guide', () => {
    const result = DigitalGuide.create(validProps)
    expect(result.isOk).toBe(true)
    expect(result.value.id).toBe('guide-1')
    expect(result.value.sections).toHaveLength(2)
    expect(result.value.status).toBe('rascunho')
    expect(result.value.version).toBe(1)
  })

  it('should fail with empty id', () => {
    const result = DigitalGuide.create({ ...validProps, id: '' })
    expect(result.isFail).toBe(true)
  })

  it('should fail with empty propertyId', () => {
    const result = DigitalGuide.create({ ...validProps, propertyId: '' })
    expect(result.isFail).toBe(true)
  })

  it('should fail with no sections', () => {
    const result = DigitalGuide.create({ ...validProps, sections: [] })
    expect(result.isFail).toBe(true)
  })

  it('should add section', () => {
    const guide = DigitalGuide.create(validProps).value
    const newSection = makeSection('sec-3', 2)
    const result = guide.addSection(newSection)
    expect(result.isOk).toBe(true)
    expect(result.value.sections).toHaveLength(3)
    expect(result.value.version).toBe(2)
  })

  it('should not add duplicate section', () => {
    const guide = DigitalGuide.create(validProps).value
    const result = guide.addSection(validSections[0])
    expect(result.isFail).toBe(true)
  })

  it('should remove section', () => {
    const guide = DigitalGuide.create(validProps).value
    const result = guide.removeSection('sec-1')
    expect(result.isOk).toBe(true)
    expect(result.value.sections).toHaveLength(1)
    expect(result.value.version).toBe(2)
  })

  it('should fail to remove non-existent section', () => {
    const guide = DigitalGuide.create(validProps).value
    const result = guide.removeSection('sec-999')
    expect(result.isFail).toBe(true)
  })

  it('should reorder sections', () => {
    const guide = DigitalGuide.create(validProps).value
    const result = guide.reorderSections(['sec-2', 'sec-1'])
    expect(result.isOk).toBe(true)
    expect(result.value.sections[0].id).toBe('sec-2')
    expect(result.value.sections[0].order).toBe(0)
    expect(result.value.sections[1].id).toBe('sec-1')
    expect(result.value.sections[1].order).toBe(1)
    expect(result.value.version).toBe(2)
  })

  it('should fail reorder with wrong count', () => {
    const guide = DigitalGuide.create(validProps).value
    const result = guide.reorderSections(['sec-1'])
    expect(result.isFail).toBe(true)
  })

  it('should publish guide', () => {
    const guide = DigitalGuide.create(validProps).value
    const result = guide.publish()
    expect(result.isOk).toBe(true)
    expect(result.value.status).toBe('publicado')
  })

  it('should archive guide', () => {
    const guide = DigitalGuide.create(validProps).value
    const published = guide.publish().value
    const result = published.archive()
    expect(result.isOk).toBe(true)
    expect(result.value.status).toBe('arquivado')
  })

  it('should not publish already published guide', () => {
    const guide = DigitalGuide.create(validProps).value
    const published = guide.publish().value
    const result = published.publish()
    expect(result.isFail).toBe(true)
  })

  it('should archive draft', () => {
    const guide = DigitalGuide.create(validProps).value
    const result = guide.archive()
    expect(result.isOk).toBe(true)
    expect(result.value.status).toBe('arquivado')
  })

  it('should get section by id', () => {
    const guide = DigitalGuide.create(validProps).value
    const section = guide.getSection('sec-1')
    expect(section).toBeDefined()
    expect(section!.id).toBe('sec-1')
  })

  it('should get sections by type', () => {
    const guide = DigitalGuide.create(validProps).value
    const wifi = makeSection('sec-wifi', 2, 'wifi')
    const withWifi = guide.addSection(wifi).value
    const wifiSections = withWifi.getSectionsByType('wifi')
    const horariosSections = withWifi.getSectionsByType('horarios')
    expect(wifiSections).toHaveLength(2)
    expect(horariosSections).toHaveLength(1)
  })

  it('should emit events on creation', () => {
    const guide = DigitalGuide.create(validProps).value
    expect(guide.events).toHaveLength(1)
    expect(guide.events[0].type).toBe('GuiaDigitalCriadoEvent')
  })

  it('should emit event on publish', () => {
    const guide = DigitalGuide.create(validProps).value
    const published = guide.publish().value
    expect(published.events).toHaveLength(2)
    expect(published.events[1].type).toBe('GuiaPublicadoEvent')
  })

  it('should restore without events', () => {
    const guide = DigitalGuide.restore(validProps)
    expect(guide.id).toBe('guide-1')
    expect(guide.events).toHaveLength(0)
  })
})
