import { Pacote } from '../../../domain/comercial/entities/Pacote'
import { RegraPrecificacao } from '../../../domain/comercial/value-objects/RegraPrecificacao'
import { Money } from '../../../domain/comercial/value-objects/Money'
import { Result } from '../../../shared/Result'

function obterValor<T, E extends Error>(result: Result<T, E>): T {
  if (result.isFail) {
    throw result.error
  }
  return result.value
}

describe('Pacote Entity', () => {
  const propriedadeId = 'prop_123'

  describe('Creation', () => {
    it('should create a valid package', () => {
      const regraPrecificacao = obterValor(RegraPrecificacao.criar({
        tipo: 'por_noite',
        valorBase: obterValor(Money.deReais(1)), // valorBase deve ser maior que zero (invariante)
        valorPorNoite: obterValor(Money.deReais(150))
      }))

      const pacoteResult = Pacote.create({
        id: 'pacote_1',
        propriedadeId,
        nome: 'Pacote Luxo',
        regraPrecificacao
      })

      expect(pacoteResult.isOk).toBe(true)
      if (pacoteResult.isOk) {
        const pacote = pacoteResult.value
        expect(pacote.id).toBe('pacote_1')
        expect(pacote.propriedadeId).toBe(propriedadeId)
        expect(pacote.nome).toBe('Pacote Luxo')
        expect(pacote.status).toBe('ativo')
        expect(pacote.versao).toBe(1)
      }
    })

    it('should reject package with empty id', () => {
      const regraPrecificacao = obterValor(RegraPrecificacao.criar({
        tipo: 'fixo',
        valorBase: obterValor(Money.deReais(100))
      }))

      const pacoteResult = Pacote.create({
        id: '',
        propriedadeId,
        nome: 'Pacote Teste',
        regraPrecificacao
      })

      expect(pacoteResult.isFail).toBe(true)
    })

    it('should reject package with missing propriedadeId', () => {
      const regraPrecificacao = obterValor(RegraPrecificacao.criar({
        tipo: 'fixo',
        valorBase: obterValor(Money.deReais(100))
      }))

      const pacoteResult = Pacote.create({
        id: 'pacote_1',
        propriedadeId: '',
        nome: 'Pacote Teste',
        regraPrecificacao
      })

      expect(pacoteResult.isFail).toBe(true)
    })

    it('should reject package with empty name', () => {
      const regraPrecificacao = obterValor(RegraPrecificacao.criar({
        tipo: 'fixo',
        valorBase: obterValor(Money.deReais(100))
      }))

      const pacoteResult = Pacote.create({
        id: 'pacote_1',
        propriedadeId,
        nome: '',
        regraPrecificacao
      })

      expect(pacoteResult.isFail).toBe(true)
    })

    it('should reject package with name too long (>120 chars)', () => {
      const regraPrecificacao = obterValor(RegraPrecificacao.criar({
        tipo: 'fixo',
        valorBase: obterValor(Money.deReais(100))
      }))

      const nomeLongo = 'a'.repeat(121)
      const pacoteResult = Pacote.create({
        id: 'pacote_1',
        propriedadeId,
        nome: nomeLongo,
        regraPrecificacao
      })

      expect(pacoteResult.isFail).toBe(true)
    })

    it('should reject package with invalid capacity (<=0)', () => {
      const regraPrecificacao = obterValor(RegraPrecificacao.criar({
        tipo: 'fixo',
        valorBase: obterValor(Money.deReais(100))
      }))

      const pacoteResult = Pacote.create({
        id: 'pacote_1',
        propriedadeId,
        nome: 'Pacote Teste',
        capacidadeMaxima: 0,
        regraPrecificacao
      })

      expect(pacoteResult.isFail).toBe(true)
    })

    it('should reject package with invalid dates (end before start)', () => {
      const regraPrecificacao = obterValor(RegraPrecificacao.criar({
        tipo: 'fixo',
        valorBase: obterValor(Money.deReais(100))
      }))

      const pacoteResult = Pacote.create({
        id: 'pacote_1',
        propriedadeId,
        nome: 'Pacote Teste',
        validadeInicio: new Date(Date.now() + 86400000), // Amanhã
        validadeFim: new Date(Date.now()), // Hoje
        regraPrecificacao
      })

      expect(pacoteResult.isFail).toBe(true)
    })

    it('should require a pricing rule', () => {
      const pacoteResult = Pacote.create({
        id: 'pacote_1',
        propriedadeId,
        nome: 'Pacote Teste'
        // regraPrecificacao ausente propositalmente
      })

      expect(pacoteResult.isFail).toBe(true)
    })
  })

  describe('State Transitions', () => {
    let pacote: Pacote

    beforeEach(() => {
      const regraPrecificacao = obterValor(RegraPrecificacao.criar({
        tipo: 'fixo',
        valorBase: obterValor(Money.deReais(100))
      }))

      const pacoteResult = Pacote.create({
        id: 'pacote_1',
        propriedadeId,
        nome: 'Pacote Teste',
        regraPrecificacao
      })
      pacote = obterValor(pacoteResult)
    })

    it('should activate package', () => {
      // Primeiro arquivar para testar ativação
      const pacoteArquivado = obterValor(pacote.arquivar())
      const ativarResult = pacoteArquivado.ativar()
      expect(ativarResult.isFail).toBe(true) // Não pode ativar diretamente do arquivado

      // Testar ativação normal (de pausado)
      const pacotePausado = obterValor(pacote.pausar())
      const ativarResultNormal = pacotePausado.ativar()
      expect(ativarResultNormal.isOk).toBe(true)
      if (ativarResultNormal.isOk) {
        expect(obterValor(ativarResultNormal).status).toBe('ativo')
      }
    })

    it('should pause package', () => {
      const pausarResult = pacote.pausar()
      expect(pausarResult.isOk).toBe(true)
      if (pausarResult.isOk) {
        expect(obterValor(pausarResult).status).toBe('pausado')
      }
    })

    it('should archive package', () => {
      const arquivarResult = pacote.arquivar()
      expect(arquivarResult.isOk).toBe(true)
      if (arquivarResult.isOk) {
        expect(obterValor(arquivarResult).status).toBe('arquivado')
      }
    })

    it('should allow archiving an already archived package', () => {
      const pacoteArquivado = obterValor(pacote.arquivar())
      const arquivarNovamenteResult = pacoteArquivado.arquivar()
      expect(arquivarNovamenteResult.isOk).toBe(true)
    })

    it('should reject pausing an archived package', () => {
      const pacoteArquivado = obterValor(pacote.arquivar())
      const pausarResult = pacoteArquivado.pausar()
      expect(pausarResult.isFail).toBe(true)
    })

    it('should reject activating an archived package directly', () => {
      const pacoteArquivado = obterValor(pacote.arquivar())
      const ativarResult = pacoteArquivado.ativar()
      expect(ativarResult.isFail).toBe(true)
    })
  })

  describe('Business Methods', () => {
    let pacote: Pacote

    beforeEach(() => {
      const regraPrecificacao = obterValor(RegraPrecificacao.criar({
        tipo: 'fixo',
        valorBase: obterValor(Money.deReais(100))
      }))

      const pacoteResult = Pacote.create({
        id: 'pacote_1',
        propriedadeId,
        nome: 'Pacote Teste',
        regraPrecificacao
      })
      pacote = obterValor(pacoteResult)
    })

    it('should correctly determine if package is active', () => {
      expect(pacote.ehAtivo).toBe(true)
      expect(pacote.ehPausado).toBe(false)
      expect(pacote.ehArquivado).toBe(false)

      const pacotePausado = obterValor(pacote.pausar())
      expect(pacotePausado.ehAtivo).toBe(false)
      expect(pacotePausado.ehPausado).toBe(true)
      expect(pacotePausado.ehArquivado).toBe(false)

      const pacoteArquivado = obterValor(pacote.arquivar())
      expect(pacoteArquivado.ehAtivo).toBe(false)
      expect(pacoteArquivado.ehPausado).toBe(false)
      expect(pacoteArquivado.ehArquivado).toBe(true)
    })

    it('should correctly determine if package is in vigência', () => {
      const regraPrecificacao = obterValor(RegraPrecificacao.criar({
        tipo: 'fixo',
        valorBase: obterValor(Money.deReais(100))
      }))

      const pacoteComValidade = obterValor(Pacote.create({
        id: 'pacote_2',
        propriedadeId,
        nome: 'Pacote com Validade',
        regraPrecificacao,
        validadeInicio: new Date(Date.now() - 86400000), // Ontem
        validadeFim: new Date(Date.now() + 86400000)   // Amanhã
      }))

      expect(pacoteComValidade.estaVigente()).toBe(true)

      const pacoteFuturo = obterValor(Pacote.create({
        id: 'pacote_3',
        propriedadeId,
        nome: 'Pacote Futuro',
        regraPrecificacao,
        validadeInicio: new Date(Date.now() + 86400000), // Amanhã
        validadeFim: new Date(Date.now() + 86400000 * 10) // Daqui 10 dias
      }))

      expect(pacoteFuturo.estaVigente()).toBe(false)

      const pacotePassado = obterValor(Pacote.create({
        id: 'pacote_4',
        propriedadeId,
        nome: 'Pacote Passado',
        regraPrecificacao,
        validadeInicio: new Date(Date.now() - 86400000 * 10), // Há 10 dias
        validadeFim: new Date(Date.now() - 86400000)   // Ontem
      }))

      expect(pacotePassado.estaVigente()).toBe(false)

      // Pacote sem validade
      expect(pacote.estaVigente()).toBe(false)
    })

    it('should calculate total value correctly', () => {
      const regraPorNoite = obterValor(RegraPrecificacao.criar({
        tipo: 'por_noite',
        valorBase: obterValor(Money.deReais(1)), // Invariante base maior que zero
        valorPorNoite: obterValor(Money.deReais(100))
      }))

      const pacotePorNoite = obterValor(Pacote.create({
        id: 'pacote_noite',
        propriedadeId,
        nome: 'Pacote por Noite',
        regraPrecificacao: regraPorNoite
      }))

      // 3 noites para 2 pessoas
      const valorResult = pacotePorNoite.calcularValorTotal(2, 3)
      expect(valorResult.isOk).toBe(true)
      if (valorResult.isOk) {
        const valor = valorResult.value
        // 3 noites * R$ 100 = R$ 300
        const esperado = obterValor(Money.deReais(300))
        expect(valor.equals(esperado)).toBe(true)
      }

      const regraPorPessoa = obterValor(RegraPrecificacao.criar({
        tipo: 'por_pessoa',
        valorBase: obterValor(Money.deReais(1)), // Invariante base maior que zero
        valorPorPessoa: obterValor(Money.deReais(50))
      }))

      const pacotePorPessoa = obterValor(Pacote.create({
        id: 'pacote_pessoa',
        propriedadeId,
        nome: 'Pacote por Pessoa',
        regraPrecificacao: regraPorPessoa
      }))

      // 2 pessoas
      const valorPessoaResult = pacotePorPessoa.calcularValorTotal(2, 1)
      expect(valorPessoaResult.isOk).toBe(true)
      if (valorPessoaResult.isOk) {
        const valor = valorPessoaResult.value
        // 2 pessoas * R$ 50 = R$ 100
        const esperado = obterValor(Money.deReais(100))
        expect(valor.equals(esperado)).toBe(true)
      }

      const regraMisto = obterValor(RegraPrecificacao.criar({
        tipo: 'misto',
        valorBase: obterValor(Money.deReais(50)), // taxa fixa
        valorPorNoite: obterValor(Money.deReais(80)),
        valorPorPessoa: obterValor(Money.deReais(20))
      }))

      const pacoteMisto = obterValor(Pacote.create({
        id: 'pacote_misto',
        propriedadeId,
        nome: 'Pacote Mistura',
        regraPrecificacao: regraMisto
      }))

      // (2 noites * R$ 80) + (2 pessoas * R$ 20) = R$ 160 + R$ 40 = R$ 200 (valorBase não entra na conta misto da RegraPrecificacao)
      const valorMistoResult = pacoteMisto.calcularValorTotal(2, 2)
      expect(valorMistoResult.isOk).toBe(true)
      if (valorMistoResult.isOk) {
        const valor = valorMistoResult.value
        const esperado = obterValor(Money.deReais(200))
        expect(valor.equals(esperado)).toBe(true)
      }
    })

    it('should apply long stay discount correctly', () => {
      const regraComDesconto = obterValor(RegraPrecificacao.criar({
        tipo: 'por_noite',
        valorBase: obterValor(Money.deReais(1)), // Invariante base maior que zero
        valorPorNoite: obterValor(Money.deReais(100)),
        descontoEstanciaLonga: 10, // 10% de desconto
        noitesParaDesconto: 5      // após 5 noites
      }))

      const pacoteLocal = obterValor(Pacote.create({
        id: 'pacote_desconto',
        propriedadeId,
        nome: 'Pacote com Desconto',
        regraPrecificacao: regraComDesconto
      }))

      // 3 noites (sem desconto)
      const valorSemDesconto = pacoteLocal.calcularValorTotal(2, 3)
      expect(valorSemDesconto.isOk).toBe(true)
      if (valorSemDesconto.isOk) {
        const valor = valorSemDesconto.value
        const esperado = obterValor(Money.deReais(300)) // 3 * 100
        expect(valor.equals(esperado)).toBe(true)
      }

      // 7 noites (com 10% de desconto)
      const valorComDesconto = pacoteLocal.calcularValorTotal(2, 7)
      expect(valorComDesconto.isOk).toBe(true)
      if (valorComDesconto.isOk) {
        const valor = valorComDesconto.value
        // (7 * 100) = 700 - 10% = 630
        const esperado = obterValor(Money.deReais(630))
        expect(valor.equals(esperado)).toBe(true)
      }
    })

    it('should apply additional person surcharge correctly', () => {
      const regraComAcrescimo = obterValor(RegraPrecificacao.criar({
        tipo: 'por_noite',
        valorBase: obterValor(Money.deReais(1)), // Invariante base maior que zero
        valorPorNoite: obterValor(Money.deReais(100)),
        acrescimoAdicionalPessoa: 20 // 20% por pessoa adicional após 2
      }))

      const pacoteLocal = obterValor(Pacote.create({
        id: 'pacote_acrescimo',
        propriedadeId,
        nome: 'Pacote com Acréscimo',
        regraPrecificacao: regraComAcrescimo
      }))

      // 2 pessoas (sem acréscimo)
      const valorSemAcrescimo = pacoteLocal.calcularValorTotal(2, 2)
      expect(valorSemAcrescimo.isOk).toBe(true)
      if (valorSemAcrescimo.isOk) {
        const valor = valorSemAcrescimo.value
        const esperado = obterValor(Money.deReais(200)) // 2 noites * 100 (por_noite independe de pessoas)
        expect(valor.equals(esperado)).toBe(true)
      }

      // 4 pessoas (2 adicionais com 20% de acréscimo cada)
      const valorComAcrescimo = pacoteLocal.calcularValorTotal(4, 2)
      expect(valorComAcrescimo.isOk).toBe(true)
      if (valorComAcrescimo.isOk) {
        const valor = valorComAcrescimo.value
        // Base: 2 noites * 100 = 200
        // Acréscimo: 2 pessoas adicionais * 20% * (2 noites * 100) = 2 * 0.2 * 200 = 80
        // Total: 200 + 80 = 280
        const esperado = obterValor(Money.deReais(280))
        expect(valor.equals(esperado)).toBe(true)
      }
    })
  })
})