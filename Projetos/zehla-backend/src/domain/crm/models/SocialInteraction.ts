import { Result } from '../../../shared/Result'

export const SOCIAL_PLATFORMS = ['INSTAGRAM', 'FACEBOOK', 'WHATSAPP_STATUS'] as const
export type SocialPlatform = typeof SOCIAL_PLATFORMS[number]

export interface SocialInteractionProps {
  readonly platform: SocialPlatform
  readonly username: string
  readonly content: string
  readonly timestamp: number
  readonly isDirectMessage: boolean
}

export class SocialInteraction {
  private constructor(public readonly data: Readonly<SocialInteractionProps>) {
    Object.freeze(this)
  }

  static create(props: SocialInteractionProps): Result<SocialInteraction, Error> {
    if (!SOCIAL_PLATFORMS.includes(props.platform)) {
      return Result.fail(new Error(`Plataforma inválida: ${props.platform}`))
    }
    if (!props.username || props.username.trim().length === 0) {
      return Result.fail(new Error('Username é obrigatório'))
    }
    if (!props.content || props.content.trim().length === 0) {
      return Result.fail(new Error('Conteúdo da interação é obrigatório'))
    }
    if (props.timestamp <= 0) {
      return Result.fail(new Error('Timestamp deve ser um número positivo'))
    }

    return Result.ok(new SocialInteraction({
      platform: props.platform,
      username: props.username.trim(),
      content: props.content.trim(),
      timestamp: props.timestamp,
      isDirectMessage: props.isDirectMessage,
    }))
  }
}
