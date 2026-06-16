import { PrismaClient } from '@prisma/client'
import { Property } from '../../../domain/property/entities/Property'
import { PropertyStatus, Plan, WhatsappChannelType } from '../../../domain/property/enums'
import { Address } from '../../../domain/property/value-objects/Address'
import { ContactInfo } from '../../../domain/property/value-objects/ContactInfo'
import { TrialPeriod } from '../../../domain/property/value-objects/TrialPeriod'
import { Subscription } from '../../../domain/property/value-objects/Subscription'
import { RegistrationNumber } from '../../../domain/property/value-objects/RegistrationNumber'
import { VoiceTokenBudget } from '../../../domain/property/value-objects/VoiceTokenBudget'
import { OperationalWindow } from '../../../domain/property/value-objects/OperationalWindow'
import { CadasturInfo } from '../../../domain/property/value-objects/CadasturInfo'
import { UTMTracking } from '../../../domain/property/value-objects/UTMTracking'
import { PropertyConfiguration } from '../../../domain/property/value-objects/PropertyConfiguration'
import { IPropertyRepository, PropertyFilters } from '../../../application/property/ports/IPropertyRepository'

export class PrismaPropertyRepository implements IPropertyRepository {
  constructor(private prisma: PrismaClient) {}

  async save(property: Property): Promise<Property> {
    const addressJson = {
      street: property.address.street,
      city: property.address.city,
      state: property.address.state,
      zipCode: property.address.zipCode,
      latitude: property.address.latitude,
      longitude: property.address.longitude,
    }

    const contactInfoJson = {
      phone: property.contactInfo.phone,
      whatsapp: property.contactInfo.whatsapp,
      email: property.contactInfo.email,
      website: property.contactInfo.website,
      supplierContact: property.contactInfo.supplierContact,
    }

    const configJson = {
      currencyCode: property.configuration.currencyCode,
      locale: property.configuration.locale,
      timezone: property.configuration.timezone,
      whatsappChannelType: property.configuration.whatsappChannelType,
      checkInHours: property.configuration.operationalWindow.checkInHours,
      cleaningHours: property.configuration.operationalWindow.cleaningHours,
    }

    const utmJson = {
      source: property.utmTracking.source,
      medium: property.utmTracking.medium,
      campaign: property.utmTracking.campaign,
      content: property.utmTracking.content,
      term: property.utmTracking.term,
    }

    const voiceBudgetJson = {
      used: property.voiceBudget.used,
      limit: property.voiceBudget.limit,
    }

    const data: any = {
      name: property.name,
      slug: property.slug,
      description: property.description,
      capacity: property.capacity,
      status: property.status as any,
      plan: property.plan as any,
      isCanary: property.isCanary,
      refSource: property.refSource,
      fnrhEnabled: property.fnrhEnabled,
      fnrhManagerCpf: property.fnrhManagerCpf,
      registrationNumber: property.registrationNumber.value,
      address: property.address.fullAddress(),
      city: property.address.city,
      state: property.address.state,
      zipCode: property.address.zipCode,
      latitude: property.address.latitude,
      longitude: property.address.longitude,
      phone: property.contactInfo.phone,
      whatsapp: property.contactInfo.whatsapp,
      email: property.contactInfo.email,
      website: property.contactInfo.website,
      supplierContact: property.contactInfo.supplierContact,
      currencyCode: property.configuration.currencyCode,
      locale: property.configuration.locale,
      timezone: property.configuration.timezone,
      whatsappChannelType: property.configuration.whatsappChannelType as any,
      checkInWindow: property.configuration.operationalWindow.checkInHours,
      cleaningWindow: property.configuration.operationalWindow.cleaningHours,
      voiceTokensUsed: property.voiceBudget.used,
      voiceTokensLimit: property.voiceBudget.limit,
      utmSource: property.utmTracking.source,
      utmMedium: property.utmTracking.medium,
      utmCampaign: property.utmTracking.campaign,
      utmContent: property.utmTracking.content,
      utmTerm: property.utmTracking.term,
      // JSON columns
      addressJson: addressJson as any,
      contactInfoJson: contactInfoJson as any,
      configJson: configJson as any,
      utmJson: utmJson as any,
      voiceBudgetJson: voiceBudgetJson as any,
    }

    if (property.trialPeriod) {
      data.trialJson = {
        startDate: property.trialPeriod.startDate.toISOString(),
        endDate: property.trialPeriod.endDate.toISOString(),
        notificationSent: property.trialPeriod.notificationSent,
        isExpired: property.trialPeriod.isExpired(),
      } as any
      data.isTrial = property.trialPeriod.isActive()
      data.trialEndsAt = property.trialPeriod.endDate
    }

    if (property.subscription) {
      data.subscriptionJson = {
        plan: property.subscription.plan,
        status: property.subscription.status,
        currentPeriodEnd: property.subscription.currentPeriodEnd.toISOString(),
        cancelAtPeriodEnd: property.subscription.cancelAtPeriodEnd,
        externalSubscriptionId: property.subscription.externalSubscriptionId,
      } as any
      data.cancelAtPeriodEnd = property.subscription.cancelAtPeriodEnd
      data.currentPeriodEnd = property.subscription.currentPeriodEnd
    }

    if (property.cadastur) {
      data.cadasturJson = {
        number: property.cadastur.number,
        status: property.cadastur.status,
        expiryDate: property.cadastur.expiryDate.toISOString(),
      } as any
      data.cadastur = property.cadastur.number
    }

    if (property.pixKey) {
      data.pixKeyType = property.pixKey.type as any
      data.pixKey = property.pixKey.value
    }

    await this.prisma.property.upsert({
      where: { id: property.id },
      create: { id: property.id, userId: '', ...data },
      update: data,
    })

    return property
  }

  async findById(id: string): Promise<Property | null> {
    const row = await this.prisma.property.findUnique({ where: { id } })
    if (!row) return null
    return this.hydrate(row)
  }

  async findBySlug(slug: string): Promise<Property | null> {
    const row = await this.prisma.property.findUnique({ where: { slug } })
    if (!row) return null
    return this.hydrate(row)
  }

  async findByRegistrationNumber(registrationNumber: string): Promise<Property | null> {
    const row = await this.prisma.property.findUnique({
      where: { registrationNumber },
    })
    if (!row) return null
    return this.hydrate(row)
  }

  async findByStatus(status: PropertyStatus): Promise<Property[]> {
    const rows = await this.prisma.property.findMany({
      where: { status: status as any },
    })
    return rows.map(r => this.hydrate(r)).filter(Boolean) as Property[]
  }

  async findExpiringTrials(): Promise<Property[]> {
    const rows = await this.prisma.property.findMany({
      where: {
        status: 'ACTIVE' as any,
        isTrial: true,
        trialEndsAt: { not: null },
      },
    })
    return rows
      .filter(r => {
        if (!r.trialEndsAt) return false
        const diff = Math.ceil((r.trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        return diff === 2
      })
      .map(r => this.hydrate(r))
      .filter(Boolean) as Property[]
  }

  async findExpiredTrials(): Promise<Property[]> {
    const rows = await this.prisma.property.findMany({
      where: {
        status: 'ACTIVE' as any,
        isTrial: true,
        trialEndsAt: { lt: new Date() },
      },
    })
    return rows.map(r => this.hydrate(r)).filter(Boolean) as Property[]
  }

  async findCadasturExpiring(days: number = 30): Promise<Property[]> {
    const future = new Date()
    future.setDate(future.getDate() + days)
    const rows = await this.prisma.property.findMany({
      where: {
        cadasturExpiry: { not: null, lte: future, gte: new Date() },
      },
    })
    return rows.map(r => this.hydrate(r)).filter(Boolean) as Property[]
  }

  async findCadasturExpired(): Promise<Property[]> {
    const rows = await this.prisma.property.findMany({
      where: {
        cadasturExpiry: { lt: new Date() },
      },
    })
    return rows.map(r => this.hydrate(r)).filter(Boolean) as Property[]
  }

  async findSuspended(): Promise<Property[]> {
    return this.findByStatus(PropertyStatus.SUSPENDED)
  }

  async count(filters?: PropertyFilters): Promise<number> {
    const where: any = {}
    if (filters?.status) where.status = filters.status
    if (filters?.plan) where.plan = filters.plan
    if (filters?.isCanary !== undefined) where.isCanary = filters.isCanary
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { slug: { contains: filters.search, mode: 'insensitive' } },
      ]
    }
    return this.prisma.property.count({ where })
  }

  async existsBySlug(slug: string): Promise<boolean> {
    const count = await this.prisma.property.count({ where: { slug } })
    return count > 0
  }

  private hydrate(row: any): Property | null {
    try {
      let address: Address
      if (row.addressJson) {
        const aj = row.addressJson as any
        const addrResult = Address.create({
          street: aj.street,
          city: aj.city,
          state: aj.state,
          zipCode: aj.zipCode,
          latitude: aj.latitude,
          longitude: aj.longitude,
        })
        if (addrResult.isFail) return null
        address = addrResult.value
      } else {
        const addrResult = Address.create({
          street: row.address ?? 'Rua não informada',
          city: row.city ?? 'Cidade não informada',
          state: row.state ?? 'SC',
          zipCode: row.zipCode ?? '00000-000',
          latitude: row.latitude ?? undefined,
          longitude: row.longitude ?? undefined,
        })
        if (addrResult.isFail) return null
        address = addrResult.value
      }

      let contactInfo: ContactInfo
      if (row.contactInfoJson) {
        const cj = row.contactInfoJson as any
        const contactResult = ContactInfo.create({
          phone: cj.phone,
          whatsapp: cj.whatsapp,
          email: cj.email,
          website: cj.website,
          supplierContact: cj.supplierContact,
        })
        if (contactResult.isFail) return null
        contactInfo = contactResult.value
      } else {
        const contactResult = ContactInfo.create({
          phone: row.phone ?? '+5511999999999',
          whatsapp: row.whatsapp ?? '+5511999999999',
          email: row.email ?? 'contato@pousada.com',
          website: row.website ?? undefined,
        })
        if (contactResult.isFail) return null
        contactInfo = contactResult.value
      }

      let configuration: PropertyConfiguration
      if (row.configJson) {
        const cj = row.configJson as any
        const opResult = OperationalWindow.create({
          checkInHours: cj.checkInHours ?? 24,
          cleaningHours: cj.cleaningHours ?? 3,
        })
        if (opResult.isFail) return null
        const configResult = PropertyConfiguration.create({
          currencyCode: cj.currencyCode ?? 'BRL',
          locale: cj.locale ?? 'pt-BR',
          timezone: cj.timezone ?? 'America/Sao_Paulo',
          whatsappChannelType: cj.whatsappChannelType as WhatsappChannelType ?? WhatsappChannelType.GUESTS_ONLY,
          operationalWindow: opResult.value,
        })
        if (configResult.isFail) return null
        configuration = configResult.value
      } else {
        const opResult = OperationalWindow.create({
          checkInHours: row.checkInWindow ?? 24,
          cleaningHours: row.cleaningWindow ?? 3,
        })
        if (opResult.isFail) return null
        const configResult = PropertyConfiguration.create({
          currencyCode: row.currencyCode ?? 'BRL',
          locale: row.locale ?? 'pt-BR',
          timezone: row.timezone ?? 'America/Sao_Paulo',
          whatsappChannelType: (row.whatsappChannelType as WhatsappChannelType) ?? WhatsappChannelType.GUESTS_ONLY,
          operationalWindow: opResult.value,
        })
        if (configResult.isFail) return null
        configuration = configResult.value
      }

      let utmTracking: UTMTracking
      if (row.utmJson) {
        const uj = row.utmJson as any
        const utmResult = UTMTracking.create({
          source: uj.source,
          medium: uj.medium,
          campaign: uj.campaign,
          content: uj.content,
          term: uj.term,
        })
        utmTracking = utmResult.isOk ? utmResult.value : UTMTracking.create({}).value
      } else {
        const utmResult = UTMTracking.create({
          source: row.utmSource ?? undefined,
          medium: row.utmMedium ?? undefined,
          campaign: row.utmCampaign ?? undefined,
          content: row.utmContent ?? undefined,
          term: row.utmTerm ?? undefined,
        })
        utmTracking = utmResult.isOk ? utmResult.value : UTMTracking.create({}).value
      }

      let voiceBudget: VoiceTokenBudget
      if (row.voiceBudgetJson) {
        const vj = row.voiceBudgetJson as any
        voiceBudget = VoiceTokenBudget.restore(vj.used ?? 0, vj.limit ?? 100000).value
      } else {
        voiceBudget = VoiceTokenBudget.restore(
          row.voiceTokensUsed ?? 0,
          row.voiceTokensLimit ?? 100000
        ).value
      }

      let trialPeriod: TrialPeriod | undefined
      if (row.trialJson) {
        const tj = row.trialJson as any
        const trialResult = TrialPeriod.create(new Date(tj.startDate), 7)
        if (trialResult.isOk) {
          let tp = trialResult.value
          if (tj.notificationSent) tp = tp.markNotificationSent()
          if (tj.isExpired) tp = tp.expire()
          trialPeriod = tp
        }
      } else if (row.trialEndsAt) {
        const trialResult = TrialPeriod.create(
          new Date(row.createdAt),
          7
        )
        if (trialResult.isOk) {
          trialPeriod = trialResult.value
        }
      }

      let subscription: Subscription | undefined
      if (row.subscriptionJson) {
        const sj = row.subscriptionJson as any
        const subResult = Subscription.create({
          plan: sj.plan as Plan,
          status: sj.status as any,
          currentPeriodEnd: new Date(sj.currentPeriodEnd),
          cancelAtPeriodEnd: sj.cancelAtPeriodEnd,
          externalSubscriptionId: sj.externalSubscriptionId,
        })
        if (subResult.isOk) subscription = subResult.value
      }

      let cadasturInfo: CadasturInfo | undefined = undefined
      if (row.cadasturJson) {
        const cj = row.cadasturJson as any
        const cadResult = CadasturInfo.create({
          number: cj.number,
          status: cj.status as any,
          expiryDate: new Date(cj.expiryDate),
        })
        if (cadResult.isOk) cadasturInfo = cadResult.value
      }

      let registrationNumber: RegistrationNumber
      if (row.registrationNumber) {
        const rnResult = RegistrationNumber.create(row.registrationNumber)
        if (rnResult.isFail) return null
        registrationNumber = rnResult.value
      } else {
        const rnResult = RegistrationNumber.generate(1, Plan.LITE, row.state ?? 'SC')
        if (rnResult.isFail) return null
        registrationNumber = rnResult.value
      }

      const property = Property.restore({
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description ?? undefined,
        address,
        contactInfo,
        status: row.status as PropertyStatus,
        plan: row.plan as Plan,
        trialPeriod,
        subscription,
        registrationNumber,
        voiceBudget,
        configuration,
        cadastur: cadasturInfo,
        utmTracking,
        fnrhEnabled: row.fnrhEnabled ?? false,
        fnrhManagerCpf: row.fnrhManagerCpf ?? undefined,
        capacity: row.capacity ?? 10,
        isCanary: row.isCanary ?? false,
        refSource: row.refSource ?? undefined,
        createdAt: row.createdAt ?? new Date(),
        updatedAt: row.updatedAt ?? new Date(),
      })

      return property
    } catch {
      return null
    }
  }
}
