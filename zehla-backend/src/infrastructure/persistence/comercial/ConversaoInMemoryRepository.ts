import { IConversaoPort } from '../../../application/comercial/ports/IConversaoPort'
import { Conversao } from '../../../domain/comercial/entities/Conversao'
import { Result } from '../../../shared/Result'
import { Lead } from '../../../domain/comercial/entities/Lead'
import { Proposta } from '../../../domain/comercial/entities/Proposta'
import { Pagamento } from '../../../domain/comercial/entities/Pagamento'

export class ConversaoInMemoryRepository implements IConversaoPort {
  private versoes: Map<string, Conversao> = new Map()

  async criarConversao(dados: {
    leadId: string
    propostaId: string
    propriedadeId: string
    pagamentoId: string
  }): Promise<Result<Conversao, Error>> {
    try {
      // Gerar ID simples para a conversão
      const id = `conversao_${Date.now()}_${Math.floor(Math.random() * 10000)}`
      
      const conversaoProps = {
        id,
        leadId: dados.leadId,
        propostaId: dados.propostaId,
        propriedadeId: dados.propriedadeId,
        pagamentoId: dados.pagamentoId,
        dataConversao: new Date()
      }
      
      const conversaoResult = Conversao.create(conversaoProps)
      if (conversaoResult.isFail) {
        return Result.fail(conversaoResult.error)
      }
      
      const conversao = conversaoResult.value
      this.versoes.set(conversao.id, conversao)
      
      return Result.ok(conversao)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error creating conversion'))
    }
  }

  async buscarConversaoPorId(id: string, propriedadeId: string): Promise<Result<Conversao | null, Error>> {
    try {
      const conversao = this.versoes.get(id)
      if (!conversao) {
        return Result.ok(null)
      }
      
      // Verificar RLS - propriedadeId deve corresponder
      if (conversao.propriedadeId !== propriedadeId) {
        return Result.ok(null)
      }
      
      return Result.ok(conversao)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error finding conversion by ID'))
    }
  }

  async listarConversoesPorLead(leadId: string, propriedadeId: string): Promise<Result<Conversao[], Error>> {
    try {
      const versoes = Array.from(this.versoes.values())
        .filter(c => c.leadId === leadId && c.propriedadeId === propriedadeId)
      
      return Result.ok(versoes)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error listing conversions by lead'))
    }
  }

  async listarConversoesPorProposta(propostaId: string, propriedadeId: string): Promise<Result<Conversao[], Error>> {
    try {
      const versoes = Array.from(this.versoes.values())
        .filter(c => c.propostaId === propostaId && c.propriedadeId === propriedadeId)
      
      return Result.ok(versoes)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error listing conversions by proposal'))
    }
  }

  async listarConversoesPorPagamento(pagamentoId: string, propriedadeId: string): Promise<Result<Conversao[], Error>> {
    try {
      const versoes = Array.from(this.versoes.values())
        .filter(c => c.pagamentoId === pagamentoId && c.propriedadeId === propriedadeId)
      
      return Result.ok(versoes)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error listing conversions by payment'))
    }
  }

  async listarConversoesPorStatus(propriedadeId: string, status: string[], limite?: number): Promise<Result<Conversao[], Error>> {
    try {
      let versoes = Array.from(this.versoes.values())
        .filter(c => c.propriedadeId === propriedadeId && status.includes(c.status))
      
      // Ordenar por data de conversão (mais recente primeiro)
      versoes.sort((a, b) => {
        const dataA = a.dataConversao ? a.dataConversao.getTime() : 0
        const dataB = b.dataConversao ? b.dataConversao.getTime() : 0
        return dataB - dataA
      })
      
      // Aplicar limite se especificado
      if (limite !== undefined && limite > 0) {
        versoes = versoes.slice(0, limite)
      }
      
      return Result.ok(versoes)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error listing conversions by status'))
    }
  }

  async confirmarConversao(id: string, propriedadeId: string): Promise<Result<Conversao, Error>> {
    try {
      const conversao = this.versoes.get(id)
      if (!conversao) {
        return Result.fail(new Error('Conversion not found'))
      }
      
      // Verificar RLS
      if (conversao.propriedadeId !== propriedadeId) {
        return Result.fail(new Error('Conversion not found or access denied'))
      }
      
      const confirmarResult = conversao.confirmar()
      if (confirmarResult.isFail) {
        return Result.fail(confirmarResult.error)
      }
      
      const conversaoAtualizada = confirmarResult.value
      this.versoes.set(id, conversaoAtualizada)
      
      return Result.ok(conversaoAtualizada)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error confirming conversion'))
    }
  }

  async cancelarConversao(id: string, propriedadeId: string, motivo: string): Promise<Result<Conversao, Error>> {
    try {
      const conversao = this.versoes.get(id)
      if (!conversao) {
        return Result.fail(new Error('Conversion not found'))
      }
      
      // Verificar RLS
      if (conversao.propriedadeId !== propriedadeId) {
        return Result.fail(new Error('Conversion not found or access denied'))
      }
      
      const cancelarResult = conversao.cancelar(motivo)
      if (cancelarResult.isFail) {
        return Result.fail(cancelarResult.error)
      }
      
      const conversaoAtualizada = cancelarResult.value
      this.versoes.set(id, conversaoAtualizada)
      
      return Result.ok(conversaoAtualizada)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error cancelling conversion'))
    }
  }

  async invalidarConversao(id: string, propriedadeId: string, motivo?: string): Promise<Result<Conversao, Error>> {
    try {
      const conversao = this.versoes.get(id)
      if (!conversao) {
        return Result.fail(new Error('Conversion not found'))
      }
      
      // Verificar RLS
      if (conversao.propriedadeId !== propriedadeId) {
        return Result.fail(new Error('Conversion not found or access denied'))
      }
      
      const invalidarResult = conversao.invalidar(motivo)
      if (invalidarResult.isFail) {
        return Result.fail(invalidarResult.error)
      }
      
      const conversaoAtualizada = invalidarResult.value
      this.versoes.set(id, conversaoAtualizada)
      
      return Result.ok(conversaoAtualizada)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error invalidating conversion'))
    }
  }

  async atualizarDataConversao(id: string, propriedadeId: string, data: Date): Promise<Result<Conversao, Error>> {
    try {
      const conversao = this.versoes.get(id)
      if (!conversao) {
        return Result.fail(new Error('Conversion not found'))
      }
      
      // Verificar RLS
      if (conversao.propriedadeId !== propriedadeId) {
        return Result.fail(new Error('Conversion not found or access denied'))
      }
      
      const atualizarResult = conversao.atualizarDataConversao(data)
      if (atualizarResult.isFail) {
        return Result.fail(atualizarResult.error)
      }
      
      const conversaoAtualizada = atualizarResult.value
      this.versoes.set(id, conversaoAtualizada)
      
      return Result.ok(conversaoAtualizada)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error updating conversion date'))
    }
  }
}