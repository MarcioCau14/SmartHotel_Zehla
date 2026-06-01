import { Result } from '../../../shared/Result'
import { Sazonalidade } from '../../../domain/revenue/entities/Sazonalidade'
import { ISazonalidadePort } from '../../../application/revenue/ports/ISazonalidadePort'

export class SazonalidadeInMemoryRepository implements ISazonalidadePort {
  private sazonalidades: Map<string, Sazonalidade> = new Map()

  async criarRegraSazonal(dados: {
    propriedadeId: string; nome: string; tipo: string
    multiplicadorPreco: number; dataInicio: Date; dataFim: Date
    recorrente?: boolean; diasMinimosEstadia?: number; regrasEspeciais?: string[]
  }): Promise<Result<Sazonalidade, Error>> {
    const sazResult = Sazonalidade.create({
      id: `saz_${this.sazonalidades.size + 1}_${Date.now()}`,
      ...dados,
    })
    if (sazResult.isFail) return sazResult
    this.sazonalidades.set(sazResult.value.id, sazResult.value)
    return Result.ok(sazResult.value)
  }

  async buscarPorData(propriedadeId: string, data: Date): Promise<Result<Sazonalidade | null, Error>> {
    const encontrado = Array.from(this.sazonalidades.values()).find(
      s => s.propriedadeId === propriedadeId && s.dataInicio <= data && s.dataFim >= data,
    )
    return Result.ok(encontrado || null)
  }

  async listarPorPeriodo(propriedadeId: string, dataInicio: Date, dataFim: Date): Promise<Result<Sazonalidade[], Error>> {
    const lista = Array.from(this.sazonalidades.values()).filter(
      s => s.propriedadeId === propriedadeId && s.dataInicio <= dataFim && s.dataFim >= dataInicio,
    )
    return Result.ok(lista)
  }

  async listarProximosFeriados(propriedadeId: string, dias: number): Promise<Result<Sazonalidade[], Error>> {
    const hoje = new Date()
    const futuro = new Date(hoje.getTime() + dias * 86400000)
    const lista = Array.from(this.sazonalidades.values()).filter(
      s => s.propriedadeId === propriedadeId && s.tipo === 'feriado' && s.dataInicio >= hoje && s.dataInicio <= futuro,
    )
    return Result.ok(lista)
  }
}
