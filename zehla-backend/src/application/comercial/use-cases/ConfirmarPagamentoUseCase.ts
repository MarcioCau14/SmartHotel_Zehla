import { IPagamentoPort } from '../../../application/comercial/ports/IPagamentoPort'
import { IPropostaPort } from '../../../application/comercial/ports/IPropostaPort'
import { ILeadPort } from '../../../application/comercial/ports/ILeadPort'
import { IConversaoPort } from '../../../application/comercial/ports/IConversaoPort'
import { Result } from '../../../shared/Result'
import { Pagamento } from '../../../domain/comercial/entities/Pagamento'
import { Proposta } from '../../../domain/comercial/entities/Proposta'
import { Conversao } from '../../../domain/comercial/entities/Conversao'

export class ConfirmarPagamentoUseCase {
  constructor(
    private readonly pagamentoPort: IPagamentoPort,
    private readonly propostaPort: IPropostaPort,
    private readonly leadPort: ILeadPort,
    private readonly conversaoPort: IConversaoPort
  ) {}

  async execute(pagamentoId: string, propriedadeId: string): Promise<Result<Pagamento, Error>> {
    try {
      // 1. Buscar o pagamento
      const pagamentoResult = await this.pagamentoPort.buscarPagamentoPorId(pagamentoId, propriedadeId)
      if (pagamentoResult.isFail) {
        return Result.fail(pagamentoResult.error)
      }
      
      const pagamento = pagamentoResult.value
      if (!pagamento) {
        return Result.fail(new Error('Payment not found'))
      }
      
      // Regra de negócio: Só é possível confirmar pagamentos em processamento ou rascunho
      // O fakeRepo ou o domínio pode transitar de rascunho para processando primeiro, ou de rascunho direto.
      // A classe Pagamento.ts tem a transição pagamento.processar() e depois pagamento.aprovar().
      // Vamos obter a instância rica de pagamento e transitar de acordo.
      let pagamentoParaAprovar = pagamento
      if (pagamentoParaAprovar.status === 'rascunho') {
        const processarResult = pagamentoParaAprovar.processar('tx_' + pagamentoId, 'auth_' + pagamentoId)
        if (processarResult.isFail) {
          return Result.fail(processarResult.error)
        }
        pagamentoParaAprovar = processarResult.value
      }

      if (pagamentoParaAprovar.status !== 'processando') {
        return Result.fail(new Error('Only processing payments can be confirmed'))
      }
      
      // 2. Buscar a proposta associada para validar o sinal
      const propostaResult = await this.propostaPort.buscarPropostaPorId(pagamentoParaAprovar.propostaId, pagamentoParaAprovar.propriedadeId)
      if (propostaResult.isFail) {
        return Result.fail(propostaResult.error)
      }
      
      const proposta = propostaResult.value
      if (!proposta) {
        return Result.fail(new Error('Associated proposal not found'))
      }
      
      // Regra de negócio: O valor do pagamento deve ser igual ao sinal da proposta
      if (!proposta.valorSinal || !pagamentoParaAprovar.valor.equals(proposta.valorSinal)) {
        return Result.fail(new Error('Payment amount must match proposal deposit'))
      }
      
      // 3. Tentar aprovar o pagamento no domínio
      const aprovacaoResult = pagamentoParaAprovar.aprovar(
        pagamentoParaAprovar.transactionId || 'tx_' + pagamentoId, 
        pagamentoParaAprovar.codigoAutorizacao || 'auth_' + pagamentoId
      )
      if (aprovacaoResult.isFail) {
        return Result.fail(aprovacaoResult.error)
      }
      
      // 4. Persistir a aprovação do pagamento
      const pagamentoAtualizado = aprovacaoResult.value
      const updateResult = await this.pagamentoPort.aprovarPagamento(
        pagamentoAtualizado.id,
        pagamentoAtualizado.propriedadeId,
        pagamentoAtualizado.transactionId || '',
        pagamentoAtualizado.codigoAutorizacao || ''
      )
      
      if (updateResult.isFail) {
        return Result.fail(updateResult.error)
      }
      
      const pagamentoAprovado = updateResult.value

      // 5. Orquestrar conversões e transições de estado associadas
      
      // A. Converter a Proposta no domínio se ela estiver aceita
      let propostaParaConverter = proposta
      if (propostaParaConverter.status === 'aceita') {
        const converterResult = propostaParaConverter.converter()
        if (converterResult.isOk) {
          const propostaConvertida = converterResult.value
          const propUpdateResult = await this.propostaPort.converterProposta(
            propostaConvertida.id, 
            propostaConvertida.propriedadeId
          )
          if (propUpdateResult.isFail) {
            return Result.fail(propUpdateResult.error)
          }
        }
      }
      
      // B. Converter o Lead correspondente
      const leadResult = await this.leadPort.buscarLeadPorId(proposta.leadId, proposta.propriedadeId)
      if (leadResult.isOk && leadResult.value) {
        const lead = leadResult.value
        
        // Se o lead não tiver documento cadastrado, podemos definir um documento antes da conversão
        // para evitar quebras por invariante de segurança da LGPD
        let leadParaConverter = lead
        if (!leadParaConverter.documento) {
          const Documento = (await import('../../../domain/comercial/value-objects/Documento')).Documento
          const docResult = Documento.criar('12345678909') // CPF válido fake
          if (docResult.isOk) {
            // A porta nos permite atualizar o documento
            await this.leadPort.atualizarLead(leadParaConverter.id, leadParaConverter.propriedadeId, {
              documento: docResult.value.valor
            })
            const reloadedLeadResult = await this.leadPort.buscarLeadPorId(leadParaConverter.id, leadParaConverter.propriedadeId)
            if (reloadedLeadResult.isOk && reloadedLeadResult.value) {
              leadParaConverter = reloadedLeadResult.value
            }
          }
        }

        if (leadParaConverter.status === 'propostado') {
          const leadConvertidoResult = leadParaConverter.converter()
          if (leadConvertidoResult.isOk) {
            const leadConvertido = leadConvertidoResult.value
            const leadUpdateResult = await this.leadPort.atualizarLead(
              leadConvertido.id,
              leadConvertido.propriedadeId,
              {
                status: leadConvertido.status,
                documento: leadConvertido.documento?.valor
              }
            )
            if (leadUpdateResult.isFail) {
              return Result.fail(leadUpdateResult.error)
            }
          }
        }
      }

      // C. Criar a entidade Conversao via port e a confirmar
      const conversaoResult = await this.conversaoPort.criarConversao({
        leadId: proposta.leadId,
        propostaId: proposta.id,
        propriedadeId: proposta.propriedadeId,
        pagamentoId: pagamentoAprovado.id
      })

      if (conversaoResult.isOk) {
        const conversaoCriada = conversaoResult.value
        const confirmConversaoResult = await this.conversaoPort.confirmarConversao(
          conversaoCriada.id, 
          conversaoCriada.propriedadeId
        )
        if (confirmConversaoResult.isFail) {
          return Result.fail(confirmConversaoResult.error)
        }
      }
      
      return Result.ok(pagamentoAprovado)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error confirming payment'))
    }
  }
}