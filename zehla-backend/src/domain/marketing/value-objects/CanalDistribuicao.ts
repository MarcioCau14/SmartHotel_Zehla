import { Result } from '../../../shared/Result'

export type CanalType = 'booking' | 'tripadvisor' | 'google' | 'instagram' | 'facebook' | 'email' | 'whatsapp'

const CANAIS_VALIDOS: CanalType[] = ['booking', 'tripadvisor', 'google', 'instagram', 'facebook', 'email', 'whatsapp']
const CANAIS_SOCIAIS: CanalType[] = ['instagram', 'facebook']
const CANAIS_READ_ONLY: CanalType[] = ['booking', 'tripadvisor', 'google']

export class CanalDistribuicao {
  private constructor(public readonly value: CanalType) {
    Object.freeze(this)
  }

  static criar(valor: string): Result<CanalDistribuicao, Error> {
    if (!CANAIS_VALIDOS.includes(valor as CanalType)) {
      return Result.fail(new Error(`Canal de distribuição inválido: ${valor}`))
    }
    return Result.ok(new CanalDistribuicao(valor as CanalType))
  }

  get isSocial(): boolean {
    return CANAIS_SOCIAIS.includes(this.value)
  }

  get isReadOnly(): boolean {
    return CANAIS_READ_ONLY.includes(this.value)
  }

  get isProprio(): boolean {
    return !this.isReadOnly
  }
}
