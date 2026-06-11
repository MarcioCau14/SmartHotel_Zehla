import { DomainEvent } from '../../shared/DomainEvent'
import { GuideSection } from '../value-objects/GuideSection'

export class DigitalGuidePublishedEvent implements DomainEvent {
  public readonly aggregateId: string
  public readonly eventName = 'DigitalGuidePublishedEvent'
  public readonly occurredAt: Date
  public readonly payload: {
    propertyId: string
    sections: Array<{
      id: string
      sectionType: string
      icon: string | null
      order: number
      content: Array<{ title: string; content: string; language: string }>
    }>
  }

  constructor(guideId: string, propertyId: string, sections: GuideSection[]) {
    this.aggregateId = guideId
    this.occurredAt = new Date()
    this.payload = {
      propertyId,
      sections: sections.map(s => ({
        id: s.id,
        sectionType: s.sectionType,
        icon: s.icon,
        order: s.order,
        content: s.content,
      }))
    }
  }
}
