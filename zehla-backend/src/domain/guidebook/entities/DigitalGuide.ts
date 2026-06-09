import { Result } from '../../shared/Result'
import { GuideSection } from '../value-objects/GuideSection'
import { GuideStatus } from '../enums'

const STATUS_TRANSICOES: Record<GuideStatus, GuideStatus[]> = {
  rascunho: ['publicado', 'arquivado'],
  publicado: ['rascunho', 'arquivado'],
  arquivado: [],
}

export interface DigitalGuideProps {
  id: string
  propertyId: string
  sections: GuideSection[]
  status?: GuideStatus
  version?: number
  createdAt?: Date
  updatedAt?: Date
}

export class DigitalGuide {
  public readonly id: string
  public readonly propertyId: string
  public readonly sections: GuideSection[]
  public readonly status: GuideStatus
  public readonly version: number
  public readonly createdAt: Date
  public readonly updatedAt: Date
  private _events: Array<{ type: string; payload: Record<string, unknown> }>

  private constructor(props: DigitalGuideProps, events: Array<{ type: string; payload: Record<string, unknown> }> = []) {
    this.id = props.id
    this.propertyId = props.propertyId
    this.sections = [...props.sections]
    this.status = props.status ?? 'rascunho'
    this.version = props.version ?? 1
    this.createdAt = props.createdAt ?? new Date()
    this.updatedAt = props.updatedAt ?? new Date()
    this._events = events
    Object.freeze(this)
  }

  static create(props: DigitalGuideProps): Result<DigitalGuide, Error> {
    if (!props.id || props.id.trim().length === 0) {
      return Result.fail(new Error('ID do guia é obrigatório'))
    }
    if (!props.propertyId || props.propertyId.trim().length === 0) {
      return Result.fail(new Error('ID da propriedade é obrigatório'))
    }
    if (!props.sections || props.sections.length === 0) {
      return Result.fail(new Error('Guia precisa ter ao menos uma seção'))
    }

    const events = [
      {
        type: 'GuiaDigitalCriadoEvent',
        payload: {
          guiaId: props.id,
          propertyId: props.propertyId,
          totalSections: props.sections.length,
        },
      },
    ]

    return Result.ok(new DigitalGuide(props, events))
  }

  static restore(props: DigitalGuideProps): DigitalGuide {
    return new DigitalGuide(props)
  }

  addSection(section: GuideSection): Result<DigitalGuide, Error> {
    const exists = this.sections.some(s => s.id === section.id)
    if (exists) {
      return Result.fail(new Error('Seção já existe no guia'))
    }
    const newSections = [...this.sections, section].sort((a, b) => a.order - b.order)
    const newEvents = [...this._events, {
      type: 'SecaoAdicionadaEvent',
      payload: {
        guiaId: this.id,
        sectionId: section.id,
        sectionType: section.sectionType,
      },
    }]
    return Result.ok(new DigitalGuide({
      ...this,
      sections: newSections,
      version: this.version + 1,
      updatedAt: new Date(),
    }, newEvents))
  }

  removeSection(sectionId: string): Result<DigitalGuide, Error> {
    const section = this.sections.find(s => s.id === sectionId)
    if (!section) {
      return Result.fail(new Error('Seção não encontrada no guia'))
    }
    const newSections = this.sections.filter(s => s.id !== sectionId)
    const newEvents = [...this._events, {
      type: 'SecaoRemovidaEvent',
      payload: {
        guiaId: this.id,
        sectionId,
      },
    }]
    return Result.ok(new DigitalGuide({
      ...this,
      sections: newSections,
      version: this.version + 1,
      updatedAt: new Date(),
    }, newEvents))
  }

  reorderSections(orderedIds: string[]): Result<DigitalGuide, Error> {
    if (orderedIds.length !== this.sections.length) {
      return Result.fail(new Error('Número de IDs não corresponde ao número de seções'))
    }
    const sectionMap = new Map(this.sections.map(s => [s.id, s]))
    const newSections: GuideSection[] = []
    for (let i = 0; i < orderedIds.length; i++) {
      const section = sectionMap.get(orderedIds[i])
      if (!section) {
        return Result.fail(new Error(`Seção ${orderedIds[i]} não encontrada`))
      }
      const reorderedResult = GuideSection.create({
        ...section.props,
        order: i,
      })
      if (reorderedResult.isFail) return Result.fail(reorderedResult.error)
      newSections.push(reorderedResult.value)
    }
    return Result.ok(new DigitalGuide({
      ...this,
      sections: newSections,
      version: this.version + 1,
      updatedAt: new Date(),
    }, [...this._events]))
  }

  publish(): Result<DigitalGuide, Error> {
    if (!STATUS_TRANSICOES[this.status].includes('publicado')) {
      return Result.fail(new Error(`Guia ${this.status} não pode ser publicado`))
    }
    const newEvents = [...this._events, {
      type: 'GuiaPublicadoEvent',
      payload: {
        guiaId: this.id,
        propertyId: this.propertyId,
        version: this.version,
      },
    }]
    return Result.ok(new DigitalGuide({
      ...this, status: 'publicado', updatedAt: new Date(),
    }, newEvents))
  }

  archive(): Result<DigitalGuide, Error> {
    if (!STATUS_TRANSICOES[this.status].includes('arquivado')) {
      return Result.fail(new Error(`Guia ${this.status} não pode ser arquivado`))
    }
    return Result.ok(new DigitalGuide({
      ...this, status: 'arquivado', updatedAt: new Date(),
    }, [...this._events]))
  }

  getSection(sectionId: string): GuideSection | undefined {
    return this.sections.find(s => s.id === sectionId)
  }

  getSectionsByType(sectionType: string): GuideSection[] {
    return this.sections.filter(s => s.sectionType === sectionType)
  }

  get events(): Array<{ type: string; payload: Record<string, unknown> }> {
    return [...this._events]
  }
}
