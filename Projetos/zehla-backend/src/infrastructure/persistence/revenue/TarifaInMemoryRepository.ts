import { Result } from '../../../shared/Result'
import { Money } from '../../../domain/comercial/value-objects/Money'
import { RegraTarifaria } from '../../../domain/revenue/entities/RegraTarifaria'
import { BreakEvenPoint } from '../../../domain/revenue/value-objects/BreakEvenPoint'
import { ITarifaPort } from '../../../application/revenue/ports/ITarifaPort'

export class TarifaInMemoryRepository implements ITarifaPort {
  private regras: Map<string, RegraTarifaria> = new Map()
  private historicoReajustes: Map<string, Array<{ data: Date; valorAnterior: Money; valorNovo: Money; justificativa: string }>> = new Map()

  async criarRegra(dados: {
    propriedadeId: string; tipoQuarto: string; tipo: string
    valorDiaria: Money; breakEvenPoint: { valor: Money; tipoCusto: string }
    canal: string; dataInicio: Date; dataFim: Date
    regraReajuste: string; parametrosReajuste: { percentualMax: number; gatilhoOcupacao: number }
  }): Promise<Result<RegraTarifaria, Error>> {
    const beResult = BreakEvenPoint.criar(dados.breakEvenPoint.valor, dados.breakEvenPoint.tipoCusto)
    if (beResult.isFail) return Result.fail(beResult.error)

    const regraResult = RegraTarifaria.create({
      id: `tar_${this.regras.size + 1}_${Date.now()}`,
      propriedadeId: dados.propriedadeId,
      tipoQuarto: dados.tipoQuarto,
      tipo: dados.tipo,
      valorDiaria: dados.valorDiaria,
      breakEvenPoint: beResult.value,
      canal: dados.canal,
      dataInicio: dados.dataInicio,
      dataFim: dados.dataFim,
      regraReajuste: dados.regraReajuste,
      parametrosReajuste: dados.parametrosReajuste,
    })
    if (regraResult.isFail) return regraResult
    this.regras.set(regraResult.value.id, regraResult.value)
    return Result.ok(regraResult.value)
  }

  async buscarPorId(id: string, propriedadeId: string): Promise<Result<RegraTarifaria | null, Error>> {
    const regra = this.regras.get(id)
    if (!regra || regra.propriedadeId !== propriedadeId) return Result.ok(null)
    return Result.ok(regra)
  }

  async listarAtivas(propriedadeId: string, data: Date): Promise<Result<RegraTarifaria[], Error>> {
    const ativas = Array.from(this.regras.values()).filter(
      r => r.propriedadeId === propriedadeId && r.dataInicio <= data && r.dataFim >= data,
    )
    return Result.ok(ativas)
  }

  async listarPorTipoQuarto(propriedadeId: string, tipoQuarto: string, data: Date): Promise<Result<RegraTarifaria[], Error>> {
    const filtradas = Array.from(this.regras.values()).filter(
      r => r.propriedadeId === propriedadeId && r.tipoQuarto === tipoQuarto && r.dataInicio <= data && r.dataFim >= data,
    )
    return Result.ok(filtradas)
  }

  async atualizarValorDiaria(id: string, propriedadeId: string, novoValor: Money, valorAnterior: Money): Promise<Result<RegraTarifaria, Error>> {
    const regra = this.regras.get(id)
    if (!regra || regra.propriedadeId !== propriedadeId) {
      return Result.fail(new Error('Regra tarifária não encontrada'))
    }
    const atualizada = regra.atualizarValorDiaria(novoValor)
    if (atualizada.isFail) return atualizada
    this.regras.set(id, atualizada.value)

    const historico = this.historicoReajustes.get(id) || []
    historico.push({
      data: new Date(),
      valorAnterior: regra.valorDiaria,
      valorNovo: novoValor,
      justificativa: 'Reajuste por atualização de valor diária',
    })
    this.historicoReajustes.set(id, historico)

    return Result.ok(atualizada.value)
  }

  async listarHistoricoReajustes(regraId: string, propriedadeId: string): Promise<Result<Array<{ data: Date; valorAnterior: Money; valorNovo: Money; justificativa: string }>, Error>> {
    const historico = this.historicoReajustes.get(regraId) || []
    return Result.ok(historico)
  }
}
