import { Result } from '../../shared/Result'
import { GuideSectionType } from '../enums'

interface LocalizedContent {
  title: string
  content: string
  language: string
}

export interface GuideSectionProps {
  id: string
  sectionType: GuideSectionType
  icon?: string | null
  order: number
  content: LocalizedContent[]
}

export class GuideSection {
  private constructor(public readonly props: Readonly<GuideSectionProps>) {
    Object.freeze(this)
  }

  static create(props: GuideSectionProps): Result<GuideSection, Error> {
    if (!props.id || props.id.trim().length === 0) {
      return Result.fail(new Error('ID da seção é obrigatório'))
    }
    if (props.order < 0) {
      return Result.fail(new Error('Ordem da seção não pode ser negativa'))
    }
    if (!props.content || props.content.length === 0) {
      return Result.fail(new Error('Seção precisa ter ao menos um conteúdo localizado'))
    }
    for (const loc of props.content) {
      if (!loc.title || loc.title.trim().length === 0) {
        return Result.fail(new Error('Título localizado é obrigatório'))
      }
      if (!loc.content || loc.content.trim().length === 0) {
        return Result.fail(new Error('Conteúdo localizado é obrigatório'))
      }
      if (!loc.language || loc.language.trim().length === 0) {
        return Result.fail(new Error('Idioma é obrigatório'))
      }
    }

    return Result.ok(new GuideSection({
      ...props,
      content: props.content.map(c => ({ ...c })),
      icon: props.icon ?? null,
    }))
  }

  static restore(props: GuideSectionProps): GuideSection {
    return new GuideSection({ ...props, icon: props.icon ?? null })
  }

  get id(): string { return this.props.id }
  get sectionType(): GuideSectionType { return this.props.sectionType }
  get icon(): string | null { return this.props.icon ?? null }
  get order(): number { return this.props.order }
  get content(): LocalizedContent[] { return [...this.props.content] }

  getContentForLanguage(language: string): LocalizedContent | undefined {
    return this.props.content.find(c => c.language === language)
  }

  translate(language: string, title: string, content: string): Result<GuideSection, Error> {
    const newContent = this.props.content.filter(c => c.language !== language)
    newContent.push({ language, title, content })
    return GuideSection.create({
      ...this.props,
      content: newContent,
    })
  }

  equals(other: GuideSection): boolean {
    return this.props.id === other.props.id
  }
}
