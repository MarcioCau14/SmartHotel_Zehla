import { describe, it, expect, vi } from 'vitest'
import { GaussianDelayCalculator } from '../../infrastructure/scraping/GaussianDelayCalculator'
import { ProxyChainManager } from '../../infrastructure/scraping/ProxyChainManager'

describe('GaussianDelayCalculator', () => {
  it('deve respeitar os limites minimo e maximo (5s a 45s)', () => {
    const calc = new GaussianDelayCalculator()
    const samples = calc.sampleMany(1000)
    for (const sample of samples) {
      expect(sample).toBeGreaterThanOrEqual(5000)
      expect(sample).toBeLessThanOrEqual(45000)
    }
  })

  it('deve concentrar a maioria das amostras no meio da curva (10s a 40s)', () => {
    const calc = new GaussianDelayCalculator()
    const samples = calc.sampleMany(1000)
    const middleCount = samples.filter(s => s >= 10000 && s <= 40000).length
    const ratio = middleCount / samples.length
    expect(ratio).toBeGreaterThan(0.85)
  })

  it('deve ter media aproximada de 25s para muitas amostras', () => {
    const calc = new GaussianDelayCalculator()
    const samples = calc.sampleMany(5000)
    const mean = samples.reduce((a, b) => a + b, 0) / samples.length
    expect(mean).toBeGreaterThan(20000)
    expect(mean).toBeLessThan(30000)
  })

  it('deve produzir valores deterministicos quando Math.random eh mockado', () => {
    const calc = new GaussianDelayCalculator()
    const mockMath = vi.spyOn(Math, 'random')
    mockMath.mockReturnValue(0.5)
    const result = calc.sample()
    expect(result).toBeGreaterThanOrEqual(5000)
    expect(result).toBeLessThanOrEqual(45000)
    mockMath.mockRestore()
  })

  it('deve retornar configuracao correta', () => {
    const calc = new GaussianDelayCalculator({
      minDelayMs: 10000,
      maxDelayMs: 30000,
      meanMs: 20000,
      stdDevMs: 5000,
    })
    const config = calc.getConfig()
    expect(config.minDelayMs).toBe(10000)
    expect(config.maxDelayMs).toBe(30000)
    expect(config.meanMs).toBe(20000)
    expect(config.stdDevMs).toBe(5000)
  })

  it('deve respeitar clamping no limite inferior extremo', () => {
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.0001)
      .mockReturnValueOnce(0.9999)
    const calc = new GaussianDelayCalculator()
    const result = calc.sample()
    expect(result).toBeGreaterThanOrEqual(5000)
    vi.restoreAllMocks()
  })

  it('deve respeitar clamping no limite superior extremo', () => {
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.9999)
      .mockReturnValueOnce(0.0001)
    const calc = new GaussianDelayCalculator()
    const result = calc.sample()
    expect(result).toBeGreaterThanOrEqual(5000)
    expect(result).toBeLessThanOrEqual(45000)
    vi.restoreAllMocks()
  })

  it('deve sampleMany retornar array do tamanho pedido', () => {
    const calc = new GaussianDelayCalculator()
    const samples = calc.sampleMany(500)
    expect(samples.length).toBe(500)
  })

  it('deve ter desvio padrao aproximado nas amostras', () => {
    const calc = new GaussianDelayCalculator()
    const samples = calc.sampleMany(2000)
    const mean = samples.reduce((a, b) => a + b, 0) / samples.length
    const variance = samples.reduce((sum, s) => sum + (s - mean) ** 2, 0) / samples.length
    const stddev = Math.sqrt(variance)
    expect(stddev).toBeGreaterThan(3000)
    expect(stddev).toBeLessThan(12000)
  })
})

describe('ProxyChainManager', () => {
  it('deve criar gerenciador com lista de proxies', () => {
    const manager = new ProxyChainManager(['proxy1:8080', 'proxy2:8080', 'proxy3:8080'])
    expect(manager.getTotalCount()).toBe(3)
    expect(manager.getAvailableCount()).toBe(3)
  })

  it('deve lancar erro se lista de proxies for vazia', () => {
    expect(() => new ProxyChainManager([])).toThrow('Proxy list must not be empty')
  })

  it('deve alternar proxies em round-robin', () => {
    const manager = new ProxyChainManager(['p1:80', 'p2:80', 'p3:80'])
    expect(manager.getNextProxy().address).toBe('p1:80')
    expect(manager.getNextProxy().address).toBe('p2:80')
    expect(manager.getNextProxy().address).toBe('p3:80')
  })

  it('deve voltar ao primeiro proxy apos ciclar todos', () => {
    const manager = new ProxyChainManager(['p1:80', 'p2:80'])
    manager.getNextProxy()
    manager.getNextProxy()
    expect(manager.getNextProxy().address).toBe('p1:80')
  })

  it('deve pular proxies marcados como failed', () => {
    const manager = new ProxyChainManager(['p1:80', 'p2:80', 'p3:80'])
    manager.markFailed('p2:80')
    expect(manager.getAvailableCount()).toBe(2)
    const used: string[] = []
    used.push(manager.getNextProxy().address)
    used.push(manager.getNextProxy().address)
    used.push(manager.getNextProxy().address)
    expect(used).not.toContain('p2:80')
  })

  it('deve incrementar failCount ao marcar falha', () => {
    const manager = new ProxyChainManager(['p1:80'])
    manager.markFailed('p1:80')
    const proxy = manager.getProxyList()[0]
    expect(proxy.failCount).toBe(1)
    expect(proxy.failed).toBe(true)
  })

  it('deve recuperar proxy marcado como failed', () => {
    const manager = new ProxyChainManager(['p1:80', 'p2:80'])
    manager.markFailed('p1:80')
    expect(manager.getAvailableCount()).toBe(1)
    manager.markRecovered('p1:80')
    expect(manager.getAvailableCount()).toBe(2)
  })

  it('deve lancar erro se todos os proxies falharem', () => {
    const manager = new ProxyChainManager(['p1:80'])
    manager.markFailed('p1:80')
    expect(() => manager.getNextProxy()).toThrow('All proxies are failed')
  })

  it('deve resetar todos os proxies failed', () => {
    const manager = new ProxyChainManager(['p1:80', 'p2:80'])
    manager.markFailed('p1:80')
    manager.markFailed('p2:80')
    expect(manager.getAvailableCount()).toBe(0)
    manager.resetFailed()
    expect(manager.getAvailableCount()).toBe(2)
  })

  it('deve getProxyList retornar copia dos dados', () => {
    const manager = new ProxyChainManager(['p1:80'])
    const list = manager.getProxyList()
    list[0].address = 'hacked:80'
    expect(manager.getProxyList()[0].address).toBe('p1:80')
  })

  it('deve resetAll zerar indice e failed', () => {
    const manager = new ProxyChainManager(['p1:80', 'p2:80'])
    manager.getNextProxy()
    manager.getNextProxy()
    manager.markFailed('p1:80')
    manager.resetAll()
    expect(manager.getAvailableCount()).toBe(2)
    expect(manager.getNextProxy().address).toBe('p1:80')
  })

  it('deve alternar corretamente ignorando failed', () => {
    const manager = new ProxyChainManager(['a:80', 'b:80', 'c:80'])
    manager.markFailed('a:80')
    expect(manager.getNextProxy().address).toBe('b:80')
    expect(manager.getNextProxy().address).toBe('c:80')
    expect(manager.getNextProxy().address).toBe('b:80')
  })
})
