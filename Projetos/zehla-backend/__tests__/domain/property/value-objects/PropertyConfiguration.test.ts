import { describe, it, expect } from 'vitest'
import { PropertyConfiguration } from '../../../../src/domain/property/value-objects/PropertyConfiguration'
import { WhatsappChannelType } from '../../../../src/domain/property/enums'
import { OperationalWindow } from '../../../../src/domain/property/value-objects/OperationalWindow'

describe('PropertyConfiguration', () => {
  it('should create with defaults', () => {
    const result = PropertyConfiguration.create()
    expect(result.isOk).toBe(true)
    expect(result.value.currencyCode).toBe('BRL')
    expect(result.value.locale).toBe('pt-BR')
    expect(result.value.timezone).toBe('America/Sao_Paulo')
    expect(result.value.whatsappChannelType).toBe(WhatsappChannelType.GUESTS_ONLY)
    expect(result.value.operationalWindow.checkInHours).toBe(24)
  })

  it('should create with overrides', () => {
    const opWindow = OperationalWindow.create({ checkInHours: 12, cleaningHours: 2 }).value
    const result = PropertyConfiguration.create({
      currencyCode: 'USD',
      locale: 'en-US',
      timezone: 'America/New_York',
      whatsappChannelType: WhatsappChannelType.GUESTS_AND_SUPPLIERS,
      operationalWindow: opWindow,
    })
    expect(result.isOk).toBe(true)
    expect(result.value.currencyCode).toBe('USD')
    expect(result.value.locale).toBe('en-US')
    expect(result.value.timezone).toBe('America/New_York')
    expect(result.value.whatsappChannelType).toBe(WhatsappChannelType.GUESTS_AND_SUPPLIERS)
  })

  it('should fail with invalid currency', () => {
    const result = PropertyConfiguration.create({ currencyCode: 'XYZ' })
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('currency')
  })

  it('should fail with invalid locale', () => {
    const result = PropertyConfiguration.create({ locale: 'xx-XX' })
    expect(result.isFail).toBe(true)
  })

  it('should fail with invalid timezone', () => {
    const result = PropertyConfiguration.create({ timezone: 'Mars/Olympus' })
    expect(result.isFail).toBe(true)
  })

  it('should update configuration', () => {
    const config = PropertyConfiguration.create().value
    const opWindow = OperationalWindow.create({ checkInHours: 48, cleaningHours: 6 }).value
    const updated = config.update({ operationalWindow: opWindow, locale: 'en-US' })
    expect(updated.isOk).toBe(true)
    expect(updated.value.operationalWindow.checkInHours).toBe(48)
    expect(updated.value.locale).toBe('en-US')
    expect(updated.value.currencyCode).toBe('BRL') // unchanged
  })

  it('should check equality', () => {
    const a = PropertyConfiguration.create({ locale: 'en-US' }).value
    const b = PropertyConfiguration.create({ locale: 'en-US' }).value
    const c = PropertyConfiguration.create().value
    expect(a.equals(b)).toBe(true)
    expect(a.equals(c)).toBe(false)
  })

  it('should restore from persisted data', () => {
    const opWindow = OperationalWindow.create({ checkInHours: 24, cleaningHours: 3 }).value
    const restored = PropertyConfiguration.restore({
      operationalWindow: opWindow,
      currencyCode: 'BRL',
      locale: 'pt-BR',
      timezone: 'America/Sao_Paulo',
      whatsappChannelType: WhatsappChannelType.GUESTS_ONLY,
    })
    expect(restored.currencyCode).toBe('BRL')
    expect(restored.locale).toBe('pt-BR')
  })
})
