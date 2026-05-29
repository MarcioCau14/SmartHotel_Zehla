import { Result } from '../../../shared/Result'
import { Money } from './Money'

export type TipoRegra = 
  | 'fixo'
  | 'por_noite'
  | 'por_pessoa'
  | 'misto'

export interface RegraPrecificacaoProps {
  tipo: TipoRegra
  valorBase: Money
  valorPorNoite?: Money
  valorPorPessoa?: Money
  acrescimoAdicionalPessoa?: number // percentual
  descontoEstanciaLonga?: number // percentual após X noites
  noitesParaDesconto?: number
  sazonalidade?: {
    mes: number // 1-12
    multiplicador: number
  }[]
}

export class RegraPrecificacao {
  private constructor(
    public readonly tipo: TipoRegra,
    public readonly valorBase: Money,
    public readonly valorPorNoite: Money | undefined,
    public readonly valorPorPessoa: Money | undefined,
    public readonly acrescimoAdicionalPessoa: number | undefined,
    public readonly descontoEstanciaLonga: number | undefined,
    public readonly noitesParaDesconto: number | undefined,
    public readonly sazonalidade: { mes: number; multiplicador: number }[] | undefined
  ) {
    Object.freeze(this)
  }

  static criar(props: RegraPrecificacaoProps): Result<RegraPrecificacao, Error> {
    // Validações obrigatórias
    if (!props.tipo) {
      return Result.fail(new Error('Pricing rule type is required'))
    }
    
    const tiposValidos: TipoRegra[] = ['fixo', 'por_noite', 'por_pessoa', 'misto']
    if (!tiposValidos.includes(props.tipo)) {
      return Result.fail(new Error(`Invalid pricing rule type. Must be one of: ${tiposValidos.join(', ')}`))
    }
    
    if (!(props.valorBase instanceof Money)) {
      return Result.fail(new Error('Base value must be a Money object'))
    }
    
    if (props.valorBase.isZero()) {
      return Result.fail(new Error('Base value must be greater than zero'))
    }
    
    // Validações específicas por tipo
    if (props.tipo === 'por_noite' || props.tipo === 'misto') {
      if (!props.valorPorNoite) {
        return Result.fail(new Error('Nightly value is required for per-night or mixed pricing rules'))
      }
      if (!(props.valorPorNoite instanceof Money)) {
        return Result.fail(new Error('Nightly value must be a Money object'))
      }
      if (props.valorPorNoite.isZero()) {
        return Result.fail(new Error('Nightly value must be greater than zero'))
      }
    }
    
    if (props.tipo === 'por_pessoa' || props.tipo === 'misto') {
      if (!props.valorPorPessoa) {
        return Result.fail(new Error('Per-person value is required for per-person or mixed pricing rules'))
      }
      if (!(props.valorPorPessoa instanceof Money)) {
        return Result.fail(new Error('Per-person value must be a Money object'))
      }
      if (props.valorPorPessoa.isZero()) {
        return Result.fail(new Error('Per-person value must be greater than zero'))
      }
    }
    
    // Validação de acrescimo adicional por pessoa
    if (props.acrescimoAdicionalPessoa !== undefined) {
      if (typeof props.acrescimoAdicionalPessoa !== 'number' || props.acrescimoAdicionalPessoa < 0 || props.acrescimoAdicionalPessoa > 100) {
        return Result.fail(new Error('Additional person surcharge must be a percentage between 0 and 100'))
      }
    }
    
    // Validação de desconto por estadia longa
    if (props.descontoEstanciaLonga !== undefined) {
      if (typeof props.descontoEstanciaLonga !== 'number' || props.descontoEstanciaLonga < 0 || props.descontoEstanciaLonga > 100) {
        return Result.fail(new Error('Long stay discount must be a percentage between 0 and 100'))
      }
      if (props.noitesParaDesconto !== undefined && props.noitesParaDesconto <= 0) {
        return Result.fail(new Error('Nights for long stay discount must be positive'))
      }
    }
    
    // Validação de sazonalidade
    if (props.sazonalidade) {
      if (!Array.isArray(props.sazonalidade)) {
        return Result.fail(new Error('Seasonality must be an array'))
      }
      for (const saz of props.sazonalidade) {
        if (saz.mes < 1 || saz.mes > 12) {
          return Result.fail(new Error('Month in seasonality must be between 1 and 12'))
        }
        if (typeof saz.multiplicador !== 'number' || saz.multiplicador <= 0) {
          return Result.fail(new Error('Seasonality multiplier must be positive'))
        }
      }
    }
    
    return Result.ok(new RegraPrecificacao(
      props.tipo,
      props.valorBase,
      props.valorPorNoite,
      props.valorPorPessoa,
      props.acrescimoAdicionalPessoa,
      props.descontoEstanciaLonga,
      props.noitesParaDesconto,
      props.sazonalidade
    ))
  }

  /**
   * Calcula o valor total baseado na regra de precificação
   * @param pacote O pacote ao qual a regra se aplica
   * @param quantidadeHospedes Número de hóspedes
   * @param quantidadeDiarias Número de diárias
   * @param dataCheckIn Data de check-in (para sazonalidade)
   * @returns Resultado com o valor calculado ou erro
   */
  calcularValorTotal(
    pacote: any, // Pacote entity - usando any para evitar dependência circular
    quantidadeHospedes: number,
    quantidadeDiarias: number,
    dataCheckIn?: Date
  ): Result<Money, Error> {
    try {
      // Validar entradas
      if (quantidadeHospedes <= 0) {
        return Result.fail(new Error('Number of guests must be positive'))
      }
      
      if (quantidadeDiarias <= 0) {
        return Result.fail(new Error('Number of days must be positive'))
      }
      
      // Começar com o valor base
      let total = this.valorBase.centavos
      
      // Aplicar regra conforme o tipo
      if (this.tipo === 'fixo') {
        // Valor fixo já está no total
      } else if (this.tipo === 'por_noite') {
        if (!this.valorPorNoite) {
          return Result.fail(new Error('Nightly value is required for per-night pricing'))
        }
        total = this.valorPorNoite.centavos * quantidadeDiarias
      } else if (this.tipo === 'por_pessoa') {
        if (!this.valorPorPessoa) {
          return Result.fail(new Error('Per-person value is required for per-person pricing'))
        }
        total = this.valorPorPessoa.centavos * quantidadeHospedes
      } else if (this.tipo === 'misto') {
        if (!this.valorPorNoite || !this.valorPorPessoa) {
          return Result.fail(new Error('Both nightly and per-person values are required for mixed pricing'))
        }
        total = (this.valorPorNoite.centavos * quantidadeDiarias) + (this.valorPorPessoa.centavos * quantidadeHospedes)
      }
      
      // Aplicar acrescimo adicional por pessoa (se houver mais de 2 pessoas, por exemplo)
      if (this.acrescimoAdicionalPessoa !== undefined && quantidadeHospedes > 2) {
        const pessoasExcedentes = quantidadeHospedes - 2
        const acrescimo = (total * this.acrescimoAdicionalPessoa) / 100 * pessoasExcedentes
        total += acrescimo
      }
      
      // Aplicar desconto por estadia longa
      if (this.descontoEstanciaLonga !== undefined && 
          this.noitesParaDesconto !== undefined && 
          quantidadeDiarias > this.noitesParaDesconto) {
        const desconto = (total * this.descontoEstanciaLonga) / 100
        total -= desconto
      }
      
      // Aplicar sazonalidade
      if (this.sazonalidade && dataCheckIn) {
        const mes = dataCheckIn.getMonth() + 1 // getMonth() retorna 0-11
        let multiplicadorSazonal = 1
        
        for (const saz of this.sazonalidade) {
          if (saz.mes === mes) {
            multiplicadorSazonal = saz.multiplicador
            break
          }
        }
        
        total = Math.round(total * multiplicadorSazonal)
      }
      
      // Garantir que o total não seja negativo
      if (total < 0) {
        total = 0
      }
      
      return Result.ok(new Money(total))
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error calculating total value'))
    }
  }
  
  // Getters para facilitar acesso
  get ehFixo(): boolean {
    return this.tipo === 'fixo'
  }
  
  get ehPorNoite(): boolean {
    return this.tipo === 'por_noite'
  }
  
  get ehPorPessoa(): boolean {
    return this.tipo === 'por_pessoa'
  }
  
  get ehMisto(): boolean {
    return this.tipo === 'misto'
  }
}