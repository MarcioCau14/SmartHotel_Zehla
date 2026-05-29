import { Result } from '../../../shared/Result'
import { ITarefaPort } from '../ports/ITarefaPort'
import { IManutencaoPort } from '../ports/IManutencaoPort'
import { IFornecedorPort } from '../ports/IFornecedorPort'
import { IStaffPort } from '../ports/IStaffPort'
import { ISlaPort } from '../ports/ISlaPort'
import { Tarefa, TipoTarefa } from '../../../domain/operacional/entities/Tarefa'
import { Manutencao, TipoManutencao, CategoriaManutencao } from '../../../domain/operacional/entities/Manutencao'
import { Gravidade } from '../../../domain/operacional/value-objects/Gravidade'
import { Prioridade } from '../../../domain/operacional/value-objects/Prioridade'

const MAX_INTERDICOES_AUTONOMAS_24H = 2

export class AbrirManutencaoUseCase {
  constructor(
    private readonly tarefaPort: ITarefaPort,
    private readonly manutencaoPort: IManutencaoPort,
    private readonly fornecedorPort: IFornecedorPort,
    private readonly staffPort: IStaffPort,
    private readonly slaPort: ISlaPort,
  ) {}

  async execute(dados: {
    propriedadeId: string
    tipo: string
    gravidade: string
    categoria: string
    ativoId?: string
    tipoAtivo?: string
    descricaoProblema: string
    fornecedorId?: string
    titulo?: string
  }): Promise<Result<{ tarefa: Tarefa; manutencao: Manutencao; requerAprovacaoHumana: boolean }, Error>> {
    try {
      const gravidadeResult = Gravidade.criar(dados.gravidade)
      if (gravidadeResult.isFail) return Result.fail(gravidadeResult.error)
      const gravidade = gravidadeResult.value

      const prioridadeMap: Record<string, string> = {
        severa: 'urgente',
        alta: 'alta',
        media: 'media',
        baixa: 'baixa',
      }
      const prioridadeStr = prioridadeMap[gravidade.value] || 'media'
      const prioridadeResult = Prioridade.criar(prioridadeStr)
      if (prioridadeResult.isFail) return Result.fail(prioridadeResult.error)

      if (dados.fornecedorId) {
        const fornResult = await this.fornecedorPort.buscarFornecedorPorId(dados.fornecedorId)
        if (fornResult.isFail) return Result.fail(fornResult.error)
        if (!fornResult.value) {
          return Result.fail(new Error('Fornecedor não encontrado'))
        }
        if (!fornResult.value.estaAtivo) {
          return Result.fail(new Error('Fornecedor suspenso ou inativo não pode receber manutenções'))
        }
      }

      let requerAprovacaoHumana = false
      if (gravidade.isSevera) {
        const countResult = await this.manutencaoPort.countInterdicoes24h(dados.propriedadeId)
        if (countResult.isFail) return Result.fail(countResult.error)
        if (countResult.value >= MAX_INTERDICOES_AUTONOMAS_24H) {
          requerAprovacaoHumana = true
        }
      }

      const tipo = dados.tipo as TipoManutencao
      const categoria = dados.categoria as CategoriaManutencao

      const titulo = dados.titulo || `Manutenção ${categoria} - ${gravidade.value}`

      let dataLimite: Date | undefined
      const slaResult = await this.slaPort.buscarSla('manutencao' as TipoTarefa, prioridadeResult.value)
      if (slaResult.isOk && slaResult.value) {
        dataLimite = slaResult.value.calcularDataLimite(new Date())
      }

      const tarefaCriada = await this.tarefaPort.criarTarefa({
        tipo: 'manutencao',
        propriedadeId: dados.propriedadeId,
        titulo,
        descricao: dados.descricaoProblema,
        prioridade: prioridadeResult.value,
        ativoId: dados.ativoId,
        tipoAtivo: dados.tipoAtivo,
        dataLimite,
      })
      if (tarefaCriada.isFail) return Result.fail(tarefaCriada.error)

      const manutencaoCriada = await this.manutencaoPort.criarManutencao({
        tarefaId: tarefaCriada.value.id,
        propriedadeId: dados.propriedadeId,
        tipo,
        gravidade,
        categoria,
        ativoId: dados.ativoId,
        tipoAtivo: dados.tipoAtivo,
        descricaoProblema: dados.descricaoProblema,
        fornecedorId: dados.fornecedorId,
        requerAprovacaoHumana,
      })
      if (manutencaoCriada.isFail) return Result.fail(manutencaoCriada.error)

      return Result.ok({
        tarefa: tarefaCriada.value,
        manutencao: manutencaoCriada.value,
        requerAprovacaoHumana,
      })
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro inesperado ao abrir manutenção'))
    }
  }
}
