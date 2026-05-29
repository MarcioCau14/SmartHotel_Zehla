import { ILeadPort } from '../../../application/comercial/ports/ILeadPort'
import { IPropostaPort } from '../../../application/comercial/ports/IPropostaPort'
import { IPagamentoPort } from '../../../application/comercial/ports/IPagamentoPort'
import { IConversaoPort } from '../../../application/comercial/ports/IConversaoPort'
import { Result } from '../../../shared/Result'
import { Canal } from '../../../domain/comercial/value-objects/Canal'

export class CalcularTaxaConversaoUseCase {
  constructor(
    private readonly leadPort: ILeadPort,
    private readonly propostaPort: IPropostaPort,
    private readonly pagamentoPort: IPagamentoPort,
    private readonly conversaoPort: IConversaoPort
  ) {}

  async execute(propriedadeId: string, dataInicio?: Date, dataFim?: Date): Promise<Result<{ 
    taxaConversao: number; 
    detalhes: { leads: number; propostas: number; pagamentos: number; conversoes: number };
    breakdown: Record<string, { leads: number; conversoes: number; taxaConversao: number }>
  }, Error>> {
    try {
      // Definir período padrão (últimos 30 dias) se não especificado
      const fim = dataFim || new Date()
      const inicio = dataInicio || new Date(fim.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 dias atrás

      // Buscar leads no período
      const leadsResult = await this.leadPort.listarLeadsPorPropriedade(propriedadeId, {
        dataInicio: inicio,
        dataFim: fim
      })
      if (leadsResult.isFail) {
        return Result.fail(leadsResult.error)
      }
      const leads = leadsResult.value

      // Buscar propostas no período
      const propostasResult = await this.propostaPort.listarPropostasPorStatus(propriedadeId, ['enviada', 'vista', 'negociacao', 'aceita', 'convertida'], 1000)
      if (propostasResult.isFail) {
        return Result.fail(propostasResult.error)
      }
      const propostas = propostasResult.value.filter(p => 
        p.dataCriacao >= inicio && p.dataCriacao <= fim
      )

      // Buscar pagamentos no período
      const pagamentosResult = await this.pagamentoPort.listarPagamentosPorStatus(propriedadeId, ['processando', 'aprovado'], 1000)
      if (pagamentosResult.isFail) {
        return Result.fail(pagamentosResult.error)
      }
      const pagamentos = pagamentosResult.value.filter(p => 
        p.dataCriacao >= inicio && p.dataCriacao <= fim
      )

      // Buscar conversões no período
      const conversoesResult = await this.conversaoPort.listarConversoesPorStatus(propriedadeId, ['confirmada'], 1000)
      if (conversoesResult.isFail) {
        return Result.fail(conversoesResult.error)
      }
      const conversoes = conversoesResult.value.filter(c => 
        c.dataConfirmacao && c.dataConfirmacao >= inicio && c.dataConfirmacao <= fim
      )

      // Calcular taxa de conversão (conversões / leads)
      const taxaConversao = leads.length > 0 ? (conversoes.length / leads.length) * 100 : 0

      // Calcular breakdown por canal
      const breakdownPorCanal: Record<string, { leads: number; conversoes: number; taxaConversao: number }> = {}
      
      // Inicializar com canais válidos
      const canaisValidos = Canal.getCanaisValidos()
      for (const canal of canaisValidos) {
        breakdownPorCanal[canal] = { leads: 0, conversoes: 0, taxaConversao: 0 }
      }
      
      // Contabilizar leads por canal
      for (const lead of leads) {
        const canalValor = lead.canal?.valor || 'whatsapp'
        if (!breakdownPorCanal[canalValor]) {
          breakdownPorCanal[canalValor] = { leads: 0, conversoes: 0, taxaConversao: 0 }
        }
        breakdownPorCanal[canalValor].leads++
      }
      
      // Contabilizar conversões por canal
      for (const conversao of conversoes) {
        let canalConversao = 'whatsapp'
        const leadDaConversao = leads.find(l => l.id === conversao.leadId)
        
        if (leadDaConversao) {
          canalConversao = leadDaConversao.canal?.valor || 'whatsapp'
        } else {
          const leadResult = await this.leadPort.buscarLeadPorId(conversao.leadId, propriedadeId)
          if (leadResult.isOk && leadResult.value) {
            canalConversao = leadResult.value.canal?.valor || 'whatsapp'
          }
        }
        
        if (!breakdownPorCanal[canalConversao]) {
          breakdownPorCanal[canalConversao] = { leads: 0, conversoes: 0, taxaConversao: 0 }
        }
        breakdownPorCanal[canalConversao].conversoes++
      }
      
      // Calcular a taxa de conversão de cada canal
      for (const canal in breakdownPorCanal) {
        const totalLeads = breakdownPorCanal[canal].leads
        const totalConversoes = breakdownPorCanal[canal].conversoes
        breakdownPorCanal[canal].taxaConversao = totalLeads > 0 
          ? Number(((totalConversoes / totalLeads) * 100).toFixed(2))
          : 0
      }

      return Result.ok({
        taxaConversao: Number(taxaConversao.toFixed(2)),
        detalhes: {
          leads: leads.length,
          propostas: propostas.length,
          pagamentos: pagamentos.length,
          conversoes: conversoes.length
        },
        breakdown: breakdownPorCanal
      })
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error calculating conversion rate'))
    }
  }
}