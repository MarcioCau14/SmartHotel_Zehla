import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import { getBasePrisma } from '../../../../src/lib/prisma'
import { PrismaLeadRepository } from '../../../../src/infrastructure/persistence/comercial/PrismaLeadRepository'
import { PrismaPacoteRepository } from '../../../../src/infrastructure/persistence/comercial/PrismaPacoteRepository'
import { PrismaPropostaRepository } from '../../../../src/infrastructure/persistence/comercial/PrismaPropostaRepository'
import { PrismaPagamentoRepository } from '../../../../src/infrastructure/persistence/comercial/PrismaPagamentoRepository'
import { PrismaConversaoRepository } from '../../../../src/infrastructure/persistence/comercial/PrismaConversaoRepository'

import { Lead } from '../../../../src/domain/comercial/entities/Lead'
import { Pacote } from '../../../../src/domain/comercial/entities/Pacote'
import { Proposta } from '../../../../src/domain/comercial/entities/Proposta'
import { Pagamento } from '../../../../src/domain/comercial/entities/Pagamento'
import { Conversao } from '../../../../src/domain/comercial/entities/Conversao'

import { Money } from '../../../../src/domain/comercial/value-objects/Money'
import { Documento } from '../../../../src/domain/comercial/value-objects/Documento'
import { Email } from '../../../../src/domain/comercial/value-objects/Email'
import { Score } from '../../../../src/domain/comercial/value-objects/Score'
import { Canal } from '../../../../src/domain/comercial/value-objects/Canal'
import { RegraPrecificacao } from '../../../../src/domain/comercial/value-objects/RegraPrecificacao'

describe('Comercial Bounded Context - Persistência Real & RLS & Fail-Fast (Prisma)', () => {
  const prisma = getBasePrisma()
  
  // Instanciar os repositórios reais
  const leadRepo = new PrismaLeadRepository(prisma)
  const pacoteRepo = new PrismaPacoteRepository(prisma)
  const propostaRepo = new PrismaPropostaRepository(prisma)
  const pagamentoRepo = new PrismaPagamentoRepository(prisma)
  const conversaoRepo = new PrismaConversaoRepository(prisma)

  const propriedadeId = 'pousada_canasvieiras_123'
  const propriedadeOutro = 'pousada_outra_999'

  beforeAll(async () => {
    // Garantir conexão ativa
    await prisma.$connect()
  })

  beforeEach(async () => {
    // Limpar tabelas comerciais antes de cada teste em ordem de chave estrangeira
    await prisma.comercialConversao.deleteMany()
    await prisma.comercialPagamento.deleteMany()
    await prisma.comercialProposta.deleteMany()
    await prisma.comercialLead.deleteMany()
    await prisma.comercialPacote.deleteMany()
  })

  describe('1. PrismaLeadRepository (Data Mapper, RLS e Fail-Fast)', () => {
    it('deve criar um Lead com sucesso, persistindo no banco real e hidratando corretamente', async () => {
      const email = `lead_${Date.now()}@smarthotel.com`
      const cpf = '43615418840' // CPF válido em formato limpo

      const criarResult = await leadRepo.criarLead({
        canal: 'whatsapp',
        propriedadeId,
        nome: 'Márcio Cau',
        email,
        telefone: '+5548999998888',
        documento: cpf,
        origemUrl: 'https://zehla.co/ads',
        tags: ['vip', 'direct']
      })

      if (criarResult.isFail) {
        console.error('DEBUG LEAD CREATION ERROR:', criarResult.error)
      }
      expect(criarResult.isOk).toBe(true)
      const leadCriado = criarResult.value
      expect(leadCriado.id).toBeDefined()
      expect(leadCriado.status).toBe('novo')

      // Buscar por ID no mesmo tenant
      const buscarResult = await leadRepo.buscarLeadPorId(leadCriado.id, propriedadeId)
      expect(buscarResult.isOk).toBe(true)
      expect(buscarResult.value).not.toBeNull()
      
      const leadHydrated = buscarResult.value!
      expect(leadHydrated.id).toBe(leadCriado.id)
      expect(leadHydrated.nomeCompleto).toBe('Márcio Cau')
      expect(leadHydrated.canal.valor).toBe('whatsapp')
      expect(leadHydrated.email?.valor).toBe(email)
      expect(leadHydrated.telefone).toBe('+5548999998888')
      expect(leadHydrated.documento?.valor).toBe(cpf)
      expect(leadHydrated.documento?.tipo).toBe('CPF')
      expect(leadHydrated.origemUrl).toBe('https://zehla.co/ads')
      expect(leadHydrated.tags).toContain('vip')
      expect(leadHydrated.tags).toContain('direct')
    })

    it('deve aplicar RLS silencioso na busca e na listagem de Leads', async () => {
      const email = `lead_rls_${Date.now()}@smarthotel.com`
      const criarResult = await leadRepo.criarLead({
        canal: 'site',
        propriedadeId,
        nome: 'Lead Protegido',
        email,
        telefone: '+5548999991111'
      })

      expect(criarResult.isOk).toBe(true)
      const id = criarResult.value.id

      // 1. Buscar com outro tenantId -> deve retornar null
      const buscarOutro = await leadRepo.buscarLeadPorId(id, propriedadeOutro)
      expect(buscarOutro.isOk).toBe(true)
      expect(buscarOutro.value).toBeNull()

      // 2. Listar com o tenant correto -> deve retornar 1 lead
      const listarCorreto = await leadRepo.listarLeadsPorPropriedade(propriedadeId)
      expect(listarCorreto.isOk).toBe(true)
      expect(listarCorreto.value.length).toBe(1)

      // 3. Listar com outro tenant -> deve retornar lista vazia
      const listarOutro = await leadRepo.listarLeadsPorPropriedade(propriedadeOutro)
      expect(listarOutro.isOk).toBe(true)
      expect(listarOutro.value.length).toBe(0)
    })

    it('deve falhar rápido (Fail-Fast) se o banco contiver dados corrompidos que firam as invariantes', async () => {
      // Criar um lead de forma direta na tabela usando o Prisma diretamente (bypassing domain validation)
      const id = `lead_corrompido_${Date.now()}`
      
      await prisma.comercialLead.create({
        data: {
          id,
          canal: 'canal_invalido_de_fumaca', // Canal inválido! (De acordo com Canal.ts)
          propriedadeId,
          dataCaptura: new Date(),
          nome: 'Corrompido',
          email: 'email_sem_arroba', // Email inválido!
          telefone: '+5548999991111',
          documento: '123', // Documento inválido (CPF ou CNPJ inválido)!
          status: 'qualificado'
        }
      })

      // Agora tentar buscar esse lead via Repositório (que faz hydrate)
      const buscarResult = await leadRepo.buscarLeadPorId(id, propriedadeId)
      
      // O repositório deve detectar a corrupção e retornar falha rápida (Result.fail) em vez de deixar entrar na memória!
      expect(buscarResult.isFail).toBe(true)
      expect(buscarResult.error).toBeDefined()
      // A invariante do Canal é a primeira a gritar
      expect(buscarResult.error.message).toContain('Invalid channel')
    })
  })

  describe('2. PrismaPacoteRepository (Regras Complexas e Mapeamento)', () => {
    it('deve persistir um Pacote com regras complexas de yield/sazonalidade e hidratá-lo com 100% de integridade', async () => {
      const valorBase = Money.criar(15000).value // R$ 150,00
      const valorPorNoite = Money.criar(8000).value // R$ 80,00
      const valorPorPessoa = Money.criar(4000).value // R$ 40,00

      const regraResult = RegraPrecificacao.criar({
        tipo: 'misto',
        valorBase,
        valorPorNoite,
        valorPorPessoa,
        acrescimoAdicionalPessoa: 10,
        descontoEstanciaLonga: 15,
        noitesParaDesconto: 5,
        sazonalidade: [
          { mes: 1, multiplicador: 1.5 }, // Alta temporada (Janeiro)
          { mes: 7, multiplicador: 1.2 }  // Julho
        ]
      })

      expect(regraResult.isOk).toBe(true)

      const criarResult = await pacoteRepo.criarPacote({
        propriedadeId,
        nome: 'Pacote Família Premium SC',
        descricao: 'Excelente para até 4 pessoas na praia',
        tipoQuarto: 'Suite Luxo',
        capacidadeMaxima: 4,
        servicosInclusos: ['cafe_manha', 'spa'],
        regraPrecificacao: regraResult.value,
        validadeInicio: new Date('2026-06-01'),
        validadeFim: new Date('2026-12-31'),
        categorias: ['familia', 'praia'],
        midias: ['https://zehla.co/img1.jpg']
      })

      expect(criarResult.isOk).toBe(true)
      const pacoteId = criarResult.value.id

      // Buscar pacote
      const buscarResult = await pacoteRepo.buscarPacotePorId(pacoteId, propriedadeId)
      expect(buscarResult.isOk).toBe(true)
      expect(buscarResult.value).not.toBeNull()

      const pacoteHydrated = buscarResult.value!
      expect(pacoteHydrated.id).toBe(pacoteId)
      expect(pacoteHydrated.nome).toBe('Pacote Família Premium SC')
      expect(pacoteHydrated.capacidadeMaxima).toBe(4)
      expect(pacoteHydrated.getServicosInclusos()).toContain('cafe_manha')
      expect(pacoteHydrated.getServicosInclusos()).toContain('spa')
      
      const regraHydrated = pacoteHydrated.regraPrecificacao!
      expect(regraHydrated.tipo).toBe('misto')
      expect(regraHydrated.valorBase.centavos).toBe(15000)
      expect(regraHydrated.valorPorNoite?.centavos).toBe(8000)
      expect(regraHydrated.valorPorPessoa?.centavos).toBe(4000)
      expect(regraHydrated.acrescimoAdicionalPessoa).toBe(10)
      expect(regraHydrated.descontoEstanciaLonga).toBe(15)
      expect(regraHydrated.noitesParaDesconto).toBe(5)
      expect(regraHydrated.sazonalidade?.length).toBe(2)
      expect(regraHydrated.sazonalidade?.[0].mes).toBe(1)
      expect(regraHydrated.sazonalidade?.[0].multiplicador).toBe(1.5)

      // Testar cálculo de valor total hidratado na regra de negócio pura
      const totalCalculado = pacoteHydrated.calcularValorTotal(3, 6) // 3 pessoas, 6 diárias
      expect(totalCalculado.isOk).toBe(true)
      
      // Cálculo:
      // totalBase = (8000 * 6) + (4000 * 3) = 48000 + 12000 = 60000 centavos
      // adicional pessoa (>2): 1 pessoa excedente -> acrescimo = 60000 * 10% * 1 = 6000 centavos -> total = 66000 centavos
      // desconto estancia longa (6 diárias > 5): 15% -> desconto = 66000 * 15% = 9900 centavos -> total = 56100 centavos
      expect(totalCalculado.value.centavos).toBe(56100)
    })
  })

  describe('3. PrismaPropostaRepository (Máquina de Estados e Integração Completa)', () => {
    it('deve gravar, atualizar, RLS-isolar e ciclar toda a máquina de estados de uma Proposta com integridade', async () => {
      // 1. Criar dependências
      const leadResult = await leadRepo.criarLead({
        canal: 'instagram',
        propriedadeId,
        nome: 'Cliente Proposta',
        email: `proposta_lead_${Date.now()}@smarthotel.com`
      })
      expect(leadResult.isOk).toBe(true)
      const lead = leadResult.value

      const valorBase = Money.criar(20000).value
      const regraResult = RegraPrecificacao.criar({ tipo: 'fixo', valorBase })
      const pacoteResult = await pacoteRepo.criarPacote({
        propriedadeId,
        nome: 'Pacote Fixo Proposta',
        regraPrecificacao: regraResult.value
      })
      expect(pacoteResult.isOk).toBe(true)
      const pacote = pacoteResult.value

      // 2. Criar Proposta
      const checkIn = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 dias no futuro
      const checkOut = new Date(Date.now() + 8 * 24 * 60 * 60 * 1000) // 8 dias no futuro

      const criarResult = await propostaRepo.criarProposta({
        leadId: lead.id,
        propriedadeId,
        pacoteId: pacote.id,
        dataCheckIn: checkIn,
        dataCheckOut: checkOut,
        quantidadeHospedes: 2,
        observacoes: 'Deseja quarto silencioso'
      })

      expect(criarResult.isOk).toBe(true)
      const proposta = criarResult.value
      expect(proposta.status).toBe('rascunho')
      expect(proposta.observacoes).toBe('Deseja quarto silencioso')

      // 3. Atualizar Valores
      const totalVal = Money.criar(60000).value // R$ 600,00
      const signalVal = Money.criar(18000).value // R$ 180,00 (30% do total)
      
      const vResult = await propostaRepo.atualizarValorProposta(proposta.id, propriedadeId, totalVal)
      expect(vResult.isOk).toBe(true)
      expect(vResult.value.valorTotal?.centavos).toBe(60000)

      const sResult = await propostaRepo.atualizarSinalProposta(proposta.id, propriedadeId, signalVal)
      expect(sResult.isOk).toBe(true)
      expect(sResult.value.valorSinal?.centavos).toBe(18000)

      // 4. Testar Máquina de Estados contra o banco
      // Enviar Proposta
      const envResult = await propostaRepo.enviarProposta(proposta.id, propriedadeId)
      expect(envResult.isOk).toBe(true)
      expect(envResult.value.status).toBe('enviada')

      // Visualizar Proposta
      const viewResult = await propostaRepo.visualizarProposta(proposta.id, propriedadeId)
      expect(viewResult.isOk).toBe(true)
      expect(viewResult.value.status).toBe('vista')

      // Negociar Proposta
      const negResult = await propostaRepo.negociarProposta(proposta.id, propriedadeId)
      expect(negResult.isOk).toBe(true)
      expect(negResult.value.status).toBe('negociacao')

      // Aceitar Proposta
      const accResult = await propostaRepo.aceitarProposta(proposta.id, propriedadeId)
      expect(accResult.isOk).toBe(true)
      expect(accResult.value.status).toBe('aceita')

      // RLS Check: buscar proposta com outro tenantId -> retorna null
      const buscarRLS = await propostaRepo.buscarPropostaPorId(proposta.id, propriedadeOutro)
      expect(buscarRLS.isOk).toBe(true)
      expect(buscarRLS.value).toBeNull()

      // Buscar correto
      const buscarCorreto = await propostaRepo.buscarPropostaPorId(proposta.id, propriedadeId)
      expect(buscarCorreto.isOk).toBe(true)
      expect(buscarCorreto.value!.status).toBe('aceita')
    })
  })

  describe('4. PrismaPagamentoRepository & PrismaConversaoRepository', () => {
    it('deve persistir Pagamentos, transitar estados de processamento e fechar a Conversão final com integridade', async () => {
      // 1. Setup dependências completas
      const leadResult = await leadRepo.criarLead({
        canal: 'site',
        propriedadeId,
        nome: 'Lead Converso',
        email: `converso_lead_${Date.now()}@smarthotel.com`,
        documento: '43615418840' // CPF para conversao (LGPD)
      })
      if (leadResult.isFail) {
        console.error('DEBUG SETUP LEAD CREATION ERROR:', leadResult.error)
      }
      expect(leadResult.isOk).toBe(true)
      const lead = leadResult.value

      const valorBase = Money.criar(30000).value
      const regraResult = RegraPrecificacao.criar({ tipo: 'fixo', valorBase })
      const pacoteResult = await pacoteRepo.criarPacote({
        propriedadeId,
        nome: 'Pacote Conversao',
        regraPrecificacao: regraResult.value
      })
      const pacote = pacoteResult.value

      const checkIn = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
      const checkOut = new Date(Date.now() + 8 * 24 * 60 * 60 * 1000)
      const propResult = await propostaRepo.criarProposta({
        leadId: lead.id,
        propriedadeId,
        pacoteId: pacote.id,
        dataCheckIn: checkIn,
        dataCheckOut: checkOut,
        quantidadeHospedes: 2
      })
      const proposta = propResult.value

      // Proposta precisa de valor
      await propostaRepo.atualizarValorProposta(proposta.id, propriedadeId, Money.criar(90000).value)
      await propostaRepo.atualizarSinalProposta(proposta.id, propriedadeId, Money.criar(27000).value)
      
      // Ciclar proposta para aceita
      await propostaRepo.enviarProposta(proposta.id, propriedadeId)
      await propostaRepo.visualizarProposta(proposta.id, propriedadeId)
      await propostaRepo.negociarProposta(proposta.id, propriedadeId)
      await propostaRepo.aceitarProposta(proposta.id, propriedadeId)

      // 2. Criar Pagamento
      const pagResult = await pagamentoRepo.criarPagamento({
        propostaId: proposta.id,
        propriedadeId,
        valor: Money.criar(27000).value,
        metodoPagamento: 'PIX'
      })
      expect(pagResult.isOk).toBe(true)
      const pagamento = pagResult.value
      expect(pagamento.status).toBe('rascunho')

      // Processar pagamento
      const procResult = await pagamentoRepo.processarPagamento(pagamento.id, propriedadeId, 'tx_12345', 'auth_999')
      expect(procResult.isOk).toBe(true)
      expect(procResult.value.status).toBe('processando')

      // Aprovar pagamento
      const apResult = await pagamentoRepo.aprovarPagamento(pagamento.id, propriedadeId, 'tx_12345', 'auth_999')
      expect(apResult.isOk).toBe(true)
      const pagamentoAprovado = apResult.value
      expect(pagamentoAprovado.status).toBe('aprovado')

      // 3. Criar e Confirmar Conversão
      const convResult = await conversaoRepo.criarConversao({
        leadId: lead.id,
        propostaId: proposta.id,
        propriedadeId,
        pagamentoId: pagamentoAprovado.id
      })
      expect(convResult.isOk).toBe(true)
      const conversao = convResult.value
      expect(conversao.status).toBe('pendente')

      // Confirmar Conversão
      const confResult = await conversaoRepo.confirmarConversao(conversao.id, propriedadeId)
      expect(confResult.isOk).toBe(true)
      expect(confResult.value.status).toBe('confirmada')
      expect(confResult.value.dataConfirmacao).toBeDefined()

      // Listar conversões por lead
      const listConv = await conversaoRepo.listarConversoesPorLead(lead.id, propriedadeId)
      expect(listConv.isOk).toBe(true)
      expect(listConv.value.length).toBe(1)
      expect(listConv.value[0].status).toBe('confirmada')
    })
  })
})
