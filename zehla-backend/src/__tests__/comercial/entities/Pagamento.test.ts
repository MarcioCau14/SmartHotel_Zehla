import { Pagamento } from '../../../domain/comercial/entities/Pagamento'
import { Proposta } from '../../../domain/comercial/entities/Proposta'
import { Lead } from '../../../domain/comercial/entities/Lead'
import { Pacote } from '../../../domain/comercial/entities/Pacote'
import { Canal } from '../../../domain/comercial/value-objects/Canal'
import { Email } from '../../../domain/comercial/value-objects/Email'
import { Documento } from '../../../domain/comercial/value-objects/Documento'
import { Score } from '../../../domain/comercial/value-objects/Score'
import { Money } from '../../../domain/comercial/value-objects/Money'
import { RegraPrecificacao } from '../../../domain/comercial/value-objects/RegraPrecificacao'
import { Result } from '../../../shared/Result'

function obterValor<T, E extends Error>(result: Result<T, E>): T {
  if (result.isFail) {
    throw result.error
  }
  return result.value
}

describe('Pagamento Entity', () => {
  const propriedadeId = 'prop_123'

  let proposta: Proposta
  let leadQualificado: Lead
  let pacote: Pacote
  let pagamento: Pagamento

  beforeEach(() => {
    // Setup lead qualificado
    const canal = obterValor(Canal.criar('site'))
    const dataCaptura = new Date()

    const leadResult = Lead.create({
      id: 'lead_1',
      canal,
      propriedadeId,
      dataCaptura,
      nome: 'João Silva',
      email: obterValor(Email.criar('joao@example.com')),
      score: obterValor(Score.criar(50))
    })
    leadQualificado = obterValor(leadResult)

    // Setup pacote
    const regraPrecificacao = obterValor(RegraPrecificacao.criar({
      tipo: 'por_noite',
      valorBase: obterValor(Money.deReais(1)), // valorBase deve ser maior que zero (invariante)
      valorPorNoite: obterValor(Money.deReais(100))
    }))

    const pacoteResult = Pacote.create({
      id: 'pacote_1',
      propriedadeId,
      nome: 'Pacote Standard',
      regraPrecificacao
    })
    pacote = obterValor(pacoteResult)

    // Setup proposta aceita (necessária para pagamento)
    const dataCheckIn = new Date(Date.now() + 86400000)
    const dataCheckOut = new Date(Date.now() + 86400000 * 3)

    const propostaResult = Proposta.create({
      id: 'proposta_1',
      leadId: leadQualificado.id,
      propriedadeId,
      pacoteId: pacote.id,
      dataCriacao: new Date(),
      dataCheckIn,
      dataCheckOut,
      quantidadeHospedes: 2,
      valorTotal: obterValor(Money.deReais(200)),
      valorSinal: obterValor(Money.deReais(50)),
      status: 'rascunho'
    })

    proposta = obterValor(propostaResult)

    // Enviar, ver, negociar e aceitar
    proposta = obterValor(proposta.enviar())
    proposta = obterValor(proposta.visualizar())
    proposta = obterValor(proposta.negociar())
    proposta = obterValor(proposta.aceitar())

    // Setup pagamento padrão para uso comum
    const pagamentoResult = Pagamento.create({
      id: 'pagamento_1',
      propostaId: proposta.id,
      propriedadeId,
      valor: obterValor(Money.deReais(50))
    })
    pagamento = obterValor(pagamentoResult)
  })

  describe('Creation', () => {
    it('should create a valid payment in draft status', () => {
      const pagamentoResult = Pagamento.create({
        id: 'pagamento_1',
        propostaId: proposta.id,
        propriedadeId,
        valor: obterValor(Money.deReais(50)) // mesmo valor do sinal
      })

      expect(pagamentoResult.isOk).toBe(true)
      if (pagamentoResult.isOk) {
        const pagamento = pagamentoResult.value
        expect(pagamento.id).toBe('pagamento_1')
        expect(pagamento.propostaId).toBe(proposta.id)
        expect(pagamento.propriedadeId).toBe(propriedadeId)
        expect(pagamento.valor.equals(obterValor(Money.deReais(50)))).toBe(true)
        expect(pagamento.status).toBe('rascunho')
      }
    })

    it('should reject payment with empty id', () => {
      const pagamentoResult = Pagamento.create({
        id: '',
        propostaId: proposta.id,
        propriedadeId,
        valor: obterValor(Money.deReais(50))
      })

      expect(pagamentoResult.isFail).toBe(true)
    })

    it('should reject payment with missing propostaId', () => {
      const pagamentoResult = Pagamento.create({
        id: 'pagamento_1',
        propostaId: '',
        propriedadeId,
        valor: obterValor(Money.deReais(50))
      })

      expect(pagamentoResult.isFail).toBe(true)
    })

    it('should reject payment with missing propriedadeId', () => {
      const pagamentoResult = Pagamento.create({
        id: 'pagamento_1',
        propostaId: proposta.id,
        propriedadeId: '',
        valor: obterValor(Money.deReais(50))
      })

      expect(pagamentoResult.isFail).toBe(true)
    })

    it('should reject payment with zero value', () => {
      const pagamentoResult = Pagamento.create({
        id: 'pagamento_1',
        propostaId: proposta.id,
        propriedadeId,
        valor: Money.zero()
      })

      expect(pagamentoResult.isFail).toBe(true)
    })

    it('should reject payment with negative value because Money cannot be negative', () => {
      const valorResult = Money.deReais(-10)
      expect(valorResult.isFail).toBe(true)
    })
  })

  describe('State Transitions', () => {


    it('should transition from draft to processing', () => {
      const processarResult = pagamento.processar('txn_123', 'auth_123')
      expect(processarResult.isOk).toBe(true)
      if (processarResult.isOk) {
        expect(obterValor(processarResult).status).toBe('processando')
      }
    })

    it('should reject processing non-draft payment', () => {
      // Primeiro processar
      const pagamentoProcessando = obterValor(pagamento.processar('txn_123', 'auth_123'))
      // Tentar processar novamente
      const processarResult = pagamentoProcessando.processar('txn_456', 'auth_456')
      expect(processarResult.isFail).toBe(true)
    })

    it('should transition from processing to approved', () => {
      const pagamentoProcessando = obterValor(pagamento.processar('txn_123', 'auth_123'))
      const aprovarResult = pagamentoProcessando.aprovar('txn_123', 'auth_123')
      expect(aprovarResult.isOk).toBe(true)
      if (aprovarResult.isOk) {
        expect(obterValor(aprovarResult).status).toBe('aprovado')
      }
    })

    it('should reject approving non-processing payment', () => {
      // Tentar aprovar diretamente do rascunho
      const aprovarResult = pagamento.aprovar('txn_123', 'auth_123')
      expect(aprovarResult.isFail).toBe(true)

      // Ou de um pagamento já aprovado
      const pagamentoAprovado = obterValor(pagamento.processar('txn_123', 'auth_123'))
      const pagamentoAprovadoObj = obterValor(pagamentoAprovado.aprovar('txn_123', 'auth_123'))
      const aprovarResult2 = pagamentoAprovadoObj.aprovar('txn_456', 'auth_456')
      expect(aprovarResult2.isFail).toBe(true)
    })

    it('should transition from processing to rejected', () => {
      const pagamentoProcessando = obterValor(pagamento.processar('txn_123', 'auth_123'))
      const recusarResult = pagamentoProcessando.recusar('Insufficient funds')
      expect(recusarResult.isOk).toBe(true)
      if (recusarResult.isOk) {
        expect(obterValor(recusarResult).status).toBe('recusado')
      }
    })

    it('should reject rejecting non-processing payment', () => {
      // Tentar recusar diretamente do rascunho
      const recusarResult = pagamento.recusar('Insufficient funds')
      expect(recusarResult.isFail).toBe(true)

      // Ou de um pagamento já rejeitado
      const pagamentoRecusado = obterValor(pagamento.processar('txn_123', 'auth_123'))
      const pagamentoRecusadoObj = obterValor(pagamentoRecusado.recusar('Insufficient funds'))
      const recusarResult2 = pagamentoRecusadoObj.recusar('Other reason')
      expect(recusarResult2.isFail).toBe(true)
    })

    it('should transition from approved to refunded', () => {
      const pagamentoProcessando = obterValor(pagamento.processar('txn_123', 'auth_123'))
      const pagamentoAprovado = obterValor(pagamentoProcessando.aprovar('txn_123', 'auth_123'))
      const estornarResult = pagamentoAprovado.estornar('Customer request')
      expect(estornarResult.isOk).toBe(true)
      if (estornarResult.isOk) {
        expect(obterValor(estornarResult).status).toBe('estornado')
      }
    })

    it('should reject refunding non-approved payment', () => {
      // Tentar estornar diretamente do rascunho
      const estornarResult = pagamento.estornar('Customer request')
      expect(estornarResult.isFail).toBe(true)

      // Ou de um pagamento processando
      const pagamentoProcessando = obterValor(pagamento.processar('txn_123', 'auth_123'))
      const estornarResult2 = pagamentoProcessando.estornar('Customer request')
      expect(estornarResult2.isFail).toBe(true)

      // Ou de um pagamento já estornado
      const pagamentoEstornado = obterValor(pagamento.processar('txn_123', 'auth_123'))
      const pagamentoEstornadoObj = obterValor(pagamentoEstornado.aprovar('txn_123', 'auth_123'))
      const pagamentoEstornadoFinal = obterValor(pagamentoEstornadoObj.estornar('Customer request'))
      const estornarResult3 = pagamentoEstornadoFinal.estornar('Another request')
      expect(estornarResult3.isFail).toBe(true)
    })

    it('should transition from approved or refunded to reimbursed', () => {
      // De approved para reembolsado
      const pagamentoProcessando = obterValor(pagamento.processar('txn_123', 'auth_123'))
      const pagamentoAprovado = obterValor(pagamentoProcessando.aprovar('txn_123', 'auth_123'))
      const reembolsarResult = pagamentoAprovado.reembolsar('Service cancellation')
      expect(reembolsarResult.isOk).toBe(true)
      if (reembolsarResult.isOk) {
        expect(obterValor(reembolsarResult).status).toBe('reembolsado')
      }

      // De estornado para reembolsado
      const pagamentoEstornado = obterValor(pagamentoAprovado.estornar('Customer request'))
      const reembolsarResult2 = pagamentoEstornado.reembolsar('Service cancellation')
      expect(reembolsarResult2.isOk).toBe(true)
      if (reembolsarResult2.isOk) {
        expect(obterValor(reembolsarResult2).status).toBe('reembolsado')
      }
    })

    it('should reject reimbursing non-approved/non-refunded payment', () => {
      // Tentar reembolsar diretamente do rascunho
      const reembolsarResult = pagamento.reembolsar('Service cancellation')
      expect(reembolsarResult.isFail).toBe(true)

      // Ou de um pagamento processando
      const pagamentoProcessando = obterValor(pagamento.processar('txn_123', 'auth_123'))
      const reembolsarResult2 = pagamentoProcessando.reembolsar('Service cancellation')
      expect(reembolsarResult2.isFail).toBe(true)

      // Ou de um pagamento rejeitado
      const pagamentoRecusado = obterValor(pagamento.processar('txn_123', 'auth_123'))
      const pagamentoRecusadoObj = obterValor(pagamentoRecusado.recusar('Insufficient funds'))
      const reembolsarResult3 = pagamentoRecusadoObj.reembolsar('Service cancellation')
      expect(reembolsarResult3.isFail).toBe(true)
    })
  })

  describe('Getters', () => {
    it('should correctly identify payment status', () => {
      expect(pagamento.ehRascunho).toBe(true)
      expect(pagamento.ehProcessando).toBe(false)
      expect(pagamento.ehAprovado).toBe(false)
      expect(pagamento.ehRecusado).toBe(false)
      expect(pagamento.ehEstornado).toBe(false)
      expect(pagamento.ehReembolsado).toBe(false)

      const pagamentoProcessando = obterValor(pagamento.processar('txn_123', 'auth_123'))
      expect(pagamentoProcessando.ehRascunho).toBe(false)
      expect(pagamentoProcessando.ehProcessando).toBe(true)

      const pagamentoAprovado = obterValor(pagamentoProcessando.aprovar('txn_123', 'auth_123'))
      expect(pagamentoAprovado.ehAprovado).toBe(true)

      const pagamentoRecusado = obterValor(pagamento.processar('txn_123', 'auth_123'))
      const pagamentoRecusadoObj = obterValor(pagamentoRecusado.recusar('Insufficient funds'))
      expect(pagamentoRecusadoObj.ehRecusado).toBe(true)

      const pagamentoEstornado = obterValor(pagamentoProcessando.aprovar('txn_123', 'auth_123'))
      const pagamentoEstornadoObj = obterValor(pagamentoEstornado.estornar('Customer request'))
      expect(pagamentoEstornadoObj.ehEstornado).toBe(true)

      const pagamentoReembolsado = obterValor(pagamentoEstornadoObj.reembolsar('Service cancellation'))
      expect(pagamentoReembolsado.ehReembolsado).toBe(true)
    })
  })
})