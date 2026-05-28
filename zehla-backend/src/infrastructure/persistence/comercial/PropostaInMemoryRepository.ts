import { IPropostaPort } from '../../../application/comercial/ports/IPropostaPort'
import { Proposta } from '../../../domain/comercial/entities/Proposta'
import { Result } from '../../../../shared/Result'
import { Money } from '../../../domain/comercial/value-objects/Money'
import { Lead } from '../../../domain/comercial/entities/Lead'
import { Pacote } from '../../../domain/comercial/entities/Pacote'

export class PropostaInMemoryRepository implements IPropostaPort {
  private propostas: Map<string, Proposta> = new Map()

  async criarProposta(dados: {
    leadId: string
    propriedadeId: string
    pacoteId: string
    dataCheckIn: Date
    dataCheckOut: Date
    quantidadeHospedes: number
    observacoes?: string
  }): Promise<Result<Proposta, Error>> {
    try {
      // Gerar ID simples para a proposta
      const id = `proposta_${Date.now()}_${Math.floor(Math.random() * 10000)}`
      
      const propostaProps = {
        id,
        leadId: dados.leadId,
        propriedadeId: dados.propriedadeId,
        pacoteId: dados.pacoteId,
        dataCriacao: new Date(),
        dataCheckIn: dados.dataCheckIn,
        dataCheckOut: dados.dataCheckOut,
        quantidadeHospedes: dados.quantidadeHospedes,
        observacoes: dados.observacoes
      }
      
      const propostaResult = Proposta.create(propostaProps)
      if (propostaResult.isFail) {
        return Result.fail(propostaResult.error)
      }
      
      const proposta = propostaResult.value
      this.propostas.set(proposta.id, proposta)
      
      return Result.ok(proposta)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error creating proposal'))
    }
  }

  async buscarPropostaPorId(id: string, propriedadeId: string): Promise<Result<Proposta | null, Error>> {
    try {
      const proposta = this.propostas.get(id)
      if (!proposta) {
        return Result.ok(null)
      }
      
      // Verificar RLS - propriedadeId deve corresponder
      if (proposta.propriedadeId !== propriedadeId) {
        return Result.ok(null)
      }
      
      return Result.ok(proposta)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error finding proposal by ID'))
    }
  }

  async listarPropostasPorLead(leadId: string, propriedadeId: string): Promise<Result<Proposta[], Error>> {
    try {
      const propostas = Array.from(this.propostas.values())
        .filter(p => p.leadId === leadId && p.propriedadeId === propriedadeId)
      
      return Result.ok(propostas)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error listing proposals by lead'))
    }
  }

  async listarPropostasPorPacote(pacoteId: string, propriedadeId: string): Promise<Result<Proposta[], Error>> {
    try {
      const propostas = Array.from(this.propostas.values())
        .filter(p => p.pacoteId === pacoteId && p.propriedadeId === propriedadeId)
      
      return Result.ok(propostas)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error listing proposals by package'))
    }
  }

  async listarPropostasPorStatus(propriedadeId: string, status: string[], limite?: number): Promise<Result<Proposta[], Error>> {
    try {
      let propostas = Array.from(this.propostas.values())
        .filter(p => p.propriedadeId === propriedadeId && status.includes(p.status))
      
      // Ordenar por data de criação (mais recente primeiro)
      propostas.sort((a, b) => b.dataCriacao.getTime() - a.dataCriacao.getTime())
      
      // Aplicar limite se especificado
      if (limite !== undefined && limite > 0) {
        propostas = propostas.slice(0, limite)
      }
      
      return Result.ok(propostas)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error listing proposals by status'))
    }
  }

  async atualizarProposta(id: string, propriedadeId: string, dados: {
    dataCheckIn?: Date
    dataCheckOut?: Date
    quantidadeHospedes?: number
    observacoes?: string
  }): Promise<Result<Proposta, Error>> {
    try {
      const proposta = this.propostas.get(id)
      if (!proposta) {
        return Result.fail(new Error('Proposal not found'))
      }
      
      // Verificar RLS
      if (proposta.propriedadeId !== propriedadeId) {
        return Result.fail(new Error('Proposal not found or access denied'))
      }
      
      const propostaAtualizada = new Proposta(
        proposta.id,
        proposta.leadId,
        proposta.propriedadeId,
        proposta.pacoteId,
        proposta.dataCriacao,
        dados.dataCheckIn !== undefined ? dados.dataCheckIn : proposta.dataCheckIn,
        dados.dataCheckOut !== undefined ? dados.dataCheckOut : proposta.dataCheckOut,
        dados.quantidadeHospedes !== undefined ? dados.quantidadeHospedes : proposta.quantidadeHospedes,
        proposta.valorTotal,
        proposta.valorSinal,
        proposta.descontoAplicado,
        proposta.status,
        proposta.validade,
        dados.observacoes !== undefined ? dados.observacoes : proposta.observacoes,
        proposta.historicoVersoes
      )
      
      this.propostas.set(id, propostaAtualizada)
      
      return Result.ok(propostaAtualizada)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error updating proposal'))
    }
  }

  async atualizarValorProposta(id: string, propriedadeId: string, valorTotal: Money): Promise<Result<Proposta, Error>> {
    try {
      const proposta = this.propostas.get(id)
      if (!proposta) {
        return Result.fail(new Error('Proposal not found'))
      }
      
      // Verificar RLS
      if (proposta.propriedadeId !== propriedadeId) {
        return Result.fail(new Error('Proposal not found or access denied'))
      }
      
      // Validar valor total
      if (!(valorTotal instanceof Money)) {
        return Result.fail(new Error('Total value must be a Money object'))
      }
      
      if (valorTotal.isZero()) {
        return Result.fail(new Error('Total value must be greater than zero'))
      }
      
      const propostaAtualizada = new Proposta(
        proposta.id,
        proposta.leadId,
        proposta.propriedadeId,
        proposta.pacoteId,
        proposta.dataCriacao,
        proposta.dataCheckIn,
        proposta.dataCheckOut,
        proposta.quantidadeHospedes,
        valorTotal,
        proposta.valorSinal,
        proposta.descontoAplicado,
        proposta.status,
        proposta.validade,
        proposta.observacoes,
        proposta.historicoVersoes
      )
      
      this.propostas.set(id, propostaAtualizada)
      
      return Result.ok(propostaAtualizada)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error updating proposal value'))
    }
  }

  async atualizarSinalProposta(id: string, propriedadeId: string, valorSinal: Money): Promise<Result<Proposta, Error>> {
    try {
      const proposta = this.propostas.get(id)
      if (!proposta) {
        return Result.fail(new Error('Proposal not found'))
      }
      
      // Verificar RLS
      if (proposta.propriedadeId !== propriedadeId) {
        return Result.fail(new Error('Proposal not found or access denied'))
      }
      
      // Validar valor do sinal
      if (!(valorSinal instanceof Money)) {
        return Result.fail(new Error('Deposit value must be a Money object'))
      }
      
      if (valorSinal.isZero()) {
        return Result.fail(new Error('Deposit value must be greater than zero'))
      }
      
      // Regra de negócio: sinal não pode exceder 50% do total
      if (proposta.valorTotal && valorSinal.centavos > proposta.valorTotal.centavos) {
        return Result.fail(new Error('Deposit cannot exceed total value'))
      }
      
      const metadeTotal = Math.floor(proposta.valorTotal.centavos / 2);
      if (valorSinal.centavos > metadeTotal) {
        return Result.fail(new Error('Deposit cannot exceed 50% of total value'))
      }
      
      const propostaAtualizada = new Proposta(
        proposta.id,
        proposta.leadId,
        proposta.propriedadeId,
        proposta.pacoteId,
        proposta.dataCriacao,
        proposta.dataCheckIn,
        proposta.dataCheckOut,
        proposta.quantidadeHospedes,
        proposta.valorTotal,
        valorSinal,
        proposta.descontoAplicado,
        proposta.status,
        proposta.validade,
        proposta.observacoes,
        proposta.historicoVersoes
      )
      
      this.propostas.set(id, propostaAtualizada)
      
      return Result.ok(propostaAtualizada)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error updating proposal deposit'))
    }
  }

  async atualizarDescontoProposta(id: string, propriedadeId: string, desconto: Money): Promise<Result<Proposta, Error>> {
    try {
      const proposta = this.propostas.get(id)
      if (!proposta) {
        return Result.fail(new Error('Proposal not found'))
      }
      
      // Verificar RLS
      if (proposta.propriedadeId !== propriedadeId) {
        return Result.fail(new Error('Proposal not found or access denied'))
      }
      
      // Validar desconto
      if (!(desconto instanceof Money)) {
        return Result.fail(new Error('Discount must be a Money object'))
      }
      
      if (desconto.isZero()) {
        // Desconto zero é válido (sem desconto)
      } else if (proposta.valorTotal && desconto.centavos > proposta.valorTotal.centavos) {
        return Result.fail(new Error('Discount cannot exceed total value'))
      }
      
      const propostaAtualizada = new Proposta(
        proposta.id,
        proposta.leadId,
        proposta.propriedadeId,
        proposta.pacoteId,
        proposta.dataCriacao,
        proposta.dataCheckIn,
        proposta.dataCheckOut,
        proposta.quantidadeHospedes,
        proposta.valorTotal,
        proposta.valorSinal,
        desconto,
        proposta.status,
        proposta.validade,
        proposta.observacoes,
        proposta.historicoVersoes
      )
      
      this.propostas.set(id, propostaAtualizada)
      
      return Result.ok(propostaAtualizada)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error updating proposal discount'))
    }
  }

  async enviarProposta(id: string, propriedadeId: string): Promise<Result<Proposta, Error>> {
    try {
      const proposta = this.propostas.get(id)
      if (!proposta) {
        return Result.fail(new Error('Proposal not found'))
      }
      
      // Verificar RLS
      if (proposta.propriedadeId !== propriedadeId) {
        return Result.fail(new Error('Proposal not found or access denied'))
      }
      
      const enviarResult = proposta.enviar()
      if (enviarResult.isFail) {
        return Result.fail(enviarResult.error)
      }
      
      const propostaAtualizada = enviarResult.value
      this.propostas.set(id, propostaAtualizada)
      
      return Result.ok(propostaAtualizada)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error sending proposal'))
    }
  }

  async visualizarProposta(id: string, propriedadeId: string): Promise<Result<Proposta, Error>> {
    try {
      const proposta = this.propostas.get(id)
      if (!proposta) {
        return Result.fail(new Error('Proposal not found'))
      }
      
      // Verificar RLS
      if (proposta.propriedadeId !== propriedadeId) {
        return Result.fail(new Error('Proposal not found or access denied'))
      }
      
      const visualizarResult = proposta.visualizar()
      if (visualizarResult.isFail) {
        return Result.fail(visualizarResult.error)
      }
      
      const propostaAtualizada = visualizarResult.value
      this.propostas.set(id, propostaAtualizada)
      
      return Result.ok(propostaAtualizada)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error viewing proposal'))
    }
  }

  async negociarProposta(id: string, propriedadeId: string): Promise<Result<Proposta, Error>> {
    try {
      const proposta = this.propostas.get(id)
      if (!proposta) {
        return Result.fail(new Error('Proposal not found'))
      }
      
      // Verificar RLS
      if (proposta.propriedadeId !== propriedadeId) {
        return Result.fail(new Error('Proposal not found or access denied'))
      }
      
      const negociarResult = proposta.negociar()
      if (negociarResult.isFail) {
        return Result.fail(negociarResult.error)
      }
      
      const propostaAtualizada = negociarResult.value
      this.propostas.set(id, propostaAtualizada)
      
      return Result.ok(propostaAtualizada)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error negotiating proposal'))
    }
  }

  async aceitarProposta(id: string, propriedadeId: string): Promise<Result<Proposta, Error>> {
    try {
      const proposta = this.propostas.get(id)
      if (!proposta) {
        return Result.fail(new Error('Proposal not found'))
      }
      
      // Verificar RLS
      if (proposta.propriedadeId !== propriedadeId) {
        return Result.fail(new Error('Proposal not found or access denied'))
      }
      
      const aceitarResult = proposta.aceitar()
      if (aceitarResult.isFail) {
        return Result.fail(aceitarResult.error)
      }
      
      const propostaAtualizada = aceitarResult.value
      this.propostas.set(id, propostaAtualizada)
      
      return Result.ok(propostaAtualizada)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error accepting proposal'))
    }
  }

  async recusarProposta(id: string, propriedadeId: string, motivo?: string): Promise<Result<Proposta, Error>> {
    try {
      const proposta = this.propostas.get(id)
      if (!proposta) {
        return Result.fail(new Error('Proposal not found'))
      }
      
      // Verificar RLS
      if (proposta.propriedadeId !== propriedadeId) {
        return Result.fail(new Error('Proposal not found or access denied'))
      }
      
      const recusarResult = proposta.recusar(motivo)
      if (recusarResult.isFail) {
        return Result.fail(recusarResult.error)
      }
      
      const propostaAtualizada = recusarResult.value
      this.propostas.set(id, propostaAtualizada)
      
      return Result.ok(propostaAtualizada)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error rejecting proposal'))
    }
  }

  async expirarProposta(id: string, propriedadeId: string): Promise<Result<Proposta, Error>> {
    try {
      const proposta = this.propostas.get(id)
      if (!proposta) {
        return Result.fail(new Error('Proposal not found'))
      }
      
      // Verificar RLS
      if (proposta.propriedadeId !== propriedadeId) {
        return Result.fail(new Error('Proposal not found or access denied'))
      }
      
      const expirarResult = proposta.expirar()
      if (expirarResult.isFail) {
        return Result.fail(expirarResult.error)
      }
      
      const propostaAtualizada = expirarResult.value
      this.propostas.set(id, propostaAtualizada)
      
      return Result.ok(propostaAtualizada)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error expiring proposal'))
    }
  }

  async converterProposta(id: string, propriedadeId: string): Promise<Result<Proposta, Error>> {
    try {
      const proposta = this.propostas.get(id)
      if (!proposta) {
        return Result.fail(new Error('Proposal not found'))
      }
      
      // Verificar RLS
      if (proposta.propriedadeId !== propriedadeId) {
        return Result.fail(new Error('Proposal not found or access denied'))
      }
      
      const converterResult = proposta.converter()
      if (converterResult.isFail) {
        return Result.fail(converterResult.error)
      }
      
      const propostaAtualizada = converterResult.value
      this.propostas.set(id, propostaAtualizada)
      
      return Result.ok(propostaAtualizada)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error converting proposal'))
    }
  }
}