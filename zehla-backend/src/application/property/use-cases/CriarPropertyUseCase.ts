import { Result } from '../../../domain/shared/Result'
import { Property } from '../../../domain/property/entities/Property'
import { Plan } from '../../../domain/property/enums'
import { Address } from '../../../domain/property/value-objects/Address'
import { ContactInfo } from '../../../domain/property/value-objects/ContactInfo'
import { UTMTracking } from '../../../domain/property/value-objects/UTMTracking'
import { IPropertyRepository } from '../ports/IPropertyRepository'
import { RegistrationNumberGenerator } from '../../../domain/property/services/RegistrationNumberGenerator'

export interface CriarPropertyInput {
  id: string
  name: string
  slug: string
  description?: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    latitude?: number
    longitude?: number
  }
  contactInfo: {
    phone: string
    whatsapp: string
    email: string
    website?: string
  }
  capacity: number
  state: string
  isCanary?: boolean
  refSource?: string
  utmTracking?: {
    source?: string
    medium?: string
    campaign?: string
    content?: string
    term?: string
  }
}

export interface CriarPropertyOutput {
  id: string
  name: string
  slug: string
  status: string
  plan: string
  registrationNumber: string
  capacity: number
  createdAt: string
}

export class CriarPropertyUseCase {
  constructor(
    private propertyRepo: IPropertyRepository,
    private registrationNumberGenerator: RegistrationNumberGenerator
  ) {}

  async execute(input: CriarPropertyInput): Promise<Result<CriarPropertyOutput, string>> {
    const slugExists = await this.propertyRepo.existsBySlug(input.slug)
    if (slugExists) {
      return Result.fail('Slug já está em uso')
    }

    const addressResult = Address.create(input.address)
    if (addressResult.isFail) return Result.fail(addressResult.error)

    const contactResult = ContactInfo.create(input.contactInfo)
    if (contactResult.isFail) return Result.fail(contactResult.error)

    let utm: UTMTracking
    if (input.utmTracking) {
      const utmResult = UTMTracking.create(input.utmTracking)
      if (utmResult.isFail) return Result.fail(utmResult.error)
      utm = utmResult.value
    } else {
      utm = UTMTracking.create({}).value
    }

    const totalProperties = await this.propertyRepo.count()
    const regNumberResult = this.registrationNumberGenerator.generate(
      totalProperties,
      Plan.LITE,
      input.state
    )
    if (regNumberResult.isFail) return Result.fail(regNumberResult.error)

    const propertyResult = Property.create({
      id: input.id,
      name: input.name,
      slug: input.slug,
      description: input.description,
      address: addressResult.value,
      contactInfo: contactResult.value,
      capacity: input.capacity,
      registrationNumber: regNumberResult.value,
      isCanary: input.isCanary,
      refSource: input.refSource,
      utmTracking: utm,
    })
    if (propertyResult.isFail) return Result.fail(propertyResult.error)

    const property = propertyResult.value
    await this.propertyRepo.save(property)
    property.clearEvents()

    return Result.ok({
      id: property.id,
      name: property.name,
      slug: property.slug,
      status: property.status,
      plan: property.plan,
      registrationNumber: property.registrationNumber.value,
      capacity: property.capacity,
      createdAt: property.createdAt.toISOString(),
    })
  }
}
