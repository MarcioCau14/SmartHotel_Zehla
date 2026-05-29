import { IPropostaPort } from '../../../application/comercial/ports/IPropostaPort'
import { IPagamentoPort } from '../../../application/comercial/ports/IPagamentoPort'
import { Result } from '../../../shared/Result'
import { Proposta } from '../../../domain/comercial/entities/Proposta'
import { Money } from '../../../domain/comercial/value-objects/Money'

export class AceitarPropostaUseCase {
  constructor(
    private readonly propostaPort: IPropostaPort,
    private readonly pagamentoPort: IPagamentoPort
  ) {}

  async execute(propostaId: string, propriedadeId: string): Promise<Result<Proposta, Error>> {
    try {
      // 1. Buscar a proposta
      const propostaResult = await this.propostaPort.buscarPropostaPorId(propostaId, propriedadeId)
      if (propostaResult.isFail) {
        return Result.fail(propostaResult.error)
      }
      
      const proposta = propostaResult.value
      if (!proposta) {
        return Result.fail(new Error('Proposal not found'))
      }
      
      // 2. Encadeamento de transições de domínio válidas para respeitar as invariantes
      let propostaParaAceitar = proposta
      
      if (propostaParaAceitar.status === 'enviada') {
        const visualizarResult = propostaParaAceitar.visualizar()
        if (visualizarResult.isFail) return Result.fail(visualizarResult.error)
        propostaParaAceitar = visualizarResult.value
      }
      
      if (propostaParaAceitar.status === 'vista') {
        const negociarResult = propostaParaAceitar.negociar()
        if (negociarResult.isFail) return Result.fail(negociarResult.error)
        propostaParaAceitar = negociarResult.value
      }
      
      if (propostaParaAceitar.status !== 'negociacao') {
        return Result.fail(new Error('Only proposals in negotiation can be accepted'))
      }
      
      const aceitacaoResult = propostaParaAceitar.aceitar()
      if (aceitacaoResult.isFail) {
        return Result.fail(aceitacaoResult.error)
      }
      
      const propostaAceita = aceitacaoResult.value
      
      // 3. Persistir a proposta como aceita no repositório
      const updateResult = await this.propostaPort.aceitarProposta(propostaAceita.id, propostaAceita.propriedadeId)
      if (updateResult.isFail) {
        return Result.fail(updateResult.error)
      }
      
      const propostaPersistida = updateResult.value
      
      // 4. Determinar ou calcular o valor do sinal da proposta
      let valorSinal = propostaPersistida.valorSinal
      if (!valorSinal || valorSinal.isZero()) {
        const calcularSinalResult = propostaPersistida.calcularSinal(20) // padrão 20%
        if (calcularSinalResult.isFail) {
          return Result.fail(calcularSinalResult.error)
        }
        valorSinal = calcularSinalResult.value
        
        // Atualizar o valor do sinal na proposta persistida se necessário
        const updateSinalResult = await this.propostaPort.atualizarSinalProposta(
          propostaPersistida.id,
          propostaPersistida.propriedadeId,
          valorSinal
        )
        if (updateSinalResult.isFail) {
          return Result.fail(updateSinalResult.error)
        }
      }
      
      // 5. Criar o pagamento pendente do sinal
      const pagamentoResult = await this.pagamentoPort.criarPagamento({
        propostaId: propostaPersistida.id,
        propriedadeId: propostaPersistida.propriedadeId,
        valor: valorSinal,
        metodoPagamento: 'pix' // Método padrão para sinal
      })
      
      if (pagamentoResult.isFail) {
        return Result.fail(pagamentoResult.error)
      }
      
      return Result.ok(propostaPersistida)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error accepting proposal'))
    }
  }
}