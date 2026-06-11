import { describe, it, expect } from 'vitest'
import { Lead } from '../../domain/comercial/entities/Lead'
import { Proposta } from '../../domain/comercial/entities/Proposta'
import { Pacote } from '../../domain/comercial/entities/Pacote'
import { Pagamento } from '../../domain/comercial/entities/Pagamento'
import { Conversao } from '../../domain/comercial/entities/Conversao'
import { Canal } from '../../domain/comercial/value-objects/Canal'
import { Email } from '../../domain/comercial/value-objects/Email'
import { Documento } from '../../domain/comercial/value-objects/Documento'
import { Score } from '../../domain/comercial/value-objects/Score'
import { Money } from '../../domain/comercial/value-objects/Money'
import { RegraPrecificacao } from '../../domain/comercial/value-objects/RegraPrecificacao'
import { Result } from '../../shared/Result'

function obterValor<T, E extends Error>(result: Result<T, E>): T {
  if (result.isFail) {
    throw result.error
  }
  return result.value
}

describe('Lead Entity', () => {
  it('should create valid lead', () => {
    const leadResult = Lead.create({
      id: 'lead_1',
      canal: obterValor(Canal.criar('site')),
      propriedadeId: 'prop_1',
      dataCaptura: new Date(),
      nome: 'João Silva',
      email: obterValor(Email.criar('joao@example.com')),
      telefone: '11999999999',
      documento: obterValor(Documento.criar('123.456.789-09', 'CPF')),
      score: obterValor(Score.criar(85)),
      status: 'prospect'
    })
    
    expect(leadResult.isOk).toBe(true)
    if (leadResult.isOk) {
      const lead = leadResult.value
      expect(lead.id).toBe('lead_1')
      expect(lead.nome).toBe('João Silva')
      expect(lead.status).toBe('prospect')
    }
  })

  it('should reject lead with invalid ID', () => {
    const leadResult = Lead.create({
      id: '',
      canal: obterValor(Canal.criar('site')),
      propriedadeId: 'prop_1',
      dataCaptura: new Date()
    })
    
    expect(leadResult.isFail).toBe(true)
  })

  it('should qualify lead with sufficient score', () => {
    const leadResult = Lead.create({
      id: 'lead_1',
      canal: obterValor(Canal.criar('site')),
      propriedadeId: 'prop_1',
      dataCaptura: new Date(),
      nome: 'João Silva',
      email: obterValor(Email.criar('joao@example.com')),
      score: obterValor(Score.criar(85)),
      status: 'prospect'
    })
    
    expect(leadResult.isOk).toBe(true)
    if (leadResult.isOk) {
      const lead = leadResult.value
      const result = lead.qualificar()
      expect(result.isOk).toBe(true)
      if (result.isOk) {
        expect(result.value.status).toBe('qualified')
      }
    }
  })

  it('should not qualify lead with insufficient score', () => {
    const leadResult = Lead.create({
      id: 'lead_1',
      canal: obterValor(Canal.criar('site')),
      propriedadeId: 'prop_1',
      dataCaptura: new Date(),
      nome: 'João Silva',
      email: obterValor(Email.criar('joao@example.com')),
      score: obterValor(Score.criar(25)), // abaixo do mínimo
      status: 'prospect'
    })
    
    expect(leadResult.isOk).toBe(true)
    if (leadResult.isOk) {
      const lead = leadResult.value
      const result = lead.qualificar()
      expect(result.isFail).toBe(true)
    }
  })

  it('should transition lead through states', () => {
    const leadResult = Lead.create({
      id: 'lead_1',
      canal: obterValor(Canal.criar('site')),
      propriedadeId: 'prop_1',
      dataCaptura: new Date(),
      nome: 'João Silva',
      email: obterValor(Email.criar('joao@example.com')),
      score: obterValor(Score.criar(85)),
      status: 'prospect'
    })
    
    expect(leadResult.isOk).toBe(true)
    if (leadResult.isOk) {
      let lead = leadResult.value
      
      // prospect -> qualified
      let result = lead.qualificar()
      expect(result.isOk).toBe(true)
      if (result.isOk) {
        let qualifiedLead = result.value
        expect(qualifiedLead.status).toBe('qualified')
        
        // qualified -> trial
        const trialResult = qualifiedLead.iniciarTrial()
        expect(trialResult.isOk).toBe(true)
        if (trialResult.isOk) {
          let trialLead = trialResult.value
          expect(trialLead.status).toBe('trial')

          // trial -> negotiation
          result = trialLead.negociar()
          expect(result.isOk).toBe(true)
          if (result.isOk) {
            let proposedLead = result.value
            expect(proposedLead.status).toBe('negotiation')
            
            // negotiation -> converted (com documento)
            const leadWithDocResult = Lead.create({
              id: proposedLead.id,
              canal: proposedLead.canal,
              propriedadeId: proposedLead.propriedadeId,
              dataCaptura: proposedLead.dataCaptura,
              nome: proposedLead.nome,
              email: proposedLead.email,
              telefone: proposedLead.telefone,
              documento: obterValor(Documento.criar('123.456.789-09', 'CPF')),
              score: proposedLead.score,
              status: proposedLead.status,
              origemUrl: proposedLead.origemUrl,
              tags: proposedLead.tags,
              ultimaInteracao: proposedLead.ultimaInteracao
            })
            
            expect(leadWithDocResult.isOk).toBe(true)
            if (leadWithDocResult.isOk) {
              result = leadWithDocResult.value.converter()
              expect(result.isOk).toBe(true)
              if (result.isOk) {
                let convertedLead = result.value
                expect(convertedLead.status).toBe('converted')
              }
            }
          }
        }
      }
    }
  })
})

describe('Proposta Entity', () => {
  it('should create valid proposal', () => {
    const propostaResult = Proposta.create({
      id: 'proposta_1',
      leadId: 'lead_1',
      propriedadeId: 'prop_1',
      pacoteId: 'pacote_1',
      dataCriacao: new Date(),
      dataCheckIn: new Date(Date.now() + 86400000), // no futuro
      dataCheckOut: new Date(Date.now() + 86400000 * 5),
      quantidadeHospedes: 2,
      valorTotal: obterValor(Money.deReais(2000)),
      valorSinal: obterValor(Money.deReais(500)),
      status: 'rascunho'
    })
    
    expect(propostaResult.isOk).toBe(true)
    if (propostaResult.isOk) {
      const proposta = propostaResult.value
      expect(proposta.id).toBe('proposta_1')
      expect(proposta.status).toBe('rascunho')
      expect(proposta.quantidadeHospedes).toBe(2)
    }
  })

  it('should reject proposal with deposit > 50% of total', () => {
    const propostaResult = Proposta.create({
      id: 'proposta_1',
      leadId: 'lead_1',
      propriedadeId: 'prop_1',
      pacoteId: 'pacote_1',
      dataCriacao: new Date(),
      dataCheckIn: new Date(Date.now() + 86400000),
      dataCheckOut: new Date(Date.now() + 86400000 * 5),
      quantidadeHospedes: 2,
      valorTotal: obterValor(Money.deReais(2000)),
      valorSinal: obterValor(Money.deReais(1500)), // 75% - inválido
      status: 'rascunho'
    })
    
    expect(propostaResult.isFail).toBe(true)
  })

  it('should transition proposal through states', () => {
    const propostaResult = Proposta.create({
      id: 'proposta_1',
      leadId: 'lead_1',
      propriedadeId: 'prop_1',
      pacoteId: 'pacote_1',
      dataCriacao: new Date(),
      dataCheckIn: new Date(Date.now() + 86400000),
      dataCheckOut: new Date(Date.now() + 86400000 * 5),
      quantidadeHospedes: 2,
      valorTotal: obterValor(Money.deReais(2000)),
      valorSinal: obterValor(Money.deReais(500)),
      status: 'rascunho'
    })
    
    expect(propostaResult.isOk).toBe(true)
    if (propostaResult.isOk) {
      let proposta = propostaResult.value
      
      // rascunho -> enviada
      let result = proposta.enviar()
      expect(result.isOk).toBe(true)
      if (result.isOk) {
        let sentProposta = result.value
        expect(sentProposta.status).toBe('enviada')
        
        // enviada -> vista
        result = sentProposta.visualizar()
        expect(result.isOk).toBe(true)
        if (result.isOk) {
          let viewedProposta = result.value
          expect(viewedProposta.status).toBe('vista')
          
          // vista -> negociacao
          result = viewedProposta.negociar()
          expect(result.isOk).toBe(true)
          if (result.isOk) {
            let negotiatedProposta = result.value
            expect(negotiatedProposta.status).toBe('negociacao')
            
            // negociacao -> aceita
            result = negotiatedProposta.aceitar()
            expect(result.isOk).toBe(true)
            if (result.isOk) {
              let acceptedProposta = result.value
              expect(acceptedProposta.status).toBe('aceita')
              
              // aceita -> convertida
              result = acceptedProposta.converter()
              expect(result.isOk).toBe(true)
              if (result.isOk) {
                let convertedProposta = result.value
                expect(convertedProposta.status).toBe('convertida')
              }
            }
          }
        }
      }
    }
  })

  it('should apply discount correctly', () => {
    const propostaResult = Proposta.create({
      id: 'proposta_1',
      leadId: 'lead_1',
      propriedadeId: 'prop_1',
      pacoteId: 'pacote_1',
      dataCriacao: new Date(),
      dataCheckIn: new Date(Date.now() + 86400000),
      dataCheckOut: new Date(Date.now() + 86400000 * 5),
      quantidadeHospedes: 2,
      valorTotal: obterValor(Money.deReais(2000)),
      valorSinal: obterValor(Money.deReais(500)),
      status: 'rascunho'
    })
    
    expect(propostaResult.isOk).toBe(true)
    if (propostaResult.isOk) {
      const proposta = propostaResult.value
      
      const desconto = obterValor(Money.deReais(200)) // R$ 200,00 (10%)
      const result = proposta.aplicarDesconto(desconto)
      
      expect(result.isOk).toBe(true)
      if (result.isOk) {
        const propostaComDesconto = result.value
        expect(propostaComDesconto.descontoAplicado?.centavos).toBe(20000)
        expect(propostaComDesconto.valorTotal?.centavos).toBe(180000) // 2000 - 200 = 1800
      }
    }
  })
})

describe('Pacote Entity', () => {
  it('should create valid package', () => {
    const regraResult = RegraPrecificacao.criar({
      tipo: 'por_pessoa',
      valorBase: obterValor(Money.deReais(100)),
      valorPorPessoa: obterValor(Money.deReais(50))
    })
    
    expect(regraResult.isOk).toBe(true)
    if (regraResult.isOk) {
      const regra = regraResult.value
      
      const pacoteResult = Pacote.create({
        id: 'pacote_1',
        propriedadeId: 'prop_1',
        nome: 'Pacote Suite Master',
        descricao: 'Suíte master com vista para o mar',
        tipoQuarto: 'suite',
        capacidadeMaxima: 4,
        servicosInclusos: ['cafe da manha', 'wifi'],
        regraPrecificacao: regra,
        validadeInicio: new Date('2026-01-01'),
        validadeFim: new Date('2026-12-31'),
        status: 'ativo'
      })
      
      expect(pacoteResult.isOk).toBe(true)
      if (pacoteResult.isOk) {
        const pacote = pacoteResult.value
        expect(pacote.id).toBe('pacote_1')
        expect(pacote.nome).toBe('Pacote Suite Master')
        expect(pacote.status).toBe('ativo')
      }
    }
  })

  it('should calculate package value correctly', () => {
    const regraResult = RegraPrecificacao.criar({
      tipo: 'por_noite',
      valorBase: obterValor(Money.deReais(1)),
      valorPorNoite: obterValor(Money.deReais(100))
    })
    
    expect(regraResult.isOk).toBe(true)
    if (regraResult.isOk) {
      const regra = regraResult.value
      
      const pacoteResult = Pacote.create({
        id: 'pacote_1',
        propriedadeId: 'prop_1',
        nome: 'Pacote Suite Master',
        capacidadeMaxima: 4,
        regraPrecificacao: regra,
        status: 'ativo'
      })
      
      expect(pacoteResult.isOk).toBe(true)
      if (pacoteResult.isOk) {
        const pacote = pacoteResult.value
        
        // Test 1 diária para 1 pessoa
        let valorResult = pacote.calcularValorTotal(1, 1)
        expect(valorResult.isOk).toBe(true)
        if (valorResult.isOk) {
          expect(valorResult.value.centavos).toBe(10000) // 100.00 * 1 = 10000 centavos
        }
        
        // Test 3 diárias para 2 pessoas 
        valorResult = pacote.calcularValorTotal(2, 3)
        expect(valorResult.isOk).toBe(true)
        if (valorResult.isOk) {
          expect(valorResult.value.centavos).toBe(30000) // 100.00 * 3 = 30000 centavos
        }
      }
    }
  })

  it('should transition package through states', () => {
    const regraResult = RegraPrecificacao.criar({
      tipo: 'por_noite',
      valorBase: obterValor(Money.deReais(1)),
      valorPorNoite: obterValor(Money.deReais(100))
    })
    
    expect(regraResult.isOk).toBe(true)
    if (regraResult.isOk) {
      const regra = regraResult.value
      
      const pacoteResult = Pacote.create({
        id: 'pacote_1',
        propriedadeId: 'prop_1',
        nome: 'Pacote Teste',
        regraPrecificacao: regra,
        status: 'ativo'
      })
      
      expect(pacoteResult.isOk).toBe(true)
      if (pacoteResult.isOk) {
        let pacote = pacoteResult.value
        
        // ativo -> pausado
        let result = pacote.pausar()
        expect(result.isOk).toBe(true)
        if (result.isOk) {
          let pausedPacote = result.value
          expect(pausedPacote.status).toBe('pausado')
          
          // pausado -> arquivado
          result = pausedPacote.arquivar()
          expect(result.isOk).toBe(true)
          if (result.isOk) {
            let archivedPacote = result.value
            expect(archivedPacote.status).toBe('arquivado')
          }
        }
      }
    }
  })
})

describe('Pagamento Entity', () => {
  it('should create valid payment', () => {
    const pagamentoResult = Pagamento.create({
      id: 'pagamento_1',
      propostaId: 'proposta_1',
      propriedadeId: 'prop_1',
      valor: obterValor(Money.deReais(500)),
      metodoPagamento: 'cartao_credito',
      status: 'rascunho'
    })
    
    expect(pagamentoResult.isOk).toBe(true)
    if (pagamentoResult.isOk) {
      const pagamento = pagamentoResult.value
      expect(pagamento.id).toBe('pagamento_1')
      expect(pagamento.status).toBe('rascunho')
      expect(pagamento.valor.centavos).toBe(50000)
    }
  })

  it('should reject zero value payment', () => {
    const pagamentoResult = Pagamento.create({
      id: 'pagamento_1',
      propostaId: 'proposta_1',
      propriedadeId: 'prop_1',
      valor: Money.zero(),
      status: 'rascunho'
    })
    
    expect(pagamentoResult.isFail).toBe(true)
  })

  it('should transition payment through states', () => {
    const pagamentoResult = Pagamento.create({
      id: 'pagamento_1',
      propostaId: 'proposta_1',
      propriedadeId: 'prop_1',
      valor: obterValor(Money.deReais(500)),
      metodoPagamento: 'cartao_credito',
      status: 'rascunho'
    })
    
    expect(pagamentoResult.isOk).toBe(true)
    if (pagamentoResult.isOk) {
      let pagamento = pagamentoResult.value
      
      // rascunho -> processando
      let result = pagamento.processar('txn_123', 'auth_123')
      expect(result.isOk).toBe(true)
      if (result.isOk) {
        let processingPagamento = result.value
        expect(processingPagamento.status).toBe('processando')
        expect(processingPagamento.transactionId).toBe('txn_123')
        
        // processando -> aprovado
        result = processingPagamento.aprovar('txn_123', 'auth_123')
        expect(result.isOk).toBe(true)
        if (result.isOk) {
          let approvedPagamento = result.value
          expect(approvedPagamento.status).toBe('aprovado')
          expect(approvedPagamento.codigoAutorizacao).toBe('auth_123')
          
          // aprovado -> estornado
          result = approvedPagamento.estornar('Solicitação do cliente')
          expect(result.isOk).toBe(true)
          if (result.isOk) {
            let refundedPagamento = result.value
            expect(refundedPagamento.status).toBe('estornado')
          }
        }
      }
    }
  })
})

describe('Conversao Entity', () => {
  it('should create valid conversion', () => {
    const conversaoResult = Conversao.create({
      id: 'conversao_1',
      leadId: 'lead_1',
      propostaId: 'proposta_1',
      propriedadeId: 'prop_1',
      pagamentoId: 'pagamento_1',
      dataConversao: new Date()
    })
    
    expect(conversaoResult.isOk).toBe(true)
    if (conversaoResult.isOk) {
      const conversao = conversaoResult.value
      expect(conversao.id).toBe('conversao_1')
      expect(conversao.status).toBe('pendente')
    }
  })

  it('should transition conversion through states', () => {
    const conversaoResult = Conversao.create({
      id: 'conversao_1',
      leadId: 'lead_1',
      propostaId: 'proposta_1',
      propriedadeId: 'prop_1',
      pagamentoId: 'pagamento_1',
      dataConversao: new Date(),
      status: 'pendente'
    })
    
    expect(conversaoResult.isOk).toBe(true)
    if (conversaoResult.isOk) {
      let conversao = conversaoResult.value
      
      // pendente -> confirmada
      let result = conversao.confirmar()
      expect(result.isOk).toBe(true)
      if (result.isOk) {
        let confirmedConversao = result.value
        expect(confirmedConversao.status).toBe('confirmada')
        expect(confirmedConversao.dataConfirmacao).toBeInstanceOf(Date)
        
        // pendente -> cancelada
        const conversao2Result = Conversao.create({
          id: 'conversao_2',
          leadId: 'lead_1',
          propostaId: 'proposta_1',
          propriedadeId: 'prop_1',
          pagamentoId: 'pagamento_1',
          dataConversao: new Date(),
          status: 'pendente'
        })
        
        expect(conversao2Result.isOk).toBe(true)
        if (conversao2Result.isOk) {
          let conversao2 = conversao2Result.value
          result = conversao2.cancelar('Cliente desistiu')
          expect(result.isOk).toBe(true)
          if (result.isOk) {
            let cancelledConversao = result.value
            expect(cancelledConversao.status).toBe('cancelada')
            expect(cancelledConversao.motivoCancelamento).toBe('Cliente desistiu')
          }
        }
      }
    }
  })

  it('should require payment confirmation for conversion', () => {
    const conversaoResult = Conversao.create({
      id: 'conversao_1',
      leadId: 'lead_1',
      propostaId: 'proposta_1',
      propriedadeId: 'prop_1',
      pagamentoId: 'pagamento_1',
      dataConversao: new Date(),
      status: 'pendente'
    })
    
    expect(conversaoResult.isOk).toBe(true)
    if (conversaoResult.isOk) {
      const conversao = conversaoResult.value
      expect(conversao.status).toBe('pendente')
    }
  })
})
