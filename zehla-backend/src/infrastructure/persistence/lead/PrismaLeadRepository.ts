import { PrismaClient } from '@prisma/client'
import { Lead } from '../../../domain/lead/entities/Lead'
import { LeadContactInfo } from '../../../domain/lead/value-objects/LeadContactInfo'
import { BusinessProfile } from '../../../domain/lead/value-objects/BusinessProfile'
import { BehaviorSignals } from '../../../domain/lead/value-objects/BehaviorSignals'
import { LeadScore } from '../../../domain/lead/value-objects/LeadScore'
import { FunnelPosition } from '../../../domain/lead/value-objects/FunnelPosition'
import { SwipeTracking } from '../../../domain/lead/value-objects/SwipeTracking'
import { UTMParams } from '../../../domain/lead/value-objects/UTMParams'
import { LeadStatus } from '../../../domain/lead/LeadStatus'
import { ILeadRepository, LeadFilters, LeadAggregate } from '../../../application/lead/ports/ILeadRepository'

export class PrismaLeadRepository implements ILeadRepository {
  constructor(private prisma: PrismaClient) {}

  async save(lead: Lead): Promise<Lead> {
    const data = lead.toJSON()
    await this.prisma.lead.create({
      data: {
        id: data.id,
        name: data.contact.name,
        email: data.contact.email,
        phone: data.contact.phone,
        whatsapp: data.contact.whatsapp,
        phoneSecondary: data.contact.phoneSecondary,
        socialMedia: data.contact.socialMedia,
        site: data.contact.site,
        property: data.business.property,
        city: data.business.city,
        state: data.business.state,
        region: data.business.region,
        latitude: data.business.latitude,
        longitude: data.business.longitude,
        roomsCount: data.business.roomsCount,
        instagramFollowers: data.business.instagramFollowers,
        googleReviewsCount: data.business.googleReviewsCount,
        googleRating: data.business.googleRating,
        hasWebsite: data.business.hasWebsite,
        otaDependenceLevel: data.business.otaDependenceLevel,
        otaCommissionLost: data.business.otaCommissionLost,
        category: data.business.category,
        painPoints: data.behavior.painPoints,
        observacoes: data.behavior.observacoes,
        notes: data.behavior.notes,
        estimatedValues: data.behavior.estimatedValues,
        intentSignals: data.behavior.intentSignals,
        buyingBehavior: data.behavior.buyingBehavior,
        conversionProbability: data.behavior.conversionProbability,
        objectKeywords: data.behavior.objectKeywords,
        recommendedPitch: data.behavior.recommendedPitch,
        score: data.score.score,
        scoreValid: data.score.scoreValid,
        validationScore: data.score.validationScore,
        conversionScore: data.score.conversionScore,
        validationStatus: data.score.validationStatus,
        qualification: data.score.qualification,
        status: data.funnel.status as any,
        funnelStage: data.funnel.funnelStage,
        source: data.funnel.source,
        leadTier: 'COLD',
        cluster: data.score.cluster,
        tierSugerido: data.funnel.tierSugerido,
        tierConfidence: data.funnel.tierConfidence,
        behavioralProfile: data.funnel.behavioralProfile,
        lastSwipeAction: data.swipe.lastSwipeAction,
        lastSwipeUsedId: data.swipe.lastSwipeUsedId,
        propertyId: data.propertyId,
        lastInteractionAt: data.lastInteractionAt ? new Date(data.lastInteractionAt) : undefined,
      },
    })
    return lead
  }

  async update(lead: Lead): Promise<Lead> {
    const data = lead.toJSON()
    await this.prisma.lead.update({
      where: { id: data.id },
      data: {
        name: data.contact.name,
        email: data.contact.email,
        phone: data.contact.phone,
        whatsapp: data.contact.whatsapp,
        phoneSecondary: data.contact.phoneSecondary,
        socialMedia: data.contact.socialMedia,
        site: data.contact.site,
        property: data.business.property,
        city: data.business.city,
        state: data.business.state,
        region: data.business.region,
        latitude: data.business.latitude,
        longitude: data.business.longitude,
        roomsCount: data.business.roomsCount,
        instagramFollowers: data.business.instagramFollowers,
        googleReviewsCount: data.business.googleReviewsCount,
        googleRating: data.business.googleRating,
        hasWebsite: data.business.hasWebsite,
        otaDependenceLevel: data.business.otaDependenceLevel,
        otaCommissionLost: data.business.otaCommissionLost,
        category: data.business.category,
        painPoints: data.behavior.painPoints,
        observacoes: data.behavior.observacoes,
        notes: data.behavior.notes,
        estimatedValues: data.behavior.estimatedValues,
        intentSignals: data.behavior.intentSignals,
        buyingBehavior: data.behavior.buyingBehavior,
        conversionProbability: data.behavior.conversionProbability,
        objectKeywords: data.behavior.objectKeywords,
        recommendedPitch: data.behavior.recommendedPitch,
        score: data.score.score,
        scoreValid: data.score.scoreValid,
        validationScore: data.score.validationScore,
        conversionScore: data.score.conversionScore,
        validationStatus: data.score.validationStatus,
        qualification: data.score.qualification,
        status: data.funnel.status as any,
        funnelStage: data.funnel.funnelStage,
        source: data.funnel.source,
        leadTier: 'COLD',
        cluster: data.score.cluster,
        tierSugerido: data.funnel.tierSugerido,
        tierConfidence: data.funnel.tierConfidence,
        behavioralProfile: data.funnel.behavioralProfile,
        lastSwipeAction: data.swipe.lastSwipeAction,
        lastSwipeUsedId: data.swipe.lastSwipeUsedId,
        propertyId: data.propertyId,
        lastInteractionAt: data.lastInteractionAt ? new Date(data.lastInteractionAt) : undefined,
      },
    })
    return lead
  }

  async findById(id: string): Promise<Lead | null> {
    const row = await this.prisma.lead.findUnique({ where: { id } })
    if (!row) return null
    return this.hydrate(row)
  }

  async findByEmail(email: string): Promise<Lead | null> {
    const row = await this.prisma.lead.findUnique({ where: { email } })
    if (!row) return null
    return this.hydrate(row)
  }

  async findByPhone(phone: string): Promise<Lead | null> {
    const cleaned = phone.replace(/\D/g, '')
    const row = await this.prisma.lead.findFirst({
      where: {
        OR: [
          { phone: { equals: cleaned } },
          { whatsapp: { equals: cleaned } },
        ],
      },
    })
    if (!row) return null
    return this.hydrate(row)
  }

  async findMany(filters?: LeadFilters): Promise<Lead[]> {
    const where: any = {}
    if (filters) {
      if (filters.propertyId) where.propertyId = filters.propertyId
      if (filters.status) {
        where.status = Array.isArray(filters.status)
          ? { in: filters.status }
          : filters.status
      }
      if (filters.source) where.source = filters.source
      if (filters.minScore !== undefined) where.score = { ...where.score, gte: filters.minScore }
      if (filters.maxScore !== undefined) where.score = { ...where.score, lte: filters.maxScore }
      if (filters.city) where.city = filters.city
      if (filters.state) where.state = filters.state
      if (filters.region) where.region = filters.region
      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { city: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
        ]
      }
    }

    const rows = await this.prisma.lead.findMany({
      where,
      orderBy: { score: 'desc' },
      take: filters?.limit ?? 3000,
      skip: filters?.offset,
    })

    return rows.map((r) => this.hydrate(r)).filter(Boolean) as Lead[]
  }

  async count(filters?: LeadFilters): Promise<number> {
    const where: any = {}
    if (filters?.propertyId) where.propertyId = filters.propertyId
    if (filters?.status) {
      where.status = Array.isArray(filters.status)
        ? { in: filters.status }
        : filters.status
    }
    return this.prisma.lead.count({ where })
  }

  async aggregate(filters?: LeadFilters): Promise<LeadAggregate> {
    const where: any = {}
    if (filters?.propertyId) where.propertyId = filters.propertyId
    if (filters?.state) where.state = filters.state
    if (filters?.region) where.region = filters.region

    const [stats, byRegion] = await Promise.all([
      this.prisma.lead.aggregate({
        where,
        _count: true,
        _avg: { score: true, validationScore: true },
      }),
      this.prisma.lead.groupBy({
        by: ['region'],
        _count: true,
        where,
      }),
    ])

    return {
      total: stats._count,
      avgScore: Math.round(stats._avg.score ?? 0),
      avgValidationScore: Math.round(stats._avg.validationScore ?? 0),
      byRegion: byRegion.map((r) => ({ name: r.region ?? 'unknown', count: r._count })),
    }
  }

  async delete(id: string): Promise<void> {
    await this.prisma.lead.delete({ where: { id } })
  }

  private hydrate(row: any): Lead | null {
    const contactResult = LeadContactInfo.create({
      name: row.name,
      email: row.email ?? undefined,
      phone: row.phone ?? undefined,
      whatsapp: row.whatsapp ?? undefined,
      phoneSecondary: row.phoneSecondary ?? undefined,
      socialMedia: row.socialMedia ?? undefined,
      site: row.site ?? undefined,
    })
    if (contactResult.isFail) return null

    const businessResult = BusinessProfile.create({
      property: row.property ?? undefined,
      category: row.category ?? undefined,
      city: row.city ?? undefined,
      state: row.state ?? undefined,
      region: row.region ?? undefined,
      latitude: row.latitude ?? undefined,
      longitude: row.longitude ?? undefined,
      roomsCount: row.roomsCount ?? undefined,
      instagramFollowers: row.instagramFollowers ?? undefined,
      googleReviewsCount: row.googleReviewsCount ?? undefined,
      googleRating: row.googleRating ?? undefined,
      hasWebsite: row.hasWebsite ?? false,
      otaDependenceLevel: row.otaDependenceLevel ?? undefined,
      otaCommissionLost: row.otaCommissionLost ?? undefined,
    })
    if (businessResult.isFail) return null

    const behaviorResult = BehaviorSignals.create({
      painPoints: row.painPoints ?? undefined,
      observacoes: row.observacoes ?? undefined,
      notes: row.notes ?? undefined,
      estimatedValues: row.estimatedValues ?? undefined,
      intentSignals: row.intentSignals ?? undefined,
      buyingBehavior: row.buyingBehavior ?? undefined,
      conversionProbability: row.conversionProbability ?? undefined,
      objectKeywords: row.objectKeywords ?? undefined,
      recommendedPitch: row.recommendedPitch ?? undefined,
    })
    if (behaviorResult.isFail) return null

    const scoreResult = LeadScore.create({
      score: row.score ?? 0,
      scoreValid: row.scoreValid ?? undefined,
      validationScore: row.validationScore ?? undefined,
      conversionScore: row.conversionScore ?? undefined,
      validationStatus: row.validationStatus ?? undefined,
      qualification: row.qualification ?? undefined,
    })
    if (scoreResult.isFail) return null

    const funnelResult = FunnelPosition.create({
      status: row.status as LeadStatus,
      funnelStage: (row.funnelStage ?? 'NEUTRAL') as any,
      source: row.source ?? 'SECRETARIA_AI',
      previousCluster: row.previousCluster ?? undefined,
      tierSugerido: row.tierSugerido ?? undefined,
      tierConfidence: row.tierConfidence ?? undefined,
      behavioralProfile: row.behavioralProfile ?? undefined,
    })
    if (funnelResult.isFail) return null

    const swipeResult = SwipeTracking.create({
      lastSwipeAction: row.lastSwipeAction ?? undefined,
      lastSwipeUsedId: row.lastSwipeUsedId ?? undefined,
    })
    if (swipeResult.isFail) return null

    const id = row.id
    const propertyId = row.propertyId ?? undefined

    const utm = undefined

    const leadResult = Lead.create({
      id,
      contact: contactResult.value,
      business: businessResult.value,
      behavior: behaviorResult.value,
      source: funnelResult.value.source,
      propertyId,
      utm,
    })
    if (leadResult.isFail) return null

    const lead = leadResult.value
    ;(lead as any).data.score = scoreResult.value
    ;(lead as any).data.funnel = funnelResult.value
    ;(lead as any).data.swipe = swipeResult.value
    ;(lead as any).data.lastInteractionAt = row.lastInteractionAt ?? undefined

    return lead
  }
}
