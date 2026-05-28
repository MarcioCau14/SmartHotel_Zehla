import { describe, it, expect, vi } from 'vitest'
import {
  ThompsonSampler,
  BudgetTracker,
  RequestClassifier,
  ZehlaRouter,
  TIERS,
} from '../../domain/decision/services/ZehlaRouter'

describe('ThompsonSampler', () => {
  it('deve selecionar um tier válido (1, 2 ou 3)', () => {
    const sampler = new ThompsonSampler()
    for (let i = 0; i < 50; i++) {
      const tier = sampler.sample()
      expect([1, 2, 3]).toContain(tier)
    }
  })

  it('deve preferir Tier 1 com priors iniciais (alpha=10, beta=2)', () => {
    const sampler = new ThompsonSampler()
    const counts = { 1: 0, 2: 0, 3: 0 }

    for (let i = 0; i < 1000; i++) {
      counts[sampler.sample()]++
    }

    expect(counts[1]).toBeGreaterThan(counts[2])
    expect(counts[2]).toBeGreaterThan(counts[3])
  })

  it('deve aumentar preferência por tier após sucessos consecutivos', () => {
    const sampler = new ThompsonSampler()

    const before = sampler.getStats()
    const meanBefore = before[3].mean

    for (let i = 0; i < 50; i++) {
      sampler.update(3, true)
    }

    const after = sampler.getStats()
    expect(after[3].mean).toBeGreaterThan(meanBefore)
    expect(after[3].alpha).toBe(before[3].alpha + 50)
    expect(after[3].beta).toBe(before[3].beta)
  })

  it('deve diminuir preferência após falhas consecutivas', () => {
    const sampler = new ThompsonSampler()

    for (let i = 0; i < 20; i++) {
      sampler.update(3, false)
    }

    const stats = sampler.getStats()
    expect(stats[3].beta).toBeGreaterThan(stats[3].alpha)
  })

  it('deve expor estatísticas corretas', () => {
    const sampler = new ThompsonSampler()
    const stats = sampler.getStats()

    expect(stats[1].alpha).toBe(10)
    expect(stats[1].beta).toBe(2)
    expect(stats[1].mean).toBeCloseTo(10 / 12)

    expect(stats[2].alpha).toBe(5)
    expect(stats[3].alpha).toBe(3)
  })
})

describe('BudgetTracker', () => {
  it('deve permitir gasto dentro do limite diário', () => {
    const budget = new BudgetTracker(50, 1000)
    expect(budget.canSpend('tenant-A', 30)).toBe(true)
  })

  it('deve bloquear gasto que excede limite diário', () => {
    const budget = new BudgetTracker(50, 1000)
    budget.spend('tenant-A', 40)
    expect(budget.canSpend('tenant-A', 20)).toBe(false)
  })

  it('deve bloquear gasto que excede limite mensal', () => {
    const budget = new BudgetTracker(100, 50)
    expect(budget.canSpend('tenant-A', 60)).toBe(false)
  })

  it('deve isolar orçamento por tenant', () => {
    const budget = new BudgetTracker(50, 1000)
    budget.spend('tenant-A', 50)
    expect(budget.canSpend('tenant-B', 50)).toBe(true)
  })

  it('deve retornar sucesso ao gastar R$0 (Tier 1)', () => {
    const budget = new BudgetTracker(50, 1000)
    const result = budget.spend('tenant-A', 0)
    expect(result.isOk).toBe(true)
  })

  it('deve falhar ao gastar com orçamento estourado', () => {
    const budget = new BudgetTracker(10, 100)
    budget.spend('tenant-A', 10)
    const result = budget.spend('tenant-A', 1)
    expect(result.isFail).toBe(true)
  })

  it('deve reportar uso correto', () => {
    const budget = new BudgetTracker(100, 1000)
    budget.spend('tenant-A', 25)
    budget.spend('tenant-A', 15)

    const usage = budget.getUsage('tenant-A')
    expect(usage.daily).toBe(40)
    expect(usage.monthly).toBe(40)
  })

  it('deve resetar daily sem afetar monthly', () => {
    const budget = new BudgetTracker(100, 1000)
    budget.spend('tenant-A', 30)
    budget.resetDaily()

    expect(budget.canSpend('tenant-A', 30)).toBe(true)
  })

  it('circuitBreakerOpen deve retornar true se budget excedido', () => {
    const budget = new BudgetTracker(10, 100)
    budget.spend('tenant-A', 10)
    expect(budget.isCircuitBreakerOpen('tenant-A')).toBe(true)
  })
})

describe('RequestClassifier', () => {
  const classifier = new RequestClassifier()

  it('deve classificar saudação como simple', () => {
    expect(classifier.classify('Olá, bom dia!')).toBe('simple')
    expect(classifier.classify('oi')).toBe('simple')
    expect(classifier.classify('Obrigado')).toBe('simple')
  })

  it('deve classificar pergunta de horário como simple', () => {
    expect(classifier.classify('Qual o horário do check-in?')).toBe('simple')
  })

  it('deve classificar reclamação como complex', () => {
    expect(classifier.classify('Quero cancelar minha reserva')).toBe('complex')
    expect(classifier.classify('Estou com um problema no sistema')).toBe('complex')
  })

  it('deve classificar negociação como complex', () => {
    expect(classifier.classify('Podemos renegociar o preço?')).toBe('complex')
  })

  it('deve classificar pergunta de preço como routine', () => {
    expect(classifier.classify('Quanto custa a suíte master?')).toBe('routine')
    expect(classifier.classify('Tem quarto disponível para o feriado?')).toBe('routine')
  })

  it('deve classificar texto vazio como routine (fallback)', () => {
    expect(classifier.classify('')).toBe('routine')
  })
})

describe('ZehlaRouter', () => {
  it('deve rotear mensagem simples para Tier 1 (custo zero)', async () => {
    const router = new ZehlaRouter()
    const result = await router.route('Olá, bom dia!', 'tenant-test')

    expect(result.isOk).toBe(true)
    const decision = result.value
    expect(decision.tier).toBe(1)
    expect(decision.cost).toBe(0)
    expect(decision.config.level).toBe(1)
    expect(decision.complexity).toBe('simple')
  })

  it('deve rotear reclamação para Tier 3 (custo mais alto)', async () => {
    const router = new ZehlaRouter()
    const result = await router.route('Quero cancelar minha reserva e pedir reembolso', 'tenant-test')

    expect(result.isOk).toBe(true)
    const decision = result.value
    expect(decision.complexity).toBe('complex')
    expect(decision.cost).toBeGreaterThanOrEqual(TIERS[3].costPerCall)
  })

  it('deve reportar circuito aberto quando budget excedido', async () => {
    const budget = new BudgetTracker(0.01, 100)
    const router = new ZehlaRouter(undefined, budget)

    budget.spend('tenant-pobre', 0.01)

    const result = await router.route('Quanto custa a diária?', 'tenant-pobre')
    expect(result.isOk).toBe(true)
    expect(result.value.circuitBreakerOpen).toBe(true)
    expect(result.value.tier).toBe(1)
    expect(result.value.cost).toBe(0)
  })

  it('deve aprender com outcomes (sucesso aumenta preferência)', async () => {
    const router = new ZehlaRouter()

    for (let i = 0; i < 20; i++) {
      router.reportOutcome(3, true)
    }

    const sampler = router.getSampler()
    const stats = sampler.getStats()
    expect(stats[3].alpha).toBeGreaterThan(3)
  })

  it('deve rastrear orçamento por Tenant', async () => {
    const budget = new BudgetTracker(50, 1000)
    const router = new ZehlaRouter(undefined, budget)

    await router.route('Quanto custa?', 'tenant-X')
    await router.route('Qual o horário?', 'tenant-X')

    const usage = budget.getUsage('tenant-X')
    expect(usage.daily).toBeGreaterThan(0)
  })

  it('deve isolar dados entre tenants no orçamento', async () => {
    const budget = new BudgetTracker(1, 100)
    const router = new ZehlaRouter(undefined, budget)

    budget.spend('tenant-carregado', 1)

    const resultA = await router.route('Preço?', 'tenant-carregado')
    expect(resultA.value.circuitBreakerOpen).toBe(true)

    const resultB = await router.route('Preço?', 'tenant-leve')
    expect(resultB.value.circuitBreakerOpen).toBe(false)
  })

  it('deve permitir injeção de dependências no construtor', () => {
    const sampler = new ThompsonSampler()
    const budget = new BudgetTracker()
    const classifier = new RequestClassifier()
    const router = new ZehlaRouter(sampler, budget, classifier)

    expect(router.getSampler()).toBe(sampler)
    expect(router.getBudget()).toBe(budget)
  })
})

describe('Integração: Thompson Sampling + Budget', () => {
  it('deve rotear perguntas frequentes maioritariamente para Tier 1', async () => {
    const budget = new BudgetTracker(1000, 10000)
    const router = new ZehlaRouter(undefined, budget)

    const counts = { 1: 0, 2: 0, 3: 0 }

    for (let i = 0; i < 100; i++) {
      const result = await router.route('Bom dia!', 'tenant-rico')
      expect(result.isOk).toBe(true)
      counts[result.value.tier]++
    }

    expect(counts[1]).toBeGreaterThan(counts[2])
    expect(counts[1]).toBeGreaterThan(counts[3])
  })

  it('deve alternar entre tiers baseado em aprendizado', async () => {
    const sampler = new ThompsonSampler()
    const budget = new BudgetTracker(1000, 10000)
    const router = new ZehlaRouter(sampler, budget)

    const decisions: number[] = []

    for (let i = 0; i < 50; i++) {
      const result = await router.route('Quanto custa a diária?', 'tenant-aprendizado')
      if (result.isOk) {
        decisions.push(result.value.tier)
        router.reportOutcome(result.value.tier, true)
      }
    }

    expect(decisions.length).toBe(50)
    expect(decisions.every(t => [1, 2, 3].includes(t))).toBe(true)
  })
})
