import { Result } from '../../../domain/shared/Result'
import { Address } from '../../../domain/property/value-objects/Address'
import { ContactInfo } from '../../../domain/property/value-objects/ContactInfo'
import { OperationalWindow } from '../../../domain/property/value-objects/OperationalWindow'
import { IPropertyRepository } from '../ports/IPropertyRepository'

export interface AtualizarConfiguracaoInput {
  propertyId: string
  address?: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
    latitude?: number
    longitude?: number
  }
  contactInfo?: {
    phone?: string
    whatsapp?: string
    email?: string
    website?: string
  }
  operationalWindow?: {
    checkInHours?: number
    cleaningHours?: number
  }
  capacity?: number
}

export interface AtualizarConfiguracaoOutput {
  id: string
  changedFields: string[]
}

export class AtualizarConfiguracaoUseCase {
  constructor(private propertyRepo: IPropertyRepository) {}

  async execute(input: AtualizarConfiguracaoInput): Promise<Result<AtualizarConfiguracaoOutput, string>> {
    const property = await this.propertyRepo.findById(input.propertyId)
    if (!property) {
      return Result.fail('Property não encontrada')
    }

    const updateConfig: {
      address?: Address
      contactInfo?: ContactInfo
      configuration?: {
        operationalWindow?: OperationalWindow
      }
    } = {}
    const changedFields: string[] = []

    if (input.capacity !== undefined) {
      const capResult = property.updateCapacity(input.capacity)
      if (capResult.isFail) return Result.fail(capResult.error)
      changedFields.push('capacity')
    }

    if (input.address) {
      const mergedAddress = {
        street: input.address.street ?? property.address.street,
        city: input.address.city ?? property.address.city,
        state: input.address.state ?? property.address.state,
        zipCode: input.address.zipCode ?? property.address.zipCode,
        latitude: input.address.latitude ?? property.address.latitude,
        longitude: input.address.longitude ?? property.address.longitude,
      }
      const addressResult = Address.create(mergedAddress)
      if (addressResult.isFail) return Result.fail(addressResult.error)
      updateConfig.address = addressResult.value
      changedFields.push('address')
    }

    if (input.contactInfo) {
      const mergedContact = {
        phone: input.contactInfo.phone ?? property.contactInfo.phone,
        whatsapp: input.contactInfo.whatsapp ?? property.contactInfo.whatsapp,
        email: input.contactInfo.email ?? property.contactInfo.email,
        website: input.contactInfo.website ?? property.contactInfo.website,
      }
      const contactResult = ContactInfo.create(mergedContact)
      if (contactResult.isFail) return Result.fail(contactResult.error)
      updateConfig.contactInfo = contactResult.value
      changedFields.push('contactInfo')
    }

    if (input.operationalWindow) {
      const mergedOp = {
        checkInHours: input.operationalWindow.checkInHours ?? property.configuration.operationalWindow.checkInHours,
        cleaningHours: input.operationalWindow.cleaningHours ?? property.configuration.operationalWindow.cleaningHours,
      }
      const opResult = OperationalWindow.create(mergedOp)
      if (opResult.isFail) return Result.fail(opResult.error)
      updateConfig.configuration = {
        ...updateConfig.configuration,
        operationalWindow: opResult.value,
      }
      changedFields.push('operationalWindow')
    }

    if (Object.keys(updateConfig).length > 0) {
      const configResult = property.updateConfiguration(updateConfig)
      if (configResult.isFail) return Result.fail(configResult.error)
    }

    if (changedFields.length > 0) {
      await this.propertyRepo.save(property)
      property.clearEvents()
    }

    return Result.ok({
      id: property.id,
      changedFields,
    })
  }
}
