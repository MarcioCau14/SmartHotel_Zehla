import { PrismaClient } from '@prisma/client'
import { Result } from '../../../shared/Result'
import { Money } from '../../../domain/comercial/value-objects/Money'
import { RegraTarifaria } from '../../../domain/revenue/entities/RegraTarifaria'
import { BreakEvenPoint } from '../../../domain/revenue/value-objects/BreakEvenPoint'
import { ITarifaPort } from '../../../application/revenue/ports/ITarifaPort'

export class PrismaTarifaRepository implements ITarifaPort {
  constructor(private readonly prisma: any, protected readonly propertyId?: string) {}

  private toData(regra: RegraTarifaria): any {
    return {
      id: regra.id,
      propriedadeId: regra.propriedadeId,
      tipoQuarto: regra.tipoQuarto,
      tipo: regra.tipo,
      valorDiaria: regra.valorDiaria.centavos,
      breakEvenPoint: { valor: regra.breakEvenPoint.valor.centavos, tipoCusto: regra.breakEvenPoint.tipoCusto },
      canal: regra.canal,
      dataInicio: regra.dataInicio,
      dataFim: regra.dataFim,
      valorAnterior: regra.valorAnterior?.centavos ?? null,
      regraReajuste: regra.regraReajuste,
      parametrosReajuste: regra.parametrosReajuste,
      dataCriacao: regra.dataCriacao,
    }
  }

  private async hydrate(row: any): Promise<Result<RegraTarifaria, Error>> {
    try {
      const valorDiariaResult = Money.criar(row.valorDiaria)
      if (valorDiariaResult.isFail) return Result.fail(valorDiariaResult.error)

      const beData = typeof row.breakEvenPoint === 'string' ? JSON.parse(row.breakEvenPoint) : row.breakEvenPoint
      const beValorResult = Money.criar(beData.valor)
      if (beValorResult.isFail) return Result.fail(beValorResult.error)

      const beResult = BreakEvenPoint.criar(beValorResult.value, beData.tipoCusto)
      if (beResult.isFail) return Result.fail(beResult.error)

      let valorAnterior: Money | undefined = undefined
      if (row.valorAnterior !== null && row.valorAnterior !== undefined) {
        const vaResult = Money.criar(row.valorAnterior)
        if (vaResult.isFail) return Result.fail(vaResult.error)
        valorAnterior = vaResult.value
      }

      const params = typeof row.parametrosReajuste === 'string' ? JSON.parse(row.parametrosReajuste) : row.parametrosReajuste

      return RegraTarifaria.create({
        id: row.id,
        propriedadeId: row.propriedadeId,
        tipoQuarto: row.tipoQuarto,
        tipo: row.tipo,
        valorDiaria: valorDiariaResult.value,
        breakEvenPoint: beResult.value,
        canal: row.canal,
        dataInicio: row.dataInicio,
        dataFim: row.dataFim,
        valorAnterior,
        regraReajuste: row.regraReajuste,
        parametrosReajuste: params,
        dataCriacao: row.dataCriacao,
      })
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao hidratar regra tarifária'))
    }
  }

  async criarRegra(dados: {
    propriedadeId: string; tipoQuarto: string; tipo: string
    valorDiaria: Money; breakEvenPoint: { valor: Money; tipoCusto: string }
    canal: string; dataInicio: Date; dataFim: Date
    regraReajuste: string; parametrosReajuste: { percentualMax: number; gatilhoOcupacao: number }
  }): Promise<Result<RegraTarifaria, Error>> {
    try {
      const beResult = BreakEvenPoint.criar(dados.breakEvenPoint.valor, dados.breakEvenPoint.tipoCusto)
      if (beResult.isFail) return Result.fail(beResult.error)

      const regraResult = RegraTarifaria.create({
        id: `tar_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
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

      const regra = regraResult.value
      await this.prisma.revenueRegraTarifaria.create({ data: this.toData(regra) })
      return Result.ok(regra)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro inesperado ao criar regra tarifária'))
    }
  }

  async buscarPorId(id: string, propriedadeId: string): Promise<Result<RegraTarifaria | null, Error>> {
    try {
      const row = await this.prisma.revenueRegraTarifaria.findFirst({
        where: { id, propriedadeId },
      })
      if (!row) return Result.ok(null)
      return this.hydrate(row)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao buscar regra tarifária'))
    }
  }

  async listarAtivas(propriedadeId: string, data: Date): Promise<Result<RegraTarifaria[], Error>> {
    try {
      const rows = await this.prisma.revenueRegraTarifaria.findMany({
        where: {
          propriedadeId,
          dataInicio: { lte: data },
          dataFim: { gte: data },
        },
        orderBy: { dataCriacao: 'desc' },
      })
      const regras: RegraTarifaria[] = []
      for (const row of rows) {
        const result = await this.hydrate(row)
        if (result.isFail) return Result.fail(result.error)
        regras.push(result.value)
      }
      return Result.ok(regras)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao listar tarifas ativas'))
    }
  }

  async listarPorTipoQuarto(propriedadeId: string, tipoQuarto: string, data: Date): Promise<Result<RegraTarifaria[], Error>> {
    try {
      const rows = await this.prisma.revenueRegraTarifaria.findMany({
        where: {
          propriedadeId,
          tipoQuarto,
          dataInicio: { lte: data },
          dataFim: { gte: data },
        },
        orderBy: { dataCriacao: 'desc' },
      })
      const regras: RegraTarifaria[] = []
      for (const row of rows) {
        const result = await this.hydrate(row)
        if (result.isFail) return Result.fail(result.error)
        regras.push(result.value)
      }
      return Result.ok(regras)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao listar tarifas por tipo de quarto'))
    }
  }

  async atualizarValorDiaria(id: string, propriedadeId: string, novoValor: Money, valorAnterior: Money): Promise<Result<RegraTarifaria, Error>> {
    try {
      const row = await this.prisma.revenueRegraTarifaria.findFirst({
        where: { id, propriedadeId },
      })
      if (!row) return Result.fail(new Error('Regra tarifária não encontrada'))

      const currentResult = await this.hydrate(row)
      if (currentResult.isFail) return currentResult

      const updated = currentResult.value.atualizarValorDiaria(novoValor)
      if (updated.isFail) return updated

      await this.prisma.revenueRegraTarifaria.update({
        where: { id },
        data: this.toData(updated.value),
      })
      return Result.ok(updated.value)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao atualizar valor da diária'))
    }
  }

  async listarHistoricoReajustes(regraId: string, propriedadeId: string): Promise<Result<Array<{ data: Date; valorAnterior: Money; valorNovo: Money; justificativa: string }>, Error>> {
    return Result.ok([])
  }
}
