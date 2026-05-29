import { Result } from '../../../shared/Result'
import { IManutencaoPort } from '../../../application/operacional/ports/IManutencaoPort'
import { Manutencao, StatusManutencao, TipoManutencao, CategoriaManutencao } from '../../../domain/operacional/entities/Manutencao'
import { Gravidade } from '../../../domain/operacional/value-objects/Gravidade'

export class ManutencaoInMemoryRepository implements IManutencaoPort {
  private manutencoes: Map<string, Manutencao> = new Map()
  private interdicaoCarimbos: Date[] = []

  async criarManutencao(dados: {
    tarefaId: string
    propriedadeId: string
    tipo: TipoManutencao
    gravidade: Gravidade
    categoria: CategoriaManutencao
    ativoId?: string
    tipoAtivo?: string
    descricaoProblema: string
    fornecedorId?: string
    requerAprovacaoHumana?: boolean
  }): Promise<Result<Manutencao, Error>> {
    const manutencaoResult = Manutencao.create({
      id: `manut_${this.manutencoes.size + 1}_${Date.now()}`,
      tarefaId: dados.tarefaId,
      propriedadeId: dados.propriedadeId,
      dataAbertura: new Date(),
      tipo: dados.tipo,
      gravidade: dados.gravidade,
      categoria: dados.categoria,
      ativoId: dados.ativoId,
      tipoAtivo: dados.tipoAtivo,
      descricaoProblema: dados.descricaoProblema,
      fornecedorId: dados.fornecedorId,
      requerAprovacaoHumana: dados.requerAprovacaoHumana || false,
    })
    if (manutencaoResult.isFail) return manutencaoResult

    if (manutencaoResult.value.interditaQuarto && !manutencaoResult.value.requerAprovacaoHumana) {
      this.interdicaoCarimbos.push(new Date())
    }

    this.manutencoes.set(manutencaoResult.value.id, manutencaoResult.value)
    return Result.ok(manutencaoResult.value)
  }

  async buscarManutencaoPorId(id: string, propriedadeId: string): Promise<Result<Manutencao | null, Error>> {
    const manutencao = this.manutencoes.get(id)
    if (!manutencao || manutencao.propriedadeId !== propriedadeId) return Result.ok(null)
    return Result.ok(manutencao)
  }

  async listarManutencoesPorPropriedade(propriedadeId: string, filtros?: {
    status?: StatusManutencao[]
    gravidade?: string
    tipo?: TipoManutencao[]
    dataInicio?: Date
    dataFim?: Date
  }): Promise<Result<Manutencao[], Error>> {
    let lista = Array.from(this.manutencoes.values()).filter(m => m.propriedadeId === propriedadeId)
    if (filtros?.status) lista = lista.filter(m => filtros.status!.includes(m.status))
    if (filtros?.gravidade) lista = lista.filter(m => m.gravidade.value === filtros.gravidade)
    if (filtros?.tipo) lista = lista.filter(m => filtros.tipo!.includes(m.tipo))
    return Result.ok(lista)
  }

  async listarManutencoesPorAtivo(ativoId: string, propriedadeId: string): Promise<Result<Manutencao[], Error>> {
    const lista = Array.from(this.manutencoes.values()).filter(
      m => m.propriedadeId === propriedadeId && m.ativoId === ativoId,
    )
    return Result.ok(lista)
  }

  async listarInterditadas(propriedadeId: string): Promise<Result<Manutencao[], Error>> {
    const lista = Array.from(this.manutencoes.values()).filter(
      m => m.propriedadeId === propriedadeId && m.interditaQuarto && m.status !== 'concluida' && m.status !== 'cancelada',
    )
    return Result.ok(lista)
  }

  async atualizarManutencao(id: string, propriedadeId: string, dados: {
    status?: StatusManutencao
    descricaoSolucao?: string
    dataInicio?: Date
    dataFim?: Date
    custoPecas?: number
    custoServico?: number
  }): Promise<Result<Manutencao, Error>> {
    const manutencao = this.manutencoes.get(id)
    if (!manutencao || manutencao.propriedadeId !== propriedadeId) {
      return Result.fail(new Error('Manutenção não encontrada'))
    }

    const atualizadaResult = Manutencao.create({
      id: manutencao.id,
      tarefaId: manutencao.tarefaId,
      propriedadeId: manutencao.propriedadeId,
      dataAbertura: manutencao.dataAbertura,
      tipo: manutencao.tipo,
      gravidade: manutencao.gravidade,
      categoria: manutencao.categoria,
      ativoId: manutencao.ativoId,
      tipoAtivo: manutencao.tipoAtivo,
      descricaoProblema: manutencao.descricaoProblema,
      descricaoSolucao: dados.descricaoSolucao || manutencao.descricaoSolucao,
      dataInicio: dados.dataInicio || manutencao.dataInicio,
      dataFim: dados.dataFim || manutencao.dataFim,
      fornecedorId: manutencao.fornecedorId,
      custoPecas: dados.custoPecas !== undefined ? dados.custoPecas : manutencao.custoPecas,
      custoServico: dados.custoServico !== undefined ? dados.custoServico : manutencao.custoServico,
      status: dados.status || manutencao.status,
      interditaQuarto: manutencao.interditaQuarto,
      requerAprovacaoHumana: manutencao.requerAprovacaoHumana,
    })
    if (atualizadaResult.isFail) return atualizadaResult
    this.manutencoes.set(id, atualizadaResult.value)
    return Result.ok(atualizadaResult.value)
  }

  async countInterdicoes24h(propriedadeId: string): Promise<Result<number, Error>> {
    const agora = new Date()
    const ha24h = new Date(agora.getTime() - 24 * 60 * 60 * 1000)

    this.interdicaoCarimbos = this.interdicaoCarimbos.filter(d => d >= ha24h)

    const count = this.interdicaoCarimbos.length
    return Result.ok(count)
  }
}
