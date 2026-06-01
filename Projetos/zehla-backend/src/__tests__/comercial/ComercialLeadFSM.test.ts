import { describe, it, expect } from 'vitest'
import { ComercialLead } from '../../domain/comercial/entities/ComercialLead'
import { LeadScore } from '../../domain/comercial/value-objects/LeadScore'
import { OrigemLead } from '../../domain/comercial/value-objects/OrigemLead'
import { Documento } from '../../domain/comercial/value-objects/Documento'

function criarLeadBase(estado?: string) {
  const origem = OrigemLead.criar('site').value as OrigemLead
  const score = LeadScore.criar(50, 'ideal', {
    budget: true, authority: true, need: true, timeline: true
  }).value as LeadScore
  const lead = ComercialLead.create({
    id: 'lead_001',
    origem,
    propriedadeId: 'prop_123',
    nome: 'João Silva',
    score,
    sdrResponsavel: 'ze_sales',
  })
  return lead.value as ComercialLead
}

describe('ComercialLead — FSM (Máquina de Estados Finito)', () => {
  describe('1. Criação — Estado inicial inviolável', () => {
    it('deve criar lead com estado "entrada" por padrão', () => {
      const lead = criarLeadBase()
      expect(lead.estado).toBe('entrada')
      expect(lead.quantidadeInteracoes).toBe(0)
    })

    it('deve rejeitar criação com estado diferente de "entrada"', () => {
      const origem = OrigemLead.criar('site').value as OrigemLead
      const result = ComercialLead.create({
        id: 'lead_002',
        origem,
        propriedadeId: 'prop_123',
        estado: 'venda_sinal' as any,
      })
      expect(result.isFail).toBe(true)
      expect(result.error.message).toContain('LEAD_NOVO_DEVE_SER_ENTRADA')
    })

    it('deve rejeitar lead sem ID', () => {
      const origem = OrigemLead.criar('site').value as OrigemLead
      const result = ComercialLead.create({
        id: '',
        origem,
        propriedadeId: 'prop_123',
      })
      expect(result.isFail).toBe(true)
      expect(result.error.message).toContain('LEAD_ID_REQUIRED')
    })

    it('deve rejeitar lead sem origem', () => {
      const result = ComercialLead.create({
        id: 'lead_003',
        origem: null as any,
        propriedadeId: 'prop_123',
      })
      expect(result.isFail).toBe(true)
      expect(result.error.message).toContain('ORIGEM_REQUIRED')
    })

    it('deve rejeitar lead sem propriedadeId', () => {
      const origem = OrigemLead.criar('site').value as OrigemLead
      const result = ComercialLead.create({
        id: 'lead_004',
        origem,
        propriedadeId: '',
      })
      expect(result.isFail).toBe(true)
      expect(result.error.message).toContain('PROPRIEDADE_ID_REQUIRED')
    })
  })

  describe('2. Ciclo de Pré-Vendas (SDR — IA)', () => {
    it('deve transitar de "entrada" para "primeira_interacao" via primeiroContato()', () => {
      const lead = criarLeadBase()
      const result = lead.primeiroContato()
      expect(result.isOk).toBe(true)
      if (result.isOk) {
        expect(result.value.estado).toBe('primeira_interacao')
        expect(result.value.quantidadeInteracoes).toBe(1)
      }
    })

    it('deve seguir a cadência sequencial de follow-ups', () => {
      const lead = criarLeadBase()
      const fu1 = lead.primeiroContato().value as ComercialLead
      expect(fu1.estado).toBe('primeira_interacao')

      const fu2 = fu1.realizarFollowUp().value as ComercialLead
      expect(fu2.estado).toBe('follow_up_1')
      expect(fu2.numeroFollowUpAtual).toBe(1)

      const fu3 = fu2.realizarFollowUp().value as ComercialLead
      expect(fu3.estado).toBe('follow_up_2')
      expect(fu3.numeroFollowUpAtual).toBe(2)

      const fu4 = fu3.realizarFollowUp().value as ComercialLead
      expect(fu4.estado).toBe('follow_up_3')
      expect(fu4.numeroFollowUpAtual).toBe(3)
    })

    it('deve permitir agendamento direto de "primeira_interacao"', () => {
      const lead = criarLeadBase()
      const contato = lead.primeiroContato().value as ComercialLead
      const agendado = contato.agendar(new Date('2026-06-10'), 'closer_01')
      expect(agendado.isOk).toBe(true)
      if (agendado.isOk) {
        expect(agendado.value.estado).toBe('agendado')
        expect(agendado.value.closerResponsavel).toBe('closer_01')
      }
    })

    it('deve permitir agendamento de qualquer follow_up', () => {
      const lead = criarLeadBase()
      const contato = lead.primeiroContato().value as ComercialLead
      const fu1 = contato.realizarFollowUp().value as ComercialLead
      const agendado = fu1.agendar(new Date('2026-06-10'))
      expect(agendado.isOk).toBe(true)
      expect(agendado.value?.estado).toBe('agendado')
    })

    it('deve rejeitar follow_up de "entrada" (primeiro_contato é obrigatório)', () => {
      const lead = criarLeadBase()
      const result = lead.realizarFollowUp()
      expect(result.isFail).toBe(true)
      expect(result.error.message).toContain('TRANSICAO_INVALIDA')
    })
  })

  describe('3. Ciclo de Agendamento', () => {
    it('deve permitir reagendamento', () => {
      const lead = criarLeadBase()
      const contato = lead.primeiroContato().value as ComercialLead
      const agendado = contato.agendar(new Date('2026-06-10')).value as ComercialLead
      const reagendado = agendado.reagendar(new Date('2026-06-12'))
      expect(reagendado.isOk).toBe(true)
      if (reagendado.isOk) {
        expect(reagendado.value.estado).toBe('reagendado')
      }
    })

    it('deve permitir reagendamento em loop (reagendado → reagendado)', () => {
      const lead = criarLeadBase()
      const contato = lead.primeiroContato().value as ComercialLead
      const agendado = contato.agendar(new Date('2026-06-10')).value as ComercialLead
      const r1 = agendado.reagendar(new Date('2026-06-12')).value as ComercialLead
      const r2 = r1.reagendar(new Date('2026-06-14'))
      expect(r2.isOk).toBe(true)
      expect(r2.value?.estado).toBe('reagendado')
    })

    it('deve permitir marcar no-show e depois reagendar', () => {
      const lead = criarLeadBase()
      const contato = lead.primeiroContato().value as ComercialLead
      const agendado = contato.agendar(new Date('2026-06-10')).value as ComercialLead
      const noShow = agendado.marcarNoShow()
      expect(noShow.isOk).toBe(true)
      if (noShow.isOk) {
        expect(noShow.value.estado).toBe('no_show')
        const recuperado = noShow.value.reagendar(new Date('2026-06-15'))
        expect(recuperado.isOk).toBe(true)
        expect(recuperado.value?.estado).toBe('reagendado')
      }
    })

    it('deve rejeitar no-show sem data de agendamento', () => {
      const lead = criarLeadBase().primeiroContato().value as ComercialLead
      const result = lead.marcarNoShow()
      expect(result.isFail).toBe(true)
      expect(result.error.message).toContain('NO_SHOW_SEM_AGENDAMENTO')
    })

    it('deve permitir transferência de SDR', () => {
      const lead = criarLeadBase()
      const contato = lead.primeiroContato().value as ComercialLead
      const agendado = contato.agendar(new Date('2026-06-10')).value as ComercialLead
      const transferido = agendado.transferirSdr('sdr_novo')
      expect(transferido.isOk).toBe(true)
      expect(transferido.value?.estado).toBe('transferido_sdr')
      expect(transferido.value?.sdrResponsavel).toBe('sdr_novo')
    })

    it('deve permitir que SDR transferido faça novo agendamento', () => {
      const lead = criarLeadBase()
      const contato = lead.primeiroContato().value as ComercialLead
      const agendado = contato.agendar(new Date('2026-06-10')).value as ComercialLead
      const transferido = agendado.transferirSdr('sdr_novo').value as ComercialLead
      const novoAgendamento = transferido.agendar(new Date('2026-06-15'))
      expect(novoAgendamento.isOk).toBe(true)
      expect(novoAgendamento.value?.estado).toBe('agendado')
    })
  })

  describe('4. Handoff e Negociação (Closer — Humano)', () => {
    it('deve iniciar negociação a partir de agendado', () => {
      const lead = criarLeadBase()
      const contato = lead.primeiroContato().value as ComercialLead
      const agendado = contato.agendar(new Date('2026-06-10')).value as ComercialLead
      const negociacao = agendado.iniciarNegociacao('closer_01')
      expect(negociacao.isOk).toBe(true)
      if (negociacao.isOk) {
        expect(negociacao.value.estado).toBe('em_negociacao')
        expect(negociacao.value.closerResponsavel).toBe('closer_01')
      }
    })

    it('deve realizar handoff com SummaryPackage', () => {
      const lead = criarLeadBase()
      const contato = lead.primeiroContato().value as ComercialLead
      const agendado = contato.agendar(new Date('2026-06-10')).value as ComercialLead
      const handoff = agendado.realizarHandoff('closer_01', {
        score: 80,
        icpFit: 'ideal',
        interacoes: 3,
        objecoes: ['preco'],
        respostas: ['cliente quer ver ROI'],
        ultimoEstado: 'agendado',
      })
      expect(handoff.isOk).toBe(true)
      if (handoff.isOk) {
        expect(handoff.value.estado).toBe('em_negociacao')
        expect(handoff.value.closerResponsavel).toBe('closer_01')
      }
    })

    it('deve rejeitar handoff sem SummaryPackage', () => {
      const lead = criarLeadBase()
      const contato = lead.primeiroContato().value as ComercialLead
      const agendado = contato.agendar(new Date('2026-06-10')).value as ComercialLead
      const handoff = agendado.realizarHandoff('closer_01', null as any)
      expect(handoff.isFail).toBe(true)
      expect(handoff.error.message).toContain('HANDOFF_EXIGE_SUMMARY_PACKAGE')
    })

    it('deve rejeitar handoff de estado não permitido', () => {
      const lead = criarLeadBase()
      const handoff = lead.realizarHandoff('closer_01', {
        score: 50, icpFit: 'ideal', interacoes: 0,
        objecoes: [], respostas: [], ultimoEstado: 'entrada',
      })
      expect(handoff.isFail).toBe(true)
      expect(handoff.error.message).toContain('HANDOFF_NAO_PERMITIDO')
    })

    it('deve fechar venda com sinal', () => {
      const lead = criarLeadBase()
      const contato = lead.primeiroContato().value as ComercialLead
      const agendado = contato.agendar(new Date('2026-06-10')).value as ComercialLead
      const negociacao = agendado.iniciarNegociacao('closer_01').value as ComercialLead
      const sinal = negociacao.fecharVendaSinal('prop_001', 500, 'back_end')
      expect(sinal.isOk).toBe(true)
      if (sinal.isOk) {
        expect(sinal.value.estado).toBe('venda_sinal')
      }
    })

    it('deve rejeitar fechar sinal sem valor positivo', () => {
      const lead = criarLeadBase()
      const contato = lead.primeiroContato().value as ComercialLead
      const agendado = contato.agendar(new Date('2026-06-10')).value as ComercialLead
      const negociacao = agendado.iniciarNegociacao('closer_01').value as ComercialLead
      const sinal = negociacao.fecharVendaSinal('prop_001', 0, 'back_end')
      expect(sinal.isFail).toBe(true)
      expect(sinal.error.message).toContain('SINAL_DEVE_SER_POSITIVO')
    })
  })

  describe('5. Ciclo de Venda e Pós-Venda', () => {
    function leadAteNegociacao(): ComercialLead {
      const lead = criarLeadBase()
      const contato = lead.primeiroContato().value as ComercialLead
      const agendado = contato.agendar(new Date('2026-06-10')).value as ComercialLead
      return agendado.iniciarNegociacao('closer_01').value as ComercialLead
    }

    function leadComDocumento(): ComercialLead {
      const origem = OrigemLead.criar('site').value as OrigemLead
      const score = LeadScore.criar(80, 'ideal', {
        budget: true, authority: true, need: true, timeline: true,
      }).value as LeadScore
      const doc = Documento.criar('12345678909', 'CPF').value as Documento
      const lead = ComercialLead.create({
        id: 'lead_doc',
        origem,
        propriedadeId: 'prop_123',
        nome: 'Maria Souza',
        score,
        documento: doc,
        sdrResponsavel: 'ze_sales',
      }).value as ComercialLead
      const contato = lead.primeiroContato().value as ComercialLead
      const agendado = contato.agendar(new Date('2026-06-10')).value as ComercialLead
      return agendado.iniciarNegociacao('closer_01').value as ComercialLead
    }

    it('deve concluir venda completa: negociação → sinal → concluída', () => {
      const negociacao = leadComDocumento()
      const sinal = negociacao.fecharVendaSinal('prop_001', 500, 'back_end').value as ComercialLead
      expect(sinal.estado).toBe('venda_sinal')

      const concluida = sinal.concluirVenda().value as ComercialLead
      expect(concluida.estado).toBe('venda_concluida')
    })

    it('deve rejeitar concluir venda sem documento', () => {
      const negociacao = leadAteNegociacao()
      const sinal = negociacao.fecharVendaSinal('prop_001', 500, 'back_end').value as ComercialLead
      const concluida = sinal.concluirVenda()
      expect(concluida.isFail).toBe(true)
      expect(concluida.error.message).toContain('DOCUMENTO_OBRIGATORIO_CONVERSAO')
    })

    it('deve transitar por todo o ciclo pós-venda', () => {
      const negociacao = leadComDocumento()
      const sinal = negociacao.fecharVendaSinal('prop_001', 500, 'back_end').value as ComercialLead
      const concluida = sinal.concluirVenda().value as ComercialLead
      const onboarding = concluida.iniciarOnboarding().value as ComercialLead
      expect(onboarding.estado).toBe('em_onboarding')
      expect(onboarding.ehCliente).toBe(true)

      const ativo = onboarding.completarOnboarding().value as ComercialLead
      expect(ativo.estado).toBe('acompanhamento')

      const renovacao = ativo.proximoRenovacao().value as ComercialLead
      expect(renovacao.estado).toBe('renovacao')

      const renovado = renovacao.renovar().value as ComercialLead
      expect(renovado.estado).toBe('acompanhamento')
    })
  })

  describe('6. Transições Ilegais — Rejeição Dogmática', () => {
    it('deve rejeitar "entrada" → "venda_sinal" diretamente', () => {
      const lead = criarLeadBase()
      const result = lead.fecharVendaSinal('prop_001', 500, 'back_end')
      expect(result.isFail).toBe(true)
      expect(result.error.message).toContain('TRANSICAO_INVALIDA')
    })

    it('deve rejeitar "entrada" → "em_negociacao" diretamente', () => {
      const lead = criarLeadBase()
      const result = lead.iniciarNegociacao('closer_01')
      expect(result.isFail).toBe(true)
      expect(result.error.message).toContain('TRANSICAO_INVALIDA')
    })

    it('deve rejeitar "primeira_interacao" → "venda_concluida" sem passar por agendamento', () => {
      const lead = criarLeadBase()
      const contato = lead.primeiroContato().value as ComercialLead
      const result = contato.concluirVenda()
      expect(result.isFail).toBe(true)
      expect(result.error.message).toContain('TRANSICAO_INVALIDA')
    })

    it('deve rejeitar "follow_up_1" → "follow_up_3" pulando follow_up_2', () => {
      const lead = criarLeadBase()
      const contato = lead.primeiroContato().value as ComercialLead
      const fu1 = contato.realizarFollowUp().value as ComercialLead
      expect(fu1.estado).toBe('follow_up_1')
      const result = fu1.clone({ estado: 'follow_up_3' as any }).realizarFollowUp()
      const clone = ComercialLead.create({
        id: 'lead_test',
        origem: OrigemLead.criar('site').value as OrigemLead,
        propriedadeId: 'prop_123',
        estado: 'follow_up_3' as any,
      })
      expect(clone.isFail).toBe(true)
    })

    it('deve rejeitar "venda_sinal" → "agendado" retrocesso', () => {
      const lead = criarLeadBase()
      const contato = lead.primeiroContato().value as ComercialLead
      const agendado = contato.agendar(new Date('2026-06-10')).value as ComercialLead
      const negociacao = agendado.iniciarNegociacao('closer_01').value as ComercialLead
      const sinal = negociacao.fecharVendaSinal('prop_001', 500, 'back_end').value as ComercialLead
      const retrocesso = sinal.agendar(new Date('2026-06-15'))
      expect(retrocesso.isFail).toBe(true)
    })

    it('deve rejeitar "perdido" → "venda_concluida"', () => {
      const lead = criarLeadBase()
      const perdido = lead.perder('Desistiu').value as ComercialLead
      const concluir = perdido.concluirVenda()
      expect(concluir.isFail).toBe(true)
    })
  })

  describe('7. Ciclo de Perda e Reativação', () => {
    it('deve permitir perder lead de qualquer estado de pré-vendas', () => {
      const lead = criarLeadBase()
      const contato = lead.primeiroContato().value as ComercialLead
      const fu1 = contato.realizarFollowUp().value as ComercialLead
      const perdido = fu1.perder('Sem interesse')
      expect(perdido.isOk).toBe(true)
      if (perdido.isOk) {
        expect(perdido.value.estado).toBe('perdido')
        expect(perdido.value.ehAtivo).toBe(false)
      }
    })

    it('deve reativar lead perdido para "entrada"', () => {
      const lead = criarLeadBase()
      const perdido = lead.perder('Sem budget').value as ComercialLead
      const reativado = perdido.reativar('Cliente voltou a ter interesse')
      expect(reativado.isOk).toBe(true)
      if (reativado.isOk) {
        expect(reativado.value.estado).toBe('entrada')
        expect(reativado.value.quantidadeInteracoes).toBe(0)
        expect(reativado.value.closerResponsavel).toBeUndefined()
      }
    })

    it('deve rejeitar reativação de lead não perdido', () => {
      const lead = criarLeadBase().primeiroContato().value as ComercialLead
      const result = lead.reativar('Qualquer motivo')
      expect(result.isFail).toBe(true)
      expect(result.error.message).toContain('TRANSICAO_INVALIDA')
    })

    it('deve permitir entrar em sales_farming a partir de perdido', () => {
      const lead = criarLeadBase()
      const perdido = lead.perder('Sem resposta').value as ComercialLead
      const farming = perdido.entrarSalesFarming()
      expect(farming.isOk).toBe(true)
      if (farming.isOk) {
        expect(farming.value.estado).toBe('sales_farming')
      }
    })

    it('deve sair de sales_farming via follow_up', () => {
      const lead = criarLeadBase()
      const perdido = lead.perder('Sem resposta').value as ComercialLead
      const farming = perdido.entrarSalesFarming().value as ComercialLead
      const retorno = farming.realizarFollowUp()
      expect(retorno.isOk).toBe(true)
      if (retorno.isOk) {
        expect(retorno.value.estado).toBe('primeira_interacao')
      }
    })
  })

  describe('8. Getters e Propriedades', () => {
    it('ehQualificado deve refletir o score', () => {
      const lead = criarLeadBase()
      expect(lead.ehQualificado).toBe(true)
    })

    it('ehCliente deve ser true para estados pós-venda', () => {
      const origem = OrigemLead.criar('site').value as OrigemLead
      const doc = Documento.criar('12345678909', 'CPF').value as Documento
      const score = LeadScore.criar(80, 'ideal', {
        budget: true, authority: true, need: true, timeline: true,
      }).value as LeadScore
      const lead = ComercialLead.create({
        id: 'lead_test',
        origem,
        propriedadeId: 'prop_123',
        nome: 'Teste',
        score,
        documento: doc,
      }).value as ComercialLead
      const contato = lead.primeiroContato().value as ComercialLead
      const agendado = contato.agendar(new Date('2026-06-10')).value as ComercialLead
      const negociacao = agendado.iniciarNegociacao('closer_01').value as ComercialLead
      const sinal = negociacao.fecharVendaSinal('prop_001', 500, 'back_end').value as ComercialLead
      expect(sinal.ehCliente).toBe(true)
    })

    it('estaDisponivelParaHandoff deve ser true para estados agendado/reagendado', () => {
      const lead = criarLeadBase()
      const contato = lead.primeiroContato().value as ComercialLead
      const agendado = contato.agendar(new Date('2026-06-10')).value as ComercialLead
      expect(agendado.estaDisponivelParaHandoff).toBe(true)
      const negociacao = agendado.iniciarNegociacao('closer_01').value as ComercialLead
      expect(negociacao.estaDisponivelParaHandoff).toBe(false)
    })
  })
})
