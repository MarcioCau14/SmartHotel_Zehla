import { IPacotePort } from '../../../application/comercial/ports/IPacotePort'
import { Pacote, PacoteProps, PacoteStatus } from '../../../domain/comercial/entities/Pacote'
import { Result } from '../../../shared/Result'
import { RegraPrecificacao } from '../../../domain/comercial/value-objects/RegraPrecificacao'
import { Money } from '../../../domain/comercial/value-objects/Money'

export class PacoteInMemoryRepository implements IPacotePort {
  private pacotes: Map<string, Pacote> = new Map()

  async criarPacote(dados: {
    propriedadeId: string
    nome: string
    descricao?: string
    tipoQuarto?: string
    capacidadeMaxima?: number
    servicosInclusos?: string[]
    regraPrecificacao: RegraPrecificacao
    validadeInicio?: Date
    validadeFim?: Date
    categorias?: string[]
    midias?: string[]
  }): Promise<Result<Pacote, Error>> {
    try {
      // Gerar ID simples para o pacote
      const id = `pacote_${Date.now()}_${Math.floor(Math.random() * 10000)}`
      
      const pacoteProps = {
        id,
        propriedadeId: dados.propriedadeId,
        nome: dados.nome,
        descricao: dados.descricao,
        tipoQuarto: dados.tipoQuarto,
        capacidadeMaxima: dados.capacidadeMaxima,
        servicosInclusos: dados.servicosInclusos,
        regraPrecificacao: dados.regraPrecificacao,
        validadeInicio: dados.validadeInicio,
        validadeFim: dados.validadeFim,
        status: 'ativo' as PacoteStatus,
        versao: 1,
        categorias: dados.categorias,
        midias: dados.midias
      }
      
      const pacoteResult = Pacote.create(pacoteProps)
      if (pacoteResult.isFail) {
        return Result.fail(pacoteResult.error)
      }
      
      const pacote = pacoteResult.value
      this.pacotes.set(pacote.id, pacote)
      
      return Result.ok(pacote)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error creating package'))
    }
  }

  async buscarPacotePorId(id: string, propriedadeId: string): Promise<Result<Pacote | null, Error>> {
    try {
      const pacote = this.pacotes.get(id)
      if (!pacote) {
        return Result.ok(null)
      }
      
      // Verificar RLS - propriedadeId deve corresponder
      if (pacote.propriedadeId !== propriedadeId) {
        return Result.ok(null)
      }
      
      return Result.ok(pacote)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error finding package by ID'))
    }
  }

  async listarPacotesPorPropriedade(propriedadeId: string, filtros?: {
    status?: string[]
    tipoQuarto?: string
    dataInicio?: Date
    dataFim?: Date
    ativoApenas?: boolean
  }): Promise<Result<Pacote[], Error>> {
    try {
      let pacotes = Array.from(this.pacotes.values()).filter(p => p.propriedadeId === propriedadeId)
      
      // Aplicar filtros
      if (filtros) {
        if (filtros.status && filtros.status.length > 0) {
          pacotes = pacotes.filter(p => filtros.status!.includes(p.status))
        }
        
        if (filtros.tipoQuarto) {
          pacotes = pacotes.filter(p => p.tipoQuarto === filtros.tipoQuarto)
        }
        
        if (filtros.dataInicio) {
          pacotes = pacotes.filter(p => p.validadeInicio && p.validadeInicio >= filtros.dataInicio!)
        }
        
        if (filtros.dataFim) {
          pacotes = pacotes.filter(p => p.validadeFim && p.validadeFim <= filtros.dataFim!)
        }
        
        if (filtros.ativoApenas !== undefined && filtros.ativoApenas) {
          pacotes = pacotes.filter(p => p.ehAtivo)
        }
      }
      
      return Result.ok(pacotes)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error listing packages by property'))
    }
  }

  async atualizarPacote(id: string, propriedadeId: string, dados: {
    nome?: string
    descricao?: string
    tipoQuarto?: string
    capacidadeMaxima?: number
    servicosInclusos?: string[]
    validadeInicio?: Date
    validadeFim?: Date
    categorias?: string[]
    midias?: string[]
  }): Promise<Result<Pacote, Error>> {
    try {
      const pacote = this.pacotes.get(id)
      if (!pacote) {
        return Result.fail(new Error('Package not found'))
      }
      
      // Verificar RLS
      if (pacote.propriedadeId !== propriedadeId) {
        return Result.fail(new Error('Package not found or access denied'))
      }
      
      const pacoteAtualizadoResult = Pacote.create({
        id: pacote.id,
        propriedadeId: pacote.propriedadeId,
        nome: dados.nome !== undefined ? dados.nome : pacote.nome,
        descricao: dados.descricao !== undefined ? dados.descricao : pacote.descricao,
        tipoQuarto: dados.tipoQuarto !== undefined ? dados.tipoQuarto : pacote.tipoQuarto,
        capacidadeMaxima: dados.capacidadeMaxima !== undefined ? dados.capacidadeMaxima : pacote.capacidadeMaxima,
        servicosInclusos: dados.servicosInclusos !== undefined ? dados.servicosInclusos : pacote.servicosInclusos,
        regraPrecificacao: pacote.regraPrecificacao,
        validadeInicio: dados.validadeInicio !== undefined ? dados.validadeInicio : pacote.validadeInicio,
        validadeFim: dados.validadeFim !== undefined ? dados.validadeFim : pacote.validadeFim,
        status: pacote.status,
        versao: pacote.versao,
        categorias: dados.categorias !== undefined ? dados.categorias : pacote.categorias,
        midias: dados.midias !== undefined ? dados.midias : pacote.midias
      })
      if (pacoteAtualizadoResult.isFail) {
        return Result.fail(pacoteAtualizadoResult.error)
      }
      const pacoteAtualizado = pacoteAtualizadoResult.value
      
      this.pacotes.set(id, pacoteAtualizado)
      
      return Result.ok(pacoteAtualizado)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error updating package'))
    }
  }

  async atualizarRegraPrecificacao(id: string, propriedadeId: string, regra: RegraPrecificacao): Promise<Result<Pacote, Error>> {
    try {
      const pacote = this.pacotes.get(id)
      if (!pacote) {
        return Result.fail(new Error('Package not found'))
      }
      
      // Verificar RLS
      if (pacote.propriedadeId !== propriedadeId) {
        return Result.fail(new Error('Package not found or access denied'))
      }
      
      // Validar regra de precificação
      if (!(regra instanceof RegraPrecificacao)) {
        return Result.fail(new Error('Invalid pricing rule'))
      }
      
      const pacoteAtualizadoResult = Pacote.create({
        id: pacote.id,
        propriedadeId: pacote.propriedadeId,
        nome: pacote.nome,
        descricao: pacote.descricao,
        tipoQuarto: pacote.tipoQuarto,
        capacidadeMaxima: pacote.capacidadeMaxima,
        servicosInclusos: pacote.servicosInclusos,
        regraPrecificacao: regra,
        validadeInicio: pacote.validadeInicio,
        validadeFim: pacote.validadeFim,
        status: pacote.status,
        versao: pacote.versao + 1,
        categorias: pacote.categorias,
        midias: pacote.midias
      })
      if (pacoteAtualizadoResult.isFail) {
        return Result.fail(pacoteAtualizadoResult.error)
      }
      const pacoteAtualizado = pacoteAtualizadoResult.value
      
      this.pacotes.set(id, pacoteAtualizado)
      
      return Result.ok(pacoteAtualizado)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error updating package pricing rule'))
    }
  }

  async ativarPacote(id: string, propriedadeId: string): Promise<Result<Pacote, Error>> {
    try {
      const pacote = this.pacotes.get(id)
      if (!pacote) {
        return Result.fail(new Error('Package not found'))
      }
      
      // Verificar RLS
      if (pacote.propriedadeId !== propriedadeId) {
        return Result.fail(new Error('Package not found or access denied'))
      }
      
      const ativarResult = pacote.ativar()
      if (ativarResult.isFail) {
        return Result.fail(ativarResult.error)
      }
      
      const pacoteAtualizado = ativarResult.value
      this.pacotes.set(id, pacoteAtualizado)
      
      return Result.ok(pacoteAtualizado)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error activating package'))
    }
  }

  async pausarPacote(id: string, propriedadeId: string): Promise<Result<Pacote, Error>> {
    try {
      const pacote = this.pacotes.get(id)
      if (!pacote) {
        return Result.fail(new Error('Package not found'))
      }
      
      // Verificar RLS
      if (pacote.propriedadeId !== propriedadeId) {
        return Result.fail(new Error('Package not found or access denied'))
      }
      
      const pausarResult = pacote.pausar()
      if (pausarResult.isFail) {
        return Result.fail(pausarResult.error)
      }
      
      const pacoteAtualizado = pausarResult.value
      this.pacotes.set(id, pacoteAtualizado)
      
      return Result.ok(pacoteAtualizado)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error pausing package'))
    }
  }

  async arquivarPacote(id: string, propriedadeId: string): Promise<Result<Pacote, Error>> {
    try {
      const pacote = this.pacotes.get(id)
      if (!pacote) {
        return Result.fail(new Error('Package not found'))
      }
      
      // Verificar RLS
      if (pacote.propriedadeId !== propriedadeId) {
        return Result.fail(new Error('Package not found or access denied'))
      }
      
      const arquivarResult = pacote.arquivar()
      if (arquivarResult.isFail) {
        return Result.fail(arquivarResult.error)
      }
      
      const pacoteAtualizado = arquivarResult.value
      this.pacotes.set(id, pacoteAtualizado)
      
      return Result.ok(pacoteAtualizado)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error archiving package'))
    }
  }

  async calcularValorTotal(pacoteId: string, propriedadeId: string, quantidadeHospedes: number, quantidadeDiarias: number): Promise<Result<Money, Error>> {
    try {
      const pacote = this.pacotes.get(pacoteId)
      if (!pacote) {
        return Result.fail(new Error('Package not found'))
      }
      
      // Verificar RLS
      if (pacote.propriedadeId !== propriedadeId) {
        return Result.fail(new Error('Package not found or access denied'))
      }
      
      const valorResult = pacote.calcularValorTotal(quantidadeHospedes, quantidadeDiarias)
      if (valorResult.isFail) {
        return Result.fail(valorResult.error)
      }
      
      return Result.ok(valorResult.value)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error calculating package total value'))
    }
  }

  async getServicosInclusos(pacoteId: string, propriedadeId: string): Promise<Result<string[], Error>> {
    try {
      const pacote = this.pacotes.get(pacoteId)
      if (!pacote) {
        return Result.fail(new Error('Package not found'))
      }
      
      // Verificar RLS
      if (pacote.propriedadeId !== propriedadeId) {
        return Result.fail(new Error('Package not found or access denied'))
      }
      
      return Result.ok(pacote.getServicosInclusos())
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error getting package inclusive services'))
    }
  }
}