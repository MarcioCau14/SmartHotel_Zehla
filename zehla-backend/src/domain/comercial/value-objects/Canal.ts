import { Result } from '../../../shared/Result'

export class Canal {
  private constructor(public readonly valor: string) {
    Object.freeze(this)
  }

  static criar(canal: string): Result<Canal, Error> {
    if (typeof canal !== 'string' || !canal.trim()) {
      return Result.fail(new Error('Canal is required'))
    }
    
    const canalTrim = canal.trim().toLowerCase()
    // Canais válidos conforme SPEC_COMERCIAL.md
    const validos = ['site', 'telefone', 'whatsapp', 'instagram', 'facebook', 'google', 'indicacao', 'evento', 'email']
    
    if (!validos.includes(canalTrim)) {
      return Result.fail(new Error(`Invalid channel. Must be one of: ${validos.join(', ')}`))
    }
    
    return Result.ok(new Canal(canalTrim))
  }
  
  static getCanaisValidos(): string[] {
    return ['site', 'telefone', 'whatsapp', 'instagram', 'facebook', 'google', 'indicacao', 'evento', 'email']
  }
}