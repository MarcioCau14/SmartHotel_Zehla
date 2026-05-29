import { describe, it, expect } from 'vitest'
import { KnowledgeGraph, CanaryManager } from '../../domain/knowledge/services/KnowledgeGraph'

function createTestGraph(): KnowledgeGraph {
  const g = new KnowledgeGraph()

  g.addNode({ id: 'guest-1', type: 'guest', name: 'João Silva', properties: { email: 'joao@email.com' }, importance: 0.8 })
  g.addNode({ id: 'booking-1', type: 'booking', name: 'Reserva #1234', properties: { checkIn: '2026-06-15', total: 1200 }, importance: 0.7 })
  g.addNode({ id: 'property-1', type: 'property', name: 'Pousada do Sol', properties: { city: 'Florianópolis', rooms: 12 }, importance: 0.9 })
  g.addNode({ id: 'review-1', type: 'review', name: 'Avaliação 5 estrelas', properties: { rating: 5, text: 'Excelente!' }, importance: 0.5 })
  g.addNode({ id: 'service-1', type: 'service', name: 'SPA Relaxante', properties: { price: 200 }, importance: 0.4 })
  g.addNode({ id: 'lead-1', type: 'lead', name: 'Maria (lead)', properties: { source: 'whatsapp', score: 85 }, importance: 0.6 })
  g.addNode({ id: 'staff-1', type: 'staff', name: 'Ana (recepcionista)', properties: { role: 'reception' }, importance: 0.5 })
  g.addNode({ id: 'season-1', type: 'season', name: 'Alta Temporada Verão', properties: { months: 'Dec-Feb' }, importance: 0.7 })
  g.addNode({ id: 'market-1', type: 'market', name: 'Mercado SC', properties: { adr: 380, occupancy: 0.72 }, importance: 0.6 })

  g.addEdge({ id: 'e1', source: 'guest-1', target: 'booking-1', type: 'booked_at', weight: 1.0, properties: {} })
  g.addEdge({ id: 'e2', source: 'booking-1', target: 'property-1', type: 'belongs_to', weight: 1.0, properties: {} })
  g.addEdge({ id: 'e3', source: 'guest-1', target: 'review-1', type: 'reviewed_by', weight: 0.8, properties: {} })
  g.addEdge({ id: 'e4', source: 'booking-1', target: 'service-1', type: 'associated_with', weight: 0.5, properties: {} })
  g.addEdge({ id: 'e5', source: 'lead-1', target: 'property-1', type: 'belongs_to', weight: 0.9, properties: {} })
  g.addEdge({ id: 'e6', source: 'property-1', target: 'season-1', type: 'associated_with', weight: 0.7, properties: {} })
  g.addEdge({ id: 'e7', source: 'property-1', target: 'market-1', type: 'competes_with', weight: 0.6, properties: {} })
  g.addEdge({ id: 'e8', source: 'staff-1', target: 'property-1', type: 'belongs_to', weight: 1.0, properties: {} })

  return g
}

describe('KnowledgeGraph', () => {
  describe('CRUD de nós', () => {
    it('deve adicionar nó com sucesso', () => {
      const g = new KnowledgeGraph()
      const result = g.addNode({ id: 'guest-1', type: 'guest', name: 'João', properties: {}, importance: 0.5 })
      expect(result.isOk).toBe(true)
      expect(result.value.name).toBe('João')
      expect(result.value.createdAt).toBeInstanceOf(Date)
      expect(g.nodeCount()).toBe(1)
    })

    it('deve rejeitar nó duplicado', () => {
      const g = new KnowledgeGraph()
      g.addNode({ id: 'node-1', type: 'guest', name: 'João', properties: {}, importance: 0.5 })
      const result = g.addNode({ id: 'node-1', type: 'guest', name: 'Maria', properties: {}, importance: 0.5 })
      expect(result.isFail).toBe(true)
    })

    it('deve atualizar nó existente', () => {
      const g = new KnowledgeGraph()
      g.addNode({ id: 'g-1', type: 'guest', name: 'João', properties: { email: 'joao@email.com' }, importance: 0.5 })
      const result = g.updateNode('g-1', { name: 'João Updated', importance: 0.9 })
      expect(result.isOk).toBe(true)
      expect(result.value.name).toBe('João Updated')
      expect(result.value.importance).toBe(0.9)
      expect(result.value.properties.email).toBe('joao@email.com')
    })

    it('deve falhar ao atualizar nó inexistente', () => {
      const g = new KnowledgeGraph()
      const result = g.updateNode('fake-id', { name: 'X' })
      expect(result.isFail).toBe(true)
    })

    it('deve remover nó e suas arestas', () => {
      const g = new KnowledgeGraph()
      g.addNode({ id: 'a', type: 'guest', name: 'A', properties: {}, importance: 0.5 })
      g.addNode({ id: 'b', type: 'booking', name: 'B', properties: {}, importance: 0.5 })
      g.addEdge({ id: 'ab', source: 'a', target: 'b', type: 'booked_at', weight: 1.0, properties: {} })

      expect(g.nodeCount()).toBe(2)
      expect(g.edgeCount()).toBe(1)

      g.removeNode('a')
      expect(g.nodeCount()).toBe(1)
      expect(g.edgeCount()).toBe(0)
    })

    it('deve buscar nós por tipo', () => {
      const g = createTestGraph()
      const guests = g.getNodesByType('guest')
      expect(guests).toHaveLength(1)
      expect(guests[0].name).toBe('João Silva')

      const properties = g.getNodesByType('property')
      expect(properties).toHaveLength(1)
      expect(properties[0].name).toBe('Pousada do Sol')
    })
  })

  describe('CRUD de arestas', () => {
    it('deve adicionar aresta entre nós existentes', () => {
      const g = new KnowledgeGraph()
      g.addNode({ id: 'a', type: 'guest', name: 'A', properties: {}, importance: 0.5 })
      g.addNode({ id: 'b', type: 'booking', name: 'B', properties: {}, importance: 0.5 })
      const result = g.addEdge({ id: 'a-b', source: 'a', target: 'b', type: 'booked_at', weight: 1.0, properties: {} })
      expect(result.isOk).toBe(true)
      expect(g.edgeCount()).toBe(1)
    })

    it('deve rejeitar aresta com nó fonte inexistente', () => {
      const g = new KnowledgeGraph()
      g.addNode({ id: 'b', type: 'booking', name: 'B', properties: {}, importance: 0.5 })
      const result = g.addEdge({ id: 'a-b', source: 'a', target: 'b', type: 'booked_at', weight: 1.0, properties: {} })
      expect(result.isFail).toBe(true)
    })

    it('deve retornar vizinhos de um nó', () => {
      const g = createTestGraph()
      const neighbors = g.getNeighbors('guest-1')
      expect(neighbors.map(n => n.id).sort()).toEqual(['booking-1', 'review-1'])
    })
  })

  describe('BFS Pathfinder', () => {
    it('deve encontrar caminho de hóspede até propriedade', () => {
      const g = createTestGraph()
      const result = g.bfsPathfinder('guest-1', 'property')
      expect(result.isOk).toBe(true)
      const { path, nodes, edges } = result.value
      expect(path[0]).toBe('guest-1')
      expect(path[path.length - 1]).toBe('property-1')
      expect(nodes.length).toBeGreaterThanOrEqual(2)
      expect(edges.length).toBeGreaterThanOrEqual(1)
    })

    it('deve encontrar caminho de lead até temporada', () => {
      const g = createTestGraph()
      const result = g.bfsPathfinder('lead-1', 'season')
      expect(result.isOk).toBe(true)
      const { path } = result.value
      expect(path).toContain('lead-1')
      expect(path).toContain('season-1')
    })

    it('deve falhar se nó inicial não existe', () => {
      const g = new KnowledgeGraph()
      const result = g.bfsPathfinder('fake-id', 'guest')
      expect(result.isFail).toBe(true)
    })

    it('deve falhar se tipo alvo não for encontrado', () => {
      const g = createTestGraph()
      const result = g.bfsPathfinder('guest-1', 'nonexistent_type', 3)
      expect(result.isFail).toBe(true)
    })
  })

  describe('Multi-path search (DFS)', () => {
    it('deve encontrar múltiplos caminhos entre dois nós', () => {
      const g = createTestGraph()
      const result = g.findPathsBetween('guest-1', 'property-1')
      expect(result.isOk).toBe(true)
      expect(result.value.paths.length).toBeGreaterThanOrEqual(1)
      expect(result.value.paths[0].path).toContain('guest-1')
      expect(result.value.paths[0].path).toContain('property-1')
    })

    it('deve falhar para nó inexistente', () => {
      const g = new KnowledgeGraph()
      const result = g.findPathsBetween('fake', 'also-fake')
      expect(result.isFail).toBe(true)
    })
  })

  describe('PageRank', () => {
    it('deve retornar ranks para grafo com nós', () => {
      const g = createTestGraph()
      const ranks = g.pageRank()
      expect(ranks.size).toBe(g.nodeCount())
    })

    it('deve retornar map vazio para grafo vazio', () => {
      const g = new KnowledgeGraph()
      const ranks = g.pageRank()
      expect(ranks.size).toBe(0)
    })

    it('nós com mais conexões de entrada devem ter rank mais alto', () => {
      const g = new KnowledgeGraph()

      g.addNode({ id: 'a', type: 'guest', name: 'A', properties: {}, importance: 0.5 })
      g.addNode({ id: 'b', type: 'guest', name: 'B', properties: {}, importance: 0.5 })
      g.addNode({ id: 'c', type: 'guest', name: 'C', properties: {}, importance: 0.5 })
      g.addNode({ id: 'popular', type: 'property', name: 'Popular', properties: {}, importance: 0.5 })

      g.addEdge({ id: 'a-pop', source: 'a', target: 'popular', type: 'booked_at', weight: 1.0, properties: {} })
      g.addEdge({ id: 'b-pop', source: 'b', target: 'popular', type: 'booked_at', weight: 1.0, properties: {} })
      g.addEdge({ id: 'c-pop', source: 'c', target: 'popular', type: 'booked_at', weight: 1.0, properties: {} })

      const ranks = g.pageRank()
      const popularRank = ranks.get('popular') ?? 0
      const aRank = ranks.get('a') ?? 0
      expect(popularRank).toBeGreaterThan(aRank)
    })

    it('deve convergir com damping factor padrão', () => {
      const g = new KnowledgeGraph()
      g.addNode({ id: 'a', type: 'guest', name: 'A', properties: {}, importance: 0.5 })
      g.addNode({ id: 'b', type: 'booking', name: 'B', properties: {}, importance: 0.5 })
      g.addEdge({ id: 'a-b', source: 'a', target: 'b', type: 'booked_at', weight: 1.0, properties: {} })

      const ranks = g.pageRank(0.85, 100, 0.0001)
      const totalRank = Array.from(ranks.values()).reduce((s, r) => s + r, 0)
      expect(totalRank).toBeCloseTo(1.0, 1)
    })
  })

  describe('integração entre nós, arestas e pathfinding', () => {
    it('deve construir e navegar um grafo de reserva completo', () => {
      const g = new KnowledgeGraph()

      g.addNode({ id: 'guest-99', type: 'guest', name: 'Carlos', properties: { email: 'carlos@email.com' }, importance: 0.8 })
      g.addNode({ id: 'booking-99', type: 'booking', name: 'Reserva #5678', properties: { total: 2500 }, importance: 0.7 })
      g.addNode({ id: 'property-99', type: 'property', name: 'Pousada Serena', properties: { city: 'Gramado' }, importance: 0.9 })
      g.addNode({ id: 'service-99', type: 'service', name: 'Café da Manhã VIP', properties: { price: 80 }, importance: 0.4 })

      g.addEdge({ id: 'g-b', source: 'guest-99', target: 'booking-99', type: 'booked_at', weight: 1.0, properties: {} })
      g.addEdge({ id: 'b-p', source: 'booking-99', target: 'property-99', type: 'belongs_to', weight: 1.0, properties: {} })
      g.addEdge({ id: 'b-s', source: 'booking-99', target: 'service-99', type: 'associated_with', weight: 0.6, properties: {} })

      const pathResult = g.bfsPathfinder('guest-99', 'property')
      expect(pathResult.isOk).toBe(true)
      expect(pathResult.value.path).toEqual(['guest-99', 'booking-99', 'property-99'])

      const ranks = g.pageRank()
      expect(ranks.get('property-99')).toBeGreaterThan(0)
    })
  })
})

describe('CanaryManager', () => {
  it('deve implantar canary node no grafo', () => {
    const g = new KnowledgeGraph()
    g.addNode({ id: 'guest-1', type: 'guest', name: 'João', properties: {}, importance: 0.5 })

    const cm = new CanaryManager(g)
    const result = cm.deployCanary({ id: 'vip-001', name: 'Dados VIP Admin' })

    expect(result.isOk).toBe(true)
    expect(result.value.type).toBe('canary')
    expect(result.value.properties.__canary).toBe(true)
    expect(result.value.properties.__token).toBeTruthy()
  })

  it('deve detectar acesso a canary node', () => {
    const g = new KnowledgeGraph()
    g.addNode({ id: 'guest-1', type: 'guest', name: 'João', properties: {}, importance: 0.5 })

    const cm = new CanaryManager(g)
    cm.deployCanary({ id: 'vip-001', name: 'Dados VIP' })

    const check = cm.checkAccess('canary-vip-001', 'Acesso suspeito do IP 192.168.1.100')
    expect(check.isCanary).toBe(true)
    expect(check.isTriggered).toBe(true)
  })

  it('não deve disparar para nó normal', () => {
    const g = new KnowledgeGraph()
    g.addNode({ id: 'guest-1', type: 'guest', name: 'João', properties: {}, importance: 0.5 })

    const cm = new CanaryManager(g)
    const check = cm.checkAccess('guest-1')
    expect(check.isCanary).toBe(false)
    expect(check.isTriggered).toBe(false)
  })

  it('deve detectar acesso via honey edge', () => {
    const g = new KnowledgeGraph()
    g.addNode({ id: 'guest-1', type: 'guest', name: 'João', properties: {}, importance: 0.5 })

    const cm = new CanaryManager(g)
    cm.deployCanary({ id: 'vip-001', name: 'Dados VIP' })
    const honeyResult = cm.deployHoneyEdge('guest-1', 'vip-001', 'Confidencial')
    expect(honeyResult.isOk).toBe(true)

    const edgeResult = cm.checkEdgeAccess(honeyResult.value.id, 'Query não autorizada')
    expect(edgeResult.isHoneyEdge).toBe(true)
    expect(edgeResult.isTriggered).toBe(true)
  })

  it('deve reportar ameaça no threat assessment', () => {
    const g = new KnowledgeGraph()
    g.addNode({ id: 'guest-1', type: 'guest', name: 'João', properties: {}, importance: 0.5 })

    const cm = new CanaryManager(g)
    cm.deployCanary({ id: 'vip-001', name: 'Dados VIP' })
    cm.checkAccess('canary-vip-001', 'Intrusão simulada')

    const threat = cm.threatAssessment()
    expect(threat.threatDetected).toBe(true)
    expect(threat.triggeredCount).toBe(1)
    expect(threat.details.length).toBeGreaterThanOrEqual(1)
  })

  it('deve limpar alertas', () => {
    const g = new KnowledgeGraph()
    g.addNode({ id: 'guest-1', type: 'guest', name: 'João', properties: {}, importance: 0.5 })

    const cm = new CanaryManager(g)
    cm.deployCanary({ id: 'vip-001', name: 'Dados VIP' })
    cm.checkAccess('canary-vip-001')
    expect(cm.threatAssessment().threatDetected).toBe(true)

    cm.clearAlerts()
    expect(cm.threatAssessment().threatDetected).toBe(false)
  })

  it('deve verificar se canary específico foi acionado', () => {
    const g = new KnowledgeGraph()
    g.addNode({ id: 'guest-1', type: 'guest', name: 'João', properties: {}, importance: 0.5 })

    const cm = new CanaryManager(g)
    cm.deployCanary({ id: 'alpha', name: 'Alpha' })
    cm.deployCanary({ id: 'beta', name: 'Beta' })

    cm.checkAccess('canary-alpha')

    expect(cm.hasBeenTriggered('canary-alpha')).toBe(true)
    expect(cm.hasBeenTriggered('canary-beta')).toBe(false)
  })

  it('deve registrar log de acesso com metadados', () => {
    const g = new KnowledgeGraph()
    g.addNode({ id: 'guest-1', type: 'guest', name: 'João', properties: {}, importance: 0.5 })

    const cm = new CanaryManager(g)
    cm.deployCanary({ id: 'vip-001', name: 'VIP' })
    cm.checkAccess('canary-vip-001', 'Scanner automático')

    const log = cm.getAccessLog()
    expect(log).toHaveLength(1)
    expect(log[0].nodeId).toBe('canary-vip-001')
    expect(log[0].metadata).toBe('Scanner automático')
  })
})
