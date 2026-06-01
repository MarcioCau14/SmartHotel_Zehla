import { Result } from '../../shared/Result'

export interface KgNode {
  id: string
  type: string
  name: string
  properties: Record<string, unknown>
  importance: number
  createdAt: Date
  updatedAt: Date
}

export interface KgEdge {
  id: string
  source: string
  target: string
  type: string
  weight: number
  properties: Record<string, unknown>
  createdAt: Date
}

export type NodeType =
  | 'guest' | 'booking' | 'property' | 'lead' | 'review'
  | 'service' | 'staff' | 'supplier' | 'campaign' | 'payment'
  | 'canary' | 'season' | 'competitor' | 'market'

export type EdgeType =
  | 'booked_at' | 'belongs_to' | 'reviewed_by' | 'created_by'
  | 'supplies' | 'maintains' | 'participates' | 'competes_with'
  | 'similar_to' | 'precedes' | 'triggers' | 'associated_with'
  | 'canary_access'

export class KnowledgeGraph {
  private nodes: Map<string, KgNode> = new Map()
  private edges: Map<string, KgEdge> = new Map()
  private adjacency: Map<string, string[]> = new Map()

  addNode(node: Omit<KgNode, 'createdAt' | 'updatedAt'>): Result<KgNode> {
    if (this.nodes.has(node.id)) {
      return Result.fail(new Error(`Node ${node.id} already exists`))
    }
    const now = new Date()
    const newNode: KgNode = { ...node, createdAt: now, updatedAt: now }
    this.nodes.set(newNode.id, newNode)
    this.adjacency.set(newNode.id, [])
    return Result.ok(newNode)
  }

  updateNode(id: string, props: Partial<Pick<KgNode, 'name' | 'properties' | 'importance' | 'type'>>): Result<KgNode> {
    const node = this.nodes.get(id)
    if (!node) return Result.fail(new Error(`Node ${id} not found`))
    const updated: KgNode = {
      ...node,
      ...props,
      properties: props.properties ?? node.properties,
      updatedAt: new Date(),
    }
    this.nodes.set(id, updated)
    return Result.ok(updated)
  }

  removeNode(id: string): Result<void> {
    if (!this.nodes.has(id)) return Result.fail(new Error(`Node ${id} not found`))

    for (const [edgeId, edge] of Array.from(this.edges)) {
      if (edge.source === id || edge.target === id) {
        this.edges.delete(edgeId)
        this.removeFromAdjacency(edge.source, edge.target)
      }
    }
    this.nodes.delete(id)
    this.adjacency.delete(id)
    return Result.ok(undefined)
  }

  getNode(id: string): Result<KgNode> {
    const node = this.nodes.get(id)
    if (!node) return Result.fail(new Error(`Node ${id} not found`))
    return Result.ok(node)
  }

  getNodesByType(type: string): KgNode[] {
    return Array.from(this.nodes.values()).filter(n => n.type === type)
  }

  addEdge(edge: Omit<KgEdge, 'createdAt'>): Result<KgEdge> {
    if (this.edges.has(edge.id)) {
      return Result.fail(new Error(`Edge ${edge.id} already exists`))
    }
    if (!this.nodes.has(edge.source)) {
      return Result.fail(new Error(`Source node ${edge.source} not found`))
    }
    if (!this.nodes.has(edge.target)) {
      return Result.fail(new Error(`Target node ${edge.target} not found`))
    }
    const newEdge: KgEdge = { ...edge, createdAt: new Date() }
    this.edges.set(newEdge.id, newEdge)
    this.addToAdjacency(edge.source, edge.target)
    return Result.ok(newEdge)
  }

  removeEdge(id: string): Result<void> {
    const edge = this.edges.get(id)
    if (!edge) return Result.fail(new Error(`Edge ${id} not found`))
    this.edges.delete(id)
    this.removeFromAdjacency(edge.source, edge.target)
    return Result.ok(undefined)
  }

  getEdge(id: string): Result<KgEdge> {
    const edge = this.edges.get(id)
    if (!edge) return Result.fail(new Error(`Edge ${id} not found`))
    return Result.ok(edge)
  }

  getEdgesFrom(source: string): KgEdge[] {
    return Array.from(this.edges.values()).filter(e => e.source === source)
  }

  getEdgesTo(target: string): KgEdge[] {
    return Array.from(this.edges.values()).filter(e => e.target === target)
  }

  getNeighbors(nodeId: string): KgNode[] {
    const neighborIds = this.adjacency.get(nodeId) ?? []
    return neighborIds.map(id => this.nodes.get(id)).filter(Boolean) as KgNode[]
  }

  nodeCount(): number { return this.nodes.size }
  edgeCount(): number { return this.edges.size }

  bfsPathfinder(startId: string, targetType?: string, maxDepth = 5): Result<{ path: string[]; nodes: KgNode[]; edges: KgEdge[] }> {
    if (!this.nodes.has(startId)) {
      return Result.fail(new Error(`Start node ${startId} not found`))
    }

    const visited = new Set<string>()
    const queue: { id: string; path: string[] }[] = [{ id: startId, path: [startId] }]
    visited.add(startId)

    while (queue.length > 0) {
      const current = queue.shift()!

      if (targetType) {
        const currentNode = this.nodes.get(current.id)
        if (currentNode && currentNode.type === targetType && current.id !== startId) {
          return this.buildPathResult(current.path)
        }
      }

      if (current.path.length > maxDepth) continue

      const neighbors = this.adjacency.get(current.id) ?? []
      for (const neighborId of neighbors) {
        if (!visited.has(neighborId)) {
          visited.add(neighborId)
          queue.push({ id: neighborId, path: [...current.path, neighborId] })
        }
      }
    }

    return Result.fail(new Error(`No path found from ${startId}${targetType ? ` to a ${targetType} node` : ''}`))
  }

  findPathsBetween(startId: string, endId: string, maxDepth = 6): Result<{ paths: { path: string[]; totalWeight: number }[] }> {
    if (!this.nodes.has(startId)) return Result.fail(new Error(`Start node ${startId} not found`))
    if (!this.nodes.has(endId)) return Result.fail(new Error(`End node ${endId} not found`))

    const results: { path: string[]; totalWeight: number }[] = []
    const visited = new Set<string>()

    const dfs = (current: string, path: string[], weight: number) => {
      if (current === endId && path.length > 1) {
        results.push({ path: [...path], totalWeight: weight })
        return
      }
      if (path.length > maxDepth) return

      visited.add(current)
      const neighbors = this.adjacency.get(current) ?? []

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          const connectingEdge = this.findEdge(current, neighbor)
          const edgeWeight = connectingEdge?.weight ?? 1
          dfs(neighbor, [...path, neighbor], weight + edgeWeight)
        }
      }
      visited.delete(current)
    }

    dfs(startId, [startId], 0)
    results.sort((a, b) => a.totalWeight - b.totalWeight)

    return Result.ok({ paths: results })
  }

  pageRank(dampingFactor = 0.85, maxIterations = 20, convergenceThreshold = 0.0001): Map<string, number> {
    const nodeCount = this.nodes.size
    if (nodeCount === 0) return new Map()

    const nodeIds = Array.from(this.nodes.keys())

    const outDegrees = new Float64Array(nodeCount)
    for (let i = 0; i < nodeCount; i++) {
      outDegrees[i] = (this.adjacency.get(nodeIds[i]) ?? []).length
    }

    const incomingList: Array<Array<{ sourceIdx: number; weight: number }>> = []
    for (let i = 0; i < nodeCount; i++) {
      incomingList.push([])
    }
    const nodeIndex = new Map<string, number>()
    for (let i = 0; i < nodeCount; i++) {
      nodeIndex.set(nodeIds[i], i)
    }
    for (const edge of this.edges.values()) {
      const tgtIdx = nodeIndex.get(edge.target)
      if (tgtIdx !== undefined) {
        incomingList[tgtIdx].push({ sourceIdx: nodeIndex.get(edge.source) ?? -1, weight: edge.weight })
      }
    }

    let ranks = new Float64Array(nodeCount)
    const initialRank = 1 / nodeCount
    for (let i = 0; i < nodeCount; i++) {
      ranks[i] = initialRank
    }

    for (let iter = 0; iter < maxIterations; iter++) {
      const newRanks = new Float64Array(nodeCount)
      let totalDiff = 0
      let danglingRank = 0

      for (let i = 0; i < nodeCount; i++) {
        if (outDegrees[i] === 0) {
          danglingRank += dampingFactor * ranks[i] / nodeCount
        }
      }

      for (let i = 0; i < nodeCount; i++) {
        let sum = danglingRank
        const inEdges = incomingList[i]

        for (let e = 0; e < inEdges.length; e++) {
          const edge = inEdges[e]
          const srcOut = outDegrees[edge.sourceIdx]
          if (srcOut > 0) {
            sum += dampingFactor * ranks[edge.sourceIdx] * edge.weight / srcOut
          }
        }

        const rank = (1 - dampingFactor) / nodeCount + sum
        newRanks[i] = rank
        totalDiff += Math.abs(rank - ranks[i])
      }

      ranks = newRanks
      if (totalDiff < convergenceThreshold) break
    }

    const result = new Map<string, number>()
    for (let i = 0; i < nodeCount; i++) {
      result.set(nodeIds[i], ranks[i])
    }
    return result
  }

  private addToAdjacency(source: string, target: string): void {
    if (!this.adjacency.has(source)) this.adjacency.set(source, [])
    if (!this.adjacency.has(target)) this.adjacency.set(target, [])
    this.adjacency.get(source)!.push(target)
  }

  private removeFromAdjacency(source: string, target: string): void {
    const list = this.adjacency.get(source)
    if (list) {
      const idx = list.indexOf(target)
      if (idx >= 0) list.splice(idx, 1)
    }
  }

  private findEdge(source: string, target: string): KgEdge | undefined {
    return Array.from(this.edges.values()).find(e => e.source === source && e.target === target)
  }

  private buildPathResult(path: string[]): Result<{ path: string[]; nodes: KgNode[]; edges: KgEdge[] }> {
    const nodes: KgNode[] = []
    const edges: KgEdge[] = []

    for (const nodeId of path) {
      const node = this.nodes.get(nodeId)
      if (node) nodes.push(node)
    }

    for (let i = 0; i < path.length - 1; i++) {
      const edge = this.findEdge(path[i], path[i + 1])
      if (edge) edges.push(edge)
    }

    return Result.ok({ path, nodes, edges })
  }
}

export class CanaryManager {
  private readonly graph: KnowledgeGraph
  private readonly canaryPrefix = 'canary-'
  private triggeredCanaries: Set<string> = new Set()
  private accessLog: { nodeId: string; timestamp: Date; metadata: string }[] = []

  constructor(graph: KnowledgeGraph) {
    this.graph = graph
  }

  deployCanary(config: {
    id: string
    name: string
    properties?: Record<string, unknown>
  }): Result<KgNode> {
    const canaryId = `${this.canaryPrefix}${config.id}`
    return this.graph.addNode({
      id: canaryId,
      type: 'canary',
      name: config.name,
      properties: {
        ...config.properties,
        __canary: true,
        __bait: 'VIP data - DO NOT ACCESS UNLESS AUTHORIZED',
        __token: this.generateCanaryToken(),
      },
      importance: 0.99,
    })
  }

  deployHoneyEdge(sourceId: string, canaryId: string, label?: string): Result<KgEdge> {
    const fullCanaryId = canaryId.startsWith(this.canaryPrefix) ? canaryId : `${this.canaryPrefix}${canaryId}`
    const edgeId = `honey-${sourceId}-${fullCanaryId}`
    return this.graph.addEdge({
      id: edgeId,
      source: sourceId,
      target: fullCanaryId,
      type: 'canary_access',
      weight: 0.01,
      properties: {
        __honey: true,
        label: label ?? 'confidential_access',
        __alert_on_access: true,
      },
    })
  }

  checkAccess(nodeId: string, metadata: string = ''): { isCanary: boolean; isTriggered: boolean } {
    const nodeResult = this.graph.getNode(nodeId)
    if (nodeResult.isFail) return { isCanary: false, isTriggered: false }

    const node = nodeResult.value
    const isCanary = node.type === 'canary' || node.properties?.__canary === true

    if (isCanary) {
      this.triggeredCanaries.add(nodeId)
      this.accessLog.push({
        nodeId,
        timestamp: new Date(),
        metadata,
      })
    }

    return { isCanary, isTriggered: isCanary }
  }

  checkEdgeAccess(edgeId: string, metadata: string = ''): { isHoneyEdge: boolean; isTriggered: boolean } {
    const edgeResult = this.graph.getEdge(edgeId)
    if (edgeResult.isFail) return { isHoneyEdge: false, isTriggered: false }

    const edge = edgeResult.value
    const isHoney = edge.properties?.__honey === true

    if (isHoney && edge.type === 'canary_access') {
      const canaryId = edge.target
      const canaryResult = this.graph.getNode(canaryId)
      if (canaryResult.isOk) {
        this.triggeredCanaries.add(canaryId)
        this.accessLog.push({
          nodeId: canaryId,
          timestamp: new Date(),
          metadata: `via edge ${edgeId}: ${metadata}`,
        })
      }
    }

    return { isHoneyEdge: isHoney, isTriggered: isHoney }
  }

  hasBeenTriggered(canaryId: string): boolean {
    const fullId = canaryId.startsWith(this.canaryPrefix) ? canaryId : `${this.canaryPrefix}${canaryId}`
    return this.triggeredCanaries.has(fullId)
  }

  getAccessLog(): { nodeId: string; timestamp: Date; metadata: string }[] {
    return [...this.accessLog]
  }

  threatAssessment(): { threatDetected: boolean; triggeredCount: number; details: string[] } {
    const details: string[] = []
    for (const entry of this.accessLog) {
      details.push(`Canary accessed: ${entry.nodeId} at ${entry.timestamp.toISOString()} — ${entry.metadata}`)
    }
    return {
      threatDetected: this.triggeredCanaries.size > 0,
      triggeredCount: this.triggeredCanaries.size,
      details,
    }
  }

  clearAlerts(): void {
    this.triggeredCanaries.clear()
    this.accessLog = []
  }

  private generateCanaryToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let token = ''
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return token
  }
}
